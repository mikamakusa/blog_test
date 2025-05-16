export function checkEnvironment() {
  console.log('Environment Check:');
  console.log('NEXT_PUBLIC_STRAPI_URL:', process.env.NEXT_PUBLIC_STRAPI_URL);
  
  if (!process.env.NEXT_PUBLIC_STRAPI_URL) {
    console.error('WARNING: NEXT_PUBLIC_STRAPI_URL is not set!');
    return false;
  }
  
  return true;
} 