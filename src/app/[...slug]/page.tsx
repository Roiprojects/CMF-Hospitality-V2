import Link from 'next/link';
import { notFound } from 'next/navigation';
import data from '@/content/data.json';
import Inquiry from '@/components/Inquiry';
import GalleryView from '@/components/GalleryView';

const SERVICE_IMAGES: Record<string, string> = {
  'weddings': '/frames/06_wedding/poster.webp',
  'house-parties': '/frames/07_rooftop_party/poster.webp',
  'birthdays': '/images/birthday-blowout.webp',
  'workshops': '/frames/03_lemon_garnish/poster.webp',
  'concerts-music-festivals': '/frames/08_music_festival/poster.webp',
  'cocktail-program': '/images/cocktail-concept.png'
};

const BLOG_IMAGES: Record<string, string> = {
  'planning-a-wedding-bar-across-multiple-functions': '/frames/06_wedding/poster.webp',
  'planning-a-personal-wedding-bar': '/frames/06_wedding/poster.webp',
  'designing-a-house-party-cocktail-menu-for-your-guests': '/frames/07_rooftop_party/poster.webp',
  'house-party-bar-planning': '/frames/07_rooftop_party/poster.webp',
  'personalising-a-birthday-bar-experience': '/images/birthday-blowout.webp',
  'personalised-birthday-bar-ideas': '/images/birthday-blowout.webp',
  'what-teams-can-learn-in-a-mixology-workshop': '/frames/03_lemon_garnish/poster.webp',
  'planning-a-cocktail-workshop': '/frames/03_lemon_garnish/poster.webp',
  'how-festival-bar-planning-supports-faster-service': '/frames/08_music_festival/poster.webp',
  'festival-bar-flow-and-consistency': '/frames/08_music_festival/poster.webp',
  'what-a-complete-cocktail-consultancy-program-includes': '/images/cocktail-concept.png',
  'cocktail-program-beyond-the-menu': '/images/cocktail-concept.png'
};

// Testimonial verified moments (Authentic supplied gatherings only)
const TESTIMONIAL_ITEMS = [
  {
    quote: '“The bar was the undisputed centerpiece of our celebration in Udaipur. Monish and Bharath crafted cocktails that our guests are still raving about months later.”',
    author: 'VIROSH Wedding Hosts',
    role: 'Destination Wedding',
    location: 'Udaipur, Rajasthan',
    badge: 'Wedding'
  },
  {
    quote: '“Handling a high-energy live concert crowd of thousands while maintaining craft cocktail consistency is rare. Bar Chef Bengaluru delivered flawless flow at Terra.”',
    author: 'Terra Hospitality Team',
    role: 'Ben Böhmer Live Concert',
    location: 'Bengaluru, Karnataka',
    badge: 'Concert'
  },
  {
    quote: '“Bar Chef Bengaluru brought the soul of Indian hospitality and modern mixology all the way to Muscat. The personalized menus captured our family’s favourite flavours perfectly.”',
    author: 'Manav Agarwal Family',
    role: 'Hilton Al Husain Destination Wedding',
    location: 'Muscat, Oman',
    badge: 'International'
  },
  {
    quote: '“Impeccable preparation and speed. They served 400+ guests with the finesse of an intimate speakeasy. Every guest felt attended to.”',
    author: 'ITC Moments Production Team',
    role: 'Luxury Corporate Gala',
    location: 'Bengaluru, Karnataka',
    badge: 'Corporate'
  }
];

export function generateStaticParams() {
  const blogSlugs = data.blogs.flatMap(b => [
    { slug: ['blogs', b.slug] },
    ...(b.alias ? [{ slug: ['blogs', b.alias] }] : [])
  ]);

  return [
    ...['about', 'services', 'gallery', 'blogs', 'testimonials', 'contact'].map(s => ({ slug: [s] })),
    ...data.services.map(s => ({ slug: ['services', s.slug] })),
    ...blogSlugs
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const canonicalPath = `/${slug.join('/')}/`;
  const service = slug[0] === 'services'
    ? data.services.find(x => x.slug === slug[1])
    : undefined;
  const blog = slug[0] === 'blogs'
    ? data.blogs.find(x => x.slug === slug[1] || x.alias === slug[1])
    : undefined;

  const defaultTitles: Record<string, string> = {
    about: 'Our Story & Pillars · Bar Chef Bengaluru',
    services: 'Bespoke Bar Experiences · Bar Chef Bengaluru',
    gallery: 'Cocktail & Celebration Gallery · Bar Chef Bengaluru',
    blogs: 'The Cocktail Journal · Bar Chef Bengaluru',
    testimonials: 'Client & Host Moments · Bar Chef Bengaluru',
    contact: 'Plan Your Experience · Bar Chef Bengaluru'
  };

  const defaultDescriptions: Record<string, string> = {
    about: 'Discover BarChef Bengaluru: founded by Monish Raj D A and Bharath Venkatesh, crafting personalised beverage programs, botanical mixology, and disciplined bar systems.',
    services: 'Bespoke cocktail and bar experiences for weddings, house parties, birthdays, mixology workshops, festivals, and venue beverage programs in Bengaluru.',
    gallery: 'Curated portfolio of genuine celebration moments, signature cocktail serves, and bespoke bar environments created by BarChef Bengaluru.',
    blogs: 'Original editorial guides exploring wedding bar planning, house-party cocktail menu curation, mixology workshop takeaways, and festival bar systems.',
    testimonials: 'Documented feedback and genuine moments from hosts, planners, and festival organizers whose celebrations were operated by BarChef Bengaluru.',
    contact: 'Plan your bespoke bar experience with BarChef Bengaluru. Share your date, venue, guest count, and vision to begin.'
  };

  if (service) {
    const heroImg = SERVICE_IMAGES[service.slug] || '/frames/06_wedding/poster.webp';
    return {
      title: `${service.title} · Bar Chef Bengaluru`,
      description: service.intro || service.tagline || `${service.title} experience curated by BarChef Bengaluru.`,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `${service.title} · Bar Chef Bengaluru`,
        description: service.intro || service.tagline,
        url: canonicalPath,
        images: [{ url: heroImg }]
      }
    };
  }

  if (blog) {
    const heroImg = BLOG_IMAGES[blog.slug] || (blog.alias && BLOG_IMAGES[blog.alias]) || '/frames/02_cocktail_falling/poster.webp';
    return {
      title: `${blog.title} · Bar Chef Bengaluru`,
      description: blog.excerpt,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `${blog.title} · Bar Chef Bengaluru`,
        description: blog.excerpt,
        url: canonicalPath,
        images: [{ url: heroImg }]
      }
    };
  }

  const title = defaultTitles[slug[0]] ?? 'Bar Chef Bengaluru';
  const description = defaultDescriptions[slug[0]] ?? 'Bespoke cocktail and bar experiences in Bengaluru.';

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath
    }
  };
}

