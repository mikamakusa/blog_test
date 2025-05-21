import {env} from "@strapi/utils";

export default {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      providers: {
        google: {
          enabled: true,
          icon: 'google',
          key: process.env.GOOGLE_CLIENT_ID,
          secret: process.env.GOOGLE_CLIENT_SECRET,
          callback: '/api/auth/google/callback',
          scope: ['email', 'profile'],
        },
      },
    },
  },
  matomo: {
    config: {
      widgetURL: env('MATOMO_WIDGET_URL'),
    }
  }
}; 