import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { UserModel } from '../models/userModel.js';
import { signUserToken } from '../middleware/auth.js';
import { seedStarterLessonIfEmpty } from '../config/db.js';

dotenv.config();

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

  // POST /api/auth/register (Public registration strictly creates a 'student' account)
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are all required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        username,
        email,
        passwordHash,
        role: 'student',
      });

      await seedStarterLessonIfEmpty(user.id);

      const token = signUserToken(user);
      return res.status(201).json({ user, token });
    } catch (err) {
      console.error('Register controller error:', err);
      return res.status(500).json({ error: 'Failed to register user.' });
    }
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

  // POST /api/auth/forgot-password - Generate 6-digit reset code valid for 15 minutes
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

      return res.json({
        message: '6-digit password reset code generated (valid for 15 minutes).',
        resetCode,
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Failed to generate password reset code.' });
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
