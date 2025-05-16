'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginButton() {
  const { isAuthenticated, logout } = useAuth();
  const params = useParams();
  const lang = params.lang || 'en';
  
  console.log('LoginButton rendering, isAuthenticated:', isAuthenticated);

  return isAuthenticated ? (
    <div className="flex gap-4">
      <Link
        href={`/${lang}/write`}
        className="text-indigo-600 hover:text-indigo-500 font-medium"
      >
        Write
      </Link>
      <button
        onClick={logout}
        className="text-gray-600 hover:text-gray-500 font-medium"
      >
        Logout
      </button>
    </div>
  ) : (
    <Link
      href={`/${lang}/login`}
      className="text-indigo-600 hover:text-indigo-500 font-medium"
    >
      Login
    </Link>
  );
} 