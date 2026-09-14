const sharp = require('sharp');

async function testCrop() {
  await sharp('public/map/westeros-ultra-sharp.webp')
    .extract({ left: 0, top: 2000, width: 560, height: 800 })
    .png()
    .toFile('scratch/outline_crop_sample.png');
  console.log('Sample cropped to scratch/outline_crop_sample.png');
}

testCrop();
