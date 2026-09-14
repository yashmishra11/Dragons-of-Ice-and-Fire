const sharp = require('sharp');

async function analyze() {
  const { data, info } = await sharp('public/map/westeros-outline.png')
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const w = info.width;
  const h = info.height;
  const rows = [0.05, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95];

  console.log('Total image dimensions:', w, 'x', h);
  rows.forEach(yf => {
    const y = Math.floor(yf * h);
    let minX = w, maxX = 0;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Land has lower blue compared to red/green
      if (b - r < 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    console.log(`Y ${Math.round(yf*100)}%: land X from ${((minX/w)*100).toFixed(1)}% to ${((maxX/w)*100).toFixed(1)}%`);
  });
}

analyze().catch(console.error);
