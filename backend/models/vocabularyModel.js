import { pool } from '../config/db.js';

export const VocabularyModel = {
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT v.*, l.title AS lesson_title
       FROM vocabulary v
       LEFT JOIN lessons l ON l.id = v.lesson_id
       WHERE v.user_id = $1
       ORDER BY v.id DESC`,
      [userId]
    );
    return result.rows;
  },

  async create({
    userId,
    lessonId,
    word,
    ipa,
    partOfSpeech,
    khmerMeaning,
    exampleSentence,
  }) {
    const result = await pool.query(
      `INSERT INTO vocabulary (user_id, lesson_id, word, ipa, part_of_speech, khmer_meaning, example_sentence)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        lessonId || null,
        word,
        ipa || '/wɜːrd/',
        partOfSpeech || 'word',
        khmerMeaning || 'ពាក្យសន្សំ (Saved Word)',
        exampleSentence || '',
      ]
    );
    return result.rows[0];
  },

  async deleteById(vocabId, userId) {
    const result = await pool.query(
      'DELETE FROM vocabulary WHERE id = $1 AND user_id = $2 RETURNING id',
      [vocabId, userId]
    );
    return result.rows[0] || null;
  },
};

