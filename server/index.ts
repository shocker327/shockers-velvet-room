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
  const logs: string[] = [];
  const bgDir = path.join(clientDistPath, 'backgrounds');
  
  logs.push(`bgDir: ${bgDir}`);
  logs.push(`OPENAI_API_KEY set: ${!!process.env.OPENAI_API_KEY}`);
  logs.push(`OPENAI_API_KEY length: ${(process.env.OPENAI_API_KEY || '').length}`);
  
  if (!fs.existsSync(bgDir)) {
    fs.mkdirSync(bgDir, { recursive: true });
    logs.push('Created backgrounds directory');
  }
  
  // Try generating just ONE image as a test
  try {
    const OpenAI = require('openai').default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
    });
    
    logs.push('Attempting DALL-E 3 generation for serena...');
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A serene zen garden at golden hour with bamboo, stepping stones, koi pond, and candle lanterns. A woman with long dark hair in silk robes meditates peacefully. Warm golden lighting, cinematic, photorealistic, portrait orientation.',
      n: 1,
      size: '1024x1792' as any,
      quality: 'standard',
    });
    
    logs.push(`Response received. Data length: ${response.data?.length}`);
    const imageUrl = response.data?.[0]?.url;
    logs.push(`Image URL: ${imageUrl ? imageUrl.substring(0, 80) + '...' : 'NONE'}`);
    
    if (imageUrl) {
      const filepath = path.join(bgDir, 'serena-bg.png');
      // Download the image
      const https = require('https');
      await new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(imageUrl, (resp: any) => {
          resp.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      });
      
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        logs.push(`✓ Saved serena-bg.png (${(stats.size / 1024).toFixed(0)}KB)`);
      } else {
        logs.push('✗ File not found after download');
      }
    }
  } catch (err: any) {
    logs.push(`✗ Error: ${err.message}`);
    logs.push(`Error code: ${err.code || 'none'}`);
    logs.push(`Error status: ${err.status || 'none'}`);
  }
  
  const files = fs.existsSync(bgDir) ? fs.readdirSync(bgDir) : [];
  res.json({ logs, files });
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
