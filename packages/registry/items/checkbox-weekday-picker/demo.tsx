import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { WeekdayPicker, defaults, type WeekdayPickerProps } from './checkbox-weekday-picker'

const START = [1, 3, 5]
/** 一轮 10 秒：在什么时刻点哪一天。最后一步回到 START，循环接得上。 */
const TAPS: [at: number, day: number][] = [
  [1.0, 2],
  [1.9, 4],
  [3.3, 6],
  [4.7, 1],
  [5.4, 2],
  [6.2, 4],
  [7.2, 6],
  [8.0, 1],
]
const LOOP = 10
const PRESS = 0.2

type DemoCopy = {
  title: string
  lane: string
  time: string
  /** 上午 / AM 标记；first 表示写在时间前面（中文、日文的习惯）。 */
  meridiem?: { text: string; first: boolean }
  closed: string
  tomorrow: string
  /** 周一到周六的简称（周日闭馆，用不到）。 */
  days: string[]
  next: (when: string) => string
  none: string
}

// 卡片文案跟着 Language 参数走，否则切到中文时只有选择器是中文，整张卡片半中半英。
const COPY: Record<string, DemoCopy> = {
  en: {
    title: 'Morning swim',
    lane: 'Lane 4 · 45 min',
    time: '6:30',
    meridiem: { text: 'AM', first: false },
    closed: 'Pool closed on Sundays',
    tomorrow: 'Tomorrow',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    next: (when) => `Next · ${when}, 6:30 AM`,
    none: 'Nothing booked yet',
  },
  zh: {
    title: '晨泳',
    lane: '4 号泳道 · 45 分钟',
    time: '6:30',
    meridiem: { text: '上午', first: true },
    closed: '泳池周日闭馆',
    tomorrow: '明天',
    days: ['周一', '周二', '周三', '周四', '周五', '周六'],
    next: (when) => `下次 · ${when}上午 6:30`,
    none: '还没有安排',
  },
  ja: {
    title: '朝の水泳',
    lane: '4コース · 45分',
    time: '6:30',
    meridiem: { text: '午前', first: true },
    closed: '日曜日は休館',
    tomorrow: '明日',
    days: ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
    next: (when) => `次回 · ${when} 午前6:30`,
    none: 'まだ予定はありません',
  },
  de: {
    title: 'Frühschwimmen',
    lane: 'Bahn 4 · 45 Min.',
    time: '06:30',
    closed: 'Sonntags geschlossen',
    tomorrow: 'morgen',
    days: ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
    next: (when) => `Nächster Termin · ${when}, 06:30`,
    none: 'Noch nichts geplant',
  },
  fr: {
    title: 'Natation du matin',
    lane: 'Couloir 4 · 45 min',
    time: '06:30',
    closed: 'Piscine fermée le dimanche',
    tomorrow: 'demain',
    days: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    next: (when) => `Prochaine séance · ${when}, 06:30`,
    none: 'Aucune séance prévue',
  },
}

type Auto = { days: number[]; pressed: number | null }

function scripted(time: number): Auto {
  const t = time % LOOP
  const days = new Set(START)
  let pressed: number | null = null
  for (const [at, day] of TAPS) {
    if (t >= at) {
      if (days.has(day)) days.delete(day)
      else days.add(day)
    } else if (t >= at - PRESS) pressed = day
  }
  return { days: [...days].sort((a, b) => a - b), pressed }
}

/** 演示里的「今天」是周日（泳池周日闭馆），下一次就是之后第一个选中的日子。 */
function nextSwim(days: number[], copy: DemoCopy): string {
  const next = days.find((day) => day <= 6)
  if (next === undefined) return copy.none
  return copy.next(next === 1 ? copy.tomorrow : copy.days[next - 1]!)
}

export function Demo(props: WeekdayPickerProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>({ days: START, pressed: null })
  const [manual, setManual] = useState<number[] | null>(null)
  const accent = props.accent ?? defaults.accent
  const locale = props.locale ?? defaults.locale
  const copy = COPY[locale] ?? COPY.en!

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.pressed === next.pressed && prev.days.join() === next.days.join() ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.8 },
  )

  const days = manual ?? auto.days
  const meridiem = copy.meridiem && <span className="text-xs font-medium text-muted-foreground">{copy.meridiem.text}</span>

  return (
    <div
      ref={host}
      className="grid h-full w-full place-items-center bg-background p-4 sm:p-6"
      style={{ backgroundImage: `radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, ${accent} 20%, transparent), transparent)` }}
    >
      <div lang={locale} className="w-fit max-w-full rounded-2xl border bg-card/75 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* 图标比强调色提亮一些：强调色为了白字对比度偏深，直接用在深色小方块上会发闷。 */}
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: `color-mix(in oklab, ${accent}, white 30%)` }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="16.5" cy="5.5" r="1.75" />
                <path d="m6 11 4.5-3 2.5 3" />
                <path d="M3 15.5c1.5 0 2.25-1.25 3.75-1.25S9 15.5 10.5 15.5s2.25-1.25 3.75-1.25 2.25 1.25 3.75 1.25 2.25-1.25 3-1.25" />
                <path d="M3 19.5c1.5 0 2.25-1.25 3.75-1.25S9 19.5 10.5 19.5s2.25-1.25 3.75-1.25 2.25 1.25 3.75 1.25 2.25-1.25 3-1.25" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-sm leading-5 font-semibold">{copy.title}</div>
              <div className="text-xs leading-4 text-muted-foreground">{copy.lane}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-1 pt-0.5 leading-none whitespace-nowrap">
            {copy.meridiem?.first && meridiem}
            <span className="text-[28px] font-semibold tracking-tight tabular-nums">{copy.time}</span>
            {copy.meridiem && !copy.meridiem.first && meridiem}
          </div>
        </div>

        <div className="my-4 h-px bg-border" />

        <WeekdayPicker {...props} value={days} unavailable={[7]} pressed={manual ? null : auto.pressed} onValueChange={setManual} />

        <div className="mt-4 mb-3.5 h-px bg-border" />

        {/* contain:inline-size：这一行不参与卡片宽度的计算，卡片宽度由选择器决定；文案长的语言在窄卡片里换行。 */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-xs leading-4 [contain:inline-size]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden className="shrink-0">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 7.25v3.5M8 5.1v.01" />
            </svg>
            {copy.closed}
          </span>
          <span className="font-medium text-foreground/80">{nextSwim(days, copy)}</span>
        </div>
      </div>
    </div>
  )
}
