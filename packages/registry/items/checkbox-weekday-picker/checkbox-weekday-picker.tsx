// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-149.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  shape: 'circle',
  accent: '#2b68ef',
  connect: false,
  labelStyle: 'initial',
  size: 40,
  gap: 8,
  firstDay: 'monday',
  locale: 'en',
  showSummary: true,
}
/* @motif:end */

/** ISO 星期编号：1 = 周一 … 7 = 周日。值永远按这个顺序排序，与 firstDay 无关。 */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type WeekdayPickerProps = Partial<typeof defaults> & {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (days: number[]) => void
  /** 不能选的日子（ISO 编号）：虚线、变暗，小结里也不算。 */
  unavailable?: number[]
  /** 分组标题；不传时按 locale 显示「Repeat on」「重复」等。 */
  label?: string
  /** 界面上已有标题时隐藏它（读屏软件仍能读到）。 */
  hideLabel?: boolean
  /** 表单字段名：每个选中的日子提交一个 name=编号。 */
  name?: string
  disabled?: boolean
  /** 强制显示某一天的按下形态（演示自动播放用）。 */
  pressed?: number | null
  className?: string
  style?: CSSProperties
}

type Copy = {
  narrow: string[]
  short: string[]
  long: string[]
  legend: string
  none: string
  daily: string
  weekdays: string
  weekends: string
  every: (list: string) => string
  range: (from: string, to: string) => string
  separator: string
  count: (n: number) => string
}

