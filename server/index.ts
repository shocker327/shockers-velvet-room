import express from 'express';
import cors from 'cors';
import path from 'path';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// tRPC API
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

// Serve static frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/trpc')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟣 The Velvet Suite server running on port ${PORT}`);
});
