import dns from 'dns';
import zlib from 'zlib';
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
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// Fast built-in Brotli / Gzip HTTP compression middleware for JSON & text responses (> 1 KB)
app.use((req, res, next) => {
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  const useBr = acceptEncoding.includes('br');
  const useGzip = !useBr && acceptEncoding.includes('gzip');
  if (!useBr && !useGzip) return next();

  const origJson = res.json.bind(res);
  res.json = (body) => {
    try {
      const jsonStr = JSON.stringify(body);
      if (!jsonStr || jsonStr.length < 1024 || res.headersSent) {
        return origJson(body);
      }
      const rawBuf = Buffer.from(jsonStr, 'utf8');
      const compressed = useBr
        ? zlib.brotliCompressSync(rawBuf, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 },
          })
        : zlib.gzipSync(rawBuf, { level: 6 });

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Encoding', useBr ? 'br' : 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Content-Length', compressed.length);
      return res.end(compressed);
    } catch {
      return origJson(body);
    }
  };
  next();
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// MVC API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    architecture: 'MVC',
    maxVideoDurationSeconds: 240,
    features: ['Google OAuth', 'Admin Dashboard', 'Fast 4-Minute Video Support', 'Brotli/Gzip Compression'],
  });
});

// Serve Frontend static build in production if available (for single-service cloud hosting)
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(
    '/assets',
    express.static(path.join(frontendDistPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );
  app.use(express.static(frontendDistPath, { maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

ensureSchemaUpToDate().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Khmer-English Shadowing MVC Backend running on http://localhost:${PORT}`);
  });
  // Keep connections warm behind Render/Cloudflare reverse proxies
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
});