// 日子名和小结措辞都按 ISO 顺序（周一在前）写死：Intl 给不出「工作日」「周末」这类说法，各浏览器的缩写也不一致。
const COPY: Record<string, Copy> = {
  en: {
    narrow: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    legend: 'Repeat on',
    none: 'No days selected',
    daily: 'Every day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    every: (list) => `Every ${list}`,
    range: (from, to) => `${from}–${to}`,
    separator: ', ',
    count: (n) => `${n} ${n === 1 ? 'day' : 'days'} a week`,
  },
  zh: {
    narrow: ['一', '二', '三', '四', '五', '六', '日'],
    short: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    long: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    legend: '重复',
    none: '未选择日期',
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    every: (list) => `每${list}`,
    range: (from, to) => `${from}至${to}`,
    separator: '、',
    count: (n) => `每周 ${n} 天`,
  },
  ja: {
    narrow: ['月', '火', '水', '木', '金', '土', '日'],
    short: ['月', '火', '水', '木', '金', '土', '日'],
    long: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    legend: '繰り返し',
    none: '曜日が未選択',
    daily: '毎日',
    weekdays: '平日',
    weekends: '週末',
    every: (list) => `毎週 ${list}`,
    range: (from, to) => `${from}〜${to}`,
    separator: '・',
    count: (n) => `週${n}日`,
  },
  de: {
    narrow: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
    short: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    long: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    legend: 'Wiederholen am',
    none: 'Keine Tage gewählt',
    daily: 'Täglich',
    weekdays: 'Wochentags',
    weekends: 'Am Wochenende',
    every: (list) => `Jeden ${list}`,
    range: (from, to) => `${from}–${to}`,
    separator: ', ',
    count: (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'} pro Woche`,
  },
  fr: {
    narrow: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    short: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
    long: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    legend: 'Répéter le',
    none: 'Aucun jour choisi',
    daily: 'Tous les jours',
    weekdays: 'En semaine',
    weekends: 'Le week-end',
    every: (list) => `Chaque ${list}`,
    range: (from, to) => `${from} – ${to}`,
    separator: ', ',
    count: (n) => `${n} ${n === 1 ? 'jour' : 'jours'} par semaine`,
  },
}

const ORDER: Record<string, number[]> = {
  monday: [1, 2, 3, 4, 5, 6, 7],
  sunday: [7, 1, 2, 3, 4, 5, 6],
  saturday: [6, 7, 1, 2, 3, 4, 5],
}

/** 「工作日」「周末」「每天」优先；其余按显示顺序列出，连续三天以上合成一个区间（Mon–Wed）。 */
function summarizeWeekdays(days: readonly number[], copy: Copy, order: readonly number[]): string {
  const picked = new Set(days)
  if (picked.size === 0) return copy.none
  if (picked.size === 7) return copy.daily
  if (picked.size === 5 && [1, 2, 3, 4, 5].every((day) => picked.has(day))) return copy.weekdays
  if (picked.size === 2 && picked.has(6) && picked.has(7)) return copy.weekends
  const parts: string[] = []
  for (let i = 0; i < order.length; i++) {
    if (!picked.has(order[i]!)) continue
    let j = i
    while (j + 1 < order.length && picked.has(order[j + 1]!)) j++
    const run = order.slice(i, j + 1).map((day) => copy.short[day - 1]!)
    if (run.length >= 3) parts.push(copy.range(run[0]!, run[run.length - 1]!))
    else parts.push(...run)
    i = j
  }
  return copy.every(parts.join(copy.separator))
}

/** WCAG 2.x 相对亮度；不是 #rgb / #rrggbb 时返回 null。 */
function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!
  const value = Number.parseInt(digits, 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

// 近黑字要足够黑：白字和它对比度相等的那一点（亮度约 0.18）两边都还在 4.5:1 以上，
// 所以任何强调色上「取对比度高的那个」都能过 WCAG AA 的小字标准。#0c0d12 这类偏亮的近黑在交界处只有 4.4:1。
const DARK_INK = '#030304'
const DARK_INK_LUMINANCE = luminance(DARK_INK)!

/** 白字和近黑字里取对比度更高的那个（交界在亮度约 0.18，最差也有 4.54:1）。 */
function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  const onWhite = 1.05 / (fill + 0.05)
  const onDark = (fill + 0.05) / (DARK_INK_LUMINANCE + 0.05)
  return onWhite >= onDark ? '#ffffff' : DARK_INK
}

/** 窄屏上每一天最多缩到这么宽：再窄就碰到 24px 的触控下限了。 */
const MIN_CELL = 28

const sorted = (days: Iterable<number>) => [...new Set(days)].filter((day) => day >= 1 && day <= 7).sort((a, b) => a - b)

/**
 * 星期选择器：每一天是一个视觉隐藏的原生复选框（Tab 移动、Space 切换），整行是带标题的 role="group"；
 * 小结是 aria-live 区域，同时作为分组的描述。
 */
export function WeekdayPicker({
  value,
  defaultValue = [1, 2, 3, 4, 5],
  onValueChange,
  unavailable = [],
  label,
  hideLabel = false,
  name,
  disabled = false,
  pressed = null,
  className,
  style,
  ...props
}: WeekdayPickerProps) {
  const { shape, accent, connect, labelStyle, size, gap, firstDay, locale, showSummary } = { ...defaults, ...props }
  const copy = COPY[locale] ?? COPY.en!
  const order = ORDER[firstDay] ?? ORDER.monday!
  const uid = useId()
  const [inner, setInner] = useState(() => sorted(defaultValue))
  const blocked = new Set(unavailable)
  const days = sorted(value ?? inner).filter((day) => !blocked.has(day))
  const picked = new Set(days)

  // 只给「刚被选中」的日子放一次涟漪：比较上一次渲染时的选择（React 推荐的派生状态写法），首屏已选的日子不放。
  const signature = days.join(',')
  const [seen, setSeen] = useState(signature)
  const [bursts, setBursts] = useState<Record<number, number>>({})
  if (seen !== signature) {
    const before = new Set(seen ? seen.split(',').map(Number) : [])
    const next = { ...bursts }
    for (const day of days) if (!before.has(day)) next[day] = (next[day] ?? 0) + 1
    setSeen(signature)
    setBursts(next)
  }

  const toggle = (day: number, on: boolean) => {
    const next = sorted(on ? [...days, day] : days.filter((d) => d !== day))
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  const short = labelStyle === 'short'
  const width = short ? Math.round(size * 1.36) : size
  // 圆角用 min(像素, 百分比)：日子被压窄时圆角跟着按比例收，方块不会被压成圆。
  const radius = shape === 'circle' ? '9999px' : shape === 'squircle' ? `min(${Math.round(size * 0.32)}px, 32%)` : `min(${Math.round(size * 0.16)}px, 16%)`
  // 字号上限是设定值，日子被压窄时按自身宽度（cqw）缩小：单字占宽度的 44% 以内，三个字母的缩写占 33% 以内。
  const initialFont = `min(${Math.round(size * 0.36)}px, 44cqw)`
  const shortFont = `min(${Math.max(11, Math.round(size * 0.33))}px, 33cqw)`
  const ink = inkOn(accent)
  const summary = summarizeWeekdays(days, copy, order)
  const showCount = days.length > 0 && days.length < 7

  return (
    <div
      role="group"
      aria-labelledby={`${uid}-label`}
      aria-describedby={showSummary ? `${uid}-summary` : undefined}
      lang={locale}
      className={cn('min-w-0', disabled && 'opacity-50', className)}
      style={cssVars({ '--wd-accent': accent }, style)}
    >
      <div id={`${uid}-label`} className={cn('mb-3 text-sm leading-5 font-medium text-foreground', hideLabel && 'sr-only')}>
        {label ?? copy.legend}
      </div>
      {/* 每列在 MIN_CELL 和设定宽度之间伸缩：空间够时是设定的样子，窄屏上整排按比例缩小而不是撑破父元素。 */}
      <div className="grid items-center" style={{ gap, gridTemplateColumns: `repeat(7, minmax(${Math.min(MIN_CELL, width)}px, ${width}px))` }}>
        {order.map((day, index) => {
          const on = picked.has(day)
          const closed = blocked.has(day)
          // 整组 disabled 时保留各天原本的样子（外层整体变淡）；虚线只表示「这一天不可选」。
          const off = closed || disabled
          const nextDay = order[index + 1]
          const joined = connect && on && nextDay !== undefined && picked.has(nextDay)
          const isPressed = pressed === day && !off
          return (
            <label
              key={day}
              className={cn(
                // 高度 = min(宽度, size)：缩写的胶囊被压窄时先变回圆形，再整体缩小。@container 让里面的字号按这一格的宽度算。
                '@container relative grid w-full place-items-center border select-none',
                'transition-[scale,background-color,border-color,color] duration-150 ease-out motion-reduce:transition-none',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--wd-accent)',
                off ? 'cursor-not-allowed' : 'cursor-pointer active:scale-[0.92]',
                closed
                  ? 'border-dashed border-foreground/20 text-foreground/30'
                  : on
                    ? 'border-transparent'
                    : cn('border-foreground/12 bg-foreground/[0.04] text-foreground/75', !off && 'hover:bg-foreground/[0.09] hover:text-foreground'),
                isPressed && 'scale-[0.92]',
              )}
              style={{ aspectRatio: '1', maxHeight: size, borderRadius: radius }}
            >
              <input
                type="checkbox"
                className="sr-only"
                name={name}
                value={day}
                checked={on}
                disabled={off}
                aria-label={copy.long[day - 1]}
                onChange={(event) => toggle(day, event.currentTarget.checked)}
              />
              {connect && nextDay !== undefined && (
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute -inset-y-px left-1/2 origin-left bg-(--wd-accent) motion-reduce:transition-none',
                    joined ? 'transition-transform delay-75 duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]' : 'transition-transform duration-150 ease-in',
                  )}
                  // 从本格中心画到下一格中心：100% 是去掉 1px 边框的内框宽度，补回两侧边框再加上间距。
                  style={{ width: `calc(100% + ${gap + 2}px)`, transform: `scaleX(${joined ? 1 : 0})` }}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -inset-px rounded-[inherit] bg-(--wd-accent) motion-reduce:transition-none',
                  on ? 'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)]' : 'transition-[transform,opacity] duration-150 ease-in',
                )}
                style={{
                  transform: on ? 'scale(1)' : 'scale(0.55)',
                  opacity: on ? 1 : 0,
                  boxShadow: connect ? undefined : 'inset 0 1px 0 rgb(255 255 255 / 0.22), 0 8px 18px -10px var(--wd-accent)',
                }}
              />
              {bursts[day] !== undefined && on && <span key={bursts[day]} aria-hidden className="mwd-ripple pointer-events-none absolute -inset-px rounded-[inherit]" />}
              {short && (
                <span aria-hidden className="relative leading-none font-semibold transition-[color] duration-200 @max-[34px]:hidden" style={{ fontSize: shortFont, color: on ? ink : undefined }}>
                  {copy.short[day - 1]}
                </span>
              )}
              {/* 缩写模式下，这一格窄到放不下缩写（字号会小于约 11px）时换回单字。 */}
              <span
                aria-hidden
                className={cn('relative leading-none font-semibold transition-[color] duration-200', short && 'hidden @max-[34px]:block')}
                style={{ fontSize: initialFont, color: on ? ink : undefined }}
              >
                {copy.narrow[day - 1]}
              </span>
            </label>
          )
        })}
      </div>
      {showSummary && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p id={`${uid}-summary`} aria-live="polite" className="flex min-w-0 items-center gap-2 text-sm leading-5 font-medium text-foreground">
            <svg
              viewBox="0 0 16 16"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="shrink-0"
              style={{ color: days.length > 0 ? accent : 'var(--muted-foreground)' }}
            >
              <path d="M2.75 7.25a5.25 5.25 0 0 1 9.1-3.1l1.4 1.35" />
              <path d="M13.25 2.5v3h-3" />
              <path d="M13.25 8.75a5.25 5.25 0 0 1-9.1 3.1l-1.4-1.35" />
              <path d="M2.75 13.5v-3h3" />
            </svg>
            <span key={summary} className="mwd-summary">
              {summary}
            </span>
          </p>
          {showCount && <span className="shrink-0 text-xs leading-5 text-muted-foreground tabular-nums">{copy.count(days.length)}</span>}
        </div>
      )}
    </div>
  )
}
