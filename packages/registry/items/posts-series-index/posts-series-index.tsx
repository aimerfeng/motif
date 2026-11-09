import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#f4b860',
  font: 'serif',
  radius: 14,
  layout: 'rail',
  numbering: 'padded',
  showProgress: true,
  showPrereqs: true,
  heading: 'Local-first, from scratch',
}
/* @motif:end */

export type SeriesLevel = 'beginner' | 'intermediate' | 'advanced'
export type SeriesPart = { id: string; title: string; summary: string; minutes: number; level: SeriesLevel; href: string }
export type SeriesMeta = { description: string; author: string; role: string; updated: string }

export type PostsSeriesIndexProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 系列的各篇，按阅读顺序排列。 */
  parts?: SeriesPart[]
  /** 系列简介、作者和更新时间；不传时用示例内容 SERIES_META。 */
  meta?: SeriesMeta
  /** 「开始之前」的前置要求，每条一句；不传时用示例 PREREQS，空数组时整块不显示。 */
  prereqs?: string[]
  /** 受控的已读列表（篇目 id）；不传时组件自己管理。 */
  completed?: string[]
  /** 非受控时的初始已读列表。 */
  defaultCompleted?: string[]
  onCompletedChange?: (ids: string[]) => void
  /** 非受控时把已读勾选记在 localStorage 的这个键下；不传则只保存在内存里。 */
  storageKey?: string
  /** 「继续」按钮的去向；不传时滚动到下一篇未读并高亮它。 */
  onContinue?: (part: SeriesPart) => void
  /** 点击篇目标题时调用（会阻止默认跳转）；不传时按 href 正常跳转。 */
  onOpenPart?: (part: SeriesPart) => void
}

export const SERIES_META: SeriesMeta = {
  description: 'Build an offline-first notes app that syncs between devices, one primitive at a time. Every part ends with code that runs.',
  author: 'Ilse Varga',
  role: 'Sync team at Fernhill',
  updated: 'Oct 2026',
}

export const SERIES: SeriesPart[] = [
  {
    id: 'why-local-first',
    title: 'Why local-first, and what it costs',
    summary: 'The case against the loading spinner, and the three problems you sign up for once the server stops being the source of truth.',
    minutes: 8,
    level: 'beginner',
    href: '/series/local-first/01-why-local-first',
  },
  {
    id: 'operation-log',
    title: 'Documents as an operation log',
    summary: 'Store every edit as an immutable operation and rebuild state by replaying them. Everything after this builds on it.',
    minutes: 12,
    level: 'beginner',
    href: '/series/local-first/02-operation-log',
  },
  {
    id: 'lamport-clocks',
    title: 'Ordering edits with Lamport clocks',
    summary: 'Two laptops, no shared clock. Give every operation a timestamp that respects cause and effect.',
    minutes: 14,
    level: 'intermediate',
    href: '/series/local-first/03-lamport-clocks',
  },
  {
    id: 'lww-register',
    title: 'A last-writer-wins register you can trust',
    summary: 'Merge concurrent title edits deterministically, and see exactly where last-writer-wins quietly drops data.',
    minutes: 11,
    level: 'intermediate',
    href: '/series/local-first/04-lww-register',
  },
  {
    id: 'text-crdt',
    title: 'Merging two people typing at once',
    summary: 'A sequence CRDT for plain text, with stable character IDs and tombstones for deletes.',
    minutes: 18,
    level: 'advanced',
    href: '/series/local-first/05-text-crdt',
  },
  {
    id: 'sync-protocol',
    title: 'Syncing over a flaky WebSocket',
    summary: 'Exchange version vectors, send only the missing operations and survive a connection that drops mid-sync.',
    minutes: 15,
    level: 'intermediate',
    href: '/series/local-first/06-sync-protocol',
  },
  {
    id: 'compaction',
    title: 'Compaction, snapshots and the storage bill',
    summary: 'Fold old operations into snapshots without breaking a peer that has been offline for a month.',
    minutes: 13,
    level: 'advanced',
    href: '/series/local-first/07-compaction',
  },
]

export const PREREQS = ['TypeScript and async/await at a working level', 'Node 22 or newer, a terminal and two browser tabs', 'No distributed-systems theory. Part 3 builds clocks from zero.']

