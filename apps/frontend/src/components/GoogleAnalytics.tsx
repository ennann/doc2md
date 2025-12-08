'use client';

import Script from 'next/script';

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
  // Only load GA in production with valid ID
  if (
    process.env.NODE_ENV !== 'production' ||
    !GA_MEASUREMENT_ID ||
    !GA_MEASUREMENT_ID.startsWith('G-')
  ) {
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
            
            // Track client-side navigation (SPA)
            (function() {
              let lastPath = window.location.pathname;
              const observer = new MutationObserver(function() {
                const currentPath = window.location.pathname;
                if (currentPath !== lastPath) {
                  lastPath = currentPath;
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: currentPath
                  });
                }
              });
              observer.observe(document, { subtree: true, childList: true });
            })();
          `,
        }}
      />
    </>
  );
}
