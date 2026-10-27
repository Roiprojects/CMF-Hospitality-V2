import type { MetadataRoute } from 'next';
import data from '@/content/data.json';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cmf-hospitality.vercel.app').replace(/\/$/, '');
  const now = new Date();

  const coreRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: 'about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'gallery', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'blogs', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: 'testimonials', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: 'contact', priority: 0.9, changeFrequency: 'monthly' as const }
  ];

  const serviceRoutes = data.services.map((s) => ({
    path: `services/${s.slug}`,
    priority: 0.85,
    changeFrequency: 'monthly' as const
  }));

  const blogRoutes = data.blogs.map((b) => ({
    path: `blogs/${b.slug}`,
    priority: 0.75,
    changeFrequency: 'monthly' as const
  }));

  const allRoutes = [...coreRoutes, ...serviceRoutes, ...blogRoutes];

  return allRoutes.map((route) => ({
    url: route.path ? `${siteUrl}/${route.path}/` : `${siteUrl}/`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
