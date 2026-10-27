import type { Metadata, Viewport } from 'next';
import Shell from '@/components/Shell';
import './globals.css';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cmf-hospitality.vercel.app').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bar Chef Bengaluru — Bespoke Cocktail & Bar Experiences',
    template: '%s | Bar Chef Bengaluru'
  },
  description: 'Bespoke cocktail and bar experiences for weddings, private gatherings, milestone birthdays, and live concerts in Bengaluru and destination celebrations.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Bar Chef Bengaluru — Bespoke Cocktail & Bar Experiences',
    description: 'Bespoke cocktail and bar experiences for weddings, private gatherings, milestone birthdays, and live concerts in Bengaluru and destination celebrations.',
    url: SITE_URL,
    siteName: 'Bar Chef Bengaluru',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/logo.jpg',
        width: 600,
        height: 400,
        alt: 'Bar Chef Bengaluru'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bar Chef Bengaluru — Bespoke Cocktail & Bar Experiences',
    description: 'Bespoke cocktail and bar experiences for weddings, private gatherings, milestone birthdays, and live concerts.',
    images: ['/images/logo.jpg']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bar Chef'
  }
};

export const viewport: Viewport = {
  themeColor: '#091011',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Bar Chef Bengaluru',
  description: 'Bespoke cocktail and bar experiences for weddings, private gatherings, milestone birthdays, and live concerts in Bengaluru and destination celebrations.',
  url: SITE_URL,
  telephone: '+919945379333',
  image: `${SITE_URL}/images/logo.jpg`,
  hasMap: 'https://share.google/Jat8wcj5yzHFEXLfV',
  sameAs: [
    'https://www.instagram.com/barchefbengaluru/',
    'https://www.instagram.com/pure_fruit_fresh/'
  ],
  founder: [
    { '@type': 'Person', name: 'Monish Raj D A' },
    { '@type': 'Person', name: 'Bharath Venkatesh' }
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN'
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Bengaluru and Destination Celebrations'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
