const sharp = require('sharp');

async function analyzeRef() {
  const refPath = 'public/map/westeros-outline.png';
  const meta = await sharp(refPath).metadata();
  console.log('Reference metadata:', meta);
}

analyzeRef();
