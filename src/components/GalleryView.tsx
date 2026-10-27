'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Weddings' | 'House Parties' | 'Birthdays' | 'Workshops' | 'Festivals' | 'Cocktail Craft';
  venue: string;
  image: string;
  alt: string;
  desc: string;
  span?: string;
}

export const GALLERY_MEDIA: GalleryItem[] = [
  {
    id: 'wedding-virosh',
    title: 'VIROSH Wedding Celebration Bar',
    category: 'Weddings',
    venue: 'Udaipur, Rajasthan',
    image: '/frames/06_wedding/poster.webp',
    alt: 'Bespoke champagne coupe and martini bar set against white marble and warm floral backdrop at a destination wedding in Udaipur',
    desc: 'Bespoke champagne coupe and martini bar set against white marble and warm floral bokeh for a grand destination celebration.',
    span: 'span-7'
  },
  {
    id: 'house-party-rooftop',
    title: 'Sunset Rooftop Soirée',
    category: 'House Parties',
    venue: 'Bengaluru Skyline',
    image: '/frames/07_rooftop_party/poster.webp',
    alt: 'Guests enjoying craft cocktails on a sunset rooftop terrace overlooking Bengaluru',
    desc: 'Golden-hour highball bar program with tailored botanicals and curated craft menus under twilight skies.',
    span: 'span-5'
  },
  {
    id: 'birthday-blowout',
    title: 'Golden Confetti Birthday Toast',
    category: 'Birthdays',
    venue: 'Private Rooftop Salon',
    image: '/images/birthday-blowout.webp',
    alt: 'Martini glass with fresh lemon twist surrounded by falling gold confetti and celebrating guests',
    desc: 'Signature birthday shot rituals, bespoke celebratory glassware, and high-energy bar service for an unforgettable night.',
    span: 'span-6'
  },
  {
    id: 'festival-terra',
    title: 'Ben Böhmer Live Concert Bar',
    category: 'Festivals',
    venue: 'Terra · Bengaluru',
    image: '/frames/08_music_festival/poster.webp',
    alt: 'High-speed, high-volume cocktail bar service under stage lights at live music concert at Terra Bengaluru',
    desc: 'High-speed, high-volume craft operations delivering rapid service without compromising flavour or presentation.',
    span: 'span-6'
  },
  {
    id: 'workshop-citrus',
    title: 'Citrus Zest & Botanical Extraction',
    category: 'Workshops',
    venue: 'BarChef Masterclass',
    image: '/frames/03_lemon_garnish/poster.webp',
    alt: 'Hand peeling fresh lemon peel for essential citrus oil extraction in cocktail workshop',
    desc: 'Freshly stripped citrus oils, house-made cordials, and botanical distillates prepared for hands-on sensory learning.',
    span: 'span-5'
  },
  {
    id: 'craft-concept',
    title: 'Signature Amber Concept Serve',
    category: 'Cocktail Craft',
    venue: 'Cocktail Lab Research',
    image: '/images/cocktail-concept.png',
    alt: 'Amber craft spirit cocktail garnished with orange twist over black granite tasting counter',
    desc: 'Amber spirit infusion garnished with hand-curled orange peel, illuminated over polished black granite.',
    span: 'span-7'
  },
  {
    id: 'craft-cloche',
    title: 'The Smoke Cloche Martini Reveal',
    category: 'Cocktail Craft',
    venue: 'Cocktail Lab Salon',
    image: '/frames/01_martini_reveal/poster.webp',
    alt: 'Glass cloche lifted to release aromatic smoke over cold martini glass',
    desc: 'Aromatic cloche release unveiling tailored spirit blends and chilled crystal stemware.',
    span: 'span-6'
  },
  {
    id: 'craft-pour',
    title: 'Aeration & Precision Crystal Pour',
    category: 'Cocktail Craft',
    venue: 'Event Bar Service',
    image: '/frames/02_cocktail_falling/poster.webp',
    alt: 'Chilled cocktail liquid falling smoothly into crystal glass captured at high speed',
    desc: 'Fluid descent of chilled cocktail into lead-free crystal, captured mid-flow at 24 frames per second.',
    span: 'span-6'
  },
  {
    id: 'craft-microbubbles',
    title: 'Liquid Landscape & Micro-Bubbles',
    category: 'Cocktail Craft',
    venue: 'Flavour Architecture',
    image: '/frames/05_amber_journey/poster.webp',
    alt: 'Macro photograph inside sparkling amber cocktail liquid showing rising micro-bubbles',
    desc: 'Macro examination of carbonation retention, spirit density, and temperature balance inside the glass.',
    span: 'span-12'
  },
  {
    id: 'craft-crystal-pour',
    title: 'The Golden Crystal Stream',
    category: 'Cocktail Craft',
    venue: 'Studio Tasting Bar',
    image: '/frames/pour/poster.webp',
    alt: 'Golden spirit pouring in a smooth continuous stream into a vintage crystal coupe glass',
    desc: 'Pure spirits poured over clear ice, captured mid-flow at studio resolution.',
    span: 'span-6'
  },
  {
    id: 'craft-assembly',
    title: 'Botanical Harmony & Splash',
    category: 'Cocktail Craft',
    venue: 'Cocktail Lab Bengaluru',
    image: '/frames/assembly/poster.webp',
    alt: 'Cocktail glass with citrus twist and fresh lemon slice captured mid-splash',
    desc: 'Hand-peeled lemon curl meeting artisanal spirit infusion with dynamic citrus oils.',
    span: 'span-6'
  },
  {
    id: 'craft-soiree-occasions',
    title: 'Salon Evening Soirée',
    category: 'House Parties',
    venue: 'Private Residence Salon',
    image: '/frames/occasions/poster.webp',
    alt: 'Coupe cocktail with lemon peel garnish on sleek dark bar counter with evening guests in background',
    desc: 'Intimate private dinner party bar service tailored to refined personal tastes.',
    span: 'span-7'
  },
  {
    id: 'craft-inside-macro',
    title: 'Effervescence & Flavour Geometry',
    category: 'Cocktail Craft',
    venue: 'Cocktail Lab Research',
    image: '/frames/inside/poster.webp',
    alt: 'Macro view of rising bubbles inside cold cocktail liquid',
    desc: 'Calibrated carbonation kinetics, bubble surface tension and botanical emulsion.',
    span: 'span-5'
  }
];

