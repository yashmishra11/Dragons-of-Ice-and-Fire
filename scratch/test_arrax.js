const sharp = require('sharp');

async function testArrax() {
  const raw = await sharp('public/dragons/clean/1.webp').raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  console.log(`Arrax: ${w}x${h}`);

  // Let's sample the corners at (50, 50), (w-50, 50), (50, h-50), (w-50, h-50)
  console.log('Corner (50, 50):', [data[(50*w + 50)*ch], data[(50*w + 50)*ch+1], data[(50*w + 50)*ch+2], data[(50*w + 50)*ch+3]]);
  console.log('Corner (w-50, 50):', [data[(50*w + w-50)*ch], data[(50*w + w-50)*ch+1], data[(50*w + w-50)*ch+2], data[(50*w + w-50)*ch+3]]);
  console.log('Corner (50, h-50):', [data[((h-50)*w + 50)*ch], data[((h-50)*w + 50)*ch+1], data[((h-50)*w + 50)*ch+2], data[((h-50)*w + 50)*ch+3]]);
  console.log('Corner (w-50, h-50):', [data[((h-50)*w + w-50)*ch], data[((h-50)*w + w-50)*ch+1], data[((h-50)*w + w-50)*ch+2], data[((h-50)*w + w-50)*ch+3]]);

  // Also sample inside the original image: (100, 100)
  console.log('Inside (100, 100):', [data[(100*w + 100)*ch], data[(100*w + 100)*ch+1], data[(100*w + 100)*ch+2], data[(100*w + 100)*ch+3]]);
}

testArrax();
