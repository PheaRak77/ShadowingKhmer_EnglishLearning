import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserModel } from '../models/userModel.js';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_khmer_shadowing_jwt_key_2025';

export function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role === 'admin' ? 'admin' : 'student',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const dbUser = await UserModel.findById(req.user.id);
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges are required for this action.' });
    }
    req.user.role = dbUser.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify admin privileges.' });
  }
}
