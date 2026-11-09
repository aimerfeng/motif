import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Fifteen people so far. Five seats still open.',
  accent: '#ff8a5b',
  tone: 'dark',
  seatStyle: 'dashed',
  avatarShape: 'circle',
  radius: 18,
  columns: 5,
  showDepartments: true,
}
/* @motif:end */

export type TeamOpenSeatsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前展开的空位 id（null 表示都收起）。不传则组件自己管理。 */
  activeSeat?: string | null
  onActiveSeatChange?: (id: string | null) => void
  /** 受控：当前筛选的部门（'all' 或部门 id）。不传则组件自己管理。 */
  department?: string
  onDepartmentChange?: (id: string) => void
}

type Dept = 'eng' | 'design' | 'product' | 'gtm' | 'ops'
type Person = { kind: 'person'; id: string; name: string; role: string; city: string; dept: Dept }
type Seat = { kind: 'seat'; id: string; role: string; where: string; dept: Dept; pitch: string; href: string }
type Tile = Person | Seat

const DEPARTMENTS: { id: Dept; label: string }[] = [
  { id: 'eng', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'product', label: 'Product' },
  { id: 'gtm', label: 'Go-to-market' },
  { id: 'ops', label: 'Operations' },
]

/** 空位穿插在人中间：每行最多两个，不落在最后一行，任何列数下都分得开。 */
export const TEAM: Tile[] = [
  { kind: 'person', id: 'marta', name: 'Marta Silva', role: 'Co-founder & CEO', city: 'Lisbon', dept: 'ops' },
  { kind: 'person', id: 'priya', name: 'Priya Raman', role: 'Head of Engineering', city: 'Lisbon', dept: 'eng' },
  { kind: 'seat', id: 'backend', role: 'Senior Backend Engineer', where: 'Remote · EU', dept: 'eng', pitch: 'Own the ledger that settles $40M of payroll every month.', href: '#careers-backend' },
  { kind: 'person', id: 'lea', name: 'Lea Brandt', role: 'Design Lead', city: 'Berlin', dept: 'design' },
  { kind: 'person', id: 'chloe', name: 'Chloé Martin', role: 'Head of Sales', city: 'Paris', dept: 'gtm' },
  { kind: 'person', id: 'tomasz', name: 'Tomasz Wójcik', role: 'Payments Engineer', city: 'Kraków', dept: 'eng' },
  { kind: 'seat', id: 'content', role: 'Content Designer', where: 'Remote · EMEA', dept: 'design', pitch: 'Make tax forms from 41 countries readable on the first try.', href: '#careers-content' },
  { kind: 'person', id: 'noor', name: 'Noor Haddad', role: 'Product Lead', city: 'Amman', dept: 'product' },
  { kind: 'person', id: 'ade', name: 'Ade Okafor', role: 'Platform Engineer', city: 'Lagos', dept: 'eng' },
  { kind: 'seat', id: 'solutions', role: 'Solutions Engineer', where: 'Remote · Americas', dept: 'gtm', pitch: 'Be the first engineer our US customers meet after signing.', href: '#careers-solutions' },
  { kind: 'person', id: 'rafael', name: 'Rafael Costa', role: 'Product Designer', city: 'Porto', dept: 'design' },
  { kind: 'person', id: 'jonas', name: 'Jonas Berg', role: 'Account Executive', city: 'Stockholm', dept: 'gtm' },
  { kind: 'seat', id: 'compliance', role: 'Product Manager, Compliance', where: 'Lisbon · Hybrid', dept: 'product', pitch: 'Turn local payroll law into settings a finance team trusts.', href: '#careers-compliance' },
  { kind: 'person', id: 'hana', name: 'Hana Sato', role: 'Frontend Engineer', city: 'Osaka', dept: 'eng' },
  { kind: 'seat', id: 'ios', role: 'iOS Engineer', where: 'Lisbon or remote', dept: 'eng', pitch: 'Build our first native app. Payslips are 60% of all logins.', href: '#careers-ios' },
  { kind: 'person', id: 'sam', name: 'Sam Whitaker', role: 'Product Analyst', city: 'Leeds', dept: 'product' },
  { kind: 'person', id: 'amara', name: 'Amara Osei', role: 'Customer Success', city: 'Accra', dept: 'gtm' },
  { kind: 'person', id: 'mateo', name: 'Mateo Ruiz', role: 'Security Engineer', city: 'Valencia', dept: 'eng' },
  { kind: 'person', id: 'felix', name: 'Felix Wagner', role: 'Finance & People', city: 'Zurich', dept: 'ops' },
  { kind: 'person', id: 'ines', name: 'Inês Duarte', role: 'Support Lead', city: 'Lisbon', dept: 'gtm' },
]

