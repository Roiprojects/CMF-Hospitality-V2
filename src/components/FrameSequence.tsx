'use client';
import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import scenesManifest from '@/content/scenes-manifest.json';

interface FrameSequenceProps {
  progress: MutableRefObject<number>;
  onReady: (ready: boolean) => void;
  activeChapterRef: MutableRefObject<number>;
}

export interface SceneConfig {
  id: string;
  order: number;
  num: string;
  title: string;
  sceneName: string;
  headline: string;
  supporting: string;
  ctaText?: string;
  ctaHref?: string;
  isPrimaryCta?: boolean;
  scrollWeight: number;
  trimRange: { start: number; end: number };
  fitMode: string;
  safeTextArea: string;
  focalPoint: { x: number; y: number };
  transition: { type: string; frames: number; color?: string; description?: string };
  knownLimitations?: string;
  posterImage: string;
  stillFrame: string;
  startProgress: number;
  endProgress: number;
  frameCount: number;
}

// Compute deterministic progress intervals based on configurable scroll weights & trim ranges
export function getTimelineConfiguration(): { scenes: SceneConfig[]; totalWeight: number } {
  const rawScenes = Object.values(scenesManifest.scenes).sort((a, b) => a.order - b.order);
  const totalWeight = rawScenes.reduce((acc, s) => acc + (s.scrollWeight || 1.0), 0);

  let accumulated = 0;
  const scenes: SceneConfig[] = rawScenes.map((s, index) => {
    const weight = s.scrollWeight || 1.0;
    const startProgress = accumulated;
    accumulated += weight / totalWeight;
    const endProgress = index === rawScenes.length - 1 ? 1.0 : accumulated;

    const trimStart = Math.max(0, s.trimRange?.start ?? 0);
    const trimEnd = Math.min(239, s.trimRange?.end ?? 239);
    const frameCount = trimEnd - trimStart + 1;

    return {
      id: s.id,
      order: s.order,
      num: s.num,
      title: s.title,
      sceneName: s.sceneName,
      headline: s.headline,
      supporting: s.supporting,
      ctaText: s.ctaText,
      ctaHref: s.ctaHref,
      isPrimaryCta: s.isPrimaryCta,
      scrollWeight: weight,
      trimRange: { start: trimStart, end: trimEnd },
      fitMode: s.fitMode || 'split-screen',
      safeTextArea: s.safeTextArea || 'left-column',
      focalPoint: s.focalPoint || { x: 0.5, y: 0.5 },
      transition: s.transition || { type: 'shutter', frames: 2 },
      knownLimitations: (s as { knownLimitations?: string }).knownLimitations,
      posterImage: s.posterImage,
      stillFrame: s.stillFrame,
      startProgress,
      endProgress,
      frameCount
    };
  });

  return { scenes, totalWeight };
}

const { scenes: SCENE_TIMELINE } = getTimelineConfiguration();

// Memory bounds: strictly bounded cache to ensure ultra-smooth 60fps scrubbing
const MAX_LOADED_CACHE = 160;
const FORWARD_PRELOAD = 18;
const BACKWARD_PRELOAD = 8;
const MAX_CONCURRENT_REQUESTS = 8;

interface CacheEntry {
  key: string;
  sceneId: string;
  frameNum: number;
  img: HTMLImageElement;
  bitmap?: ImageBitmap;
  ready: boolean;
}

