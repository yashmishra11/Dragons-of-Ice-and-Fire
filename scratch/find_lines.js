const sharp = require('sharp');

async function findLines() {
  const refPath = 'public/map/westeros-outline.png';
  const img = sharp(refPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's find pixels where luminance is very low or dark outlines:
  let darkPixels = [];
  for (let y = 100; y < 900; y += 50) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 110) {
        darkPixels.push({ x, y, r, g, b, lum });
      }
    }
  }
  console.log(`Found ${darkPixels.length} sample dark line pixels. First 10:`, darkPixels.slice(0, 10));
}

findLines();
