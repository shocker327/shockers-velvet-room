import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';

// After compilation, __dirname = <project-root>/dist/server
// client/dist lives at <project-root>/client/dist
// We resolve relative to process.cwd() which is the project root on Railway
const BACKGROUNDS_DIR = path.join(process.cwd(), 'client', 'dist', 'backgrounds');

const companions = [
  {
    id: 'serena',
    prompt:
      'A beautiful woman with long dark hair, olive skin, serene expression, wearing flowing silk robes, sitting gracefully in a peaceful zen garden with bamboo, soft candles, stone path, and warm golden lighting. Full body portrait, elegant and mystical atmosphere, soft focus background, romantic mood lighting, photorealistic, cinematic, dark moody tones, vertical composition',
  },
  {
    id: 'alex',
    prompt:
      'A stunning athletic woman with short red hair, bright green eyes, playful confident smirk, wearing a trendy crop top and leather jacket, relaxing on a velvet couch in a modern upscale lounge with warm orange and red neon lighting, exposed brick, cocktails nearby. Full body portrait, energetic and bold vibe, vibrant warm lighting, photorealistic, cinematic, dark moody tones, vertical composition',
  },
  {
    id: 'luna',
    prompt:
      'A gorgeous ethereal woman with long silver-blonde hair, pale luminous skin, dreamy blue eyes, wearing a flowing white lace dress, standing in a moonlit garden with blooming roses, fireflies, and soft purple-blue moonlight filtering through trees. Full body portrait, romantic and dreamy atmosphere, soft ethereal glow, photorealistic, cinematic, dark moody tones, vertical composition',
  },
  {
    id: 'victoria',
    prompt:
      'A striking powerful woman with a sleek black bob haircut, sharp elegant features, confident commanding gaze, wearing a form-fitting black designer dress, standing in a luxury penthouse with floor-to-ceiling windows showing a city skyline at night, rose gold accents, dim sophisticated lighting. Full body portrait, commanding and luxurious atmosphere, photorealistic, cinematic, dark moody tones, vertical composition',
  },
];

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
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
  // Create backgrounds directory if it doesn't exist
  if (!fs.existsSync(BACKGROUNDS_DIR)) {
    fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
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
      console.log(`[Backgrounds] ✓ Saved: ${companion.id}-bg.png`);
    } catch (err: any) {
      console.error(`[Backgrounds] ✗ Error for ${companion.id}:`, err.message);
    }
  }

  console.log('[Backgrounds] Generation complete.');
}
