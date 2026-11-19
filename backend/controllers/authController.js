import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dns from 'dns';
import dotenv from 'dotenv';
import { UserModel } from '../models/userModel.js';
import { signUserToken } from '../middleware/auth.js';
import { pool, seedStarterLessonIfEmpty } from '../config/db.js';
import { sendResetOtpEmail, sendRegistrationOtpEmail } from '../services/emailService.js';

dotenv.config();

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'mohmal.com',
]);

async function validateRealEmailAddress(rawEmail) {
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { valid: false, error: 'Please enter a valid real email address (e.g. name@gmail.com).' };
  }

  const domain = email.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use your real email (Gmail, Outlook, Yahoo, etc.).',
    };
  }

  try {
    const mxRecords = await Promise.race([
      dns.promises.resolveMx(domain),
      new Promise((_, rej) => setTimeout(() => rej(new Error('MX timeout')), 4000)),
    ]);
    if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
      return {
        valid: false,
        error: `The email domain "@${domain}" cannot receive emails. Please enter your real email address.`,
      };
    }
  } catch (err) {
    if (err?.code === 'ENOTFOUND' || err?.code === 'ENODATA' || err?.code === 'NXDOMAIN') {
      return {
        valid: false,
        error: `The email domain "@${domain}" does not exist. Please check your spelling and use a real email account.`,
      };
    }
  }

  return { valid: true, email };
}

// Strictly verify real Google OAuth 2.0 Access Token or ID Token with Google's official API
async function verifyRealGoogleToken(body) {
  if (body.accessToken) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${body.accessToken}` },
    });
    if (!res.ok) {
      throw new Error('Failed to verify Google OAuth Access Token with Google.');
    }
    const profile = await res.json();
    if (!profile.email || !profile.sub) {
      throw new Error('Google account profile did not return a valid email.');
    }
    return {
      googleId: profile.sub,
      email: profile.email.toLowerCase(),
      username: profile.name || profile.email.split('@')[0],
      avatarUrl: profile.picture || null,
    };
  }

  if (body.idToken) {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.idToken)}`
    );
    if (!res.ok) {
      throw new Error('Failed to verify Google ID Token with Google.');
    }
    const tokenInfo = await res.json();
    if (!tokenInfo.email || !tokenInfo.sub) {
      throw new Error('Google ID Token did not contain a valid email.');
    }
    return {
      googleId: tokenInfo.sub,
      email: tokenInfo.email.toLowerCase(),
      username: tokenInfo.name || tokenInfo.email.split('@')[0],
      avatarUrl: tokenInfo.picture || null,
    };
  }

  throw new Error('A real Google OAuth token (accessToken or idToken) is required.');
}

