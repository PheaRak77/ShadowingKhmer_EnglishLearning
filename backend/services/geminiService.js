import dns from 'dns';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const FAST_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

// Layer 1: Google Translate gtx endpoint (fast when not rate-limited)
async function tryGoogleGtxChunk(chunk) {
  const joined = chunk.join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=km&dt=t&q=${encodeURIComponent(
    joined
  )}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error('GTX status ' + res.status);
  const data = await res.json();
  const fullTranslated = (data[0] || []).map((seg) => seg[0] || '').join('');
  const splitLines = fullTranslated.split('\n').map((s) => s.trim());
  if (splitLines.length < chunk.length) {
    throw new Error('GTX split mismatch');
  }
  return chunk.map((_, idx) => splitLines[idx] || '');
}

// Layer 2: Gemini AI batch translation (natural Khmer, works 100% on Render)
async function tryGeminiBatchTranslate(englishTexts) {
  if (!ai || !englishTexts.length) return null;

  const numbered = englishTexts.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const prompt = `You are a native Cambodian English-Khmer teacher in Phnom Penh.
Translate these ${englishTexts.length} English sentences into natural, everyday spoken Cambodian Khmer (ដូចជនជាតិខ្មែរនិយាយគ្នាប្រចាំថ្ងៃនៅកម្ពុជា ងាយយល់ និងមិនរឹងដូចម៉ាស៊ីនបកប្រែ).
Return a strict JSON object: { "translations": ["...", "..."] } with EXACTLY ${englishTexts.length} items in the exact same order.

${numbered}`;

  for (const modelName of FAST_GEMINI_MODELS) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini translate timeout')), 15000)
        ),
      ]);
      const rawText = typeof response.text === 'function' ? response.text() : response.text;
      const parsed = JSON.parse(rawText);
      const arr = Array.isArray(parsed) ? parsed : parsed.translations;
      if (Array.isArray(arr) && arr.length >= englishTexts.length) {
        return englishTexts.map((_, idx) => String(arr[idx] || '').trim());
      }
    } catch {
      continue;
    }
  }
  return null;
}

