import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'zh-cn', 'zh-hk', 'zh-tw', 'ja', 'fr', 'de', 'es', 'pt-br', 'ko', 'it'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // Check if locale is in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) return pathnameLocale;

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())
      .find((lang) => {
        // Exact match first (e.g. zh-tw)
        if (locales.includes(lang)) return true;
        
        // Partial match (e.g. zh match zh-cn)
        // logic: if user lang is 'zh', map to 'zh-cn'. 
        // if user lang is 'zh-cn', map to 'zh-cn'.
        // if user lang is 'zh-hk', map to 'zh-hk'.
        return false;
      });
      
    // Custom mapping for zh
    if (preferredLocale) {
        return preferredLocale;
    }
    
    // Fallback: Check prefixes
    const bestMatch = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())
      .map(lang => {
          if (lang === 'zh') return 'zh-cn';
          if (lang === 'zh-hant') return 'zh-tw';
          if (lang.startsWith('zh-')) return locales.includes(lang) ? lang : 'zh-cn';
          return lang.split('-')[0];
      })
      .find(lang => locales.includes(lang));

    if (bestMatch) return bestMatch;
  }

  return defaultLocale;
}


export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files, sitemap, robots)
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico).*)',
  ],
};
