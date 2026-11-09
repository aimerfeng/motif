import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'How can we help?',
  accent: '#ff8a4c',
  tone: 'dark',
  font: 'serif',
  layout: 'split',
  topicStyle: 'cards',
  showResponseTime: true,
  radius: 14,
}
/* @motif:end */

export type TopicId = 'sales' | 'support' | 'press' | 'partners'

export type ContactRoutingFormProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前话题。不传时组件自己管理（从销售开始）。 */
  topic?: TopicId
  onTopicChange?: (topic: TopicId) => void
  /**
   * 提交：字段校验通过后调用，拿到当前话题和表单数据（每个字段的 name，外加隐藏字段 topic）。
   * 返回 Promise 时按钮显示「发送中」，resolve 后才换成确认；reject 时留在表单并提示重试。不传就只在本地显示确认。
   */
  onSubmit?: (topic: TopicId, data: FormData) => void | Promise<void>
}

/* ---------- 颜色：任何主色、两种明暗都要读得清 ---------- */

type Rgb = readonly [number, number, number]

function toRgb(value: string, fallback: Rgb): Rgb {
  let h = value.trim().replace('#', '')
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join('')
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (h.length < 6 || Number.isNaN(n)) return fallback
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toLinear = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const toGamma = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

function luminance([r, g, b]: Rgb) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrast(a: Rgb, b: Rgb) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const hex = (c: Rgb) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`

/** 半透明色叠在底色上的结果（按 sRGB 合成，和浏览器一致）。 */
const over = (base: Rgb, top: Rgb, alpha: number): Rgb => [base[0] + (top[0] - base[0]) * alpha, base[1] + (top[1] - base[1]) * alpha, base[2] + (top[2] - base[2]) * alpha]

/* OKLCH：只改亮度、保留色相和尽量多的彩度。按 sRGB 往前景色混，亮黄会变成土黄、深蓝会变成灰紫。 */

function toOklch([r, g, b]: Rgb): [number, number, number] {
  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const k = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(a, k), Math.atan2(k, a)]
}

/** OKLCH → 线性 sRGB；超出色域时分量会落在 [0, 1] 外。 */
function oklchLinear(L: number, C: number, h: number): Rgb {
  const a = C * Math.cos(h)
  const k = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * k) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * k) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * k) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}

const inGamut = (c: Rgb) => c.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** 换成指定亮度，色相不变；超出色域就二分收彩度，直到刚好放得下。 */
function atLightness(color: Rgb, L: number): Rgb {
  const [, C, h] = toOklch(color)
  let lo = 0
  let hi = C
  if (!inGamut(oklchLinear(L, hi, h))) {
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchLinear(L, mid, h))) lo = mid
      else hi = mid
    }
    hi = lo
  }
  const lin = oklchLinear(L, hi, h)
  return [toGamma(Math.max(0, Math.min(1, lin[0]))), toGamma(Math.max(0, Math.min(1, lin[1]))), toGamma(Math.max(0, Math.min(1, lin[2])))]
}

/** 只沿 OKLCH 亮度往一个方向推（深底提亮、浅底压暗），直到对每一个会垫在它下面的底色都达标。 */
function legible(color: Rgb, grounds: Rgb[], lighten: boolean, target: number): Rgb {
  const worst = (c: Rgb) => Math.min(...grounds.map((g) => contrast(c, g)))
  if (worst(color) >= target) return color
  const [L0] = toOklch(color)
  for (let step = 1; step <= 100; step++) {
    const L = lighten ? L0 + ((1 - L0) * step) / 100 : L0 * (1 - step / 100)
    const c = atLightness(color, L)
    if (worst(c) >= target) return c
  }
  return lighten ? [255, 255, 255] : [0, 0, 0]
}

const WHITE: Rgb = [255, 255, 255]
const INK: Rgb = [17, 18, 20]

const TONES = {
  dark: {
    bg: '#0d0e11',
    fg: '#f1f1ee',
    surface: '#15161a',
    card: 'rgba(255,255,255,0.025)',
    field: 'rgba(255,255,255,0.03)',
    hover: 'rgba(255,255,255,0.055)',
    chip: 'rgba(255,255,255,0.065)',
    line: 'rgba(255,255,255,0.085)',
    line2: 'rgba(255,255,255,0.16)',
    muted: 'rgba(241,241,238,0.64)',
    faint: 'rgba(241,241,238,0.38)',
    foot: 'rgba(255,255,255,0.018)',
    shadow: '0 50px 110px -60px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.045)',
    glow: 20,
  },
  light: {
    bg: '#f4f2ec',
    fg: '#16171a',
    surface: '#ffffff',
    card: 'rgba(255,255,255,0.6)',
    field: '#fbfaf7',
    hover: 'rgba(22,23,26,0.04)',
    chip: 'rgba(22,23,26,0.055)',
    line: 'rgba(22,23,26,0.11)',
    line2: 'rgba(22,23,26,0.22)',
    muted: 'rgba(22,23,26,0.66)',
    faint: 'rgba(22,23,26,0.44)',
    foot: 'rgba(22,23,26,0.02)',
    shadow: '0 36px 80px -48px rgba(60,44,20,0.4), 0 1px 2px rgba(60,44,20,0.06)',
    glow: 16,
  },
} as const

/** 背景色单独导出：演示的滚动容器用它铺满整个画面。 */
export function routingBackground(tone: string) {
  return tone === 'light' ? TONES.light.bg : TONES.dark.bg
}

function palette(tone: string, accent: string, radius: number): CSSProperties {
  const light = tone === 'light'
  const t = light ? TONES.light : TONES.dark
  const bg = toRgb(t.bg, [13, 14, 17])
  const sf = toRgb(t.surface, [21, 22, 26])
  // 表单底栏 = 卡片面 + 一层很淡的前景色（和 TONES.foot 一致）。
  const foot = over(sf, light ? [22, 23, 26] : WHITE, light ? 0.02 : 0.018)
  const raw = toRgb(accent, [255, 138, 76])
  const grounds = [bg, sf, foot]
  // 填充（按钮、选中图标、对勾）对它会落在的每一种底色至少 3:1。
  const base = legible(raw, grounds, !light, 3)
  // 按钮字取白或近黑里对比更高的那个；两者都不到 4.5:1 时（中等亮度的主色），再沿亮度把填充推离字色，
  // 选推得最少、且仍对底色保持 3:1 的那一种。
  const options = [WHITE, INK].map((ink) => {
    const fill = legible(base, [ink], ink === INK, 4.5)
    return { ink, fill, shift: Math.abs(toOklch(fill)[0] - toOklch(base)[0]), ok: grounds.every((g) => contrast(fill, g) >= 3) }
  })
  const pick = options.filter((x) => x.ok).sort((a, b) => a.shift - b.shift)[0] ?? options[0]!
  const { fill, ink } = pick
  // 文字（眉标、链接、回复时效）落在页面底、卡片面、底栏和选中行的着色底上，对其中最差的那个达到 4.6:1。
  const tint = over(bg, fill, 0.14)
  const text = legible(raw, [...grounds, tint], !light, 4.6)
  const ac = hex(fill)
  const r = Math.max(0, Math.min(24, radius))
  return {
    '--c-bg': t.bg,
    '--c-fg': t.fg,
    '--c-sf': t.surface,
    '--c-card': t.card,
    '--c-fd': t.field,
    '--c-hov': t.hover,
    '--c-chip': t.chip,
    '--c-ln': t.line,
    '--c-ln2': t.line2,
    '--c-mu': t.muted,
    '--c-ph': t.faint,
    '--c-foot': t.foot,
    '--c-sh': t.shadow,
    '--c-ac': ac,
    '--c-at': hex(text),
    '--c-on': hex(ink),
    // 半透明：选中高亮滑过别的卡片时，底下的文字还看得见。
    '--c-tint': `color-mix(in oklab, ${ac} 14%, transparent)`,
    '--c-edge': `color-mix(in oklab, ${ac} 62%, ${t.line})`,
    '--c-ring': `color-mix(in oklab, ${ac} 30%, transparent)`,
    '--c-glow': `color-mix(in oklab, ${ac} ${t.glow}%, transparent)`,
    '--r': `${r}px`,
    '--r-t': `${Math.round(r * 0.85)}px`,
    '--r-f': `${Math.round(r * 0.6)}px`,
    '--r-c': `${Math.round(r * 0.55)}px`,
    '--r-i': `${Math.round(r * 0.5)}px`,
    color: t.fg,
  } as CSSProperties
}

/* ---------- 字体 ---------- */

const HEADING = {
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.012em', size: 'text-[2.9rem] @2xl:text-[3.9rem] @4xl:text-[4.5rem]' },
  sans: { family: "'Inter Tight Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.04em', size: 'text-[2.35rem] @2xl:text-[3.1rem] @4xl:text-[3.6rem]' },
  grotesk: { family: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em', size: 'text-[2.35rem] @2xl:text-[3.1rem] @4xl:text-[3.6rem]' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

/* ---------- 图标（内联 SVG） ---------- */

function Glyph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-[18px] shrink-0', className)} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

const ICON = {
  sales: <path d="M4 17.5 9.500 12l3.500 3.500L20 8.500M14.500 8.500H20V14" />,
  support: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <circle cx="12" cy="12" r="3.500" />
      <path d="m6 6 3.500 3.500M14.500 14.500 18 18M18 6l-3.500 3.500M9.500 14.500 6 18" />
    </>
  ),
  press: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21M8.500 21h7" />
    </>
  ),
  partners: <path d="M10 14a4 4 0 0 0 5.660 0l3-3a4 4 0 0 0-5.660-5.660l-1 1M14 10a4 4 0 0 0-5.660 0l-3 3a4 4 0 0 0 5.660 5.660l1-1" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.500" />
      <path d="M8 3v4M16 3v4M4 10h16M9 14.500h2" />
    </>
  ),
  pulse: <path d="M3 12h4l2.500-6 4 12 2.500-6H21" />,
  download: <path d="M12 4v11M7.500 10.500 12 15l4.500-4.500M5 19.500h14" />,
  book: <path d="M5 4.500h9.500A2.500 2.500 0 0 1 17 7v13H7.500A2.500 2.500 0 0 1 5 17.500zM5 17.500A2.500 2.500 0 0 1 7.500 15H17M20 7v13" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 7.500V12l3 2" />
    </>
  ),
  route: <path d="M3 12h5c3 0 4-6 8-6h5M8 12c3 0 4 6 8 6h5M8 12h13" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12.500 4.500 4.500L19 7" />,
}

/* ---------- 内容：虚构的车队调度软件 Lanemark ---------- */

type RowId = 'identity' | 'account' | 'fleet' | 'budget' | 'severity' | 'outlet' | 'company' | 'kind' | 'message'
type Severity = 'low' | 'normal' | 'urgent'

interface Topic {
  id: TopicId
  label: string
  blurb: string
  team: string
  /** 姓名和头像的 OKLCH 色相：手挑的，避开发灰发黄的那一段。渐变起点亮度 0.54，白色首字母在任何色相上都有 4.5:1 以上。 */
  people: [string, number][]
  who: string
  reply: string
  short: string
  submit: string
  /** 更快的替代渠道。href 是占位的页内锚点，换成你自己的预约页、状态页、媒体包和合作指南地址。 */
  alt: { icon: ReactNode; lead: string; action: string; href: string; live?: boolean }
  message: { label: string; placeholder: string }
  rows: RowId[]
  done: { title: string; body: string; ref: string }
}

const TOPICS: Topic[] = [
  {
    id: 'sales',
    label: 'Sales',
    blurb: 'Pricing, demos and rollout plans',
    team: 'Sales',
    people: [
      ['Maya Okafor', 285],
      ['Jonas Weller', 235],
      ['Priya Raman', 355],
    ],
    who: 'Maya, Jonas and 3 others',
    reply: 'Reply within 4 business hours',
    short: '4h',
    submit: 'Send to sales',
    alt: { icon: ICON.calendar, lead: 'Rather talk it through?', action: 'Book a 20-min call', href: '#book-a-call' },
    message: { label: 'What are you hoping to fix?', placeholder: 'We dispatch 40 vans from two depots and still plan routes in spreadsheets.' },
    rows: ['identity', 'fleet', 'budget', 'message'],
    done: { title: 'Sent to Sales', body: 'Maya or someone on her team will reply within 4 business hours with a plan sized to your fleet.', ref: 'LM-S-20418' },
  },
  {
    id: 'support',
    label: 'Support',
    blurb: 'Bugs, billing and account access',
    team: 'Support',
    people: [
      ['Tomás Ibarra', 175],
      ['Lena Fischer', 260],
      ['Kofi Mensah', 42],
    ],
    who: 'On shift now: Tomás, Lena, Kofi',
    reply: 'Median first reply 38 min',
    short: '38m',
    submit: 'Open a ticket',
    alt: { icon: ICON.pulse, lead: 'All systems operational.', action: 'View status page', href: '#status', live: true },
    message: { label: 'What’s happening?', placeholder: 'Since 07:10 the driver app shows an empty manifest for depot B.' },
    rows: ['account', 'severity', 'message'],
    done: { title: 'Ticket opened', body: 'You’ll get a reply from whoever is on shift. Add more detail by answering the confirmation email.', ref: 'LM-T-88213' },
  },
  {
    id: 'press',
    label: 'Press',
    blurb: 'Interviews, data and brand assets',
    team: 'Press desk',
    people: [['Hana Sato', 330]],
    who: 'Hana Sato, Communications',
    reply: 'Same-day reply before 16:00 CET',
    short: 'Same day',
    submit: 'Send to press desk',
    alt: { icon: ICON.download, lead: 'Logos, product shots, bios.', action: 'Get the press kit', href: '#press-kit' },
    message: { label: 'Your question', placeholder: 'Writing about failed first-attempt deliveries. Do you have 2026 numbers by region?' },
    rows: ['identity', 'outlet', 'message'],
    done: { title: 'Sent to the press desk', body: 'Hana replies the same day to anything that arrives before 16:00 CET, sooner if your deadline is today.', ref: 'LM-P-1107' },
  },
  {
    id: 'partners',
    label: 'Partnerships',
    blurb: 'Integrations, resellers and agencies',
    team: 'Partnerships',
    people: [
      ['Rui Almeida', 215],
      ['Elise Martin', 305],
    ],
    who: 'Rui and Elise, Partner team',
    reply: 'Reply within 3 business days',
    short: '3 days',
    submit: 'Send to partnerships',
    alt: { icon: ICON.book, lead: 'Tiers, revenue share, listing rules.', action: 'Read the partner guide', href: '#partner-guide' },
    message: { label: 'What do you have in mind?', placeholder: 'Our trackers report GPS every 5 s. We’d like to stream that into live dispatch.' },
    rows: ['identity', 'company', 'kind', 'message'],
    done: { title: 'Sent to Partnerships', body: 'Rui or Elise will reply within 3 business days, usually with a short call to scope the integration.', ref: 'LM-X-3302' },
  },
]

const TOPIC: Record<TopicId, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicId, Topic>

const SEVERITY: { id: Severity; title: string; note: string; dot: string; reply: string }[] = [
  { id: 'low', title: 'A question', note: 'How-to or advice', dot: '#9aa0a6', reply: 'Reply within 1 business day' },
  { id: 'normal', title: 'Something’s broken', note: 'Work goes on, slower', dot: '#f2b33d', reply: 'Median first reply 38 min' },
  { id: 'urgent', title: 'Drivers are blocked', note: 'Routes can’t start', dot: '#f0524a', reply: 'On-call engineer paged · 15 min' },
]

const FLEET = ['1–10', '11–50', '51–250', '250+']
const BUDGET = ['Under $10k', '$10k–50k', '$50k+', 'Not sure yet']
const KIND = ['Integration', 'Reseller', 'Agency', 'Hardware']

/* ---------- 小部件 ---------- */

// Tailwind v4 的 outline-hidden / outline-none 会把 --tw-outline-style 设成 none，而 outline-2 读的正是这个变量，
// 所以聚焦时必须显式写回 outline-solid，否则焦点框宽度有了、样式仍是 none，什么也看不见。
const FOCUS = 'outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--c-at)]'
const FIELD =
  'block w-full min-w-0 border border-[color:var(--c-ln)] bg-[var(--c-fd)] text-[14.5px] text-[color:var(--c-fg)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--c-ph)] hover:border-[color:var(--c-ln2)] focus:border-[color:var(--c-ac)] focus:shadow-[0_0_0_3px_var(--c-ring)]'
const SPRING = { type: 'spring', visualDuration: 0.4, bounce: 0.16 } as const
const EASE = [0.22, 1, 0.36, 1] as const

function Avatars({ people }: { people: [string, number][] }) {
  return (
    <span className="flex shrink-0 -space-x-1" aria-hidden>
      {people.map(([name, hue]) => (
        <span key={name} className="grid size-8 place-items-center rounded-full text-[10.5px] font-semibold text-white ring-2 ring-[color:var(--c-sf)]" style={{ background: `linear-gradient(140deg, oklch(0.54 0.11 ${hue}), oklch(0.38 0.1 ${(hue + 35) % 360}))` }}>
          {name
            .split(' ')
            .map((part) => part[0])
            .join('')}
        </span>
      ))}
    </span>
  )
}

function Radio({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full border transition-[border-color] duration-200" style={{ borderColor: on ? 'var(--c-ac)' : 'var(--c-ln2)' }}>
      <motion.span className="size-2 rounded-full" style={{ background: 'var(--c-ac)' }} initial={false} animate={{ scale: on ? 1 : 0 }} transition={SPRING} />
    </span>
  )
}

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-[12.5px] font-medium" style={{ color: 'var(--c-mu)' }}>
        {label}
        {optional && <span className="text-[11.5px] font-normal">Optional</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ id, ...rest }: { id: string; type?: string; name: string; placeholder: string; autoComplete?: string; required?: boolean }) {
  return <input id={id} {...rest} className={cn(FIELD, 'h-11 px-3.5')} style={{ borderRadius: 'var(--r-f)' }} />
}

function Chips({ id, label, name, options, value, onChange }: { id: string; label: string; name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div role="radiogroup" aria-labelledby={id} className="min-w-0">
      <p id={id} className="mb-2 text-[12.5px] font-medium" style={{ color: 'var(--c-mu)' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = option === value
          return (
            <label key={option} className="relative cursor-pointer">
              <input type="radio" name={name} value={option} checked={on} onChange={() => onChange(option)} className="peer sr-only" />
              <span
                className={cn(
                  'inline-flex h-9 items-center border px-3.5 text-[13.5px] whitespace-nowrap transition-[background-color,border-color,color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--c-at)]',
                  on ? 'border-[color:var(--c-edge)] bg-[var(--c-tint)] font-medium' : 'border-[color:var(--c-ln)] bg-[var(--c-fd)] hover:bg-[var(--c-hov)]',
                )}
                style={{ borderRadius: 'var(--r-c)', color: on ? 'var(--c-fg)' : 'var(--c-mu)' }}
              >
                {option}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- 话题选择：卡片 / 列表 / 分段控件，都是带漫游焦点的 radiogroup ---------- */

function TopicPicker({
  variant,
  stacked,
  current,
  labelId,
  layoutId,
  showResponseTime,
  run,
  onChoose,
}: {
  variant: string
  stacked: boolean
  current: TopicId
  labelId: string
  layoutId: string
  showResponseTime: boolean
  run: boolean
  onChoose: (topic: TopicId) => void
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(
    0,
    TOPICS.findIndex((t) => t.id === current),
  )

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = TOPICS.length - 1
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    const topic = TOPICS[next]
    if (!topic) return
    event.preventDefault()
    onChoose(topic.id)
    refs.current[next]?.focus()
  }

  const highlight = (radius: string, extra?: CSSProperties) => (
    <motion.span layoutId={layoutId} aria-hidden className="absolute -inset-px border" style={{ borderRadius: radius, background: 'var(--c-tint)', borderColor: 'var(--c-edge)', ...extra }} transition={run ? SPRING : { duration: 0 }} />
  )

  const common = (topic: Topic, i: number) => {
    const on = topic.id === current
    return {
      ref: (el: HTMLButtonElement | null) => {
        refs.current[i] = el
      },
      type: 'button' as const,
      role: 'radio',
      'aria-checked': on,
      tabIndex: on ? 0 : -1,
      onClick: () => onChoose(topic.id),
    }
  }

  if (variant === 'tabs') {
    const active = TOPIC[current]
    return (
      <div>
        <div role="radiogroup" aria-labelledby={labelId} onKeyDown={onKey} className="grid grid-cols-2 gap-1 border p-1 @md:grid-cols-4" style={{ borderRadius: 'calc(var(--r-t) + 4px)', background: 'var(--c-card)', borderColor: 'var(--c-ln)' }}>
          {TOPICS.map((topic, i) => {
            const on = topic.id === current
            return (
              <button key={topic.id} {...common(topic, i)} className={cn('relative h-10 px-2 text-[13.5px] font-medium transition-[color] duration-200', FOCUS, !on && 'hover:text-[color:var(--c-fg)]')} style={{ borderRadius: 'var(--r-t)', color: on ? 'var(--c-fg)' : 'var(--c-mu)' }}>
                {on && highlight('var(--r-t)', { boxShadow: '0 6px 16px -10px rgba(0,0,0,0.5)' })}
                <span className="relative">{topic.label}</span>
              </button>
            )
          })}
        </div>
        <p className={cn('mt-3 flex min-h-5 items-center gap-2 text-[13px]', stacked && 'justify-center')} style={{ color: 'var(--c-mu)' }}>
          <motion.span key={active.id} initial={run ? { opacity: 0, y: 4 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            {active.blurb}
            {showResponseTime && <span style={{ fontFamily: MONO }}> · {active.short}</span>}
          </motion.span>
        </p>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div role="radiogroup" aria-labelledby={labelId} onKeyDown={onKey} className={cn('grid gap-2', stacked && '@2xl:grid-cols-2')}>
        {TOPICS.map((topic, i) => {
          const on = topic.id === current
          return (
            <button key={topic.id} {...common(topic, i)} className={cn('relative flex items-center gap-3.5 border px-3.5 py-3 text-left transition-[background-color] duration-200', FOCUS, on ? 'bg-transparent' : 'bg-[var(--c-card)] hover:bg-[var(--c-hov)]')} style={{ borderRadius: 'var(--r-t)', borderColor: 'var(--c-ln)' }}>
              {on && highlight('var(--r-t)')}
              <span className="relative grid size-9 shrink-0 place-items-center transition-[background-color,color] duration-200" style={{ borderRadius: 'var(--r-i)', background: on ? 'var(--c-ac)' : 'var(--c-chip)', color: on ? 'var(--c-on)' : 'var(--c-mu)' }}>
                <Glyph>{ICON[topic.id]}</Glyph>
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-[14.5px] font-medium">{topic.label}</span>
                <span className="block truncate text-[12.5px]" style={{ color: 'var(--c-mu)' }}>
                  {topic.blurb}
                </span>
              </span>
              {showResponseTime && (
                <span className="relative hidden shrink-0 text-[11.5px] @sm:block" style={{ fontFamily: MONO, color: on ? 'var(--c-at)' : 'var(--c-mu)' }}>
                  {topic.short}
                </span>
              )}
              <span className="relative">
                <Radio on={on} />
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-labelledby={labelId} onKeyDown={onKey} className={cn('grid grid-cols-2 gap-2.5', stacked && '@3xl:grid-cols-4')}>
      {TOPICS.map((topic, i) => {
        const on = topic.id === current
        return (
          <button key={topic.id} {...common(topic, i)} className={cn('relative flex min-w-0 flex-col items-start border p-3.5 text-left transition-[background-color] duration-200 @md:p-4', FOCUS, on ? 'bg-transparent' : 'bg-[var(--c-card)] hover:bg-[var(--c-hov)]')} style={{ borderRadius: 'var(--r-t)', borderColor: 'var(--c-ln)' }}>
            {on && highlight('var(--r-t)')}
            <span className="relative flex w-full items-start justify-between">
              <span className="grid size-9 place-items-center transition-[background-color,color] duration-200" style={{ borderRadius: 'var(--r-i)', background: on ? 'var(--c-ac)' : 'var(--c-chip)', color: on ? 'var(--c-on)' : 'var(--c-mu)' }}>
                <Glyph>{ICON[topic.id]}</Glyph>
              </span>
              <Radio on={on} />
            </span>
            <span className="relative mt-4 max-w-full truncate text-[15px] font-medium">{topic.label}</span>
            <span className="relative mt-1 text-[12.5px] leading-snug" style={{ color: 'var(--c-mu)' }}>
              {topic.blurb}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- 区块本体 ---------- */

/** 先分流再提问的联系区块：选一个话题，表单换成那个团队要问的字段，并写明谁来接、多久回复、还有什么更快的渠道。 */
export function ContactRoutingForm({ className, style, topic, onTopicChange, onSubmit, ...props }: ContactRoutingFormProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = !reduced
  const uid = useId()
  const [own, setOwn] = useState<TopicId>('sales')
  const current: TopicId = topic && topic in TOPIC ? topic : own
  const t = TOPIC[current]
  const [severity, setSeverity] = useState<Severity>('normal')
  const [fleet, setFleet] = useState('11–50')
  const [budget, setBudget] = useState('$10k–50k')
  const [kind, setKind] = useState('Integration')
  const [sentFor, setSentFor] = useState<TopicId | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const sent = sentFor === current
  // 发送成功后焦点落到确认标题上，「再发一条」后落到第一个字段：两者都会卸掉原来聚焦的按钮，不接住焦点就掉回 <body>。
  // 只在这两个动作之后接，切换话题回到已发送的话题时不抢焦点。
  const focusNext = useRef<'done' | 'form' | null>(null)
  const vars = useMemo(() => palette(o.tone, o.accent, o.radius), [o.tone, o.accent, o.radius])

  const stacked = o.layout === 'stacked'
  const heading = HEADING[o.font as keyof typeof HEADING] ?? HEADING.serif
  const sev = SEVERITY.find((s) => s.id === severity) ?? SEVERITY[1]!
  const reply = current === 'support' ? sev.reply : t.reply

  const choose = (next: TopicId) => {
    setOwn(next)
    // 发送途中或确认还没出现就切走了：作废待接的焦点，免得之后切回来时确认标题把焦点从话题选择上抢走。
    focusNext.current = null
    if (status === 'error') setStatus('idle')
    onTopicChange?.(next)
  }
  const deliver = (form: HTMLFormElement) => {
    if (status === 'sending' || !form.reportValidity()) return
    const to = current
    const done = () => {
      focusNext.current = 'done'
      setStatus('idle')
      setSentFor(to)
    }
    let result: unknown
    try {
      result = onSubmit?.(to, new FormData(form))
    } catch {
      setStatus('error')
      return
    }
    if (result instanceof Promise) {
      setStatus('sending')
      result.then(done, () => setStatus('error'))
    } else done()
  }
  // 沙箱 iframe 没有 allow-forms 时，浏览器会拦下真正的表单提交（连 submit 事件都不触发），所以提交按钮的点击自己接管：
  // 回车触发的隐式提交也是模拟点击这个按钮，同样走这里。表单的 submit 事件只剩外部调用 requestSubmit() 一条路，两条路汇到 deliver。
  const send = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (event.currentTarget.form) deliver(event.currentTarget.form)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    deliver(event.currentTarget)
  }

  const enter = (delay: number) => ({ initial: run ? { opacity: 0, y: 14 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } })
  const id = (name: string) => `${uid}-${name}`

  const row = (key: RowId): ReactNode => {
    switch (key) {
      case 'identity':
        return (
          <div className="grid gap-3 @md:grid-cols-2">
            <Field id={id('name')} label="Full name">
              <Input id={id('name')} name="name" placeholder="Ada Lindqvist" autoComplete="name" required />
            </Field>
            <Field id={id('email')} label="Work email">
              <Input id={id('email')} name="email" type="email" placeholder="ada@northpeak.co" autoComplete="email" required />
            </Field>
          </div>
        )
      case 'account':
        return (
          <div className="grid gap-3 @md:grid-cols-[1.5fr_1fr]">
            <Field id={id('account')} label="Account email">
              <Input id={id('account')} name="account" type="email" placeholder="dispatch@northpeak.co" autoComplete="email" required />
            </Field>
            <Field id={id('workspace')} label="Workspace ID" optional>
              <Input id={id('workspace')} name="workspace" placeholder="np-4471" />
            </Field>
          </div>
        )
      case 'fleet':
        return <Chips id={id('fleet')} label="Fleet size, in vehicles" name="fleet" options={FLEET} value={fleet} onChange={setFleet} />
      case 'budget':
        return <Chips id={id('budget')} label="Annual budget" name="budget" options={BUDGET} value={budget} onChange={setBudget} />
      case 'kind':
        return <Chips id={id('kind')} label="Partnership type" name="kind" options={KIND} value={kind} onChange={setKind} />
      case 'outlet':
        return (
          <div className="grid gap-3 @md:grid-cols-2">
            <Field id={id('outlet')} label="Publication">
              <Input id={id('outlet')} name="outlet" placeholder="Freight Weekly" autoComplete="organization" required />
            </Field>
            <Field id={id('deadline')} label="Deadline">
              <Input id={id('deadline')} name="deadline" placeholder="Thu 14 Nov, 17:00 CET" />
            </Field>
          </div>
        )
      case 'company':
        return (
          <div className="grid gap-3 @md:grid-cols-2">
            <Field id={id('company')} label="Company">
              <Input id={id('company')} name="company" placeholder="Ostwind Telematics" autoComplete="organization" required />
            </Field>
            <Field id={id('site')} label="Website" optional>
              <Input id={id('site')} name="website" placeholder="ostwind.io" autoComplete="url" />
            </Field>
          </div>
        )
      case 'severity':
        return (
          <div role="radiogroup" aria-labelledby={id('severity')} className="min-w-0">
            <p id={id('severity')} className="mb-2 text-[12.5px] font-medium" style={{ color: 'var(--c-mu)' }}>
              How urgent is it?
            </p>
            <div className="grid gap-2 @lg:grid-cols-3">
              {SEVERITY.map((s) => {
                const on = s.id === severity
                return (
                  <label key={s.id} className="relative cursor-pointer">
                    <input type="radio" name="severity" value={s.id} checked={on} onChange={() => setSeverity(s.id)} className="peer sr-only" />
                    <span
                      className={cn(
                        'flex h-full items-start gap-2.5 border px-3 py-2.5 transition-[background-color,border-color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--c-at)]',
                        on ? 'border-[color:var(--c-edge)] bg-[var(--c-tint)]' : 'border-[color:var(--c-ln)] bg-[var(--c-fd)] hover:bg-[var(--c-hov)]',
                      )}
                      style={{ borderRadius: 'var(--r-f)' }}
                    >
                      <span className="mt-[5px] size-2 shrink-0 rounded-full" style={{ background: s.dot, boxShadow: on ? `0 0 0 3px color-mix(in oklab, ${s.dot} 28%, transparent)` : undefined }} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium">{s.title}</span>
                        <span className="block text-[12px]" style={{ color: 'var(--c-mu)' }}>
                          {s.note}
                        </span>
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )
      case 'message':
        return (
          <Field id={id('message')} label={t.message.label}>
            <textarea id={id('message')} name="message" rows={3} required placeholder={t.message.placeholder} className={cn(FIELD, 'min-h-24 resize-none px-3.5 py-3 leading-relaxed')} style={{ borderRadius: 'var(--r-f)' }} />
          </Field>
        )
    }
  }

  const intro = (
    <motion.div {...enter(0)} className={cn('min-w-0', stacked && 'mx-auto max-w-2xl text-center')}>
      <p className={cn('flex items-center gap-2 text-[11.5px] font-medium tracking-[0.16em] uppercase', stacked && 'justify-center')} style={{ color: 'var(--c-at)', fontFamily: MONO }}>
        <Glyph className="size-4">{ICON.route}</Glyph>
        Contact
      </p>
      <h2 className={cn('mt-4 text-balance break-words', heading.size)} style={{ fontFamily: heading.family, fontWeight: heading.weight, letterSpacing: heading.tracking, lineHeight: 1.02 }}>
        {o.heading}
      </h2>
      <p className={cn('mt-4 max-w-md text-pretty text-[15.5px] leading-relaxed', stacked && 'mx-auto')} style={{ color: 'var(--c-mu)' }}>
        Pick what this is about. The form asks only what that team needs, so the first reply is an answer, not another question.
      </p>
    </motion.div>
  )

  const picker = (
    <motion.div {...enter(0.08)} className={cn('min-w-0', stacked ? 'mt-10' : 'mt-9')}>
      <p id={id('topics')} className={cn('mb-3 text-[12.5px] font-medium', stacked && 'text-center')} style={{ color: 'var(--c-mu)' }}>
        What is this about?
      </p>
      <div className={cn(stacked && 'mx-auto', stacked && (o.topicStyle === 'tabs' ? 'max-w-2xl' : o.topicStyle === 'list' ? 'max-w-3xl' : 'max-w-4xl'))}>
        <TopicPicker variant={o.topicStyle} stacked={stacked} current={current} labelId={id('topics')} layoutId={id('pick')} showResponseTime={o.showResponseTime} run={run} onChoose={choose} />
      </div>
    </motion.div>
  )

  const card = (
    <motion.div {...enter(0.16)} className={cn('relative min-w-0', stacked && 'mx-auto mt-8 w-full max-w-3xl')}>
      <div aria-hidden className="pointer-events-none absolute -inset-10 blur-2xl" style={{ background: 'radial-gradient(60% 58% at 50% 45%, var(--c-glow), transparent 75%)' }} />
      <div className="@container relative overflow-hidden border" style={{ borderRadius: 'var(--r)', background: 'var(--c-sf)', borderColor: 'var(--c-ln)', boxShadow: 'var(--c-sh)' }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b px-5 py-4 @md:px-6" style={{ borderColor: 'var(--c-ln)' }}>
          <div className="flex min-w-0 items-center gap-3">
            <Avatars people={t.people} />
            <motion.div key={t.id} className="min-w-0" initial={run ? { opacity: 0, x: -6 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE }}>
              <p className="text-[13.5px] leading-tight" style={{ color: 'var(--c-mu)' }}>
                Routed to <span className="font-semibold" style={{ color: 'var(--c-fg)' }}>{t.team}</span>
              </p>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: 'var(--c-mu)' }}>
                {t.who}
              </p>
            </motion.div>
          </div>
          {o.showResponseTime && (
            <motion.p key={reply} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] @md:ml-auto" style={{ fontFamily: MONO, borderColor: 'var(--c-ln)', background: 'var(--c-fd)', color: 'var(--c-fg)' }} initial={run ? { opacity: 0, y: 4 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
              <Glyph className="size-3.5 text-[color:var(--c-at)]">{ICON.clock}</Glyph>
              {reply}
            </motion.p>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div key="done" className="flex flex-col items-center px-6 py-14 text-center" initial={run ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} exit={run ? { opacity: 0 } : undefined} transition={{ duration: 0.35, ease: EASE }}>
              <span className="grid size-12 place-items-center rounded-full" style={{ background: 'var(--c-ac)', color: 'var(--c-on)' }}>
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <motion.path d="m5 12.500 4.500 4.500L19 7" initial={run ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
                </svg>
              </span>
              <h3
                ref={(el) => {
                  if (el && focusNext.current === 'done') {
                    focusNext.current = null
                    el.focus()
                  }
                }}
                tabIndex={-1}
                aria-describedby={id('done-body')}
                className="mt-5 text-lg font-semibold tracking-tight outline-none"
              >
                {t.done.title}
              </h3>
              <p id={id('done-body')} className="mt-2 max-w-sm text-pretty text-sm leading-relaxed" style={{ color: 'var(--c-mu)' }}>
                {current === 'support' && severity === 'urgent' ? 'Tomás has been paged and will pick this up within 15 minutes. Keep your phone close.' : t.done.body}
              </p>
              <p className="mt-4 text-[12px]" style={{ fontFamily: MONO, color: 'var(--c-mu)' }}>
                Reference {t.done.ref}
              </p>
              <button
                type="button"
                onClick={() => {
                  focusNext.current = 'form'
                  setSentFor(null)
                }}
                className={cn('mt-6 border px-3.5 py-2 text-[13px] font-medium transition-[background-color] duration-150 hover:bg-[var(--c-hov)]', FOCUS)} style={{ borderRadius: 'var(--r-f)', borderColor: 'var(--c-ln)' }}>
                Send another
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={(el: HTMLFormElement | null) => {
                if (el && focusNext.current === 'form') {
                  focusNext.current = null
                  el.querySelector<HTMLElement>('input:not([type=hidden]), textarea')?.focus()
                }
              }}
              onSubmit={submit}
              aria-label={`Message to ${t.team}`}
              aria-busy={status === 'sending'}
              initial={run ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={run ? { opacity: 0 } : undefined} transition={{ duration: 0.25 }}>
              <input type="hidden" name="topic" value={current} />
              <div className="px-5 pt-5 @md:px-6 @md:pt-6">
                <AnimatePresence initial={false}>
                  {t.rows.map((key) => (
                    <motion.div
                      key={key}
                      className="-mx-1.5 overflow-hidden px-1.5"
                      initial={run ? { height: 0, opacity: 0 } : false}
                      animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3, delay: 0.12 } } }}
                      exit={run ? { height: 0, opacity: 0, transition: { height: { duration: 0.4, ease: EASE, delay: 0.04 }, opacity: { duration: 0.16 } } } : undefined}
                    >
                      <div className="pt-1 pb-4">{row(key)}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {status === 'error' && (
                  <p role="alert" className="-mt-1 mb-4 flex items-center gap-2 text-[13px]" style={{ color: 'var(--c-fg)' }}>
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: '#f0524a' }} />
                    That didn’t go through. Your message is still here, so try again in a moment.
                  </p>
                )}
              </div>
              <div className="flex flex-col-reverse gap-4 border-t px-5 py-4 @lg:flex-row @lg:items-center @lg:justify-between @md:px-6" style={{ borderColor: 'var(--c-ln)', background: 'var(--c-foot)' }}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative grid size-8 shrink-0 place-items-center rounded-full" style={{ background: 'var(--c-chip)', color: 'var(--c-mu)' }}>
                    <Glyph className="size-4">{t.alt.icon}</Glyph>
                    {t.alt.live && <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[color:var(--c-sf)] bg-emerald-500" />}
                  </span>
                  <p className="min-w-0 text-[13px] leading-snug" style={{ color: 'var(--c-mu)' }}>
                    {t.alt.lead}{' '}
                    <a href={t.alt.href} className={cn('font-medium whitespace-nowrap underline decoration-1 underline-offset-[3px] hover:decoration-2', FOCUS)} style={{ color: 'var(--c-at)', textDecorationColor: 'color-mix(in oklab, var(--c-at) 45%, transparent)' }}>
                      {t.alt.action}
                    </a>
                  </p>
                </div>
                <button
                  type="submit"
                  onClick={send}
                  aria-disabled={status === 'sending' || undefined}
                  className={cn('inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 px-5 text-[14px] font-medium transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98] @lg:w-auto', FOCUS)}
                  style={{ borderRadius: 'var(--r-f)', background: 'var(--c-ac)', color: 'var(--c-on)', boxShadow: '0 12px 26px -14px var(--c-ac)' }}
                >
                  <motion.span key={status === 'sending' ? 'sending' : t.submit} initial={run ? { opacity: 0, y: 3 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    {status === 'sending' ? 'Sending…' : t.submit}
                  </motion.span>
                  <Glyph className="size-4">{ICON.arrow}</Glyph>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  return (
    <MotionConfig reducedMotion="user">
      <section className={cn('@container relative w-full overflow-hidden', className)} style={{ ...vars, background: 'var(--c-bg)', fontFamily: BODY, ...style }}>
        <div className="relative mx-auto max-w-6xl px-5 py-14 @2xl:px-8 @4xl:py-20">
          {stacked ? (
            <>
              {intro}
              {picker}
              {card}
            </>
          ) : (
            // 顶对齐：卡片随话题变高变矮时，左栏的标题和话题选择保持不动（居中对齐会在每次点击后跳一下）。
            <div className="grid gap-12 @4xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] @4xl:items-start @4xl:gap-16">
              <div className="min-w-0">
                {intro}
                {picker}
              </div>
              {card}
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  )
}
