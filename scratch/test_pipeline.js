const sharp = require('sharp');
const fs = require('fs');

async function generateNaturalOutlineMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;  // 371
  const h = info.height; // 1024
  const ch = info.channels;

  // Function to check if a pixel in the original image is ocean
  function isOcean(x, y) {
    // IMPORTANT: Out-of-bounds is NOT ocean! Do NOT draw artificial canvas border lines!
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const idx = (y * w + x) * ch;
    // Blue sea: (b - r > 20 && b > 105)
    return (data[idx + 2] - data[idx] > 20 && data[idx + 2] > 105);
  }

  function getLum(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 255;
    const idx = (y * w + x) * ch;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  const lineBuf = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const ocean = isOcean(x, y);

      // 1. Coastline: A land pixel adjacent to an actual ocean pixel
      let isCoast = false;
      if (!ocean) {
        // Only trigger if an actual valid within-bounds ocean pixel is adjacent
        if (isOcean(x - 1, y) || isOcean(x + 1, y) || isOcean(x, y - 1) || isOcean(x, y + 1) ||
            isOcean(x - 1, y - 1) || isOcean(x + 1, y - 1) || isOcean(x - 1, y + 1) || isOcean(x + 1, y + 1)) {
          // Exclude the very top border (y < 4) to avoid flat cut line
          if (y >= 4) {
            isCoast = true;
          }
        }
      }

      // 2. Internal kingdom borders and rivers:
      let isInternal = false;
      if (!ocean && !isCoast) {
        const lum = getLum(x, y);
        const surr = (getLum(x - 2, y) + getLum(x + 2, y) + getLum(x, y - 2) + getLum(x, y + 2)) / 4;
        if (surr - lum > 7 || lum < 135) {
          isInternal = true;
        }
      }

      if (isCoast) {
        // Fade top 20px smoothly so the far north doesn't end abruptly
        const topFade = y < 25 ? (y / 25) : 1.0;
        lineBuf[idx] = 250;     // R
        lineBuf[idx + 1] = 185; // G
        lineBuf[idx + 2] = 55;  // B
        lineBuf[idx + 3] = Math.floor(255 * topFade); // Alpha
      } else if (isInternal) {
        const topFade = y < 25 ? (y / 25) : 1.0;
        lineBuf[idx] = 225;     // R
        lineBuf[idx + 1] = 140; // G
        lineBuf[idx + 2] = 35;  // B
        lineBuf[idx + 3] = Math.floor(225 * topFade); // Alpha
      } else {
        lineBuf[idx] = 0;
        lineBuf[idx + 1] = 0;
        lineBuf[idx + 2] = 0;
        lineBuf[idx + 3] = 0;
      }
    }
  }

  // Upscale cleanly to 560 x 5350 using Lanczos3
  const outBuf = await sharp(lineBuf, { raw: { width: w, height: h, channels: 4 } })
    .resize(560, 5350, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .webp({ quality: 95, effort: 6 })
    .toBuffer();

  const targetFile = 'public/map/westeros-ultra-sharp.webp';
  fs.writeFileSync(targetFile, outBuf);
  console.log('Saved perfected natural Westeros outline to:', targetFile);
}

generateNaturalOutlineMap();
