import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react'

export const MATOMO_CONFIG = createInstance({
    urlBase: process.env.NEXT_PUBLIC_MATOMO_URL || 'https://your-matomo-instance.com',
    siteId: 1,
    trackerUrl: process.env.NEXT_PUBLIC_MATOMO_URL + '/matomo.php',
    srcUrl: process.env.NEXT_PUBLIC_MATOMO_URL + '/tracking.js',
    disabled: false,
    heartBeat: {
        active: true,
        seconds: 10
    },
    linkTracking: false,
    configurations: {
        disableCookies: true,
        setSecureCookie: true,
        setRequestMethod: 'POST'
    }
})