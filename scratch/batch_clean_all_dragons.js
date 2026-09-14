const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dragons = require('../data/dragons.json');

const OUT_DIR = path.join(__dirname, '..', 'public', 'dragons', 'clean');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

async function processAndSaveDragon(dragon) {
  const targetFile = path.join(OUT_DIR, `${dragon.id}.webp`);
  console.log(`Processing [${dragon.id}] ${dragon.name}...`);

  try {
    const buf = await download(dragon.image);
    const img = sharp(buf);
    const raw = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;
    const w = info.width;
    const h = info.height;
    const ch = info.channels;

    // 1. Soft feather on outer perimeter (5px)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const distFromEdge = Math.min(x, w - 1 - x, y, h - 1 - y);
        if (distFromEdge < 5) {
          const factor = distFromEdge / 5.0;
          const idx = (y * w + x) * ch + 3;
          data[idx] = Math.floor(data[idx] * factor);
        }
      }
    }

    // 2. Add 40px transparent padding all around so drop-shadow never clips
    await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .extend({
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 88, effort: 4 })
      .toFile(targetFile);

    const stats = fs.statSync(targetFile);
    console.log(`  -> Saved ${targetFile} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`  ERROR processing ${dragon.name}:`, err.message);
  }
}

async function run() {
  for (const d of dragons) {
    await processAndSaveDragon(d);
  }
  console.log('ALL DRAGONS CLEANED AND SAVED TO public/dragons/clean/!');
}

run();
