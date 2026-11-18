import { LessonModel } from '../models/lessonModel.js';
import { pool } from '../config/db.js';
import {
  extractYouTubeId,
  fetchYoutubeCaptionsWithYtDlp,
  parseManualTranscript,
  parsePrefetchedVtt,
} from '../services/youtubeService.js';
import {
  generateLessonWithGemini,
  translateTextsToKhmerFast,
} from '../services/geminiService.js';

// Self-healing helper: If an existing lesson has placeholder Khmer text ('ការបកប្រែភាសាខ្មែរ'),
// automatically re-translate and save real Khmer into PostgreSQL.
async function healMissingKhmerTranslations(details) {
  if (!details || !Array.isArray(details.sentences)) return details;

  const placeholderSet = new Set(['ការបកប្រែភាសាខ្មែរ', 'មិនទាន់មានការបកប្រែ', '']);
  const toFix = details.sentences.filter(
    (s) =>
      !s.khmer_text ||
      placeholderSet.has(s.khmer_text.trim()) ||
      s.khmer_text.trim().toLowerCase() === (s.english_text || '').trim().toLowerCase()
  );

  if (toFix.length === 0) return details;

  try {
    const translated = await translateTextsToKhmerFast(toFix.map((s) => s.english_text));
    await Promise.all(
      toFix.map(async (s, idx) => {
        const km = translated[idx];
        if (km && !placeholderSet.has(km.trim())) {
          s.khmer_text = km;
          await pool.query('UPDATE sentences SET khmer_text = $1 WHERE id = $2', [km, s.id]);
        }
      })
    );
  } catch (err) {
    console.warn('Self-heal Khmer translation warning:', err.message);
  }

  return details;
}

export const LessonController = {
  // GET /api/lessons
  async getUserLessons(req, res) {
    try {
      const lessons = await LessonModel.findAllByUserId(req.user.id);
      return res.json({ lessons });
    } catch (err) {
      console.error('Get lessons error:', err);
      return res.status(500).json({ error: 'Failed to fetch lessons.' });
    }
  },

  // GET /api/lessons/:id
  async getLessonDetails(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      if (Number.isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID.' });
      }

      const isAdmin = req.user.role === 'admin';
      const details = await LessonModel.findByIdWithDetails(lessonId, req.user.id, isAdmin);

      if (!details) {
        return res.status(404).json({ error: 'Lesson not found.' });
      }

      const healed = await healMissingKhmerTranslations(details);
      return res.json(healed);
    } catch (err) {
      console.error('Get single lesson error:', err);
      return res.status(500).json({ error: 'Failed to fetch lesson details.' });
    }
  },

  // POST /api/lessons/create
  async createLesson(req, res) {
    const startTime = Date.now();
    const { videoUrl, manualTranscript, prefetchedVtt, prefetchedTitle } = req.body;
    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
      return res.status(400).json({ error: 'Please provide a valid YouTube video URL.' });
    }

    // Instant return (0.02s) if this user already created a lesson for this YouTube video (unless providing manual transcript)
    if (!manualTranscript) {
      try {
        const existing = await LessonModel.findExistingByVideoId(videoId, req.user.id);
        if (existing) {
          console.log(`⚡ Instant cache hit from PostgreSQL for video ${videoId}`);
          const healed = await healMissingKhmerTranslations(existing);
          return res.status(200).json(healed);
        }
      } catch {}
    }

    let extractedSentences;
    try {
      const ytStart = Date.now();
      if (manualTranscript && manualTranscript.trim()) {
        extractedSentences = await parseManualTranscript(manualTranscript, videoId);
        if (!extractedSentences || extractedSentences.length === 0) {
          return res.status(400).json({ error: 'Please paste at least one valid English sentence.' });
        }
      } else if (prefetchedVtt && typeof prefetchedVtt === 'string' && prefetchedVtt.trim()) {
        extractedSentences = await parsePrefetchedVtt(prefetchedVtt, videoId, prefetchedTitle);
      }

      if (!extractedSentences) {
        extractedSentences = await fetchYoutubeCaptionsWithYtDlp(videoUrl, videoId);
      }
      console.log(
        `⚡ Extracted ${extractedSentences.length} sentences (up to 4 min) for ${videoId} in ${(
          (Date.now() - ytStart) /
          1000
        ).toFixed(1)}s`
      );
    } catch (ytError) {
      console.error('yt-dlp subtitle extraction error:', ytError.message);
      return res.status(422).json({
        error: `Could not extract English subtitles via yt-dlp: ${ytError.message}. Ensure the video has English captions.`,
      });
    }

    let aiData;
    try {
      const aiStart = Date.now();
      if (extractedSentences.precomputedAiData) {
        aiData = extractedSentences.precomputedAiData;
        console.log(
          `⚡ Single-shot AI completed all ${extractedSentences.length} sentences + Khmer + vocab + grammar in ${(
            (Date.now() - startTime) /
            1000
          ).toFixed(1)}s`
        );
      } else {
        aiData = await generateLessonWithGemini(extractedSentences, videoId);
        console.log(
          `⚡ Gemini translated ${extractedSentences.length} sentences in ${(
            (Date.now() - aiStart) /
            1000
          ).toFixed(1)}s (total: ${((Date.now() - startTime) / 1000).toFixed(1)}s)`
        );
      }
    } catch (aiError) {
      console.error('Gemini API generation error:', aiError.message);
      return res.status(502).json({
        error: `Failed to generate Khmer translations and grammar with Gemini: ${aiError.message}`,
      });
    }

    try {
      const created = await LessonModel.createLessonWithTransaction({
        userId: req.user.id,
        videoUrl,
        videoId,
        extractedSentences,
        aiData,
      });

      return res.status(201).json(created);
    } catch (dbErr) {
      console.error('Transaction error creating lesson:', dbErr);
      return res.status(500).json({ error: 'Database transaction failed while saving lesson.' });
    }
  },

  // DELETE /api/lessons/:id
  async deleteUserLesson(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      if (Number.isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID.' });
      }

      const deleted = await LessonModel.deleteById(
        lessonId,
        req.user.id,
        req.user.role === 'admin'
      );
      if (!deleted) {
        return res.status(404).json({ error: 'Lesson not found or unauthorized.' });
      }

      return res.json({ deletedId: deleted.id });
    } catch (err) {
      console.error('Delete lesson error:', err);
      return res.status(500).json({ error: 'Failed to delete lesson.' });
    }
  },
};

