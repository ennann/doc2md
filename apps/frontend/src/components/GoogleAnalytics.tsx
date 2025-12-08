'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Type definitions for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Only load GA in production with valid ID
  const shouldLoadGA = 
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' && 
    GA_MEASUREMENT_ID && 
    GA_MEASUREMENT_ID.startsWith('G-');

  // Track page views on route change
  useEffect(() => {
    if (!shouldLoadGA || typeof window === 'undefined' || !window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }, [pathname, searchParams, shouldLoadGA]);

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return null;
  }

  if (!shouldLoadGA) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Google Consent Mode V2
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'granted'
            });
            
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
