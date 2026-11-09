// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/pages/landing/pre-launch.astro
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { themeStyle } from './parts'
import { CallToAction, Coming, Countdown, FAQs, Facts, Footer, Header, Hero, Note, Roadmap, Waitlist } from './sections'

/* @motif:defaults */
export const defaults = {
  brandName: 'Aubade',
  headline: 'A lamp that wakes you with sunrise, not a siren',
  accent: '#fb923c',
  launchInDays: 38,
  dawnCycleSpeed: 1,
  fontPairing: 'inter',
  dark: true,
  showReferral: true,
  radius: 8,
}
/* @motif:end */

export type WaitlistCountdownSiteProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 真实的发布时刻（ISO 8601，最好带时区）。给了就忽略 launchInDays。 */
  launchAt?: string
  /** 固定的「现在」（毫秒时间戳）：倒计时从这一刻按帧时间往下数，预览和录屏每次一样。 */
  now?: number
}

/**
 * 一个还没上市的日出灯的预发布页：首屏是会日出的 SVG 灯，接着倒计时、候补表单（回你排第几、给一条邀请链接）、
 * 为什么现在留邮箱、三张「是什么 / 什么时候 / 为什么现在」卡片、开发日志时间线、发布前的事实数字、FAQ 和收尾 CTA。
 * 区块顺序沿用上游 pre-launch.astro；布局用容器查询，放进任何宽度的容器都能正确响应。
 */
export function WaitlistCountdownSite({ className, style, launchAt, now, ...props }: WaitlistCountdownSiteProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header brand={options.brandName} />
      <main>
        <Hero headline={options.headline} brand={options.brandName} speed={options.dawnCycleSpeed} />
        <Countdown days={options.launchInDays} launchAt={launchAt} now={now} />
        <Waitlist brand={options.brandName} showReferral={options.showReferral} />
        <Note />
        <Coming brand={options.brandName} days={options.launchInDays} />
        <Roadmap />
        <Facts dark={options.dark} />
        <FAQs />
        <CallToAction dark={options.dark} />
      </main>
      <Footer brand={options.brandName} />
    </div>
  )
}
