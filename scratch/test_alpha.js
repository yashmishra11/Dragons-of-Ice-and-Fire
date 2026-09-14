const sharp = require('sharp');
const https = require('https');

async function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

async function testImages() {
  const testUrls = [
    { name: 'Arrax', url: 'https://i.ibb.co/gn0Nqvk/Arrax.png' },
    { name: 'Balerion', url: 'https://i.ibb.co/hxQtnS1d/Balerion.png' },
    { name: 'Caraxes', url: 'https://i.ibb.co/QF2FvFvr/Caraxes.png' },
    { name: 'Cannibal', url: 'https://i.ibb.co/YY84rkz/Cannibal.png' }
  ];

  for (const item of testUrls) {
    try {
      const buf = await download(item.url);
      const meta = await sharp(buf).metadata();
      console.log(`${item.name}: format=${meta.format}, channels=${meta.channels}, hasAlpha=${meta.hasAlpha}, size=${meta.width}x${meta.height}`);
      
      // Sample border pixels to see if edges are 100% transparent alpha=0
      const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      const { data, info } = raw;
      const w = info.width;
      const h = info.height;
      const ch = info.channels;
      
      let cornerAlphas = [
        data[3], // top-left
        data[(w - 1) * ch + 3], // top-right
        data[((h - 1) * w) * ch + 3], // bottom-left
        data[((h - 1) * w + (w - 1)) * ch + 3] // bottom-right
      ];
      console.log(`  Corner alphas: [${cornerAlphas.join(', ')}]`);
    } catch (e) {
      console.error(`Error testing ${item.name}:`, e.message);
    }
  }
}

testImages();
