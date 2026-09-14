const sharp = require('sharp');
const fs = require('fs');

async function makeSlenderUltraSharpMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const outputPath = 'public/map/westeros-ultra-sharp.webp';

  // 1. Resample original to slender 560 x 5350 using Lanczos3
  // This makes the continent ultra-thin horizontally and spans full vertical map height!
  const upscaledBuffer = await sharp(inputPath)
    .resize(560, 5350, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaledBuffer;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  const out = Buffer.alloc(w * h * 4);

  function getOceanFactor(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 1.0;
    const idx = (y * w + x) * ch;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const diff = b - r;
    if (diff > 40 && b > 120) return 1.0;
    if (diff < 15) return 0.0;
    return (diff - 15) / 25;
  }

  function getLuminance(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 255;
    const idx = (y * w + x) * ch;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const oceanFactor = getOceanFactor(x, y);

      if (oceanFactor >= 0.92) {
        // Completely transparent ocean so dark website background shows
        out[idx] = 8;
        out[idx + 1] = 7;
        out[idx + 2] = 11;
        out[idx + 3] = 0;
        continue;
      }

      // Coastline edge detection via neighborhood ocean difference
      const neighborOceanAvg = (
        getOceanFactor(x - 2, y) + getOceanFactor(x + 2, y) +
        getOceanFactor(x, y - 2) + getOceanFactor(x, y + 2) +
        getOceanFactor(x - 1, y - 1) + getOceanFactor(x + 1, y - 1) +
        getOceanFactor(x - 1, y + 1) + getOceanFactor(x + 1, y + 1)
      ) / 8;

      const isCoast = neighborOceanAvg > 0.10 && oceanFactor < 0.85;

      // Internal line detection via local high-pass
      const centerLum = getLuminance(x, y);
      const neighborLumAvg = (
        getLuminance(x - 3, y) + getLuminance(x + 3, y) +
        getLuminance(x, y - 3) + getLuminance(x, y + 3)
      ) / 4;

      const lineStrength = neighborLumAvg - centerLum;
      const isInternalLine = lineStrength > 12 || centerLum < 120;

      if (isCoast) {
        // Razor-sharp glowing amber gold coastline
        out[idx] = 245;
        out[idx + 1] = 166;
        out[idx + 2] = 35;
        out[idx + 3] = 250;
      } else if (isInternalLine) {
        // Warm gold regional kingdom borders
        out[idx] = 217;
        out[idx + 1] = 125;
        out[idx + 2] = 18;
        out[idx + 3] = 230;
      } else {
        // Subtle dark fantasy regional landmasses
        const isBeyondWall = (r > 230 && g > 230 && b > 225 && y < h * 0.17);
        const isDorne = (r > 210 && g > 175 && b < 160 && y > h * 0.86);

        if (isBeyondWall) {
          // Cool frosted dark slate
          out[idx] = 32;
          out[idx + 1] = 42;
          out[idx + 2] = 58;
          out[idx + 3] = 235;
        } else if (isDorne) {
          // Warm desert bronze
          out[idx] = 48;
          out[idx + 1] = 35;
          out[idx + 2] = 22;
          out[idx + 3] = 235;
        } else {
          // The Seven Kingdoms: rich muted antique moss-slate
          out[idx] = 24;
          out[idx + 1] = 30;
          out[idx + 2] = 26;
          out[idx + 3] = 230;
        }
      }
    }
  }

  // Save as high-quality WebP
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 }
  })
    .webp({ quality: 92, effort: 6 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log('Slender ultra-sharp map created:', outputPath);
  console.log('Dimensions:', w, 'x', h);
  console.log('Size:', (stats.size / 1024).toFixed(1), 'KB');
}

makeSlenderUltraSharpMap().catch(console.error);
