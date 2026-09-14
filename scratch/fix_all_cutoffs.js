const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function fixAllCutoffs() {
  const dir = 'public/dragons/clean';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileData = fs.readFileSync(filePath);
    const raw = await sharp(fileData).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;
    const w = info.width;
    const h = info.height;
    const ch = info.channels;

    // Find bounding box where alpha > 15
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * ch + 3] > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Check if bottom edge has a flat cut-off (many pixels touching maxY)
    let bottomTouches = 0;
    for (let x = minX; x <= maxX; x++) {
      if (data[(maxY * w + x) * ch + 3] > 25) bottomTouches++;
    }

    // If bottom touches is significant (more than 40 pixels wide), apply smooth fade
    let modified = false;
    if (bottomTouches > 35) {
      console.log(`${file}: bottom flat cutoff detected (${bottomTouches}px), applying smooth dissolve...`);
      const fadeH = 28;
      for (let y = maxY - fadeH; y <= maxY; y++) {
        if (y < 0) continue;
        const progress = (maxY - y) / fadeH;
        const mult = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * ch + 3;
          data[idx] = Math.floor(data[idx] * mult);
        }
      }
      modified = true;
    }

    if (modified) {
      const outBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
        .webp({ quality: 90, effort: 4 })
        .toBuffer();
      const tmp = filePath + '.tmp';
      fs.writeFileSync(tmp, outBuf);
      fs.renameSync(tmp, filePath);
    }
  }
  console.log('All flat cutoffs smoothed and dissolved!');
}

fixAllCutoffs();