const SUBHEADING = 'We build Ledgerline, payroll for companies that hire across borders. Three of us share the Lisbon office; the other twelve work from twelve different countries and meet up twice a year.'

/** 两套自带的底色：组件不依赖页面的 .dark，明暗由 tone 决定，对比度可以算出来。 */
const TONES = {
  dark: { bg: '#111216', card: '#18191f', fg: '#f2f2f5', muted: '#a3a4ad', line: 'rgb(255 255 255 / 0.08)', dash: 'rgb(255 255 255 / 0.24)' },
  light: { bg: '#f6f5f1', card: '#ffffff', fg: '#17171c', muted: '#5c5d66', line: 'rgb(20 20 30 / 0.1)', dash: 'rgb(20 20 30 / 0.3)' },
} as const

const SHAPES: Record<string, string> = { circle: '9999px', squircle: '32%', square: '7px' }

/** 20 块 = 2 / 4 / 5 的整数倍：每个断点的最后一行都是满的（3 列或 6 列会剩下孤零零的两块）。 */
const COLS: Record<number, string> = {
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-4 lg:grid-cols-5',
}

type RGB = [number, number, number]

function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1]!, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: RGB) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: RGB, b: RGB) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const toHex = (c: RGB) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** 逐步向前景色靠拢，直到在底色和卡片色上都达到给定对比度。 */
function towardInk(color: RGB, fg: RGB, surfaces: RGB[], min: number): RGB {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const c: RGB = [color[0] + (fg[0] - color[0]) * t, color[1] + (fg[1] - color[1]) * t, color[2] + (fg[2] - color[2]) * t]
    if (surfaces.every((s) => contrast(c, s) >= min)) return c
  }
  return fg
}

/** 实心主色上的文字：黑白里取对比度更高的那个。 */
function inkOn(accent: RGB) {
  return contrast(accent, [255, 255, 255]) >= contrast(accent, [11, 11, 15]) ? '#ffffff' : '#0b0b0f'
}

/** 精选色相：跳过 60–150 的橄榄 / 黄绿区，那一段在压暗的渐变里发灰发脏。按序号跳着取，相邻头像不撞色。 */
const HUES = [18, 200, 285, 165, 340, 235, 30, 310, 185, 258, 2]
const hueAt = (index: number) => HUES[(index * 4) % HUES.length]!

const EASE = [0.22, 1, 0.36, 1] as const

function Initials({ name, shape, hue: h }: { name: string; shape: string; hue: number }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center text-[14px] font-semibold tracking-wide text-white sm:size-14 sm:text-[16px]"
      style={{
        borderRadius: SHAPES[shape] ?? SHAPES.circle,
        // 亮度锁在 0.66→0.42：白色首字母在任何色相上都清楚
        background: `radial-gradient(120% 90% at 28% 18%, rgb(255 255 255 / 0.26), transparent 55%), linear-gradient(150deg, oklch(0.66 0.11 ${h}), oklch(0.42 0.1 ${(h + 42) % 360}))`,
        boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.14)',
        textShadow: '0 1px 2px rgb(0 0 0 / 0.28)',
      }}
    >
      {initials}
    </span>
  )
}

