const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dragons = require('../data/dragons.json');

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

// Clean and pad an image buffer
async function processClipart(buf) {
  const img = sharp(buf);
  const raw = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // 1. Feather outer perimeter (first 4 pixels from boundary)
  // so any cut-off edges or stray border lines smoothly fade to 0 alpha
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const distFromEdge = Math.min(x, w - 1 - x, y, h - 1 - y);
      if (distFromEdge < 5) {
        const factor = distFromEdge / 5.0; // 0.0 at edge, 1.0 at 5px inside
        const idx = (y * w + x) * ch + 3;
        data[idx] = Math.floor(data[idx] * factor);
      }
    }
  }

  // 2. Add 40px transparent padding on all 4 sides so drop-shadow never clips
  const cleanedBuffer = await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .extend({
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();

  return cleanedBuffer;
}

async function testCleanBalerion() {
  const balerion = dragons.find(d => d.name === 'Balerion');
  console.log('Downloading Balerion:', balerion.image);
  const buf = await download(balerion.image);
  const cleaned = await processClipart(buf);
  
  const testPath = 'scratch/balerion_cleaned.webp';
  fs.writeFileSync(testPath, cleaned);
  console.log('Cleaned Balerion saved to', testPath);

  // Check border pixels of cleaned
  const meta = await sharp(cleaned).metadata();
  console.log('Cleaned meta:', meta);

  const rawClean = await sharp(cleaned).raw().toBuffer({ resolveWithObject: true });
  const d = rawClean.data;
  const nw = rawClean.info.width;
  const nh = rawClean.info.height;
  const nch = rawClean.info.channels;

  let borderAlphaSum = 0;
  for (let x = 0; x < nw; x++) {
    borderAlphaSum += d[x * nch + 3];
    borderAlphaSum += d[((nh - 1) * nw + x) * nch + 3];
  }
  for (let y = 0; y < nh; y++) {
    borderAlphaSum += d[(y * nw) * nch + 3];
    borderAlphaSum += d[(y * nw + nw - 1) * nch + 3];
  }
  console.log('Border alpha sum on cleaned Balerion:', borderAlphaSum, '(0 means 100% clean transparent perimeter!)');
}

testCleanBalerion();
