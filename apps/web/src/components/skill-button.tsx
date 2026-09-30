'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

/**
 * 把文本写进剪贴板。内容需要先取回时传 Promise：用 ClipboardItem 包住，
 * 这样写入仍然算在这次点击的用户手势里（Safari 对异步写入很严格）。
 */
export async function copyText(text: string | Promise<string>): Promise<void> {
  if (typeof text === 'string') {
    await navigator.clipboard.writeText(text)
    return
  }
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then((value) => new Blob([value], { type: 'text/plain' })) })])
    return
  }
  await navigator.clipboard.writeText(await text)
}

export function fetchSkill(name: string): Promise<string> {
  return fetch(`/skill/${name}.md`).then((response) => {
    if (!response.ok) throw new Error(`skill ${name} not found`)
    return response.text()
  })
}

type State = 'idle' | 'copied' | 'failed'

interface SkillButtonProps {
  /** 要复制的 skill：仓库里的 skill 名，或者直接给出 SKILL.md 文本（详情页带着调好的参数）。 */
  source: { name: string } | { markdown: () => Promise<string> | string }
  label?: string
  variant?: 'overlay' | 'chip' | 'primary'
  className?: string
}

export function SkillButton({ source, label, variant = 'chip', className = '' }: SkillButtonProps) {
  const t = useTranslations('skill')
  const [state, setState] = useState<State>('idle')

  const copy = async () => {
    try {
      const text = 'name' in source ? fetchSkill(source.name) : Promise.resolve(source.markdown())
      await copyText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 1800)
  }

  const text = state === 'copied' ? t('copied') : state === 'failed' ? t('failed') : (label ?? t('copy'))
  const styles = {
    overlay:
      'rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-[opacity,background-color] duration-150 hover:bg-black/75',
    chip: 'rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink',
    primary: 'rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90',
  }[variant]

  return (
    <button type="button" onClick={() => void copy()} className={`inline-flex items-center gap-1.5 ${styles} ${className}`} data-state={state}>
      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        {state === 'copied' ? (
          <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
          </>
        )}
      </svg>
      <span>{text}</span>
    </button>
  )
}
