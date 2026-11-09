// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/pages/landing/pre-launch.astro
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@motif/runtime'
import { themeStyle } from './parts'
import { Footer, Header, Hero, Schedule, Speakers, Sponsors, Tickets, Venue } from './sections'

/* @motif:defaults */
export const defaults = {
  eventName: 'Joinery Conf',
  city: 'Lisbon',
  dates: 'June 17–18, 2027',
  accent: '#0161ef',
  secondaryAccent: '#6d28d9',
  scheduleView: 'vertical',
  fontPairing: 'inter',
  dark: false,
}
/* @motif:end */

export type DesignConferenceSiteProps = Partial<typeof defaults> & {
  /** 开场时间（ISO 8601，带时区），倒计时数到这一刻。dates 只是展示文案。 */
  startsAt?: string
  /** 倒计时的起点（毫秒时间戳）。不传读真实时钟；传了就从这一刻按帧时间往下数（演示、截图用）。 */
  now?: number
  className?: string
  style?: CSSProperties
}

/**
 * 设计工程大会官网：吸顶导航、带倒计时的首屏、分日期和分会场的日程、讲者、场地平面图、门票、赞助商、页脚。
 * 结构来自 AstroWind 的 Countdown / Timeline / Team / Pricing 组件。
 */
export function DesignConferenceSite({ className, style, startsAt = '2027-06-17T08:30:00Z', now, ...props }: DesignConferenceSiteProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('relative w-full overflow-x-clip antialiased', options.dark && 'dark', className)} style={{ ...themeStyle(options), ...style }}>
      <Header name={options.eventName} />
      <main>
        <Hero name={options.eventName} dates={options.dates} city={options.city} startsAt={startsAt} now={now} />
        <Schedule layout={options.scheduleView} />
        <Speakers accent={options.accent} secondaryAccent={options.secondaryAccent} />
        <Venue city={options.city} />
        <Tickets />
        <Sponsors />
      </main>
      <Footer name={options.eventName} dates={options.dates} city={options.city} />
    </div>
  )
}
