const sharp = require('sharp');
const https = require('https');
const dragons = require('../data/dragons.json');
const FULL_MAP_HEIGHT = 5350;
const START_TOP = 25;
const maxDragonTop = FULL_MAP_HEIGHT - 360;

console.log('Total dragons:', dragons.length);
const computed = dragons.map(d => {
  const rawTop = Number(d.top);
  const topPosition = Math.round(START_TOP + ((rawTop - 140) / (5120 - 140)) * (maxDragonTop - START_TOP));
  return {
    id: d.id,
    name: d.name,
    side: d.side,
    rawTop,
    topPosition
  };
});

for (const side of ['left', 'right']) {
  console.log(`\n=== SIDE: ${side.toUpperCase()} ===`);
  const sideDragons = computed.filter(d => d.side === side).sort((a, b) => a.topPosition - b.topPosition);
  for (let i = 0; i < sideDragons.length; i++) {
    const cur = sideDragons[i];
    const prev = i > 0 ? sideDragons[i - 1] : null;
    const diff = prev ? cur.topPosition - prev.topPosition : 0;
    console.log(`${cur.name.padEnd(16)} top: ${String(cur.topPosition).padStart(5)}px  gap: ${diff ? (diff + 'px').padStart(7) : '    N/A'}`);
  }
}

