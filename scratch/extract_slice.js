const sharp = require('sharp');

async function extract() {
  await sharp('public/map/westeros-ultra-sharp.webp')
    .extract({ left: 0, top: 3500, width: 1484, height: 596 })
    .png()
    .toFile('scratch/bottom_slice.png');
  console.log('Saved scratch/bottom_slice.png');
}

extract().catch(console.error);
