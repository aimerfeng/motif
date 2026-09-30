// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Bohdan (https://bohd4n.dev/)
// Source: https://github.com/bohd4nx/app-landing/blob/8bd0798/src/app/page.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { themeStyle } from './parts'
import { Cta, Faq, Features, Footer, Header, Hero, Pricing, Reviews, Screens, Stats } from './sections'

/* @motif:defaults */
export const defaults = {
  brandName: 'Cadence',
  accent: '#ff6a3d',
  fontPair: 'archivo',
  radius: 12,
  dark: true,
  headline: 'A running plan that changes when you do',
  subhead: 'Cadence adjusts every session to your sleep, your legs and your calendar, so you can train for a race without a spreadsheet.',
}
/* @motif:end */

export type MobileAppLandingProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 移动 App 落地页：吸顶导航、手机组合首屏（含应用信息）、数据带、便当格功能、四屏画廊、评分与评价、定价、FAQ、CTA、页脚。
 * 手机截图全部是 JSX 画的界面；没有商店徽章，下载按钮是普通按钮。布局用容器查询。
 */
export function MobileAppLanding({ className, style, ...props }: MobileAppLandingProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header brand={options.brandName} />
      <main>
        <Hero brand={options.brandName} headline={options.headline} subhead={options.subhead} />
        <Stats />
        <Features />
        <Screens brand={options.brandName} />
        <Reviews />
        <Pricing />
        <Faq />
        <Cta brand={options.brandName} />
      </main>
      <Footer brand={options.brandName} />
    </div>
  )
}
