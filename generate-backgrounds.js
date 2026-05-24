const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

const openai = new OpenAI();

const companions = [
  {
    id: 'serena',
    prompt: 'A beautiful woman with long dark hair, olive skin, serene expression, wearing flowing silk robes, sitting in a peaceful zen garden with bamboo, soft candles, and warm golden lighting. Full body shot, elegant and mystical atmosphere, soft focus background, romantic mood lighting, photorealistic, high quality, portrait orientation, 9:16 aspect ratio'
  },
  {
    id: 'alex',
    prompt: 'A stunning athletic woman with short red hair, bright green eyes, playful smirk, wearing trendy crop top and leather jacket, relaxing in a modern upscale lounge with warm orange neon lighting, velvet couches, and cocktails. Full body shot, energetic and bold vibe, vibrant lighting, photorealistic, high quality, portrait orientation, 9:16 aspect ratio'
  },
  {
    id: 'luna',
    prompt: 'A gorgeous ethereal woman with long silver-blonde hair, pale skin, dreamy blue eyes, wearing a flowing white lace dress, standing in a moonlit garden with roses, fireflies, and soft purple moonlight. Full body shot, romantic and dreamy atmosphere, soft ethereal glow, photorealistic, high quality, portrait orientation, 9:16 aspect ratio'
  },
  {
    id: 'victoria',
    prompt: 'A striking powerful woman with sleek black bob haircut, sharp features, confident gaze, wearing an elegant black designer dress, standing in a luxury penthouse office with city skyline at night, rose gold accents, and dim sophisticated lighting. Full body shot, commanding and luxurious atmosphere, photorealistic, high quality, portrait orientation, 9:16 aspect ratio'
  }
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function generateImages() {
  const outputDir = path.join(__dirname, 'client', 'public', 'backgrounds');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const companion of companions) {
    console.log(`Generating background for ${companion.id}...`);
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: companion.prompt,
        n: 1,
        size: '1024x1792',
        quality: 'standard'
      });

      const imageUrl = response.data[0].url;
      const filepath = path.join(outputDir, `${companion.id}-bg.png`);
      
      await downloadImage(imageUrl, filepath);
      console.log(`  ✓ Saved: ${filepath}`);
    } catch (err) {
      console.error(`  ✗ Error for ${companion.id}:`, err.message);
    }
  }

  console.log('\nDone! All backgrounds generated.');
}

generateImages();
