const sharp = require('sharp');
const fs = require('fs');

async function generateUltraThinOutlineMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const outputPath = 'public/map/westeros-ultra-sharp.webp';

  console.log('Generating perfected Westeros outline map...');

  // Original is 371 x 1024.
  // Resample smoothly to 560 x 5350 using Lanczos3
  const targetW = 560;
  const targetH = 5350;

  const upscaled = await sharp(inputPath)
    .resize(targetW, targetH, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaled;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Ocean classifier:
  // In the reference image, the sea is blue-cyan: (b - r > 20 && b > 110)
  function isOcean(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return true;
    const idx = (y * w + x) * ch;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return (b - r > 22 && b > 105);
  }

  function getLuminance(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return 255;
    const idx = (y * w + x) * ch;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Precompute ocean distance/mask
  const oceanMask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      oceanMask[y * w + x] = isOcean(x, y) ? 1 : 0;
    }
  }

  // Intermediate buffer for line strengths
  // Float32Array to compute smooth continuous edges
  const lineStrength = new Float32Array(w * h);
  const isInternal = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const isOcc = oceanMask[y * w + x] === 1;

      // 1. Coastline detection via exact ocean transition
      if (!isOcc) {
        let occCount = 0;
        let total = 0;
        // Check 3x3 box
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              total++;
              if (oceanMask[ny * w + nx] === 1) occCount++;
            }
          }
        }
        if (occCount > 0) {
          const ratio = occCount / total;
          // Clean continuous edge
          lineStrength[y * w + x] = Math.max(lineStrength[y * w + x], Math.sin(ratio * Math.PI));
        }
      }

      // 2. Internal kingdom borders and rivers:
      if (!isOcc && lineStrength[y * w + x] < 0.2) {
        const lum = getLuminance(x, y);
        // Laplacian / high-pass filter
        const surround = (
          getLuminance(x - 3, y) + getLuminance(x + 3, y) +
          getLuminance(x, y - 3) + getLuminance(x, y + 3) +
          getLuminance(x - 2, y - 2) + getLuminance(x + 2, y - 2) +
          getLuminance(x - 2, y + 2) + getLuminance(x + 2, y + 2)
        ) / 8;

        const delta = surround - lum;
        if (delta > 6 || lum < 130) {
          const strength = Math.min(1.0, Math.max(0.0, (delta - 4) / 14 + (135 - lum) / 90));
          if (strength > 0.25) {
            lineStrength[y * w + x] = strength;
            isInternal[y * w + x] = 1;
          }
        }
      }
    }
  }

  const out = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const strength = lineStrength[y * w + x];
      const internal = isInternal[y * w + x] === 1;

      if (strength > 0.15) {
        if (!internal) {
          // Luminous Gold Coastline (crisp, elegant, glowing)
          const alpha = Math.floor(Math.min(255, strength * 255));
          out[idx] = 250;     // R
          out[idx + 1] = 180; // G
          out[idx + 2] = 50;  // B
          out[idx + 3] = alpha;
        } else {
          // Warm Amber Kingdom Boundaries
          const alpha = Math.floor(Math.min(220, strength * 200));
          out[idx] = 225;     // R
          out[idx + 1] = 135; // G
          out[idx + 2] = 30;  // B
          out[idx + 3] = alpha;
        }
      } else {
        // Completely transparent
        out[idx] = 0;
        out[idx + 1] = 0;
        out[idx + 2] = 0;
        out[idx + 3] = 0;
      }
    }
  }

  // Save as WebP
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 }
  })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Generated: ${outputPath} (${w}x${h}, ${(stats.size / 1024).toFixed(1)} KB)`);
}

generateUltraThinOutlineMap().catch(console.error);
