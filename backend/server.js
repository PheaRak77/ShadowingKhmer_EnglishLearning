import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensureSchemaUpToDate } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import vocabularyRoutes from './routes/vocabularyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Force IPv4 first to prevent 30-second IPv6 DNS/socket timeouts
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MVC API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    architecture: 'MVC',
    maxVideoDurationSeconds: 240,
    features: ['Google OAuth', 'Admin Dashboard', 'Fast 4-Minute Video Support'],
  });
});

// Serve Frontend static build in production if available (for single-service cloud hosting)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

ensureSchemaUpToDate().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Khmer-English Shadowing MVC Backend running on http://localhost:${PORT}`);
  });
});
