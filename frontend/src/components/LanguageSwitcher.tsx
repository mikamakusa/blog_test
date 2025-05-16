'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { i18n, Locale } from '@/i18n/settings'

export default function LanguageSwitcher() {
  const pathName = usePathname()
  
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/'
    
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div className="flex gap-4 items-center">
      <span className="text-sm text-gray-600">Language:</span>
      <ul className="flex gap-3">
        {i18n.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={redirectedPathName(locale)}
              className={`px-3 py-1 rounded-md text-sm ${
                pathName?.split('/')[1] === locale
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {locale.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
} 