'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useMe } from '@/components/account/me'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'

const style =
  'inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-60'

/** 条目页的「存到我的仓库」：把条目的源文件 fork 成自己的仓库（docs/decisions/0009 第 4 节）。 */
export function ForkItem({ slug }: { slug: string }) {
  const t = useTranslations('repos.forkItem')
  const me = useMe()
  const router = useRouter()
  const pathname = usePathname()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (me === null)
    return (
      <Link href={{ pathname: '/login', query: { next: pathname } }} className={style}>
        {t('label')}
      </Link>
    )
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={busy || me === undefined}
        className={style}
        onClick={() => {
          setBusy(true)
          setError(null)
          api<{ repo: { owner_handle: string; slug: string } }>('/api/repos', { body: { mode: 'item', item: slug } })
            .then(({ repo }) => router.push(`/u/${repo.owner_handle}/${repo.slug}`))
            .catch((cause: unknown) => {
              setError(errorText(cause))
              setBusy(false)
            })
        }}
        data-testid="fork-item"
      >
        {busy ? t('busy') : t('label')}
      </button>
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </span>
  )
}
