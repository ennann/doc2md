/**
 * Google Analytics utility functions
 * Use these helpers to track custom events throughout your application
 */

// Event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track file conversions
export const trackConversion = (fileType: string, fileSize: number) => {
  trackEvent('conversion', 'Document', fileType, fileSize);
};

// Track download events
export const trackDownload = (fileType: string) => {
  trackEvent('download', 'File', fileType);
};

// Track errors
export const trackError = (errorMessage: string, errorType: string) => {
  trackEvent('error', errorType, errorMessage);
};

// Track user engagement
export const trackEngagement = (action: string, label?: string) => {
  trackEvent(action, 'Engagement', label);
};

// Type augmentation for window.gtag
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
