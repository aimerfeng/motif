'use client'

import type { ModuleRef, PreviewTheme, StyleRef } from '@motif/preview/protocol'
import type { ItemSource, Kind, ParamValues } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { ChainBadge } from '@/components/community/chain-badge'
import { RefreshIcon } from '@/components/icons'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'
import { OpenInStudio } from '@/components/studio/open-in-studio'
import { TunePanel } from '@/components/tune/tune-panel'
import { useTune, type TunePreset } from '@/components/tune/use-tune'
import type { HighlightedCode } from '@/lib/code-tokens'
import { CodeView } from './code-view'
import { InstallPanel, QuickActions, SkillPanel, type ExportData } from './export-panels'
import { ItemTabs } from './item-tabs'

interface ItemWorkbenchProps {
  item: ItemSource
  title: string
  /** 预览模块：市场目录条目是沙箱托管的预编译产物（URL），社区作品是编译好的代码字符串。 */
  preview: { module: ModuleRef; styles: StyleRef }
  theme: PreviewTheme
  defaults: ParamValues
  presets: TunePreset[]
  code: HighlightedCode
  exportData: ExportData
  /** 服务端渲染好的标题区（面包屑、标题、简介、来源），快捷操作排在它右边。 */
  header: ReactNode
  /** 服务端渲染好的「来源与许可证」内容。 */
  license: ReactNode
  /** 额外的标签页（例如链上记录），排在最后。 */
  extraTabs?: { id: string; label: string; content: ReactNode }[]
}

/** 详情页的工作区：实时预览 + 调参面板，下方是随参数变化的代码、安装、Skill 与许可证。 */
export function ItemWorkbench({ item, title, preview, theme, defaults, presets, code, exportData, header, license, extraTabs = [] }: ItemWorkbenchProps) {
  const t = useTranslations('item')
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  const [replay, setReplay] = useState(0)
  const tune = useTune(item.manifest.params, defaults, presets)
  // 模板、风格、区块是「一页」：预览更高、可以滚动，并能切换设备宽度看响应式效果。
  const pageLike = PAGE_KINDS.has(item.manifest.kind)
  const [viewport, setViewport] = useState<Viewport>('desktop')

  return (
    <>
      <header className="mt-5 mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* 服务端传来的元素单独包一层，不和客户端的兄弟节点放在同一个子节点数组里（否则开发模式会报缺 key）。 */}
        <div className="max-w-3xl min-w-0">{header}</div>
        <div className="flex shrink-0 items-center gap-2">
          {pageLike && <ViewportSwitch value={viewport} onChange={setViewport} />}
          <ChainBadge item={item} />
          <OpenInStudio slug={item.manifest.slug} values={tune.values} />
          <QuickActions item={item} values={tune.values} data={exportData} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 手机上调参面板在预览下方：小尺寸的效果预览吸在顶部，边调边看。页面类条目太高，不吸。 */}
        <div className={`self-start ${pageLike ? '' : 'max-lg:sticky max-lg:top-14 max-lg:z-10 max-lg:-mx-5 max-lg:bg-canvas max-lg:px-5 max-lg:pt-2 max-lg:pb-3'}`}>
          <div
            className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken ${pageLike ? 'h-[min(78vh,860px)] min-h-[520px]' : 'aspect-[16/10]'}`}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-[width] duration-300 ease-(--ease-out-soft)" style={{ width: VIEWPORT_WIDTH[viewport] }}>
              <PreviewFrame
                title={title}
                module={preview.module}
                styles={preview.styles}
                exportName={item.manifest.demo.export}
                theme={theme}
                props={tune.values}
                onStatus={setStatus}
                replayToken={replay}
                className={`absolute inset-0 size-full ${viewport === 'desktop' ? '' : 'border-x border-line'}`}
              />
            </div>
            <PreviewStatusOverlay status={status} onRetry={() => setReplay((n) => n + 1)} />
            {status.state === 'mounted' && (
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                aria-label={t('replay')}
                title={t('replay')}
                className="absolute right-3 bottom-3 grid size-8 place-items-center rounded-full bg-black/55 text-white/85 opacity-0 ring-1 ring-white/15 backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 hover:text-white focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <RefreshIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <TunePanel params={item.manifest.params} presets={presets} tune={tune} />
        </div>
      </div>

      <div className="mt-14">
        <ItemTabs
          tabs={[
            {
              id: 'code',
              label: t('tabs.code'),
              content: <CodeView code={code} sources={item.files} entry={item.manifest.entry.file} values={tune.values} labels={{ copy: t('copy'), copied: t('copied'), failed: t('copyFailed'), tuned: t('tunedNote') }} />,
            },
            { id: 'install', label: t('tabs.install'), content: <InstallPanel item={item} values={tune.values} encoded={tune.encoded} data={exportData} /> },
            { id: 'skill', label: t('tabs.skill'), content: <SkillPanel item={item} values={tune.values} data={exportData} /> },
            { id: 'license', label: t('tabs.license'), content: license },
            ...extraTabs,
          ]}
        />
      </div>
    </>
  )
}

const PAGE_KINDS = new Set<Kind>(['template', 'style', 'section'])
type Viewport = 'desktop' | 'tablet' | 'mobile'
const VIEWPORT_WIDTH: Record<Viewport, string> = { desktop: '100%', tablet: '820px', mobile: '390px' }

function ViewportSwitch({ value, onChange }: { value: Viewport; onChange: (value: Viewport) => void }) {
  const t = useTranslations('item.viewport')
  const icons: Record<Viewport, React.ReactNode> = {
    desktop: <path d="M2.5 3.5h11v7.5h-11zM6 13.5h4M8 11v2.5" />,
    tablet: <path d="M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM7 12h2" />,
    mobile: <path d="M5.5 1.5h5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM7.25 12.5h1.5" />,
  }
  return (
    <div role="radiogroup" aria-label={t('label')} className="flex rounded-lg border border-line p-0.5 max-sm:hidden" data-testid="viewport-switch">
      {(['desktop', 'tablet', 'mobile'] as const).map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          aria-label={t(option)}
          title={t(option)}
          onClick={() => onChange(option)}
          className="grid size-8 place-items-center rounded-md text-ink-faint transition-colors duration-150 hover:text-ink aria-checked:bg-white/10 aria-checked:text-ink"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden>
            {icons[option]}
          </svg>
        </button>
      ))}
    </div>
  )
}

function PreviewStatusOverlay({ status, onRetry }: { status: PreviewStatus; onRetry: () => void }) {
  const t = useTranslations('item')
  if (status.state === 'mounted') return null
  if (status.state === 'error') {
    return (
      <div role="alert" className="absolute inset-0 grid place-items-center bg-sunken/90 p-6 text-center">
        <div className="max-w-md">
          <p className="text-[13px] text-danger">{t('previewError', { message: status.message })}</p>
          <button type="button" onClick={onRetry} className="mt-4 rounded-full border border-line px-4 py-1.5 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div role="status" className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-[12px] text-ink-faint">
      <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-ink-faint" />
      {status.state === 'loading' ? t('loading') : t('hung')}
    </div>
  )
}
