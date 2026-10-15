import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { CommunityProvider } from '@/components/community/wallet'
import { FooterGate } from '@/components/footer-gate'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { resolveRouteLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { alternatesFor, SITE_URL } from '@/lib/site'
import { THEME_SCRIPT } from '@/lib/theme'
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
    // 分享链接时的默认配图（条目页用自己的海报覆盖），由 scripts/og-image.ts 生成（pnpm og）。
    openGraph: { siteName: t('title'), type: 'website', locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US', images: [{ url: '/og.jpg', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
    alternates: alternatesFor('/'),
  }
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    // data-theme 由下面的脚本在首帧前写上（偏好或系统设置），和服务端渲染的不一样是预期的。
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
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
            <FooterGate>
              <SiteFooter locale={locale} />
            </FooterGate>
          </CommunityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