function Copy({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p, i) =>
        p.startsWith('#### ') ? (
          <h2 key={i}>{p.replace('#### ', '')}</h2>
        ) : (
          <p key={i}>{p}</p>
        )
      )}
    </>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [route, id] = slug;
  const service = data.services.find(s => s.slug === id);
  const blog = data.blogs.find(b => b.slug === id || b.alias === id);

  if (slug.length > 2 || (id && !((route === 'services' && service) || (route === 'blogs' && blog)))) {
    notFound();
  }

  let title = '';
  let label = '';
  let body: React.ReactNode;

  // ROUTE: About Page
  if (route === 'about') {
    title = 'Built around people, not just menus.';
    label = 'OUR STORY & CRAFT';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/images/cocktail-concept.png"
            alt="BarChef Bengaluru Cocktail Craft & Tasting Laboratory"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            We craft the complete experience around the bar — from cocktail design and sensory presentation to disciplined backstage operations.
          </h2>
          <p className="service-intro-text">
            Bar Chef Bengaluru is a bartending and cocktail experience brand built in Bengaluru. We design and operate bespoke beverage programs for weddings, private house gatherings, milestone birthdays, live concerts, music festivals, and hospitality venues.
          </p>
        </div>

        <h3 className="service-section-title">Our Four Foundational Pillars</h3>

        <div className="service-features-list">
          <div className="service-feature-item">
            <h4>1. Personalised Beverage Experiences</h4>
            <p>Every celebration brings together different people and expectations. We start with the host’s vision, shaping drink profiles that feel personal rather than generic.</p>
          </div>
          <div className="service-feature-item">
            <h4>2. Rigorous Cocktail Craft</h4>
            <p>Through our Cocktail Lab, we explore fresh botanicals, house-made cordials, lacto-fermentation, and balanced acidity to give every cocktail and zero-proof serve distinct character.</p>
          </div>
          <div className="service-feature-item">
            <h4>3. Styling & Presentation</h4>
            <p>From aromatic cloche smoke releases and custom ice stamping to crystal stemware and lighting-ready bar facades, our setups are visually aligned with the occasion’s aesthetic.</p>
          </div>
          <div className="service-feature-item">
            <h4>4. Operational Planning & Systems</h4>
            <p>What guests see at the bar is backed by backstage discipline: batching manuals, station checklists, queue corridor mapping, ice logistics, and synchronized teamwork.</p>
          </div>
        </div>

        <h3 className="service-section-title">Leadership & Craft</h3>

        {/* Founder Card with verified names (no unverified portraits) */}
        <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '28px 24px', margin: '24px 0 44px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            FOUNDERS
          </span>
          <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 10px', fontWeight: 400 }}>
            Monish Raj D A & Bharath Venkatesh
          </h4>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
            Two experienced bartenders with backgrounds spanning bars, breweries, festival operations, and consultancy across India and internationally. Their shared approach combines creative mixology with practical systems to move bartending beyond routine pouring.
          </p>
        </div>

        <h3 className="service-section-title">Verified Gathering Highlights</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
          Real event milestones and hospitality bar programs executed by BarChef Bengaluru across India and internationally. Photographs feature verified beverage stations and bar setups from our supplied portfolio matching each celebration category.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '44px' }}>
          {/* Highlight 1: VIROSH Destination Wedding Udaipur */}
          <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img
                src="/frames/06_wedding/poster.webp"
                alt="VIROSH Destination Wedding Bar Setup — Udaipur, Rajasthan"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>DESTINATION WEDDING</span>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-primary)', margin: '6px 0 8px', fontWeight: 400 }}>VIROSH Wedding — Udaipur</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                A multi-function destination wedding celebration in Udaipur where our team created and executed the bespoke bar experience, personalized menus, and live beverage stations.
              </p>
            </div>
          </div>

          {/* Highlight 2: Ben Böhmer Live at Terra Bengaluru */}
          <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img
                src="/frames/08_music_festival/poster.webp"
                alt="Ben Böhmer Live Concert Bar Operations — Terra, Bengaluru"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>CONCERT BAR OPERATIONS</span>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-primary)', margin: '6px 0 8px', fontWeight: 400 }}>Ben Böhmer Live at Terra — Bengaluru</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                Operated the bar experience for Ben Böhmer&apos;s live concert at Terra Bengaluru, delivering craft cocktail consistency and high-speed service across a high-energy live music crowd.
              </p>
            </div>
          </div>

          {/* Highlight 3: Manav Agarwal Wedding — Hilton Al Husain, Oman */}
          <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img
                src="/frames/07_rooftop_party/poster.webp"
                alt="International Destination Wedding Bar Hospitality — Hilton Al Husain, Oman"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>INTERNATIONAL HOSPITALITY</span>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-primary)', margin: '6px 0 8px', fontWeight: 400 }}>Manav Agarwal Wedding — Muscat, Oman</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                An international destination wedding hospitality program at Hilton Al Husain in Oman, bringing Indian hospitality traditions and contemporary cocktail craft beyond borders.
              </p>
            </div>
          </div>

          {/* Highlight 4: ITC Moments */}
          <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img
                src="/images/cocktail-concept.png"
                alt="Luxury Hospitality Cocktail Consultancy — ITC Moments"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>LUXURY CELEBRATION</span>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-primary)', margin: '6px 0 8px', fontWeight: 400 }}>ITC Moments — Bengaluru</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                Brought our culinary cocktail craft, botanical preparations, and sensory presentation into premium luxury hospitality gatherings in collaboration with ITC Moments.
              </p>
            </div>
          </div>
        </div>

        <p className="note" style={{ marginBottom: '36px' }}>
          Photographs display verified beverage stations and bar setups from BarChef Bengaluru&apos;s supplied media assets matching each occasion type. In accordance with privacy and verification guidelines, unverified personal snapshots and guest portraits are omitted.
        </p>

        <div className="service-planning-card">
          <h3>Ready to craft your bar experience?</h3>
          <p>Tell us about your occasion, guest count, and the atmosphere you have in mind.</p>
          <Link className="button" href="/contact">
            Plan your event ↗
          </Link>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — WEDDINGS
  else if (route === 'services' && id === 'weddings') {
    title = 'One Wedding. Many Different Moods.';
    label = 'WEDDING EXPERIENCES';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/frames/06_wedding/poster.webp"
            alt="One Wedding. Many Different Moods. — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            From mehendi to reception, we tailor the bar for each function.
          </h2>
          <p className="service-intro-text">
            BarChef Bengaluru creates personal wedding bar experiences for intimate haldi functions,
            grand receptions and multi-day destination celebrations.
            Every wedding brings together different people, families, traditions and tastes. We tailor the bar
            for each function, shaping the cocktail stories, live stations, styling and service to match the spirit of every moment.
          </p>
        </div>

        <h3 className="service-section-title">What We Include</h3>
        <div className="service-features-list">
          <div className="service-feature-item">
            <h4>Thematic Cocktails & Mocktails</h4>
            <p>Signature recipes tailored around the couple’s favourite flavours, regional botanicals, and bespoke house infusions.</p>
          </div>
          <div className="service-feature-item">
            <h4>Craft Bartending & Flair Performances</h4>
            <p>Charismatic, seasoned mixologists delivering graceful pouring, cocktail flair, and engaging guest interactions.</p>
          </div>
          <div className="service-feature-item">
            <h4>Live Beverage Stations</h4>
            <p>Interactive experiential setups, from botanical gin trolleys to artisanal spritz bars and clarified punch bowls.</p>
          </div>
          <div className="service-feature-item">
            <h4>Menu Design</h4>
            <p>Premium classics, experimental craft, mocktails and traditional welcome drinks balanced for all guests.</p>
          </div>
          <div className="service-feature-item">
            <h4>Styling & Presentation</h4>
            <p>Elegant, festive, minimal or extravagant styling, meticulously aligned with the celebration decor.</p>
          </div>
          <div className="service-feature-item">
            <h4>End-to-End Bar Planning & Execution</h4>
            <p>Complete management from concept, layout, logistics, and crystal glassware to flawless execution.</p>
          </div>
        </div>

        <h3 className="service-section-title">Our Process</h3>
        <div className="service-process-grid">
          <div className="service-process-card">
            <span className="service-process-step">Step 01</span>
            <h4>1. Share Your Story</h4>
            <p>Venue, guest count, functions and vision.</p>
          </div>
          <div className="service-process-card">
            <span className="service-process-step">Step 02</span>
            <h4>2. We Curate</h4>
            <p>Menu direction, bar setup and service style.</p>
          </div>
          <div className="service-process-card">
            <span className="service-process-step">Step 03</span>
            <h4>3. You Celebrate</h4>
            <p>The team handles execution.</p>
          </div>
        </div>

        <div className="service-planning-card">
          <h3>Plan Your Wedding Bar</h3>
          <p>
            Whether for an intimate haldi gathering or a multi-day destination wedding celebration,
            let’s design a bar experience your guests will talk about for years.
          </p>
          <Link className="button" href="/contact?service=weddings">
            Plan Your Wedding Bar ↗
          </Link>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — BIRTHDAYS
  else if (route === 'services' && id === 'birthdays') {
    title = 'Not Just a Birthday. A Blowout.';
    label = 'BIRTHDAY CELEBRATIONS';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/images/birthday-blowout.webp"
            alt="Not Just a Birthday. A Blowout. — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            A birthday is personal. The bar should be too.
          </h2>
          <p className="service-intro-text">
            We lead with understanding the guest mix, energy and drink preferences. Whether you are celebrating a milestone birthday,
            an intimate private gathering, or a vibrant late-night blowout, BarChef Bengaluru builds an interactive, high-energy bar
            that matches the birthday person's personality and keeps the room buzzing all night.
          </p>
        </div>

        <div className="service-callout-box">
          <span className="service-callout-tag">OUR CELEBRATION CREED</span>
          <p className="service-callout-quote">
            “We keep the bar fast, the pours tight, and the energy high.”
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Tell us your date, venue, guest count, age group and preferred vibe to start planning:
          </p>
          <div className="service-callout-fields">
            <span className="service-field-pill">📅 Date & Time</span>
            <span className="service-field-pill">📍 Venue</span>
            <span className="service-field-pill">👥 Guest Count</span>
            <span className="service-field-pill">🎂 Age Group</span>
            <span className="service-field-pill">✨ Preferred Vibe</span>
          </div>
        </div>

        <h3 className="service-section-title">The Birthday Experience Lineup</h3>
        <div className="service-features-list">
          <div className="service-feature-item">
            <h4>Guest-Informed Menu & Signature Drink</h4>
            <p>Guest-informed menu and the birthday person's signature drink crafted for the night.</p>
          </div>
          <div className="service-feature-item">
            <h4>Signature Birthday Shot Rituals</h4>
            <p>Signature birthday shot rituals and celebratory countdown toasts designed to get everyone cheering.</p>
          </div>
          <div className="service-feature-item">
            <h4>Crowd-Pleasing Cocktails & Zero-Proof Drinks</h4>
            <p>Crowd-pleasing cocktails and zero-proof drinks so every guest has a great drink in hand.</p>
          </div>
          <div className="service-feature-item">
            <h4>Flair & Interactive Mixing</h4>
            <p>Flair and interactive mixing behind the bar that turns drink-making into live entertainment.</p>
          </div>
          <div className="service-feature-item">
            <h4>Shot Carts, Shooter Boats & DIY Stations</h4>
            <p>Shot carts, shooter boats and DIY cocktail stations for spirited guest participation.</p>
          </div>
          <div className="service-feature-item">
            <h4>Chuski & Boozy Popsicle Counters</h4>
            <p>Chuski and boozy popsicle counters spiked with house spirits and fresh fruit purées.</p>
          </div>
          <div className="service-feature-item">
            <h4>Beer Pong & Cocktail Game Bar</h4>
            <p>Beer pong and cocktail game bar with tailored rules and challenges for high-energy celebrations.</p>
          </div>
          <div className="service-feature-item">
            <h4>Neon Styling & Personalised Details</h4>
            <p>Neon styling, personalised glassware, creative garnishes and themed bartender styling.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '24px 28px', marginBottom: '40px' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--deep-bronze)', fontSize: '16px' }}>⚡ Optional Fire Performance</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65' }}>
            Fire performance is an optional feature available strictly subject to venue permission and suitable operating arrangements verified by our team.
          </p>
        </div>

        <div className="service-planning-card">
          <h3>Plan Your Birthday Blowout</h3>
          <p>
            Ready to give your friends a birthday night they won’t forget? Share your date, venue, guest count, age group and preferred vibe,
            and we’ll design an unforgettable party bar.
          </p>
          <Link className="button" href="/contact?service=birthdays">
            Plan Your Birthday Blowout ↗
          </Link>
          <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--deep-bronze)', fontWeight: 600, letterSpacing: '0.06em' }}>
            BarChef Bengaluru — Experienced Beyond The Glass.
          </p>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — HOUSE PARTIES
  else if (route === 'services' && id === 'house-parties') {
    title = 'Your home. Your people. Your kind of evening.';
    label = 'HOUSE PARTIES';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/frames/07_rooftop_party/poster.webp"
            alt="Your home. Your people. Your kind of evening. — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            A great house party has its own rhythm. The bar should fit naturally into it.
          </h2>
          <p className="service-intro-text">
            We approach private celebrations through your guests, their tastes and the space available, creating a bar experience that feels personal and welcoming.
          </p>
          <p className="service-intro-text" style={{ marginTop: '16px' }}>
            Whether you imagine a relaxed gathering or a lively celebration, share your plans, guest count and favourite flavours. We&apos;ll use that brief to explore an experience suited to the occasion, with preparation and service considered alongside the drinks.
          </p>
        </div>

        <div className="service-planning-card">
          <h3>Plan Your House Party Bar</h3>
          <p>
            Tell us about your space, guest count, and favourite flavours to begin.
          </p>
          <Link className="button" href="/contact?service=house-parties">
            Plan this experience ↗
          </Link>
          <p className="note" style={{ marginTop: '16px' }}>
            Service scope, glassware, and menu directions are confirmed individually for your space.
          </p>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — WORKSHOPS
  else if (route === 'services' && id === 'workshops') {
    title = 'The Logic Behind the Liquid';
    label = 'MIXOLOGY WORKSHOPS & MASTERCLASSES';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/frames/03_lemon_garnish/poster.webp"
            alt="Mixology Workshops & Masterclasses — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            Hands-on mixology exploring flavour, sensory evaluation, measurement and creative collaboration.
          </h2>
          <p className="service-intro-text">
            A workshop creates space to explore flavours, ask questions, and understand how a balanced drink comes together.
            Whether for high-performing engineering teams or aspiring student cohorts, BarChef Bengaluru moves beyond simple recipe-following:
            we deconstruct cocktail chemistry, teach precision measurement and dilution, and foster lively team collaboration behind the bar.
          </p>
        </div>

        <div className="service-notice-box">
          <strong>Full Inclusions Provided:</strong> Complete bar toolsets (Boston shakers, jiggers, strainers, bar spoons), fresh fruits, house botanical syrups, crystal glassware, and seasoned mixologists are provided for every workshop session.
          <br /><br />
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            *Note: All workshops focus on sensory exploration and practical technique; we do not issue formal academic accreditation or make guarantees of learning outcomes.
          </span>
        </div>

        <h3 className="service-section-title">Two Tailored Workshop Tracks</h3>

        <div className="tracks-grid">
          {/* Track 1: Corporate IT Track */}
          <div className="track-card">
            <span className="track-eyebrow">TRACK 01 · CORPORATE & TECH</span>
            <h3>Corporate IT Track — “The Logic Behind the Liquid”</h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Tailored for engineering, product, and leadership teams who appreciate precision, structured systems, and creative collaboration under friendly pressure.
            </p>
            <div className="track-meta-pills">
              <span className="track-pill">⏱️ 90–120 Minutes</span>
              <span className="track-pill">👥 15–100 Participants</span>
              <span className="track-pill">🍸 Alcoholic & Zero-Proof Formats</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--line-gold)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', margin: '14px 0' }}>
              <strong style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--deep-bronze)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Key Outcomes for IT Professionals
              </strong>
              <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.55' }}>
                Team cohesion, creative problem-solving and collaborative learning; suitable for offsites, product launches and team engagement.
              </p>
            </div>

            <details className="service-expandable" open style={{ marginTop: 'auto' }}>
              <summary className="service-expandable-summary">
                <span className="summary-title-wrap">
                  <span>Track Modules (4 Stages)</span>
                </span>
                <span className="expand-indicator">+</span>
              </summary>
              <div className="expandable-body">
                <div className="module-list">
                  <div className="module-item">
                    <span className="module-number">01</span>
                    <div className="module-content">
                      <h5>Flavour Foundations</h5>
                      <p>Balancing spirits, sweet, sour, and bitter elements through sensory palate testing.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">02</span>
                    <div className="module-content">
                      <h5>Precision & Execution</h5>
                      <p>Techniques of measurement, ice dilution, temperature balance, and consistent agitation.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">03</span>
                    <div className="module-content">
                      <h5>Collaborative Drink Development</h5>
                      <p>Small team ideation to design a signature concept drink with tailored botanical profiles.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">04</span>
                    <div className="module-content">
                      <h5>Timed Mixology Challenge</h5>
                      <p>High-energy team showdown judged on flavour balance, presentation, and team storytelling.</p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Track 2: College Track */}
          <div className="track-card">
            <span className="track-eyebrow">TRACK 02 · CAMPUS & ACADEMIA</span>
            <h3>College Track — “From Campus to Craft”</h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Created for university departments, hotel management programs, and student festivals exploring beverage culture, botanical chemistry, and hospitality economics.
            </p>
            <div className="track-meta-pills">
              <span className="track-pill">⏱️ 60–90 Minutes</span>
              <span className="track-pill">👥 30–200 Participants</span>
              <span className="track-pill">🏛️ Auditorium + Live Stations</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--line-gold)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', margin: '14px 0' }}>
              <strong style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--deep-bronze)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Key Outcomes for College Students
              </strong>
              <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.55' }}>
                Practical skills, hospitality orientation, entrepreneurship awareness and an engaging campus activity.
              </p>
            </div>

            <details className="service-expandable" open style={{ marginTop: 'auto' }}>
              <summary className="service-expandable-summary">
                <span className="summary-title-wrap">
                  <span>Track Modules (4 Stages)</span>
                </span>
                <span className="expand-indicator">+</span>
              </summary>
              <div className="expandable-body">
                <div className="module-list">
                  <div className="module-item">
                    <span className="module-number">01</span>
                    <div className="module-content">
                      <h5>Mixology History & Modern Bar</h5>
                      <p>Evolution of cocktail culture, speakeasy heritage, and global beverage trends.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">02</span>
                    <div className="module-content">
                      <h5>Sensory Development</h5>
                      <p>Ingredient interaction, aromatics, citrus oils, and palate calibration.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">03</span>
                    <div className="module-content">
                      <h5>Zero-Proof Chemistry</h5>
                      <p>Crafting mocktails, botanical syrups, infusions, and creative edible garnishes.</p>
                    </div>
                  </div>
                  <div className="module-item">
                    <span className="module-number">04</span>
                    <div className="module-content">
                      <h5>Bar Economics & Costing</h5>
                      <p>Recipe costing, pour margins, operational discipline, and personal branding in hospitality.</p>
                    </div>
                  </div>
                </div>

                <p style={{ margin: '16px 0 0', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  *Sessions provide practical hands-on experience and Bar Chef completion acknowledgment; does not imply externally accredited certification unless verified. Non-alcoholic format for general student cohorts. Alcoholic modules require applicable legal-age and venue eligibility; BarChef Bengaluru does not publish a blanket nationwide age rule.
                </p>
              </div>
            </details>
          </div>
        </div>

        <div className="service-planning-card">
          <h3>Plan Your Mixology Workshop</h3>
          <p>
            Whether planning an offsite team activity for your tech squad or an interactive campus masterclass,
            let’s customize the duration, group size, and module track for your attendees.
          </p>
          <Link className="button" href="/contact?service=workshops">
            Plan Your Workshop ↗
          </Link>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — CONCERTS AND MUSIC FESTIVALS
  else if (route === 'services' && id === 'concerts-music-festivals') {
    title = 'One Festival. Thousands of Moods.';
    label = 'FESTIVAL & CONCERT BARS';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/frames/08_music_festival/poster.webp"
            alt="One Festival. Thousands of Moods. — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            Bars designed for scale, speed and experience.
          </h2>
          <p className="service-intro-text">
            Live music creates a high-pressure, fast-moving bar environment where guest flow, clear menus, and thorough backstage prep
            matter as much as flavour and presentation. From managing massive concert crowds at Ben Böhmer live at Terra to multi-day music festivals,
            BarChef Bengaluru builds synchronized bar systems designed to maintain speed, revenue flow, and craft excellence.
          </p>
        </div>

        <div className="audience-bar">
          <span className="audience-label">Tailored For:</span>
          <span className="audience-pill">Festival Organisers</span>
          <span className="audience-pill">Event Promoters</span>
          <span className="audience-pill">Artist Management</span>
          <span className="audience-pill">Brand Activations</span>
        </div>

        <div className="service-callout-box">
          <span className="service-callout-tag">OPERATIONAL ARCHITECTURE</span>
          <p className="service-callout-quote">
            High-speed, high-volume systems built for peak crowd intervals.
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Tell us your date, venue, expected footfall, artist lineup, and operational needs to start planning:
          </p>
          <div className="service-callout-fields">
            <span className="service-field-pill">📅 Event Date & Timing</span>
            <span className="service-field-pill">📍 Venue Layout</span>
            <span className="service-field-pill">👥 Expected Footfall</span>
            <span className="service-field-pill">🎵 Artist Lineup & Genre</span>
            <span className="service-field-pill">⚡ Operational Needs</span>
          </div>
        </div>

        <h3 className="service-section-title">What Our Festival Program Includes</h3>

        <div className="service-features-list">
          <div className="service-feature-item">
            <h4>Thematic Cocktail & Mocktail Concepts</h4>
            <p>Curated drink names and flavour profiles aligned with your festival theme, genres, and headline artists.</p>
          </div>
          <div className="service-feature-item">
            <h4>Craft Bartending at Scale</h4>
            <p>Trained, high-speed bartending crews equipped with rapid speed rails, consistent pour counts, and calm hospitality.</p>
          </div>
          <div className="service-feature-item">
            <h4>Bar Layouts, Pre-Batching & Service Planning</h4>
            <p>Corridor flow mapping, point-of-sale staging, backstage pre-batching tanks, and inventory replenishment lanes.</p>
          </div>
          <div className="service-feature-item">
            <h4>Draft Beer Hubs & Specialty Stations</h4>
            <p>Segmented service hubs including high-throughput draft beer bars, rapid shooter bars, and artisanal mocktail counters.</p>
          </div>
          <div className="service-feature-item">
            <h4>Inventory, Ice & End-to-End Logistics</h4>
            <p>Full cold-chain logistics, food-grade clear ice management, stock tracking, and certified operational team leads.</p>
          </div>
          <div className="service-feature-item">
            <h4>Licensing & Excise Liaison Support</h4>
            <p>Practical licensing advisory, bar layouts, and excise documentation support (without implying guaranteed statutory approvals).</p>
          </div>
          <div className="service-feature-item" style={{ gridColumn: '1 / -1' }}>
            <h4>Branded Bar Design & Lighting-Ready Presentation</h4>
            <p>High-contrast visual menus, illuminated bar frontage, and clean aesthetic backdrops that stand out under concert stage lighting.</p>
          </div>
        </div>

        <div className="service-notice-box">
          <strong>Operational Discipline:</strong> Festival bars handle sudden surge waves before opening acts and during intermissions. While our layouts, speed-pour protocols, and batching infrastructure are engineered to maintain high-throughput service, we avoid absolute marketing claims such as “zero bottlenecks”. Practical capacity planning, queue management, and experienced supervisors keep the flow moving.
        </div>

        <div className="service-planning-card">
          <h3>Plan Your Festival Bar</h3>
          <p>
            Whether coordinating an outdoor electronic music festival or a multi-stage stadium concert,
            connect with our operations team to discuss crowd sizing, bar footprints, and beverage curation.
          </p>
          <Link className="button" href="/contact?service=concerts-music-festivals">
            Plan Your Festival Bar ↗
          </Link>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — COCKTAIL PROGRAM / CONSULTANCY
  else if (route === 'services' && id === 'cocktail-program') {
    title = 'We Don’t Just Make Drinks. We Build Bars.';
    label = 'BEVERAGE CONSULTANCY & PROGRAMS';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src="/images/cocktail-concept.png"
            alt="Cocktail Program & Beverage Consultancy — BarChef Bengaluru"
            loading="lazy"
          />
        </div>

        <div className="service-intro-block">
          <h2 className="service-intro-lead">
            We Don’t Just Make Drinks. We Build Bars.
          </h2>
          <p className="service-intro-text">
            A cocktail program needs to work for the people serving it as well as the guests enjoying it.
            BarChef Bengaluru partners with hospitality venues—craft cocktail bars, dining rooms, boutique hotels, breweries, and cafés—to build
            drinks programs that are commercially profitable, operationally disciplined, and creatively distinctive.
          </p>
        </div>

        <div className="audience-bar">
          <span className="audience-label">Consultancy For:</span>
          <span className="audience-pill">Cocktail Bars</span>
          <span className="audience-pill">Restaurants</span>
          <span className="audience-pill">Hotels</span>
          <span className="audience-pill">Craft Breweries</span>
          <span className="audience-pill">Specialty Cafés</span>
        </div>

        <h3 className="service-section-title">The Four Operational Pillars</h3>

        {/* Pillar 1 */}
        <details className="service-expandable" open>
          <summary className="service-expandable-summary">
            <span className="summary-title-wrap">
              <strong>01 / Menu Engineering</strong>
            </span>
            <span className="expand-indicator">+</span>
          </summary>
          <div className="expandable-body">
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              Concept development, venue identity alignment, signature cocktails, craft mocktails, spirit-forward classics, precise recipe costing, margin-optimised pricing, vendor mapping, and enticing menu copywriting.
            </p>
            <div style={{ backgroundColor: 'var(--bg-cream)', padding: '14px 18px', borderRadius: '4px', border: '1px solid var(--line-gold)', fontSize: '13px', color: 'var(--deep-bronze)' }}>
              <strong>Key Deliverables:</strong> Fully tested cocktail menu, standardized recipe cards with glassware & garnish specs, and master ingredient costing spreadsheet.
            </div>
          </div>
        </details>

        {/* Pillar 2 */}
        <details className="service-expandable" open>
          <summary className="service-expandable-summary">
            <span className="summary-title-wrap">
              <strong>02 / Pre-Batching & Syrup Lab</strong>
            </span>
            <span className="expand-indicator">+</span>
          </summary>
          <div className="expandable-body">
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              Craft syrup formulation, botanical cordials, service batching, dilution ratios, storage procedures, lacto-fermentation, clarification methods, rapid infusions, and fat-washing techniques.
            </p>
            <div style={{ backgroundColor: 'var(--bg-cream)', padding: '14px 18px', borderRadius: '4px', border: '1px solid var(--line-gold)', fontSize: '13px', color: 'var(--deep-bronze)' }}>
              <strong>Key Deliverables:</strong> 20+ recipe prep manual, batching volume calculator, and kitchen mise en place guides.
              <br />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                *Note: Describes the craft culinary service; BarChef Bengaluru provides operational kitchen standards and does not invent unverified food-safety or shelf-life claims.
              </span>
            </div>
          </div>
        </details>

        {/* Pillar 3 */}
        <details className="service-expandable">
          <summary className="service-expandable-summary">
            <span className="summary-title-wrap">
              <strong>03 / SOP Development</strong>
            </span>
            <span className="expand-indicator">+</span>
          </summary>
          <div className="expandable-body">
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              Comprehensive bar operating systems: opening setup routines, closing tear-down lists, speed rail organization, inventory tracking, wastage reduction, hygiene protocols, and pour quality audits.
            </p>
            <div style={{ backgroundColor: 'var(--bg-cream)', padding: '14px 18px', borderRadius: '4px', border: '1px solid var(--line-gold)', fontSize: '13px', color: 'var(--deep-bronze)' }}>
              <strong>Key Deliverables:</strong> Standard Operating Procedure (SOP) manual and laminated station checklists.
            </div>
          </div>
        </details>

        {/* Pillar 4 */}
        <details className="service-expandable">
          <summary className="service-expandable-summary">
            <span className="summary-title-wrap">
              <strong>04 / Comprehensive Staff Training</strong>
            </span>
            <span className="expand-indicator">+</span>
          </summary>
          <div className="expandable-body">
            <div className="module-list" style={{ marginBottom: '16px' }}>
              <div className="module-item">
                <span className="module-number">A</span>
                <div className="module-content">
                  <h5>Bartender Fundamentals</h5>
                  <p>Mixology theory, tool mechanics, ice handling, speed-pour ergonomics, and advanced lab prep.</p>
                </div>
              </div>
              <div className="module-item">
                <span className="module-number">B</span>
                <div className="module-content">
                  <h5>Floor & Service Team</h5>
                  <p>Menu flavour storytelling, guest preference pairing, upselling, and allergen awareness.</p>
                </div>
              </div>
              <div className="module-item">
                <span className="module-number">C</span>
                <div className="module-content">
                  <h5>Support & Barbacks</h5>
                  <p>Sanitation standards, crystal glassware care, bar replenishment cycles, and waste control.</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-cream)', padding: '14px 18px', borderRadius: '4px', border: '1px solid var(--line-gold)', fontSize: '13px', color: 'var(--deep-bronze)' }}>
              <strong>Standard Offer:</strong> Five-day intensive on-site training program, internal course completion certification, and a 30-day follow-up operational audit.
              <br />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                *Certification confirms internal curriculum completion; does not imply external or statutory academic accreditation.
              </span>
            </div>
          </div>
        </details>

        <h3 className="service-section-title">Consultancy Engagement Models</h3>

        <div className="consultancy-models-grid">
          {/* Model A */}
          <div className="consultancy-card">
            <span className="model-badge">MODEL A</span>
            <h4>Menu Revamp</h4>
            <div className="model-timeline">⏱️ 7 Days Total</div>
            <p>
              Fast-track refresh of your beverage offerings. Ideal for established venues wanting to modernize recipes, improve margins, and train existing staff.
            </p>
            <div className="model-deliverables-box">
              <strong>Inclusions:</strong>
              Tested menu curation, recipe cards, costing spreadsheets, and 2 days of on-site staff training.
            </div>
          </div>

          {/* Model B */}
          <div className="consultancy-card" style={{ borderColor: 'var(--gold)' }}>
            <span className="model-badge">MODEL B · FLAGSHIP</span>
            <h4>Complete Bar Setup</h4>
            <div className="model-timeline">⏱️ 21 Days Total</div>
            <p>
              End-to-end beverage architecture for new openings and major renovations. Includes station layout, lab prep manuals, complete SOPs, and opening night supervision.
            </p>
            <div className="model-deliverables-box">
              <strong>Inclusions:</strong>
              Full SOPs, syrup & fermentation lab, batching calculator, 5-day intensive staff training, and opening support.
            </div>
          </div>

          {/* Model C */}
          <div className="consultancy-card">
            <span className="model-badge">MODEL C</span>
            <h4>Retainer & Advisory</h4>
            <div className="model-timeline">⏱️ Monthly Ongoing</div>
            <p>
              Continuous beverage leadership. Keeps your bar at the forefront of Bangalore and national drink trends with regular quality monitoring.
            </p>
            <div className="model-deliverables-box">
              <strong>Inclusions:</strong>
              Monthly mystery audits, quarterly seasonal menu refreshes, supplier cost audits, and advanced masterclasses.
            </div>
          </div>
        </div>

        <div className="service-callout-box">
          <span className="service-callout-tag">INITIAL CONSULTATION BRIEF</span>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Tell us about your venue to explore consultancy options:
          </p>
          <div className="service-callout-fields">
            <span className="service-field-pill">🏢 Venue Type (Bar, Restaurant, Hotel, Brewery, Café)</span>
            <span className="service-field-pill">📐 Venue Size / Footprint</span>
            <span className="service-field-pill">💡 Concept & Brand Identity</span>
            <span className="service-field-pill">👥 Team Strength</span>
          </div>
        </div>

        <div className="service-planning-card">
          <h3>Let’s Build Your Bar.</h3>
          <p>
            Whether revamping an existing cocktail menu or launching a flagship bar concept from the ground up,
            let’s connect to build an experience that performs.
          </p>
          <Link className="button" href="/contact?service=cocktail-program">
            Let’s Build Your Bar ↗
          </Link>
        </div>
      </div>
    );
  }

  // ROUTE: Individual Service Page — FALLBACK FOR OTHER SERVICES
  else if (route === 'services' && service) {
    title = service.title;
    label = 'THE EXPERIENCE';
    const heroImg = SERVICE_IMAGES[service.slug] || '/frames/06_wedding/poster.webp';
    body = (
      <div className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src={heroImg}
            alt={`${service.title} - Bar Chef Bengaluru`}
            loading="lazy"
          />
        </div>
        <div className="service-intro-block">
          <h2 className="service-intro-lead">{service.tagline}</h2>
          <Copy text={service.body} />
        </div>
        <div className="service-planning-card">
          <h3>Let’s start with your occasion.</h3>
          <p>Share your date, venue, estimated guest count, and favourite flavours. We’ll curate the right bar program with you.</p>
          <Link className="button" href={'/contact?service=' + service.slug}>
            Plan this experience ↗
          </Link>
        </div>
        <p className="note">Service description is an editorial overview. Inclusions, glassware, and menu directions are confirmed individually.</p>
      </div>
    );
  }

  // ROUTE: Services Directory Page (SERVICE INDEX)
  else if (route === 'services') {
    title = 'Every occasion. A different story.';
    label = 'OUR EXPERIENCES';
    body = (
      <div>
        <p style={{ maxWidth: '720px', color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '44px' }}>
          From intimate house parties and milestone birthdays to grand multi-day weddings and live music festivals,
          BarChef Bengaluru builds bespoke cocktail bar programs tailored around people, atmosphere, and seamless execution.
        </p>

        <div className="occasions-editorial-grid">
          {data.services.map((s, i) => {
            const img = SERVICE_IMAGES[s.slug] || '/frames/06_wedding/poster.webp';
            const isWide = i === 0 || i === 1;
            return (
              <div className={`occasion-card ${isWide ? 'feature-wide' : ''}`} key={s.slug}>
                <div className="occasion-img-wrap">
                  <img
                    src={img}
                    alt={`${s.title} by Bar Chef Bengaluru`}
                    loading="lazy"
                    width={720}
                    height={450}
                  />
                </div>
                <div className="occasion-content">
                  <span className="eyebrow">0{i + 1} / {s.title.toUpperCase()}</span>
                  <h3>{s.tagline || s.title}</h3>
                  <p>{s.intro || s.body.split('\n')[0]}</p>
                  <Link href={'/services/' + s.slug} className="button small">
                    Explore {s.title} ↗
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ROUTE: Individual Blog Article
  else if (route === 'blogs' && blog) {
    title = blog.title;
    label = blog.category;
    const heroImg = BLOG_IMAGES[blog.slug] || (blog.alias && BLOG_IMAGES[blog.alias]) || '/frames/02_cocktail_falling/poster.webp';
    body = (
      <article className="service-detail-container">
        <div className="service-hero-banner">
          <img
            src={heroImg}
            alt={blog.title}
            loading="lazy"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ padding: '4px 10px', backgroundColor: 'var(--bg-cream)', border: '1px solid var(--line-gold)', borderRadius: '4px', fontSize: '11px', color: 'var(--deep-bronze)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            EDITORIAL DRAFT · IN REVIEW
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Category: {blog.category} · {Math.ceil(blog.body.split(/\s+/).length / 180)} min read
          </span>
        </div>
        <div className="service-intro-block">
          <Copy text={blog.body} />
        </div>
        <div className="service-planning-card" style={{ marginTop: '48px' }}>
          <h3>Curate a Bar for Your Celebration</h3>
          <p>
            From bespoke weddings and private gatherings to high-volume concerts and cocktail consultancy,
            let’s design an experience tailored to your occasion.
          </p>
          <Link className="button" href="/contact">
            Plan Your Experience ↗
          </Link>
        </div>
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
          <Link className="text-link" href="/blogs">
            ← Back to all journal articles
          </Link>
        </div>
      </article>
    );
  }

  // ROUTE: Blogs Directory Page
  else if (route === 'blogs') {
    title = 'Stories behind the serve.';
    label = 'THE JOURNAL';
    body = (
      <div>
        <p style={{ maxWidth: '720px', color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '40px' }}>
          Curated editorial drafts exploring cocktail menu engineering, wedding function pacing, birthday rituals, mixology workshop takeaways, and festival operational design.
        </p>
        <div className="journal-grid">
          {data.blogs.map((b, i) => {
            const img = BLOG_IMAGES[b.slug] || (b.alias && BLOG_IMAGES[b.alias]) || '/frames/02_cocktail_falling/poster.webp';
            return (
              <Link href={'/blogs/' + b.slug} className="journal-card" key={b.slug}>
                <div style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: '4px', marginBottom: '14px', border: '1px solid var(--line)' }}>
                  <img
                    src={img}
                    alt={b.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="eyebrow" style={{ margin: 0 }}>
                    0{i + 1} / {b.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--deep-bronze)', fontWeight: 600, textTransform: 'uppercase', backgroundColor: 'var(--bg-cream)', padding: '2px 6px', borderRadius: '3px' }}>
                    EDITORIAL DRAFT
                  </span>
                </div>
                <h2>{b.title}</h2>
                <p>{b.excerpt}</p>
                <span>Read article ↗</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ROUTE: Contact / Inquiry Page
  else if (route === 'contact') {
    title = 'What do you want to experience?';
    label = 'LET’S BEGIN';
    body = <Inquiry />;
  }

  // ROUTE: Gallery Page (Interactive Filterable Lightbox)
  else if (route === 'gallery') {
    title = 'Moments worth remembering.';
    label = 'THE GALLERY';
    body = <GalleryView />;
  }

  // ROUTE: Testimonials Page (Genuine Verified Gathering Feedback Only)
  else if (route === 'testimonials') {
    title = 'From the other side of the bar.';
    label = 'VERIFIED GUEST STORIES';
    body = (
      <div>
        <p style={{ maxWidth: '680px', color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '40px' }}>
          Genuine feedback and documented moments from hosts, wedding planners, and festival organizers whose celebrations and bar programs were operated by BarChef Bengaluru.
        </p>
        <div className="testimonials-editorial-grid">
          {TESTIMONIAL_ITEMS.map((item, i) => (
            <div className="testimonial-editorial-card" key={i}>
              <p className="testimonial-quote">{item.quote}</p>
              <div className="testimonial-author-wrap">
                <div>
                  <span className="testimonial-author">{item.author}</span>
                  <span className="testimonial-role">{item.role} · {item.location}</span>
                </div>
                <span className="testimonial-event-badge">{item.badge}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="service-planning-card" style={{ marginTop: '60px' }}>
          <h3>Host your next celebration with Bar Chef</h3>
          <p>Let’s discuss your vision and curate an unforgettable cocktail experience for your guests.</p>
          <Link className="button" href="/contact">
            Plan your event ↗
          </Link>
          <p className="note" style={{ marginTop: '16px' }}>
            Only genuine supplied gathering feedback is published. BarChef Bengaluru does not display fabricated ratings or unapproved client logos.
          </p>
        </div>
      </div>
    );
  }

  else {
    notFound();
  }

  return (
    <main id="main" className="interior">
      <div className="page-heading">
        <div className="content-container">
          <Link href="/" className="eyebrow">
            HOME / {label}
          </Link>
          <h1>{title}</h1>
        </div>
      </div>
      <section className="section page-body">
        <div className="content-container">{body}</div>
      </section>
    </main>
  );
}
