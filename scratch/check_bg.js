const sharp = require('sharp');

async function checkMap() {
  const { data, info } = await sharp('public/map/westeros-ultra-sharp.webp').raw().toBuffer({ resolveWithObject: true });
  console.log('westeros-ultra-sharp.webp:', info.width, 'x', info.height);
  for (const yf of [0.05, 0.15, 0.3, 0.5, 0.7, 0.85]) {
    const y = Math.floor(yf * info.height);
    let minX = info.width, maxX = 0;
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const a = data[idx + 3];
      // Check for coastline (gold) or land (not pure transparent)
      if (a > 100) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    console.log(`Y ${Math.round(yf*100)}%: X spans from ${minX} to ${maxX} (${((minX/info.width)*100).toFixed(1)}% to ${((maxX/info.width)*100).toFixed(1)}%)`);
  }
}

checkMap();
