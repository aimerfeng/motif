import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Five teams, in their own numbers',
  accent: '#b8f25c',
  tone: 'dark',
  panelStyle: 'card',
  logoTone: 'mono',
  radius: 18,
  autoplay: true,
  interval: 5,
}
/* @motif:end */

export type LogosCaseStudyStripProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, 'SFMono-Regular', monospace"
const SERIF = "'Instrument Serif', ui-serif, Georgia, 'Songti SC', serif"
const EASE = [0.22, 1, 0.36, 1] as const

interface Wordmark {
  name: string
  font: string
  weight: number
  size: number
  tracking: string
  italic?: boolean
  upper?: boolean
  glyph: ReactNode
}

interface CaseStudy {
  id: string
  mark: Wordmark
  sector: string
  scale: string
  metric: string
  label: string
  quote: string
  name: string
  role: string
  /** 指标前后对比：of 是指标名，was / now 是切换前后的值。 */
  of: string
  was: string
  now: string
}

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** 虚构客户：字标各用一种字体加一个几何图形，数字和引语都是编的，不对应任何真实公司或个人。 */
const CASES: CaseStudy[] = [
  {
    id: 'halvard',
    mark: { name: 'Halvard', font: "'Syne Variable', sans-serif", weight: 700, size: 23, tracking: '-0.02em', glyph: <><path d="M4 16a8 8 0 0 1 16 0z" fill="currentColor" /><path d="M2.5 20h19" {...line} strokeWidth="2" /></> },
    sector: 'Fintech',
    scale: '1.2M subscribers',
    metric: '−38%',
    label: 'voluntary churn within two quarters',
    quote: 'Failed renewals used to pile up in a Monday spreadsheet. Now most of them recover before anyone opens it.',
    name: 'Mira Okafor',
    role: 'VP Growth',
    of: 'Monthly churn',
    was: '6.1%',
    now: '3.8%',
  },
  {
    id: 'wrenhaven',
    mark: { name: 'Wrenhaven', font: "'DM Serif Display', serif", weight: 400, size: 25, tracking: '-0.01em', italic: true, glyph: <><path d="M3 15c3.5-5.5 7-5.5 9 0 2-5.5 5.5-5.5 9 0" {...line} strokeWidth="2.2" /><circle cx="12" cy="19.5" r="1.7" fill="currentColor" /></> },
    sector: 'Healthcare',
    scale: '38 clinics',
    metric: '−5 days',
    label: 'off the month-end close, every month',
    quote: 'Finance closes on the third business day now. In January it was the eighth.',
    name: 'Tomás Reyes',
    role: 'Group Controller',
    of: 'Books closed by',
    was: 'Day 8',
    now: 'Day 3',
  },
  {
    id: 'coldharbor',
    mark: { name: 'Coldharbor', font: "'Archivo Black', sans-serif", weight: 400, size: 15, tracking: '0.16em', upper: true, glyph: <path d="M4 6.5h16M4 12h11M4 17.5h6" {...line} strokeWidth="2.6" /> },
    sector: 'Logistics',
    scale: '14 countries',
    metric: '$1.9M',
    label: 'recovered from failed payments in year one',
    quote: 'It paid for itself in the first billing run. We stopped debating the budget line in March.',
    name: 'Priya Natarajan',
    role: 'CFO',
    of: 'Failed payments recovered',
    was: '41%',
    now: '77%',
  },
  {
    id: 'fieldnote',
    mark: { name: 'fieldnote', font: "'Fraunces Variable', serif", weight: 600, size: 25, tracking: '-0.035em', glyph: <path d="M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4M9 12.5h6M9 16h4" {...line} strokeWidth="1.9" /> },
    sector: 'Education',
    scale: '410k learners',
    metric: '3.1×',
    label: 'more upgrades to annual plans',
    quote: 'We tested annual pricing in an afternoon. The old way took a quarter and two engineers.',
    name: 'Jonah Feld',
    role: 'Head of Product',
    of: 'Annual plan share',
    was: '9%',
    now: '28%',
  },
  {
    id: 'saltmarsh',
    mark: { name: 'Saltmarsh', font: "'Instrument Serif', serif", weight: 400, size: 28, tracking: '-0.01em', glyph: <><circle cx="16.5" cy="7" r="2.6" fill="currentColor" /><path d="M3 14.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.6-1.6 4.8-1M3 19c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.6-1.6 4.8-1" {...line} strokeWidth="2" /></> },
    sector: 'Media',
    scale: '60 currencies',
    metric: '99.98%',
    label: 'of invoices issued without a manual fix',
    quote: 'Tax and currency rules used to be a ticket queue. Now they are a setting one person owns.',
    name: 'Elena Varga',
    role: 'Director of Revenue Ops',
    of: 'Invoices needing a fix',
    was: '1 in 40',
    now: '1 in 5,000',
  },
]