// Layer 3: MyMemory Free Translation API (never blocked on cloud servers)
async function tryMyMemorySingle(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=en|km`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && !translated.toUpperCase().includes('MYMEMORY WARNING')) {
      return translated.trim();
    }
  } catch {}
  return null;
}

// Reliable 3-Layer English -> Khmer translation
export async function translateTextsToKhmerFast(englishTexts) {
  if (!englishTexts || englishTexts.length === 0) return [];

  // Layer 1: Try Google GTX in chunks of 12
  const chunkSize = 12;
  const chunks = [];
  for (let i = 0; i < englishTexts.length; i += chunkSize) {
    chunks.push(englishTexts.slice(i, i + chunkSize));
  }

  let gtxSuccess = true;
  const gtxResults = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        return await tryGoogleGtxChunk(chunk);
      } catch {
        gtxSuccess = false;
        return chunk.map(() => '');
      }
    })
  );

  const merged = gtxResults.flat();
  if (gtxSuccess && merged.every((t) => t && t.length > 0)) {
    return merged;
  }

  // Layer 2: Use Gemini AI for any missing translations (or all if GTX was blocked on Render)
  const missingIndices = [];
  const missingTexts = [];
  merged.forEach((val, idx) => {
    if (!val) {
      missingIndices.push(idx);
      missingTexts.push(englishTexts[idx]);
    }
  });

  if (missingTexts.length > 0) {
    const geminiTranslations = await tryGeminiBatchTranslate(missingTexts);
    if (geminiTranslations) {
      missingIndices.forEach((origIdx, mIdx) => {
        if (geminiTranslations[mIdx]) {
          merged[origIdx] = geminiTranslations[mIdx];
        }
      });
    }
  }

  // Layer 3: MyMemory fallback for any still-missing sentences
  const stillMissing = [];
  merged.forEach((val, idx) => {
    if (!val) stillMissing.push(idx);
  });

  if (stillMissing.length > 0) {
    // Run in small parallel batches of 6
    for (let i = 0; i < stillMissing.length; i += 6) {
      const batch = stillMissing.slice(i, i + 6);
      await Promise.all(
        batch.map(async (idx) => {
          const km = await tryMyMemorySingle(englishTexts[idx]);
          merged[idx] = km || englishTexts[idx];
        })
      );
    }
  }

  return merged;
}

// Fast fallback vocabulary & grammar generator from the video's actual transcript sentences
async function buildInstantVocabAndGrammar(sentences, videoTitle, videoId) {
  const stopWords = new Set([
    'the', 'and', 'that', 'this', 'with', 'from', 'your', 'have', 'more', 'will',
    'what', 'when', 'where', 'which', 'their', 'there', 'been', 'were', 'they',
    'them', 'then', 'than', 'into', 'some', 'such', 'only', 'other', 'about',
    'would', 'could', 'should', 'because', 'very', 'just', 'like', 'make', 'made',
    'know', 'time', 'people', 'year', 'years', 'good', 'well', 'also', 'back',
    'after', 'use', 'two', 'how', 'our', 'work', 'first', 'even', 'new', 'want',
    'these', 'give', 'most', 'does', 'did', 'dont', 'cant', 'youre', 'its',
  ]);

  const candidates = [];
  const seenWords = new Set();

  for (const s of sentences) {
    const words = s.english_text.split(/\s+/);
    for (const raw of words) {
      const clean = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (clean.length >= 5 && !stopWords.has(clean) && !seenWords.has(clean)) {
        seenWords.add(clean);
        candidates.push({
          word: clean,
          example: s.english_text,
        });
        if (candidates.length >= 8) break;
      }
    }
    if (candidates.length >= 8) break;
  }

  const wordTranslations = await translateTextsToKhmerFast(candidates.map((c) => c.word));

  const vocabulary = candidates.map((c, idx) => {
    let pos = 'word';
    if (c.word.endsWith('ly')) pos = 'adverb';
    else if (c.word.endsWith('tion') || c.word.endsWith('ment') || c.word.endsWith('ness'))
      pos = 'noun';
    else if (c.word.endsWith('ing') || c.word.endsWith('ed')) pos = 'verb';
    else if (c.word.endsWith('ful') || c.word.endsWith('ous') || c.word.endsWith('ive'))
      pos = 'adjective';

    return {
      word: c.word,
      ipa: `/${c.word}/`,
      pos,
      khmer: wordTranslations[idx] || 'ពាក្យគន្លឹះ',
      example: c.example,
    };
  });

  const sample1 = sentences[0]?.english_text || 'This is an English shadowing lesson.';
  const sample2 = sentences[Math.min(1, sentences.length - 1)]?.english_text || sample1;
  const sample3 = sentences[Math.min(2, sentences.length - 1)]?.english_text || sample1;
  const sampleKhmer = await translateTextsToKhmerFast([sample1, sample2, sample3]);

  const grammar = [
    {
      stage: 'Stage 1: Sentence Structure & Tenses',
      title: 'Present & Narrative Verb Forms in Spoken English',
      explanation_en:
        'Speakers use present simple for general truths and past simple to narrate events in stories and talks.',
      explanation_km:
        'អ្នកនិយាយប្រើប្រាស់បច្ចុប្បន្នកាលធម្មតាសម្រាប់ការពិតទូទៅ និងអតីតកាលធម្មតាដើម្បីនិទានរឿង ឬព្រឹត្តិការណ៍នានា។',
      example_en: sample1,
      example_km: sampleKhmer[0] || '',
    },
    {
      stage: 'Stage 2: Connecting Ideas',
      title: 'Linking Clauses & Descriptive Phrases',
      explanation_en:
        'Conjunctions (and, but, because, when) and prepositional phrases connect actions smoothly in natural speech.',
      explanation_km:
        'ឈ្នាប់ (and, but, because, when) និងឃ្លាធ្នាក់ជួយភ្ជាប់សកម្មភាព និងគំនិតឱ្យរលូននៅក្នុងការនិយាយធម្មជាតិ។',
      example_en: sample2,
      example_km: sampleKhmer[1] || '',
    },
    {
      stage: 'Stage 3: Natural Intonation & Shadowing',
      title: 'Stressing Content Words in Spoken Sentences',
      explanation_en:
        'In English shadowing, stress main nouns, verbs, and adjectives while keeping function words short and linked.',
      explanation_km:
        'ក្នុងការហាត់និយាយតាម (Shadowing) ត្រូវសង្កត់សំឡេងលើពាក្យសំខាន់ៗ (នាម កិរិយាសព្ទ គុណនាម) ហើយភ្ជាប់ពាក្យជំនួយឱ្យរលូន។',
      example_en: sample3,
      example_km: sampleKhmer[2] || '',
    },
  ];

  return {
    title: videoTitle || `English Video Lesson (${videoId})`,
    vocabulary,
    grammar,
  };
}

// Try Gemini for vocabulary & grammar metadata
async function tryFastGeminiMetadata(sentences, videoTitle, videoId) {
  if (!ai) return null;

  const sampleText = sentences
    .slice(0, 20)
    .map((s) => s.english_text)
    .join(' ');

  const prompt = `You are a native Cambodian English-Khmer teacher in Phnom Penh.
Based on this English video transcript (Title: "${
    videoTitle || videoId
  }"): "${sampleText}"
Return strict JSON with 6 vocabulary words and 3 grammar rules. Use natural, everyday Cambodian Khmer (ងាយយល់ ដូចគ្រូខ្មែរពន្យល់សិស្សនៅកម្ពុជា):
{
  "title": "${(videoTitle || '').replace(/"/g, "'") || 'English Video Lesson'}",
  "vocabulary": [
    {"word": "word", "ipa": "/ipa/", "pos": "noun/verb", "khmer": "Natural everyday Cambodian Khmer definition", "example": "Example sentence"}
  ],
  "grammar": [
    {"stage": "Stage 1: The basics", "title": "Rule title", "explanation_en": "English rule", "explanation_km": "Natural Cambodian Khmer explanation like a real teacher in Cambodia", "example_en": "English example", "example_km": "Natural Cambodian Khmer translation"}
  ]
}`;

  for (const modelName of FAST_GEMINI_MODELS) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini metadata timeout')), 9000)
        ),
      ]);
      const rawText = typeof response.text === 'function' ? response.text() : response.text;
      return JSON.parse(rawText);
    } catch {
      continue;
    }
  }
  return null;
}

export async function generateLessonWithGemini(sentences, videoId) {
  const videoTitle = sentences.videoTitle || '';

  const [khmerTranslations, geminiMeta] = await Promise.all([
    translateTextsToKhmerFast(sentences.map((s) => s.english_text)),
    tryFastGeminiMetadata(sentences, videoTitle, videoId),
  ]);

  if (geminiMeta && Array.isArray(geminiMeta.vocabulary) && geminiMeta.vocabulary.length > 0) {
    return {
      title: videoTitle || geminiMeta.title || `English Lesson (${videoId})`,
      translations: khmerTranslations,
      vocabulary: geminiMeta.vocabulary,
      grammar: geminiMeta.grammar || [],
    };
  }

  const fallbackMeta = await buildInstantVocabAndGrammar(sentences, videoTitle, videoId);
  return {
    title: fallbackMeta.title,
    translations: khmerTranslations,
    vocabulary: fallbackMeta.vocabulary,
    grammar: fallbackMeta.grammar,
  };
}

export async function enrichWordWithGemini(cleanedWord, contextSentence) {
  try {
    const khmerArr = await translateTextsToKhmerFast([cleanedWord]);
    return {
      ipa: `/${cleanedWord}/`,
      part_of_speech: 'word',
      khmer_meaning: khmerArr[0] || 'ពាក្យវាក្យសព្ទ',
      example_sentence: contextSentence || '',
    };
  } catch {
    return null;
  }
}