function SeatMark({ seatStyle, shape, active, pulse }: { seatStyle: string; shape: string; active: boolean; pulse: boolean }) {
  const radius = SHAPES[shape] ?? SHAPES.circle
  const ghost = seatStyle === 'ghost'
  return (
    <span aria-hidden className="relative grid size-11 shrink-0 place-items-center sm:size-14">
      {pulse &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 border-[1.5px] border-[var(--tos-acc)]"
            style={{ borderRadius: radius }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.85], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity, delay: i * 1.2 }}
          />
        ))}
      <span
        className="absolute inset-0 overflow-hidden transition-[border-color,background-color,box-shadow] duration-300"
        style={{
          borderRadius: radius,
          border: ghost ? 'none' : `1.5px dashed ${active ? 'var(--tos-acc)' : 'var(--tos-dash)'}`,
          backgroundColor: ghost ? `color-mix(in oklab, var(--tos-acc) ${active ? 24 : 14}%, transparent)` : seatStyle === 'hatched' ? 'var(--tos-bg)' : 'transparent',
          boxShadow: active ? '0 0 0 5px color-mix(in oklab, var(--tos-acc) 16%, transparent)' : '0 0 0 0 transparent',
        }}
      >
        {ghost && (
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-full" fill="color-mix(in oklab, var(--tos-acc) 55%, transparent)">
            <circle cx="24" cy="19" r="7.5" />
            <path d="M8.5 46c1.4-9 7.6-14.5 15.5-14.5S38.1 37 39.5 46Z" />
          </svg>
        )}
      </span>
      {!ghost && (
        <svg viewBox="0 0 20 20" className="relative size-4 transition-colors duration-300" style={{ color: active ? 'var(--tos-acc-text)' : 'var(--tos-muted)' }} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M10 4.5v11M4.5 10h11" />
        </svg>
      )}
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-200 group-hover/apply:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8h9M8.5 4l4 4-4 4" />
    </svg>
  )
}