// ---- 颜色：主色可以是任何值，文字和细线的颜色按对比度从主色推出来，保证在深浅底上都读得清。 ----
type RGB = [number, number, number]

function rgbOf(hex: string): RGB {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6)
  const value = Number.parseInt(full, 16)
  return Number.isFinite(value) ? [(value >> 16) & 255, (value >> 8) & 255, value & 255] : [128, 128, 128]
}

function luminance([r, g, b]: RGB): number {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: RGB, b: RGB): number {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const hexOf = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`

/** 把颜色往 toward 方向混，直到在 bg 上达到 min 的对比度。 */
function readable(color: RGB, bg: RGB, toward: RGB, min: number): RGB {
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const mixed = color.map((v, i) => Math.round(v + (toward[i]! - v) * t)) as RGB
    if (contrast(mixed, bg) >= min) return mixed
  }
  return toward
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone !== 'light'
  const bg = dark ? '#0a0b0d' : '#f5f4ef'
  const surface = dark ? '#121317' : '#ffffff'
  const toward: RGB = dark ? [255, 255, 255] : [0, 0, 0]
  const a = rgbOf(accent)
  // 文字用主色时要过 4.5:1（背景和卡片都要过）；进度线这类非文字元素 3:1 即可。
  const text = readable(readable(a, rgbOf(bg), toward, 4.5), rgbOf(surface), toward, 4.5)
  const ui = readable(readable(a, rgbOf(bg), toward, 3), rgbOf(surface), toward, 3)
  const ink = contrast([255, 255, 255], a) >= contrast([12, 13, 15], a) ? '#ffffff' : '#0c0d0f'
  return {
    '--lc-bg': bg,
    '--lc-sf': surface,
    '--lc-fg': dark ? '#f3f3f1' : '#111214',
    '--lc-mu': dark ? 'rgba(243,243,241,0.6)' : 'rgba(17,18,20,0.62)',
    '--lc-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(17,18,20,0.11)',
    '--lc-ac': hexOf(a),
    '--lc-at': hexOf(text),
    '--lc-ui': hexOf(ui),
    '--lc-ink': ink,
    '--lc-shadow': dark ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 40px 80px -48px rgba(0,0,0,0.9)' : '0 30px 70px -44px rgba(17,18,20,0.32)',
    '--lc-glow': dark ? '11%' : '9%',
    // 未选中字标的透明度：浅底上同样的 40% 只有约 2.6:1，字标也是标签页的名字，提到 55%（约 4:1），不比深底（约 3.5:1）更淡。
    '--lc-dim': dark ? '0.4' : '0.55',
  } as CSSProperties
}

function Mark({ m }: { m: Wordmark }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="shrink-0" style={{ width: 'calc(24px * var(--lk))', height: 'calc(24px * var(--lk))' }} aria-hidden>
        {m.glyph}
      </svg>
      <span style={{ fontFamily: m.font, fontWeight: m.weight, fontSize: `calc(${m.size}px * var(--lk))`, letterSpacing: m.tracking, fontStyle: m.italic ? 'italic' : undefined, textTransform: m.upper ? 'uppercase' : undefined, lineHeight: 1 }}>{m.name}</span>
    </span>
  )
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h9.5M8.5 4l4 4-4 4" />
    </svg>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function CasePanel({ c, variant, innerRadius }: { c: CaseStudy; variant: string; innerRadius: number }) {
  const split = variant === 'split'
  const minimal = variant === 'minimal'
  return (
    <figure className={cn('grid h-full md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]', split ? 'gap-2 p-2 md:gap-2.5 md:p-2.5' : minimal ? 'gap-8 pt-8 sm:pt-10 md:gap-14' : 'gap-8 p-6 sm:p-9 md:gap-12')}>
      <div className={cn('flex flex-col', split && 'p-6 sm:p-8')} style={split ? { background: 'var(--lc-ac)', color: 'var(--lc-ink)', borderRadius: innerRadius } : undefined}>
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: MONO, color: split ? 'var(--lc-ink)' : 'var(--lc-mu)' }}>
          <span>{c.sector}</span>
          <span aria-hidden>·</span>
          <span>{c.scale}</span>
        </p>
        <p className="mt-6 text-[56px] leading-[0.92] font-semibold tracking-[-0.05em] whitespace-nowrap tabular-nums sm:text-[72px] md:mt-auto md:pt-8" style={{ color: split ? 'var(--lc-ink)' : 'var(--lc-at)' }}>
          {c.metric}
        </p>
        <p className="mt-3 max-w-[26ch] text-[15px] leading-snug" style={{ color: split ? 'var(--lc-ink)' : 'var(--lc-mu)' }}>
          {c.label}
        </p>
        <p className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-3.5 text-[12.5px]" style={{ borderColor: split ? 'color-mix(in oklab, var(--lc-ink) 22%, transparent)' : 'var(--lc-ln)' }}>
          <span style={{ color: split ? 'var(--lc-ink)' : 'var(--lc-mu)' }}>{c.of}</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums" style={{ fontFamily: MONO }}>
            <span style={{ color: split ? 'var(--lc-ink)' : 'var(--lc-mu)' }}>
              <span className="sr-only">from </span>
              {c.was}
            </span>
            <Arrow className="size-3.5 opacity-70" />
            <span className="font-medium" style={{ color: split ? 'var(--lc-ink)' : 'var(--lc-fg)' }}>
              <span className="sr-only">to </span>
              {c.now}
            </span>
          </span>
        </p>
      </div>

      <div className={cn('flex flex-col justify-between gap-8', split ? 'p-4 sm:p-6 md:p-8' : !minimal && 'md:border-l md:pl-12')} style={{ borderColor: 'var(--lc-ln)' }}>
        <blockquote className="text-[23px] leading-[1.22] text-pretty sm:text-[29px]" style={{ fontFamily: SERIF, letterSpacing: '-0.005em' }}>
          <p>“{c.quote}”</p>
        </blockquote>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <figcaption className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold" style={{ background: 'color-mix(in oklab, var(--lc-ac) 16%, var(--lc-sf))', color: 'var(--lc-at)', boxShadow: 'inset 0 0 0 1px var(--lc-ln)' }} aria-hidden>
              {initials(c.name)}
            </span>
            <span className="min-w-0 text-[14px] leading-tight">
              <span className="block font-medium">{c.name}</span>
              <span className="mt-1 block" style={{ color: 'var(--lc-mu)' }}>
                {c.role}, {c.mark.name}
              </span>
            </span>
          </figcaption>
          <a
            href={`#story-${c.id}`}
            className="group/link inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[color:var(--lc-ui)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--lc-sf)]"
            style={{ color: 'var(--lc-at)' }}
          >
            Read the {c.mark.name} story
            <Arrow className="transition-transform duration-300 group-hover/link:translate-x-0.5 motion-reduce:transition-none" />
          </a>
        </div>
      </div>
    </figure>
  )
}

