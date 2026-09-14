const sharp = require('sharp');
const fs = require('fs');

async function testPipeline() {
  const inputPath = 'public/map/westeros-outline.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;  // 371
  const h = info.height; // 1024
  const ch = info.channels;

  // Let's create a line map on the original resolution
  const lineBuf = Buffer.alloc(w * h * 4);

  function isOcean(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return true;
    const idx = (y * w + x) * ch;
    return (data[idx + 2] - data[idx] > 20 && data[idx + 2] > 105);
  }

  function getLum(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 255;
    const idx = (y * w + x) * ch;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const ocean = isOcean(x, y);

      // Check coastline
      let isCoast = false;
      if (!ocean) {
        // Any adjacent ocean pixel?
        if (isOcean(x - 1, y) || isOcean(x + 1, y) || isOcean(x, y - 1) || isOcean(x, y + 1) ||
            isOcean(x - 1, y - 1) || isOcean(x + 1, y - 1) || isOcean(x - 1, y + 1) || isOcean(x + 1, y + 1)) {
          isCoast = true;
        }
      }

      // Check internal line
      let isInternal = false;
      if (!ocean && !isCoast) {
        const lum = getLum(x, y);
        // Surrounding lum
        const surr = (getLum(x - 2, y) + getLum(x + 2, y) + getLum(x, y - 2) + getLum(x, y + 2)) / 4;
        if (surr - lum > 8 || lum < 135) {
          isInternal = true;
        }
      }

      if (isCoast) {
        lineBuf[idx] = 250;     // R
        lineBuf[idx + 1] = 185; // G
        lineBuf[idx + 2] = 55;  // B
        lineBuf[idx + 3] = 255; // Alpha
      } else if (isInternal) {
        lineBuf[idx] = 220;     // R
        lineBuf[idx + 1] = 140; // G
        lineBuf[idx + 2] = 35;  // B
        lineBuf[idx + 3] = 230; // Alpha
      } else {
        lineBuf[idx] = 0;
        lineBuf[idx + 1] = 0;
        lineBuf[idx + 2] = 0;
        lineBuf[idx + 3] = 0;
      }
    }
  }

  // Now upscale this pure line map directly to 560 x 5350!
  await sharp(lineBuf, { raw: { width: w, height: h, channels: 4 } })
    .resize(560, 5350, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .webp({ quality: 95, effort: 6 })
    .toFile('public/map/westeros-ultra-sharp.webp');

  console.log('Processed and upscaled cleanly to public/map/westeros-ultra-sharp.webp');
}

testPipeline();
