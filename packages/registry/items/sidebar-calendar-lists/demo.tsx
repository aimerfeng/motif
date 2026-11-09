// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/sidebar-12/page.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { CalendarSidebar, defaults, SidebarTrigger, type CalendarSidebarProps } from './sidebar-calendar-lists'

/** 固定的「今天」，海报和循环视频每次一样。 */
const TODAY = '2025-03-12'
/** 自动播放：每 1.5 秒选中下一天，在 12–21 日之间来回走；用户点了日期就停下。 */
const STEP = 1.5
const PATH = [12, 13, 14, 17, 18, 19, 20, 21]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** 事件：cal 是日历序号（对应调色板里的颜色）。 */
const EVENTS: Record<number, { time: string; title: string; cal: number }[]> = {
  10: [{ time: '09:30', title: 'Sprint planning', cal: 1 }],
  11: [
    { time: '08:00', title: 'Run club', cal: 0 },
    { time: '14:00', title: 'Design review', cal: 1 },
  ],
  12: [
    { time: '10:00', title: 'Roadmap sync', cal: 1 },
    { time: '18:30', title: "Leo's recital", cal: 2 },
  ],
  13: [{ time: '12:00', title: 'Lunch with Ana', cal: 0 }],
  14: [
    { time: '11:00', title: 'Vendor call', cal: 1 },
    { time: '17:00', title: 'Q1 report due', cal: 3 },
  ],
  17: [{ time: 'All day', title: "St. Patrick's Day", cal: 3 }],
  18: [
    { time: '09:00', title: '1:1 with Priya', cal: 1 },
    { time: '19:00', title: 'Pottery class', cal: 0 },
  ],
  19: [{ time: '15:30', title: 'Dentist', cal: 0 }],
  20: [
    { time: '10:00', title: 'Hiring panel', cal: 1 },
    { time: '20:00', title: 'Family dinner', cal: 2 },
  ],
  21: [{ time: '07:10', title: 'Flight to Lisbon', cal: 3 }],
}
const GRID = [10, 11, 12, 13, 14, 17, 18, 19, 20, 21]

export function Demo(props: CalendarSidebarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(12)
  const [manual, setManual] = useState<string | null>(null)
  const palette = props.calendarPalette ?? defaults.calendarPalette
  const accent = props.accent ?? defaults.accent

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = PATH[Math.floor(time / STEP) % PATH.length]!
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const selected = manual ?? `2025-03-${String(auto).padStart(2, '0')}`
  const [y, m, d] = selected.split('-').map(Number) as [number, number, number]
  const date = new Date(y, m - 1, d)
  const inMarch = y === 2025 && m === 3

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <CalendarSidebar {...props} today={TODAY} selected={selected} onSelectedChange={setManual}>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div role="separator" aria-orientation="vertical" className="mr-2 h-4 w-px bg-border" />
          <h1 className="truncate font-medium text-sm">
            {DAYS[date.getDay()]}, {MONTHS[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
          </h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            {GRID.map((day) => {
              const active = inMarch && day === d
              const events = EVENTS[day] ?? []
              return (
                <div
                  key={day}
                  className={cn(
                    'flex min-h-32 flex-col gap-2 rounded-xl border bg-muted/50 p-3 transition-[border-color,box-shadow] md:aspect-square md:min-h-0',
                    active && 'shadow-sm',
                  )}
                  style={active ? { borderColor: accent } : undefined}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground text-xs">{DAYS[new Date(2025, 2, day).getDay()]}</span>
                    <span className="font-semibold text-lg tabular-nums">{day}</span>
                  </div>
                  <ul className="flex min-w-0 flex-col gap-1.5">
                    {events.map((e) => (
                      <li key={e.title} className="flex min-w-0 items-start gap-2 text-xs">
                        <span
                          aria-hidden="true"
                          className="mt-1 size-2 shrink-0 rounded-full"
                          style={{ background: palette[e.cal % palette.length] }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{e.title}</span>
                          <span className="block text-muted-foreground tabular-nums">{e.time}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </CalendarSidebar>
    </div>
  )
}
