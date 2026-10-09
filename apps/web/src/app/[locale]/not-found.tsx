import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/** 找不到的条目或页面：说一句，给两个出口。 */
export default function NotFound() {
  const t = useTranslations('notFound')
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col justify-center px-5 sm:px-8">
      <p className="font-mono text-[13px] text-ink-faint">404</p>
      <h1 className="mt-3 font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t('title')}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/market" className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
          {t('market')}
        </Link>
        <Link href="/" className="rounded-full border border-line px-4 py-2 text-[14px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
          {t('home')}
        </Link>
      </div>
    </main>
  )
}
