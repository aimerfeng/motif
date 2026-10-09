'use client'

import { useTranslations } from 'next-intl'
import { CopyIcon } from '@/components/icons'
import { useCopy } from '@/lib/clipboard'

/** 一行可复制的命令。 */
export function CopyCommand({ text }: { text: string }) {
  const t = useTranslations('export')
  const { copy, stateOf } = useCopy()
  const state = stateOf('command')
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-sunken">
      <code className="flex-1 overflow-x-auto px-3 py-2.5 font-mono text-[12.5px] whitespace-nowrap text-ink">{text}</code>
      <button
        type="button"
        onClick={() => void copy('command', text)}
        className="flex shrink-0 items-center gap-1.5 border-l border-line px-3 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
      >
        <CopyIcon state={state} className="size-3.5" />
        <span aria-live="polite">{state === 'copied' ? t('copied') : state === 'failed' ? t('copyFailed') : t('copy')}</span>
      </button>
    </div>
  )
}
