'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          throw new Error('No token provided');
        }

        // Store the token
        localStorage.setItem('token', token);
        
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