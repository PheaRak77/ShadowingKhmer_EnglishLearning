import { pool } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role, google_id, avatar_url, created_at
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, username, email, role, google_id, avatar_url, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByGoogleId(googleId) {
    const result = await pool.query(
      `SELECT id, username, email, role, google_id, avatar_url, created_at
       FROM users
       WHERE google_id = $1`,
      [googleId]
    );
    return result.rows[0] || null;
  },

  async countUsers() {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return result.rows[0].count;
  },

  async create({
    username,
    email,
    passwordHash,
    role = 'student',
    googleId = null,
    avatarUrl = null,
  }) {
    const validRole = role === 'admin' ? 'admin' : 'student';
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, google_id, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, role, google_id, avatar_url, created_at`,
      [username.trim(), email.trim().toLowerCase(), passwordHash, validRole, googleId, avatarUrl]
    );
    return result.rows[0];
  },

  async linkGoogleToUser(userId, { googleId, avatarUrl }) {
    const result = await pool.query(
      `UPDATE users
       SET google_id = $1,
           avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, username, email, role, google_id, avatar_url, created_at`,
      [googleId, avatarUrl, userId]
    );
    return result.rows[0] || null;
  },

  async updateRole(userId, role) {
    const validRole = role === 'admin' ? 'admin' : 'student';
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, username, email, role, google_id, avatar_url, created_at`,
      [validRole, userId]
    );
    return result.rows[0] || null;
  },

  async deleteById(userId) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    return result.rows[0] || null;
  },

  async saveResetCode(email, code, expiresAt) {
    const result = await pool.query(
      `UPDATE users
       SET reset_code = $1,
           reset_code_expires = $2
       WHERE email = $3
       RETURNING id, email, username`,
      [code, expiresAt, email.trim().toLowerCase()]
    );
    return result.rows[0] || null;
  },

  async verifyAndResetPassword(email, code, newPasswordHash) {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_code = NULL,
           reset_code_expires = NULL
       WHERE email = $2
         AND reset_code = $3
         AND reset_code_expires > NOW()
       RETURNING id, username, email, role, google_id, avatar_url, created_at`,
      [newPasswordHash, email.trim().toLowerCase(), code.trim()]
    );
    return result.rows[0] || null;
  },
};
