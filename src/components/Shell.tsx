'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!motion) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          scrollTrigger: { trigger: el, start: 'top 94%', once: true }
        })
      );
      if (document.querySelector('.hero'))
        gsap.to('.hero-image', {
          yPercent: 12,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
    });
    return () => ctx.revert();
  }, [path, motion]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* Top App Header */}
      <header className="site-header">
        <div className="header-brand-wrap">
          <Link href="/" aria-label="Bar Chef Bengaluru home" className="logo">
            <img
              src="/images/logo.jpg"
              alt="Bar Chef Bengaluru"
              width="120"
              height="80"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/frames/01_martini_reveal/poster.webp';
              }}
            />
          </Link>
          <span className="app-status-badge">
            <span className="status-live-dot" />
            BENGALURU
          </span>
        </div>

        {/* Desktop Direct Luxury Nav Links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          <Link
            href="/services"
            className={`desktop-nav-link ${path.startsWith('/services') ? 'active' : ''}`}
          >
            Experiences
          </Link>
          <Link href="/#craft" className="desktop-nav-link">
            The Craft
          </Link>
          <Link
            href="/about"
            className={`desktop-nav-link ${path === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
          <Link
            href="/gallery"
            className={`desktop-nav-link ${path === '/gallery' ? 'active' : ''}`}
          >
            Gallery
          </Link>
          <Link
            href="/blogs"
            className={`desktop-nav-link ${path.startsWith('/blogs') ? 'active' : ''}`}
          >
            Journal
          </Link>
        </nav>

        <div className="header-actions">
          {/* Desktop Luxury Gold CTA */}
          <Link href="/contact" className="header-cta-btn button small">
            <span>Plan An Event ↗</span>
          </Link>

          {/* Mobile Quick WhatsApp Link */}
          <a
            href="https://wa.me/919945379333?text=Hi%20Bar%20Chef%20Bengaluru,%20I'd%20like%20to%20plan%20an%20event!"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-quick-wa"
            aria-label="Chat on WhatsApp: 9945379333"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>WhatsApp</span>
          </a>

          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close application menu' : 'Open application menu'}
          >
            <span className="menu-toggle-icon">
              <span className={`bar top ${open ? 'active' : ''}`} />
              <span className={`bar bottom ${open ? 'active' : ''}`} />
            </span>
            <span className="menu-toggle-label">{open ? 'Close' : 'Directory'}</span>
          </button>
        </div>

        {/* Desktop & Mobile Slide-Out App Drawer */}
        <nav
          id="nav"
          className={`main-nav ${open ? 'open' : ''}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="mobile-drawer-header">
            <div>
              <p className="drawer-title">BAR CHEF BENGALURU</p>
              <p className="drawer-sub">Bespoke Cocktail Experiences</p>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="nav-links-wrap">
            {[
              ['Story & Vision', '/about', 'The founders, philosophy & cocktail craft'],
              ['Experiences & Services', '/services', 'Weddings, celebrations, concerts & private spaces'],
              ['Cocktail Gallery', '/gallery', 'Visual portfolio of signature creations'],
              ['Journal', '/blogs', 'Curated stories, recipes & cocktail culture'],
              ['Testimonials', '/testimonials', 'Client words from prestigious gatherings']
            ].map(([title, href, desc]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? 'page' : undefined}
                className="nav-card-link"
              >
                <div className="nav-card-content">
                  <span className="nav-card-title">{title}</span>
                  <span className="nav-card-desc">{desc}</span>
                </div>
                <span className="nav-card-arrow">↗</span>
              </Link>
            ))}
          </div>

          <div className="drawer-quick-card">
            <p className="drawer-quick-eyebrow">READY TO HOST AN UNFORGETTABLE BAR?</p>
            <Link href="/contact" className="button small full-width drawer-primary-btn">
              Plan your event ↗
            </Link>
            <a
              href="https://wa.me/919945379333?text=Hi%20Bar%20Chef%20Bengaluru,%20I'd%20like%20to%20plan%20an%20event!"
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-wa-btn"
            >
              <span>Instant WhatsApp · 9945379333</span>
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <a href="https://www.instagram.com/barchefbengaluru/" target="_blank" rel="noopener noreferrer" className="text-link">@barchefbengaluru ↗</a>
                <a href="https://www.instagram.com/pure_fruit_fresh/" target="_blank" rel="noopener noreferrer" className="text-link">@pure_fruit_fresh ↗</a>
              </div>
              <a href="https://share.google/Jat8wcj5yzHFEXLfV" target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: '12px' }}>Directions (Bengaluru) ↗</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Page Content */}
      <main id="main">{children}</main>

      {/* Native App-Style Bottom Tab Bar (Mobile View Only) */}
      <nav className="mobile-tab-bar" aria-label="Mobile app dock">
        <Link
          href="/"
          className={`tab-item ${path === '/' ? 'is-active' : ''}`}
          aria-current={path === '/' ? 'page' : undefined}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="tab-label">Story</span>
        </Link>

        <Link
          href="/services"
          className={`tab-item ${path === '/services' ? 'is-active' : ''}`}
          aria-current={path === '/services' ? 'page' : undefined}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 22h8" />
            <path d="M12 11v11" />
            <path d="m19 3-7 8-7-8Z" />
          </svg>
          <span className="tab-label">Experiences</span>
        </Link>

        <Link
          href="/gallery"
          className={`tab-item ${path === '/gallery' ? 'is-active' : ''}`}
          aria-current={path === '/gallery' ? 'page' : undefined}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="tab-label">Gallery</span>
        </Link>

        <Link
          href="/blogs"
          className={`tab-item ${path === '/blogs' ? 'is-active' : ''}`}
          aria-current={path === '/blogs' ? 'page' : undefined}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="tab-label">Journal</span>
        </Link>

        <Link
          href="/contact"
          className={`tab-item tab-item-highlight ${path === '/contact' ? 'is-active' : ''}`}
          aria-current={path === '/contact' ? 'page' : undefined}
        >
          <div className="tab-highlight-bubble">
            <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="tab-label">Book</span>
        </Link>
      </nav>

      {/* Global Footer */}
      <footer>
        <div className="footer-top">
          <p className="eyebrow">BENGALURU · EXPERIENCES BEYOND THE GLASS</p>
          <Link href="/contact" className="footer-title">
            Let’s make it<br />
            <em>memorable.</em> ↗
          </Link>
        </div>
        <div className="footer-bottom">
          <span>BAR CHEF BENGALURU</span>
          <a
            href="https://wa.me/919945379333"
            target="_blank"
            rel="noopener noreferrer"
            className="developer-credit"
          >
            Developed by ROI Infotech
          </a>
          <Link href="/testimonials">Testimonials</Link>
          <a
            href="https://www.instagram.com/barchefbengaluru/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
          <a
            href="https://www.instagram.com/pure_fruit_fresh/"
            target="_blank"
            rel="noreferrer"
          >
            Pure Fruit Fresh ↗
          </a>
          <a
            href="https://share.google/Jat8wcj5yzHFEXLfV"
            target="_blank"
            rel="noreferrer"
          >
            Directions ↗
          </a>
          <button
            onClick={() => {
              setMotion(!motion);
              window.dispatchEvent(
                new CustomEvent('barchef-motion', { detail: !motion })
              );
            }}
            aria-pressed={motion}
          >
            Motion {motion ? 'on' : 'off'}
          </button>
        </div>
        <p className="disclosure">
          Design preview · Supplied cocktail films are illustrative concepts, not documentation of client events. Business details await approval.
        </p>
      </footer>
    </>
  );
}
