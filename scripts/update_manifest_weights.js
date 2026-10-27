import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('src/content/scenes-manifest.json', 'utf-8'));

const weights = {
  '01_martini_reveal': 1.0,
  '02_cocktail_falling': 1.25,
  '03_lemon_garnish': 1.20,
  '04_enter_cocktail': 1.15,
  '05_amber_journey': 1.25,
  '06_wedding': 1.05,
  '07_rooftop_party': 1.05,
  '08_music_festival': 1.05
};

for (const [id, weight] of Object.entries(weights)) {
  if (manifest.scenes[id]) {
    manifest.scenes[id].scrollWeight = weight;
    if (!manifest.scenes[id].trimRange) {
      manifest.scenes[id].trimRange = { start: 0, end: 239 };
    }
  }
}

fs.writeFileSync('src/content/scenes-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Updated scenes-manifest.json with configurable scrollWeight and trimRange.');
