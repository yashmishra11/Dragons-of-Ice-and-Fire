const sharp = require('sharp');

async function inspectLines() {
  const { data, info } = await sharp('public/map/westeros-outline.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Let's sample horizontal slices through the regions to see line colors:
  // e.g. at y = 145 (The Wall area), y = 370 (Riverlands), y = 500, y = 800 (Dorne border)
  const sampleY = [145, 250, 370, 480, 580, 750, 850];

  for (const y of sampleY) {
    let minBrightness = 255;
    let minPixel = null;
    let minX = 0;

    for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const br = (r + g + b) / 3;

      if (br < minBrightness) {
        minBrightness = br;
        minPixel = [r, g, b];
        minX = x;
      }
    }
    console.log(`y=${y}: Min brightness = ${minBrightness} at x=${minX}:`, minPixel);
  }
}

inspectLines().catch(console.error);
