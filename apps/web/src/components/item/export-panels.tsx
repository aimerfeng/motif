'use client'

import {
  bundleRuntime,
  exportSkillZip,
  exportStarterZip,
  npmDependencies,
  prepareExport,
  rewriteRuntimeImport,
  skillMarkdown,
  skillName,
  usesRuntime,
  type ExportContext,
} from '@motif/export'
import type { ItemSource, ParamValues } from '@motif/schema'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type ReactNode } from 'react'
import { SkillButton } from '@/components/skill-button'

export type ExportData = Omit<ExportContext, 'origin'>

function useExportContext(data: ExportData): ExportContext | null {
  const [origin, setOrigin] = useState<string | null>(null)
  useEffect(() => setOrigin(window.location.origin), [])
  return origin ? { ...data, origin } : null
}

function download(name: string, data: Uint8Array) {
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/zip' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600)
  }
  return { copied, copy }
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h3 className="text-[14px] font-medium">{title}</h3>
      {description && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-pretty text-ink-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Command({ text, label, copied, onCopy }: { text: string; label: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-sunken">
      <code className="flex-1 overflow-x-auto px-3 py-2.5 font-mono text-[12.5px] whitespace-nowrap text-ink">{text}</code>
      <button type="button" onClick={onCopy} className="shrink-0 border-l border-line px-3 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
        {copied ? label.split('|')[1] : label.split('|')[0]}
      </button>
    </div>
  )
}

const buttonPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50'
const buttonSecondary =
  'inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-50'

/** 「安装」：下载可运行的项目、shadcn 命令、手动复制。 */
export function InstallPanel({ item, values, encoded, data }: { item: ItemSource; values: ParamValues; encoded: string; data: ExportData }) {
  const t = useTranslations('export')
  const context = useExportContext(data)
  const { copied, copy } = useCopy()
  const [busy, setBusy] = useState(false)
  const slug = item.manifest.slug
  const copyLabel = `${t('copy')}|${t('copied')}`

  if (!context) return null
  const registryUrl = `${context.origin}/r/${slug}.json${encoded ? `?v=${encoded}` : ''}`
  const deps = Object.keys(npmDependencies(item, context))

  const downloadStarter = async () => {
    setBusy(true)
    try {
      const zip = await exportStarterZip(item, values, context)
      download(zip.name, zip.data)
    } finally {
      setBusy(false)
    }
  }

  const copyComponent = async () => {
    const { bakedEntry } = await prepareExport(item, values)
    await copy('component', rewriteRuntimeImport(bakedEntry, '@/lib/motif-runtime'))
  }

  return (
    <div>
      <Section title={t('starterTitle')} description={t('starterLead')}>
        <button type="button" onClick={() => void downloadStarter()} disabled={busy} className={buttonPrimary} data-testid="download-starter">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M10 3v10m0 0 4-4m-4 4-4-4M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('downloadStarter', { name: `motif-${slug}.zip` })}
        </button>
      </Section>

      <Section title={t('shadcnTitle')} description={t('shadcnLead')}>
        <Command text={`npx shadcn@latest add "${registryUrl}"`} label={copyLabel} copied={copied === 'shadcn'} onCopy={() => void copy('shadcn', `npx shadcn@latest add "${registryUrl}"`)} />
      </Section>

      <Section title={t('manualTitle')} description={t('manualLead')}>
        <div className="space-y-3">
          {deps.length > 0 && <Command text={`npm install ${deps.join(' ')}`} label={copyLabel} copied={copied === 'deps'} onCopy={() => void copy('deps', `npm install ${deps.join(' ')}`)} />}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copyComponent()} className={buttonSecondary}>
              {copied === 'component' ? t('copied') : t('copyComponent', { file: item.manifest.entry.file })}
            </button>
            {usesRuntime(item) && (
              <button type="button" onClick={() => void copy('runtime', bundleRuntime(context.runtime.files))} className={buttonSecondary}>
                {copied === 'runtime' ? t('copied') : t('copyRuntime')}
              </button>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}

/** 「Skill」：让用户自己的 agent 学会这个效果（含调好的参数）。 */
export function SkillPanel({ item, values, data }: { item: ItemSource; values: ParamValues; data: ExportData }) {
  const t = useTranslations('skill')
  const context = useExportContext(data)
  const { copied, copy } = useCopy()
  const [markdown, setMarkdown] = useState('')
  const name = skillName(item.manifest.slug)

  useEffect(() => {
    if (!context) return
    let cancelled = false
    void prepareExport(item, values).then(({ hash }) => {
      if (!cancelled) setMarkdown(skillMarkdown(item, values, context, { hash }))
    })
    return () => {
      cancelled = true
    }
    // context 只在 origin 就绪时变化一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, values, context?.origin])

  if (!context) return null

  return (
    <div>
      <Section title={t('title')} description={t('lead')}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonPrimary}
            data-testid="download-skill"
            onClick={() => void exportSkillZip(item, values, context).then((zip) => download(zip.name, zip.data))}
          >
            {t('download', { name: `${name}.zip` })}
          </button>
          <button type="button" className={buttonSecondary} disabled={!markdown} onClick={() => void copy('skill', markdown)}>
            {copied === 'skill' ? t('copied') : t('copyMarkdown')}
          </button>
        </div>
        <ul className="mt-4 space-y-1 text-[13px] text-ink-muted">
          <li>
            Claude Code：<code className="font-mono text-[12.5px] text-ink">.claude/skills/{name}/</code>
          </li>
          <li>
            Codex · Cursor · Gemini CLI：<code className="font-mono text-[12.5px] text-ink">.agents/skills/{name}/</code>
          </li>
        </ul>
      </Section>
      <Section title="SKILL.md">
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-line bg-sunken p-4 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap text-ink-muted" data-testid="skill-preview">
          {markdown}
        </pre>
      </Section>
    </div>
  )
}

/** 预览上方的快捷操作：复制带当前参数的 Skill、下载项目。 */
export function QuickActions({ item, values, data }: { item: ItemSource; values: ParamValues; data: ExportData }) {
  const t = useTranslations('export')
  const context = useExportContext(data)
  const [busy, setBusy] = useState(false)
  if (!context) return <div className="h-9" />

  const markdown = () => prepareExport(item, values).then(({ hash }) => skillMarkdown(item, values, context, { hash }))
  const downloadStarter = async () => {
    setBusy(true)
    try {
      const zip = await exportStarterZip(item, values, context)
      download(zip.name, zip.data)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="quick-actions">
      <SkillButton source={{ markdown }} variant="primary" />
      <button type="button" onClick={() => void downloadStarter()} disabled={busy} className={buttonSecondary}>
        {t('downloadShort')}
      </button>
    </div>
  )
}