export const AuthController = {
  // GET /api/auth/google-client-id
  async getGoogleClientId(req, res) {
    dotenv.config({ override: true });
    const rawId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const isConfigured =
      rawId.length > 10 &&
      !rawId.startsWith('YOUR_GOOGLE_CLIENT_ID') &&
      !rawId.startsWith('your_google_client_id');

    return res.json({
      clientId: isConfigured ? rawId : '',
      isConfigured,
    });
  },

  // POST /api/auth/register/send-code (Step 1: Validate real email + send 6-digit OTP to inbox)
  async sendRegistrationCode(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are all required.' });
      }
      if (username.trim().length < 2) {
        return res.status(400).json({ error: 'Username must be at least 2 characters long.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const check = await validateRealEmailAddress(email);
      if (!check.valid) {
        return res.status(400).json({ error: check.error });
      }
      const cleanEmail = check.email;

      const existing = await UserModel.findByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({
          error: 'An account with this email already exists. Please Sign In instead.',
        });
      }

      const otpCode = String(crypto.randomInt(100000, 1000000));
      const passwordHash = await bcrypt.hash(password, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      try {
        const result = await sendRegistrationOtpEmail(cleanEmail, username.trim(), otpCode);
        if (!result.sent) {
          return res.status(500).json({
            error: 'Email verification service is not configured on the server yet. Please sign in with Google instead.',
          });
        }
      } catch (mailErr) {
        console.error('Registration OTP email error:', mailErr.message);
        return res.status(502).json({
          error: `Could not send verification code to ${cleanEmail}: ${mailErr.message}`,
        });
      }

      await pool.query(
        `INSERT INTO pending_registrations (email, username, password_hash, code, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO UPDATE
         SET username = EXCLUDED.username,
             password_hash = EXCLUDED.password_hash,
             code = EXCLUDED.code,
             expires_at = EXCLUDED.expires_at,
             created_at = CURRENT_TIMESTAMP`,
        [cleanEmail, username.trim(), passwordHash, otpCode, expiresAt]
      );

      return res.json({
        email: cleanEmail,
        message: `We sent a 6-digit verification code to ${cleanEmail}. Check your inbox (or Spam folder) to finish creating your account.`,
      });
    } catch (err) {
      console.error('Send registration code error:', err);
      return res.status(500).json({ error: 'Failed to send verification code.' });
    }
  },

  // POST /api/auth/register/verify (Step 2: Confirm 6-digit OTP and activate verified student account)
  async verifyRegistrationCode(req, res) {
    try {
      const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
      const code = String(req.body?.code || '').trim();

      if (!cleanEmail || !code) {
        return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
      }

      const pendingRes = await pool.query(
        `SELECT email, username, password_hash
         FROM pending_registrations
         WHERE email = $1 AND code = $2 AND expires_at > NOW()
         LIMIT 1`,
        [cleanEmail, code]
      );

      if (pendingRes.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid or expired 6-digit verification code. Please check your email or request a new code.',
        });
      }

      const pending = pendingRes.rows[0];
      const existing = await UserModel.findByEmail(cleanEmail);
      if (existing) {
        await pool.query('DELETE FROM pending_registrations WHERE email = $1', [cleanEmail]);
        return res.status(409).json({ error: 'This email is already registered. Please Sign In.' });
      }

      const user = await UserModel.create({
        username: pending.username,
        email: pending.email,
        passwordHash: pending.password_hash,
        role: 'student',
      });

      await pool.query('DELETE FROM pending_registrations WHERE email = $1', [cleanEmail]);
      await seedStarterLessonIfEmpty(user.id);

      const token = signUserToken(user);
      return res.status(201).json({ user, token });
    } catch (err) {
      console.error('Verify registration code error:', err);
      return res.status(500).json({ error: 'Failed to verify registration code.' });
    }
  },

  // POST /api/auth/register (Requires email verification code — blocks unverified fake signups)
  async register(req, res) {
    if (req.body?.code) {
      return await AuthController.verifyRegistrationCode(req, res);
    }
    return res.status(400).json({
      error: 'Real email verification is required. Please verify your email with the 6-digit code sent to your inbox.',
    });
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const userRecord = await UserModel.findByEmail(email);
      if (!userRecord) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, userRecord.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        role: userRecord.role === 'admin' ? 'admin' : 'student',
        google_id: userRecord.google_id,
        avatar_url: userRecord.avatar_url,
        created_at: userRecord.created_at,
      };

      const token = signUserToken(user);
      return res.json({ user, token });
    } catch (err) {
      console.error('Login controller error:', err);
      return res.status(500).json({ error: 'Failed to log in.' });
    }
  },

  // POST /api/auth/google - Real Google OAuth 2.0 Sign-In / Registration (New users default to 'student')
  async googleAuth(req, res) {
    try {
      const googleProfile = await verifyRealGoogleToken(req.body);

      // 1. Check if a user already has this verified google_id
      let user = await UserModel.findByGoogleId(googleProfile.googleId);

      // 2. If not found by google_id, check if a user exists with the same real Gmail and link them
      if (!user) {
        const existingEmailUser = await UserModel.findByEmail(googleProfile.email);
        if (existingEmailUser) {
          user = await UserModel.linkGoogleToUser(existingEmailUser.id, {
            googleId: googleProfile.googleId,
            avatarUrl: googleProfile.avatarUrl,
          });
        }
      }

      // 3. Otherwise create a new 'student' user with their real Gmail profile
      if (!user) {
        const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

        user = await UserModel.create({
          username: googleProfile.username,
          email: googleProfile.email,
          passwordHash: randomPasswordHash,
          role: 'student',
          googleId: googleProfile.googleId,
          avatarUrl: googleProfile.avatarUrl,
        });
      }

      await seedStarterLessonIfEmpty(user.id);
      const token = signUserToken(user);
      return res.json({ user, token });
    } catch (err) {
      console.error('Google Auth error:', err);
      return res.status(400).json({ error: err.message || 'Google authentication failed.' });
    }
  },

  // POST /api/auth/google/connect - Connect/Link Real Google Account to an existing logged-in user
  async connectGoogleAccount(req, res) {
    try {
      const googleProfile = await verifyRealGoogleToken(req.body);

      const existingGoogleOwner = await UserModel.findByGoogleId(googleProfile.googleId);
      if (existingGoogleOwner && existingGoogleOwner.id !== req.user.id) {
        return res.status(409).json({
          error: `Google account (${googleProfile.email}) is already connected to another user.`,
        });
      }

      const updatedUser = await UserModel.linkGoogleToUser(req.user.id, {
        googleId: googleProfile.googleId,
        avatarUrl: googleProfile.avatarUrl,
      });

      const token = signUserToken(updatedUser);
      return res.json({ user: updatedUser, token });
    } catch (err) {
      console.error('Connect Google error:', err);
      return res.status(400).json({ error: err.message || 'Could not link Google account.' });
    }
  },

  // GET /api/auth/me - Get current authenticated user profile
  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json({ user });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
  },

  // POST /api/auth/forgot-password - Generate 6-digit OTP & send to user's real email
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Please enter your email address.' });
      }

      const existing = await UserModel.findByEmail(email);
      if (!existing) {
        return res.status(404).json({ error: 'No account found with that email address.' });
      }

      const resetCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await UserModel.saveResetCode(email, resetCode, expiresAt);

      // Check if any email provider is configured
      const hasSmtp =
        (process.env.SMTP_EMAIL || '').trim() &&
        (process.env.SMTP_APP_PASSWORD || '').trim() &&
        !(process.env.SMTP_APP_PASSWORD || '').startsWith('your_');
      const hasResend =
        (process.env.RESEND_API_KEY || '').trim() &&
        !(process.env.RESEND_API_KEY || '').startsWith('your_');
      const hasBrevo =
        (process.env.BREVO_API_KEY || '').trim() &&
        !(process.env.BREVO_API_KEY || '').startsWith('your_');
      const hasWebhook = (process.env.EMAIL_WEBHOOK_URL || '').trim().startsWith('https://');

      if (!hasSmtp && !hasResend && !hasBrevo && !hasWebhook) {
        return res.status(503).json({
          error:
            'Real email OTP sender is not configured yet. Please add BREVO_API_KEY or RESEND_API_KEY in Render Environment Variables.',
        });
      }

      // If an HTTPS email API (Brevo/Resend/Webhook) is configured, await it (~0.4s) so any key/sender errors are reported clearly
      if (hasBrevo || hasResend || hasWebhook) {
        await sendResetOtpEmail(existing.email, existing.username, resetCode);
        return res.json({
          message: `6-digit OTP sent to ${existing.email}. Please check your Inbox or Spam folder.`,
          emailSent: true,
        });
      }

      // Only SMTP (Gmail) falls back to background dispatch
      sendResetOtpEmail(existing.email, existing.username, resetCode)
        .then(() => console.log(`✅ OTP email sent to ${existing.email}`))
        .catch((mailErr) => console.error('❌ OTP email send error:', mailErr.message));

      return res.json({
        message: `6-digit OTP is being sent to ${existing.email}. Please check your Inbox or Spam folder.`,
        emailSent: true,
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({
        error: `Failed to send OTP email: ${err.message}`,
      });
    }
  },

  // POST /api/auth/reset-password - Verify 6-digit code and set new password
  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, 6-digit code, and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const updatedUser = await UserModel.verifyAndResetPassword(email, code, newHash);

      if (!updatedUser) {
        return res.status(400).json({
          error: 'Invalid or expired reset code. Please request a new 6-digit code.',
        });
      }

      return res.json({
        message: 'Password has been reset successfully! You can now sign in.',
      });
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(500).json({ error: 'Failed to reset password.' });
    }
  },
};
