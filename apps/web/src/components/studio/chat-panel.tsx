'use client'

import type { TranscriptEntry } from '@motif/agent/client'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowIcon, CheckIcon, ChevronIcon, SparklesIcon } from '@/components/icons'
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
    <details className="group text-[12.5px]" data-state={state}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-1.5 text-ink-muted select-none hover:text-ink [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className={`size-1.5 shrink-0 rounded-full ${state === 'pending' ? 'animate-pulse bg-ink-faint' : state === 'error' ? 'bg-danger' : state === 'ok' ? 'bg-success' : 'bg-line-strong'}`}
        />
        <span className={`min-w-0 flex-1 truncate ${state === 'error' ? 'text-danger' : ''}`}>{label}</span>
        <ChevronIcon aria-hidden className="size-3 shrink-0 text-ink-faint transition-transform duration-150 group-open:rotate-90" />
      </summary>
      {entry.output !== null && <pre className="max-h-64 overflow-auto border-t border-line px-3 py-2 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-muted">{entry.output}</pre>}
    </details>
  )
}

interface Revert {
  /** 还能回去的快照编号。 */
  available: number[]
  /** 正在运行时不能回退。 */
  disabled: boolean
  onRevert: (snapshot: number, label: string) => void
}

function RevertButton({ snapshot, label, revert, children }: { snapshot: number | undefined; label: string; revert: Revert; children: string }) {
  if (snapshot === undefined || !revert.available.includes(snapshot)) return null
  return (
    <button
      type="button"
      disabled={revert.disabled}
      onClick={() => revert.onRevert(snapshot, label)}
      className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  )
}

const short = (text: string) => (text.length > 40 ? `${text.slice(0, 40)}…` : text)

function Entry({ entry, running, revert }: { entry: TranscriptEntry; running: boolean; revert: Revert }) {
  const t = useTranslations('studio.chat')
  switch (entry.role) {
    case 'user':
      return (
        <div className="group ml-8 flex flex-col items-end gap-1 self-end">
          <div className="rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-canvas">{entry.text}</div>
          <span className="opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <RevertButton snapshot={entry.snapshot} label={short(entry.text)} revert={revert}>
              {t('revert')}
            </RevertButton>
          </span>
        </div>
      )
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
          <div className="rounded-xl border border-success/35 bg-success/8 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink">
            <p className="mb-1 flex items-center gap-1.5 text-[11.5px] text-success">
              <CheckIcon className="size-3.5" strokeWidth={2} />
              {t('done')}
            </p>
            <RichText text={entry.text} />
          </div>
        )
      }
      if (entry.kind === 'reverted') {
        return (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12.5px] text-ink-faint" data-testid="studio-reverted">
            <span>{t('reverted', { label: entry.text })}</span>
            <RevertButton snapshot={entry.snapshot} label={t('undoLabel')} revert={revert}>
              {t('undoRevert')}
            </RevertButton>
          </p>
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
  revert,
}: {
  transcript: TranscriptEntry[]
  running: boolean
  available: boolean
  /** 返回服务端是否接受；不接受时把这句话放回输入框，不让用户白打。 */
  onSend: (prompt: string) => Promise<boolean>
  onAbort: () => void
  suggestions: string[]
  revert: Revert
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

  // agent 往往连着调好几个工具：放进同一个块里，读起来是「一段话、一组步骤、一段话」。
  const groups: ({ kind: 'tools'; start: number; entries: ToolEntry[] } | { kind: 'entry'; index: number; entry: TranscriptEntry })[] = []
  transcript.forEach((entry, index) => {
    const last = groups.at(-1)
    if (entry.role !== 'tool') groups.push({ kind: 'entry', index, entry })
    else if (last?.kind === 'tools') last.entries.push(entry)
    else groups.push({ kind: 'tools', start: index, entries: [entry] })
  })

  const send = async (text = draft) => {
    const prompt = text.trim()
    if (!prompt || running || !available) return
    setDraft('')
    stick.current = true
    if (!(await onSend(prompt))) setDraft((current) => current || prompt)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send()
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
            <span className="grid size-9 place-items-center rounded-full border border-line bg-raised text-ink-muted">
              <SparklesIcon className="size-4" />
            </span>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{t('empty')}</p>
            <div className="mt-4 flex flex-col gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!available}
                  onClick={() => void send(suggestion)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-left text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:bg-raised hover:text-ink disabled:opacity-40"
                >
                  {suggestion}
                  <ArrowIcon className="size-3.5 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
        {groups.map((group) =>
          group.kind === 'tools' ? (
            <div key={group.start} className="shrink-0 divide-y divide-line/60 overflow-hidden rounded-lg border border-line bg-sunken/60">
              {group.entries.map((entry, offset) => (
                <ToolRow key={group.start + offset} entry={entry} running={running && group.start + offset === transcript.length - 1} />
              ))}
            </div>
          ) : (
            <Entry key={group.index} entry={group.entry} running={running && group.index === transcript.length - 1} revert={revert} />
          ),
        )}
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
              onClick={() => void send()}
              disabled={!draft.trim() || !available}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
            >
              {t('send')}
              <ArrowIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
