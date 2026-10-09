'use client'

import type { ModuleRef, PreviewTheme, StyleRef } from '@motif/preview/protocol'
import type { ParamValues } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'

/** 某个版本的实时预览（默认参数）。审核员在这里看效果，和市场详情页用的是同一个沙箱。 */
export function VersionPreview({
  title,
  module,
  styles,
  exportName,
  theme,
  defaults,
  tall,
}: {
  title: string
  module: ModuleRef
  styles: StyleRef
  exportName: string
  theme: PreviewTheme
  defaults: ParamValues
  tall: boolean
}) {
  const t = useTranslations('item')
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken ${tall ? 'h-[min(72vh,760px)] min-h-[480px]' : 'aspect-[16/10]'}`}>
      <PreviewFrame title={title} module={module} styles={styles} exportName={exportName} theme={theme} props={defaults} onStatus={setStatus} className="absolute inset-0 size-full" />
      {status.state === 'loading' && <p className="absolute inset-0 grid place-items-center text-[13px] text-ink-faint">{t('loading')}</p>}
      {status.state === 'error' && (
        <p role="alert" className="absolute inset-0 grid place-items-center bg-sunken/90 p-6 text-center text-[13px] text-danger">
          {t('previewError', { message: status.message })}
        </p>
      )}
    </div>
  )
}
