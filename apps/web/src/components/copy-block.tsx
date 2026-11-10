'use client'

import { useTranslations } from 'next-intl'
import { CopyIcon } from '@/components/icons'
import { useCopy } from '@/lib/clipboard'

/** 多行的可复制代码（配置片段）。label：这段代码要放到哪（文件路径），显示在顶上。一行的命令用 CopyCommand。 */
export function CopyBlock({ text, label }: { text: string; label?: string }) {
  const t = useTranslations('export')
  const { copy, stateOf } = useCopy()
  const state = stateOf('block')
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-sunken">
      <div className="flex items-stretch justify-between border-b border-line">
        <span className="min-w-0 self-center truncate px-3 font-mono text-[12px] text-ink-muted">{label}</span>
        <button
          type="button"
          onClick={() => void copy('block', text)}
          className="flex shrink-0 items-center gap-1.5 border-l border-line px-3 py-2 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
        >
          <CopyIcon state={state} className="size-3.5" />
          <span aria-live="polite">{state === 'copied' ? t('copied') : state === 'failed' ? t('copyFailed') : t('copy')}</span>
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12.5px] leading-[1.65] text-ink">
        <code>{text}</code>
      </pre>
    </div>
  )
}
