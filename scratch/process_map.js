const sharp = require('sharp');
const fs = require('fs');

async function processMap() {
  const inputPath = 'public/map/westeros-outline.png';
  const outputPath = 'public/map/westeros-dark-detailed.webp';

  // 1. Read input image and ensure 4-channel RGBA
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // New buffer for transformed image
  const outData = Buffer.alloc(width * height * channels);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const brightness = (r + g + b) / 3;
    const isBlueDominant = (b > r + 35) && (b > 120);

    // Border line detection: dark line or edge
    const isBorder = (brightness < 90);

    if (isBorder) {
      // Crisp amber-gold boundary lines and coastline borders
      outData[i] = 245;     // R
      outData[i + 1] = 158; // G (amber-500)
      outData[i + 2] = 11;  // B
      outData[i + 3] = 230; // Alpha
    } else if (isBlueDominant) {
      // Ocean: deep dark navy-charcoal blending with #08070b
      outData[i] = 8;
      outData[i + 1] = 7;
      outData[i + 2] = 11;
      outData[i + 3] = 0; // Transparent ocean so website background shows seamlessly
    } else {
      // Land: determine region by y-coordinate & color
      const yNorm = Math.floor(i / (width * channels)) / height;

      if (yNorm < 0.16) {
        // Beyond the Wall (Icy Cool Slate)
        outData[i] = 30;
        outData[i + 1] = 40;
        outData[i + 2] = 58;
        outData[i + 3] = 235;
      } else if (yNorm > 0.88) {
        // Dorne (Warm Desert Sandstone)
        outData[i] = 48;
        outData[i + 1] = 36;
        outData[i + 2] = 24;
        outData[i + 3] = 235;
      } else {
        // The North & Central Realms (Dark Antique Moss/Parchment)
        outData[i] = 24;
        outData[i + 1] = 30;
        outData[i + 2] = 26;
        outData[i + 3] = 230;
      }
    }
  }

  // 2. Upscale cleanly to high resolution (1272 x 3510) and save as high-quality WebP
  await sharp(outData, {
    raw: { width, height, channels: 4 }
  })
    .resize(1272, 3510, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .webp({ quality: 85, effort: 6 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log('Successfully created detailed dark map:', outputPath);
  console.log('File size:', (stats.size / 1024).toFixed(1), 'KB (was 2,123 KB originally!)');
}

processMap().catch(console.error);
