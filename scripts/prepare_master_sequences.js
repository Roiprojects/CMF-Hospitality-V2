import fs from 'fs';
import path from 'path';

const mapping = [
  { folder: '01_martini_reveal', sourceScene: 'Smoke_parting_around_martini_glass_1080p_20261026093807' },
  { folder: '02_cocktail_falling', sourceScene: 'Cocktail_falling_into_martini_glass_1080p_20261026093814' },
  { folder: '03_lemon_garnish', sourceScene: 'Lemon_garnish_falling_into_martini_1080p_20261026093819' },
  { folder: '04_enter_cocktail', sourceScene: 'Camera_moving_into_amber_cocktail_1080p_20261026093826' },
  { folder: '05_amber_journey', sourceScene: 'Camera_gliding_through_amber_liquid_1080p_20261026093838' },
  { folder: '06_wedding', sourceScene: 'Cocktail_on_bar_at_wedding_1080p_20261026093845' },
  { folder: '07_rooftop_party', sourceScene: 'Cocktail_on_rooftop_party_1080p_20261026093855' },
  { folder: '08_music_festival', sourceScene: 'Cocktail_at_outdoor_music_festival_1080p_20261026093901' },
];

const extractedDir = path.resolve('BarChef_Extracted_Frames/scenes');
const inputsDir = path.resolve('inputs_and_frames');

console.log('=== Preparing Master Frame Sequences in inputs_and_frames ===');

for (const item of mapping) {
  const srcScenePath = path.join(extractedDir, item.sourceScene);
  const destPath = path.join(inputsDir, item.folder);

  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  console.log(`Setting up ${item.folder}...`);

  for (let i = 0; i < 240; i++) {
    const srcFile = path.join(srcScenePath, `${String(i).padStart(4, '0')}.png`);
    const destFile = path.join(destPath, `frame_${String(i + 1).padStart(4, '0')}.png`);

    if (!fs.existsSync(destFile)) {
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
      } else {
        console.error(`Source file missing: ${srcFile}`);
      }
    }
  }
}

console.log('All master sequence directories populated in inputs_and_frames.');