/** 轮播开关：外圈是本家客户的停留进度，和字标下的进度线同步。 */
function RotationToggle({ playing, onToggle, onHover }: { playing: boolean; onToggle: () => void; onHover: (inside: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      // 指针停在开关上不算「在看案例」：按下播放后要立刻转起来，而不是等指针离开整个区块。
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') onHover(false)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') onHover(true)
      }}
      aria-label={playing ? 'Pause customer stories' : 'Play customer stories'}
      className="relative grid size-9 shrink-0 place-items-center rounded-full text-[color:var(--lc-mu)] outline-none transition-colors duration-200 hover:text-[color:var(--lc-fg)] focus-visible:ring-2 focus-visible:ring-[color:var(--lc-ui)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--lc-bg)] motion-reduce:transition-none"
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90" fill="none" strokeWidth="1.5" aria-hidden>
        <circle cx="18" cy="18" r="17.25" stroke="var(--lc-ln)" />
        {playing && <circle cx="18" cy="18" r="17.25" stroke="var(--lc-ui)" strokeLinecap="round" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: 'calc(1 - var(--lc-p))' }} />}
      </svg>
      <svg viewBox="0 0 16 16" className="relative size-3.5" fill="currentColor" aria-hidden>
        {playing ? (
          <>
            <rect x="4" y="3" width="2.75" height="10" rx="0.9" />
            <rect x="9.25" y="3" width="2.75" height="10" rx="0.9" />
          </>
        ) : (
          <path d="M5.25 3.4v9.2a.6.6 0 0 0 .9.52l7.6-4.6a.6.6 0 0 0 0-1.04l-7.6-4.6a.6.6 0 0 0-.9.52z" />
        )}
      </svg>
    </button>
  )
}

