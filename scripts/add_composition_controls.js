import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('src/content/scenes-manifest.json', 'utf-8'));

const compositionControls = {
  '01_martini_reveal': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.50, y: 0.52 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.0,
    transition: {
      type: 'shutter',
      frames: 2,
      color: 'rgba(2, 8, 9, 0.85)',
      description: 'Clean shutter cut to avoid double-stem ghosting with pouring stream'
    },
    knownLimitations: 'Centred martini glass; smoke expands outward; dark background'
  },
  '02_cocktail_falling': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.50, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.25,
    transition: {
      type: 'editorial-cut',
      frames: 2,
      color: 'rgba(2, 8, 9, 0.85)',
      description: 'Editorial cut when liquid settles to align with lemon garnish'
    },
    knownLimitations: 'Narrow liquid stream from top-centre; partial vessel at top y:0-12%'
  },
  '03_lemon_garnish': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.50, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.20,
    transition: {
      type: 'zoom-in',
      frames: 3,
      color: 'rgba(2, 8, 9, 0.90)',
      description: 'Zoom cut into liquid surface preparing for macro immersion'
    },
    knownLimitations: 'Lemon peel plunges into centre; glass rim slightly larger in scale'
  },
  '04_enter_cocktail': {
    fitMode: 'fullscreen-immersive',
    safeTextArea: 'none',
    focalPoint: { x: 0.50, y: 0.48 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.15,
    transition: {
      type: 'fluid-dissolve',
      frames: 3,
      color: 'rgba(192, 161, 107, 0.35)',
      description: 'Fluid continuity dissolve into internal micro-bubbles'
    },
    knownLimitations: 'Macro fluid meniscus; high refractive glare; no exterior glass structure'
  },
  '05_amber_journey': {
    fitMode: 'fullscreen-immersive',
    safeTextArea: 'none',
    focalPoint: { x: 0.50, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.25,
    transition: {
      type: 'cream-gold-pulse',
      frames: 4,
      color: 'rgba(241, 232, 216, 0.65)',
      description: 'Warm cream/gold pulse bridging amber liquid and wedding event lighting'
    },
    knownLimitations: 'Abstract macro golden liquid and bubbles; no physical glassware'
  },
  '06_wedding': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.52, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.05,
    transition: {
      type: 'editorial-cut',
      frames: 2,
      color: 'rgba(2, 8, 9, 0.85)',
      description: 'Clean editorial cut between warm wedding bar and rooftop twilight'
    },
    knownLimitations: 'Cocktail on decorated wedding bar; floral bokeh; warm ambient lighting'
  },
  '07_rooftop_party': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.50, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.05,
    transition: {
      type: 'editorial-cut',
      frames: 2,
      color: 'rgba(2, 8, 9, 0.85)',
      description: 'Clean editorial cut between twilight rooftop and concert stage lights'
    },
    knownLimitations: 'Cocktail held against sunset city skyline; distinct glass angle'
  },
  '08_music_festival': {
    fitMode: 'split-screen',
    safeTextArea: 'left-column',
    focalPoint: { x: 0.50, y: 0.50 },
    optionalCrop: null,
    trimRange: { start: 0, end: 239 },
    scrollWeight: 1.05,
    transition: {
      type: 'unpin-exit',
      frames: 0,
      description: 'Smooth scroll unpin transition into homepage #story overview'
    },
    knownLimitations: 'Outdoor concert crowd with dynamic stage lights; drink in foreground'
  }
};

for (const [id, ctrl] of Object.entries(compositionControls)) {
  if (manifest.scenes[id]) {
    Object.assign(manifest.scenes[id], ctrl);
  }
}

fs.writeFileSync('src/content/scenes-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Successfully updated src/content/scenes-manifest.json with composition controls and transition parameters.');
