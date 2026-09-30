// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/app/page.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { themeStyle } from './parts'
import { About, Blog, Brands, Contact, Features, Footer, Header, Hero, Pricing, Testimonials, Video } from './sections'

/* @motif:defaults */
export const defaults = {
  brandName: 'Tidepool',
  accent: '#4a6cf7',
  fontPair: 'bricolage',
  radius: 10,
  dark: false,
  headline: 'Reconcile every payout without opening a spreadsheet',
  subhead: 'Match bank deposits to marketplace orders, split what each seller is owed and close the month in an afternoon.',
}
/* @motif:end */

export type TidepoolStartupLandingProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 创业公司整站落地页：吸顶导航、居中首屏、客户字标、六宫格功能、产品视频区、两组图文、评价、定价、博客、联系与订阅、页脚。
 * 布局全部用容器查询，放进任何宽度的容器都能正确响应。
 */
export function TidepoolStartupLanding({ className, style, ...props }: TidepoolStartupLandingProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header brand={options.brandName} />
      <main>
        <Hero headline={options.headline} subhead={options.subhead} />
        <Brands />
        <Features />
        <Video brand={options.brandName} />
        <About />
        <Testimonials />
        <Pricing />
        <Blog />
        <Contact brand={options.brandName} />
      </main>
      <Footer brand={options.brandName} />
    </div>
  )
}
