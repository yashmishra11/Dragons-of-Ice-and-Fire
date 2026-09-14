const sharp = require('sharp');
const fs = require('fs');

async function processHighDetail() {
  const { data, info } = await sharp('public/map/westeros-outline.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Helper to check if a pixel is ocean
  function isOcean(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return true;
    const idx = (y * w + x) * ch;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return (b > r + 30 && b > 115);
  }

  function getBrightness(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    const idx = (y * w + x) * ch;
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }

  const out = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const oceanCurrent = isOcean(x, y);

      if (oceanCurrent) {
        // Transparent ocean so website dark background shows seamlessly
        out[idx] = 8;
        out[idx + 1] = 7;
        out[idx + 2] = 11;
        out[idx + 3] = 0;
        continue;
      }

      // Check if it's a coastline edge (adjacent to ocean)
      const isCoast = isOcean(x-1, y) || isOcean(x+1, y) || isOcean(x, y-1) || isOcean(x, y+1)
                   || isOcean(x-1, y-1) || isOcean(x+1, y-1) || isOcean(x-1, y+1) || isOcean(x+1, y+1);

      // Check local darkness for internal border lines & rivers
      const centerBr = (r + g + b) / 3;
      const avgNeighborBr = (
        getBrightness(x-2, y) + getBrightness(x+2, y) +
        getBrightness(x, y-2) + getBrightness(x, y+2)
      ) / 4;

      const isLine = (avgNeighborBr - centerBr) > 16 || centerBr < 118;

      if (isCoast) {
        // Coastline: Glowing Amber/Gold (#f59e0b)
        out[idx] = 245;
        out[idx + 1] = 158;
        out[idx + 2] = 11;
        out[idx + 3] = 255;
      } else if (isLine) {
        // Internal regional borders & rivers: Warm Gold (#d97706)
        out[idx] = 217;
        out[idx + 1] = 119;
        out[idx + 2] = 6;
        out[idx + 3] = 240;
      } else {
        // Regional Fills
        const isWhiteBeyondWall = (r > 235 && g > 235 && b > 230 && y < h * 0.18);
        const isDorneYellow = (r > 215 && g > 180 && b < 165 && y > h * 0.85);

        if (isWhiteBeyondWall) {
          // Beyond the Wall: Frosted cool ice slate (#222d3d)
          out[idx] = 34;
          out[idx + 1] = 45;
          out[idx + 2] = 61;
          out[idx + 3] = 240;
        } else if (isDorneYellow) {
          // Dorne: Warm Desert Sandstone (#33261a)
          out[idx] = 51;
          out[idx + 1] = 38;
          out[idx + 2] = 26;
          out[idx + 3] = 240;
        } else {
          // The Seven Kingdoms: Rich Antique Slate/Moss (#1c231f)
          out[idx] = 28;
          out[idx + 1] = 35;
          out[idx + 2] = 31;
          out[idx + 3] = 235;
        }
      }
    }
  }

  // Upscale to crisp 1272 x 5350 and save as WebP
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 }
  })
    .resize(1272, 5350, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .webp({ quality: 90, effort: 6 })
    .toFile('public/map/westeros-detailed-outline.webp');

  const stats = fs.statSync('public/map/westeros-detailed-outline.webp');
  console.log('High-detail map generated successfully!');
  console.log('Output size:', (stats.size / 1024).toFixed(1), 'KB');
}

processHighDetail().catch(console.error);
