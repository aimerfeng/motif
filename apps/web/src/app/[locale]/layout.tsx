import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { CommunityProvider } from '@/components/community/wallet'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { resolveRouteLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { alternatesFor, SITE_URL } from '@/lib/site'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
    openGraph: { siteName: t('title'), type: 'website', locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US' },
    alternates: alternatesFor('/'),
  }
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          {/* 钱包连接是全站共享的状态：头部的钱包按钮和社区各页面用同一个连接。 */}
          <CommunityProvider>
            <a href="#content" className="sr-only rounded-md bg-ink px-3 py-2 text-[13px] font-medium text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">
              {t('skip')}
            </a>
            <SiteHeader />
            <div id="content" className="flex-1">
              {children}
            </div>
            <SiteFooter locale={locale} />
          </CommunityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
