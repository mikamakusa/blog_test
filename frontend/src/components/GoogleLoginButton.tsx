'use client';

import { FcGoogle } from 'react-icons/fc';

interface GoogleLoginButtonProps {
  lang: string;
}

export default function GoogleLoginButton({ lang }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/connect/google`;
    // Store the current language for after login redirect
    localStorage.setItem('login_redirect_lang', lang);
    // Redirect to Google auth
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <FcGoogle className="w-5 h-5" />
      <span>Continue with Google</span>
    </button>
  );
} 