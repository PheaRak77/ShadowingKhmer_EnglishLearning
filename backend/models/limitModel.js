import { pool } from '../config/db.js';

const DEFAULT_MAX_LESSONS = 1;
const DEFAULT_WINDOW_DAYS = 2;

function clampInt(value, min, max, fallback) {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export const LimitModel = {
  async getGlobalStudentLimit() {
    const res = await pool.query(
      `SELECT key, value FROM app_settings WHERE key IN ('student_limit_max', 'student_limit_days')`
    );
    const map = {};
    for (const row of res.rows) {
      map[row.key] = row.value;
    }
    return {
      maxLessons: clampInt(map.student_limit_max, 1, 100, DEFAULT_MAX_LESSONS),
      windowDays: clampInt(map.student_limit_days, 1, 365, DEFAULT_WINDOW_DAYS),
    };
  },

  async updateGlobalStudentLimit(maxLessons, windowDays) {
    const safeMax = clampInt(maxLessons, 1, 100, DEFAULT_MAX_LESSONS);
    const safeDays = clampInt(windowDays, 1, 365, DEFAULT_WINDOW_DAYS);

    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('student_limit_max', $1, CURRENT_TIMESTAMP),
              ('student_limit_days', $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_at = CURRENT_TIMESTAMP`,
      [String(safeMax), String(safeDays)]
    );

    return { maxLessons: safeMax, windowDays: safeDays };
  },

  async getUserQuotaStatus(userId, role) {
    if (role === 'admin') {
      return {
        isUnlimited: true,
        isCustom: false,
        maxLessons: null,
        windowDays: null,
        usedCount: 0,
        remaining: null,
        nextResetAt: null,
      };
    }

    const [globalLimit, userRes] = await Promise.all([
      this.getGlobalStudentLimit(),
      pool.query(
        `SELECT custom_limit_max, custom_limit_days FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      ),
    ]);

    const userRow = userRes.rows[0] || {};
    const hasCustomMax =
      userRow.custom_limit_max !== null && userRow.custom_limit_max !== undefined;
    const hasCustomDays =
      userRow.custom_limit_days !== null && userRow.custom_limit_days !== undefined;

    const maxLessons = hasCustomMax
      ? clampInt(userRow.custom_limit_max, 0, 100, globalLimit.maxLessons)
      : globalLimit.maxLessons;
    const windowDays = hasCustomDays
      ? clampInt(userRow.custom_limit_days, 1, 365, globalLimit.windowDays)
      : globalLimit.windowDays;

    const logsRes = await pool.query(
      `SELECT created_at
       FROM lesson_usage_logs
       WHERE user_id = $1
         AND created_at > NOW() - ($2 || ' days')::INTERVAL
       ORDER BY created_at ASC`,
      [userId, String(windowDays)]
    );

    const usedCount = logsRes.rows.length;
    const remaining = Math.max(0, maxLessons - usedCount);

    let nextResetAt = null;
    if (remaining === 0 && logsRes.rows[0]?.created_at) {
      const oldestMs = new Date(logsRes.rows[0].created_at).getTime();
      nextResetAt = new Date(oldestMs + windowDays * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
      isUnlimited: false,
      isCustom: hasCustomMax || hasCustomDays,
      maxLessons,
      windowDays,
      usedCount,
      remaining,
      nextResetAt,
    };
  },

  async recordUsage(userId, videoId) {
    await pool.query(
      `INSERT INTO lesson_usage_logs (user_id, video_id) VALUES ($1, $2)`,
      [userId, videoId]
    );
  },

  async updateUserCustomLimit(userId, customLimitMax, customLimitDays) {
    const safeMax =
      customLimitMax === null || customLimitMax === '' || customLimitMax === undefined
        ? null
        : clampInt(customLimitMax, 0, 100, DEFAULT_MAX_LESSONS);
    const safeDays =
      customLimitDays === null || customLimitDays === '' || customLimitDays === undefined
        ? null
        : clampInt(customLimitDays, 1, 365, DEFAULT_WINDOW_DAYS);

    const result = await pool.query(
      `UPDATE users
       SET custom_limit_max = $1,
           custom_limit_days = $2
       WHERE id = $3
       RETURNING id, username, email, role, custom_limit_max, custom_limit_days`,
      [safeMax, safeDays, userId]
    );
    return result.rows[0] || null;
  },

  async resetUserUsage(userId) {
    await pool.query(`DELETE FROM lesson_usage_logs WHERE user_id = $1`, [userId]);
  },
};
