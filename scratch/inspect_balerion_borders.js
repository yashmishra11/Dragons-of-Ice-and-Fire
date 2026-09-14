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

  // Let's check where pixels have alpha > 10 in row 0, row h-1, col 0, col w-1
  const topNonZero = [];
  for (let x = 0; x < w; x++) {
    if (data[x * ch + 3] > 10) topNonZero.push(x);
  }
  const bottomNonZero = [];
  for (let x = 0; x < w; x++) {
    if (data[((h-1)*w + x) * ch + 3] > 10) bottomNonZero.push(x);
  }
  const leftNonZero = [];
  for (let y = 0; y < h; y++) {
    if (data[(y*w) * ch + 3] > 10) leftNonZero.push(y);
  }
  const rightNonZero = [];
  for (let y = 0; y < h; y++) {
    if (data[(y*w + w - 1) * ch + 3] > 10) rightNonZero.push(y);
  }

  console.log('Top border non-zero count:', topNonZero.length, 'indices:', topNonZero.slice(0, 10));
  console.log('Bottom border non-zero count:', bottomNonZero.length, 'indices:', bottomNonZero.slice(0, 10));
  console.log('Left border non-zero count:', leftNonZero.length, 'indices:', leftNonZero.slice(0, 10));
  console.log('Right border non-zero count:', rightNonZero.length, 'indices:', rightNonZero.slice(0, 10));
}

inspect();
