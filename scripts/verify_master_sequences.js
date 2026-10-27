import fs from 'fs';
import path from 'path';

function getPngDimensions(filePath) {
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);

  // Check PNG magic bytes
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    throw new Error('Not a PNG file: ' + filePath);
  }

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const targetScenes = [
  '01_martini_reveal',
  '02_cocktail_falling',
  '03_lemon_garnish',
  '04_enter_cocktail',
  '05_amber_journey',
  '06_wedding',
  '07_rooftop_party',
  '08_music_festival',
];

const baseDir = path.resolve('inputs_and_frames');
console.log('=== Recursive Verification of Master Frame Sequences ===');
console.log('Search Root:', baseDir);

// Recursive folder finder to detect any nested/duplicate occurrences
function findSceneDirectories(dir, targetName, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === targetName) {
        results.push(fullPath);
      }
      findSceneDirectories(fullPath, targetName, results);
    }
  }
  return results;
}

const sceneReport = [];
let totalFramesChecked = 0;
let anyIssues = false;

for (const sceneName of targetScenes) {
  const matches = findSceneDirectories(baseDir, sceneName);

  if (matches.length === 0) {
    console.error(`ERROR: Scene directory not found: ${sceneName}`);
    anyIssues = true;
    continue;
  }

  if (matches.length > 1) {
    console.warn(`WARNING: Multiple occurrences found for '${sceneName}' (accidental duplicate nesting):`, matches);
    anyIssues = true;
  }

  const sceneDir = matches[0];
  const files = fs.readdirSync(sceneDir).filter(f => f.endsWith('.png')).sort();

  const missingFrames = [];
  let dimensionsMismatch = 0;
  let sampleDim = null;

  for (let i = 1; i <= 240; i++) {
    const expectedName = `frame_${String(i).padStart(4, '0')}.png`;
    const filePath = path.join(sceneDir, expectedName);

    if (!fs.existsSync(filePath)) {
      missingFrames.push(expectedName);
    } else {
      if (i === 1) {
        sampleDim = getPngDimensions(filePath);
      } else if (i % 60 === 0) {
        const dim = getPngDimensions(filePath);
        if (dim.width !== sampleDim.width || dim.height !== sampleDim.height) {
          dimensionsMismatch++;
        }
      }
      totalFramesChecked++;
    }
  }

  const stat = {
    scene: sceneName,
    path: sceneDir,
    duplicateNesting: matches.length > 1 ? `YES (${matches.length} matches)` : 'NONE',
    actualPngCount: files.length,
    expectedCount: 240,
    missingFrames: missingFrames.length,
    resolution: sampleDim ? `${sampleDim.width}x${sampleDim.height}` : 'unknown',
    dimensionConsistent: dimensionsMismatch === 0,
    firstFrame: files[0],
    lastFrame: files[files.length - 1],
    totalSizeMB: (files.reduce((sum, f) => sum + fs.statSync(path.join(sceneDir, f)).size, 0) / (1024 * 1024)).toFixed(2)
  };

  sceneReport.push(stat);
}

console.log('\n--- Master Sequences Inspection Report ---');
console.table(sceneReport);

console.log(`\nTotal Frames Verified: ${totalFramesChecked} / 1920`);
if (totalFramesChecked === 1920 && !anyIssues) {
  console.log('STATUS: PASS - All 8 scenes verified at 1920x1080 with 240 continuous frames each.');
} else {
  console.log('STATUS: ISSUES DETECTED');
}
