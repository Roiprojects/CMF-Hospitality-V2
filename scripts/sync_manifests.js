import fs from 'fs';
import path from 'path';

const scenesManifest = JSON.parse(fs.readFileSync('src/content/scenes-manifest.json', 'utf-8'));
const storyManifest = {};

for (const [id, s] of Object.entries(scenesManifest.scenes)) {
  storyManifest[id] = {
    folder: id,
    urlPrefix: `/frames/${id}/`,
    frameCount: s.frameCount,
    firstFrame: s.firstFrame,
    lastFrame: s.lastFrame,
    width: s.dimensions.standard.width,
    height: s.dimensions.standard.height,
    missingFrames: [],
    totalBytes: s.dimensions.standard.totalBytes
  };
}

fs.writeFileSync('src/content/story-manifest.json', JSON.stringify(storyManifest, null, 2));
console.log('Synchronized src/content/story-manifest.json with 8 scenes.');
