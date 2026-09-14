const sharp = require('sharp');

async function extract() {
  await sharp('public/map/westeros-ultra-sharp.webp')
    .extract({ left: 0, top: 1800, width: 1600, height: 1000 })
    .png()
    .toFile('C:/Users/mryas/.gemini/antigravity-ide/brain/a1253b04-3dec-4dd7-95e6-049bc4e16003/map_mid_slice.png');
  console.log('Saved map_mid_slice.png');
}

extract().catch(console.error);
