import { i18n } from '@/i18n/settings'
import { Locale } from '@/i18n/settings'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LoginButton from '@/components/LoginButton';
import { MatomoProvider } from '@/components/MatomoProvider';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

interface LayoutProps {
  children: React.ReactNode
  params: { lang: Locale }
}

export default async function RootLayout(props: LayoutProps) {
  const { lang } = await Promise.resolve(props.params)

  return (
    <html lang={lang}>
      <body>
        <div className="min-h-screen bg-black">
          <header className="bg-gray-700 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="text-xl font-bold">Blog d'un geek infiltré</div>
              <LanguageSwitcher />
              <LoginButton />
            </nav>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MatomoProvider>
              {props.children}
            </MatomoProvider>
          </main>
        </div>
      </body>
    </html>
  )
} 