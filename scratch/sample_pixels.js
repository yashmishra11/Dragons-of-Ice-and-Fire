const sharp = require('sharp');
const fs = require('fs');

async function testExtraction() {
  const refPath = 'public/map/westeros-outline.png';
  const img = sharp(refPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's sample colors:
  // Ocean: around x=20, y=500
  // Land: around x=200, y=500
  // Border line: let's find dark pixels near coast and inside
  console.log(`Dimensions: ${w}x${h}`);
  
  function getPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return null;
    const idx = (y * w + x) * ch;
    return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  }

  console.log('Ocean (20, 500):', getPixel(20, 500));
  console.log('Land (200, 500):', getPixel(200, 500));
  console.log('Top (180, 50):', getPixel(180, 50));
  console.log('Bottom Dorne (200, 950):', getPixel(200, 950));
}

testExtraction();
