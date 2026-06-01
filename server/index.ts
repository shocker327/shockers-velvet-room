import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { generateBackgroundsIfNeeded } from './generateBackgrounds';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Resolve client/dist path ────────────────────────────────────────────────
// After compilation: __dirname = <project-root>/dist/server
// client/dist lives at:          <project-root>/client/dist
// So we need to go up TWO levels from __dirname.
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Log for debugging on Railway
console.log(`📁 Serving static files from: ${clientDistPath}`);
console.log(`📁 Path exists: ${fs.existsSync(clientDistPath)}`);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── tRPC API ─────────────────────────────────────────────────────────────────
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

//// ─── Debug endpoint for background status ───────────────────────────────
app.get('/api/bg-status', (req, res) => {
  const bgDir = path.join(clientDistPath, 'backgrounds');
  const exists = fs.existsSync(bgDir);
  let files: string[] = [];
  if (exists) {
    files = fs.readdirSync(bgDir);
  }
  res.json({
    bgDir,
    clientDistPath,
    dirExists: exists,
    files,
    __dirname,
    cwd: process.cwd(),
  });
});

// ─── Manual trigger to regenerate backgrounds ──────────────────────────
app.get('/api/bg-generate', async (req, res) => {
  try {
    await generateBackgroundsIfNeeded();
    const bgDir = path.join(clientDistPath, 'backgrounds');
    const files = fs.existsSync(bgDir) ? fs.readdirSync(bgDir) : [];
    res.json({ success: true, files });
  } catch (err: any) {
    res.json({ success: false, error: err.message });
  }
});

// ─── Static frontend files ────────────────────────────────────────────────────
app.use(express.static(clientDistPath));

// ─── SPA catch-all — serve index.html for all non-API routes ─────────────────
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(
      `Frontend not found at ${indexPath}. ` +
      `Make sure the build step ran successfully (npm run build).`
    );
  }
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟣 The Velvet Suite server running on port ${PORT}`);
  // Generate companion background images on first deploy (non-blocking)
  generateBackgroundsIfNeeded().catch((err) => {
    console.error('[Backgrounds] Failed to generate backgrounds:', err.message);
  });
});
