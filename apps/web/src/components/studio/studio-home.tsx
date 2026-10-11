'use client'

import type { L10n } from '@motif/schema/core'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowIcon, CodeIcon, LayersIcon, SparklesIcon } from '@/components/icons'
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

const pathCard =
  'group flex w-full items-start gap-3 rounded-[var(--radius-card)] border border-line p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-raised disabled:pointer-events-none disabled:opacity-50'

/** 工作台首页：一句话开始；也可以从市场条目或空白模板开始，或者接着做最近的会话。 */
export function StudioHome({ available }: { available: boolean }) {
  const t = useTranslations('studio.home')
  const locale = useLocale() as Locale
  const router = useRouter()
  const input = useRef<HTMLTextAreaElement>(null)
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

  // 示例只填进输入框，不直接发出去：用户多半想先改几个字。
  const fillExample = (example: string) => {
    setPrompt(example)
    input.current?.focus()
  }

  const examples = [t('examples.aurora'), t('examples.loader'), t('examples.pricing'), t('examples.text')]
  const dateFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <main className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8 sm:pt-20">
      <h1 className="font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[52px]">{t('title')}</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>

      <div className="mt-9 rounded-2xl border border-line bg-raised p-3 shadow-[0_1px_0_0_var(--color-line)] transition-colors duration-150 focus-within:border-line-strong">
        <textarea
          ref={input}
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
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <p className="min-w-0 truncate text-[12px] text-ink-faint">{available ? t('hint') : t('unavailable')}</p>
          <button
            type="button"
            onClick={() => void start()}
            disabled={!available || busy || !prompt.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
            data-testid="studio-home-start"
          >
            {busy ? t('starting') : t('start')}
            <ArrowIcon className="size-3.5" />
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      {available && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[12px] text-ink-faint">
            <SparklesIcon className="size-3.5" />
            {t('try')}
          </span>
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              disabled={busy}
              onClick={() => fillExample(example)}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-40"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href="/market" className={pathCard}>
          <PathBody icon={<LayersIcon className="size-4" />} title={t('paths.market.title')} body={t('paths.market.body')} />
        </Link>
        <button type="button" onClick={() => void start('')} disabled={busy} className={pathCard}>
          <PathBody icon={<CodeIcon className="size-4" />} title={t('paths.blank.title')} body={t('paths.blank.body')} />
        </button>
      </div>

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[13px] font-medium text-ink-faint">{t('recent')}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {recent.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/studio/${session.id}`}
                  className="flex h-full flex-col gap-1.5 rounded-[var(--radius-card)] border border-line px-4 py-3.5 transition-colors duration-150 hover:border-line-strong hover:bg-raised"
                >
                  <span className="truncate text-[14.5px] font-medium">{session.title?.[locale] ?? session.id}</span>
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-faint tabular-nums">
                    <span>{dateFormat.format(session.updatedAt)}</span>
                    {session.turns > 0 && <span>{t('turns', { count: session.turns })}</span>}
                    {session.base && <span className="truncate font-mono">{t('remixOf', { slug: session.base })}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

function PathBody({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-raised text-ink-muted transition-colors duration-150 group-hover:text-ink">{icon}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[14.5px] font-medium">
          {title}
          <ArrowIcon className="size-3.5 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
        <span className="mt-0.5 block text-[13px] text-ink-faint">{body}</span>
      </span>
    </>
  )
}
