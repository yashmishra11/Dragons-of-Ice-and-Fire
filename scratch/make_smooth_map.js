const sharp = require('sharp');
const fs = require('fs');

async function makeAntiAliasedProportionalMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const outputPath = 'public/map/westeros-ultra-sharp.webp';

  // True natural proportions:
  // Original is 371 x 1024 (aspect ratio 0.3623, height/width 2.7601)
  // For width 1340, height is 1340 * 2.7601 = 3700!
  const targetW = 1340;
  const targetH = 3700;

  console.log(`Generating smooth anti-aliased map at natural proportions: ${targetW}x${targetH}...`);

  // Step 1: Upscale using Lanczos3
  const upscaledBuffer = await sharp(inputPath)
    .resize(targetW, targetH, {
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

  // Step 2: Extract ocean mask & luminance at full resolution
  const oceanMask = new Float32Array(w * h);
  const lumMap = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const idx = i * ch;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    lumMap[i] = 0.299 * r + 0.587 * g + 0.114 * b;

    // Ocean check based on blue dominance
    const diff = b - r;
    if (diff > 35 && b > 110) {
      oceanMask[i] = 1.0;
    } else if (diff < 12) {
      oceanMask[i] = 0.0;
    } else {
      oceanMask[i] = (diff - 12) / 23.0;
    }
  }

  const out = Buffer.alloc(w * h * 4);

  // Step 3: Compute Sobel-like gradient for smooth anti-aliased coastline & border rendering
  for (let y = 0; y < h; y++) {
    const yTop = Math.max(0, y - 1);
    const yBot = Math.min(h - 1, y + 1);

    for (let x = 0; x < w; x++) {
      const xLeft = Math.max(0, x - 1);
      const xRight = Math.min(w - 1, x + 1);

      const centerIdx = y * w + x;
      const oceanCenter = oceanMask[centerIdx];

      const outIdx = centerIdx * 4;

      if (oceanCenter >= 0.96) {
        // Pure ocean is 100% transparent
        out[outIdx] = 0;
        out[outIdx + 1] = 0;
        out[outIdx + 2] = 0;
        out[outIdx + 3] = 0;
        continue;
      }

      // Smooth gradient magnitude for coastline
      const gx = (oceanMask[y * w + xRight] - oceanMask[y * w + xLeft]) * 0.5;
      const gy = (oceanMask[yBot * w + x] - oceanMask[yTop * w + x]) * 0.5;
      const coastGrad = Math.sqrt(gx * gx + gy * gy);

      // Smooth gradient magnitude for internal borders
      const lx = (lumMap[y * w + xRight] - lumMap[y * w + xLeft]) * 0.5;
      const ly = (lumMap[yBot * w + x] - lumMap[yTop * w + x]) * 0.5;
      const lumGrad = Math.sqrt(lx * lx + ly * ly);

      // Coastline intensity (smooth anti-aliased falloff)
      const coastAlpha = Math.min(1.0, Math.max(0.0, coastGrad * 4.2));

      // Internal line intensity
      const isInternal = lumGrad > 8.0 && oceanCenter < 0.3;
      const lineAlpha = isInternal ? Math.min(0.85, (lumGrad - 8.0) / 18.0) : 0.0;

      const r = data[centerIdx * ch];
      const g = data[centerIdx * ch + 1];
      const b = data[centerIdx * ch + 2];

      if (coastAlpha > 0.15) {
        // Glowing gold coastline with anti-aliased alpha
        out[outIdx] = 251;
        out[outIdx + 1] = 191;
        out[outIdx + 2] = 36;
        out[outIdx + 3] = Math.round(coastAlpha * 255 * (1.0 - oceanCenter * 0.5));
      } else if (lineAlpha > 0.15) {
        // Kingdom border with anti-aliased alpha
        out[outIdx] = 225;
        out[outIdx + 1] = 145;
        out[outIdx + 2] = 35;
        out[outIdx + 3] = Math.round(lineAlpha * 220);
      } else {
        // Rich regional landmass shading with subtle semi-transparency
        const isBeyondWall = (r > 225 && g > 225 && b > 220 && y < h * 0.18);
        const isDorne = (r > 200 && g > 170 && b < 160 && y > h * 0.85);
        const isNorth = (y >= h * 0.18 && y < h * 0.45);

        if (isBeyondWall) {
          // Cool frosted mountain slate
          out[outIdx] = 38;
          out[outIdx + 1] = 50;
          out[outIdx + 2] = 68;
          out[outIdx + 3] = 160;
        } else if (isDorne) {
          // Warm desert bronze
          out[outIdx] = 52;
          out[outIdx + 1] = 38;
          out[outIdx + 2] = 24;
          out[outIdx + 3] = 160;
        } else if (isNorth) {
          // Muted northern pine moss
          out[outIdx] = 28;
          out[outIdx + 1] = 38;
          out[outIdx + 2] = 32;
          out[outIdx + 3] = 160;
        } else {
          // The Seven Kingdoms: rich antique bronze-slate
          out[outIdx] = 30;
          out[outIdx + 1] = 34;
          out[outIdx + 2] = 30;
          out[outIdx + 3] = 160;
        }
      }
    }
  }

  // Step 4: Write WebP
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 }
  })
    .webp({ quality: 92, effort: 5 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Saved smooth map to ${outputPath} (${w}x${h}, ${(stats.size/1024).toFixed(1)} KB)`);
}

makeAntiAliasedProportionalMap().catch(console.error);