export function LogosCaseStudyStrip({ className, style, ...props }: LogosCaseStudyStripProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const uid = useId()
  const n = CASES.length
  const interval = Math.min(10, Math.max(4, o.interval))
  const radius = Math.min(40, Math.max(0, o.radius))
  const variant = o.panelStyle === 'split' || o.panelStyle === 'minimal' ? o.panelStyle : 'card'
  const boxed = variant !== 'minimal'
  const chip = o.logoTone === 'chip'

  const root = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const progress = useRef(0)
  const hovering = useRef(false)
  // 用户一旦亲手选过（点按、方向键、键盘焦点进入），轮播就停下，只有按播放才恢复（WCAG 2.2.2 / APG 轮播模式）。
  const [stopped, setStopped] = useState(false)
  const canRotate = o.autoplay && !reduced
  const rotating = canRotate && !stopped
  const [caret, setCaret] = useState<{ x: number; shown: boolean } | null>(null)

  // 空闲轮播：进度按帧累加，鼠标悬停时冻结；时间来自 frame loop，截图时也能推进。
  useFrameLoop(
    root,
    ({ delta }) => {
      const el = root.current
      if (!el) return
      if (rotating && !hovering.current) {
        progress.current += delta / interval
        if (progress.current >= 1) {
          progress.current -= 1
          activeRef.current = (activeRef.current + 1) % n
          setActive(activeRef.current)
        }
      }
      el.style.setProperty('--lc-p', (rotating ? Math.min(1, progress.current) : 1).toFixed(4))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const select = (i: number) => {
    if (i === activeRef.current) return
    activeRef.current = i
    progress.current = 0
    setActive(i)
  }
  const pick = (i: number) => {
    setStopped(true)
    select(i)
  }
  const toggle = () => {
    if (stopped) progress.current = 0
    setStopped(!stopped)
  }

  // 字标排成一行，放不下就横向滚动（不换行，小三角才不会对错行）。
  // 小三角对准当前字标的水平中心；字标被滚出可视区时隐藏，避免指向别家。两端渐隐只在还有内容可滚时出现。
  useEffect(() => {
    const box = stage.current
    const view = scroller.current
    if (!box || !view) return
    const measure = () => {
      const tab = tabs.current[active]
      if (!tab) return
      const a = box.getBoundingClientRect()
      const s = view.getBoundingClientRect()
      const b = tab.getBoundingClientRect()
      const center = b.left + b.width / 2
      const inset = Math.max(radius, 6) + 10
      setCaret({ x: Math.min(a.width - inset, Math.max(inset, center - a.left)), shown: center > s.left + 8 && center < s.right - 8 })
      const rest = view.scrollWidth - view.clientWidth - view.scrollLeft
      view.style.setProperty('--lc-fl', `${Math.min(24, Math.max(0, view.scrollLeft))}px`)
      view.style.setProperty('--lc-fr', `${Math.min(24, Math.max(0, rest))}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(view)
    if (strip.current) observer.observe(strip.current)
    view.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      view.removeEventListener('scroll', measure)
    }
  }, [active, radius])

  // 当前字标不在可视区（窄屏轮播到后面几家、或点了半露的一家）时，把它滚到中间。只滚这一行，不动页面。
  useEffect(() => {
    const view = scroller.current
    const tab = tabs.current[active]
    if (!view || !tab || view.scrollWidth <= view.clientWidth + 1) return
    const s = view.getBoundingClientRect()
    const b = tab.getBoundingClientRect()
    if (b.left >= s.left + 24 && b.right <= s.right - 24) return
    view.scrollTo({ left: view.scrollLeft + b.left - s.left - (s.width - b.width) / 2, behavior: reduced ? 'auto' : 'smooth' })
  }, [active, reduced])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: n - 1 }
    const target = map[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = (target + n) % n
    pick(next)
    tabs.current[next]?.focus({ preventScroll: true })
  }

  // 键盘焦点（:focus-visible）进入字标行或面板就停下轮播；鼠标点击的焦点不算，点按本身已经会停。
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (typeof target.matches === 'function' && target.matches(':focus-visible')) setStopped(true)
  }

  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.45, bounce: 0.12 }
  const tabRadius = Math.min(radius, 14)

  return (
    <section
      ref={root}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), ['--lc-p' as string]: 0, background: 'var(--lc-bg)', color: 'var(--lc-fg)', fontFamily: BODY, ...style }}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') hovering.current = true
      }}
      onPointerLeave={() => {
        hovering.current = false
      }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: 'radial-gradient(55% 45% at 50% 78%, color-mix(in oklab, var(--lc-ac) var(--lc-glow), transparent), transparent)' }} />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:px-8 sm:py-16">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase" style={{ color: 'var(--lc-at)', fontFamily: MONO }}>
              Customer stories
            </p>
            <h2 className="mt-3 text-[30px] leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-[40px]">{o.heading}</h2>
          </div>
          <div className="max-w-xs md:pb-1 md:text-right">
            <p className="text-[14.5px] leading-relaxed text-pretty" style={{ color: 'var(--lc-mu)' }}>
              Every figure is the customer’s own, measured against the quarter before they switched.
            </p>
            <a
              href="#stories"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[color:var(--lc-ui)]"
              style={{ color: 'var(--lc-fg)' }}
            >
              All 48 stories
              <Arrow />
            </a>
          </div>
        </header>

        <div onFocus={onFocus}>
          {/* 窄屏时这一行贴到屏幕边缘（负外边距），字标可以从边上滑进来；极简面板的底线画在这一行上，进度线正好压在线上。 */}
          <div className="mt-10 -mx-4 flex items-center sm:mt-12 sm:-mx-8 lg:mx-0 lg:gap-3" style={boxed ? undefined : { boxShadow: 'inset 0 -1px 0 var(--lc-ln)' }}>
            {canRotate && (
              <div className="shrink-0 pl-4 sm:pl-8 lg:pl-0">
                <RotationToggle
                  playing={rotating}
                  onToggle={toggle}
                  onHover={(inside) => {
                    hovering.current = inside
                  }}
                />
              </div>
            )}
            <div
              ref={scroller}
              className="min-w-0 flex-1 snap-x snap-proximity overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ maskImage: 'linear-gradient(90deg, transparent, #000 var(--lc-fl, 0px), #000 calc(100% - var(--lc-fr, 0px)), transparent)' }}
            >
              <LayoutGroup id={uid}>
                <div
                  ref={strip}
                  role="tablist"
                  aria-label="Customers"
                  onKeyDown={onKeyDown}
                  className={cn('flex w-max min-w-full pr-4 [--lk:0.82] sm:pr-8 sm:[--lk:1] lg:pr-0', canRotate ? 'pl-2 sm:pl-3 lg:pl-0' : 'pl-4 sm:pl-8 lg:pl-0')}
                >
                  {CASES.map((c, i) => {
                    const on = i === active
                    const tint = on && o.logoTone === 'accent'
                    return (
                      <button
                        key={c.id}
                        ref={(el) => {
                          tabs.current[i] = el
                        }}
                        id={`${uid}-tab-${i}`}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        aria-controls={`${uid}-panel-${i}`}
                        tabIndex={on ? 0 : -1}
                        onPointerEnter={(event) => {
                          if (event.pointerType !== 'touch') select(i)
                        }}
                        onClick={() => pick(i)}
                        onFocus={() => select(i)}
                        className="group relative flex h-14 flex-auto shrink-0 snap-center items-center justify-center px-5 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lc-ui)] focus-visible:ring-inset sm:h-[78px] sm:px-6 lg:px-3"
                        style={{ borderRadius: tabRadius }}
                      >
                        {chip && on && (
                          <motion.span
                            layoutId="chip"
                            className="absolute inset-x-1 inset-y-1 sm:inset-y-2"
                            style={{ background: 'var(--lc-sf)', borderRadius: Math.min(radius, 999), boxShadow: 'inset 0 0 0 1px var(--lc-ln), var(--lc-shadow)' }}
                            transition={spring}
                          />
                        )}
                        <span
                          className={cn('relative transition-[opacity,color] duration-300 motion-reduce:transition-none', on ? 'opacity-100' : 'opacity-[var(--lc-dim)] group-hover:opacity-80')}
                          style={{ color: tint ? 'var(--lc-at)' : 'var(--lc-fg)' }}
                        >
                          <Mark m={c.mark} />
                        </span>
                        {on && (
                          <span className={cn('pointer-events-none absolute inset-x-0 flex justify-center', chip ? 'bottom-[11px] sm:bottom-[14px]' : boxed ? 'bottom-1' : 'bottom-0')} aria-hidden>
                            <motion.span layoutId="bar" className={cn('block h-[2px] overflow-hidden rounded-full', chip ? 'w-10' : boxed ? 'w-12' : 'w-[62%]')} style={{ background: 'color-mix(in oklab, var(--lc-ui) 26%, transparent)' }} transition={spring}>
                              <span className="block h-full w-full origin-left" style={{ background: 'var(--lc-ui)', transform: 'scaleX(var(--lc-p))' }} />
                            </motion.span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </LayoutGroup>
            </div>
            {/* 和左边的开关等宽，让宽屏下的字标行与下方面板居中对齐。 */}
            {canRotate && <span aria-hidden className="hidden size-9 shrink-0 lg:block" />}
          </div>

          <div ref={stage} className={cn('relative', boxed ? 'mt-5 sm:mt-6' : 'mt-0')}>
            {boxed && caret !== null && (
              <motion.span
                aria-hidden
                className="absolute top-0 left-0 z-10 block size-3.5"
                style={{ marginLeft: -7, marginTop: -7, rotate: 45, background: 'var(--lc-sf)', borderTop: '1px solid var(--lc-ln)', borderLeft: '1px solid var(--lc-ln)', borderTopLeftRadius: 2 }}
                initial={false}
                animate={{ x: caret.x, opacity: caret.shown ? 1 : 0 }}
                transition={spring}
              />
            )}
            {/* 轮播时不朗读每次切换；停下后，切到哪家就礼貌地读出哪家（APG 轮播模式）。 */}
            <div className="relative grid overflow-hidden" aria-live={rotating ? 'off' : 'polite'} style={boxed ? { background: 'var(--lc-sf)', borderRadius: radius, boxShadow: 'inset 0 0 0 1px var(--lc-ln), var(--lc-shadow)' } : undefined}>
              {CASES.map((c, i) => {
                const on = i === active
                return (
                  <motion.div
                    key={c.id}
                    id={`${uid}-panel-${i}`}
                    role="tabpanel"
                    aria-labelledby={`${uid}-tab-${i}`}
                    aria-hidden={!on}
                    inert={!on}
                    className="flex flex-col [grid-area:1/1] [&>figure]:flex-1"
                    initial={false}
                    animate={on ? { opacity: 1, x: 0, filter: 'blur(0px)', visibility: 'visible' } : { opacity: 0, x: i < active ? -28 : 28, filter: 'blur(4px)', transitionEnd: { visibility: 'hidden' } }}
                    transition={reduced ? { duration: 0 } : { duration: 0.55, ease: EASE }}
                  >
                    <CasePanel c={c} variant={variant} innerRadius={Math.max(0, radius - 8)} />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
