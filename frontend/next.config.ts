/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
    NEXT_PUBLIC_WRITE_SERVICE_URL: process.env.NEXT_PUBLIC_WRITE_SERVICE_URL || 'http://localhost:3001',
  },
  // Enable environment variables
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Ensure environment variables are loaded
  webpack: (config: any) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
