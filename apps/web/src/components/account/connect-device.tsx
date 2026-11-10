'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { buttonPrimary, buttonSecondary } from '@/components/community/ui'
import { Link } from '@/i18n/navigation'
import type { PendingLogin } from '@/lib/accounts/cli-login'
import { api, errorText } from '@/lib/api-client'
import { field } from './auth-forms'

/**
 * CLI 登录的确认（docs/decisions/0011）：给用户看清是哪台设备、哪个确认码，再同意或拒绝。
 * 同意就是给那台设备发一把能花积分的密钥，所以页面上明说什么时候该同意。
 */
export function ConnectDevice({ pending, account, locale }: { pending: PendingLogin; account: string; locale: string }) {
  const t = useTranslations('connect')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'approve' | 'deny' | null>(null)

  const resolve = async (action: 'approve' | 'deny') => {
    setBusy(true)
    setError(null)
    try {
      await api('/api/cli/login/approve', { body: { code: pending.code, action } })
      setDone(action)
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-xl border border-line bg-raised p-5" data-testid={`connect-${done}`}>
        <p className="text-[15px] font-medium">{t(done === 'approve' ? 'approvedTitle' : 'deniedTitle')}</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{t(done === 'approve' ? 'approvedLead' : 'deniedLead')}</p>
        {done === 'approve' && (
          <Link href="/account/keys" className="mt-4 inline-block text-[13.5px] font-medium text-ink underline-offset-4 hover:underline">
            {t('manage')}
          </Link>
        )}
      </div>
    )
  }

  const started = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(pending.createdAt)
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-raised p-5">
        <p className="text-[12px] tracking-wide text-ink-faint uppercase">{t('codeLabel')}</p>
        <p className="mt-1 font-mono text-[28px] leading-none font-semibold tracking-[0.08em]" data-testid="connect-code">
          {pending.code}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px]">
          <dt className="text-ink-faint">{t('device')}</dt>
          <dd className="truncate">{pending.name}</dd>
          <dt className="text-ink-faint">{t('key')}</dt>
          <dd className="font-mono">{pending.keyPrefix}…</dd>
          <dt className="text-ink-faint">{t('started')}</dt>
          <dd>{started}</dd>
          <dt className="text-ink-faint">{t('account')}</dt>
          <dd className="truncate">{account}</dd>
        </dl>
      </div>
      <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('warning')}</p>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void resolve('approve')} className={buttonPrimary} data-testid="connect-approve">
          {t('approve')}
        </button>
        <button type="button" disabled={busy} onClick={() => void resolve('deny')} className={buttonSecondary} data-testid="connect-deny">
          {t('deny')}
        </button>
      </div>
    </div>
  )
}

/** 没带确认码（或确认码已经失效）时让用户自己填。普通的 GET 表单：提交回这个页面本身，不需要脚本。 */
export function ConnectCodeForm({ invalid }: { invalid: boolean }) {
  const t = useTranslations('connect')
  return (
    <form method="get" className="space-y-4">
      {invalid && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-[13.5px] leading-relaxed">
          {t('invalid')}
        </p>
      )}
      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium">{t('codeLabel')}</span>
        <input name="code" required autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXX-XXXX" maxLength={20} className={`${field} font-mono tracking-[0.08em] uppercase`} />
      </label>
      <button type="submit" className={buttonPrimary}>
        {t('continue')}
      </button>
    </form>
  )
}
