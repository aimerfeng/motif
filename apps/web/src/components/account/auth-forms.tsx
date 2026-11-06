'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState, type FormEvent, type ReactNode } from 'react'
import { buttonPrimary } from '@/components/community/ui'
import { GitHubIcon } from '@/components/icons'
import { getPathname, Link, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { authClient, safeNext } from '@/lib/auth/client'
import { refreshMe } from './me'

/*
 * 登录、注册、找回密码的表单（docs/decisions/0009）。都是浏览器直接调 Better Auth 的接口。
 * 错误按 Better Auth 的错误码翻译；认不出的照原文显示。
 */

export const field = 'w-full rounded-lg border border-line bg-sunken px-3 py-2.5 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none'

type T = ReturnType<typeof useTranslations<'auth'>>

function errorMessage(t: T, error: { code?: string; message?: string; status?: number } | null | undefined): string {
  switch (error?.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return t('errors.invalid')
    case 'EMAIL_NOT_VERIFIED':
      return t('errors.unverified')
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return t('errors.exists')
    case 'PASSWORD_TOO_SHORT':
      return t('errors.short')
    case 'INVALID_TOKEN':
      return t('errors.token')
  }
  if (error?.status === 429) return t('errors.rateLimited')
  return error?.message || t('errors.generic')
}

/** 站内路径加上当前语言的前缀：OAuth 回调、邮件链接是整页跳转，不经过 next-intl 的路由。 */
function useLocalePath() {
  const locale = useLocale() as Locale
  return (href: string) => getPathname({ href, locale })
}

export function AuthCard({ title, lead, children, footer }: { title: string; lead?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-col px-5 pt-16 pb-24 sm:pt-24">
      <h1 className="font-display text-[30px] leading-[1.1] font-semibold tracking-[-0.025em]">{title}</h1>
      {lead && <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{lead}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 border-t border-line pt-5 text-[13.5px] text-ink-muted">{footer}</div>}
    </main>
  )
}

function Notice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3.5 py-2.5 text-[13.5px] leading-relaxed ${tone === 'error' ? 'border-danger/30 bg-danger/5 text-ink' : 'border-line bg-raised text-ink-muted'}`}>
      {children}
    </p>
  )
}

export function GitHubButton({ next, label }: { next: string; label: string }) {
  const t = useTranslations('auth')
  const localePath = useLocalePath()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          setError(null)
          void authClient.signIn
            .social({ provider: 'github', callbackURL: localePath(next), errorCallbackURL: localePath('/login'), newUserCallbackURL: localePath('/account?welcome=1') })
            .then(({ error }) => {
              if (error) {
                setError(errorMessage(t, error))
                setBusy(false)
              }
            })
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line-strong bg-raised px-4 py-2.5 text-[14px] font-medium text-ink transition-colors duration-150 hover:border-ink disabled:opacity-60"
        data-testid="github-sign-in"
      >
        <GitHubIcon className="size-[18px]" />
        {busy ? t('redirecting') : label}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[12px] text-ink-faint">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

export function LoginForm({ github, email, next, error: initialError }: { github: boolean; email: boolean; next: string; error: string | null }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const target = safeNext(next)
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(initialError ? t('errors.oauth', { code: initialError }) : null)
  const [info, setInfo] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error } = await authClient.signIn.email({ email: address.trim(), password })
    setBusy(false)
    if (error) {
      // 没验证的邮箱：Better Auth 已经重新发了一封验证邮件。
      if (error.code === 'EMAIL_NOT_VERIFIED') setInfo(t('errors.unverified'))
      else setError(errorMessage(t, error))
      return
    }
    await refreshMe()
    router.replace(target)
    router.refresh()
  }

  return (
    <div>
      {github && <GitHubButton next={target} label={t('login.github')} />}
      {github && email && <Divider label={t('or')} />}
      {email ? (
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block">
            <span className="text-[13px] font-medium">{t('email')}</span>
            <input type="email" required autoComplete="email" value={address} onChange={(event) => setAddress(event.target.value)} className={`mt-2 ${field}`} data-testid="login-email" />
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between text-[13px] font-medium">
              {t('password')}
              <Link href="/forgot-password" className="text-[12.5px] font-normal text-ink-muted hover:text-ink">
                {t('login.forgot')}
              </Link>
            </span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`mt-2 ${field}`} data-testid="login-password" />
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          {info && <Notice tone="info">{info}</Notice>}
          <button type="submit" disabled={busy} className={`${buttonPrimary} w-full py-2.5`} data-testid="login-submit">
            {busy ? t('working') : t('login.submit')}
          </button>
        </form>
      ) : (
        <>
          {error && <Notice tone="error">{error}</Notice>}
          <p className="mt-4 text-[13px] text-ink-faint">{github ? t('emailDisabled') : t('nothingConfigured')}</p>
        </>
      )}
    </div>
  )
}

export function SignupForm({ github, email, next }: { github: boolean; email: boolean; next: string }) {
  const t = useTranslations('auth')
  const localePath = useLocalePath()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 8) {
      setError(t('errors.short'))
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await authClient.signUp.email({ name: name.trim(), email: address.trim(), password, callbackURL: localePath('/account?welcome=1') })
    setBusy(false)
    if (error) {
      setError(errorMessage(t, error))
      return
    }
    setSentTo(address.trim())
  }

  if (sentTo) {
    return (
      <div className="space-y-4">
        <Notice tone="info">{t('signup.sent', { email: sentTo })}</Notice>
        <ResendVerification email={sentTo} />
      </div>
    )
  }

  return (
    <div>
      {github && <GitHubButton next={safeNext(next)} label={t('signup.github')} />}
      {github && email && <Divider label={t('or')} />}
      {email ? (
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block">
            <span className="text-[13px] font-medium">{t('name')}</span>
            <input required maxLength={60} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={`mt-2 ${field}`} data-testid="signup-name" />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium">{t('email')}</span>
            <input type="email" required autoComplete="email" value={address} onChange={(event) => setAddress(event.target.value)} className={`mt-2 ${field}`} data-testid="signup-email" />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium">{t('password')}</span>
            <input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`mt-2 ${field}`} data-testid="signup-password" />
            <span className="mt-1.5 block text-[12px] text-ink-faint">{t('signup.passwordHint')}</span>
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <button type="submit" disabled={busy} className={`${buttonPrimary} w-full py-2.5`} data-testid="signup-submit">
            {busy ? t('working') : t('signup.submit')}
          </button>
          <p className="text-[12px] leading-relaxed text-ink-faint">{t('signup.bonus')}</p>
        </form>
      ) : (
        <p className="mt-4 text-[13px] text-ink-faint">{github ? t('emailDisabled') : t('nothingConfigured')}</p>
      )}
    </div>
  )
}

function ResendVerification({ email }: { email: string }) {
  const t = useTranslations('auth')
  const localePath = useLocalePath()
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'failed'>('idle')
  return (
    <button
      type="button"
      disabled={state === 'busy' || state === 'sent'}
      onClick={() => {
        setState('busy')
        void authClient.sendVerificationEmail({ email, callbackURL: localePath('/account?welcome=1') }).then(({ error }) => setState(error ? 'failed' : 'sent'))
      }}
      className="text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline disabled:no-underline disabled:opacity-60"
    >
      {state === 'sent' ? t('signup.resent') : state === 'failed' ? t('errors.generic') : t('signup.resend')}
    </button>
  )
}

export function ForgotForm() {
  const t = useTranslations('auth')
  const localePath = useLocalePath()
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await authClient.requestPasswordReset({ email: address.trim(), redirectTo: localePath('/reset-password') })
    setBusy(false)
    if (error) {
      setError(errorMessage(t, error))
      return
    }
    setSent(true)
  }

  if (sent) return <Notice tone="info">{t('forgot.sent', { email: address.trim() })}</Notice>
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-medium">{t('email')}</span>
        <input type="email" required autoComplete="email" value={address} onChange={(event) => setAddress(event.target.value)} className={`mt-2 ${field}`} />
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={busy} className={`${buttonPrimary} w-full py-2.5`}>
        {busy ? t('working') : t('forgot.submit')}
      </button>
    </form>
  )
}

export function ResetForm({ token, error: linkError }: { token: string | null; error: string | null }) {
  const t = useTranslations('auth')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(linkError || !token ? t('errors.token') : null)
  const [done, setDone] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (password.length < 8) {
      setError(t('errors.short'))
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setBusy(false)
    if (error) {
      setError(errorMessage(t, error))
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Notice tone="info">{t('reset.done')}</Notice>
        <Link href="/login" className={`${buttonPrimary} w-full py-2.5`}>
          {t('login.submit')}
        </Link>
      </div>
    )
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-medium">{t('reset.password')}</span>
        <input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!token} className={`mt-2 ${field}`} />
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      {token ? (
        <button type="submit" disabled={busy} className={`${buttonPrimary} w-full py-2.5`}>
          {busy ? t('working') : t('reset.submit')}
        </button>
      ) : (
        <Link href="/forgot-password" className={`${buttonPrimary} w-full py-2.5`}>
          {t('forgot.submit')}
        </Link>
      )}
    </form>
  )
}
