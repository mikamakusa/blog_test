export const strapiConfig = {
  baseUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  apiToken: process.env.NEXT_PUBLIC_STRAPI_URL,
  endpoints: {
    users: '/api/users',
    auth: '/api/auth/local',
  },
}; 