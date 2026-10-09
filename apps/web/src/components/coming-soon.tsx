import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

/** 还没做好的栏目：说清楚它将来做什么，不放假内容。 */
export async function ComingSoon({ locale, section }: { locale: Locale; section: 'studio' }) {
  const t = await getTranslations({ locale, namespace: 'upcoming' })
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col justify-center px-5 sm:px-8">
      <p className="text-[13px] text-ink-faint">{t('soon')}</p>
      <h1 className="mt-3 font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t(`${section}.title`)}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t(`${section}.lead`)}</p>
      <Link href="/market" className="mt-8 self-start rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
        {t('back')}
      </Link>
    </main>
  )
}
