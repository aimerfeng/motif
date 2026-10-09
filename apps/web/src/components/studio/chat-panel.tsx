'use client'

import type { TranscriptEntry } from '@motif/agent/client'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { RichText } from './rich-text'

type ToolEntry = Extract<TranscriptEntry, { role: 'tool' }>

/** 工具调用压成一行人话：「修改 effect.tsx」「搜索市场「极光」」。 */
function useToolLabel() {
  const t = useTranslations('studio.tools')
  return (entry: ToolEntry) => {
    const input = (typeof entry.input === 'object' && entry.input !== null ? entry.input : {}) as Record<string, unknown>
    const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string) : '')
    switch (entry.name) {
      case 'search_market':
        return t('search_market', { query: text('query') })
      case 'read_market_item':
        return t('read_market_item', { slug: text('slug') })
      case 'read_market_file':
        return t('read_market_file', { file: `${text('slug')}/${text('path')}` })
      case 'read_file':
      case 'write_file':
      case 'edit_file':
      case 'delete_file':
        return t(entry.name, { path: text('path') })
      case 'list_files':
      case 'set_params':
      case 'check_preview':
      case 'look_at_preview':
      case 'finish':
        return t(entry.name)
      default:
        return entry.name || t('unknown')
    }
  }
}

function ToolRow({ entry, running }: { entry: ToolEntry; running: boolean }) {
  const label = useToolLabel()(entry)
  const pending = entry.output === null
  const state = pending ? (running ? 'pending' : 'stopped') : entry.isError ? 'error' : 'ok'
  return (
    <details className="group rounded-lg border border-line bg-sunken/60 text-[12.5px]" data-state={state}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-ink-muted select-none hover:text-ink">
        <span
          aria-hidden
          className={`size-1.5 shrink-0 rounded-full ${state === 'pending' ? 'animate-pulse bg-ink-faint' : state === 'error' ? 'bg-danger' : state === 'ok' ? 'bg-[oklch(0.78_0.13_160)]' : 'bg-white/20'}`}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span aria-hidden className="text-ink-faint transition-transform duration-150 group-open:rotate-90">›</span>
      </summary>
      {entry.output !== null && <pre className="max-h-64 overflow-auto border-t border-line px-3 py-2 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-muted">{entry.output}</pre>}
    </details>
  )
}

function Entry({ entry, running }: { entry: TranscriptEntry; running: boolean }) {
  const t = useTranslations('studio.chat')
  switch (entry.role) {
    case 'user':
      return <div className="ml-8 self-end rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-canvas">{entry.text}</div>
    case 'assistant':
      return (
        <div className="text-[14px] leading-relaxed text-ink">
          <RichText text={entry.text} />
        </div>
      )
    case 'tool':
      return <ToolRow entry={entry} running={running} />
    case 'notice':
      if (entry.kind === 'done') {
        return (
          <div className="rounded-xl border border-[oklch(0.78_0.13_160/0.35)] bg-[oklch(0.78_0.13_160/0.08)] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink">
            <p className="mb-1 text-[11.5px] text-ink-faint">{t('done')}</p>
            <RichText text={entry.text} />
          </div>
        )
      }
      return <p className={`text-[12.5px] ${entry.kind === 'error' ? 'text-danger' : 'text-ink-faint'}`}>{entry.kind === 'aborted' ? t('aborted') : t('error', { message: entry.text })}</p>
  }
}

export function ChatPanel({
  transcript,
  running,
  available,
  onSend,
  onAbort,
  suggestions,
}: {
  transcript: TranscriptEntry[]
  running: boolean
  available: boolean
  onSend: (prompt: string) => void
  onAbort: () => void
  suggestions: string[]
}) {
  const t = useTranslations('studio.chat')
  const [draft, setDraft] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const stick = useRef(true)

  // 新内容出现时跟着滚到底，除非用户自己往上翻了。
  useEffect(() => {
    const element = scroller.current
    if (element && stick.current) element.scrollTop = element.scrollHeight
  }, [transcript])

  const send = (text = draft) => {
    const prompt = text.trim()
    if (!prompt || running || !available) return
    onSend(prompt)
    setDraft('')
    stick.current = true
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scroller}
        onScroll={(event) => {
          const element = event.currentTarget
          stick.current = element.scrollHeight - element.scrollTop - element.clientHeight < 40
        }}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5"
        data-testid="studio-transcript"
      >
        {transcript.length === 0 && (
          <div className="my-auto">
            <p className="text-[14px] leading-relaxed text-ink-muted">{t('empty')}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!available}
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-line px-3 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {transcript.map((entry, index) => (
          <Entry key={index} entry={entry} running={running && index === transcript.length - 1} />
        ))}
        {running && (
          <p className="flex items-center gap-2 text-[12.5px] text-ink-faint" role="status">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-ink-faint" />
            {t('working')}
          </p>
        )}
      </div>
      <div className="border-t border-line p-3">
        {!available && <p className="mb-2 text-[12px] text-ink-faint">{t('unavailable')}</p>}
        <div className="flex items-end gap-2 rounded-xl border border-line bg-raised p-2 focus-within:border-line-strong">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={4000}
            disabled={!available}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[14px] leading-relaxed placeholder:text-ink-faint focus:outline-none disabled:opacity-50"
            data-testid="studio-prompt"
          />
          {running ? (
            <button type="button" onClick={onAbort} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
              {t('stop')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => send()}
              disabled={!draft.trim() || !available}
              className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
            >
              {t('send')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
