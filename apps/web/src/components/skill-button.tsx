'use client'

import { useTranslations } from 'next-intl'
import { CopyIcon } from '@/components/icons'
import { useCopy } from '@/lib/clipboard'

function fetchSkill(name: string): Promise<string> {
  return fetch(`/skill/${name}.md`).then((response) => {
    if (!response.ok) throw new Error(`skill ${name} not found`)
    return response.text()
  })
}

interface SkillButtonProps {
  /** 要复制的 skill：仓库里的 skill 名，或者直接给出 SKILL.md 文本（详情页带着调好的参数）。 */
  source: { name: string } | { markdown: () => Promise<string> | string }
  label?: string
  variant?: 'overlay' | 'chip' | 'primary'
  className?: string
}

export function SkillButton({ source, label, variant = 'chip', className = '' }: SkillButtonProps) {
  const t = useTranslations('skill')
  const { copy, stateOf } = useCopy()
  const state = stateOf('skill')

  const onClick = () => {
    // 取文本的 Promise 要在点击当下创建，写剪贴板才算在这次用户手势里。
    const text = 'name' in source ? fetchSkill(source.name) : Promise.resolve().then(source.markdown)
    void copy('skill', text)
  }

  const text = state === 'copied' ? t('copied') : state === 'failed' ? t('failed') : (label ?? t('copy'))
  const styles = {
    overlay:
      'rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-[opacity,background-color] duration-150 hover:bg-black/75',
    chip: 'rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink',
    primary: 'rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90',
  }[variant]

  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 ${styles} ${className}`} data-state={state}>
      <CopyIcon state={state} className="size-3.5 shrink-0" />
      <span aria-live="polite">{text}</span>
    </button>
  )
}
