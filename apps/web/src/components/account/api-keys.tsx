'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { CopyCommand } from '@/components/copy-command'
import { buttonPrimary, EmptyState, SectionHeader } from '@/components/community/ui'
import { ArrowIcon } from '@/components/icons'
import { Link, useRouter } from '@/i18n/navigation'
import type { ApiKeyView } from '@/lib/accounts/api-keys'
import { api, errorText } from '@/lib/api-client'
import { field } from './auth-forms'

/**
 * API 密钥：新建（明文只显示这一次）、吊销，以及接入 agent 的做法。
 * setup：命令行的一条命令（服务端算好传进来），它自己登录建密钥，所以排在手动复制密钥的做法前面。
 */
export function ApiKeys({ keys, origin, setup, locale }: { keys: ApiKeyView[]; origin: string; setup: string; locale: string }) {
  const t = useTranslations('account.keys')
  const router = useRouter()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  const create = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { key } = await api<{ key: string }>('/api/account/keys', { body: { name } })
      setCreated(key)
      setName('')
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (id: string) => {
    if (!window.confirm(t('confirmRevoke'))) return
    try {
      await api(`/api/account/keys/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  const key = created ?? '<your-key>'
  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <SectionHeader title={t('create')} />
        <form onSubmit={(event) => void create(event)} className="flex flex-wrap gap-3">
          <input maxLength={40} placeholder={t('namePlaceholder')} value={name} onChange={(event) => setName(event.target.value)} className={`${field} max-w-xs`} />
          <button type="submit" disabled={busy} className={buttonPrimary} data-testid="create-key">
            {busy ? t('creating') : t('createButton')}
          </button>
        </form>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        {created && (
          <div role="status" className="space-y-3 rounded-[var(--radius-card)] border border-success/30 bg-success/5 p-5">
            <p className="text-[13.5px] font-medium">{t('createdOnce')}</p>
            <CopyCommand text={created} />
          </div>
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('connect')} />
        <div className="space-y-3">
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">{t('cliLead')}</p>
          <CopyCommand text={setup} />
          <Link href="/agents" className="inline-flex items-center gap-1 text-[13.5px] text-ink underline-offset-4 hover:underline">
            {t('cliMore')}
            <ArrowIcon className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-3 pt-4">
          <h3 className="text-[13.5px] font-medium">{t('byKey')}</h3>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">{t('connectLead')}</p>
          <p className="text-[12.5px] text-ink-faint">Claude Code</p>
          <CopyCommand text={`claude mcp add --transport http motif ${origin}/mcp --header "Authorization: Bearer ${key}"`} />
          <p className="pt-2 text-[12.5px] text-ink-faint">{t('otherClients')}</p>
          <CopyCommand text={JSON.stringify({ mcpServers: { motif: { type: 'http', url: `${origin}/mcp`, headers: { Authorization: `Bearer ${key}` } } } })} />
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('list')} count={keys.length} />
        {keys.length === 0 ? (
          <EmptyState title={t('none')} compact />
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
            {keys.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-medium">{entry.name}</span>
                  <span className="font-mono text-[12.5px] text-ink-faint">{entry.prefix}…</span>
                  <span className="text-[12.5px] text-ink-faint">
                    {t('created', { date: date.format(entry.createdAt) })} · {entry.lastUsedAt ? t('used', { date: date.format(entry.lastUsedAt) }) : t('neverUsed')}
                  </span>
                </span>
                <button type="button" onClick={() => void revoke(entry.id)} className="rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-danger/50 hover:text-danger">
                  {t('revoke')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
