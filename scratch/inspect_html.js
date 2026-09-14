const http = require('http');

http.get('http://localhost:3000', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Find all img tags
    const imgMatches = html.match(/<img[^>]+>/g) || [];
    console.log('Total img tags rendered in HTML:', imgMatches.length);
    imgMatches.slice(0, 5).forEach((img, i) => console.log(`[${i}]`, img));
  });
});
