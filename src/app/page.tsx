import StoryExperience from '@/components/StoryExperience';
import Link from 'next/link';
import data from '@/content/data.json';

// Service photography mapping using authentic bespoke assets (Zero duplicates across all sections)
const SERVICE_IMAGES: Record<string, string> = {
  weddings: '/images/wedding-reception-bar.jpg',
  birthdays: '/images/birthday-shot-ritual.jpg',
  'house-parties': '/images/house-party-terrace.jpg',
  workshops: '/images/mixology-workshop.jpg',
  'corporate-events': '/images/mixology-workshop.jpg',
  'concerts-music-festivals': '/images/festival-operations.jpg',
  'cocktail-program': '/images/cocktail-lab-syrups.jpg'
};

const BLOG_IMAGES: Record<string, string> = {
  // 1. Weddings
  'planning-a-wedding-bar-across-multiple-functions': '/frames/06_wedding/poster.webp',
  'planning-a-personal-wedding-bar': '/frames/06_wedding/poster.webp',
  // 2. House Parties
  'designing-a-house-party-cocktail-menu-for-your-guests': '/frames/07_rooftop_party/poster.webp',
  'house-party-bar-planning': '/frames/07_rooftop_party/poster.webp',
  // 3. Birthdays
  'personalising-a-birthday-bar-experience': '/images/birthday-blowout.webp',
  'personalised-birthday-bar-ideas': '/images/birthday-blowout.webp',
  // 4. Workshops
  'what-teams-can-learn-in-a-mixology-workshop': '/frames/03_lemon_garnish/poster.webp',
  'planning-a-cocktail-workshop': '/frames/03_lemon_garnish/poster.webp',
  // 5. Festivals
  'how-festival-bar-planning-supports-faster-service': '/frames/08_music_festival/poster.webp',
  'festival-bar-flow-and-consistency': '/frames/08_music_festival/poster.webp',
  // 6. Cocktail Program
  'what-a-complete-cocktail-consultancy-program-includes': '/images/cocktail-concept.png',
  'cocktail-program-beyond-the-menu': '/images/cocktail-concept.png'
};

