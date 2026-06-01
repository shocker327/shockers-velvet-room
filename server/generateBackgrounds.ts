import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Use the same clientDistPath logic as index.ts
// After compilation: __dirname = <project-root>/dist/server
// client/dist lives at: <project-root>/client/dist
function getBackgroundsDir(): string {
  // Try relative to __dirname first (compiled location)
  const fromDirname = path.resolve(__dirname, '../../client/dist/backgrounds');
  // Also try from cwd
  const fromCwd = path.join(process.cwd(), 'client', 'dist', 'backgrounds');
  
  // Check if client/dist exists from either path
  const clientDistFromDirname = path.resolve(__dirname, '../../client/dist');
  const clientDistFromCwd = path.join(process.cwd(), 'client', 'dist');
  
  if (fs.existsSync(clientDistFromDirname)) {
    console.log(`[Backgrounds] Using path relative to __dirname: ${fromDirname}`);
    return fromDirname;
  } else if (fs.existsSync(clientDistFromCwd)) {
    console.log(`[Backgrounds] Using path relative to cwd: ${fromCwd}`);
    return fromCwd;
  }
  
  // Default to cwd-based path and create it
  console.log(`[Backgrounds] No client/dist found, creating at: ${fromCwd}`);
  return fromCwd;
}

const companions = [
  {
    id: 'serena',
    prompt:
      'A serene zen garden scene at golden hour. Bamboo groves, stepping stones over a koi pond, soft candle lanterns, cherry blossom petals floating in the air. A woman with long dark hair and olive skin in elegant silk robes sits peacefully in meditation. Warm golden lighting, cinematic composition, photorealistic, portrait orientation, moody and atmospheric',
  },
  {
    id: 'alex',
    prompt:
      'A modern upscale cocktail lounge with warm orange and red neon lighting, velvet couches, exposed brick walls, and ambient mood lighting. A confident woman with short red hair and green eyes in stylish streetwear sits casually on a couch. Energetic and vibrant atmosphere, cinematic composition, photorealistic, portrait orientation',
  },
  {
    id: 'luna',
    prompt:
      'A magical moonlit garden at night with blooming roses, fireflies, and soft purple-blue moonlight filtering through willow trees. A graceful woman with long silver-blonde hair in a flowing white dress stands among the flowers. Ethereal and dreamy atmosphere, soft glow, cinematic composition, photorealistic, portrait orientation',
  },
  {
    id: 'victoria',
    prompt:
      'A luxury penthouse interior at night with floor-to-ceiling windows showing a glittering city skyline, rose gold accents, modern art, and sophisticated dim lighting. A poised woman with a sleek black bob haircut in an elegant black evening dress stands confidently. Commanding and luxurious atmosphere, cinematic composition, photorealistic, portrait orientation',
  },
];

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    client
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(filepath);
            downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
            return;
          }
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

export async function generateBackgroundsIfNeeded(): Promise<void> {
  const BACKGROUNDS_DIR = getBackgroundsDir();
  
  // Create backgrounds directory if it doesn't exist
  if (!fs.existsSync(BACKGROUNDS_DIR)) {
    fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
    console.log(`[Backgrounds] Created directory: ${BACKGROUNDS_DIR}`);
  }

  // Check which backgrounds are missing
  const missing = companions.filter(
    (c) => !fs.existsSync(path.join(BACKGROUNDS_DIR, `${c.id}-bg.png`))
  );

  if (missing.length === 0) {
    console.log('[Backgrounds] All companion backgrounds exist. Skipping generation.');
    return;
  }

  console.log(
    `[Backgrounds] Generating ${missing.length} missing background(s): ${missing.map((c) => c.id).join(', ')}`
  );

  // Check if OPENAI_API_KEY is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('[Backgrounds] No OPENAI_API_KEY found. Cannot generate backgrounds.');
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
  });

  for (const companion of missing) {
    console.log(`[Backgrounds] Generating: ${companion.id}...`);
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: companion.prompt,
        n: 1,
        size: '1024x1792',
        quality: 'standard',
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        console.error(`[Backgrounds] No URL returned for ${companion.id}`);
        continue;
      }

      const filepath = path.join(BACKGROUNDS_DIR, `${companion.id}-bg.png`);
      await downloadImage(imageUrl, filepath);
      
      // Verify file was actually saved
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        console.log(`[Backgrounds] ✓ Saved: ${companion.id}-bg.png (${(stats.size / 1024).toFixed(0)}KB)`);
      } else {
        console.error(`[Backgrounds] ✗ File not found after download: ${filepath}`);
      }
    } catch (err: any) {
      console.error(`[Backgrounds] ✗ Error for ${companion.id}:`, err.message);
      // If it's a content policy error, log more details
      if (err.code === 'content_policy_violation') {
        console.error(`[Backgrounds] Content policy violation for ${companion.id}. Try adjusting the prompt.`);
      }
    }
  }

  console.log('[Backgrounds] Generation complete.');
  
  // List what's in the directory now
  try {
    const files = fs.readdirSync(BACKGROUNDS_DIR);
    console.log(`[Backgrounds] Files in backgrounds dir: ${files.join(', ') || '(empty)'}`);
  } catch (e) {
    console.error('[Backgrounds] Could not list directory');
  }
}
