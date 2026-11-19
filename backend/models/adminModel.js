import { pool } from '../config/db.js';

export const AdminModel = {
  async getPlatformStats() {
    const [
      usersRes,
      googleUsersRes,
      lessonsRes,
      sentencesRes,
      vocabRes,
      grammarRes,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM users WHERE google_id IS NOT NULL'),
      pool.query('SELECT COUNT(*)::int AS count FROM lessons'),
      pool.query('SELECT COUNT(*)::int AS count FROM sentences'),
      pool.query('SELECT COUNT(*)::int AS count FROM vocabulary'),
      pool.query('SELECT COUNT(*)::int AS count FROM grammar_points'),
    ]);

    return {
      totalUsers: usersRes.rows[0].count,
      googleConnectedUsers: googleUsersRes.rows[0].count,
      totalLessons: lessonsRes.rows[0].count,
      totalSentences: sentencesRes.rows[0].count,
      totalVocabulary: vocabRes.rows[0].count,
      totalGrammarPoints: grammarRes.rows[0].count,
    };
  },

  async getAllUsersWithActivity() {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.google_id, u.avatar_url, u.created_at,
             u.custom_limit_max, u.custom_limit_days,
             COUNT(DISTINCT l.id)::int AS lesson_count,
             COUNT(DISTINCT v.id)::int AS vocab_count
      FROM users u
      LEFT JOIN lessons l ON l.user_id = u.id
      LEFT JOIN vocabulary v ON v.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return result.rows;
  },

  async getAllLessonsWithCreator() {
    const result = await pool.query(`
      SELECT l.id, l.user_id, l.video_url, l.video_id, l.title, l.created_at,
             l.is_public, l.cefr_level, l.tags, l.view_count,
             u.username AS creator_name, u.email AS creator_email,
             COUNT(DISTINCT s.id)::int AS sentence_count,
             COUNT(DISTINCT v.id)::int AS vocab_count,
             COUNT(DISTINCT g.id)::int AS grammar_count
      FROM lessons l
      LEFT JOIN users u ON u.id = l.user_id
      LEFT JOIN sentences s ON s.lesson_id = l.id
      LEFT JOIN vocabulary v ON v.lesson_id = l.id
      LEFT JOIN grammar_points g ON g.lesson_id = l.id
      GROUP BY l.id, u.username, u.email
      ORDER BY l.created_at DESC
    `);
    return result.rows;
  },
};

