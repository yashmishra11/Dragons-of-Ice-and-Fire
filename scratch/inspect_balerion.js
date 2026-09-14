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

async function inspectBalerion() {
  const buf = await download('https://i.ibb.co/hxQtnS1d/Balerion.png');
  const img = sharp(buf);
  const meta = await img.metadata();
  console.log('Balerion meta:', meta);

  const raw = await img.raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's check non-zero alpha near the edges:
  let topRowNonZero = 0;
  for (let x = 0; x < w; x++) {
    if (data[x * ch + 3] > 0) topRowNonZero++;
  }
  let bottomRowNonZero = 0;
  for (let x = 0; x < w; x++) {
    if (data[((h-1)*w + x) * ch + 3] > 0) bottomRowNonZero++;
  }
  let leftColNonZero = 0;
  for (let y = 0; y < h; y++) {
    if (data[(y*w) * ch + 3] > 0) leftColNonZero++;
  }
  let rightColNonZero = 0;
  for (let y = 0; y < h; y++) {
    if (data[(y*w + w - 1) * ch + 3] > 0) rightColNonZero++;
  }

  console.log(`Balerion edge non-zeros: top=${topRowNonZero}/${w}, bottom=${bottomRowNonZero}/${w}, left=${leftColNonZero}/${h}, right=${rightColNonZero}/${h}`);

  // Let's check color of top-left pixel
  console.log('Pixel (0,0):', [data[0], data[1], data[2], data[3]]);
  console.log('Pixel (10,10):', [data[(10*w+10)*ch], data[(10*w+10)*ch+1], data[(10*w+10)*ch+2], data[(10*w+10)*ch+3]]);
}

inspectBalerion();
