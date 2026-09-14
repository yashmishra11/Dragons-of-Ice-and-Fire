const dragons = require('../data/dragons.json');

const FULL_MAP_HEIGHT = 5450;
const START_TOP = 35;
const CARD_HEIGHT = 270; // Worst-case with max scale 1.25x

// Calculate top positions with guaranteed minimum gap of 330px
const leftDragons = dragons.filter(d => d.side === 'left').sort((a, b) => Number(a.top) - Number(b.top));
const rightDragons = dragons.filter(d => d.side === 'right').sort((a, b) => Number(a.top) - Number(b.top));

function layoutSide(dList, startTop) {
  const result = [];
  let currentTop = startTop;
  for (let i = 0; i < dList.length; i++) {
    const d = dList[i];
    const rawTop = Number(d.top);
    // Target position mapped proportionally into [startTop, 5100]
    const targetTop = Math.round(startTop + ((rawTop - 140) / (5120 - 140)) * (5100 - startTop));
    // Ensure at least 330px from previous dragon
    const assignedTop = Math.max(targetTop, currentTop);
    result.push({
      ...d,
      assignedTop,
      cardBottom: assignedTop + CARD_HEIGHT
    });
    currentTop = assignedTop + 330;
  }
  return result;
}

const laidLeft = layoutSide(leftDragons, 35);
const laidRight = layoutSide(rightDragons, 110);

console.log(`=== LEFT SIDE (${laidLeft.length} dragons) ===`);
for (let i = 0; i < laidLeft.length; i++) {
  const cur = laidLeft[i];
  const prev = i > 0 ? laidLeft[i - 1] : null;
  const gap = prev ? cur.assignedTop - prev.assignedTop : null;
  const clearance = prev ? cur.assignedTop - prev.cardBottom : null;
  console.log(
    `${cur.name.padEnd(16)} top: ${String(cur.assignedTop).padStart(4)}px | bottom: ${String(cur.cardBottom).padStart(4)}px | gap: ${gap ? (gap + 'px').padStart(5) : '  N/A'} | clear air: ${clearance ? (clearance + 'px').padStart(5) : '  N/A'}`
  );
  if (clearance !== null && clearance < 60) {
    console.error(`  [WARNING] Clearance too small (${clearance}px) between ${prev.name} and ${cur.name}!`);
  }
}

console.log(`\n=== RIGHT SIDE (${laidRight.length} dragons) ===`);
for (let i = 0; i < laidRight.length; i++) {
  const cur = laidRight[i];
  const prev = i > 0 ? laidRight[i - 1] : null;
  const gap = prev ? cur.assignedTop - prev.assignedTop : null;
  const clearance = prev ? cur.assignedTop - prev.cardBottom : null;
  console.log(
    `${cur.name.padEnd(16)} top: ${String(cur.assignedTop).padStart(4)}px | bottom: ${String(cur.cardBottom).padStart(4)}px | gap: ${gap ? (gap + 'px').padStart(5) : '  N/A'} | clear air: ${clearance ? (clearance + 'px').padStart(5) : '  N/A'}`
  );
  if (clearance !== null && clearance < 60) {
    console.error(`  [WARNING] Clearance too small (${clearance}px) between ${prev.name} and ${cur.name}!`);
  }
}

console.log(`\nMax left bottom: ${laidLeft[laidLeft.length - 1].cardBottom}px (viserion)`);
console.log(`Max right bottom: ${laidRight[laidRight.length - 1].cardBottom}px (vhagar)`);
console.log(`Section height: ${FULL_MAP_HEIGHT}px (Remaining footer breathing room: ${FULL_MAP_HEIGHT - Math.max(laidLeft[laidLeft.length - 1].cardBottom, laidRight[laidRight.length - 1].cardBottom)}px)`);


