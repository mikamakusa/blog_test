import { redirect } from 'next/navigation'
import { i18n } from '@/i18n/settings'
import AdDisplay from '@/components/AdDisplay'

export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`)
}

export function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Top ad */}
      <div className="mb-8">
        <AdDisplay position="top" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="md:col-span-2">
          {/* Your main content here */}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Sidebar ad - temporarily showing top ads until we have sidebar ads */}
          <AdDisplay position="top" limit={2} />
          
          {/* Other sidebar content */}
        </div>
      </div>
    </main>
  );
}