const CATEGORIES = [
  'All',
  'Weddings',
  'House Parties',
  'Birthdays',
  'Workshops',
  'Festivals',
  'Cocktail Craft'
] as const;

export default function GalleryView() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = activeFilter === 'All'
    ? GALLERY_MEDIA
    : GALLERY_MEDIA.filter((item) => item.category === activeFilter);

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  }, [lightboxIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, handleClose, handlePrev, handleNext]);

  return (
    <div>
      <p style={{ maxWidth: '720px', color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '32px' }}>
        A curated portfolio of genuine celebration moments, signature cocktail serves, and bespoke bar environments created by BarChef Bengaluru across weddings, house parties, birthdays, festivals, and the Cocktail Lab.
      </p>

      {/* Accessible Category Filters */}
      <div
        role="toolbar"
        aria-label="Gallery category filters"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '36px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--line)'
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = activeFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setActiveFilter(cat);
                setLightboxIndex(null);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                border: isSelected ? '1px solid var(--gold)' : '1px solid var(--line)',
                backgroundColor: isSelected ? 'var(--bg-cream)' : 'var(--surface-white)',
                color: isSelected ? 'var(--deep-bronze)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="gallery-editorial-grid">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={`gallery-card ${item.span || 'span-6'}`}
            tabIndex={0}
            role="button"
            aria-label={`View ${item.title} in full view`}
            onClick={() => setLightboxIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightboxIndex(index);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="gallery-img-wrap">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                width={960}
                height={540}
              />
            </div>
            <div className="gallery-info">
              <span className="gallery-category">{item.category} · {item.venue}</span>
              <h3 className="gallery-title">{item.title}</h3>
              <p className="gallery-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Keyboard-Operable Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer: ${activeItem.title}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(20, 16, 12, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={handleClose}
        >
          {/* Modal Header Controls */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '24px',
              right: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#FFFDF8',
              zIndex: 10
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#D4AF37', textTransform: 'uppercase' }}>
              {activeItem.category} · {lightboxIndex! + 1} of {filteredItems.length}
            </span>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close image viewer"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 253, 248, 0.3)',
                color: '#FFFDF8',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Content Box */}
          <div
            style={{
              maxWidth: '1000px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={activeItem.image}
                alt={activeItem.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(179, 138, 69, 0.3)'
                }}
              />

              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image (Left arrow)"
                style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 253, 248, 0.15)',
                  border: '1px solid rgba(255, 253, 248, 0.25)',
                  color: '#FFFDF8',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ←
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image (Right arrow)"
                style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 253, 248, 0.15)',
                  border: '1px solid rgba(255, 253, 248, 0.25)',
                  color: '#FFFDF8',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                →
              </button>
            </div>

            {/* Captions & Info */}
            <div
              style={{
                marginTop: '20px',
                textAlign: 'center',
                color: '#FFFDF8',
                maxWidth: '720px'
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontSize: '20px', color: '#FFFDF8' }}>
                {activeItem.title}
              </h3>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#D4AF37' }}>
                {activeItem.venue}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 253, 248, 0.75)', lineHeight: '1.5' }}>
                {activeItem.desc}
              </p>
              <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255, 253, 248, 0.45)' }}>
                Use Left / Right arrow keys to navigate · Escape to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
