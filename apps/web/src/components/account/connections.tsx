'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState, type FormEvent, type ReactNode } from 'react'
import { buttonPrimary, buttonSecondary, SectionHeader } from '@/components/community/ui'
import { GitHubIcon } from '@/components/icons'
import { getPathname, Link, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { authClient } from '@/lib/auth/client'
import { field } from './auth-forms'

/** 推仓库到 GitHub 需要的范围（docs/decisions/0009 第 4 节）：登录时不要，用到时再授权。 */
export const GITHUB_WRITE_SCOPE = 'public_repo'

/** 去 GitHub 关联账号或补授权：整页跳转，回来时落在 callback（当前语言下的站内路径）。 */
export function useGitHubLink() {
  const locale = useLocale() as Locale
  return (callback: string, scopes: string[] = []) =>
    authClient.linkSocial({ provider: 'github', scopes, callbackURL: getPathname({ href: callback, locale }), errorCallbackURL: getPathname({ href: '/account', locale }) })
}

function Row({ title, detail, children }: { title: ReactNode; detail: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[14px] font-medium">{title}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{detail}</p>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

/** 登录方式：邮箱密码、GitHub（以及推仓库要的额外授权）。 */
export function Connections(props: {
  email: string
  emailVerified: boolean
  hasPassword: boolean
  github: { accountId: string; login: string | null; scopes: string[] } | null
  githubAvailable: boolean
  mailAvailable: boolean
  canUnlink: boolean
}) {
  const t = useTranslations('account.connections')
  const router = useRouter()
  const link = useGitHubLink()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)
  const canWrite = props.github?.scopes.some((scope) => scope === GITHUB_WRITE_SCOPE || scope === 'repo') ?? false

  const go = (key: string, action: () => Promise<{ error: { message?: string } | null } | unknown>) => {
    setBusy(key)
    setError(null)
    void action().then((result) => {
      const failure = (result as { error?: { message?: string } | null } | undefined)?.error
      if (failure) {
        setError(failure.message ?? t('failed'))
        setBusy(null)
      }
    })
  }

  return (
    <div className="space-y-2">
      <SectionHeader title={t('title')} />
      <div className="divide-y divide-line">
        <Row title={props.email} detail={props.hasPassword ? t('passwordSet') : t('noPassword')}>
          {props.hasPassword ? (
            <button type="button" className={buttonSecondary} onClick={() => setChanging((value) => !value)}>
              {t('changePassword')}
            </button>
          ) : (
            props.mailAvailable && (
              <Link href="/forgot-password" className={buttonSecondary}>
                {t('setPassword')}
              </Link>
            )
          )}
        </Row>
        {changing && <ChangePassword onDone={() => setChanging(false)} />}
        {props.githubAvailable && (
          <Row
            title={
              <>
                <GitHubIcon className="size-4" />
                GitHub
              </>
            }
            detail={props.github ? (canWrite ? t('githubWrite', { login: props.github.login ?? '' }) : t('githubLinked', { login: props.github.login ?? '' })) : t('githubNone')}
          >
            {!props.github && (
              <button type="button" disabled={busy !== null} className={buttonPrimary} onClick={() => go('link', () => link('/account'))}>
                {busy === 'link' ? t('redirecting') : t('connect')}
              </button>
            )}
            {props.github && !canWrite && (
              <button type="button" disabled={busy !== null} className={buttonSecondary} onClick={() => go('scope', () => link('/account', [GITHUB_WRITE_SCOPE]))}>
                {busy === 'scope' ? t('redirecting') : t('grantWrite')}
              </button>
            )}
            {props.github && props.canUnlink && (
              <button
                type="button"
                disabled={busy !== null}
                className={buttonSecondary}
                onClick={() =>
                  go('unlink', async () => {
                    const result = await authClient.unlinkAccount({ accountId: props.github!.accountId })
                    if (!result.error) router.refresh()
                    setBusy(null)
                    return result
                  })
                }
              >
                {t('disconnect')}
              </button>
            )}
          </Row>
        )}
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {props.github && !canWrite && <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('writeExplain')}</p>}
    </div>
  )
}

function ChangePassword({ onDone }: { onDone: () => void }) {
  const t = useTranslations('account.connections')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true })
    setBusy(false)
    if (error) {
      setMessage({ ok: false, text: error.code === 'INVALID_PASSWORD' ? t('wrongPassword') : (error.message ?? t('failed')) })
      return
    }
    setMessage({ ok: true, text: t('passwordChanged') })
    setTimeout(onDone, 1500)
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="block">
        <span className="text-[12.5px] text-ink-muted">{t('currentPassword')}</span>
        <input type="password" required autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} className={`mt-1.5 ${field}`} />
      </label>
      <label className="block">
        <span className="text-[12.5px] text-ink-muted">{t('newPassword')}</span>
        <input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} className={`mt-1.5 ${field}`} />
      </label>
      <button type="submit" disabled={busy} className={buttonPrimary}>
        {t('save')}
      </button>
      {message && <p className={`text-[13px] sm:col-span-3 ${message.ok ? 'text-success' : 'text-danger'}`}>{message.text}</p>}
    </form>
  )
}
