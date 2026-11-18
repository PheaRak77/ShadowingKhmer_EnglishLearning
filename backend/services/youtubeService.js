import dns from 'dns';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const execFileAsync = promisify(execFile);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Maximum supported video duration: 4 minutes (240 seconds)
export const MAX_VIDEO_DURATION_SECONDS = 240;

function safeParseJson(rawText) {
  const cleaned = String(rawText || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const startObj = cleaned.indexOf('{');
    const endObj = cleaned.lastIndexOf('}');
    if (startObj !== -1 && endObj > startObj) {
      return JSON.parse(cleaned.slice(startObj, endObj + 1));
    }
    const startArr = cleaned.indexOf('[');
    const endArr = cleaned.lastIndexOf(']');
    if (startArr !== -1 && endArr > startArr) {
      return JSON.parse(cleaned.slice(startArr, endArr + 1));
    }
    throw new Error('AI returned malformed JSON.');
  }
}

export async function parseManualTranscript(rawText, videoId) {
  const trimmed = String(rawText || '').trim();
  const videoTitle = await fetchVideoTitleOembed(videoId);

  // If user pasted VTT/SRT timestamps, use our VTT parser
  if (trimmed.includes('-->')) {
    const parsed = parseVttAndMergeSentences(trimmed);
    if (parsed.length > 0) {
      parsed.videoTitle = videoTitle;
      return parsed;
    }
  }

  // Otherwise split plain English transcript into clean sentences with evenly paced timestamps
  const rawSentences = trimmed
    .replace(/\r\n/g, ' ')
    .replace(/\n+/g, ' ')
    .match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g) || [];

  const sentences = rawSentences
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((text, idx) => {
      const start = Number((idx * 4.5).toFixed(2));
      const end = Number(((idx + 1) * 4.5).toFixed(2));
      const formatted = text.charAt(0).toUpperCase() + text.slice(1);
      return {
        start_time: start,
        end_time: end,
        english_text: /[.?!]["']?$/.test(formatted) ? formatted : `${formatted}.`,
      };
    });

  sentences.videoTitle = videoTitle;
  return sentences;
}

export function extractYouTubeId(url) {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.trim().match(regex);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

function parseTimestampToSeconds(timestampStr) {
  if (typeof timestampStr === 'number') return Number(timestampStr.toFixed(2));
  const str = String(timestampStr || '0').trim();
  if (/^\d+(\.\d+)?$/.test(str)) return Number(parseFloat(str).toFixed(2));

  const parts = str.split(':');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseFloat(parts[0]) || 0;
    minutes = parseFloat(parts[1]) || 0;
    seconds = parseFloat(parts[2].replace(',', '.')) || 0;
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]) || 0;
    seconds = parseFloat(parts[1].replace(',', '.')) || 0;
  }
  return Number((hours * 3600 + minutes * 60 + seconds).toFixed(2));
}

