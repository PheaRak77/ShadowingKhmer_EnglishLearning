import { pool } from '../config/db.js';

export const LessonModel = {
  async findExistingByVideoId(videoId, userId) {
    const res = await pool.query(
      'SELECT id FROM lessons WHERE video_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1',
      [videoId, userId]
    );
    if (res.rows.length === 0) return null;
    return await this.findByIdWithDetails(res.rows[0].id, userId, true);
  },

  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT l.id, l.user_id, l.video_url, l.video_id, l.title, l.created_at,
              l.is_public, l.cefr_level, l.tags, l.view_count,
              COUNT(DISTINCT s.id)::int AS sentence_count
       FROM lessons l
       LEFT JOIN sentences s ON s.lesson_id = l.id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async findPublicLibraryLessons() {
    const result = await pool.query(
      `SELECT l.id, l.user_id, l.video_url, l.video_id, l.title, l.created_at,
              l.is_public, l.cefr_level, l.tags, l.view_count,
              u.username AS creator_name,
              COUNT(DISTINCT s.id)::int AS sentence_count
       FROM lessons l
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN sentences s ON s.lesson_id = l.id
       WHERE l.is_public = TRUE
       GROUP BY l.id, u.username
       ORDER BY l.created_at DESC`
    );
    return result.rows;
  },

  async findByIdWithDetails(lessonId, userId, isAdmin = false, allowPublic = false) {
    let lessonQuery;
    let lessonParams;
    if (isAdmin) {
      lessonQuery = 'SELECT * FROM lessons WHERE id = $1';
      lessonParams = [lessonId];
    } else if (allowPublic && !userId) {
      lessonQuery = 'SELECT * FROM lessons WHERE id = $1 AND is_public = TRUE';
      lessonParams = [lessonId];
    } else if (allowPublic && userId) {
      lessonQuery = 'SELECT * FROM lessons WHERE id = $1 AND (user_id = $2 OR is_public = TRUE)';
      lessonParams = [lessonId, userId];
    } else {
      lessonQuery = 'SELECT * FROM lessons WHERE id = $1 AND user_id = $2';
      lessonParams = [lessonId, userId];
    }

    const lessonResult = await pool.query(lessonQuery, lessonParams);
    if (lessonResult.rows.length === 0) return null;

    const lesson = lessonResult.rows[0];

    const [sentencesRes, vocabRes, grammarRes] = await Promise.all([
      pool.query('SELECT * FROM sentences WHERE lesson_id = $1 ORDER BY sentence_index ASC', [
        lessonId,
      ]),
      pool.query('SELECT * FROM vocabulary WHERE lesson_id = $1 ORDER BY id ASC', [lessonId]),
      pool.query('SELECT * FROM grammar_points WHERE lesson_id = $1 ORDER BY id ASC', [lessonId]),
    ]);

    return {
      lesson,
      sentences: sentencesRes.rows,
      vocabulary: vocabRes.rows,
      grammar_points: grammarRes.rows,
    };
  },

  async incrementViewCount(lessonId) {
    await pool.query(
      'UPDATE lessons SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
      [lessonId]
    );
  },

  async upsertStudyHistory(userId, lessonId, practicedSentences = 0, totalSentences = 0) {
    const safePracticed = Math.max(0, parseInt(practicedSentences, 10) || 0);
    const safeTotal = Math.max(0, parseInt(totalSentences, 10) || 0);
    const res = await pool.query(
      `INSERT INTO student_study_history (user_id, lesson_id, practiced_sentences, total_sentences, last_studied_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
       SET practiced_sentences = GREATEST(student_study_history.practiced_sentences, EXCLUDED.practiced_sentences),
           total_sentences = GREATEST(student_study_history.total_sentences, EXCLUDED.total_sentences),
           last_studied_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, lessonId, safePracticed, safeTotal]
    );
    return res.rows[0];
  },

  async getUserStudyHistory(userId) {
    const result = await pool.query(
      `SELECT l.id, l.user_id, l.video_url, l.video_id, l.title, l.created_at,
              l.is_public, l.cefr_level, l.tags, l.view_count,
              h.practiced_sentences, h.total_sentences, h.last_studied_at,
              COUNT(DISTINCT s.id)::int AS sentence_count
       FROM student_study_history h
       JOIN lessons l ON l.id = h.lesson_id
       LEFT JOIN sentences s ON s.lesson_id = l.id
       WHERE h.user_id = $1
       GROUP BY l.id, h.practiced_sentences, h.total_sentences, h.last_studied_at
       ORDER BY h.last_studied_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async updateLessonLibraryMeta(lessonId, { isPublic, cefrLevel, tags, title }) {
    const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1']);
    const updates = [];
    const params = [];
    let idx = 1;

    if (typeof isPublic === 'boolean') {
      updates.push(`is_public = $${idx++}`);
      params.push(isPublic);
    }
    if (typeof cefrLevel === 'string' && validLevels.has(cefrLevel.trim().toUpperCase())) {
      updates.push(`cefr_level = $${idx++}`);
      params.push(cefrLevel.trim().toUpperCase());
    }
    if (typeof tags === 'string') {
      updates.push(`tags = $${idx++}`);
      params.push(tags.trim() || 'Daily Conversation');
    }
    if (typeof title === 'string' && title.trim()) {
      updates.push(`title = $${idx++}`);
      params.push(title.trim());
    }

    if (updates.length === 0) return null;
    params.push(lessonId);

    const res = await pool.query(
      `UPDATE lessons
       SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING id, user_id, video_url, video_id, title, created_at, is_public, cefr_level, tags, view_count`,
      params
    );
    return res.rows[0] || null;
  },

  async createLessonWithTransaction({
    userId,
    videoUrl,
    videoId,
    extractedSentences,
    aiData,
    isPublic = false,
    cefrLevel = 'A2',
    tags = 'Daily Conversation',
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1']);
      const safeLevel = validLevels.has(String(cefrLevel || '').toUpperCase())
        ? String(cefrLevel).toUpperCase()
        : 'A2';
      const safeTags = String(tags || '').trim() || 'Daily Conversation';
      const lessonTitle = aiData.title || `Shadowing Lesson (${videoId})`;
      const lessonInsert = await client.query(
        `INSERT INTO lessons (user_id, video_url, video_id, title, is_public, cefr_level, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, videoUrl.trim(), videoId, lessonTitle, Boolean(isPublic), safeLevel, safeTags]
      );
      const lesson = lessonInsert.rows[0];

      const insertedSentences = [];
      for (let idx = 0; idx < extractedSentences.length; idx++) {
        const s = extractedSentences[idx];
        const khmerTranslation =
          (Array.isArray(aiData.translations) && aiData.translations[idx]) ||
          'មិនទាន់មានការបកប្រែ';

        const sentenceRes = await client.query(
          `INSERT INTO sentences (lesson_id, sentence_index, english_text, khmer_text, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [lesson.id, idx + 1, s.english_text, khmerTranslation, s.start_time, s.end_time]
        );
        insertedSentences.push(sentenceRes.rows[0]);
      }

      const insertedVocabulary = [];
      const vocabList = Array.isArray(aiData.vocabulary) ? aiData.vocabulary : [];
      for (const v of vocabList) {
        if (!v.word || !v.khmer) continue;
        const vocabRes = await client.query(
          `INSERT INTO vocabulary (user_id, lesson_id, word, ipa, part_of_speech, khmer_meaning, example_sentence)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            userId,
            lesson.id,
            v.word.trim(),
            v.ipa || '',
            v.pos || 'word',
            v.khmer,
            v.example || '',
          ]
        );
        insertedVocabulary.push(vocabRes.rows[0]);
      }

      const insertedGrammar = [];
      const grammarList = Array.isArray(aiData.grammar) ? aiData.grammar : [];
      for (const g of grammarList) {
        if (!g.title) continue;
        const grammarRes = await client.query(
          `INSERT INTO grammar_points (lesson_id, stage, title, explanation_en, explanation_km, example_en, example_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            lesson.id,
            g.stage || 'Stage 1: The basics',
            g.title,
            g.explanation_en || '',
            g.explanation_km || '',
            g.example_en || '',
            g.example_km || '',
          ]
        );
        insertedGrammar.push(grammarRes.rows[0]);
      }

      await client.query('COMMIT');

      return {
        lesson,
        sentences: insertedSentences,
        vocabulary: insertedVocabulary,
        grammar_points: insertedGrammar,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async deleteById(lessonId, userId, isAdmin = false) {
    const query = isAdmin
      ? 'DELETE FROM lessons WHERE id = $1 RETURNING id'
      : 'DELETE FROM lessons WHERE id = $1 AND user_id = $2 RETURNING id';
    const params = isAdmin ? [lessonId] : [lessonId, userId];
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },
};

