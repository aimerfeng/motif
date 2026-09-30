'use client'

import type { PreviewTheme } from '@motif/preview/protocol'
import type { ItemSource, ParamValues } from '@motif/schema'
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

  return (
    <>
      <div className="mb-4 flex justify-end">
        <QuickActions item={item} values={tune.values} data={exportData} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative aspect-[16/10] self-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken">
          <PreviewFrame
            title={title}
            module={{ kind: 'url', url: build.js }}
            styles={{ kind: 'url', url: build.css }}
            exportName={item.manifest.demo.export}
            theme={theme}
            props={tune.values}
            onStatus={setStatus}
            className="absolute inset-0 size-full"
          />
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