export function parseVttAndMergeSentences(vttContent) {
  const lines = vttContent.replace(/\r\n/g, '\n').split('\n');
  const rawCues = [];
  const timeRegex =
    /((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(timeRegex);
    if (match) {
      const start = parseTimestampToSeconds(match[1]);
      const end = parseTimestampToSeconds(match[2]);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
        const cleanedLine = lines[i]
          .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
          .replace(/<\/?c[^>]*>/g, '')
          .replace(/<\/?[^>]+(>|$)/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\[.*?\]/g, '')
          .trim();
        if (cleanedLine) {
          textLines.push(cleanedLine);
        }
        i++;
      }

      if (textLines.length > 0 && end > start && start <= MAX_VIDEO_DURATION_SECONDS) {
        const combinedCueText = textLines.join(' ').replace(/\s+/g, ' ').trim();
        if (combinedCueText) {
          rawCues.push({
            start,
            end: Math.min(end, MAX_VIDEO_DURATION_SECONDS + 5),
            text: combinedCueText,
          });
        }
      }
    } else {
      i++;
    }
  }

  // Deduplicate rolling YouTube auto-generated captions
  const deduplicatedCues = [];
  for (const cue of rawCues) {
    if (deduplicatedCues.length === 0) {
      deduplicatedCues.push({ ...cue });
      continue;
    }
    const prev = deduplicatedCues[deduplicatedCues.length - 1];
    if (cue.text === prev.text) {
      prev.end = Math.max(prev.end, cue.end);
    } else if (cue.text.startsWith(prev.text) && cue.start - prev.start < 4) {
      prev.text = cue.text;
      prev.end = Math.max(prev.end, cue.end);
    } else if (prev.text.endsWith(cue.text)) {
      prev.end = Math.max(prev.end, cue.end);
    } else {
      deduplicatedCues.push({ ...cue });
    }
  }

  // Merge cues and split cleanly on sentence boundaries (., ?, !) or natural 14-word / pause breaks
  const mergedSentences = [];
  let bufferText = '';
  let bufferStart = null;
  let bufferEnd = null;
  let prevCueEnd = null;

  const flushBufferSegment = (text, startTime, endTime) => {
    let formatted = text.replace(/\s+/g, ' ').trim();
    if (!formatted) return;
    if (!/[.?!]["']?$/.test(formatted)) {
      formatted += '.';
    }
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    mergedSentences.push({
      start_time: Number(startTime.toFixed(2)),
      end_time: Number(Math.max(startTime + 0.8, endTime).toFixed(2)),
      english_text: formatted,
    });
  };

  for (const cue of deduplicatedCues) {
    // Split on noticeable speech pauses when unpunctuated buffer already has enough words
    if (
      bufferText &&
      prevCueEnd !== null &&
      cue.start - prevCueEnd >= 1.2 &&
      bufferText.trim().split(/\s+/).filter(Boolean).length >= 5
    ) {
      flushBufferSegment(bufferText, bufferStart ?? prevCueEnd, bufferEnd ?? prevCueEnd);
      bufferText = '';
      bufferStart = null;
      bufferEnd = null;
    }
    prevCueEnd = cue.end;

    if (bufferStart === null) {
      bufferStart = cue.start;
    }
    bufferEnd = cue.end;

    let textToAppend = cue.text;
    if (bufferText) {
      const currentWords = bufferText.split(' ');
      const cueWords = textToAppend.split(' ');
      const maxOverlap = Math.min(currentWords.length, cueWords.length, 20);
      for (let overlap = maxOverlap; overlap >= 1; overlap--) {
        const suffix = currentWords.slice(-overlap).join(' ').toLowerCase();
        const prefix = cueWords.slice(0, overlap).join(' ').toLowerCase();
        if (suffix === prefix) {
          textToAppend = cueWords.slice(overlap).join(' ');
          break;
        }
      }
    }

    if (textToAppend) {
      bufferText = bufferText ? `${bufferText} ${textToAppend}` : textToAppend;
    }

    const parts = bufferText.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g) || [bufferText];
    const bufferWords = bufferText.trim().split(/\s+/).filter(Boolean).length;

    if (parts.length > 1 || /[.?!]["']?$/.test(bufferText.trim()) || bufferWords >= 14) {
      const totalChars = Math.max(1, bufferText.length);
      const totalDuration = Math.max(0.5, bufferEnd - bufferStart);
      let runningStart = bufferStart;
      let leftover = '';

      for (let pIdx = 0; pIdx < parts.length; pIdx++) {
        const part = parts[pIdx].trim();
        if (!part) continue;

        const isComplete = /[.?!]["']?$/.test(part);
        const wordCount = part.split(/\s+/).filter(Boolean).length;

        if (isComplete || wordCount >= 14) {
          const share = part.length / totalChars;
          const segEnd = Number(
            Math.min(bufferEnd, runningStart + Math.max(0.8, totalDuration * share)).toFixed(2)
          );
          flushBufferSegment(part, runningStart, segEnd);
          runningStart = segEnd;
        } else {
          leftover = part;
        }
      }

      if (leftover) {
        bufferText = leftover;
        bufferStart = runningStart;
      } else {
        bufferText = '';
        bufferStart = null;
        bufferEnd = null;
      }
    }
  }

  if (bufferText.trim()) {
    flushBufferSegment(bufferText, bufferStart ?? 0, bufferEnd ?? (bufferStart ?? 0) + 3);
  }

  return mergedSentences.filter((s) => s.start_time <= MAX_VIDEO_DURATION_SECONDS).slice(0, 100);
}

// Fetch video title via YouTube oEmbed (noembed.com) - never blocked on cloud servers
async function fetchVideoTitleOembed(videoId) {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return (data.title || '').trim();
  } catch {
    return '';
  }
}

// Tier 1 (Fastest ~0.3s, works on Cloud & Local): Direct YouTube InnerTube IOS API caption extraction
async function fetchCaptionsViaInnerTubeIOS(videoId) {
  const iosUserAgent =
    'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)';
  const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': iosUserAgent,
    },
    body: JSON.stringify({
      videoId,
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: '20.10.4',
          deviceMake: 'Apple',
          deviceModel: 'iPhone16,2',
          hl: 'en',
          gl: 'US',
        },
      },
    }),
    signal: AbortSignal.timeout(6000),
  });

  if (!playerRes.ok) {
    throw new Error(`InnerTube status ${playerRes.status}`);
  }
  const playerData = await playerRes.json();
  const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (tracks.length === 0) {
    throw new Error('No English captions returned by InnerTube');
  }

  // Prefer human English captions first, then auto-generated ('asr'), then any en*
  const englishTrack =
    tracks.find((t) => /^en(-|$)/i.test(t.languageCode) && t.kind !== 'asr') ||
    tracks.find((t) => /^en(-|$)/i.test(t.languageCode)) ||
    tracks.find((t) => (t.languageCode || '').toLowerCase().startsWith('en'));

  if (!englishTrack?.baseUrl) {
    throw new Error('Video has no English caption track');
  }

  const vttUrl = englishTrack.baseUrl.includes('fmt=')
    ? englishTrack.baseUrl
    : `${englishTrack.baseUrl}&fmt=vtt`;

  const vttRes = await fetch(vttUrl, {
    headers: { 'User-Agent': iosUserAgent },
    signal: AbortSignal.timeout(6000),
  });
  if (!vttRes.ok) {
    throw new Error(`Caption download failed (${vttRes.status})`);
  }
  const vttContent = await vttRes.text();
  if (!vttContent || !vttContent.trim()) {
    throw new Error('Empty caption track returned');
  }

  const sentences = parseVttAndMergeSentences(vttContent);
  if (!sentences || sentences.length === 0) {
    throw new Error('Parsed 0 spoken sentences from VTT');
  }

  sentences.videoTitle =
    (playerData?.videoDetails?.title || '').trim() || (await fetchVideoTitleOembed(videoId));
  return sentences;
}

