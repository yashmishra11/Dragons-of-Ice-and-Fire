import dragons from "../data/dragons.json" assert { type: "json" };

async function testUrls() {
  for (const d of dragons) {
    try {
      const res = await fetch(d.image, { method: "HEAD" });
      console.log(`${d.name} (${d.image}): ${res.status}`);
    } catch (err) {
      console.log(`${d.name} (${d.image}): ERROR ${err.message}`);
    }
  }
}

testUrls();
