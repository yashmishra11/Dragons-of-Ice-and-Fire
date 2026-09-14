const sharp = require('sharp');

async function testCropTop() {
  await sharp('public/map/westeros-ultra-sharp.webp')
    .extract({ left: 0, top: 0, width: 560, height: 800 })
    .png()
    .toFile('scratch/top_crop.png');
  console.log('Top cropped');
}

testCropTop();
