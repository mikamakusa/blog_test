export const MATOMO_CONFIG = {
  urlBase: process.env.NEXT_PUBLIC_MATOMO_URL || 'http://localhost:8080',
  siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '1',
  trackerUrl: process.env.NEXT_PUBLIC_MATOMO_URL + '/matomo.php',
  enableLinkTracking: true,
  requireConsent: true,
  trackInitialView: true,
  disableCookies: false,
  enableJSErrorTracking: true,
}; 