const LEVELS: SeriesLevel[] = ['beginner', 'intermediate', 'advanced']
const LEVEL_LABEL: Record<SeriesLevel, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

const FONT: Record<string, { family: string; weight: number; title: number; tracking: string }> = {
  serif: { family: "'Newsreader Variable', ui-serif, Georgia, serif", weight: 420, title: 500, tracking: '-0.015em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, title: 550, tracking: '-0.035em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, title: 550, tracking: '-0.035em' },
}
const body = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const mono = "'Geist Mono Variable', ui-monospace, monospace"
const ease = [0.22, 1, 0.36, 1] as const

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toLinear = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const toByte = (v: number) => {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, c)) * 255)
}

const hexOf = (bytes: number[]) => `#${bytes.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`

function luminance(hex: string) {
  const rgb = parseHex(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// 近黑的墨色：和白色在中间亮度的交叉点上对比度约 4.54:1，比常见的 #0b0b10（约 4.43:1）多留出 AA 的余量。
const INK_DARK = '#030305'

/** 主色填充上的文字：深墨和白色里挑对比度更高的那个，最坏情况（两者打平处）也过 4.5:1。 */
function inkOn(fill: string) {
  return contrast(INK_DARK, fill) >= contrast('#ffffff', fill) ? INK_DARK : '#ffffff'
}

/** 次要文字用的墨色：往填充色里退一点（最多 15%），但对比度不低于 4.5:1；退不动就用原墨色。 */
function softInk(ink: string, fill: string) {
  const a = parseHex(ink)
  const b = parseHex(fill)
  if (!a || !b) return ink
  for (const t of [0.15, 0.1, 0.05]) {
    const mixed = hexOf(a.map((v, i) => v * (1 - t) + b[i] * t))
    if (contrast(mixed, fill) >= 4.5) return mixed
  }
  return ink
}

type Lab = [number, number, number]

function toOklab(hex: string): Lab | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

/** OKLab → sRGB；超出色域时按比例收色度，亮度和色相不变。 */
function fromOklab(L: number, A: number, B: number) {
  let out: number[] = [0, 0, 0]
  for (let i = 20; i >= 0; i--) {
    const a = (A * i) / 20
    const b = (B * i) / 20
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    out = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
    if (out.every((v) => v >= -0.001 && v <= 1.001)) break
  }
  return hexOf(out.map((v) => toByte(v)))
}

/**
 * 把主色的 OKLab 亮度夹到 [lo, hi]，色相不变。
 * 文字和填充各有一档：深色底取够亮的版本、浅色底取够暗的版本，用户挑什么颜色都读得清、分得开。
 */
function clampLightness(hex: string, lo: number, hi: number) {
  const lab = toOklab(hex)
  if (!lab) return hex
  const target = Math.min(hi, Math.max(lo, lab[0]))
  return target === lab[0] ? hex : fromOklab(target, lab[1], lab[2])
}

/** 主色在指定亮度上的一档，可以转一点色相、收一点色度（头像渐变用）。 */
function shade(hex: string, L: number, turn: number, chroma: number) {
  const lab = toOklab(hex)
  if (!lab) return hex
  const c = Math.hypot(lab[1], lab[2]) * chroma
  const h = Math.atan2(lab[2], lab[1]) + (turn * Math.PI) / 180
  return fromOklab(L, c * Math.cos(h), c * Math.sin(h))
}

function accentTones(accent: string) {
  // 填充色（进度段、勾选、「继续」按钮、连接线）：深色主题 L ≥ 0.6、浅色主题 L ≤ 0.78，保证和底色、未读的灰轨分得开。
  const fillLight = clampLightness(accent, 0, 0.78)
  const fillDark = clampLightness(accent, 0.6, 1)
  const inkLight = inkOn(fillLight)
  const inkDark = inkOn(fillDark)
  // 头像渐变：从主色（亮度夹在 0.62–0.8）到暗 0.2、转 32° 色相的一档。暗黄会发浑，所以黄绿到青这一段往冷色转，其余往暖色转；
  // 缩写放在渐变正中，按中间那一档挑墨色。
  const lab = toOklab(accent)
  const hue = lab ? ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360 : 0
  const turn = hue > 95 && hue < 200 ? 32 : -32
  const top = Math.min(0.8, Math.max(0.62, lab?.[0] ?? 0.7))
  return {
    fillLight,
    fillDark,
    inkLight,
    inkDark,
    softLight: softInk(inkLight, fillLight),
    softDark: softInk(inkDark, fillDark),
    textLight: clampLightness(accent, 0, 0.5),
    textDark: clampLightness(accent, 0.8, 1),
    avatar: `linear-gradient(135deg, ${shade(accent, top, 0, 1)}, ${shade(accent, top - 0.2, turn, 1)})`,
    avatarInk: inkOn(shade(accent, top - 0.1, turn / 2, 1)),
  }
}

function roman(n: number) {
  const table: [number, string][] = [
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let left = n
  let out = ''
  for (const [value, glyph] of table) {
    while (left >= value) {
      out += glyph
      left -= value
    }
  }
  return out
}

function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

function LevelMeter({ level }: { level: SeriesLevel }) {
  const n = LEVELS.indexOf(level) + 1
  return (
    // items-baseline + 图标 self-center：放进一行文字里时，难度字样和旁边的文字落在同一条基线上。
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <svg viewBox="0 0 12 12" className="size-3 self-center" aria-hidden>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1 + i * 3.75} y={11 - (3 + i * 3)} width="2.5" height={3 + i * 3} rx="0.6" fill="currentColor" opacity={i < n ? 1 : 0.28} />
        ))}
      </svg>
      {LEVEL_LABEL[level]}
    </span>
  )
}

