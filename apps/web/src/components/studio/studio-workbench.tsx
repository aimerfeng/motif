'use client'

import { MANIFEST_PATH, printManifest, type PreviewReport } from '@motif/agent/client'
import { defaultsOf, type ItemManifest, type ItemSource, type JsonValue, type ParamValues } from '@motif/schema/core'
import dynamic from 'next/dynamic'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { DownloadIcon } from '@/components/icons'
import { InstallPanel, SkillPanel, type ExportData } from '@/components/item/export-panels'
import { ItemTabs } from '@/components/item/item-tabs'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'
import { TunePanel } from '@/components/tune/tune-panel'
import type { TunePreset, TuneState } from '@/components/tune/use-tune'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { useCopy } from '@/lib/clipboard'
import { encodeValues } from '@/lib/share'
import type { StudioView } from '@/lib/studio/view'
import { ChatPanel } from './chat-panel'
import { PENDING_KEY, rememberSession } from './open-in-studio'
import { useStudio } from './use-studio'

// 编辑器只在打开「代码」页时才加载，不拖慢工作台的首屏。
const CodeEditor = dynamic(() => import('./code-editor').then((module) => module.CodeEditor), { ssr: false })

const PAGE_KINDS = new Set(['template', 'style', 'section'])

/** 工作台里的调参状态：和市场详情页同一个面板，但值来自会话（agent 也会改它），不写进地址栏。 */
function useStudioTune(params: ItemManifest['params'], presets: TunePreset[], values: ParamValues, setValues: (values: ParamValues) => void): TuneState {
  const defaults = useMemo(() => defaultsOf(params), [params])
  const encoded = useMemo(() => encodeValues(values, defaults), [values, defaults])
  const activePreset = encoded === '' ? null : (presets.find((preset) => encodeValues({ ...defaults, ...preset.values }, defaults) === encoded)?.id ?? null)
  return {
    values,
    defaults,
    activePreset,
    changed: encoded !== '',
    set: (key: string, value: JsonValue) => setValues({ ...values, [key]: value }),
    reset: (key?: string) => setValues(key === undefined ? defaults : { ...values, [key]: defaults[key]! }),
    applyPreset: (id: string | null) => {
      const preset = presets.find((candidate) => candidate.id === id)
      setValues(preset ? { ...defaults, ...preset.values } : defaults)
    },
    shareUrl: () => window.location.href.split('#')[0]!,
    encoded,
  }
}

function toReport(status: PreviewStatus): PreviewReport | null {
  switch (status.state) {
    case 'mounted':
      return { state: 'mounted', ms: status.ms }
    case 'error':
      return { state: 'error', phase: status.phase, message: status.message }
    case 'hung':
      return { state: 'hung' }
    default:
      return null
  }
}

