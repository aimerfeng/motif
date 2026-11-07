'use client'

import {
  bundleRuntime,
  componentFiles,
  exportSkillZip,
  exportStarterZip,
  npmDependencies,
  prepareExport,
  skillMarkdown,
  skillName,
  usesRuntime,
  type ExportContext,
} from '@motif/export'
import { bake, type ItemSource, type ParamValues } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { CopyCommand } from '@/components/copy-command'
import { useUnlock } from '@/components/credits/use-unlock'
import { CopyIcon, DownloadIcon } from '@/components/icons'
import { SkillButton } from '@/components/skill-button'
import { Link } from '@/i18n/navigation'
import { useCopy, type CopyState } from '@/lib/clipboard'
import { reportStat } from '@/lib/stats/report'

export type ExportData = Omit<ExportContext, 'origin'>

const noSubscribe = () => () => {}

/** 导出要用站点自己的地址（registry URL、Skill 里的来源链接）；服务端渲染时还不知道，先返回 null。 */
function useExportContext(data: ExportData): ExportContext | null {
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => null,
  )
  return useMemo(() => (origin ? { ...data, origin } : null), [data, origin])
}

function saveFile(name: string, data: Uint8Array) {
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/zip' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

type DownloadState = 'idle' | 'busy' | 'failed'

/** 打包下载：先过 gate（解锁，docs/decisions/0009），打包期间按钮不可再点，失败时提示一下再复原。 */
function useDownload(make: () => Promise<{ name: string; data: Uint8Array }>, gate: () => Promise<boolean> = async () => true, stat?: string) {
  const [state, setState] = useState<DownloadState>('idle')
  const run = async () => {
    setState('busy')
    try {
      if (!(await gate())) {
        setState('idle')
        return
      }
      const zip = await make()
      saveFile(zip.name, zip.data)
      setState('idle')
      // 下载了市场条目：排行榜的「拿走」。
      if (stat) reportStat(stat, 'take')
    } catch (error) {
      console.error(error)
      setState('failed')
      window.setTimeout(() => setState('idle'), 2400)
    }
  }
  return { state, run }
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

function CopyLabel({ state, idle }: { state: CopyState; idle: string }) {
  const t = useTranslations('export')
  return <span aria-live="polite">{state === 'copied' ? t('copied') : state === 'failed' ? t('copyFailed') : idle}</span>
}

const buttonPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50'
const buttonSecondary =
  'inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-50'

function DownloadButton({ state, onClick, label, className, testId }: { state: DownloadState; onClick: () => void; label: string; className: string; testId?: string }) {
  const t = useTranslations('export')
  return (
    <button type="button" onClick={onClick} disabled={state === 'busy'} aria-busy={state === 'busy'} className={className} data-testid={testId}>
      <DownloadIcon className={`size-4 ${state === 'busy' ? 'animate-pulse' : ''}`} />
      <span aria-live="polite">{state === 'busy' ? t('packing') : state === 'failed' ? t('downloadFailed') : label}</span>
    </button>
  )
}

/**
 * 「安装」：下载可运行的项目、shadcn 命令、手动复制。
 * registryPath 是 shadcn 安装地址的路径部分：默认是市场条目的 /r/<slug>.json，Studio 会话用 /r/s/<id>.json。
 */
/** free：工作台里自己做的条目，下载不花积分（它不是市场条目，也没有可解锁的对象）。 */
export function InstallPanel({ item, values, encoded, data, registryPath, free = false }: { item: ItemSource; values: ParamValues; encoded: string; data: ExportData; registryPath?: string; free?: boolean }) {
  const t = useTranslations('export')
  const context = useExportContext(data)
  const slug = item.manifest.slug
  // 工作台里自己做的条目（free）不是市场条目，不进排行榜。
  const stat = free ? undefined : slug
  const { copy, stateOf } = useCopy(stat)
  const unlock = useUnlock('item', slug, !free)
  const starter = useDownload(() => exportStarterZip(item, values, context!), unlock.ensure, stat)
  // 手动复制要给全所有文件：多文件的条目只复制入口会缺相对导入。
  const files = useMemo(() => componentFiles(item, bake(item.files[item.manifest.entry.file] ?? '', values)), [item, values])

  if (!context) return null
  const registryUrl = `${context.origin}${registryPath ?? `/r/${slug}.json`}${encoded ? `?v=${encoded}` : ''}`
  const shadcn = `npx shadcn@latest add "${registryUrl}"`
  const deps = Object.keys(npmDependencies(item, context))
  const install = `npm install ${deps.join(' ')}`

  return (
    <div>
      <Section title={t('starterTitle')} description={t('starterLead')}>
        <DownloadButton state={starter.state} onClick={() => void starter.run()} label={t('downloadStarter', { name: `motif-${slug}.zip` })} className={buttonPrimary} testId="download-starter" />
        <UnlockNote unlock={unlock} />
      </Section>

      <Section title={t('shadcnTitle')} description={t('shadcnLead')}>
        <CopyCommand text={shadcn} stat={stat} />
      </Section>

      <Section title={t('manualTitle')} description={t('manualLead')}>
        <div className="space-y-3">
          {deps.length > 0 && <CopyCommand text={install} stat={stat} />}
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {files.map((file) => (
              <FileRow key={file.path} target={`src/${file.target}`} state={stateOf(file.path)} onCopy={() => void copy(file.path, file.content)} />
            ))}
            {usesRuntime(item) && (
              <FileRow target="src/lib/motif-runtime.ts" state={stateOf('runtime')} onCopy={() => void copy('runtime', bundleRuntime(context.runtime.files))} />
            )}
          </ul>
        </div>
      </Section>
    </div>
  )
}

/** 下载按钮下面的一行：要花多少积分（第一次）、已经解锁、或者积分不够。 */
function UnlockNote({ unlock }: { unlock: ReturnType<typeof useUnlock> }) {
  const t = useTranslations('credits.unlock')
  if (unlock.error)
    return (
      <p className="mt-2 basis-full text-[12.5px] text-danger">
        {unlock.error.text}{' '}
        {unlock.error.buy && (
          <Link href="/pricing" className="text-ink underline underline-offset-4">
            {t('buy')}
          </Link>
        )}
      </p>
    )
  if (!unlock.status || unlock.status.cost === 0) return null
  return (
    <p className="mt-2 basis-full text-[12.5px] text-ink-faint">
      {unlock.status.unlocked ? t('unlocked') : unlock.signedIn ? t('cost', { cost: unlock.status.cost }) : t('signIn', { cost: unlock.status.cost })}
    </p>
  )
}

function FileRow({ target, state, onCopy }: { target: string; state: CopyState; onCopy: () => void }) {
  const t = useTranslations('export')
  return (
    <li className="flex items-center justify-between gap-4 bg-sunken px-3 py-2">
      <code className="min-w-0 truncate font-mono text-[12.5px] text-ink-muted">{target}</code>
      <button
        type="button"
        onClick={onCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
      >
        <CopyIcon state={state} className="size-3.5" />
        <CopyLabel state={state} idle={t('copy')} />
      </button>
    </li>
  )
}

/** 「Skill」：让用户自己的 agent 学会这个效果（含调好的参数）。 */
export function SkillPanel({ item, values, data, free = false }: { item: ItemSource; values: ParamValues; data: ExportData; free?: boolean }) {
  const t = useTranslations('skill')
  const context = useExportContext(data)
  const stat = free ? undefined : item.manifest.slug
  const { copy, stateOf } = useCopy(stat)
  const [markdown, setMarkdown] = useState('')
  const name = skillName(item.manifest.slug)
  const unlock = useUnlock('skill', name, !free)
  const zip = useDownload(() => exportSkillZip(item, values, context!), unlock.ensure, stat)

  useEffect(() => {
    if (!context) return
    let cancelled = false
    void prepareExport(item, values).then(({ hash }) => {
      if (!cancelled) setMarkdown(skillMarkdown(item, values, context, { hash }))
    })
    return () => {
      cancelled = true
    }
  }, [item, values, context])

  if (!context) return null

  return (
    <div>
      <Section title={t('title')} description={t('lead')}>
        <div className="flex flex-wrap gap-2">
          <DownloadButton state={zip.state} onClick={() => void zip.run()} label={t('download', { name: `${name}.zip` })} className={buttonPrimary} testId="download-skill" />
          <UnlockNote unlock={unlock} />
          <button type="button" className={buttonSecondary} disabled={!markdown} onClick={() => void copy('skill', markdown)}>
            <CopyIcon state={stateOf('skill')} className="size-3.5" />
            <span aria-live="polite">{stateOf('skill') === 'copied' ? t('copied') : stateOf('skill') === 'failed' ? t('failed') : t('copyMarkdown')}</span>
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

/** 标题旁的快捷操作：复制带当前参数的 Skill、下载项目。 */
export function QuickActions({ item, values, data }: { item: ItemSource; values: ParamValues; data: ExportData }) {
  const t = useTranslations('export')
  const context = useExportContext(data)
  const unlock = useUnlock('item', item.manifest.slug)
  const starter = useDownload(() => exportStarterZip(item, values, context!), unlock.ensure, item.manifest.slug)
  if (!context) return <div className="h-9" />

  const markdown = () => prepareExport(item, values).then(({ hash }) => skillMarkdown(item, values, context, { hash }))

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="quick-actions">
      <SkillButton source={{ markdown }} variant="primary" stat={item.manifest.slug} />
      <DownloadButton state={starter.state} onClick={() => void starter.run()} label={t('downloadShort')} className={buttonSecondary} />
      {unlock.error && <UnlockNote unlock={unlock} />}
    </div>
  )
}
