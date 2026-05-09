import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';

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
});
