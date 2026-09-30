'use client'

import type { PreviewTheme } from '@motif/preview/protocol'
import type { ItemSource, Kind, ParamValues } from '@motif/schema'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'
import { TunePanel } from '@/components/tune/tune-panel'
import { useTune, type TunePreset } from '@/components/tune/use-tune'
import type { HighlightedFile } from '@/lib/code-tokens'
import { CodeView } from './code-view'
import { InstallPanel, QuickActions, SkillPanel, type ExportData } from './export-panels'
import { ItemTabs } from './item-tabs'

interface ItemWorkbenchProps {
  item: ItemSource
  title: string
  build: { js: string; css: string }
  theme: PreviewTheme
  defaults: ParamValues
  presets: TunePreset[]
  files: HighlightedFile[]
  exportData: ExportData
  /** 服务端渲染好的「来源与许可证」内容。 */
  license: ReactNode
}

/** 详情页的工作区：实时预览 + 调参面板，下方是随参数变化的代码、安装、Skill 与许可证。 */
export function ItemWorkbench({ item, title, build, theme, defaults, presets, files, exportData, license }: ItemWorkbenchProps) {
  const t = useTranslations('item')
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  const tune = useTune(item.manifest.params, defaults, presets)
  // 模板、风格、区块是「一页」：预览更高、可以滚动，并能切换设备宽度看响应式效果。
  const pageLike = PAGE_KINDS.has(item.manifest.kind)
  const [viewport, setViewport] = useState<Viewport>('desktop')

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {pageLike ? <ViewportSwitch value={viewport} onChange={setViewport} /> : <span />}
        <QuickActions item={item} values={tune.values} data={exportData} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div
          className={`relative self-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken ${pageLike ? 'h-[min(78vh,860px)] min-h-[520px]' : 'aspect-[16/10]'}`}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-[width] duration-300 ease-(--ease-out-soft)" style={{ width: VIEWPORT_WIDTH[viewport] }}>
            <PreviewFrame
              title={title}
              module={{ kind: 'url', url: build.js }}
              styles={{ kind: 'url', url: build.css }}
              exportName={item.manifest.demo.export}
              theme={theme}
              props={tune.values}
              onStatus={setStatus}
              className={`absolute inset-0 size-full ${viewport === 'desktop' ? '' : 'border-x border-line'}`}
            />
          </div>
          <PreviewStatusOverlay status={status} />
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
              content: <CodeView files={files} entry={item.manifest.entry.file} values={tune.values} labels={{ copy: t('copy'), copied: t('copied'), tuned: t('tunedNote') }} />,
            },
            { id: 'install', label: t('tabs.install'), content: <InstallPanel item={item} values={tune.values} encoded={tune.encoded} data={exportData} /> },
            { id: 'skill', label: t('tabs.skill'), content: <SkillPanel item={item} values={tune.values} data={exportData} /> },
            { id: 'license', label: t('tabs.license'), content: license },
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
    <div role="radiogroup" aria-label={t('label')} className="flex rounded-lg border border-line p-0.5" data-testid="viewport-switch">
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

function PreviewStatusOverlay({ status }: { status: PreviewStatus }) {
  const t = useTranslations('item')
  if (status.state === 'mounted') return null
  const message = status.state === 'loading' ? t('loading') : status.state === 'hung' ? t('hung') : t('previewError', { message: status.message })
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 p-3 text-[12px] ${status.state === 'error' ? 'text-danger' : 'text-ink-faint'}`}
      role={status.state === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  )
}
