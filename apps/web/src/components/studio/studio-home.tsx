'use client'

import type { L10n } from '@motif/schema/core'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { openStudio, RECENT_KEY } from './open-in-studio'

interface Recent {
  id: string
  base: string | null
  title: L10n | null
  updatedAt: number
  turns: number
}

/** 工作台首页：一句话开始，或者接着做最近的会话。 */
export function StudioHome({ available }: { available: boolean }) {
  const t = useTranslations('studio.home')
  const locale = useLocale() as Locale
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<Recent[]>([])

  useEffect(() => {
    let ids: string[] = []
    try {
      const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as unknown
      if (Array.isArray(list)) ids = list.filter((value): value is string => typeof value === 'string')
    } catch {
      // 读不到就没有最近列表。
    }
    if (ids.length === 0) return
    void fetch(`/api/studio/sessions?ids=${ids.join(',')}`)
      .then((response) => response.json() as Promise<{ sessions: Recent[] }>)
      .then((json) => setRecent(json.sessions))
      .catch(() => undefined)
  }, [])

  const start = async (text = prompt) => {
    setBusy(true)
    setError(null)
    const failure = await openStudio(router, text.trim() ? { prompt: text.trim() } : {})
    if (failure) {
      setError(failure)
      setBusy(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (prompt.trim()) void start()
    }
  }

  const examples = [t('examples.aurora'), t('examples.loader'), t('examples.pricing'), t('examples.text')]
  const dateFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <main className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8 sm:pt-24">
      <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>

      <div className="mt-10 rounded-2xl border border-line bg-raised p-3 focus-within:border-line-strong">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          maxLength={4000}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          disabled={!available || busy}
          className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
          data-testid="studio-home-prompt"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
          <p className="text-[12px] text-ink-faint">{available ? t('hint') : t('unavailable')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void start('')}
              disabled={busy}
              className="rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-50"
            >
              {t('blank')}
            </button>
            <button
              type="button"
              onClick={() => void start()}
              disabled={!available || busy || !prompt.trim()}
              className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
              data-testid="studio-home-start"
            >
              {busy ? t('starting') : t('start')}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={!available || busy}
            onClick={() => setPrompt(example)}
            className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-40"
          >
            {example}
          </button>
        ))}
      </div>

      <p className="mt-10 text-[14px] text-ink-muted">
        {t.rich('remix', {
          link: (chunks) => (
            <Link href="/market" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {chunks}
            </Link>
          ),
        })}
      </p>

      {recent.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[13px] font-medium text-ink-faint">{t('recent')}</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {recent.map((session) => (
              <li key={session.id}>
                <Link href={`/studio/${session.id}`} className="flex items-baseline justify-between gap-4 py-3 text-[14px] transition-colors duration-150 hover:text-ink">
                  <span className="min-w-0 truncate">
                    {session.title?.[locale] ?? session.id}
                    {session.base && <span className="ml-2 text-[12.5px] text-ink-faint">{t('remixOf', { slug: session.base })}</span>}
                  </span>
                  <span className="shrink-0 text-[12px] text-ink-faint tabular-nums">{dateFormat.format(session.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
