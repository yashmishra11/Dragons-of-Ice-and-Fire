const sharp = require('sharp');

async function checkBg() {
  for (const id of [3, 7]) {
    const raw = await sharp(`public/dragons/clean/${id}.webp`).raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    
    // Sample a few pixels from the corners (inside padding, e.g. x=20, y=20)
    const p1 = [data[(20*w + 20)*ch], data[(20*w + 20)*ch+1], data[(20*w + 20)*ch+2], data[(20*w + 20)*ch+3]];
    console.log(`Dragon ${id} sample (20,20):`, p1);
  }
}

checkBg();
