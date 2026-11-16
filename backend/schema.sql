-- PostgreSQL Database Schema for Khmer-English Shadowing Platform
-- Strictly 2 roles: 'admin' and 'student'

DROP TABLE IF EXISTS grammar_points CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS sentences CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Supports Email/Password, Real Google OAuth, and 2 Roles: 'admin' | 'student')
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student' NOT NULL CHECK (role IN ('admin', 'student')),
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lessons Table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_id VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sentences Table
CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    sentence_index INTEGER NOT NULL,
    english_text TEXT NOT NULL,
    khmer_text TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL
);

-- 4. Vocabulary Table
CREATE TABLE vocabulary (
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

-- 5. Grammar Points Table
CREATE TABLE grammar_points (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    stage VARCHAR(100) DEFAULT 'Stage 1: The basics',
    title VARCHAR(255) NOT NULL,
    explanation_en TEXT NOT NULL,
    explanation_km TEXT NOT NULL,
    example_en TEXT NOT NULL,
    example_km TEXT NOT NULL
);

CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_sentences_lesson_id ON sentences(lesson_id);
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX idx_vocabulary_lesson_id ON vocabulary(lesson_id);
CREATE INDEX idx_grammar_points_lesson_id ON grammar_points(lesson_id);
