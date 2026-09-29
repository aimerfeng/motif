'use client'

import { useState } from 'react'
import type { SkillEntry } from '@/lib/skills'

interface SkillCardProps {
  skill: SkillEntry
  repo: string
  title: string
  summary: string
  labels: { copy: string; copied: string; show: string; hide: string }
}

export function SkillCard({ skill, repo, title, summary, labels }: SkillCardProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const command = `npx skills add ${repo} --skill ${skill.name}`

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600)
  }

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-line p-5 transition-colors duration-200 hover:border-line-strong">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="text-[16px] font-medium tracking-[-0.01em]">{title}</h3>
        <code className="font-mono text-[12px] text-ink-faint">{skill.name}</code>
      </header>
      <p className="mt-2 text-[13.5px] leading-relaxed text-pretty text-ink-muted">{summary}</p>
      <p className="mt-3 font-mono text-[11.5px] text-ink-faint">{skill.files.join(' · ')}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => void copy('command', command)}
          className="rounded-lg border border-line bg-sunken px-3 py-1.5 font-mono text-[12px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
        >
          {copied === 'command' ? labels.copied : command}
        </button>
        <button type="button" onClick={() => void copy('markdown', skill.markdown)} className="rounded-lg px-2.5 py-1.5 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
          {copied === 'markdown' ? labels.copied : `${labels.copy} SKILL.md`}
        </button>
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="ml-auto rounded-lg px-2.5 py-1.5 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
          {open ? labels.hide : labels.show}
        </button>
      </div>
      {open && (
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-line bg-sunken p-4 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap text-ink-muted">{skill.markdown}</pre>
      )}
    </article>
  )
}
