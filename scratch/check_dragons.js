const sharp = require('sharp');
const https = require('https');
const dragons = require('../data/dragons.json');

console.log('Total dragons:', dragons.length);
for (const d of dragons) {
  console.log(`${d.id}: ${d.name} -> ${d.image}`);
}
