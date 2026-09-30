// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Gonzalo Chalé
// Source: https://github.com/gonzalochale/saas-landing-template/blob/7bc36b2/app/page.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@motif/runtime'
import { InboxMock } from './mockups'
import { themeStyle } from './parts'
import { Cta, Faq, Features, Footer, Hero, Navbar, PartnersBand, Pricing, Stats, Steps, Testimonials } from './sections'

/* @motif:defaults */
export const defaults = {
  brandName: 'Harbor',
  accent: '#0d9488',
  fontPair: 'jakarta',
  radius: 12,
  dark: false,
  headline: 'Support that feels like one conversation, not forty tickets',
  subhead: 'Email, chat and web forms land in a single shared inbox. Everyone sees who is replying, and customers never have to repeat themselves.',
}
/* @motif:end */

export type SupportInboxLandingProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 产品型 SaaS 落地页（共享收件箱）：悬浮胶囊导航、着色器托底的首屏、客户字标、交替图文功能、步骤、评价墙、数据带、定价、FAQ、CTA、页脚。
 * 布局全部用容器查询，放进任何宽度的容器都能正确响应。
 */
export function SupportInboxLanding({ className, style, ...props }: SupportInboxLandingProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Navbar brand={options.brandName} />
      <main>
        <Hero headline={options.headline} subhead={options.subhead} dark={options.dark} accent={options.accent}>
          <InboxMock brand={options.brandName} className="rounded-b-none border-b-0" />
        </Hero>
        <PartnersBand />
        <Features />
        <Steps brand={options.brandName} />
        <Testimonials />
        <Stats />
        <Pricing />
        <Faq />
        <Cta brand={options.brandName} />
      </main>
      <Footer brand={options.brandName} />
    </div>
  )
}