function Dot() {
  return <span className="size-0.5 shrink-0 rounded-full bg-current opacity-50" aria-hidden />
}

function UpNext({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap', className)} style={{ color: 'var(--acc-text)', background: 'color-mix(in oklab, var(--acc) 15%, transparent)' }}>
      Up next
    </span>
  )
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

function SeriesGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M8 2 14 5 8 8 2 5Z" />
      <path d="m2 8 6 3 6-3M2 11l6 3 6-3" strokeLinecap="round" />
    </svg>
  )
}

function InfoGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25V11" />
      <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** 多篇教程 / 课程的目录：编号、阅读时长、难度、逐篇已读勾选、整个系列的进度条，以及跳到下一篇未读的「继续」按钮。 */
export function PostsSeriesIndex({
  className,
  style,
  parts = SERIES,
  meta = SERIES_META,
  prereqs: prereqItems = PREREQS,
  completed,
  defaultCompleted,
  onCompletedChange,
  storageKey,
  onContinue,
  onOpenPart,
  ...props
}: PostsSeriesIndexProps) {
  const { accent, font, radius, layout, numbering, showProgress, showPrereqs: wantPrereqs, heading } = { ...defaults, ...props }
  const showPrereqs = wantPrereqs && prereqItems.length > 0
  const reduced = useReducedMotion() ?? false
  const uid = useId()
  const headingId = `${uid}-heading`
  const f = FONT[font] ?? FONT.serif
  const r = Math.max(0, Math.min(24, radius))
  const round = r >= 6 ? '9999px' : `${Math.round(r / 2)}px`
  const tones = useMemo(() => accentTones(accent), [accent])
  const initials = meta.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  // 已读状态：受控时听 completed，否则自己存，传了 storageKey 就同步到 localStorage。
  const controlled = completed !== undefined
  const [inner, setInner] = useState<string[]>(() => defaultCompleted ?? [])
  const doneSet = new Set(controlled ? completed : inner)

  // 新勾上的那一篇放一个小小的扩散圈；首次渲染和从 localStorage 恢复进度时不放。
  const doneKey = parts.filter((p) => doneSet.has(p.id)).map((p) => p.id).join('|')
  const prevDone = useRef<Set<string> | null>(null)
  const [pop, setPop] = useState<{ id: string; n: number } | null>(null)
  useEffect(() => {
    const prev = prevDone.current
    const now = doneKey ? doneKey.split('|') : []
    prevDone.current = new Set(now)
    if (!prev) return
    const added = now.filter((id) => !prev.has(id))
    if (added.length === 1) setPop((p) => ({ id: added[0], n: (p?.n ?? 0) + 1 }))
  }, [doneKey])
  // 必须排在上面那个 effect 之后：把恢复出来的进度直接设成比较基准，下一次渲染就不会把它当成新勾选。
  useEffect(() => {
    if (controlled || !storageKey) return
    try {
      const raw = window.localStorage.getItem(storageKey)
      const value: unknown = raw ? JSON.parse(raw) : null
      if (!Array.isArray(value)) return
      const ids = value.filter((id): id is string => typeof id === 'string')
      prevDone.current = new Set(ids)
      setInner(ids)
    } catch {
      /* 存储被禁用或内容损坏：当作没有进度 */
    }
  }, [controlled, storageKey])
  const commit = (ids: string[]) => {
    const ordered = parts.filter((p) => ids.includes(p.id)).map((p) => p.id)
    if (!controlled) {
      setInner(ordered)
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(ordered))
        } catch {
          /* 存储被禁用：只保留在内存里 */
        }
      }
    }
    onCompletedChange?.(ordered)
  }
  const toggle = (id: string) => commit(doneSet.has(id) ? [...doneSet].filter((x) => x !== id) : [...doneSet, id])

  const total = parts.length
  const doneCount = parts.filter((p) => doneSet.has(p.id)).length
  const nextIndex = parts.findIndex((p) => !doneSet.has(p.id))
  const finished = total > 0 && nextIndex === -1
  const target = parts[finished ? 0 : Math.max(0, nextIndex)]
  const totalMinutes = parts.reduce((sum, p) => sum + p.minutes, 0)
  const leftMinutes = parts.reduce((sum, p) => sum + (doneSet.has(p.id) ? 0 : p.minutes), 0)
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const num = (i: number) => (numbering === 'roman' ? roman(i + 1) : numbering === 'padded' ? String(i + 1).padStart(2, '0') : String(i + 1))
  const prose = (i: number) => (numbering === 'roman' ? roman(i + 1) : String(i + 1))

  const rows = useRef(new Map<string, HTMLElement>())
  const [flash, setFlash] = useState<{ id: string; n: number } | null>(null)
  const jump = () => {
    if (!target) return
    if (onContinue) {
      onContinue(target)
      return
    }
    const el = rows.current.get(target.id)
    if (!el) return
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    el.querySelector<HTMLElement>('[data-part-link]')?.focus({ preventScroll: true })
    setFlash((p) => ({ id: target.id, n: (p?.n ?? 0) + 1 }))
  }
  const open = (part: SeriesPart) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpenPart || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onOpenPart(part)
  }
  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) rows.current.set(id, el)
    else rows.current.delete(id)
  }

  const enter = (delay: number) => ({ initial: reduced ? (false as const) : { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease } })
  const ring = 'outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  const titleStyle: CSSProperties = { fontFamily: f.family, fontWeight: f.title, letterSpacing: f.tracking === '-0.015em' ? '-0.005em' : '-0.02em' }

  const tick = (part: SeriesPart, i: number) => {
    const on = doneSet.has(part.id)
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        // 名字不随状态变（状态由 aria-checked 报），编号一律用阿拉伯数字：读屏会把 VII 逐个字母念出来。
        aria-label={`Part ${i + 1} read`}
        onClick={() => toggle(part.id)}
        className={cn(
          'relative z-10 grid size-7 shrink-0 place-items-center border transition-[background-color,border-color,color] duration-200',
          ring,
          // 未勾选的边框是控件的边界，需要 3:1 的非文本对比度（WCAG 1.4.11），/50 在两种主题下都够。
          on ? 'border-transparent' : 'border-foreground/50 text-transparent hover:border-foreground/70 hover:text-foreground/60',
        )}
        style={{ borderRadius: round, ...(on ? { background: 'var(--acc)', color: 'var(--ink)' } : null) }}
      >
        {on && pop?.id === part.id && !reduced && (
          <motion.span
            key={pop.n}
            aria-hidden
            className="pointer-events-none absolute -inset-px border-2"
            style={{ borderRadius: round, borderColor: 'var(--acc)' }}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path key={on ? 'on' : 'off'} d="m3.5 8.5 3 3 6-7" initial={on && !reduced ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.05, ease }} />
        </svg>
      </button>
    )
  }

  const flashFor = (id: string, className: string) =>
    flash?.id === id ? (
      <motion.span
        key={flash.n}
        aria-hidden
        className={cn('pointer-events-none absolute', className)}
        style={{ borderRadius: `${r}px`, background: 'color-mix(in oklab, var(--acc) 14%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--acc) 50%, transparent)' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.6, ease: 'easeOut' }}
      />
    ) : null

  // 标题链接用 ::after 撑满整行 / 整张卡片当点击区，键盘焦点环也画在这个 ::after 上；
  // area 给出各版式下它的位置和圆角，保证焦点环不会被外层的 overflow-hidden 裁掉。
  const link = (part: SeriesPart, i: number, children: ReactNode, area: string) => (
    <a
      data-part-link
      href={part.href}
      onClick={open(part)}
      aria-current={i === nextIndex ? 'step' : undefined}
      className={cn('outline-none group-hover:text-[color:var(--acc-text)] after:absolute after:content-[""] focus-visible:after:ring-2 focus-visible:after:ring-[color:var(--acc-text)]', area)}
    >
      {children}
    </a>
  )

  const header = (
    <motion.div {...enter(0)}>
      <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.08em] uppercase" style={{ color: 'var(--acc-text)' }}>
        <SeriesGlyph />
        Tutorial series
      </p>
      <h2 id={headingId} className="mt-4 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.04 }}>
        {heading}
      </h2>
      <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">{meta.description}</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ background: tones.avatar, color: tones.avatarInk }} aria-hidden>
          {initials}
        </span>
        <span className="min-w-0 text-sm leading-tight">
          <span className="block font-medium">{meta.author}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{meta.role}</span>
        </span>
      </div>
      <dl className="mt-6 grid max-w-md grid-cols-3 gap-3 border-t pt-5">
        {[
          ['Parts', String(total)],
          ['Reading', duration(totalMinutes)],
          ['Updated', meta.updated],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</dt>
            <dd className="mt-1 truncate text-sm font-medium tabular-nums" style={{ fontFamily: mono }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  )

  const progress = (
    <motion.div {...enter(0.08)} className="border bg-card/60 p-5 shadow-[0_1px_0_0_color-mix(in_oklab,var(--foreground)_4%,transparent)_inset]" style={{ borderRadius: `${r}px` }}>
      {showProgress && (
        <div className="mb-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Your progress</p>
            <p className="text-sm tabular-nums" style={{ fontFamily: mono }}>
              <span style={{ color: 'var(--acc-text)' }}>{doneCount}</span>
              <span className="text-muted-foreground"> / {total}</span>
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Series progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={doneCount}
            aria-valuetext={`${doneCount} of ${total} parts read`}
            className="mt-3 flex gap-1"
          >
            {parts.map((p, i) => (
              <span
                key={p.id}
                className="relative h-1.5 flex-1 overflow-hidden"
                style={{ borderRadius: r === 0 ? 0 : 9999, background: i === nextIndex ? 'color-mix(in oklab, var(--acc) 24%, transparent)' : 'color-mix(in oklab, var(--foreground) 10%, transparent)' }}
              >
                <motion.span
                  className="absolute inset-0 origin-left"
                  style={{ background: 'var(--acc)' }}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: doneSet.has(p.id) ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.5, bounce: 0, delay: 0.15 + i * 0.05 }}
                />
              </span>
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="tabular-nums">{finished ? 'Every part read' : `${pct}% read · ${duration(leftMinutes)} left`}</span>
            {doneCount > 0 && (
              <button type="button" onClick={() => commit([])} className={cn('-mx-1 rounded px-1 transition-colors hover:text-foreground', ring)}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}
      {target && (
        <button
          type="button"
          onClick={jump}
          className={cn('group flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-[filter,background-color] duration-200 hover:brightness-110', ring)}
          style={{
            borderRadius: `${Math.round(r * 0.72)}px`,
            ...(finished ? { background: 'transparent', color: 'var(--foreground)', borderColor: 'var(--border)' } : { background: 'var(--acc)', color: 'var(--ink)', borderColor: 'transparent' }),
          }}
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{finished ? 'Read again from Part 1' : doneCount === 0 ? `Start with Part ${prose(0)}` : `Continue with Part ${prose(nextIndex)}`}</span>
            <span className="mt-0.5 block truncate text-xs" style={finished ? { color: 'var(--muted-foreground)' } : { color: 'var(--ink-soft)' }}>
              {target.title} · {target.minutes} min
            </span>
          </span>
          <Arrow className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      )}
      {storageKey && !controlled && <p className="mt-3 text-[11px] text-muted-foreground">Progress is saved in this browser.</p>}
    </motion.div>
  )

  const prereqList = (
    <ul className="mt-3 space-y-2 text-sm leading-snug text-muted-foreground">
      {prereqItems.map((t) => (
        <li key={t} className="flex gap-2.5">
          <span className="mt-[0.5em] size-1 shrink-0 rounded-full" style={{ background: 'var(--acc)' }} aria-hidden />
          <span className="min-w-0">{t}</span>
        </li>
      ))}
    </ul>
  )

  const prereqs = showPrereqs && (
    <motion.div {...enter(0.14)} className="border border-dashed p-5" style={{ borderRadius: `${r}px` }}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <span style={{ color: 'var(--acc-text)' }}>
          <InfoGlyph />
        </span>
        Before you start
      </p>
      {prereqList}
    </motion.div>
  )

  const rail = (
    <ol className="relative">
      {parts.map((part, i) => {
        const on = doneSet.has(part.id)
        const next = i === nextIndex
        const last = i === parts.length - 1
        return (
          <motion.li key={part.id} ref={register(part.id)} {...enter(0.12 + i * 0.05)} className={cn('group relative flex scroll-my-24 gap-4 sm:gap-5', !last && 'pb-8')}>
            {next && (
              <motion.span
                aria-hidden
                className={cn('pointer-events-none absolute -inset-x-3 -top-3 border sm:-inset-x-4', last ? '-bottom-3' : 'bottom-5')}
                style={{ borderRadius: `${r}px`, background: 'color-mix(in oklab, var(--acc) 5%, transparent)', borderColor: 'color-mix(in oklab, var(--acc) 20%, transparent)' }}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease }}
              />
            )}
            {flashFor(part.id, cn('-inset-x-3 -top-3 sm:-inset-x-4', last ? '-bottom-3' : 'bottom-5'))}
            {!last && (
              <span aria-hidden className="absolute top-[2.875rem] bottom-1.5 left-[1.125rem] w-px -translate-x-1/2 overflow-hidden bg-border">
                <motion.span
                  className="absolute inset-0 origin-top"
                  style={{ background: 'var(--acc)' }}
                  initial={false}
                  animate={{ scaleY: on ? 1 : 0, opacity: on && doneSet.has(parts[i + 1].id) ? 1 : 0.55 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, ease }}
                />
              </span>
            )}
            <span
              className="relative grid size-9 shrink-0 place-items-center border text-[11px] font-medium tabular-nums transition-[background-color,border-color,color] duration-300"
              style={{
                fontFamily: mono,
                borderRadius: round,
                ...(on
                  ? { background: 'color-mix(in oklab, var(--acc) 16%, var(--background))', borderColor: 'color-mix(in oklab, var(--acc) 50%, transparent)', color: 'var(--acc-text)' }
                  : next
                    ? { background: 'var(--background)', borderColor: 'var(--acc)', color: 'var(--acc-text)', boxShadow: '0 0 0 4px color-mix(in oklab, var(--acc) 14%, transparent)' }
                    : { background: 'var(--background)', color: 'var(--muted-foreground)' }),
              }}
            >
              {next && !reduced && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px border"
                  style={{ borderRadius: round, borderColor: 'var(--acc)' }}
                  animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              {num(i)}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                <span className="tabular-nums" style={{ fontFamily: mono }}>
                  Part {prose(i)}
                </span>
                <Dot />
                <span className="tabular-nums">{part.minutes} min</span>
                <Dot />
                <LevelMeter level={part.level} />
                {next && <UpNext />}
              </div>
              <h3 className={cn('mt-1.5 text-lg leading-snug transition-colors duration-200 sm:text-xl', on ? 'text-foreground/70' : 'text-foreground')} style={titleStyle}>
                {link(part, i, part.title, cn('after:-inset-x-3 after:-top-3 after:rounded-[var(--psi-r)] focus-visible:after:ring-inset sm:after:-inset-x-4', last ? 'after:-bottom-3' : 'after:bottom-5'))}
              </h3>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">{part.summary}</p>
            </div>
            <div className="pt-1">{tick(part, i)}</div>
          </motion.li>
        )
      })}
    </ol>
  )

  const table = (
    <motion.div {...enter(0.12)} className="overflow-hidden border bg-card/40" style={{ borderRadius: `${r}px` }}>
      {/* lg 起目录表只占右侧一栏：难度挪进摘要行，把宽度让给标题。 */}
      <div aria-hidden className="hidden grid-cols-[3rem_minmax(0,1fr)_7.5rem_4.5rem_2.75rem] items-center border-b px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:grid lg:grid-cols-[3rem_minmax(0,1fr)_4.5rem_2.75rem]">
        <span>#</span>
        <span>Part</span>
        <span className="lg:hidden">Level</span>
        <span className="text-right">Time</span>
        <span />
      </div>
      <ol>
        {parts.map((part, i) => {
          const on = doneSet.has(part.id)
          const next = i === nextIndex
          return (
            <li
              key={part.id}
              ref={register(part.id)}
              className="group relative grid scroll-my-24 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start border-b px-4 py-3.5 transition-colors duration-200 last:border-b-0 hover:bg-foreground/[0.03] sm:grid-cols-[3rem_minmax(0,1fr)_7.5rem_4.5rem_2.75rem] lg:grid-cols-[3rem_minmax(0,1fr)_4.5rem_2.75rem]"
            >
              {flashFor(part.id, 'inset-0 rounded-none!')}
              {next && <span aria-hidden className="absolute inset-y-2.5 left-0 w-0.5 rounded-r" style={{ background: 'var(--acc)' }} />}
              <span className="pt-[3px] text-xs tabular-nums" style={{ fontFamily: mono, color: next ? 'var(--acc-text)' : 'var(--muted-foreground)' }}>
                {num(i)}
              </span>
              <div className="min-w-0 pr-3">
                <p className={cn('line-clamp-2 text-[15px] leading-snug font-medium transition-colors duration-200', on ? 'text-foreground/70' : 'text-foreground')}>
                  {/* 外层有 overflow-hidden：焦点环往里缩 4px、画在行内，圆角比外框小一档，首末行的拐角也不会被裁。 */}
                  {link(part, i, part.title, 'after:inset-1 after:rounded-[var(--psi-row-r)] focus-visible:after:ring-inset')}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {next && (
                    <span className="font-medium" style={{ color: 'var(--acc-text)' }}>
                      Up next ·{' '}
                    </span>
                  )}
                  <span className="sm:hidden">
                    {part.minutes} min · {LEVEL_LABEL[part.level]}
                  </span>
                  <span className="hidden lg:inline">
                    <LevelMeter level={part.level} /> ·{' '}
                  </span>
                  <span className="hidden sm:inline">{part.summary}</span>
                </p>
              </div>
              <span className="hidden pt-[3px] text-xs text-muted-foreground sm:block lg:hidden">
                <LevelMeter level={part.level} />
              </span>
              <span className="hidden pt-[3px] text-right text-xs text-muted-foreground tabular-nums sm:block" style={{ fontFamily: mono }}>
                {part.minutes} min
              </span>
              <span className="-mt-1 flex justify-end">{tick(part, i)}</span>
            </li>
          )
        })}
      </ol>
    </motion.div>
  )

  const cards = (
    <ol className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {showPrereqs && (
        <motion.li {...enter(0.12)} className="flex flex-col border border-dashed p-5" style={{ borderRadius: `${r}px` }}>
          <span className="grid size-9 place-items-center border" style={{ borderRadius: round, color: 'var(--acc-text)' }}>
            <InfoGlyph />
          </span>
          <p className="mt-6 text-lg leading-snug" style={titleStyle}>
            Before you start
          </p>
          {prereqList}
        </motion.li>
      )}
      {parts.map((part, i) => {
        const on = doneSet.has(part.id)
        const next = i === nextIndex
        return (
          <motion.li
            key={part.id}
            ref={register(part.id)}
            {...enter(0.16 + i * 0.05)}
            // 不加 overflow-hidden：标题链接的焦点环画在卡片外沿，裁掉就看不见了。底部进度条单独放在一层圆角裁切里。
            className="group relative flex min-h-60 scroll-my-24 flex-col border bg-card/50 p-5 transition-[border-color,background-color] duration-200 hover:bg-card"
            style={{
              borderRadius: `${r}px`,
              ...(next ? { borderColor: 'color-mix(in oklab, var(--acc) 50%, var(--border))', boxShadow: '0 24px 60px -36px color-mix(in oklab, var(--acc) 70%, transparent)' } : null),
            }}
          >
            {flashFor(part.id, 'inset-0')}
            <div className="flex items-start justify-between gap-3">
              <span
                className="text-[2.6rem] leading-none tabular-nums"
                style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, color: next ? 'var(--acc-text)' : on ? 'color-mix(in oklab, var(--acc-text) 55%, var(--muted-foreground))' : 'var(--muted-foreground)' }}
              >
                {num(i)}
              </span>
              {tick(part, i)}
            </div>
            <h3 className={cn('mt-6 text-lg leading-snug transition-colors duration-200', on ? 'text-foreground/70' : 'text-foreground')} style={titleStyle}>
              {link(part, i, part.title, 'after:-inset-px after:rounded-[var(--psi-r)] focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-background')}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{part.summary}</p>
            <div className="mt-auto flex items-center gap-2.5 pt-5 text-xs text-muted-foreground">
              <span className="tabular-nums">{part.minutes} min</span>
              <Dot />
              <LevelMeter level={part.level} />
              {next && <UpNext className="ml-auto" />}
            </div>
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: `${Math.max(0, r - 1)}px` }}>
              <motion.span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
                style={{ background: 'var(--acc)' }}
                initial={false}
                animate={{ scaleX: on ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease }}
              />
            </span>
          </motion.li>
        )
      })}
    </ol>
  )

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'w-full text-foreground',
        // 主色分三种用法：--acc 填充、--ink 填充上的文字、--acc-text 当文字色；每种在浅色 / 深色主题下各取一档。
        '[--acc-text:var(--psi-text-l)] [--acc:var(--psi-fill-l)] [--ink-soft:var(--psi-soft-l)] [--ink:var(--psi-ink-l)]',
        'dark:[--acc-text:var(--psi-text-d)] dark:[--acc:var(--psi-fill-d)] dark:[--ink-soft:var(--psi-soft-d)] dark:[--ink:var(--psi-ink-d)]',
        className,
      )}
      style={{
        ['--psi-fill-l' as string]: tones.fillLight,
        ['--psi-fill-d' as string]: tones.fillDark,
        ['--psi-ink-l' as string]: tones.inkLight,
        ['--psi-ink-d' as string]: tones.inkDark,
        ['--psi-soft-l' as string]: tones.softLight,
        ['--psi-soft-d' as string]: tones.softDark,
        ['--psi-text-l' as string]: tones.textLight,
        ['--psi-text-d' as string]: tones.textDark,
        ['--psi-r' as string]: `${r}px`,
        ['--psi-row-r' as string]: `${Math.max(0, r - 6)}px`,
        fontFamily: body,
        ...style,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
        {layout === 'cards' ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
              {header}
              {progress}
            </div>
            {cards}
          </>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="min-w-0 space-y-5 lg:sticky lg:top-10 lg:self-start">
              <div className="pb-3">{header}</div>
              <div className={cn('grid grid-cols-[minmax(0,1fr)] gap-5', showPrereqs && 'md:grid-cols-2 md:items-start lg:grid-cols-[minmax(0,1fr)]')}>
                {progress}
                {prereqs}
              </div>
            </div>
            <div className="min-w-0">{layout === 'table' ? table : rail}</div>
          </div>
        )}
      </div>
    </section>
  )
}
