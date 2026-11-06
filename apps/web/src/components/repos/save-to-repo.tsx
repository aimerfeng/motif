'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useMe } from '@/components/account/me'
import { Link, usePathname } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'

/** 工作台的「存到我的仓库」：把当前条目存成仓库，以后可以在仓库页「在工作台打开」接着改。 */
export function SaveToRepo({ sessionId, className }: { sessionId: string; className: string }) {
  const t = useTranslations('repos.saveFromStudio')
  const me = useMe()
  const pathname = usePathname()
  const [state, setState] = useState<{ kind: 'idle' | 'busy' } | { kind: 'saved'; href: string } | { kind: 'error'; message: string }>({ kind: 'idle' })
  if (me === null)
    return (
      <Link href={{ pathname: '/login', query: { next: pathname } }} className={className}>
        {t('label')}
      </Link>
    )
  if (state.kind === 'saved')
    return (
      <Link href={state.href} className={className}>
        {t('open')}
      </Link>
    )
  return (
    <button
      type="button"
      disabled={state.kind === 'busy' || me === undefined}
      title={state.kind === 'error' ? state.message : undefined}
      className={className}
      onClick={() => {
        setState({ kind: 'busy' })
        api<{ repo: { owner_handle: string; slug: string } }>('/api/repos', { body: { mode: 'studio', session: sessionId } })
          .then(({ repo }) => setState({ kind: 'saved', href: `/u/${repo.owner_handle}/${repo.slug}` }))
          .catch((cause: unknown) => setState({ kind: 'error', message: errorText(cause) }))
      }}
      data-testid="save-to-repo"
    >
      {state.kind === 'busy' ? t('busy') : state.kind === 'error' ? t('failed') : t('label')}
    </button>
  )
}
