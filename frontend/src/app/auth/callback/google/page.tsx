'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the access_token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');

        if (!accessToken) {
          throw new Error('No access token provided');
        }

        // Validate the token with Strapi
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/google/callback?access_token=${accessToken}`);
        
        if (!response.ok) {
          throw new Error('Failed to validate token');
        }

        const data = await response.json();

        // Store the JWT token
        localStorage.setItem('token', data.jwt);
        
        // Get the stored language or default to 'en'
        const lang = localStorage.getItem('login_redirect_lang') || 'en';
        localStorage.removeItem('login_redirect_lang'); // Clean up

        // Redirect to the write page
        router.push(`/${lang}/write`);
      } catch (error) {
        console.error('Google callback error:', error);
        const lang = localStorage.getItem('login_redirect_lang') || 'en';
        router.push(`/${lang}/login?error=1`);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing login...</h2>
        <p className="text-gray-500">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
} 