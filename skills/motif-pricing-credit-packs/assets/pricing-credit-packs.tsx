import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Pay per render, in packs that never expire',
  accent: '#f2b544',
  tone: 'dark',
  radius: 18,
  packs: 4,
  highlightPack: 'production',
  currency: 'usd',
  showEstimator: true,
}
/* @motif:end */

export type JobId = 'image' | 'upscale' | 'video' | 'voice'
export type PackId = 'starter' | 'studio' | 'production' | 'volume'
export type Estimate = { job: JobId; volume: number }

export type PricingCreditPacksProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：估算条里选中的任务类型。不传时组件自己管理。 */
  job?: JobId
  /** 受控：每月用量（该任务类型的件数）。不传时组件自己管理，每种任务记住各自的值。 */
  volume?: number
  onEstimateChange?: (estimate: Estimate) => void
  onBuy?: (pack: PackId) => void
}

// ---------- 定价数据：换成自己的数字即可，页面上所有单价、折扣、可用时长都从这里算出来 ----------

type Stack = { x: number; y: number; n: number }
type Pack = { id: PackId; name: string; base: number; bonus: number; stacks: Stack[] }

const PACKS: Pack[] = [
  { id: 'starter', name: 'Starter', base: 1000, bonus: 0, stacks: [{ x: 84, y: 48, n: 2 }] },
  { id: 'studio', name: 'Studio', base: 4000, bonus: 0.1, stacks: [{ x: 84, y: 50, n: 5 }] },
  {
    id: 'production',
    name: 'Production',
    base: 10000,
    bonus: 0.25,
    stacks: [
      { x: 62, y: 44, n: 7 },
      { x: 86, y: 51, n: 3 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    base: 25000,
    bonus: 0.4,
    stacks: [
      { x: 66, y: 41, n: 8 },
      { x: 42, y: 47, n: 4 },
      { x: 86, y: 52, n: 3 },
    ],
  },
]

// 每个币种一套整数价格，而不是汇率换算：真实的定价页都这么做。
const CURRENCIES: Record<string, { code: string; prices: number[] }> = {
  usd: { code: 'USD', prices: [10, 40, 100, 250] },
  eur: { code: 'EUR', prices: [9, 36, 90, 225] },
  gbp: { code: 'GBP', prices: [8, 32, 80, 200] },
  cny: { code: 'CNY', prices: [68, 268, 688, 1688] },
}

type Job = { id: JobId; label: string; unit: string; per: string; cost: number; min: number; max: number; start: number; icon: ReactNode }

const JOBS: Job[] = [
  {
    id: 'image',
    label: 'Images',
    unit: 'images',
    per: 'Images per month',
    cost: 4,
    min: 40,
    max: 4000,
    start: 900,
    icon: (
      <>
        <rect x="2.5" y="3" width="15" height="14" rx="2.5" />
        <circle cx="7.5" cy="8" r="1.6" />
        <path d="m3 15 4.5-4.5 3 3 2.5-2.5 4.5 4.5" />
      </>
    ),
  },
  {
    id: 'upscale',
    label: 'Upscales',
    unit: 'upscales',
    per: 'Upscales per month',
    cost: 2,
    min: 50,
    max: 8000,
    start: 1500,
    icon: (
      <>
        <rect x="2.5" y="9.5" width="8" height="8" rx="1.6" />
        <path d="M11.5 3h5.5v5.5M17 3l-6 6M5.5 6.5V4.5a1.5 1.5 0 0 1 1.5-1.5h1.5M17 13.5V15a2.5 2.5 0 0 1-2.5 2.5H13" />
      </>
    ),
  },
  {
    id: 'video',
    label: 'Video',
    unit: 'clips',
    per: '5-second clips per month',
    cost: 50,
    min: 4,
    max: 400,
    start: 60,
    icon: (
      <>
        <rect x="2.5" y="4" width="15" height="12" rx="2.5" />
        <path d="m8.5 7.5 4 2.5-4 2.5z" />
      </>
    ),
  },
  {
    id: 'voice',
    label: 'Voice',
    unit: 'minutes',
    per: 'Voice minutes per month',
    cost: 12,
    min: 10,
    max: 1200,
    start: 240,
    icon: <path d="M3 10h1M6 7v6M9 4v12M12 6.5v7M15 8.5v3M17.5 10h-.5" />,
  },
]

const FACTS: { text: string; icon: ReactNode }[] = [
  { text: 'Credits never expire', icon: <path d="M10 10c-1.6-2.2-3-3.3-4.4-3.3a3.3 3.3 0 0 0 0 6.6c1.4 0 2.8-1.1 4.4-3.3Zm0 0c1.6 2.2 3 3.3 4.4 3.3a3.3 3.3 0 0 0 0-6.6c-1.4 0-2.8 1.1-4.4 3.3Z" /> },
  {
    text: 'One balance for the whole team',
    icon: (
      <>
        <circle cx="7.5" cy="7" r="2.6" />
        <path d="M2.5 16.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M13 4.6a2.6 2.6 0 0 1 0 4.8M14.5 12.7c1.5.5 2.6 1.8 3 3.8" />
      </>
    ),
  },
  { text: 'Unused packs refunded within 14 days', icon: <path d="M4 8h9a4 4 0 0 1 0 8H8M4 8l3.5-3.5M4 8l3.5 3.5" /> },
  { text: 'Optional auto top-up below 10%', icon: <path d="M11 2.5 4.5 11H10l-1 6.5L15.5 9H10z" /> },
]

// ---------- 颜色：底色两套，主色按对比度推导出填充、按钮文字和可读的强调文字 ----------

type Tone = { bg: string; card: string; sunken: string; fg: string; muted: string; line: string; strong: string }
const TONES: Record<string, Tone> = {
  dark: { bg: '#0b0b0d', card: '#131316', sunken: '#101013', fg: '#f3f2ee', muted: '#a09d96', line: '#26262b', strong: '#3a3a41' },
  light: { bg: '#f4f2ed', card: '#fffdf9', sunken: '#efece5', fg: '#18171b', muted: '#625f58', line: '#e2ded5', strong: '#c9c4b8' },
}

type RGB = [number, number, number]
function rgb(value: string): RGB {
  let h = value.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = Number.parseInt(h.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function hex([r, g, b]: RGB) {
  return `#${[r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`
}
function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
function luminance([r, g, b]: RGB) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function contrast(a: RGB, b: RGB) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
/** 主色当文字用：逐步向正文色靠拢，直到在所有底色上都达到 4.5:1。 */
function readable(accent: RGB, grounds: RGB[], fg: RGB) {
  for (let t = 0; t <= 1.001; t += 0.06) {
    const c = mix(accent, fg, t)
    if (grounds.every((g) => contrast(c, g) >= 4.5)) return hex(c)
  }
  return hex(fg)
}

const WHITE: RGB = [255, 255, 255]
const INK: RGB = [12, 12, 14]
const BLACK: RGB = [0, 0, 0]

function palette(tone: Tone, accent: string, dark: boolean) {
  const fg = rgb(tone.fg)
  const card = rgb(tone.card)
  // 主色和卡片几乎同色时（深底配近黑、浅底配近白），填充会消失：向正文色推到 1.8:1 为止。
  const raw = rgb(accent)
  let acc = raw
  for (let t = 0.08; contrast(acc, card) < 1.8 && t <= 1; t += 0.08) acc = mix(raw, fg, t)
  // 按钮文字：白字和纯黑字里对比度更高的那个。两者对比度的乘积恒为 21，所以较大值不低于 √21 ≈ 4.58:1。
  // 近黑的 INK 只在它自己也够 4.5 时代替纯黑（中等亮度的蓝紫色上它只有 4.42）。
  const whiteInk = contrast(acc, WHITE) >= contrast(acc, BLACK)
  const ink = whiteInk ? WHITE : contrast(acc, INK) >= 4.5 ? INK : BLACK
  // 悬停时填充往远离文字的方向走一点，对比度只升不降（brightness 会让白字变得更难读）。
  const accHover = whiteInk ? mix(acc, BLACK, 0.1) : mix(acc, WHITE, 0.16)
  const feat = mix(card, acc, dark ? 0.075 : 0.055)
  const tint = mix(card, acc, dark ? 0.16 : 0.13)
  const grounds = [card, feat, tint, rgb(tone.bg), rgb(tone.sunken)]
  return {
    '--bg': tone.bg,
    '--card': tone.card,
    '--sunken': tone.sunken,
    '--fg': tone.fg,
    '--muted': tone.muted,
    '--line': tone.line,
    '--strong': tone.strong,
    '--hover': hex(mix(card, fg, dark ? 0.06 : 0.04)),
    '--acc': hex(acc),
    '--acc-hover': hex(accHover),
    '--on-acc': hex(ink),
    '--acc-text': readable(acc, grounds, fg),
    '--feat': hex(feat),
    '--tint': hex(tint),
    '--coin-top': hex(acc),
    '--coin-side': hex(mix(acc, BLACK, 0.34)),
    '--coin-edge': hex(mix(acc, BLACK, 0.55)),
    '--coin-groove': hex(mix(acc, BLACK, 0.2)),
    '--coin-shine': hex(mix(acc, WHITE, 0.55)),
    '--coin-shadow': dark ? 'rgba(0,0,0,0.55)' : 'rgba(40,30,10,0.16)',
  } as CSSProperties
}

const SANS = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

// ---------- 数字 ----------

const count = new Intl.NumberFormat('en-US')
const fmt = (value: number) => count.format(Math.round(value))

/** 用量取两位有效数字左右的整数，滑块拖动时读数不会抖成 913、927。 */
const grain = (value: number) => (value < 20 ? 1 : value < 100 ? 5 : value < 1000 ? 10 : value < 5000 ? 50 : 100)
function nice(value: number) {
  const step = grain(value)
  return Math.max(1, Math.round(value / step) * step)
}
const toVolume = (job: Job, pos: number) => nice(job.min * Math.pow(job.max / job.min, pos))
const toPos = (job: Job, volume: number) => Math.min(1, Math.max(0, Math.log(volume / job.min) / Math.log(job.max / job.min)))

/**
 * 方向键一步走对数刻度的 1/40，再取整到好读的数。
 * 滑块原生的 1/1000 步长在对数刻度上太小，取整后会弹回原值，按键看起来没反应，所以至少挪一格取整粒度。
 */
function stepVolume(job: Job, volume: number, dir: 1 | -1, fraction = 1 / 40) {
  let next = nice(volume * Math.pow(job.max / job.min, dir * fraction))
  if (dir > 0 && next <= volume) next = volume + grain(volume)
  if (dir < 0 && next >= volume) next = volume - grain(volume - 1)
  return Math.min(job.max, Math.max(job.min, next))
}

/** 一个包在当前用量下能撑多久（以月为单位）的人话说法。 */
function runwayLabel(months: number) {
  const days = months * 30.4
  if (days < 1) return 'under a day'
  // 不满一个月按天说：「4 weeks」听起来像够一个月，其实不够。分界和卡片上的「够一个月」打勾用同一个条件（months >= 1）。
  if (months < 1) return `${Math.round(days)} ${Math.round(days) === 1 ? 'day' : 'days'}`
  // 刚过一个月的那几天说「1 month」，免得打了勾却写着「4 weeks」；从 35 天起才按周说（5 周起）。
  if (days < 35) return '1 month'
  if (days < 60) return `${Math.round(days / 7)} weeks`
  if (months < 24) return `${Math.round(months)} months`
  return '2+ years'
}

/** 卡片里时长条的满格对应 3 个月，「1 个月」的刻度固定在三分之一处。 */
const SCALE_MONTHS = 3

// ---------- 小部件 ----------

const RX = 16
const RY = 6
const T = 4.4

function Coin({ cx, cy, top }: { cx: number; cy: number; top: boolean }) {
  return (
    <g>
      <path d={`M${cx - RX} ${cy}A${RX} ${RY} 0 0 0 ${cx + RX} ${cy}L${cx + RX} ${cy + T}A${RX} ${RY} 0 0 1 ${cx - RX} ${cy + T}Z`} fill="var(--coin-side)" stroke="var(--coin-edge)" strokeWidth="0.6" />
      <ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="var(--coin-top)" stroke="var(--coin-edge)" strokeWidth="0.5" />
      {top ? (
        <>
          <ellipse cx={cx} cy={cy} rx={RX * 0.64} ry={RY * 0.64} fill="none" stroke="var(--coin-groove)" strokeWidth="0.9" />
          {/* 虚构的积分记号：一颗压扁的四角星，看起来像平放的币面 */}
          <path d={`M${cx} ${cy - 2.1}L${cx + 0.9} ${cy - 0.35}L${cx + 3.6} ${cy}L${cx + 0.9} ${cy + 0.35}L${cx} ${cy + 2.1}L${cx - 0.9} ${cy + 0.35}L${cx - 3.6} ${cy}L${cx - 0.9} ${cy - 0.35}Z`} fill="var(--coin-groove)" />
          <path d={`M${cx - RX * 0.82} ${cy - RY * 0.2}A${RX * 0.86} ${RY * 0.86} 0 0 1 ${cx - RX * 0.18} ${cy - RY * 0.84}`} fill="none" stroke="var(--coin-shine)" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        </>
      ) : null}
    </g>
  )
}

function CoinStacks({ stacks }: { stacks: Stack[] }) {
  const ordered = [...stacks].sort((a, b) => a.y - b.y)
  return (
    <svg viewBox="0 0 110 66" className="-mt-1 -mr-1 h-[62px] w-auto shrink-0" aria-hidden>
      {ordered.map((s) => (
        <ellipse key={`s${s.x}`} cx={s.x + 2} cy={s.y + T + 1.6} rx={RX + 4} ry={RY + 2} fill="var(--coin-shadow)" />
      ))}
      {ordered.map((s) => (
        <g key={`c${s.x}`}>
          {Array.from({ length: s.n }, (_, i) => (
            <Coin key={i} cx={s.x} cy={s.y - i * T} top={i === s.n - 1} />
          ))}
        </g>
      ))}
    </svg>
  )
}

function Icon({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4 shrink-0', className)} style={style} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

// ---------- 组件 ----------

export function PricingCreditPacks({ className, style, job: jobProp, volume: volumeProp, onEstimateChange, onBuy, ...props }: PricingCreditPacksProps) {
  const o = { ...defaults, ...props }
  const uid = useId()
  const reduce = useReducedMotion()
  const tone = TONES[o.tone] ?? TONES.dark!
  const dark = o.tone !== 'light'
  const currency = CURRENCIES[o.currency] ?? CURRENCIES.usd!
  const radius = Math.max(0, Math.min(28, o.radius))
  const inner = Math.max(0, Math.min(radius, 12))

  const [state, setState] = useState<{ job: JobId; volumes: Record<JobId, number> }>(() => ({
    job: 'image',
    volumes: Object.fromEntries(JOBS.map((j) => [j.id, j.start])) as Record<JobId, number>,
  }))
  const jobId = jobProp ?? state.job
  const job = JOBS.find((j) => j.id === jobId) ?? JOBS[0]!
  const volume = Math.min(job.max, Math.max(job.min, volumeProp ?? state.volumes[job.id]))
  const monthly = volume * job.cost

  // 读屏播报只在用户自己动过估算条之后才开：外部（比如自动演示）改 job / volume 时不出声。
  const [spoken, setSpoken] = useState(false)
  const update = (next: JobId, nextVolume: number) => {
    setState((s) => ({ job: next, volumes: { ...s.volumes, [next]: nextVolume } }))
    setSpoken(true)
    onEstimateChange?.({ job: next, volume: nextVolume })
  }

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0, minimumFractionDigits: 0 })
  const rateMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2, minimumFractionDigits: 2 })

  const visible = PACKS.slice(0, o.packs >= 4 ? 4 : 3).map((pack, i) => {
    const price = currency.prices[i]!
    const credits = Math.round(pack.base * (1 + pack.bonus))
    return { ...pack, price, credits, rate: (price / credits) * 1000, months: credits / monthly }
  })
  const baseRate = visible[0]!.rate
  const lowest = Math.min(...visible.map((p) => p.rate))
  const featuredId = o.highlightPack === 'none' ? null : visible.some((p) => p.id === o.highlightPack) ? o.highlightPack : visible[visible.length - 1]!.id

  // 推荐：能撑满一个月的最小包；都撑不满时指向最大的包，并如实说它多久用完。
  const coverIndex = visible.findIndex((p) => p.months >= 1)
  const fitIndex = coverIndex >= 0 ? coverIndex : visible.length - 1
  const fit = visible[fitIndex]!
  const verdict =
    coverIndex >= 0
      ? fit.credits - monthly < 1
        ? `${fit.name} covers exactly one month.`
        : `${fit.name} covers a month, with ${fmt(fit.credits - monthly)} to spare.`
      : `Even ${fit.name} runs out in about ${runwayLabel(fit.months)}. Ask us about custom volume.`
  // 播报只说推荐结论，不带每一步都在变的数字（数字已经在滑块的 aria-valuetext 里），推荐不变时文本不变、不重复播报。
  const announcement = coverIndex >= 0 ? `Recommended: the ${fit.name} pack covers a month.` : `No pack covers a month. ${fit.name} runs out in about ${runwayLabel(fit.months)}.`

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.45, bounce: 0.18 }

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden', className)}
      style={{ ...palette(tone, o.accent, dark), background: 'var(--bg)', color: 'var(--fg)', fontFamily: SANS, ...style }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{ background: `radial-gradient(48% 62% at 78% 0%, color-mix(in oklab, var(--acc) ${dark ? 15 : 13}%, transparent), transparent 72%)` }}
      />
      <div className="mx-auto w-full max-w-[1160px] px-4 pt-14 pb-16 sm:px-8 sm:pt-16 sm:pb-20 xl:pt-12">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]" style={{ color: 'var(--acc-text)', fontFamily: MONO }}>
              <span className="size-1.5 rounded-full" style={{ background: 'var(--acc)' }} aria-hidden />
              Credit packs
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4.4vw,3.05rem)] font-semibold leading-[1.03] tracking-[-0.042em]">{o.heading}</h2>
          </div>
          <p className="max-w-[440px] text-pretty text-[15.5px] leading-relaxed lg:justify-self-end lg:pb-1.5" style={{ color: 'var(--muted)' }}>
            One balance pays for images, upscales, video and voice. Bigger packs add bonus credits, so every credit gets cheaper the more you buy.
          </p>
        </header>

        {o.showEstimator ? (
          <Estimator
            job={job}
            volume={volume}
            monthly={monthly}
            verdict={verdict}
            announcement={spoken ? announcement : ''}
            radius={radius}
            inner={inner}
            onSelect={(next) => update(next.id, next.id === job.id ? volume : state.volumes[next.id])}
            onVolume={(next) => update(job.id, next)}
          />
        ) : null}

        <div className={cn('grid gap-5 sm:grid-cols-2', o.showEstimator ? 'mt-5' : 'mt-12', visible.length === 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3')}>
          {visible.map((pack, i) => {
            const featured = pack.id === featuredId
            const matched = o.showEstimator && i === fitIndex
            const saving = Math.round((1 - pack.rate / baseRate) * 100)
            const covers = pack.months >= 1
            const fill = Math.min(1, pack.months / SCALE_MONTHS)
            return (
              <article
                key={pack.id}
                aria-label={`${pack.name} pack`}
                className={cn(
                  'relative flex min-w-0 flex-col border p-5',
                  // 三个包在两列的平板宽度下，落单的第三张居中，而不是贴在左边。
                  visible.length === 3 && i === 2 && 'sm:max-lg:col-span-2 sm:max-lg:w-[calc(50%-10px)] sm:max-lg:justify-self-center',
                )}
                style={{
                  borderRadius: radius,
                  background: featured ? 'var(--feat)' : 'var(--card)',
                  borderColor: featured ? 'var(--acc)' : 'var(--line)',
                  boxShadow: featured ? `0 34px 80px -44px color-mix(in oklab, var(--acc) ${dark ? 70 : 55}%, transparent)` : undefined,
                }}
              >
                {matched ? (
                  <motion.span
                    layoutId={`${uid}-fit`}
                    aria-hidden
                    transition={spring}
                    className="pointer-events-none absolute -inset-[7px] border-[1.5px]"
                    style={{ borderRadius: radius + 7, borderColor: 'color-mix(in oklab, var(--fg) 46%, transparent)' }}
                  />
                ) : null}
                {featured ? (
                  <span className="absolute -top-3 left-5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none" style={{ background: 'var(--acc)', color: 'var(--on-acc)' }}>
                    {pack.rate <= lowest + 1e-9 ? 'Best value' : 'Most popular'}
                  </span>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pt-1">
                    <h3 className="text-[15px] font-medium leading-tight">{pack.name}</h3>
                    {pack.bonus > 0 ? (
                      <span className="mt-2 inline-block rounded-full px-2 py-1 text-[11.5px] font-medium leading-none tabular-nums" style={{ background: 'var(--tint)', color: 'var(--acc-text)', fontFamily: MONO }}>
                        +{Math.round(pack.bonus * 100)}% bonus
                      </span>
                    ) : (
                      <span className="mt-2 inline-block py-1 text-[11.5px] leading-none" style={{ color: 'var(--muted)', fontFamily: MONO }}>
                        base rate
                      </span>
                    )}
                  </div>
                  <CoinStacks stacks={pack.stacks} />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{money.format(pack.price)}</span>
                  <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
                    one-time
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-medium tabular-nums">{fmt(pack.credits)} credits</p>
                <p className="mt-0.5 text-[12px] tabular-nums" style={{ color: 'var(--muted)', fontFamily: MONO }}>
                  {pack.bonus > 0 ? `${fmt(pack.base)} + ${fmt(pack.credits - pack.base)} bonus` : 'no bonus on this pack'}
                </p>

                <dl className="mt-4 space-y-2 border-t pt-4 text-[13px]" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt style={{ color: 'var(--muted)' }}>Per 1,000 credits</dt>
                    <dd className="flex items-baseline gap-1.5 tabular-nums">
                      {saving > 0 ? (
                        <span className="text-[12px] font-medium" style={{ color: 'var(--acc-text)' }}>
                          −{saving}%
                        </span>
                      ) : null}
                      {rateMoney.format(pack.rate)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt style={{ color: 'var(--muted)' }}>Buys about</dt>
                    <dd className="tabular-nums">
                      {fmt(Math.floor(pack.credits / job.cost))} {job.unit}
                    </dd>
                  </div>
                </dl>

                {o.showEstimator ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-[13px] leading-5">
                      <span style={{ color: 'var(--muted)' }}>At your pace</span>
                      <span className="flex items-center gap-1 font-medium tabular-nums" style={{ color: covers ? 'var(--fg)' : 'var(--muted)' }}>
                        {covers ? (
                          <Icon className="size-3.5" style={{ color: 'var(--acc-text)' }}>
                            <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                          </Icon>
                        ) : null}
                        lasts ≈ {runwayLabel(pack.months)}
                      </span>
                    </div>
                    <div className="relative mt-2.5 h-1.5 rounded-full" style={{ background: 'var(--line)' }} aria-hidden>
                      <div
                        className="absolute inset-0 rounded-full transition-[clip-path,background-color] duration-500 ease-out motion-reduce:transition-none"
                        style={{
                          clipPath: `inset(0 ${(1 - fill) * 100}% 0 0 round 999px)`,
                          background: covers ? 'var(--acc)' : 'color-mix(in oklab, var(--fg) 34%, transparent)',
                        }}
                      />
                      <span className="absolute -inset-y-1 w-px" style={{ left: `${100 / SCALE_MONTHS}%`, background: 'var(--fg)', opacity: 0.5 }} />
                      <span className="absolute top-3.5 -translate-x-1/2 text-[10px] leading-none" style={{ left: `${100 / SCALE_MONTHS}%`, color: 'var(--muted)', fontFamily: MONO }}>
                        1 mo
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => onBuy?.(pack.id)}
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center gap-2 border px-4 text-[14px] font-medium',
                      // Tailwind v4 的 scale-* 写的是独立的 scale 属性，不是 transform，过渡列表里要写 scale。
                      'transition-[background-color,scale] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--acc-text)]',
                      // 静止和悬停的底色都走类名：写在 style 里的 background 会盖过 hover 规则。
                      featured
                        ? 'border-transparent bg-[color:var(--acc)] text-[color:var(--on-acc)] hover:bg-[color:var(--acc-hover)]'
                        : 'border-[color:var(--strong)] bg-transparent text-[color:var(--fg)] hover:bg-[color:var(--hover)]',
                    )}
                    style={{ borderRadius: inner }}
                  >
                    Buy {fmt(pack.credits)} credits
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 text-[13px]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          {FACTS.map((fact) => (
            <li key={fact.text} className="flex items-center gap-2">
              <Icon>{fact.icon}</Icon>
              {fact.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Estimator({
  job,
  volume,
  monthly,
  verdict,
  announcement,
  radius,
  inner,
  onSelect,
  onVolume,
}: {
  job: Job
  volume: number
  monthly: number
  verdict: string
  announcement: string
  radius: number
  inner: number
  onSelect: (job: Job) => void
  onVolume: (volume: number) => void
}) {
  const id = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const pos = toPos(job, volume)
  const active = JOBS.findIndex((j) => j.id === job.id)

  // 单选组的键盘约定：方向键在选项间移动并选中，Home / End 跳到两端。
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next: number | null = null
    if (event.key in keys) next = (active + keys[event.key]! + JOBS.length) % JOBS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = JOBS.length - 1
    if (next === null) return
    event.preventDefault()
    onSelect(JOBS[next]!)
    buttons.current[next]?.focus()
  }

  // 滑块的方向键 / 翻页键自己算下一档（见 stepVolume）；Home / End 交给原生滑块。
  const onSliderKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, [1 | -1, number]> = {
      ArrowRight: [1, 1 / 40],
      ArrowUp: [1, 1 / 40],
      ArrowLeft: [-1, 1 / 40],
      ArrowDown: [-1, 1 / 40],
      PageUp: [1, 1 / 8],
      PageDown: [-1, 1 / 8],
    }
    const move = keys[event.key]
    if (!move) return
    event.preventDefault()
    const next = stepVolume(job, volume, move[0], move[1])
    if (next !== volume) onVolume(next)
  }

  return (
    <div
      data-estimator
      className="mt-10 grid gap-6 border p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-x-8 xl:mt-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(200px,0.62fr)] xl:py-5"
      style={{ borderRadius: radius, background: 'var(--sunken)', borderColor: 'var(--line)' }}
    >
      <div className="min-w-0 md:col-span-2 xl:col-span-1">
        <div id={`${id}-jobs`} className="text-[11.5px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--muted)', fontFamily: MONO }}>
          Mostly running
        </div>
        <div role="radiogroup" aria-labelledby={`${id}-jobs`} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {JOBS.map((j, i) => {
            const on = j.id === job.id
            return (
              <button
                key={j.id}
                ref={(el) => {
                  buttons.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => onSelect(j)}
                onKeyDown={onKey}
                className={cn(
                  'flex min-w-0 flex-col items-start gap-1.5 border px-3 py-2.5 text-left',
                  'transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--acc-text)]',
                  on ? 'border-[color:var(--acc)] bg-[color:var(--tint)]' : 'border-[color:var(--line)] bg-[color:var(--card)] hover:bg-[color:var(--hover)]',
                )}
                style={{ borderRadius: inner }}
              >
                <span className="flex items-center gap-1.5 text-[13.5px] font-medium" style={{ color: 'var(--fg)' }}>
                  <Icon className="size-[15px]" style={{ color: on ? 'var(--acc-text)' : 'var(--muted)' }}>
                    {j.icon}
                  </Icon>
                  {j.label}
                </span>
                <span className="text-[11px] leading-none tabular-nums" style={{ color: on ? 'var(--acc-text)' : 'var(--muted)', fontFamily: MONO }}>
                  {j.cost} cr each
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={`${id}-volume`} className="truncate text-[11.5px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--muted)', fontFamily: MONO }}>
            {job.per}
          </label>
          <span className="text-[22px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{fmt(volume)}</span>
        </div>
        <div className="relative mt-4 h-6">
          <input
            id={`${id}-volume`}
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(pos * 1000)}
            onChange={(event) => onVolume(toVolume(job, Number(event.target.value) / 1000))}
            onKeyDown={onSliderKey}
            aria-valuetext={`${fmt(volume)} ${job.unit} a month, ${fmt(monthly)} credits`}
            className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ background: 'var(--line)' }}>
            <div className="h-full rounded-full" style={{ width: `${pos * 100}%`, background: 'var(--acc)' }} />
          </div>
          <span
            className="pointer-events-none absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--acc-text)]"
            style={{ left: `${pos * 100}%`, background: 'var(--fg)', borderColor: 'var(--acc)', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
            aria-hidden
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] tabular-nums" style={{ color: 'var(--muted)', fontFamily: MONO }} aria-hidden>
          <span>{fmt(job.min)}</span>
          <span>{fmt(job.max)}</span>
        </div>
      </div>

      <div className="min-w-0 border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8" style={{ borderColor: 'var(--line)' }}>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{fmt(monthly)}</span>
          <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
            credits a month
          </span>
        </div>
        <p className="mt-2 text-pretty text-[13px] leading-snug" style={{ color: 'var(--acc-text)' }}>
          {verdict}
        </p>
      </div>
    </div>
  )
}