export default function Home() {
  return (
    <main id="main">
      {/* Cinematic 1080p Scroll-Controlled Story Experience */}
      <StoryExperience />

      {/* Chapter 02: The People & Founders Story */}
      <section className="section cream" id="story">
        <div className="content-container">
          <div className="story">
            <div data-reveal>
              <span className="eyebrow">02 / THE PEOPLE</span>
              <h2>
                Two bartenders.
                <br />
                One very
                <br />
                <em>big vision.</em>
              </h2>
              <div className="story-copy">
                <span className="ornament">BC /</span>
                <p>
                  We create the experience around the bar — from the cocktail and presentation to the
                  service, interaction and overall guest journey.
                </p>
                <p>
                  Founded by <strong>Monish Raj D A</strong> and <strong>Bharath Venkatesh</strong>, Bar Chef Bengaluru
                  brings together cocktail creativity, hospitality, and rigorous operational preparation across 250+ celebrations.
                </p>
                <Link className="text-link" href="/about">
                  Meet the founders & story ↗
                </Link>
              </div>
            </div>

            <div className="editorial-media-card" data-reveal>
              <div className="editorial-img-frame">
                <img
                  src="/images/founders.jpg"
                  alt="Founders Monish Raj D A and Bharath Venkatesh crafting cocktails at Bar Chef Bengaluru"
                  loading="lazy"
                  width={720}
                  height={480}
                />
              </div>
              <div className="editorial-caption-bar">
                <span className="editorial-badge">BENGALURU CRAFT</span>
                <p className="editorial-note">“We don’t just pour drinks. We build experiences around people.”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 03: Cocktail Lab / The Craft */}
      <section className="craft section" id="craft">
        <div className="content-container">
          <p className="eyebrow" data-reveal>
            03 / THE CRAFT
          </p>
          <h2 data-reveal>
            Where ideas
            <br />
            become <em>experiences.</em>
          </h2>
          <div className="craft-bottom">
            <p>
              Every flavour. Every garnish. Every detail.
              <br />
              Our Cocktail Lab is where ideas are explored,
              <br />
              tested and refined before they reach your event.
            </p>
            <Link href="/about#our-cocktail-lab" className="button">
              Inside the Cocktail Lab ↗
            </Link>
          </div>
        </div>
      </section>

      {/* Chapter 04: Varied Editorial Occasions Showcase */}
      <section className="section" id="experiences">
        <div className="content-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">04 / YOUR OCCASION</p>
              <h2>
                Every occasion.
                <br />
                <em>A different story.</em>
              </h2>
            </div>
            <p>
              The people. The place. The atmosphere.
              <br />
              We build the entire bar program around your guests.
            </p>
          </div>

          {/* Varied Editorial Cards (No identical generic grids) */}
          <div className="occasions-editorial-grid">
            {/* Feature 1: Weddings (Large 7-Col Feature) */}
            <div className="occasion-card feature-wide" data-reveal>
              <div className="occasion-img-wrap">
                <img
                  src={SERVICE_IMAGES['weddings']}
                  alt="One Wedding. Many Different Moods. — BarChef Bengaluru"
                  loading="lazy"
                  width={960}
                  height={540}
                />
              </div>
              <div className="occasion-content">
                <span className="eyebrow">01 / WEDDINGS</span>
                <h3>One Wedding. Many Different Moods.</h3>
                <p>
                  From mehendi to reception, we tailor the bar for each function. Intimate haldi ceremonies,
                  grand receptions, and multi-day destination celebrations.
                </p>
                <Link href="/services/weddings" className="button small">
                  Plan Your Wedding Bar ↗
                </Link>
              </div>
            </div>

            {/* Feature 2: Birthdays (5-Col Feature) */}
            <div className="occasion-card" data-reveal>
              <div className="occasion-img-wrap">
                <img
                  src={SERVICE_IMAGES['birthdays']}
                  alt="Not Just a Birthday. A Blowout. — BarChef Bengaluru"
                  loading="lazy"
                  width={640}
                  height={420}
                />
              </div>
              <div className="occasion-content">
                <span className="eyebrow">02 / BIRTHDAYS</span>
                <h3>Not Just a Birthday. A Blowout.</h3>
                <p>
                  A birthday is personal. The bar should be too. Signature birthday shot rituals, flair mixing,
                  and high-energy bars tailored to the guest mix.
                </p>
                <Link href="/services/birthdays" className="button small">
                  Plan Birthday Blowout ↗
                </Link>
              </div>
            </div>

            {/* Feature 3: House Parties & Rooftops (6-Col Feature) */}
            <div className="occasion-card" data-reveal>
              <div className="occasion-img-wrap">
                <img
                  src={SERVICE_IMAGES['house-parties']}
                  alt="Hosting at Home & Rooftop Gatherings — BarChef Bengaluru"
                  loading="lazy"
                  width={640}
                  height={420}
                />
              </div>
              <div className="occasion-content">
                <span className="eyebrow">03 / PRIVATE GATHERINGS</span>
                <h3>House Parties & Rooftops</h3>
                <p>
                  Personalised menus, compact modular bar setups, craft cocktails and zero-proof serves tailored to your home or terrace.
                </p>
                <Link href="/services/house-parties" className="text-link">
                  Plan House Party Bar ↗
                </Link>
              </div>
            </div>

            {/* Feature 4: Concerts & Music Festivals (6-Col Feature) */}
            <div className="occasion-card" data-reveal>
              <div className="occasion-img-wrap">
                <img
                  src={SERVICE_IMAGES['concerts-music-festivals']}
                  alt="Music festival high volume cocktail bar"
                  loading="lazy"
                  width={640}
                  height={420}
                />
              </div>
              <div className="occasion-content">
                <span className="eyebrow">04 / HIGH ENERGY</span>
                <h3>Concerts & Festivals</h3>
                <p>
                  High-speed, high-volume operational systems designed to serve thousands without sacrificing cocktail quality or presentation.
                </p>
                <Link href="/services/concerts-music-festivals" className="text-link">
                  Festival Bars ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 05: Behind The Experience / Operational Pillars */}
      <section className="section cream">
        <div className="content-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">05 / BEHIND THE EXPERIENCE</p>
              <h2>
                Effortless takes
                <br />
                <em>preparation.</em>
              </h2>
            </div>
            <p>
              What guests see is only the final part.
              <br />
              Behind it: preparation, batching, logistics, bar layout,
              <br />
              team coordination, and rigorous SOPs.
            </p>
          </div>
          <div className="pillars">
            {[
              ['Think creatively.', 'Designing cocktail concepts and flavours tailored directly to guest expectations.'],
              ['Plan thoroughly.', 'Meticulous mise en place, craft ice, fresh prep, logistics, and backup systems.'],
              ['Execute professionally.', 'Fast, gracious, consistent service that keeps queues short and guests delighted.']
            ].map(([title, desc], i) => (
              <div key={title} data-reveal>
                <span>0{i + 1} / PRINCIPLE</span>
                <h3>{title}</h3>
                <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Stories / Prestigious Celebrations Showcase */}
      <section className="section white">
        <div className="content-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">TESTIMONIALS & MOMENTS</p>
              <h2>
                From the other side
                <br />
                <em>of the bar.</em>
              </h2>
            </div>
            <Link href="/testimonials" className="text-link">
              All guest stories ↗
            </Link>
          </div>

          <div className="testimonials-editorial-grid">
            <div className="testimonial-editorial-card" data-reveal>
              <p className="testimonial-quote">
                “The bar was the undisputed centerpiece of our celebration in Udaipur. Monish and Bharath crafted cocktails that our guests are still raving about months later.”
              </p>
              <div className="testimonial-author-wrap">
                <div>
                  <span className="testimonial-author">VIROSH Wedding</span>
                  <span className="testimonial-role">Destination Wedding · Udaipur, Rajasthan</span>
                </div>
                <span className="testimonial-event-badge">Destination</span>
              </div>
            </div>

            <div className="testimonial-editorial-card" data-reveal>
              <p className="testimonial-quote">
                “Handling a high-energy live concert crowd of thousands while maintaining craft cocktail consistency is rare. Bar Chef Bengaluru delivered flawless flow at Terra.”
              </p>
              <div className="testimonial-author-wrap">
                <div>
                  <span className="testimonial-author">Ben Böhmer Live Concert</span>
                  <span className="testimonial-role">Terra Live Music · Bengaluru</span>
                </div>
                <span className="testimonial-event-badge">Concert</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* From The Journal */}
      <section className="section">
        <div className="content-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM THE JOURNAL</p>
              <h2>
                A little <em>inspiration.</em>
              </h2>
            </div>
            <Link href="/blogs" className="text-link">
              All stories ↗
            </Link>
          </div>
          <div className="journal-grid">
            {data.blogs.slice(0, 3).map((b, i) => (
              <Link className="journal-card" href={'/blogs/' + b.slug} key={b.slug}>
                <div className="journal-card-img" style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '4px', marginBottom: '8px' }}>
                  <img
                    src={BLOG_IMAGES[b.slug] || '/frames/02_cocktail_falling/poster.webp'}
                    alt={b.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="eyebrow">
                  0{i + 1} / {b.category}
                </span>
                <h3>{b.title}</h3>
                <p>{b.excerpt}</p>
                <span>Read story ↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