/** 团队拼贴：正在招的岗位以「空位」坐在团队中间，悬停 / 聚焦展开一句话介绍和申请入口，部门筛选让其他人淡出。 */
export function TeamOpenSeats({ className, style, activeSeat, onActiveSeatChange, department, onDepartmentChange, ...props }: TeamOpenSeatsProps) {
  const { heading, accent, tone, seatStyle, avatarShape, radius, columns, showDepartments } = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const uid = useId()
  const palette = TONES[tone === 'light' ? 'light' : 'dark']
  const surfaces = [parseHex(palette.bg)!, parseHex(palette.card)!]
  const ink = parseHex(palette.fg)!
  // 填充色（Open 标签、申请按钮、脉冲、光晕）至少 3:1，否则深底配深色主色时整套高亮会消失；当文字用时再提到 4.5:1
  const acc = towardInk(parseHex(accent) ?? [255, 138, 91], ink, surfaces, 3)
  const accText = toHex(towardInk(acc, ink, surfaces, 4.5))

  const [ownSeat, setOwnSeat] = useState<string | null>(null)
  const [ownDept, setOwnDept] = useState('all')
  const active = activeSeat !== undefined ? activeSeat : ownSeat
  const filter = showDepartments ? (department ?? ownDept) : 'all'
  const pointerType = useRef('')
  // 程序把焦点还给按钮时（Esc 收起后），别让 onFocus 又把它展开
  const refocusing = useRef(false)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])

  const setSeat = (id: string | null) => {
    setOwnSeat(id)
    onActiveSeatChange?.(id)
  }
  const setDept = (id: string) => {
    setOwnDept(id)
    onDepartmentChange?.(id)
  }

  const people = TEAM.filter((tile): tile is Person => tile.kind === 'person')
  const seats = TEAM.filter((tile): tile is Seat => tile.kind === 'seat')
  const cities = new Set(people.map((p) => p.city)).size
  const options = [{ id: 'all', label: 'Everyone' }, ...DEPARTMENTS]
  const countOf = (id: string) => TEAM.filter((tile) => id === 'all' || tile.dept === id).length
  const shown = TEAM.filter((tile) => filter === 'all' || tile.dept === filter)
  const announce =
    filter === 'all'
      ? `Showing everyone: ${people.length} people and ${seats.length} open seats.`
      : `Showing ${options.find((o) => o.id === filter)?.label ?? filter}: ${shown.filter((t) => t.kind === 'person').length} people, ${shown.filter((t) => t.kind === 'seat').length} open seats.`

  // 只有键盘聚焦才展开：触屏点按也会先聚焦按钮，若这里展开，紧接着的 click 会把它切回收起
  const focusOpens = (el: Element) => {
    if (refocusing.current) return false
    try {
      return el.matches(':focus-visible')
    } catch {
      return pointerType.current !== 'touch' && pointerType.current !== 'pen'
    }
  }

  const onChipKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    let next = step ? (index + step + options.length) % options.length : -1
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = options.length - 1
    if (next < 0) return
    event.preventDefault()
    setDept(options[next]!.id)
    chipRefs.current[next]?.focus()
  }

  // 交叉淡化错开：先让出去的一层快速淡出，再让进来的一层淡入，两段文字不会叠在一起
  const out = { duration: reduced ? 0 : 0.16, ease: EASE }
  const into = { duration: reduced ? 0 : 0.34, ease: EASE, delay: reduced ? 0 : 0.13 }
  const vars = {
    '--tos-bg': palette.bg,
    '--tos-card': palette.card,
    '--tos-fg': palette.fg,
    '--tos-muted': palette.muted,
    '--tos-line': palette.line,
    '--tos-dash': palette.dash,
    '--tos-acc': toHex(acc),
    '--tos-acc-text': accText,
    '--tos-ink': inkOn(acc),
    '--tos-r': `${radius}px`,
  } as CSSProperties

  return (
    <section
      className={cn('w-full bg-[var(--tos-bg)] text-[var(--tos-fg)]', className)}
      style={{ ...vars, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", colorScheme: tone === 'light' ? 'light' : 'dark', ...style }}
      aria-labelledby={`${uid}-h`}
    >
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <motion.header
          className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-12"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: 'var(--tos-acc-text)', fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
              Team · Hiring now
            </p>
            <h2 id={`${uid}-h`} className="mt-4 text-[40px] leading-[1.02] text-balance sm:text-[54px]" style={{ fontFamily: "'Instrument Serif', ui-serif, Georgia, serif", fontWeight: 400, letterSpacing: '-0.01em' }}>
              {heading}
            </h2>
          </div>
          <div>
            <p className="max-w-md text-[15px] leading-relaxed text-pretty text-[var(--tos-muted)]">{SUBHEADING}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
              <span className="text-[var(--tos-muted)]">{people.length} people</span>
              <span className="text-[var(--tos-muted)]">{cities} cities</span>
              <span style={{ color: 'var(--tos-acc-text)' }}>{seats.length} open seats</span>
              <a href="#careers" className="group/apply inline-flex items-center gap-1 rounded-sm text-[var(--tos-fg)] underline decoration-[var(--tos-dash)] underline-offset-4 outline-none transition-[text-decoration-color] duration-200 hover:decoration-[var(--tos-acc)] focus-visible:ring-2 focus-visible:ring-[var(--tos-acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tos-bg)]">
                All roles
                <Arrow />
              </a>
            </div>
          </div>
        </motion.header>

        {showDepartments && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:mt-12">
            <div role="radiogroup" aria-label="Filter by department" className="flex flex-wrap gap-1.5">
              {options.map((option, index) => {
                const selected = filter === option.id
                return (
                  <button
                    key={option.id}
                    ref={(el) => {
                      chipRefs.current[index] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setDept(option.id)}
                    onKeyDown={(event) => onChipKey(event, index)}
                    className={cn(
                      'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-[13px] outline-none transition-[background-color,color,border-color] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--tos-acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tos-bg)]',
                      selected ? 'border-transparent bg-[var(--tos-fg)] text-[var(--tos-bg)]' : 'border-[var(--tos-line)] text-[var(--tos-muted)] hover:border-[var(--tos-dash)] hover:text-[var(--tos-fg)]',
                    )}
                  >
                    {option.label}
                    <span className={cn('text-[11px] tabular-nums', selected && 'opacity-70')} style={{ fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
                      {countOf(option.id)}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="flex items-center gap-2.5 text-[12px] text-[var(--tos-muted)]">
              <span aria-hidden className="inline-block size-4 shrink-0" style={{ borderRadius: SHAPES[avatarShape] ?? SHAPES.circle, border: seatStyle === 'ghost' ? 'none' : '1.5px dashed var(--tos-acc)', background: seatStyle === 'ghost' ? 'color-mix(in oklab, var(--tos-acc) 40%, transparent)' : 'transparent' }} />
              Open seat: hover, tap or focus for the pitch
            </p>
            <p className="sr-only" aria-live="polite">
              {announce}
            </p>
          </div>
        )}

        <ul className={cn('mt-6 grid grid-cols-2 gap-2.5 sm:auto-rows-fr sm:gap-3', showDepartments ? '' : 'mt-12', COLS[columns] ?? COLS[5])}>
          {TEAM.map((tile, index) => {
            const isActive = tile.kind === 'seat' && active === tile.id
            const dimmed = filter !== 'all' && tile.dept !== filter && !isActive
            const enter = { duration: reduced ? 0 : 0.5, ease: EASE, delay: reduced ? 0 : 0.12 + index * 0.025 }
            const tileMotion = {
              initial: reduced ? (false as const) : { opacity: 0, y: 14 },
              animate: { opacity: dimmed ? 0.26 : 1, y: 0, filter: dimmed ? 'grayscale(1)' : 'grayscale(0)' },
              transition: enter,
            }

            if (tile.kind === 'person') {
              return (
                <motion.li key={tile.id} {...tileMotion} className="flex flex-col justify-between gap-5 border border-[var(--tos-line)] bg-[var(--tos-card)] p-3.5 sm:p-4" style={{ borderRadius: 'var(--tos-r)' }}>
                  <Initials name={tile.name} shape={avatarShape} hue={hueAt(people.indexOf(tile))} />
                  <div className="min-w-0">
                    <p className="text-[14px] leading-snug font-medium">{tile.name}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-[var(--tos-muted)]">{tile.role}</p>
                    <p className="mt-2.5 text-[10.5px] tracking-[0.1em] text-[var(--tos-muted)] uppercase" style={{ fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
                      {tile.city}
                    </p>
                  </div>
                </motion.li>
              )
            }

            const pitchId = `${uid}-${tile.id}`
            const tileBorder = seatStyle === 'dashed' ? `1.5px dashed ${isActive ? 'var(--tos-acc)' : 'var(--tos-dash)'}` : `1px solid ${isActive ? 'var(--tos-acc)' : 'var(--tos-line)'}`
            const tint = isActive ? 'color-mix(in oklab, var(--tos-acc) 7%, transparent)' : seatStyle === 'ghost' ? 'color-mix(in oklab, var(--tos-card) 55%, transparent)' : 'transparent'
            return (
              <motion.li
                key={tile.id}
                {...tileMotion}
                className="relative isolate flex flex-col justify-between gap-5 overflow-hidden p-3.5 transition-[border-color,background-color] duration-300 sm:p-4"
                style={{
                  borderRadius: 'var(--tos-r)',
                  border: tileBorder,
                  backgroundColor: tint,
                  backgroundImage: seatStyle === 'hatched' ? 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--tos-acc) 16%, transparent) 0 1px, transparent 1px 8px)' : undefined,
                }}
                onPointerEnter={(event: ReactPointerEvent) => {
                  pointerType.current = event.pointerType
                  if (event.pointerType === 'mouse') setSeat(tile.id)
                }}
                onPointerLeave={(event: ReactPointerEvent) => {
                  if (event.pointerType === 'mouse' && active === tile.id && !event.currentTarget.contains(document.activeElement)) setSeat(null)
                }}
                onFocus={(event: FocusEvent<HTMLLIElement>) => {
                  if (focusOpens(event.target)) setSeat(tile.id)
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSeat(null)
                }}
                onKeyDown={(event: KeyboardEvent<HTMLLIElement>) => {
                  if (event.key !== 'Escape' || !isActive) return
                  event.stopPropagation()
                  setSeat(null)
                  // 焦点在申请链接上时，它马上要变成不可达，交还给展开按钮
                  const button = event.currentTarget.querySelector('button')
                  if (button && document.activeElement !== button) {
                    refocusing.current = true
                    button.focus()
                    refocusing.current = false
                  }
                }}
              >
                {/* 整块可点的展开按钮：触屏点一下展开，键盘聚焦即展开，Esc 收起 */}
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={pitchId}
                  aria-label={`Open seat: ${tile.role}, ${tile.where}`}
                  className="absolute inset-0 z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--tos-acc)] focus-visible:ring-inset"
                  style={{ borderRadius: 'var(--tos-r)' }}
                  onPointerDown={(event) => {
                    pointerType.current = event.pointerType
                  }}
                  onClick={(event) => {
                    // 鼠标靠悬停开合，点击不再切换；键盘触发的 click（detail 为 0）总是切换
                    if (event.detail !== 0 && pointerType.current === 'mouse') return
                    setSeat(isActive ? null : tile.id)
                  }}
                />
                {isActive && !reduced && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -left-10 -z-10 size-40 rounded-full"
                    style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--tos-acc) 30%, transparent), transparent)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                  />
                )}

                <div className="pointer-events-none relative flex items-start justify-between gap-2">
                  <SeatMark seatStyle={seatStyle} shape={avatarShape} active={isActive} pulse={isActive && !reduced} />
                  <span aria-hidden className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.08em] uppercase" style={{ background: 'var(--tos-acc)', color: 'var(--tos-ink)', fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
                    Open
                  </span>
                </div>

                <div className="pointer-events-none relative grid min-w-0 items-end [&>*]:[grid-area:1/1]">
                  {/* 岗位和地点已在按钮的 aria-label 里，这里只给眼睛看 */}
                  <motion.div aria-hidden animate={{ opacity: isActive ? 0 : 1, y: isActive ? -8 : 0 }} transition={isActive ? out : into}>
                    <p className="text-[14px] leading-snug font-medium">{tile.role}</p>
                    <p className="mt-2.5 text-[10.5px] tracking-[0.1em] text-[var(--tos-muted)] uppercase" style={{ fontFamily: "'Geist Mono Variable', ui-monospace, monospace" }}>
                      {tile.where}
                    </p>
                  </motion.div>
                  <motion.div id={pitchId} aria-hidden={!isActive} initial={false} animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }} transition={isActive ? into : out}>
                    <p aria-hidden className="text-[14px] leading-snug font-medium">
                      {tile.role}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-snug text-pretty" style={{ color: 'color-mix(in oklab, var(--tos-fg) 82%, var(--tos-bg))' }}>
                      {tile.pitch}
                    </p>
                    <a
                      href={tile.href}
                      aria-label={`Apply for ${tile.role}, ${tile.where}`}
                      tabIndex={isActive ? undefined : -1}
                      className={cn(
                        'group/apply mt-3 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium outline-none transition-[filter] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--tos-fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tos-bg)]',
                        isActive ? 'pointer-events-auto' : 'pointer-events-none',
                      )}
                      style={{ background: 'var(--tos-acc)', color: 'var(--tos-ink)' }}
                    >
                      Apply
                      <Arrow />
                    </a>
                  </motion.div>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
