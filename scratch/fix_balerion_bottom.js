const sharp = require('sharp');
const fs = require('fs');

async function fixBottomCutoff() {
  const filePath = 'public/dragons/clean/2.webp';
  const fileData = fs.readFileSync(filePath);
  const raw = await sharp(fileData).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  let lowestY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * ch + 3] > 20) {
        if (y > lowestY) lowestY = y;
      }
    }
  }

  const fadeH = 32;
  for (let y = lowestY - fadeH; y <= lowestY; y++) {
    if (y < 0) continue;
    const progress = (lowestY - y) / fadeH;
    const alphaMultiplier = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch + 3;
      data[idx] = Math.floor(data[idx] * alphaMultiplier);
    }
  }

  const outBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();

  const tempPath = 'public/dragons/clean/2_tmp.webp';
  fs.writeFileSync(tempPath, outBuf);
  try {
    fs.renameSync(tempPath, filePath);
    console.log('Renamed to 2.webp successfully!');
  } catch(e) {
    console.log('Rename failed, keeping 2_tmp.webp:', e.message);
  }
}

fixBottomCutoff();
