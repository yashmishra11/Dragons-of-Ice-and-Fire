const sharp = require('sharp');

async function testPixels() {
  const raw = await sharp('public/dragons/clean/2.webp').raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's sample a grid of points inside the box (x=100, y=100), (x=200, y=100), etc.
  for (let y = 60; y < 400; y += 60) {
    for (let x = 60; x < 650; x += 100) {
      const idx = (y * w + x) * ch;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      console.log(`(${x}, ${y}): rgba(${r}, ${g}, ${b}, ${a})`);
    }
  }
}

testPixels();