// Cloud Fallback Extraction via Gemini native YouTube ingestion (used only when no VTT captions exist)
async function extractTranscriptViaGeminiCloud(videoId) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is required for cloud YouTube caption extraction.');
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const titlePromise = fetchVideoTitleOembed(videoId);

  const prompt = `You are a native Cambodian English-Khmer teacher in Phnom Penh.
Extract spoken English sentences (up to 240s) from this YouTube video.
Translate and explain everything in natural, everyday Cambodian Khmer (ដូចជនជាតិខ្មែរនិយាយ និងពន្យល់គ្នាប្រចាំថ្ងៃនៅកម្ពុជា — ងាយយល់ សាមញ្ញ មិនរឹងដូចម៉ាស៊ីនបកប្រែ).
Return strict JSON:
{
  "sentences": [{"start_time": 0.0, "end_time": 3.5, "english_text": "...", "khmer_text": "Natural everyday Cambodian Khmer translation"}],
  "vocabulary": [{"word": "...", "ipa": "/.../", "pos": "noun", "khmer": "Clear natural Cambodian Khmer definition (អត្ថន័យខ្មែរងាយយល់)", "example": "..."}],
  "grammar": [{"stage": "Stage 1: The basics", "title": "...", "explanation_en": "...", "explanation_km": "Friendly, natural Cambodian Khmer explanation like a real teacher in Cambodia", "example_en": "...", "example_km": "Natural Cambodian Khmer translation"}]
}
Include 6 key vocabulary words and 3 grammar rules.`;

  const callSingleModel = async (modelName) => {
    const config = { responseMimeType: 'application/json' };
    if (!modelName.includes('lite')) {
      config.thinkingConfig = { thinkingBudget: 0 };
    }

    const res = await Promise.race([
      ai.models.generateContent({
        model: modelName,
        contents: [
          { fileData: { fileUri: canonicalUrl } },
          { text: prompt },
        ],
        config,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${modelName} timeout`)), 20000)
      ),
    ]);

    const rawText = typeof res.text === 'function' ? res.text() : res.text;
    const parsed = safeParseJson(rawText);
    const list = Array.isArray(parsed) ? parsed : parsed.sentences || [];

    const normalized = list
      .map((item, idx) => {
        const start = parseTimestampToSeconds(item.start_time ?? idx * 4);
        const end = Math.max(
          start + 1.5,
          parseTimestampToSeconds(item.end_time ?? start + 4)
        );
        const text = String(item.english_text || item.text || '').trim();
        const khmer = String(item.khmer_text || '').trim();
        return { start_time: start, end_time: end, english_text: text, khmer_text: khmer };
      })
      .filter((s) => s.english_text && s.start_time <= MAX_VIDEO_DURATION_SECONDS)
      .slice(0, 100);

    if (normalized.length === 0) {
      throw new Error(`${modelName} returned 0 sentences`);
    }
    return { parsed, normalized, modelName };
  };

  // Try confirmed flash models with a total 42s cloud budget so HTTP requests never hang
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
  ];

  const cloudDeadline = Date.now() + 42000;
  let winner = null;
  let lastErr = null;
  for (const modelName of modelsToTry) {
    if (Date.now() > cloudDeadline) break;
    try {
      winner = await callSingleModel(modelName);
      if (winner) break;
    } catch (err) {
      lastErr = err;
      console.warn(`Gemini extraction (${modelName}) warning:`, err.message?.slice(0, 140));
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (!winner) {
    throw new Error(
      `This video has no direct captions and Google Gemini is currently busy (${
        lastErr?.status || lastErr?.message?.slice(0, 60) || '503'
      }). Please try a video with English captions (CC) or paste the English text below.`
    );
  }

  const videoTitle = await titlePromise;
  const { parsed, normalized, modelName } = winner;
  console.log(`⚡ Fastest AI winner: ${modelName} (${normalized.length} sentences)`);

  normalized.videoTitle = videoTitle;
  const hasKhmer = normalized.every((s) => s.khmer_text && s.khmer_text.length > 0);
  if (hasKhmer && !Array.isArray(parsed)) {
    normalized.precomputedAiData = {
      title: videoTitle || parsed.title || `English Lesson (${videoId})`,
      translations: normalized.map((s) => s.khmer_text),
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
      grammar: Array.isArray(parsed.grammar) ? parsed.grammar : [],
    };
  }
  return normalized;
}

export async function fetchYoutubeCaptionsWithYtDlp(videoUrl, videoId) {
  // Tier 1 (0.3s on Cloud & Local): Fast direct YouTube InnerTube IOS API
  try {
    const fastStart = Date.now();
    const fastSentences = await fetchCaptionsViaInnerTubeIOS(videoId);
    console.log(
      `⚡ InnerTube IOS extracted ${fastSentences.length} sentences for ${videoId} in ${
        Date.now() - fastStart
      }ms`
    );
    return fastSentences;
  } catch (innerTubeErr) {
    console.warn(`InnerTube IOS skipped for ${videoId}:`, innerTubeErr.message);
  }

  // On Render cloud servers, yt-dlp hits YouTube bot checks; jump straight to Gemini video fallback
  if (process.env.RENDER === 'true') {
    console.log(`☁️ Render fallback: using Gemini native YouTube extraction for ${videoId}...`);
    return await extractTranscriptViaGeminiCloud(videoId);
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `ytdlp-${videoId}-`));
  const outputTemplate = path.join(tempDir, '%(id)s.%(ext)s');
  const titleFile = path.join(tempDir, 'title.txt');
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Attempt 1: Fast yt-dlp with android client (wrapped in try/catch so cloud bot-blocks don't crash)
    try {
      await execFileAsync(
        'yt-dlp',
        [
          '-4',
          '--js-runtimes',
          'node',
          '--extractor-args',
          'youtube:player_client=android;player_skip=webpage,configs',
          '--print-to-file',
          '%(title)s',
          titleFile,
          '--write-auto-sub',
          '--write-sub',
          '--sub-lang',
          'en',
          '--skip-download',
          '--sub-format',
          'vtt',
          '--no-playlist',
          '--no-warnings',
          '-o',
          outputTemplate,
          canonicalUrl,
        ],
        { timeout: 12000 }
      );
    } catch (err1) {
      console.warn('yt-dlp attempt 1 (android) skipped:', err1.message?.slice(0, 120));
    }

    let files = await fs.readdir(tempDir);
    let vttFile = files.find((f) => f.endsWith('.vtt'));

    // Attempt 2: yt-dlp with mweb/tv_embedded clients if Attempt 1 produced no VTT
    if (!vttFile) {
      try {
        await execFileAsync(
          'yt-dlp',
          [
            '-4',
            '--js-runtimes',
            'node',
            '--extractor-args',
            'youtube:player_client=mweb,tv_embedded,web',
            '--print-to-file',
            '%(title)s',
            titleFile,
            '--write-auto-sub',
            '--write-sub',
            '--sub-lang',
            'en,en-US,en-GB',
            '--skip-download',
            '--sub-format',
            'vtt',
            '--no-playlist',
            '--no-warnings',
            '-o',
            outputTemplate,
            canonicalUrl,
          ],
          { timeout: 12000 }
        );
        files = await fs.readdir(tempDir);
        vttFile = files.find((f) => f.endsWith('.vtt'));
      } catch (err2) {
        console.warn('yt-dlp attempt 2 (mweb/tv) skipped:', err2.message?.slice(0, 120));
      }
    }

    // If yt-dlp succeeded, parse the VTT file
    if (vttFile) {
      let videoTitle = '';
      try {
        videoTitle = (await fs.readFile(titleFile, 'utf-8')).trim();
      } catch {}
      if (!videoTitle) {
        videoTitle = await fetchVideoTitleOembed(videoId);
      }

      const vttContent = await fs.readFile(path.join(tempDir, vttFile), 'utf-8');
      const sentences = parseVttAndMergeSentences(vttContent);
      if (sentences && sentences.length > 0) {
        sentences.videoTitle = videoTitle;
        return sentences;
      }
    }

    // Attempt 3: Guaranteed Cloud Fallback via Gemini Native YouTube Video Ingestion
    console.log(`☁️ Using Gemini native YouTube extraction for ${videoId} (cloud IP fallback)...`);
    return await extractTranscriptViaGeminiCloud(videoId);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
