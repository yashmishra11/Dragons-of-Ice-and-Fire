const sharp = require('sharp');

async function check1() {
  const raw = await sharp('public/dragons/clean/1.webp').raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  console.log(`1.webp: ${w}x${h}`);

  // Let's find minX, maxX, minY, maxY where alpha > 0
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * ch + 3];
      if (a > 5) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Alpha > 5 BBox: x=[${minX}, ${maxX}] (w=${w}), y=[${minY}, ${maxY}] (h=${h})`);
}

check1();
