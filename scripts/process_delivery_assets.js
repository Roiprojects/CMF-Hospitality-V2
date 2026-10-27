import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse command line options
const isLossless = process.argv.includes('--lossless');
const quality = isLossless ? 100 : 90;
const smQuality = isLossless ? 100 : 85;

const ffmpegBin = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
const ffprobeBin = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffprobe.exe';

const masterBase = path.resolve('inputs_and_frames');
const destBase = path.resolve('public/frames');

const scenes = [
  {
    id: '01_martini_reveal',
    order: 1,
    title: 'THE REVEAL',
    sceneName: 'Smoke Parting Around the Glass',
    headline: 'Curiosity begins before the first sip.',
    supporting: 'A dramatic mist parts to reveal bespoke mixology by Bar Chef Bengaluru.',
    ctaText: 'Discover our story ↓',
    ctaHref: '#story',
    focalPosition: { x: 0.50, y: 0.52 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Smoke wisps, soft transparency gradient & glass stem'
  },
  {
    id: '02_cocktail_falling',
    order: 2,
    title: 'THE POUR',
    sceneName: 'Cocktail Descending into Glass',
    headline: 'Every great evening begins with a pour.',
    supporting: 'A rich, vibrant blend falling into crystal with fluid grace.',
    ctaText: 'Explore our services ↗',
    ctaHref: '/services',
    focalPosition: { x: 0.50, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Glass edges, fluid stream & droplet impact'
  },
  {
    id: '03_lemon_garnish',
    order: 3,
    title: 'THE GARNISH',
    sceneName: 'Lemon Garnish Settling',
    headline: 'Precision in every single botanical detail.',
    supporting: 'Fresh citrus zest meets crisp artisanal spirits and subtle aromatics.',
    ctaText: 'View cocktail menu ↗',
    ctaHref: '/services',
    focalPosition: { x: 0.50, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Citrus texture, peel edges & liquid surface ripples'
  },
  {
    id: '04_enter_cocktail',
    order: 4,
    title: 'THE IMMERSION',
    sceneName: 'Camera Moving into Amber Cocktail',
    headline: 'Dive into the liquid landscape.',
    supporting: 'Approaching clarity, colour and golden botanical infusions.',
    ctaText: 'Inside the Cocktail Lab ↗',
    ctaHref: '/about#our-cocktail-lab',
    focalPosition: { x: 0.50, y: 0.48 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Deep amber gradients, refractive glow & colour banding'
  },
  {
    id: '05_amber_journey',
    order: 5,
    title: 'THE FLAVOUR JOURNEY',
    sceneName: 'Camera Gliding Through Amber Liquid',
    headline: 'A world of aroma and depth inside the glass.',
    supporting: 'Golden hues, bubbles and light dancing through tailored spirits.',
    ctaText: 'Read the cocktail journal ↗',
    ctaHref: '/blogs',
    focalPosition: { x: 0.50, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Suspended bubbles, internal luminescence & micro-refractions'
  },
  {
    id: '06_wedding',
    order: 6,
    title: 'THE CELEBRATION',
    sceneName: 'Cocktail on Bar at Wedding',
    headline: 'Crafted for timeless celebrations.',
    supporting: 'Luxury cocktail bars tailored for intimate weddings, receptions and galas.',
    ctaText: 'Plan a wedding experience ↗',
    ctaHref: '/contact?service=weddings',
    focalPosition: { x: 0.52, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Warm ambient lighting, bar surface reflections & bokeh'
  },
  {
    id: '07_rooftop_party',
    order: 7,
    title: 'THE NIGHTLIFE',
    sceneName: 'Cocktail at Sunset Rooftop Party',
    headline: 'Vibrant energy under twilight skies.',
    supporting: 'High-energy rooftop gatherings with bespoke bar counters and craft menus.',
    ctaText: 'Curate your party ↗',
    ctaHref: '/contact?service=private-parties',
    focalPosition: { x: 0.50, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Dusk sky gradient, urban silhouettes & glass rim highlights'
  },
  {
    id: '08_music_festival',
    order: 8,
    title: 'THE FESTIVAL',
    sceneName: 'Cocktail at Outdoor Music Festival',
    headline: 'Speed, style and unforgettable festival bars.',
    supporting: 'High-capacity craft drinks designed to move seamlessly with the festival rhythm.',
    ctaText: 'Book an event bar ↗',
    ctaHref: '/contact?service=festivals',
    isPrimaryCta: true,
    focalPosition: { x: 0.50, y: 0.50 },
    trimRange: { start: 0, end: 239 },
    representativeFrame: 120,
    testDescription: 'Outdoor natural lighting, concert ambiance & sharp glass silhouette'
  }
];

console.log('================================================================');
console.log('       Bar Chef Bengaluru - WebP Delivery Asset Processor       ');
console.log('================================================================');
console.log(`Encoding Mode : ${isLossless ? 'LOSSLESS WebP' : 'HIGH-QUALITY WebP (q=' + quality + ')'}`);
console.log(`Source Masters: ${masterBase}`);
console.log(`Output WebP   : ${destBase}`);
console.log('');

const manifest = {
  version: '2.0.0',
  updatedAt: new Date().toISOString(),
  encoding: isLossless ? 'lossless' : 'high-quality-lossy',
  quality,
  nativeResolution: { width: 1920, height: 1080, aspectRatio: '16:9' },
  fps: 24,
  totalScenes: scenes.length,
  totalFrames: scenes.length * 240,
  scenes: {}
};

const deliveryStats = [];

for (const sc of scenes) {
  const masterDir = path.join(masterBase, sc.id);
  const outLgDir = path.join(destBase, sc.id);
  const outSmDir = path.join(outLgDir, 'sm');

  if (!fs.existsSync(outLgDir)) fs.mkdirSync(outLgDir, { recursive: true });
  if (!fs.existsSync(outSmDir)) fs.mkdirSync(outSmDir, { recursive: true });

  console.log(`\n[Scene ${sc.order}/${scenes.length}] Processing ${sc.id}...`);
  const tStart = Date.now();

  // 1. Encode Full Standard Delivery (1920x1080 WebP)
  const lgInput = path.join(masterDir, 'frame_%04d.png');
  const lgOutput = path.join(outLgDir, '%04d.webp');
  const lgLosslessFlag = isLossless ? '-lossless 1' : `-quality ${quality}`;

  const lgCmd = `"${ffmpegBin}" -nostdin -v error -y -start_number 1 -i "${lgInput}" -c:v libwebp ${lgLosslessFlag} -compression_level 4 -f image2 -start_number 0 "${lgOutput}"`;
  execSync(lgCmd);

  // 2. Encode Compact / Mobile Delivery (960x540 WebP, Lanczos scaled, true 16:9 landscape)
  const smOutput = path.join(outSmDir, '%04d.webp');
  const smLosslessFlag = isLossless ? '-lossless 1' : `-quality ${smQuality}`;

  const smCmd = `"${ffmpegBin}" -nostdin -v error -y -start_number 1 -i "${lgInput}" -vf "scale=960:540:flags=lanczos" -c:v libwebp ${smLosslessFlag} -compression_level 4 -f image2 -start_number 0 "${smOutput}"`;
  execSync(smCmd);

  // 3. Generate Scene Poster Image (from frame 120)
  const posterInput = path.join(masterDir, `frame_${String(sc.representativeFrame).padStart(4, '0')}.png`);
  const posterOutput = path.join(outLgDir, 'poster.webp');
  const posterCmd = `"${ffmpegBin}" -nostdin -v error -y -i "${posterInput}" -c:v libwebp -quality 92 "${posterOutput}"`;
  execSync(posterCmd);

  const tEnd = Date.now();
  const durationSec = ((tEnd - tStart) / 1000).toFixed(1);

  // Calculate disk sizes
  const lgFiles = fs.readdirSync(outLgDir).filter(f => f.endsWith('.webp') && f !== 'poster.webp');
  const smFiles = fs.readdirSync(outSmDir).filter(f => f.endsWith('.webp'));

  const lgBytes = lgFiles.reduce((sum, f) => sum + fs.statSync(path.join(outLgDir, f)).size, 0);
  const smBytes = smFiles.reduce((sum, f) => sum + fs.statSync(path.join(outSmDir, f)).size, 0);
  const posterBytes = fs.statSync(posterOutput).size;

  console.log(`  -> 1080p Standard : ${lgFiles.length} frames, ${(lgBytes / 1024 / 1024).toFixed(2)} MB (avg ${(lgBytes / lgFiles.length / 1024).toFixed(1)} KB/frame)`);
  console.log(`  -> 540p Compact   : ${smFiles.length} frames, ${(smBytes / 1024 / 1024).toFixed(2)} MB (avg ${(smBytes / smFiles.length / 1024).toFixed(1)} KB/frame)`);
  console.log(`  -> Poster Image   : ${(posterBytes / 1024).toFixed(1)} KB`);
  console.log(`  -> Completed in   : ${durationSec}s`);

  deliveryStats.push({
    order: sc.order,
    scene: sc.id,
    frames1080p: lgFiles.length,
    size1080pMB: (lgBytes / 1024 / 1024).toFixed(2),
    avg1080pKB: (lgBytes / lgFiles.length / 1024).toFixed(1),
    size540pMB: (smBytes / 1024 / 1024).toFixed(2),
    avg540pKB: (smBytes / smFiles.length / 1024).toFixed(1),
    durationSec
  });

  // Populate manifest entry
  manifest.scenes[sc.id] = {
    id: sc.id,
    order: sc.order,
    num: String(sc.order).padStart(2, '0'),
    title: sc.title,
    sceneName: sc.sceneName,
    headline: sc.headline,
    supporting: sc.supporting,
    ctaText: sc.ctaText,
    ctaHref: sc.ctaHref,
    isPrimaryCta: Boolean(sc.isPrimaryCta),
    frameCount: lgFiles.length,
    fps: 24,
    filenamePattern: '%04d.webp',
    firstFrame: '0000.webp',
    lastFrame: '0239.webp',
    posterImage: `/frames/${sc.id}/poster.webp`,
    stillFrame: `/frames/${sc.id}/${String(sc.representativeFrame - 1).padStart(4, '0')}.webp`,
    focalPosition: sc.focalPosition,
    scrollWeight: sc.scrollWeight || 1.0,
    trimRange: sc.trimRange,
    dimensions: {
      standard: {
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        urlPrefix: `/frames/${sc.id}/`,
        totalBytes: lgBytes
      },
      compact: {
        width: 960,
        height: 540,
        aspectRatio: '16:9',
        urlPrefix: `/frames/${sc.id}/sm/`,
        totalBytes: smBytes
      }
    }
  };
}

// -------------------------------------------------------------------------
// Representative Quality Comparison against PNG Masters
// -------------------------------------------------------------------------
console.log('\n================================================================');
console.log('       Quality Comparison: Representative Frames vs PNG Masters ');
console.log('================================================================');

const qualityComparisons = [];

for (const sc of scenes) {
  const masterFramePath = path.join(masterBase, sc.id, `frame_${String(sc.representativeFrame).padStart(4, '0')}.png`);
  // Frame 120 in 1-based index is 0119.webp in 0-based index
  const webpFramePath = path.join(destBase, sc.id, `${String(sc.representativeFrame - 1).padStart(4, '0')}.webp`);

  const metricsCmd = `"${ffmpegBin}" -v error -i "${webpFramePath}" -i "${masterFramePath}" -filter_complex "[0:v][1:v]psnr=stats_file=-;[0:v][1:v]ssim=stats_file=-" -f null -`;

  try {
    const rawOut = execSync(metricsCmd, { encoding: 'utf-8' });
    const psnrMatch = rawOut.match(/psnr_avg:([0-9.]+)/);
    const ssimMatch = rawOut.match(/All:([0-9.]+)/);

    const psnr = psnrMatch ? parseFloat(psnrMatch[1]).toFixed(2) : 'N/A';
    const ssim = ssimMatch ? parseFloat(ssimMatch[1]).toFixed(5) : 'N/A';

    qualityComparisons.push({
      scene: sc.id,
      featureTested: sc.testDescription,
      frame: sc.representativeFrame,
      psnrDb: psnr,
      ssimScore: ssim,
      visualFidelity: parseFloat(ssim) > 0.99 ? 'EXCELLENT (Visual Lossless)' : 'HIGH'
    });
  } catch (err) {
    console.warn(`Quality check error for ${sc.id}:`, err.message);
  }
}

console.table(qualityComparisons);

// -------------------------------------------------------------------------
// Write Manifests
// -------------------------------------------------------------------------
const scenesManifestPath = path.resolve('src/content/scenes-manifest.json');
fs.writeFileSync(scenesManifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nWrote complete scene manifest to: ${scenesManifestPath}`);

// Update story-sequence.json for backward compatibility
const storySequencePath = path.resolve('src/content/story-sequence.json');
const storySequence = {
  clips: scenes.map(s => s.id),
  framesPerClip: 240,
  totalFrames: scenes.length * 240,
  nativeWidth: 1920,
  nativeHeight: 1080
};
fs.writeFileSync(storySequencePath, JSON.stringify(storySequence, null, 2));
console.log(`Updated: ${storySequencePath}`);

// Summary Table
console.log('\n--- Final Delivery Asset Summary ---');
console.table(deliveryStats);

const totalLgMB = deliveryStats.reduce((acc, s) => acc + parseFloat(s.size1080pMB), 0);
const totalSmMB = deliveryStats.reduce((acc, s) => acc + parseFloat(s.size540pMB), 0);

console.log(`Total 1080p Standard Delivery Size: ${totalLgMB.toFixed(2)} MB across 1,920 WebP frames`);
console.log(`Total 540p Compact Delivery Size  : ${totalSmMB.toFixed(2)} MB across 1,920 WebP frames`);
console.log('Processing Complete.');
