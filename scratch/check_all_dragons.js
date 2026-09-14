const sharp = require('sharp');
const https = require('https');
const dragons = require('../data/dragons.json');

async function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

async function checkAll() {
  for (const d of dragons) {
    try {
      const buf = await download(d.image);
      const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      const { data, info } = raw;
      const w = info.width;
      const h = info.height;
      const ch = info.channels;
      
      let cornerAlphas = [
        data[3],
        data[(w - 1) * ch + 3],
        data[((h - 1) * w) * ch + 3],
        data[((h - 1) * w + (w - 1)) * ch + 3]
      ];
      
      let edgeMaxAlpha = 0;
      // check perimeter
      for (let x = 0; x < w; x++) {
        edgeMaxAlpha = Math.max(edgeMaxAlpha, data[x * ch + 3]); // top row
        edgeMaxAlpha = Math.max(edgeMaxAlpha, data[((h - 1) * w + x) * ch + 3]); // bottom row
      }
      for (let y = 0; y < h; y++) {
        edgeMaxAlpha = Math.max(edgeMaxAlpha, data[(y * w) * ch + 3]); // left col
        edgeMaxAlpha = Math.max(edgeMaxAlpha, data[(y * w + w - 1) * ch + 3]); // right col
      }

      console.log(`${d.name.padEnd(18)}: size=${w}x${h}, cornerAlphas=[${cornerAlphas.join(',')}], edgeMaxAlpha=${edgeMaxAlpha}`);
    } catch (e) {
      console.log(`${d.name.padEnd(18)}: Error ${e.message}`);
    }
  }
}

checkAll();
