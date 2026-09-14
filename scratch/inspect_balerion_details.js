const sharp = require('sharp');
const https = require('https');

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

async function inspect() {
  const buf = await download('https://i.ibb.co/hxQtnS1d/Balerion.png');
  const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's print the first 20 pixels of row 0
  console.log('Row 0 (first 10 pixels):');
  for (let x = 0; x < 10; x++) {
    const idx = x * ch;
    console.log(` (${x},0): [${data[idx]}, ${data[idx+1]}, ${data[idx+2]}, ${data[idx+3]}]`);
  }
}

inspect();
