'use client'

import type { PreviewProps, PreviewTheme } from '@motif/preview/protocol'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'

export interface WorkbenchPreset {
  id: string
  name: string
  values: PreviewProps
}

interface ItemWorkbenchProps {
  slug: string
  title: string
  build: { js: string; css: string }
  exportName: string
  theme: PreviewTheme
  defaults: PreviewProps
  presets: WorkbenchPreset[]
}

/** 详情页的实时预览 + 预设切换。P2 在这里加调参面板。 */
export function ItemWorkbench({ slug, title, build, exportName, theme, defaults, presets }: ItemWorkbenchProps) {
  const t = useTranslations('item')
  const [presetId, setPresetId] = useState<string | null>(null)
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })

  const values = useMemo(() => {
    const preset = presets.find((p) => p.id === presetId)
    return preset ? { ...defaults, ...preset.values } : defaults
  }, [defaults, presets, presetId])

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken">
        <PreviewFrame
          title={title}
          module={{ kind: 'url', url: build.js }}
          styles={{ kind: 'url', url: build.css }}
          exportName={exportName}
          theme={theme}
          props={values}
          onStatus={setStatus}
          className="absolute inset-0 size-full"
        />
        <PreviewStatusOverlay status={status} />
      </div>

      {presets.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5" data-testid={`presets-${slug}`}>
          <span className="mr-2 text-[12px] text-ink-faint">{t('presets')}</span>
          <PresetChip active={presetId === null} onClick={() => setPresetId(null)}>
            {t('defaultPreset')}
          </PresetChip>
          {presets.map((preset) => (
            <PresetChip key={preset.id} active={presetId === preset.id} onClick={() => setPresetId(preset.id)}>
              {preset.name}
            </PresetChip>
          ))}
        </div>
      )}
    </div>
  )
}

function PreviewStatusOverlay({ status }: { status: PreviewStatus }) {
  const t = useTranslations('item')
  if (status.state === 'mounted') return null
  const message =
    status.state === 'loading' ? t('loading') : status.state === 'hung' ? t('hung') : t('previewError', { message: status.message })
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 p-3 text-[12px] transition-opacity duration-300 ${status.state === 'error' ? 'text-danger' : 'text-ink-faint'}`}
      role={status.state === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  )
}

function PresetChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="rounded-full border border-line px-3 py-1 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-canvas"
    >
      {children}
    </button>
  )
}
