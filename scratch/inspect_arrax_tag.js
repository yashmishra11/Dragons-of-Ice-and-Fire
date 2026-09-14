const http = require('http');

http.get('http://localhost:3000', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // Find the img tag for Arrax
    const match = html.match(/<img[^>]*alt="Arrax"[^>]*>/);
    console.log('Arrax img tag:', match ? match[0] : 'not found');
  });
});
