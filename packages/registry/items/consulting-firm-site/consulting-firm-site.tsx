// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/views/ServicesView.astro
// Modified by Motif; see the item's provenance.
import { AnimatePresence } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import { cn } from '@motif/runtime'
import { InsightDetail } from './insight-detail'
import { themeVars } from './parts'
import { Contact, Footer, Hero, Industries, Insights, Navbar, Practices, Results } from './sections'

/* @motif:defaults */
export const defaults = {
  firmName: 'Halden Rowe',
  headline: 'Strategy and operations advice for companies at a turning point.',
  accent: '#1d3461',
  grayFamily: 'slate',
  serifHeadings: true,
  radius: 6,
  density: 'regular',
  dark: false,
}
/* @motif:end */

export type ConsultingFirmSiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 战略咨询公司官网：克制的首屏、业务领域（左右交替图文）、行业网格、带大数字的案例结果、
 * 洞察列表和阅读视图、办公室与联系表单、页脚。
 */
export function ConsultingFirmSite({ className, style, ...props }: ConsultingFirmSiteProps) {
  const options = { ...defaults, ...props }
  const theme: CSSProperties = { ...themeVars(options), ...style }
  const [reading, setReading] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const domain = `${options.firmName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'firm'}.example`

  const close = () => {
    setReading(null)
    opener.current?.focus({ preventScroll: true })
  }

  return (
    <div className={cn('relative w-full overflow-x-clip antialiased selection:bg-(--brand) selection:text-(--on-brand)', className)} style={theme}>
      <Navbar name={options.firmName} />
      <main>
        <Hero headline={options.headline} />
        <Practices />
        <Industries />
        <Results />
        <Insights
          onOpen={(index, element) => {
            opener.current = element
            setReading(index)
          }}
        />
        <Contact domain={domain} />
      </main>
      <Footer name={options.firmName} />
      <AnimatePresence>{reading !== null && <InsightDetail key="reader" index={reading} name={options.firmName} style={theme} onClose={close} onNavigate={setReading} />}</AnimatePresence>
    </div>
  )
}
