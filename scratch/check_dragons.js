const dragons = require('../data/dragons.json');

for (const side of ['left', 'right']) {
  console.log(`\n--- ${side.toUpperCase()} ---`);
  const dList = dragons.filter(d => d.side === side).sort((a,b) => Number(a.top) - Number(b.top));
  dList.forEach((d, idx) => {
    const prev = idx > 0 ? dList[idx - 1] : null;
    const gap = prev ? Number(d.top) - Number(prev.top) : 0;
    console.log(`${d.id.padEnd(16)} ${d.name.padEnd(18)} rawTop: ${String(d.top).padStart(5)}  gap: ${gap ? (gap + 'px').padStart(6) : '   N/A'}`);
  });
}

