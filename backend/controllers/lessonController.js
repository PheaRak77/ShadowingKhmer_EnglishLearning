import { LessonModel } from '../models/lessonModel.js';
import {
  extractYouTubeId,
  fetchYoutubeCaptionsWithYtDlp,
} from '../services/youtubeService.js';
import { generateLessonWithGemini } from '../services/geminiService.js';

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

      return res.json(details);
    } catch (err) {
      console.error('Get single lesson error:', err);
      return res.status(500).json({ error: 'Failed to fetch lesson details.' });
    }
  },

  // POST /api/lessons/create
  async createLesson(req, res) {
    const startTime = Date.now();
    const { videoUrl } = req.body;
    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
      return res.status(400).json({ error: 'Please provide a valid YouTube video URL.' });
    }

    // Instant return (0.02s) if this user already created a lesson for this YouTube video
    try {
      const existing = await LessonModel.findExistingByVideoId(videoId, req.user.id);
      if (existing) {
        console.log(`⚡ Instant cache hit from PostgreSQL for video ${videoId}`);
        return res.status(200).json(existing);
      }
    } catch {}

    let extractedSentences;
    try {
      const ytStart = Date.now();
      extractedSentences = await fetchYoutubeCaptionsWithYtDlp(videoUrl, videoId);
      console.log(
        `⚡ yt-dlp extracted ${extractedSentences.length} sentences (up to 4 min) for ${videoId} in ${(
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
      aiData = await generateLessonWithGemini(extractedSentences, videoId);
      console.log(
        `⚡ Gemini translated ${extractedSentences.length} sentences in ${(
          (Date.now() - aiStart) /
          1000
        ).toFixed(1)}s (total: ${((Date.now() - startTime) / 1000).toFixed(1)}s)`
      );
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

