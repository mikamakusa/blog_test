import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MATOMO_CONFIG } from '@/config/matomo';

declare global {
  interface Window {
    _paq: any[];
  }
}

export const useMatomo = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Matomo if not already initialized
    if (typeof window !== 'undefined' && !window._paq) {
      window._paq = [];
      
      // Configure Matomo
      window._paq.push(['setTrackerUrl', MATOMO_CONFIG.trackerUrl]);
      window._paq.push(['setSiteId', MATOMO_CONFIG.siteId]);
      window._paq.push(['enableLinkTracking', MATOMO_CONFIG.enableLinkTracking]);
      window._paq.push(['requireConsent', MATOMO_CONFIG.requireConsent]);
      //window._paq.push(['trackInitialView', MATOMO_CONFIG.trackInitialView]);
      window._paq.push(['disableCookies', MATOMO_CONFIG.disableCookies]);
      window._paq.push(['enableJSErrorTracking', MATOMO_CONFIG.enableJSErrorTracking]);

      // Load Matomo script
      const script = document.createElement('script');
      script.async = true;
      script.src = `${MATOMO_CONFIG.urlBase}/matomo.js`;
      document.head.appendChild(script);
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window._paq) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window._paq.push(['setCustomUrl', url]);
      window._paq.push(['trackPageView']);
    }
  }, [pathname, searchParams]);

  // Helper functions for tracking events
  const trackEvent = (category: string, action: string, name?: string, value?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['trackEvent', category, action, name, value]);
    }
  };

  const trackGoal = (goalId: number, value?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['trackGoal', goalId, value]);
    }
  };

  const trackSearch = (keyword: string, category?: string, resultCount?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['trackSiteSearch', keyword, category, resultCount]);
    }
  };

  return {
    trackEvent,
    trackGoal,
    trackSearch,
  };
};