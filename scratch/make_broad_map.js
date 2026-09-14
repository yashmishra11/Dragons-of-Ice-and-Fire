const sharp = require('sharp');
const fs = require('fs');

async function makeBroadMagnificentMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const outputPath = 'public/map/westeros-ultra-sharp.webp';

  // Target canvas: 1600 x 5200 (Ratio: 0.3077, matching canonical 1272x4000 Westeros chart)
  const targetW = 1600;
  const targetH = 5200;

  console.log(`Generating broad, non-squeezed Westeros cartographic map at ${targetW}x${targetH}...`);

  // First resize original to target dimensions using high-order Lanczos3
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

  // Build ocean factor map & luminance map
  const oceanMask = new Float32Array(w * h);
  const lumMap = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const idx = i * ch;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    lumMap[i] = 0.299 * r + 0.587 * g + 0.114 * b;

    const diff = b - r;
    if (diff > 35 && b > 110) {
      oceanMask[i] = 1.0;
    } else if (diff < 12) {
      oceanMask[i] = 0.0;
    } else {
      oceanMask[i] = (diff - 12) / 23.0;
    }
  }

  // Compute distance/gradient from coast into ocean for delicate nautical ripple waves
  const out = Buffer.alloc(w * h * 4);

  console.log('Rendering anti-aliased coastlines, regional kingdom tones, and nautical wave contours...');

  for (let y = 0; y < h; y++) {
    const yTop = Math.max(0, y - 1);
    const yBot = Math.min(h - 1, y + 1);

    for (let x = 0; x < w; x++) {
      const xLeft = Math.max(0, x - 1);
      const xRight = Math.min(w - 1, x + 1);

      const centerIdx = y * w + x;
      const oceanCenter = oceanMask[centerIdx];
      const outIdx = centerIdx * 4;

      // Gradients for anti-aliasing
      const gx = (oceanMask[y * w + xRight] - oceanMask[y * w + xLeft]) * 0.5;
      const gy = (oceanMask[yBot * w + x] - oceanMask[yTop * w + x]) * 0.5;
      const coastGrad = Math.sqrt(gx * gx + gy * gy);

      const lx = (lumMap[y * w + xRight] - lumMap[y * w + xLeft]) * 0.5;
      const ly = (lumMap[yBot * w + x] - lumMap[yTop * w + x]) * 0.5;
      const lumGrad = Math.sqrt(lx * lx + ly * ly);

      // Smooth anti-aliased coastline intensity
      const coastAlpha = Math.min(1.0, Math.max(0.0, coastGrad * 4.5));
      const isInternal = lumGrad > 8.0 && oceanCenter < 0.35;
      const lineAlpha = isInternal ? Math.min(0.85, (lumGrad - 8.0) / 16.0) : 0.0;

      const r = data[centerIdx * ch];
      const g = data[centerIdx * ch + 1];
      const b = data[centerIdx * ch + 2];

      if (coastAlpha > 0.12) {
        // Anti-aliased radiant gold coastline
        out[outIdx] = 251;
        out[outIdx + 1] = 191;
        out[outIdx + 2] = 36;
        out[outIdx + 3] = Math.round(coastAlpha * 255 * (1.0 - oceanCenter * 0.35));
      } else if (lineAlpha > 0.12) {
        // Anti-aliased internal kingdom border
        out[outIdx] = 225;
        out[outIdx + 1] = 145;
        out[outIdx + 2] = 35;
        out[outIdx + 3] = Math.round(lineAlpha * 210);
      } else if (oceanCenter >= 0.95) {
        // Ocean waters: delicate, atmospheric deep sea shading so the map isn't an isolated floating bone!
        // Subtle nautical wave contour ripples based on distance to center
        const waveX = Math.sin(x * 0.04 + y * 0.015);
        const waveY = Math.cos(y * 0.035 - x * 0.01);
        const ripple = (waveX + waveY) * 0.5;

        // Very subtle oceanic tint (deep navy mist) that blends into #08070b
        if (ripple > 0.6) {
          out[outIdx] = 18;
          out[outIdx + 1] = 28;
          out[outIdx + 2] = 45;
          out[outIdx + 3] = 40; // Extremely subtle wave ripple
        } else {
          out[outIdx] = 12;
          out[outIdx + 1] = 16;
          out[outIdx + 2] = 26;
          out[outIdx + 3] = 25; // Transparent deep sea tint
        }
      } else {
        // Landmass regional tints
        const isBeyondWall = (r > 225 && g > 225 && b > 220 && y < h * 0.17);
        const isDorne = (r > 200 && g > 170 && b < 160 && y > h * 0.85);
        const isNorth = (y >= h * 0.17 && y < h * 0.44);

        if (isBeyondWall) {
          out[outIdx] = 42;
          out[outIdx + 1] = 56;
          out[outIdx + 2] = 78;
          out[outIdx + 3] = 180;
        } else if (isDorne) {
          out[outIdx] = 58;
          out[outIdx + 1] = 42;
          out[outIdx + 2] = 26;
          out[outIdx + 3] = 180;
        } else if (isNorth) {
          out[outIdx] = 30;
          out[outIdx + 1] = 42;
          out[outIdx + 2] = 34;
          out[outIdx + 3] = 180;
        } else {
          out[outIdx] = 34;
          out[outIdx + 1] = 38;
          out[outIdx + 2] = 32;
          out[outIdx + 3] = 180;
        }
      }
    }
  }

  // Save to WebP
  await sharp(out, {
    raw: { width: w, height: h, channels: 4 }
  })
    .webp({ quality: 92, effort: 5 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Saved broad magnificent map to ${outputPath} (${w}x${h}, ${(stats.size / 1024).toFixed(1)} KB)`);
}

makeBroadMagnificentMap().catch(console.error);
