'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      router.push(`/${lang}/login`);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, lang]);

  const handleWriteArticle = () => {
    router.push(`/${lang}/write`);
  };

  const handleManageContent = () => {
    window.location.href = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:1337/admin';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Management</h2>
              <div className="space-y-4">
                <button
                  onClick={handleWriteArticle}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Write an Article
                </button>
                <button
                  onClick={handleManageContent}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Manage Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 