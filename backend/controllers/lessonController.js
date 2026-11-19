import { LessonModel } from '../models/lessonModel.js';
import { LimitModel } from '../models/limitModel.js';
import { pool } from '../config/db.js';
import {
  getCached,
  setCached,
  invalidateAllLessonCaches,
} from '../utils/responseCache.js';
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

function formatQuotaErrorMessage(quota) {
  let waitHint = '';
  if (quota?.nextResetAt) {
    const diffMs = Math.max(60000, new Date(quota.nextResetAt).getTime() - Date.now());
    const totalHours = Math.floor(diffMs / 3600000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const mins = Math.ceil((diffMs % 3600000) / 60000);
    waitHint =
      days > 0
        ? ` Next link available in ${days}d ${hours}h.`
        : totalHours > 0
        ? ` Next link available in ${totalHours}h ${mins}m.`
        : ` Next link available in ${mins}m.`;
  }
  return `Student limit reached (${quota.maxLessons} video link${
    quota.maxLessons === 1 ? '' : 's'
  } every ${quota.windowDays} day${quota.windowDays === 1 ? '' : 's'}).${waitHint} Ask your Admin to adjust or reset your limit.`;
}

export const LessonController = {
  // GET /api/lessons
  async getUserLessons(req, res) {
    try {
      const [lessons, quota] = await Promise.all([
        LessonModel.findAllByUserId(req.user.id),
        LimitModel.getUserQuotaStatus(req.user.id, req.user.role),
      ]);
      return res.json({ lessons, quota });
    } catch (err) {
      console.error('Get lessons error:', err);
      return res.status(500).json({ error: 'Failed to fetch lessons.' });
    }
  },

  // GET /api/lessons/library (Public — first page for new users, guests, and students)
  async getPublicLibrary(req, res) {
    try {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      const cached = getCached('public_library');
      if (cached) {
        return res.json({ lessons: cached });
      }
      const lessons = await LessonModel.findPublicLibraryLessons();
      setCached('public_library', lessons, 60_000);
      return res.json({ lessons });
    } catch (err) {
      console.error('Get public library error:', err);
      return res.status(500).json({ error: 'Failed to load All Lessons library.' });
    }
  },

  // GET /api/lessons/public/:id (Public — allows new users / guests to open Admin-published lessons)
  async getPublicLessonDetails(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      if (Number.isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID.' });
      }

      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      const cacheKey = `lesson_public:${lessonId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        // Non-blocking view increment
        LessonModel.incrementViewCount(lessonId).catch(() => {});
        return res.json(cached);
      }

      const details = await LessonModel.findByIdWithDetails(lessonId, null, false, true);
      if (!details) {
        return res.status(404).json({ error: 'Public lesson not found.' });
      }

      // Non-blocking view increment so opening a lesson returns immediately
      LessonModel.incrementViewCount(lessonId).catch(() => {});
      const healed = await healMissingKhmerTranslations(details);
      setCached(cacheKey, healed, 300_000);
      return res.json(healed);
    } catch (err) {
      console.error('Get public lesson details error:', err);
      return res.status(500).json({ error: 'Failed to load public lesson.' });
    }
  },

  // GET /api/lessons/history (Authenticated — student's studied lessons/stories)
  async getStudyHistory(req, res) {
    try {
      const history = await LessonModel.getUserStudyHistory(req.user.id);
      return res.json({ history });
    } catch (err) {
      console.error('Get study history error:', err);
      return res.status(500).json({ error: 'Failed to load study history.' });
    }
  },

  // POST /api/lessons/:id/study (Authenticated — records or updates student's studied progress)
  async recordStudyProgress(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      if (Number.isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID.' });
      }

      const isAdmin = req.user.role === 'admin';
      const details = await LessonModel.findByIdWithDetails(lessonId, req.user.id, isAdmin, true);
      if (!details) {
        return res.status(404).json({ error: 'Lesson not found.' });
      }

      const practicedSentences = parseInt(req.body?.practicedSentences, 10) || 0;
      const totalSentences =
        parseInt(req.body?.totalSentences, 10) || details.sentences?.length || 0;

      const record = await LessonModel.upsertStudyHistory(
        req.user.id,
        lessonId,
        practicedSentences,
        totalSentences
      );
      return res.json({ record });
    } catch (err) {
      console.error('Record study progress error:', err);
      return res.status(500).json({ error: 'Failed to save study progress.' });
    }
  },

  // GET /api/lessons/:id
  async getLessonDetails(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      if (Number.isNaN(lessonId)) {
        return res.status(400).json({ error: 'Invalid lesson ID.' });
      }

      // Fast path: if this is an Admin-published public lesson already cached in memory, return instantly!
      const cacheKey = `lesson_public:${lessonId}`;
      const cachedPublic = getCached(cacheKey);
      if (cachedPublic) {
        LessonModel.incrementViewCount(lessonId).catch(() => {});
        LessonModel.upsertStudyHistory(
          req.user.id,
          lessonId,
          0,
          cachedPublic.sentences?.length || 0
        ).catch(() => {});
        return res.json(cachedPublic);
      }

      const isAdmin = req.user.role === 'admin';
      const details = await LessonModel.findByIdWithDetails(lessonId, req.user.id, isAdmin, true);

      if (!details) {
        return res.status(404).json({ error: 'Lesson not found.' });
      }

      // Non-blocking analytics/history updates so lesson loads faster
      if (details.lesson.is_public) {
        LessonModel.incrementViewCount(lessonId).catch(() => {});
        LessonModel.upsertStudyHistory(
          req.user.id,
          lessonId,
          0,
          details.sentences?.length || 0
        ).catch(() => {});
      }

      const healed = await healMissingKhmerTranslations(details);
      if (healed.lesson?.is_public) {
        setCached(cacheKey, healed, 300_000);
      }
      return res.json(healed);
    } catch (err) {
      console.error('Get single lesson error:', err);
      return res.status(500).json({ error: 'Failed to fetch lesson details.' });
    }
  },

  // POST /api/lessons/create
  async createLesson(req, res) {
    const startTime = Date.now();
    const {
      videoUrl,
      manualTranscript,
      prefetchedVtt,
      prefetchedTitle,
      isPublic,
      cefrLevel,
      tags,
    } = req.body;
    const isAdminUser = req.user.role === 'admin';
    const shouldPublish = isAdminUser && Boolean(isPublic);
    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
      return res.status(400).json({ error: 'Please provide a valid YouTube video URL.' });
    }

    // Instant return (0.02s) if this user already created a lesson for this YouTube video (does not consume quota)
    if (!manualTranscript) {
      try {
        const existing = await LessonModel.findExistingByVideoId(videoId, req.user.id);
        if (existing) {
          if (isAdminUser && (typeof isPublic === 'boolean' || cefrLevel || tags)) {
            const updatedMeta = await LessonModel.updateLessonLibraryMeta(existing.lesson.id, {
              isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
              cefrLevel,
              tags,
            });
            if (updatedMeta) {
              existing.lesson = { ...existing.lesson, ...updatedMeta };
            }
          }
          console.log(`⚡ Instant cache hit from PostgreSQL for video ${videoId}`);
          const [healed, quota] = await Promise.all([
            healMissingKhmerTranslations(existing),
            LimitModel.getUserQuotaStatus(req.user.id, req.user.role),
          ]);
          return res.status(200).json({ ...healed, quota });
        }
      } catch {}
    }

    // Enforce Student YouTube URL creation quota before invoking external APIs
    try {
      const quota = await LimitModel.getUserQuotaStatus(req.user.id, req.user.role);
      if (!quota.isUnlimited && quota.remaining <= 0) {
        return res.status(429).json({
          error: formatQuotaErrorMessage(quota),
          quota,
        });
      }
    } catch (quotaErr) {
      console.warn('Quota check warning:', quotaErr.message);
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
        isPublic: shouldPublish,
        cefrLevel: isAdminUser && cefrLevel ? cefrLevel : 'A2',
        tags: isAdminUser && tags ? tags : 'Daily Conversation',
      });

      if (created.lesson.is_public) {
        invalidateAllLessonCaches(created.lesson.id);
        LessonModel.upsertStudyHistory(
          req.user.id,
          created.lesson.id,
          0,
          created.sentences?.length || 0
        ).catch(() => {});
      }

      if (req.user.role !== 'admin') {
        await LimitModel.recordUsage(req.user.id, videoId).catch(() => {});
      }
      const quota = await LimitModel.getUserQuotaStatus(req.user.id, req.user.role).catch(() => null);

      return res.status(201).json({ ...created, quota });
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

      invalidateAllLessonCaches(deleted.id);
      return res.json({ deletedId: deleted.id });
    } catch (err) {
      console.error('Delete lesson error:', err);
      return res.status(500).json({ error: 'Failed to delete lesson.' });
    }
  },
};