function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function StudioWorkbench({ initial, exportData }: { initial: StudioView; exportData: ExportData }) {
  const t = useTranslations('studio')
  const locale = useLocale() as Locale
  const studio = useStudio(initial)
  const { view, running } = studio
  const { item, evaluation } = view
  const manifest = item.manifest
  // 调参面板只用最近一份通过清单校验的参数定义：agent 改 item.json 的中途，参数可能暂时缺字段，直接渲染会出错。
  const manifestValid = evaluation !== null && !evaluation.problems.some((problem) => problem.rule === 'manifest')
  const [tunable, setTunable] = useState<ItemManifest | null>(manifestValid ? manifest : null)
  if (manifestValid && tunable !== manifest) setTunable(manifest)
  const params = useMemo(() => tunable?.params ?? [], [tunable])
  const presets = useMemo<TunePreset[]>(() => (tunable?.presets ?? []).map((preset) => ({ id: preset.id, name: preset.name[locale], values: preset.values })), [tunable, locale])
  const tune = useStudioTune(params, presets, view.values, studio.setValues)
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [file, setFile] = useState(manifest.entry?.file ?? MANIFEST_PATH)
  const [draftError, setDraftError] = useState<string | null>(null)
  const { copy, stateOf } = useCopy()

  const build = evaluation?.build ?? null
  const version = evaluation?.version ?? 0
  const errors = evaluation?.problems.filter((problem) => problem.level === 'error') ?? []
  const title = manifest.title?.[locale] ?? manifest.slug
  const pageLike = PAGE_KINDS.has(manifest.kind)
  const dirty = Object.keys(drafts).length > 0

  // 预览挂载成功、报错或卡住时告诉服务端：agent 的 check_preview 在等它。
  const { report } = studio
  useEffect(() => {
    const preview = toReport(status)
    if (preview && build) report(version, preview)
  }, [status, version, build, report])

  const files = [MANIFEST_PATH, ...Object.keys(item.files)]
  const original = (path: string) => (path === MANIFEST_PATH ? printManifest(manifest) : (item.files[path] ?? ''))

  const saveDrafts = async (): Promise<boolean> => {
    if (!dirty) return true
    let next: ItemSource = { manifest, files: { ...item.files } }
    for (const [path, text] of Object.entries(drafts)) {
      if (path === MANIFEST_PATH) {
        try {
          next = { ...next, manifest: JSON.parse(text) as ItemManifest }
        } catch (error) {
          setDraftError(t('editor.invalidJson', { message: error instanceof Error ? error.message : String(error) }))
          return false
        }
      } else {
        next.files[path] = text
      }
    }
    setDraftError(null)
    const saved = await studio.save(next)
    if (saved) setDrafts({})
    return saved
  }

  // 有没保存的手动修改时，先保存再交给 agent，免得它在旧版本上改。
  const send = async (prompt: string) => {
    if (await saveDrafts()) await studio.run(prompt)
  }

  // 记住这个会话；从首页带着第一句话进来时，自动发出去（只发一次）。
  const { run } = studio
  useEffect(() => {
    rememberSession(view.id)
    let pending: string | null = null
    try {
      pending = sessionStorage.getItem(PENDING_KEY(view.id))
      sessionStorage.removeItem(PENDING_KEY(view.id))
    } catch {
      // 存储不可用：用户自己再输入一遍。
    }
    if (pending && view.agent.available) void run(pending)
    // 只在进入页面时执行一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const suggestions = view.base ? [t('suggest.palette'), t('suggest.calmer'), t('suggest.param')] : [t('suggest.aurora'), t('suggest.loader'), t('suggest.hero')]

  const preview = (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken ${pageLike ? 'h-[min(70vh,760px)] min-h-[480px]' : 'aspect-[16/10]'}`}>
      {build ? (
        <PreviewFrame
          title={title}
          module={{ kind: 'code', code: build.js }}
          styles={{ kind: 'text', text: build.css }}
          exportName={manifest.demo?.export ?? 'Demo'}
          theme={manifest.demo?.theme ?? 'dark'}
          props={view.values}
          onStatus={setStatus}
          className="absolute inset-0 size-full"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-[13px] text-ink-faint">{t('preview.noBuild')}</div>
      )}
      {build && status.state === 'error' && (
        <div role="alert" className="absolute inset-x-0 bottom-0 bg-sunken/90 p-3 font-mono text-[12px] text-danger">
          {status.message}
        </div>
      )}
      {build && status.state === 'loading' && <p className="absolute bottom-3 left-3 text-[12px] text-ink-faint">{t('preview.loading')}</p>}
    </div>
  )

  return (
    <div className="grid lg:h-[calc(100dvh-56px)] lg:grid-cols-[400px_minmax(0,1fr)]">
      <aside className="order-2 flex h-[70dvh] min-h-0 flex-col border-line lg:order-1 lg:h-auto lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{t('chat.title')}</p>
            <p className="truncate text-[11.5px] text-ink-faint">{view.agent.available ? t('chat.agent', { label: view.agent.label ?? '' }) : t('chat.noAgent')}</p>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-ink-faint tabular-nums" title={t('chat.budget')}>
            {Math.round((view.usage.used / view.usage.budget) * 100)}%
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <ChatPanel
            transcript={view.transcript}
            running={running}
            available={view.agent.available}
            onSend={(prompt) => void send(prompt)}
            onAbort={() => void studio.abort()}
            suggestions={suggestions}
          />
        </div>
      </aside>

      <main className="@container order-1 min-w-0 px-5 pt-6 pb-16 sm:px-8 lg:order-2 lg:overflow-y-auto">
        <header className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-faint">
              <Link href="/studio" className="transition-colors duration-150 hover:text-ink">
                {t('home.title')}
              </Link>
              {view.base && (
                <>
                  <span className="mx-2">/</span>
                  {t.rich('basedOn', {
                    link: (chunks) => (
                      <Link href={`/market/${view.base}`} className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                        {chunks}
                      </Link>
                    ),
                    slug: view.base,
                  })}
                </>
              )}
            </p>
            <h1 className="mt-2 truncate font-display text-[32px] leading-tight font-semibold tracking-[-0.03em]" data-testid="studio-title">
              {title}
            </h1>
            <p className="mt-1 text-[12.5px]" data-testid="studio-status">
              {running ? (
                <span className="text-ink-faint">{t('status.running')}</span>
              ) : evaluation?.ok ? (
                <span className="text-[oklch(0.78_0.13_160)]">{t('status.ok', { version })}</span>
              ) : (
                <span className="text-danger">{t('status.errors', { count: errors.length })}</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!tune.changed || running || studio.busy}
              onClick={() => void studio.applyDefaults(view.values)}
              className="rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-40"
            >
              {t('actions.applyDefaults')}
            </button>
            <button
              type="button"
              onClick={() => downloadJson(`${manifest.slug}.motif.json`, item)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
            >
              <DownloadIcon className="size-4" />
              .motif.json
            </button>
            <button
              type="button"
              onClick={() => void copy('link', window.location.href.split('#')[0]!)}
              className="rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
            >
              {stateOf('link') === 'copied' ? t('actions.linkCopied') : t('actions.copyLink')}
            </button>
            {evaluation?.ok && !running ? (
              <Link href={`/community/submit?studio=${view.id}`} className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
                {t('actions.submit')}
              </Link>
            ) : null}
          </div>
        </header>

        {(studio.error ?? draftError) && (
          <div role="alert" className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">
            <span>{studio.error ?? draftError}</span>
            <button
              type="button"
              onClick={() => {
                studio.dismissError()
                setDraftError(null)
              }}
              className="shrink-0 text-ink-faint hover:text-ink"
              aria-label={t('actions.dismiss')}
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">{preview}</div>
          <div className="@4xl:sticky @4xl:top-6 @4xl:self-start">
            {params.length > 0 ? <TunePanel params={params} presets={presets} tune={tune} /> : <p className="text-[13px] text-ink-faint">{t('noParams')}</p>}
          </div>
        </div>

        <div className="mt-10">
          <ItemTabs
            tabs={[
              {
                id: 'code',
                label: dirty ? `${t('tabs.code')} •` : t('tabs.code'),
                content: (
                  <div className="overflow-hidden rounded-xl border border-line bg-sunken">
                    <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
                      {files.map((path) => (
                        <button
                          key={path}
                          type="button"
                          aria-pressed={path === file}
                          onClick={() => setFile(path)}
                          className="shrink-0 rounded-md px-2.5 py-1 font-mono text-[12px] text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:bg-white/8 aria-pressed:text-ink"
                        >
                          {path}
                          {path in drafts ? ' •' : ''}
                        </button>
                      ))}
                      <span className="ml-auto flex shrink-0 items-center gap-2 pl-3">
                        {dirty && (
                          <button type="button" onClick={() => setDrafts({})} className="rounded-md px-2.5 py-1 text-[12px] text-ink-faint transition-colors duration-150 hover:text-ink">
                            {t('editor.discard')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!dirty || running || studio.busy}
                          onClick={() => void saveDrafts()}
                          className="rounded-md bg-ink px-2.5 py-1 text-[12px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-30"
                          data-testid="studio-save"
                        >
                          {studio.busy ? t('editor.saving') : t('editor.save')}
                        </button>
                      </span>
                    </div>
                    <div className="h-[560px]">
                      <CodeEditor
                        path={file}
                        value={drafts[file] ?? original(file)}
                        readOnly={running}
                        onChange={(text) => setDrafts((current) => (text === original(file) ? Object.fromEntries(Object.entries(current).filter(([path]) => path !== file)) : { ...current, [file]: text }))}
                        onSave={() => void saveDrafts()}
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: 'problems',
                label: evaluation?.problems.length ? `${t('tabs.problems')} ${evaluation.problems.length}` : t('tabs.problems'),
                content:
                  evaluation && evaluation.problems.length > 0 ? (
                    <ul className="divide-y divide-line rounded-xl border border-line text-[13px]" data-testid="studio-problems">
                      {evaluation.problems.map((problem, index) => (
                        <li key={index} className="flex gap-3 px-4 py-3">
                          <span className={`shrink-0 font-mono text-[11px] ${problem.level === 'error' ? 'text-danger' : 'text-[oklch(0.8_0.12_70)]'}`}>{problem.level}</span>
                          <span className="min-w-0">
                            <span className="font-mono text-[12px] text-ink-faint">
                              {problem.rule}
                              {problem.file ? ` · ${problem.file}` : ''}
                            </span>
                            <span className="mt-0.5 block text-ink-muted">{problem.message}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13.5px] text-ink-faint">{t('noProblems')}</p>
                  ),
              },
              {
                id: 'install',
                label: t('tabs.install'),
                content: evaluation?.ok ? <InstallPanel item={item} values={view.values} encoded={tune.encoded} data={exportData} registryPath={`/r/s/${view.id}.json`} /> : <p className="text-[13.5px] text-ink-faint">{t('fixFirst')}</p>,
              },
              {
                id: 'skill',
                label: t('tabs.skill'),
                content: evaluation?.ok ? <SkillPanel item={item} values={view.values} data={exportData} /> : <p className="text-[13.5px] text-ink-faint">{t('fixFirst')}</p>,
              },
            ]}
          />
        </div>
      </main>
    </div>
  )
}
