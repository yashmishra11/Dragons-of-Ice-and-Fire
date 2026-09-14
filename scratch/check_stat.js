const sharp = require('sharp');
const fs = require('fs');

const stat = fs.statSync('public/map/westeros-ultra-sharp.webp');
console.log('westeros-ultra-sharp.webp mtime:', stat.mtime);
console.log('size:', stat.size);
