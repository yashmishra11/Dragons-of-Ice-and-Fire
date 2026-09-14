const sharp = require('sharp');

async function inspectOriginalBg() {
  await sharp('public/map/bg.jpeg')
    .resize(600, 2000)
    .toFile('scratch/original_bg_small.jpg');
  console.log('Original bg resized to scratch/original_bg_small.jpg');
}

inspectOriginalBg();
