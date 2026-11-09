// SPDX-License-Identifier: MIT
// Copyright (c) 2025 WebTUI
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/utils/box.css
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/components/table.css
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@motif/runtime'
import { BoxContext, Footer, Hero, Judges, Prizes, Register, Rules, Schedule, StatusBar } from './sections'

/* @motif:defaults */
export const defaults = {
  eventName: 'Nullbyte Hack',
  dates: 'Mar 12–14, 2027',
  prizePool: '$48,000',
  palette: 'gruvbox-dark',
  boxStyle: 'square',
  monoFont: 'jetbrains',
  caretBlink: true,
}
/* @motif:end */

const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// 字体清单里的等宽字体；上游默认是浏览器的 monospace。
const FONTS: Record<string, string> = {
  jetbrains: `'JetBrains Mono Variable'${MONO}`,
  'geist-mono': `'Geist Mono Variable'${MONO}`,
  'plex-mono': `'IBM Plex Mono'${MONO}`,
  vt323: `'VT323'${MONO}`,
}

const PALETTES = new Set(['gruvbox-dark', 'gruvbox-dark-hard', 'gruvbox-light', 'nord'])
const BOXES = new Set(['square', 'round', 'double'])

export type HackathonTerminalSiteProps = Partial<typeof defaults> & {
  /** 开场时间（ISO 8601，带时区），倒计时数到这一刻。dates 只是展示文案。 */
  startsAt?: string
  /** 倒计时的起点（毫秒时间戳）。不传读真实时钟；传了就从这一刻按帧时间往下数（演示、截图用）。 */
  now?: number
  className?: string
  style?: CSSProperties
}

/**
 * 终端风格的黑客松官网：tmux 式状态栏、标题嵌在边框里的文本面板（WebTUI 的 box- 工具类）、
 * crontab 式日程表（WebTUI 的 table）、奖池、评委、规则和一个能输入昵称报名的假 shell。
 */
export function HackathonTerminalSite({ className, style, startsAt = '2027-03-12T18:00:00+01:00', now, ...props }: HackathonTerminalSiteProps) {
  const o = { ...defaults, ...props }
  const palette = PALETTES.has(o.palette) ? o.palette : defaults.palette
  const box = BOXES.has(o.boxStyle) ? o.boxStyle : defaults.boxStyle
  const font = FONTS[o.monoFont] ? o.monoFont : defaults.monoFont
  const name = o.eventName.trim() || defaults.eventName

  return (
    <div
      className={cn('htk @container relative w-full overflow-x-clip antialiased', className)}
      data-webtui-theme={palette}
      data-font={font}
      data-blink={o.caretBlink ? 'on' : 'off'}
      style={{ '--font-family': FONTS[font], ...style } as CSSProperties}
    >
      <BoxContext value={box}>
        <StatusBar name={name} startsAt={startsAt} now={now} />
        <main className="mx-auto grid max-w-[124ch] grid-cols-1 gap-x-[2ch] gap-y-[1lh] px-4 py-[1lh] @5xl:grid-cols-12 @5xl:px-[2ch]">
          <Hero name={name} dates={o.dates} prizePool={o.prizePool} startsAt={startsAt} now={now} className="@5xl:col-span-12" />
          <Schedule className="@5xl:col-span-8" />
          <Prizes prizePool={o.prizePool} className="@5xl:col-span-4" />
          <Judges className="@5xl:col-span-12" />
          <Rules className="@5xl:col-span-6" />
          <Register name={name} className="@5xl:col-span-6" />
        </main>
        <Footer name={name} dates={o.dates} />
      </BoxContext>
    </div>
  )
}
