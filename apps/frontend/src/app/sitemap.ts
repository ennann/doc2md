import { MetadataRoute } from 'next';

// Required for static export
export const dynamic = 'force-static';

const BASE_URL = 'https://doc2md.org';

// Supported locales
const locales = [
  'en', 
  'fr', 
  'de', 
  'ja', 
  'es', 
  'pt-br', 
  'it', 
  'ko', 
  'zh-cn', 
  'zh-hk', 
  'zh-tw'
] as const;

// Pages to include in sitemap
const pages = [
  '',        // Home
  '/privacy',
  '/support'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Root/Default entries (redirects to default locale usually, but good to have)
  /* 
     For strictly correct sitemaps in Next.js i18n, we usually list each locale variant URL.
     Google recommends using hreflang, which sitemap.ts supports via 'alternates'.
  */

  pages.forEach((page) => {
    // Generate an entry for each locale version of the page
    locales.forEach((locale) => {
      const url = `${BASE_URL}/${locale}${page === '' ? '' : page}`;
      
      // Calculate priority
      let priority = 0.5;
      if (page === '') priority = 1.0;
      else if (page === '/privacy') priority = 0.5;
      else if (page === '/support') priority = 0.8;

      // Calculate changefreq
      let changeFrequency: 'monthly' | 'weekly' | 'daily' | 'always' | 'hourly' | 'yearly' | 'never' = 'monthly';
      if (page === '') changeFrequency = 'weekly';

      // Build alternates (rel="alternate" hreflang="x")
      // This maps other language versions of the SAME page
      const languages: Record<string, string> = {};
      locales.forEach((l) => {
        languages[l] = `${BASE_URL}/${l}${page === '' ? '' : page}`;
      });
      // Add x-default (usually English or a specific landing page)
      languages['x-default'] = `${BASE_URL}/en${page === '' ? '' : page}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages,
        },
      });
    });
  });

  // Also verify root URLs if necessary, but with Next.js middleware handling redirects, 
  // listing locale-specific URLs is the standard correct approach for SEO.

  return sitemapEntries;
}