export default function FrameSequence({ progress, onReady, activeChapterRef }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let disposed = false;
    let rafId = 0;
    let lastTime = performance.now();

    // Animation state in mutable variables (zero React re-renders during 60fps scrub)
    let smoothedProgress = Math.min(1, Math.max(0, progress.current || 0));
    let lastDrawnKey = '';
    let lastRenderW = 0;
    let lastRenderH = 0;
    let scrollDirection: 1 | -1 = 1;
    let prevRawProgress = progress.current || 0;
    let initialPosterPainted = false;
    let mostRecentValidImage: HTMLImageElement | ImageBitmap | null = null;

    // Cache: Map<"${sceneId}_${frameNum}", CacheEntry>
    const cache = new Map<string, CacheEntry>();
    const inFlight = new Set<string>();
    const failedSet = new Set<string>();

    // Determine if scene has a compact 540p variant
    const hasCompactVariant = (sceneId: string): boolean => {
      const sceneData = (scenesManifest.scenes as Record<string, { dimensions?: { compact?: unknown } }>)[sceneId];
      return Boolean(sceneData?.dimensions?.compact);
    };

    // Check viewport width dynamically for responsive delivery variant
    const getFrameUrl = (sceneId: string, frameNum: number): string => {
      const compact = typeof window !== 'undefined' && window.innerWidth < 768;
      const sub = (compact && hasCompactVariant(sceneId)) ? 'sm/' : '';
      return `/frames/${sceneId}/${sub}${String(frameNum).padStart(4, '0')}.webp`;
    };

    // Deterministically map normalized progress (0.0 to 1.0) to (sceneIndex, frameNum)
    const mapProgressToSceneAndFrame = (p: number): { sceneIndex: number; scene: SceneConfig; frameNum: number } => {
      const clamped = Math.min(1, Math.max(0, p));
      let idx = 0;
      for (let i = 0; i < SCENE_TIMELINE.length; i++) {
        const sc = SCENE_TIMELINE[i];
        if (clamped >= sc.startProgress && clamped <= sc.endProgress) {
          idx = i;
          break;
        }
        if (i === SCENE_TIMELINE.length - 1 && clamped >= sc.startProgress) {
          idx = i;
        }
      }

      const sc = SCENE_TIMELINE[idx];
      const span = sc.endProgress - sc.startProgress;
      const localProgress = span > 0 ? Math.min(1, Math.max(0, (clamped - sc.startProgress) / span)) : 0;
      const frameNum = Math.round(sc.trimRange.start + localProgress * (sc.trimRange.end - sc.trimRange.start));

      return { sceneIndex: idx, scene: sc, frameNum };
    };

    // Resize canvas with correct 16:9 aspect ratio and sensible device-pixel-ratio cap
    const updateCanvasDimensions = () => {
      const rect = container.getBoundingClientRect();
      const containerW = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
      const containerH = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);

      // 16:9 contain aspect ratio
      const targetAspect = 16 / 9;
      let renderW = containerW;
      let renderH = containerW / targetAspect;

      if (renderH > containerH) {
        renderH = containerH;
        renderW = containerH * targetAspect;
      }

      // Sensible DPR cap at 2.0 to conserve mobile GPU / canvas memory
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      const bufferW = Math.max(320, Math.round(renderW * dpr));
      const bufferH = Math.max(180, Math.round(renderH * dpr));

      let resized = false;
      if (canvas.width !== bufferW || canvas.height !== bufferH) {
        canvas.width = bufferW;
        canvas.height = bufferH;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        resized = true;
        if (mostRecentValidImage) {
          ctx.drawImage(mostRecentValidImage, 0, 0, bufferW, bufferH);
        }
      }

      lastRenderW = renderW;
      lastRenderH = renderH;
      return resized;
    };

    // Draw frame onto canvas
    const drawImageToCanvas = (drawable: HTMLImageElement | ImageBitmap, key: string, scene: SceneConfig, frameNum: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      // Blit image
      ctx.drawImage(drawable, 0, 0, cw, ch);

      // Scene boundary transitions (editable in scenes-manifest.json, fully reversible with scroll)
      const trans = scene.transition;
      const transFrames = trans?.frames ?? 2;
      const trimStart = scene.trimRange.start;
      const trimEnd = scene.trimRange.end;

      const isStart = transFrames > 0 && frameNum <= trimStart + transFrames && scene.order > 1;
      const isEnd = transFrames > 0 && frameNum >= trimEnd - transFrames && scene.order < SCENE_TIMELINE.length;

      if (isStart || isEnd) {
        let t = 0;
        if (isEnd) {
          t = (frameNum - (trimEnd - transFrames)) / transFrames;
        } else {
          t = 1 - (frameNum - trimStart) / transFrames;
        }
        t = Math.min(1, Math.max(0, t));

        if (trans?.type === 'cream-gold-pulse' || (isStart && SCENE_TIMELINE[scene.order - 2]?.transition?.type === 'cream-gold-pulse')) {
          ctx.fillStyle = `rgba(241, 232, 216, ${(t * 0.70).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
          ctx.fillStyle = `rgba(192, 161, 107, ${(t * 0.35).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else if (trans?.type === 'fluid-dissolve') {
          ctx.fillStyle = `rgba(192, 161, 107, ${(t * 0.50).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          ctx.fillStyle = `rgba(2, 8, 9, ${(t * 0.85).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        }
      }

      lastDrawnKey = key;
      mostRecentValidImage = drawable;

      if (!initialPosterPainted) {
        initialPosterPainted = true;
        onReady(true);
        setStatus('');
      }
    };

    // Evict distant decoded images safely without network abort thrashing
    const evictDistantFrames = (targetSceneIdx: number, targetFrame: number) => {
      if (cache.size <= MAX_LOADED_CACHE) return;

      const entriesWithDistance: { key: string; distance: number; entry: CacheEntry }[] = [];

      for (const [key, entry] of cache.entries()) {
        if (inFlight.has(key)) continue; // Never evict in-flight requests
        const scIdx = SCENE_TIMELINE.findIndex(s => s.id === entry.sceneId);
        const sceneDistance = Math.abs(scIdx - targetSceneIdx);
        const frameDistance = Math.abs(entry.frameNum - targetFrame);
        const totalDist = sceneDistance * 300 + frameDistance;

        entriesWithDistance.push({ key, distance: totalDist, entry });
      }

      // Sort by furthest distance
      entriesWithDistance.sort((a, b) => b.distance - a.distance);

      while (cache.size > MAX_LOADED_CACHE && entriesWithDistance.length > 0) {
        const item = entriesWithDistance.shift();
        if (item && item.key !== lastDrawnKey && item.distance > 40) {
          item.entry.img.onload = null;
          item.entry.img.onerror = null;
          if (item.entry.bitmap) {
            try { item.entry.bitmap.close(); } catch {}
          }
          cache.delete(item.key);
        }
      }
    };

    // Preload a single frame with rock-solid onload and fallback handling
    const preloadSpecificFrame = (scene: SceneConfig, frameNum: number, priority = false): void => {
      const key = `${scene.id}_${frameNum}`;
      if (disposed || cache.has(key) || inFlight.has(key) || failedSet.has(key)) return;

      if (!priority && inFlight.size >= MAX_CONCURRENT_REQUESTS) return;

      inFlight.add(key);
      const img = new Image();
      const entry: CacheEntry = {
        key,
        sceneId: scene.id,
        frameNum,
        img,
        ready: false
      };
      cache.set(key, entry);

      const url = getFrameUrl(scene.id, frameNum);

      const onImageLoaded = () => {
        inFlight.delete(key);
        if (disposed) return;

        entry.ready = true;

        // If the playhead is actively waiting for this exact frame, draw it immediately!
        const cur = mapProgressToSceneAndFrame(smoothedProgress);
        const curKey = `${cur.scene.id}_${cur.frameNum}`;
        if (key === curKey) {
          drawImageToCanvas(img, key, cur.scene, cur.frameNum);
        }
      };

      img.onload = onImageLoaded;

      img.onerror = () => {
        inFlight.delete(key);
        // Fallback: If 'sm/' variant fails, try standard full-size frame
        if (url.includes('/sm/')) {
          const fallbackUrl = url.replace('/sm/', '/');
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            entry.img = fallbackImg;
            entry.ready = true;
            const cur = mapProgressToSceneAndFrame(smoothedProgress);
            if (key === `${cur.scene.id}_${cur.frameNum}`) {
              drawImageToCanvas(fallbackImg, key, cur.scene, cur.frameNum);
            }
          };
          fallbackImg.src = fallbackUrl;
          return;
        }
        failedSet.add(key);
        cache.delete(key);
      };

      img.src = url;
      if (img.complete && img.naturalWidth > 0) {
        onImageLoaded();
      }
    };

    // Maintain bounded sliding preload window around current position
    const updatePreloadWindow = (sceneIdx: number, frameNum: number, dir: 1 | -1) => {
      const curScene = SCENE_TIMELINE[sceneIdx];

      // 1. Current target: immediate priority
      preloadSpecificFrame(curScene, frameNum, true);

      // 2. Forward window in scroll direction
      for (let i = 1; i <= FORWARD_PRELOAD; i++) {
        let nextF = frameNum + dir * i;
        let nextSceneIdx = sceneIdx;
        let nextScene = curScene;

        if (nextF > curScene.trimRange.end && nextSceneIdx < SCENE_TIMELINE.length - 1) {
          nextSceneIdx++;
          nextScene = SCENE_TIMELINE[nextSceneIdx];
          nextF = nextScene.trimRange.start + (nextF - curScene.trimRange.end - 1);
        } else if (nextF < curScene.trimRange.start && nextSceneIdx > 0) {
          nextSceneIdx--;
          nextScene = SCENE_TIMELINE[nextSceneIdx];
          nextF = nextScene.trimRange.end - (curScene.trimRange.start - nextF - 1);
        }

        if (nextF >= nextScene.trimRange.start && nextF <= nextScene.trimRange.end) {
          preloadSpecificFrame(nextScene, nextF, i <= 3);
        }
      }

      // 3. Backward safety margin for instantaneous scroll reversal
      for (let i = 1; i <= BACKWARD_PRELOAD; i++) {
        let prevF = frameNum - dir * i;
        let prevSceneIdx = sceneIdx;
        let prevScene = curScene;

        if (prevF < curScene.trimRange.start && prevSceneIdx > 0) {
          prevSceneIdx--;
          prevScene = SCENE_TIMELINE[prevSceneIdx];
          prevF = prevScene.trimRange.end - (curScene.trimRange.start - prevF - 1);
        } else if (prevF > curScene.trimRange.end && prevSceneIdx < SCENE_TIMELINE.length - 1) {
          prevSceneIdx++;
          prevScene = SCENE_TIMELINE[prevSceneIdx];
          prevF = prevScene.trimRange.start + (prevF - curScene.trimRange.end - 1);
        }

        if (prevF >= prevScene.trimRange.start && prevF <= prevScene.trimRange.end) {
          preloadSpecificFrame(prevScene, prevF, false);
        }
      }

      // 4. Enforce strict memory bounds
      evictDistantFrames(sceneIdx, frameNum);
    };

    // Render initial poster immediately on mount
    const loadInitialPoster = () => {
      const initialScene = SCENE_TIMELINE[0];
      const posterImg = new Image();

      const onPosterLoaded = () => {
        if (disposed || initialPosterPainted) return;
        updateCanvasDimensions();
        drawImageToCanvas(posterImg, 'initial_poster', initialScene, initialScene.trimRange.start);
      };

      posterImg.onload = onPosterLoaded;
      posterImg.onerror = () => {
        // Fallback to first opening frame
        preloadSpecificFrame(initialScene, initialScene.trimRange.start, true);
      };

      posterImg.src = initialScene.posterImage;
      if (posterImg.complete && posterImg.naturalWidth > 0) {
        onPosterLoaded();
      }

      // Preload first opening frames immediately
      for (let i = 0; i <= 6; i++) {
        preloadSpecificFrame(initialScene, initialScene.trimRange.start + i, true);
      }
    };

    loadInitialPoster();
    updateCanvasDimensions();

    // Scroll-coupled animation loop (NO AUTOPLAY)
    const renderLoop = (now: number) => {
      if (disposed) return;

      const dt = Math.min(0.06, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Authoritative scroll progress from mutable ref
      const targetProgress = Math.min(1, Math.max(0, progress.current || 0));

      // Detect scroll direction
      if (targetProgress !== prevRawProgress) {
        scrollDirection = targetProgress >= prevRawProgress ? 1 : -1;
        prevRawProgress = targetProgress;
      }

      // Responsive spring damping for fluid scroll settling
      const blend = 1 - Math.exp(-34 * dt);
      const diff = targetProgress - smoothedProgress;

      if (Math.abs(diff) < 0.0001) {
        smoothedProgress = targetProgress;
      } else {
        smoothedProgress += diff * blend;
      }

      // Determine deterministic scene and frame
      const { sceneIndex, scene, frameNum } = mapProgressToSceneAndFrame(smoothedProgress);
      activeChapterRef.current = sceneIndex;

      const targetKey = `${scene.id}_${frameNum}`;

      // Redraw ONLY when displayed frame changes
      if (targetKey !== lastDrawnKey) {
        const cachedEntry = cache.get(targetKey);

        if (cachedEntry && cachedEntry.ready) {
          drawImageToCanvas(cachedEntry.img, targetKey, scene, frameNum);
        } else {
          // If the exact frame is still decoding, find the closest available loaded frame
          // so the animation never flickers or flashes black
          let closestEntry: CacheEntry | null = null;
          let minDistance = Infinity;

          for (const entry of cache.values()) {
            if (entry.ready && entry.sceneId === scene.id) {
              const d = Math.abs(entry.frameNum - frameNum);
              if (d < minDistance) {
                minDistance = d;
                closestEntry = entry;
              }
            }
          }

          if (closestEntry && minDistance < 25) {
            drawImageToCanvas(closestEntry.img, `${closestEntry.sceneId}_${closestEntry.frameNum}`, scene, closestEntry.frameNum);
          } else if (mostRecentValidImage) {
            ctx.drawImage(mostRecentValidImage, 0, 0, canvas.width, canvas.height);
          }

          // Prioritise immediate fetch of the target frame
          preloadSpecificFrame(scene, frameNum, true);
        }
      }

      updatePreloadWindow(sceneIndex, frameNum, scrollDirection);
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    // Window resize handler
    const handleResize = () => {
      updateCanvasDimensions();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);

      // Clean up and close all ImageBitmaps and cached images
      for (const [, entry] of cache) {
        if (entry.bitmap) {
          try { entry.bitmap.close(); } catch {}
        }
        entry.img.src = '';
      }
      cache.clear();
      inFlight.clear();
      failedSet.clear();
    };
  }, [progress, onReady, activeChapterRef]);

  return (
    <div ref={containerRef} className="frame-sequence" aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        aria-label="Bar Chef Bengaluru scroll-controlled cocktail story"
        role="img"
      />
      {status ? (
        <span className="frame-loading" role="status">
          {status}
        </span>
      ) : null}
    </div>
  );
}
