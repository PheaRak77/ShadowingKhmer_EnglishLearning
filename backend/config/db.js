import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const rawConnectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/english_learning';

const connectionString = rawConnectionString.replace('&channel_binding=require', '');

const isLocalDb =
  connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Seed starter lesson into PostgreSQL for a user if no lessons exist yet in the database
export async function seedStarterLessonIfEmpty(userId) {
  try {
    const existingLessons = await pool.query(
      'SELECT COUNT(*)::int AS count FROM lessons WHERE user_id = $1',
      [userId]
    );
    if (existingLessons.rows[0].count > 0) return;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lessonRes = await client.query(
        `INSERT INTO lessons (user_id, video_url, video_id, title)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          userId,
          'https://www.youtube.com/watch?v=eIho2S0ZahI',
          'eIho2S0ZahI',
          'A Day in My Life 1: Getting Up',
        ]
      );
      const lessonId = lessonRes.rows[0].id;

      const starterSentences = [
        [1, "Hi, I'm Ben. This is my morning.", 'សួស្តី ខ្ញុំឈ្មោះ បេន។ នេះគឺជាពេលព្រឹករបស់ខ្ញុំ។', 0.0, 4.2],
        [2, 'My alarm clock rings at six thirty.', 'នាឡិការោទិ៍របស់ខ្ញុំរោទិ៍នៅម៉ោងប្រាំមួយកន្លះ។', 4.2, 8.5],
        [3, "Ugh, it's so loud!", 'អូយ វាឮខ្លាំងណាស់!', 8.5, 11.8],
        [4, 'I turn it off. Quiet!', 'ខ្ញុំបិទវា។ ស្ងាត់ហើយ!', 11.8, 15.4],
        [5, 'I open my eyes and yawn.', 'ខ្ញុំបើកភ្នែករបស់ខ្ញុំ ហើយស្ងាប។', 15.4, 19.5],
        [
          6,
          'I stretch my arms and get out of bed slowly.',
          'ខ្ញុំពត់ដៃរបស់ខ្ញុំ ហើយក្រោកចេញពីគ្រែយឺតៗ។',
          19.5,
          24.8,
        ],
      ];

      for (const [idx, en, km, start, end] of starterSentences) {
        await client.query(
          `INSERT INTO sentences (lesson_id, sentence_index, english_text, khmer_text, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [lessonId, idx, en, km, start, end]
        );
      }

      const starterVocab = [
        [
          'alarm clock',
          '/əˈlɑːrm klɑːk/',
          'noun',
          'នាឡិការោទិ៍',
          'My alarm clock rings at six thirty every morning.',
        ],
        [
          'turn off',
          '/tɜːrn ɔːf/',
          'phrasal verb',
          'បិទ (ឧបករណ៍អគ្គិសនី)',
          'I turn it off so the room becomes quiet.',
        ],
        ['yawn', '/jɔːn/', 'verb', 'ស្ងាប', 'I open my eyes and yawn when I wake up.'],
        [
          'stretch',
          '/stretʃ/',
          'verb',
          'ពត់ខ្លួន / លាតសន្ធឹង',
          'I stretch my arms before getting out of bed.',
        ],
      ];

      for (const [word, ipa, pos, khmer, example] of starterVocab) {
        await client.query(
          `INSERT INTO vocabulary (user_id, lesson_id, word, ipa, part_of_speech, khmer_meaning, example_sentence)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, lessonId, word, ipa, pos, khmer, example]
        );
      }

      const starterGrammar = [
        [
          'Stage 1: The basics',
          'Be: am / is / are, was / were',
          'am/is/are now, was/were in the past + a noun, adjective or place — saying who, what or where something is.',
          'យើងប្រើ am/is/are សម្រាប់បច្ចុប្បន្នកាល និង was/were សម្រាប់អតីតកាល បូកនឹងនាម គុណនាម ឬទីកន្លែង ដើម្បីប្រាប់ថានរណា អ្វី ឬនៅទីណា។',
          "Hi, I'm Ben. This is my morning.",
          'សួស្តី ខ្ញុំឈ្មោះ បេន។ នេះគឺជាពេលព្រឹករបស់ខ្ញុំ។',
        ],
        [
          'Stage 2: Everyday words & Present Simple',
          'Present Simple for Daily Routines',
          'Use the base verb (add -s/-es for he/she/it) to describe habits, daily schedules, and regular morning routines.',
          'ប្រើកិរិយាសព្ទដើម (ថែម -s/-es សម្រាប់ប្រធានឯកវចនៈ he/she/it) ដើម្បីពិពណ៌នាអំពីទម្លាប់ប្រចាំថ្ងៃ និងសកម្មភាពដែលកើតឡើងជាប្រចាំ។',
          'My alarm clock rings at six thirty.',
          'នាឡិការោទិ៍របស់ខ្ញុំរោទិ៍នៅម៉ោងប្រាំមួយកន្លះ។',
        ],
        [
          'Stage 3: Verb patterns & Phrasal Verbs',
          'Separable Phrasal Verbs (turn it off)',
          'With separable phrasal verbs like "turn off", object pronouns (it, them) must go between the verb and the particle.',
          'ចំពោះកិរិយាសព្ទឃ្លាដែលអាចបំបែកបានដូចជា "turn off" សព្វនាមកម្មបទ (it, them) ត្រូវដាក់នៅចន្លោះកិរិយាសព្ទ និងធ្នាក់។',
          'I turn it off. Quiet!',
          'ខ្ញុំបិទវា។ ស្ងាត់ហើយ!',
        ],
      ];

      for (const [stage, title, expEn, expKm, exEn, exKm] of starterGrammar) {
        await client.query(
          `INSERT INTO grammar_points (lesson_id, stage, title, explanation_en, explanation_km, example_en, example_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [lessonId, stage, title, expEn, expKm, exEn, exKm]
        );
      }

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('Could not check starter lesson:', err.message);
  }
}

// Ensure the database uses strictly 'admin' and 'student' roles and remove any mock google_id values
export async function ensureSchemaUpToDate() {
  try {
    // Automatically create all 5 tables if deploying to a fresh cloud PostgreSQL database (Neon/Render/Supabase)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(20) DEFAULT 'student' NOT NULL,
          google_id VARCHAR(255) UNIQUE,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lessons (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          video_url TEXT NOT NULL,
          video_id VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sentences (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          sentence_index INTEGER NOT NULL,
          english_text TEXT NOT NULL,
          khmer_text TEXT NOT NULL,
          start_time FLOAT NOT NULL,
          end_time FLOAT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
          word VARCHAR(100) NOT NULL,
          ipa VARCHAR(100),
          part_of_speech VARCHAR(50),
          khmer_meaning TEXT NOT NULL,
          example_sentence TEXT,
          next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS grammar_points (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          stage VARCHAR(100) DEFAULT 'Stage 1: The basics',
          title VARCHAR(255) NOT NULL,
          explanation_en TEXT NOT NULL,
          explanation_km TEXT NOT NULL,
          example_en TEXT NOT NULL,
          example_km TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO app_settings (key, value)
      VALUES ('student_limit_max', '1'), ('student_limit_days', '2')
      ON CONFLICT (key) DO NOTHING;

      CREATE TABLE IF NOT EXISTS lesson_usage_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          video_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_study_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          practiced_sentences INTEGER DEFAULT 0,
          total_sentences INTEGER DEFAULT 0,
          last_studied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS pending_registrations (
          email VARCHAR(150) PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          password_hash TEXT NOT NULL,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE NOT NULL;
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cefr_level VARCHAR(10) DEFAULT 'A2' NOT NULL;
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT 'Daily Conversation' NOT NULL;
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_limit_max INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_limit_days INTEGER;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
      UPDATE users SET role = 'student' WHERE role NOT IN ('admin', 'student');
      UPDATE users SET google_id = NULL WHERE google_id LIKE 'google_%';

      -- Performance indexes for fast public library, lesson opening, vocabulary & study history queries
      CREATE INDEX IF NOT EXISTS idx_sentences_lesson_order ON sentences (lesson_id, sentence_index);
      CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON vocabulary (lesson_id);
      CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary (user_id);
      CREATE INDEX IF NOT EXISTS idx_grammar_lesson_id ON grammar_points (lesson_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_user_created ON lessons (user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_lessons_public_created ON lessons (is_public, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_study_history_user_time ON student_study_history (user_id, last_studied_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_logs_user_time ON lesson_usage_logs (user_id, created_at DESC);
    `);

    // Ensure default Boss Admin account from backend/.env exists in PostgreSQL
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const adminHash = await bcrypt.hash(adminPass, 10);

    const defaultAdminCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [adminEmail]
    );
    if (defaultAdminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ('Boss Admin', $1, $2, 'admin')`,
        [adminEmail, adminHash]
      );
    } else {
      await pool.query(
        `UPDATE users SET role = 'admin', password_hash = $2 WHERE email = $1`,
        [adminEmail, adminHash]
      );
    }

    const allUsers = await pool.query('SELECT id FROM users');
    for (const u of allUsers.rows) {
      await seedStarterLessonIfEmpty(u.id);
    }

    // Strictly separate All Lessons from student personal videos: student videos are never public
    await pool.query(`
      UPDATE lessons
      SET is_public = FALSE
      WHERE user_id IN (SELECT id FROM users WHERE role <> 'admin')
    `);

    // Ensure Admin's own existing lessons are published to "All Lessons" on first migration (never student videos)
    const pubCount = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM lessons l
      JOIN users u ON u.id = l.user_id
      WHERE l.is_public = TRUE AND u.role = 'admin'
    `);
    if (pubCount.rows[0].count === 0) {
      await pool.query(`
        UPDATE lessons
        SET is_public = TRUE
        WHERE id IN (
          SELECT DISTINCT ON (l.video_id) l.id
          FROM lessons l
          JOIN users u ON u.id = l.user_id
          WHERE u.role = 'admin'
          ORDER BY l.video_id, l.created_at DESC
        )
      `);
    }

    console.log('✅ PostgreSQL schema verified (Roles: "admin" & "student" | Real Google OAuth).');
  } catch (err) {
    console.warn('⚠️ Schema auto-migration warning:', err.message);
  }
}
