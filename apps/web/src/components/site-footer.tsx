import { REPO_URL } from '@motif/export'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCatalog } from '@/lib/catalog'
import { MotifMark } from './motif-mark'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  const catalog = await getCatalog()

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-8 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5">
          <MotifMark className="size-4 opacity-70" />
          <span>{t('line', { date: catalog.generatedAt.slice(0, 10) })}</span>
        </div>
        <nav className="flex gap-5">
          <Link href="/market" className="transition-colors duration-150 hover:text-ink">
            {tn('market')}
          </Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors duration-150 hover:text-ink">
            GitHub
          </a>
          <a href={`${REPO_URL}/blob/main/THIRD_PARTY_NOTICES.md`} target="_blank" rel="noreferrer" className="transition-colors duration-150 hover:text-ink">
            {t('notices')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
