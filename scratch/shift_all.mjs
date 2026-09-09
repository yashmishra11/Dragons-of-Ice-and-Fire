import fs from "fs";
import path from "path";

const filePath = path.resolve("data/dragons.json");
const rawData = fs.readFileSync(filePath, "utf-8");
const dragons = JSON.parse(rawData);

const SHIFT_OFFSET = 140;

const updatedDragons = dragons.map((dragon) => {
  if (dragon.id === "1") {
    return { ...dragon, top: 140 };
  }

  if (typeof dragon.top === "number") {
    return { ...dragon, top: dragon.top + SHIFT_OFFSET };
  } else if (typeof dragon.top === "string" && !isNaN(parseInt(dragon.top, 10))) {
    return { ...dragon, top: parseInt(dragon.top, 10) + SHIFT_OFFSET };
  }

  return dragon;
});

fs.writeFileSync(filePath, JSON.stringify(updatedDragons, null, 2), "utf-8");
console.log("Successfully shifted all dragon coordinates by +140px!");
