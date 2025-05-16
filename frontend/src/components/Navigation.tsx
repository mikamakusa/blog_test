'use client';

import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import LoginButton from './LoginButton';

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Blog
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 