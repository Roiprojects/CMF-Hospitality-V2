'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTimelineConfiguration, SceneConfig } from './FrameSequence';

const FrameSequence = dynamic(() => import('./FrameSequence'), { ssr: false });

const { scenes } = getTimelineConfiguration();

export default function StoryExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const activeChapterRef = useRef(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [framesReady, setFramesReady] = useState(false);

  const handleReady = useCallback((ready: boolean) => {
    setFramesReady(ready);
  }, []);

  // System prefers-reduced-motion listener & custom event
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setMotionEnabled(!mq.matches);
    };
    updateMotion();
    mq.addEventListener('change', updateMotion);

    const onGlobalMotion = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setMotionEnabled(detail && !mq.matches);
    };
    window.addEventListener('barchef-motion', onGlobalMotion);

    return () => {
      mq.removeEventListener('change', updateMotion);
      window.removeEventListener('barchef-motion', onGlobalMotion);
    };
  }, []);

  // One coherent GSAP ScrollTrigger authoritative scroll progress engine
  useEffect(() => {
    if (!motionEnabled || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.story-panel'));
    const segmentFills = Array.from(root.querySelectorAll<HTMLElement>('.story-segment-fill'));
    let lastActiveChapter = -1;

    const syncPanelsAndProgress = (p: number) => {
      progressRef.current = p;
      root.style.setProperty('--story-progress', p.toFixed(4));

      // Deterministically find active chapter based on configurable scene progress intervals
      let currentActive = 0;
      for (let i = 0; i < scenes.length; i++) {
        if (p >= scenes[i].startProgress && p <= scenes[i].endProgress) {
          currentActive = i;
          break;
        }
        if (i === scenes.length - 1 && p >= scenes[i].startProgress) {
          currentActive = i;
        }
      }

      // Only update React state when active chapter transitions (avoid scroll-event-driven React re-renders)
      if (currentActive !== lastActiveChapter) {
        lastActiveChapter = currentActive;
        setActiveChapter(currentActive);
        activeChapterRef.current = currentActive;
      }

      // Smooth panel fade and parallax with zero layout reflow
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const sc = scenes[i];
        if (!sc) continue;

        const start = sc.startProgress;
        const end = sc.endProgress;
        const mid = (start + end) / 2;
        const halfSpan = (end - start) / 2;

        const dist = halfSpan > 0 ? (p - mid) / halfSpan : 0;
        const absDist = Math.abs(dist);

        let opacity = 0;
        if (absDist <= 0.55) {
          opacity = 1;
        } else if (absDist < 1.05) {
          const t = (absDist - 0.55) / 0.5;
          opacity = 0.5 * (1 + Math.cos(t * Math.PI));
        }

        const translateY = -dist * 20;

        panel.style.opacity = opacity.toFixed(3);
        panel.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        panel.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        panel.inert = opacity < 0.25;
        panel.setAttribute('aria-hidden', String(opacity < 0.25));
      }

      // Smooth dynamic fill for mobile story segment bars
      for (let i = 0; i < scenes.length; i++) {
        const fill = segmentFills[i];
        if (!fill) continue;
        const sc = scenes[i];
        if (p >= sc.endProgress) {
          fill.style.width = '100%';
        } else if (p <= sc.startProgress) {
          fill.style.width = '0%';
        } else {
          const span = sc.endProgress - sc.startProgress;
          const local = span > 0 ? (p - sc.startProgress) / span : 0;
          fill.style.width = `${(local * 100).toFixed(1)}%`;
        }
      }
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        syncPanelsAndProgress(self.progress);
      },
      onRefresh: (self) => {
        syncPanelsAndProgress(self.progress);
      }
    });

    stRef.current = st;
    syncPanelsAndProgress(st.progress);

    // Refresh ScrollTrigger to calculate exact dimensions after layout settles
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      st.kill();
      stRef.current = null;
      panels.forEach((panel) => {
        panel.removeAttribute('style');
        panel.inert = false;
        panel.removeAttribute('aria-hidden');
      });
    };
  }, [motionEnabled]);

  // Synchronized chapter jump
  const jumpToChapter = (chapterIndex: number) => {
    const sc = scenes[chapterIndex];
    if (!sc) return;
    const targetProgress = (sc.startProgress + sc.endProgress) / 2;
    if (stRef.current) {
      const targetScroll =
        stRef.current.start + targetProgress * (stRef.current.end - stRef.current.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else if (rootRef.current) {
      const root = rootRef.current;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const maxScroll = root.offsetHeight - window.innerHeight;
      const targetY = rootTop + maxScroll * targetProgress;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  // Skip Story control: smooth jump past the cinematic container to normal page flow
  const handleSkipStory = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const nextSection = document.getElementById('story');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={rootRef}
      className={
        'story-experience ' +
        (motionEnabled ? 'story-enabled' : 'story-static') +
        (framesReady ? ' frames-ready' : '')
      }
      id="experience"
    >
      <div
        className={`story-stage fit-${scenes[activeChapter]?.fitMode || 'split-screen'} scene-${scenes[activeChapter]?.id || '01'}`}
      >
        {/* Elegant Cream Column Backdrop for Desktop Split-Screen */}
        <div className="story-column-backdrop" aria-hidden="true" />

        {/* Dark matching backdrop (hidden once frames paint) */}
        <div className="story-backdrop" aria-hidden="true" />

        {/* 1080p Canvas Sequence Player */}
        {motionEnabled && (
          <FrameSequence
            progress={progressRef}
            onReady={handleReady}
            activeChapterRef={activeChapterRef}
          />
        )}

        {/* Subtle protective vignette */}
        <div className="story-vignette" aria-hidden="true" />

        {/* Mobile Story Segments (App-style top progress indicators for 8 chapters) */}
        <div className="story-mobile-segments" aria-label="Story progress">
          {scenes.map((sc, idx) => (
            <div
              key={sc.num}
              className={`story-segment-bar ${
                activeChapter === idx
                  ? 'is-current'
                  : activeChapter > idx
                  ? 'is-completed'
                  : ''
              }`}
            >
              <div className="story-segment-fill" />
            </div>
          ))}
        </div>

        {/* Discrete Cinematic Watermark */}
        <div className="story-watermark" aria-hidden="true">
          <span className="story-brand-badge">BAR CHEF · CINEMATIC STORY</span>
        </div>

        {/* Prominent Skip Story Control */}
        <div className="story-skip-control">
          <button
            type="button"
            onClick={handleSkipStory}
            className="story-skip-btn"
            aria-label="Skip cinematic story to main content"
          >
            Skip Story ↓
          </button>
        </div>

        {/* Story Chapter Content Panels */}
        <div className="story-panels">
          {scenes.map((sc, i) => (
            <section
              key={sc.num}
              className={`story-panel chapter-${i}`}
              aria-label={`${sc.num} — ${sc.sceneName}`}
            >
              <div className="story-panel-content">
                <div className="story-panel-header">
                  <p className="eyebrow">
                    {sc.num} — {sc.title}
                  </p>
                  {i === 0 ? (
                    <h1 className="story-headline">{sc.headline}</h1>
                  ) : (
                    <h2 className="story-headline">{sc.headline}</h2>
                  )}
                </div>

                <div className="story-panel-footer">
                  <p className="story-caption">{sc.supporting}</p>

                  <div className="story-cta-wrap">
                    {sc.ctaText && sc.ctaHref && (
                      sc.isPrimaryCta ? (
                        <Link href={sc.ctaHref} className="button story-cta-btn">
                          {sc.ctaText}
                        </Link>
                      ) : (
                        <Link
                          href={sc.ctaHref}
                          className="text-link story-cta-link"
                          onClick={sc.ctaHref.startsWith('#') ? handleSkipStory : undefined}
                        >
                          {sc.ctaText}
                        </Link>
                      )
                    )}
                    {i === 0 && (
                      <button
                        type="button"
                        onClick={handleSkipStory}
                        className="text-link story-cta-link story-skip-inline"
                      >
                        Skip Story ↓
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reduced-motion & non-canvas static fallback: high-res editorial poster */}
              {!motionEnabled && (
                <div className="static-frame-preview">
                  <img
                    src={sc.posterImage || sc.stillFrame}
                    alt={`${sc.sceneName} - Bar Chef Bengaluru`}
                    loading="lazy"
                    width={960}
                    height={540}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/frames/01_martini_reveal/poster.webp';
                    }}
                  />
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Chapter Rail Navigation (Vertical on desktop left, 01 through 08) */}
        {motionEnabled && (
          <nav className="chapter-rail" aria-label="Story chapter navigation">
            {scenes.map((sc, i) => (
              <button
                key={sc.num}
                type="button"
                onClick={() => jumpToChapter(i)}
                aria-label={`Jump to Chapter ${sc.num}: ${sc.sceneName}`}
                aria-current={activeChapter === i ? 'step' : undefined}
                className={activeChapter === i ? 'is-active' : ''}
              >
                <span className="rail-num">{sc.num}</span>
                <i className="rail-dot" />
                <span className="rail-title">{sc.sceneName}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Bottom Status & Scroll Indicator */}
        {motionEnabled && (
          <div className="story-status" aria-live="polite" role="status">
            <span className="story-current-chapter">
              {scenes[activeChapter]?.num || '01'} / {String(scenes.length).padStart(2, '0')} · {scenes[activeChapter]?.sceneName}
            </span>
            <span className="story-scroll-hint">
              SCROLL TO ADVANCE ↓
            </span>
          </div>
        )}

        {/* Subtle Bottom Progress Line */}
        {motionEnabled && <div className="story-progress" aria-hidden="true" />}

        {/* Subtitle / Spec Note */}
        <span className="scene-caption" aria-hidden="true">
          {framesReady
            ? `1080P MASTER · 24 FPS · 1,920 LOSSLESS FRAMES`
            : 'BUFFERING CINEMATIC STORY'}
        </span>
      </div>
    </div>
  );
}
