import { i18n } from '@/i18n/settings'
import { Locale } from '@/i18n/settings'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

interface LayoutProps {
  children: React.ReactNode
  params: { lang: Locale }
}

export default async function LocaleLayout(props: LayoutProps) {
  const { lang } = await Promise.resolve(props.params)

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-700 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-bold">Blog d'un geek infiltré</div>
          <LanguageSwitcher />
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {props.children}
      </main>
    </div>
  )
} 