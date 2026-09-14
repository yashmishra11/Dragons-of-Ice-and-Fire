const sharp = require('sharp');

async function checkBgJpeg() {
  const meta = await sharp('public/map/bg.jpeg').metadata();
  console.log('bg.jpeg metadata:', meta);
}

checkBgJpeg();
