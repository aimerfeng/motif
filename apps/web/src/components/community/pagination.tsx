import { useTranslations } from 'next-intl'
import { ChevronIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'
import { buttonSecondary } from './ui'

/**
 * 翻页：上一页、下一页和「第几页 / 共几页」。都是普通链接（页码在地址里），不开 JS 也能翻，翻到哪一页也能直接分享。
 * 只有一页时不渲染。到头的那一侧保留一个不可点的按钮，两个按钮的位置不会随页码跳动。
 */
export function Pagination({ page, pages, hrefOf }: { page: number; pages: number; hrefOf: (page: number) => string }) {
  const t = useTranslations('community.pagination')
  if (pages <= 1) return null
  const disabled = `${buttonSecondary} pointer-events-none opacity-40`
  return (
    <nav aria-label={t('label')} className="flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefOf(page - 1)} rel="prev" className={buttonSecondary}>
          <ChevronIcon className="size-3.5 rotate-180" />
          {t('previous')}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          <ChevronIcon className="size-3.5 rotate-180" />
          {t('previous')}
        </span>
      )}
      <p className="text-[13px] text-ink-muted tabular-nums" aria-current="page">
        {t('status', { page, pages })}
      </p>
      {page < pages ? (
        <Link href={hrefOf(page + 1)} rel="next" className={buttonSecondary}>
          {t('next')}
          <ChevronIcon className="size-3.5" />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          {t('next')}
          <ChevronIcon className="size-3.5" />
        </span>
      )}
    </nav>
  )
}
