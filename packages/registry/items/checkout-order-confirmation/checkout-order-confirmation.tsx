import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#2f6b4f',
  tone: 'paper',
  font: 'serif',
  radius: 14,
  layout: 'split',
  currency: 'usd',
  showAccountPrompt: true,
  showReferral: true,
}
/* @motif:end */

export type CopyTarget = 'order' | 'referral'

export type CheckoutOrderConfirmationProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制某个复制按钮显示「已复制」的样子（演示自动播放用）。只改外观、不播报；真实点击的结果始终优先显示。 */
  copied?: CopyTarget | null
  onCopy?: (target: CopyTarget, value: string) => void
  /** 订单摘要是否展开（受控）；不传时组件自己管理，默认展开。 */
  summaryOpen?: boolean
  onSummaryOpenChange?: (open: boolean) => void
  /** 游客设置密码后的回调；接到你自己的注册接口上。 */
  onCreateAccount?: (password: string) => void
  onContinueShopping?: () => void
}

// ---------- 订单数据：换成真实订单即可，日期是固定字符串，不读当前时间 ----------

const STORE = 'Kiln & Kettle'

const ORDER = {
  number: 'KK-20418',
  placed: 'Sat, Nov 7, 2026 at 10:42 AM',
  customer: 'Maya',
  email: 'maya.okafor@example.com',
  cardLast4: '8817',
  referralCode: 'MAYA-K7Q2',
  discountCode: 'WELCOME10',
  discountRate: 0.1,
  estimate: 'Thu, Nov 12 – Sat, Nov 14',
  method: 'Standard shipping · 3–5 business days',
}

type Art = 'pourover' | 'beans' | 'towels'
const ITEMS: { name: string; variant: string; qty: number; art: Art }[] = [
  { name: 'Speckled pour-over set', variant: 'Oat glaze · dripper and carafe', qty: 1, art: 'pourover' },
  { name: 'Huila whole-bean coffee', variant: '250 g · medium roast', qty: 2, art: 'beans' },
  { name: 'Waffle linen tea towels', variant: 'Rust · set of two', qty: 1, art: 'towels' },
]

const STAGES = [
  { label: 'Confirmed', note: 'Today, 10:42' },
  { label: 'Packed', note: 'Mon, Nov 9' },
  { label: 'Shipped', note: 'Tue, Nov 10' },
  { label: 'Delivered', note: 'Nov 12–14' },
]

type Region = {
  code: string
  /** 与 ITEMS 一一对应的单价。 */
  prices: number[]
  tax: { label: string; rate: number; included: boolean }
  referral: number
  minOrder: number
  address: string[]
}

// 币种连同地区一起切换：税的写法（价内 / 价外）和收货地址跟着变，页面才像真的。
const REGIONS: Record<string, Region> = {
  usd: { code: 'USD', prices: [68, 19, 24], tax: { label: 'Sales tax (8%)', rate: 0.08, included: false }, referral: 15, minOrder: 60, address: ['Maya Okafor', '418 Alder Row, Apt 3', 'Portland, OR 97214'] },
  eur: { code: 'EUR', prices: [64, 18, 22], tax: { label: 'VAT 19%', rate: 0.19, included: true }, referral: 15, minOrder: 60, address: ['Maya Okafor', 'Lindenstraße 41', '10969 Berlin'] },
  gbp: { code: 'GBP', prices: [56, 16, 20], tax: { label: 'VAT 20%', rate: 0.2, included: true }, referral: 10, minOrder: 50, address: ['Maya Okafor', '14 Wren Street', 'Bristol BS2 8QL'] },
  jpy: { code: 'JPY', prices: [9800, 2600, 3400], tax: { label: 'consumption tax 10%', rate: 0.1, included: true }, referral: 2000, minOrder: 8000, address: ['Maya Okafor', '2-14-7 Kichijōji Honchō', 'Musashino, Tokyo', '180-0004'] },
}

type Tone = { bg: string; card: string; sunken: string; fg: string; muted: string; line: string }
const TONES: Record<string, Tone> = {
  paper: { bg: '#f4f0e8', card: '#fffdf8', sunken: '#f1ece2', fg: '#1f1c17', muted: '#6a6458', line: '#e2dbcd' },
  white: { bg: '#f5f5f6', card: '#ffffff', sunken: '#f3f3f5', fg: '#17171b', muted: '#5f5f69', line: '#e4e4e9' },
  ink: { bg: '#121211', card: '#1b1b19', sunken: '#161615', fg: '#f1efe9', muted: '#a29e94', line: '#2c2b28' },
}

const HEADINGS: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Fraunces Variable', ui-serif, Georgia, serif", weight: 440, tracking: '-0.025em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.04em' },
  grotesk: { family: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif", weight: 640, tracking: '-0.04em' },
}
const SANS = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, monospace"

// ---------- 颜色：按亮度挑按钮文字，按对比度把主色收敛成可读的文字色 ----------

type RGB = [number, number, number]
function rgb(hex: string): RGB {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = Number.parseInt(h.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function hex([r, g, b]: RGB) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
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
/** 主色当文字用时：逐步向正文色靠拢，直到在所有底色上都达到 4.5:1。 */
function readable(accent: RGB, grounds: RGB[], fg: RGB) {
  for (let t = 0; t <= 1.001; t += 0.08) {
    const c = mix(accent, fg, t)
    if (grounds.every((g) => contrast(c, g) >= 4.5)) return hex(c)
  }
  return hex(fg)
}

const WHITE: RGB = [255, 255, 255]
const INK: RGB = [20, 20, 20]
const BLACK: RGB = [0, 0, 0]

/** 一套底色 + 主色算出全部颜色变量。屏幕用所选底色；深色底打印时另用纯白底再算一遍。 */
function palette(tone: Tone, accent: string): Record<string, string> {
  const fg = rgb(tone.fg)
  const card = rgb(tone.card)
  const dark = luminance(rgb(tone.bg)) < 0.2
  // 主色和卡片底色几乎一样时（墨色底配深色、米纸底配浅色），填充会看不见：向正文色推到 1.7:1 为止。
  let acc = rgb(accent)
  for (let t = 0.1; contrast(acc, card) < 1.7 && t <= 1; t += 0.1) acc = mix(rgb(accent), fg, t)
  // 按钮文字至少 4.5:1：白字够就用白字，深字够就用深字。两边都不够的中间色（如 #d9482b）把填充往黑里压，直到白字够。
  let onAcc = '#ffffff'
  if (contrast(acc, WHITE) < 4.5) {
    if (contrast(acc, INK) >= 4.5) onAcc = '#141414'
    else {
      const base = acc
      for (let t = 0.03; contrast(acc, WHITE) < 4.5 && t <= 1; t += 0.03) acc = mix(base, BLACK, t)
    }
  }
  const tint = mix(card, acc, dark ? 0.1 : 0.08)
  return {
    '--page': tone.bg,
    '--card': tone.card,
    '--sunken': tone.sunken,
    '--fg': tone.fg,
    '--muted': tone.muted,
    '--line': tone.line,
    '--acc': hex(acc),
    '--on-acc': onAcc,
    '--acc-text': readable(acc, [card, rgb(tone.bg), tint, rgb(tone.sunken)], fg),
    '--tint': hex(tint),
    '--tint-line': hex(mix(card, acc, dark ? 0.3 : 0.24)),
    '--danger': dark ? '#ff8a7a' : '#c43c2f',
  }
}

function money(code: string) {
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
  return (value: number) => f.format(value)
}
function round(value: number, code: string) {
  return code === 'JPY' ? Math.round(value) : Math.round(value * 100) / 100
}

type PolicyDocument = Document & { featurePolicy?: { allowsFeature: (feature: string) => boolean } }

async function writeClipboard(text: string) {
  try {
    // iframe 的权限策略不给 clipboard-write 时，调用本身就会在控制台报错：先问一句，不给就直接走 execCommand。
    if ((document as PolicyDocument).featurePolicy?.allowsFeature('clipboard-write') === false) throw new Error('clipboard-write blocked')
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 权限被拒或在 iframe 里：退回到 execCommand。
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(area)
    area.select()
    let ok: boolean
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    area.remove()
    return ok
  }
}

// ---------- 小图标与商品插画（全部内联 SVG） ----------

const focus = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--acc-text)]'
const surface = 'border border-[color:var(--line)] bg-[color:var(--card)]'
const muted = 'text-[color:var(--muted)]'
const ease = [0.22, 1, 0.36, 1] as const

function Icon({ d, className, strokeWidth = 1.6 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}
const ICONS = {
  copy: 'M7.5 7.5V4.75c0-.69.56-1.25 1.25-1.25h6.5c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25H12.5M4.75 7.5h6.5c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-6.5c0-.69.56-1.25 1.25-1.25Z',
  check: 'm4.5 10.5 3.5 3.5 7.5-8',
  chevron: 'm5.5 8 4.5 4.5L14.5 8',
  bag: 'M5 7h10l-.8 9.1a1.5 1.5 0 0 1-1.5 1.4H7.3a1.5 1.5 0 0 1-1.5-1.4L5 7Zm2.5 0V5.5a2.5 2.5 0 0 1 5 0V7',
  truck: 'M2.5 5.5h9v8h-9zM11.5 8.5h3.2l2.8 2.8v2.2h-6M6 15.5a1.5 1.5 0 1 0 0-.01M14 15.5a1.5 1.5 0 1 0 0-.01',
  user: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.5 6.5c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4',
  close: 'm5.5 5.5 9 9m0-9-9 9',
  eye: 'M2.5 10s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5Zm7.5 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  eyeOff: 'M3.5 3.5l13 13M8.4 5.2A7.6 7.6 0 0 1 10 5c4.8 0 7.5 5 7.5 5a12.6 12.6 0 0 1-2.1 2.7M12.1 14.6A7 7 0 0 1 10 15c-4.8 0-7.5-5-7.5-5a12.4 12.4 0 0 1 3-3.4M8.6 8.6a2 2 0 0 0 2.8 2.8',
  gift: 'M3.5 8h13v3h-13zM4.5 11v5.5h11V11M10 8v8.5M10 8C8.5 5 5.5 4.5 5.5 6.3S8 8 10 8Zm0 0c1.5-3 4.5-3.5 4.5-1.7S12 8 10 8Z',
  print: 'M5.5 7.5V3.5h9v4M5.5 14h-2v-6.5h13V14h-2M5.5 11.5h9v5h-9z',
  arrow: 'M4 10h12m-4.5-4.5L16 10l-4.5 4.5',
  alert: 'M10 6.5v4.25M10 13.6v.01M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z',
}

/** 虚构品牌的标志：一座窑顶加一条底座。 */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6 shrink-0', className)} aria-hidden>
      <path d="M4 17.5a8 8 0 0 1 16 0Z" fill="var(--acc)" />
      <path d="M9.5 17.5a2.5 2.5 0 0 1 5 0Z" fill="var(--card)" />
      <rect x="2.5" y="18.75" width="19" height="2.25" rx="1.1" fill="currentColor" />
    </svg>
  )
}

function CardGlyph() {
  return (
    <svg viewBox="0 0 28 20" className="h-4 w-[1.4rem] shrink-0" aria-hidden>
      <rect x="0.75" y="0.75" width="26.5" height="18.5" rx="3" fill="var(--sunken)" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
      <rect x="4" y="5" width="6" height="4.5" rx="1" fill="currentColor" opacity=".45" />
      <path d="M4 14h8m3 0h4" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** 商品缩略图：自带背景色，像商品照片一样在任何底色上都成立。 */
function Thumb({ art, size = 56 }: { art: Art; size?: number }) {
  const bg = art === 'pourover' ? '#e8e1d3' : art === 'beans' ? '#efe2cc' : '#f1ddd2'
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className="block shrink-0 rounded-[calc(var(--r)*0.6)]" aria-hidden>
      <rect width="56" height="56" fill={bg} />
      <ellipse cx="28" cy="49" rx="17" ry="2.6" fill="#000" opacity=".08" />
      {art === 'pourover' && (
        <g>
          <path d="M19.5 30h17l2.4 14.2a3 3 0 0 1-3 3.5H20.1a3 3 0 0 1-3-3.5Z" fill="#f4efe4" stroke="#c9bba1" strokeWidth="1" />
          <path d="M36.6 33.5c3.4 0 4.4 2.2 4.4 4.2s-1.4 4-4 4" fill="none" stroke="#c9bba1" strokeWidth="1.6" />
          <path d="M14.5 16.5h27l-6.2 12.5H20.7Z" fill="#faf6ee" stroke="#c9bba1" strokeWidth="1" />
          <rect x="19.5" y="28.5" width="17" height="2.6" rx="1.2" fill="#ddd1bb" />
          {[
            [22, 20],
            [31, 22.5],
            [36, 19],
            [26, 25],
            [24, 37],
            [31, 41],
            [28, 34],
            [34, 44],
            [22, 44],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r=".75" fill="#6f6250" opacity=".55" />
          ))}
        </g>
      )}
      {art === 'beans' && (
        <g>
          <path d="M17 15h22l2.2 5.5V46a2 2 0 0 1-2 2H16.8a2 2 0 0 1-2-2V20.5Z" fill="#c69f72" />
          <path d="M17 15h22l2.2 5.5H14.8Z" fill="#a9845a" />
          <path d="M16 12.5h24" stroke="#8f6e48" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="19.5" y="26" width="17" height="15" rx="1.5" fill="#f7f0e3" />
          <circle cx="28" cy="31.5" r="3" fill="none" stroke="#2f3b2f" strokeWidth="1.3" />
          <path d="M28 28.8v5.4" stroke="#2f3b2f" strokeWidth="1" />
          <path d="M23 37h10m-8 2h6" stroke="#2f3b2f" strokeWidth=".9" strokeLinecap="round" opacity=".6" />
          <circle cx="35" cy="22" r="1.3" fill="#8f6e48" />
        </g>
      )}
      {art === 'towels' && (
        <g>
          <path d="M28 9.5v6" stroke="#9a4a2a" strokeWidth="1.2" />
          <path d="M25.5 15.5a2.5 2.5 0 0 1 5 0" fill="none" stroke="#9a4a2a" strokeWidth="1.2" />
          <rect x="12" y="31" width="32" height="13" rx="2" fill="#a8482a" />
          <rect x="12" y="18" width="32" height="13" rx="2" fill="#c4613b" />
          <path d="M12 22.5h32M12 26.5h32M12 35.5h32M12 39.5h32" stroke="#e8b08e" strokeWidth=".8" opacity=".7" />
          <path d="M18 18v26M24 18v26M30 18v26M36 18v26" stroke="#7e3219" strokeWidth=".6" opacity=".35" />
        </g>
      )}
    </svg>
  )
}

/** 订单号做成的条形码：只是装饰，宽度由字符编码决定，同一个单号永远一样。 */
function Barcode({ value }: { value: string }) {
  const bars: { x: number; w: number }[] = []
  let x = 0
  const push = (w: number, gap: number) => {
    bars.push({ x, w })
    x += w + gap
  }
  push(1, 1)
  push(1, 2)
  for (const ch of value) {
    let s = Math.imul(ch.charCodeAt(0), 2654435761) >>> 0
    for (let k = 0; k < 5; k++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      push(1 + ((s >>> 13) % 3), 1 + ((s >>> 7) % 2))
    }
  }
  push(1, 1)
  push(1, 0)
  return (
    <svg viewBox={`0 0 ${x} 30`} preserveAspectRatio="none" className="h-10 w-full max-w-64" aria-hidden>
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y="0" width={b.w} height="30" fill="currentColor" />
      ))}
    </svg>
  )
}

// ---------- 交互小件 ----------

const COPY_WORDS = { idle: 'Copy', done: 'Copied', failed: 'Failed' } as const

/**
 * 看到的状态：真实点击的结果（复制成功 / 失败）优先，其次才是演示强制的「已复制」。
 * 读屏只听真实点击：aria-label 和页面上的 live region 都只跟 ctx.feedback 走，演示自动播放不会出声。
 */
function CopyButton({ ctx, target, value, label, variant = 'ghost' }: { ctx: Ctx; target: CopyTarget; value: string; label: string; variant?: 'ghost' | 'solid' }) {
  const real = ctx.feedback?.target === target ? (ctx.feedback.ok ? 'done' : 'failed') : null
  const state = real ?? (ctx.forced === target ? 'done' : 'idle')
  const reduced = ctx.reduced
  return (
    <button
      type="button"
      data-copy={target}
      onClick={() => ctx.copy(target, value)}
      aria-label={real === 'done' ? `${label} copied` : real === 'failed' ? `Couldn't copy ${label}, try again` : `Copy ${label}`}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[calc(var(--r)*0.55)] px-2.5 text-xs font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none print:hidden',
        variant === 'solid' ? 'bg-[color:var(--acc)] text-[color:var(--on-acc)] hover:brightness-[1.06]' : 'text-[color:var(--fg)] hover:bg-[color:var(--sunken)]',
        focus,
      )}
    >
      <span className="relative grid size-3.5 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={state}
            className="absolute inset-0 grid place-items-center"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            transition={reduced ? { duration: 0.12 } : { type: 'spring', visualDuration: 0.28, bounce: 0.35 }}
          >
            <Icon d={state === 'done' ? ICONS.check : state === 'failed' ? ICONS.alert : ICONS.copy} className="size-3.5" strokeWidth={state === 'done' ? 2.2 : 1.6} />
          </motion.span>
        </AnimatePresence>
      </span>
      {/* 三个词叠在同一格里，按钮宽度不随文字跳动。 */}
      <span className="inline-grid" aria-hidden>
        {(Object.keys(COPY_WORDS) as (keyof typeof COPY_WORDS)[]).map((k) => (
          <span key={k} className={cn('col-start-1 row-start-1', k !== state && 'invisible')}>
            {COPY_WORDS[k]}
          </span>
        ))}
      </span>
    </button>
  )
}

function PrimaryButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[calc(var(--r)*0.7)] bg-[color:var(--acc)] px-4 text-sm font-medium text-[color:var(--on-acc)] transition-[filter,transform] duration-200 hover:brightness-[1.07] active:scale-[0.98] motion-reduce:transition-none',
        focus,
        className,
      )}
    >
      {children}
    </button>
  )
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[calc(var(--r)*0.7)] border border-[color:var(--line)] px-4 text-sm font-medium transition-[background-color] duration-200 hover:bg-[color:var(--sunken)] motion-reduce:transition-none', focus)}
    >
      {children}
    </button>
  )
}

// ---------- 区块 ----------

type Ctx = {
  run: boolean
  reduced: boolean
  heading: { family: string; weight: number; tracking: string }
  fmt: (value: number) => string
  region: Region
  /** 最近一次真实点击复制的结果，约两秒后清空。 */
  feedback: CopyFeedback | null
  /** 演示强制显示「已复制」的那个按钮。 */
  forced: CopyTarget | null
  copy: (target: CopyTarget, value: string) => void
}
type CopyFeedback = { target: CopyTarget; ok: boolean }

/** 关掉注册卡时焦点不能掉回 <body>：落到它后面最近的落点（下一张卡或帮助文字），没有就落到前面最近的一个。 */
function landNear(from: HTMLElement | null) {
  const root = from?.closest('[data-order-root]')
  if (!from || !root) return
  const spots = Array.from(root.querySelectorAll<HTMLElement>('[data-landing]')).filter((el) => !from.contains(el))
  const next = spots.find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) ?? spots[spots.length - 1]
  next?.focus()
}

function Reveal({ run, delay, children, className }: { run: boolean; delay: number; children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={run ? { opacity: 0, y: 16 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease }}>
      {children}
    </motion.div>
  )
}

function CheckBadge({ run }: { run: boolean }) {
  return (
    <motion.span
      className="relative grid size-12 shrink-0 place-items-center rounded-full bg-[color:var(--acc)] text-[color:var(--on-acc)]"
      style={{ boxShadow: '0 0 0 7px color-mix(in oklab, var(--acc) 15%, transparent)' }}
      initial={run ? { scale: 0.4, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.45 }}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <motion.path d="M5.5 12.5l4.2 4.2L18.5 7.5" initial={run ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.28, ease }} />
      </svg>
    </motion.span>
  )
}

function Hero({ ctx, centered }: { ctx: Ctx; centered?: boolean }) {
  const { heading: h } = ctx
  return (
    <div className={cn(centered && 'flex flex-col items-center text-center')}>
      <CheckBadge run={ctx.run} />
      <Reveal run={ctx.run} delay={0.12} className={cn(centered && 'flex flex-col items-center')}>
        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[color:var(--acc-text)] uppercase">Order confirmed</p>
        <h1 className="mt-2.5 max-w-xl text-[2.15rem] text-balance sm:text-5xl" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking, lineHeight: 1.04 }}>
          Thank you, {ORDER.customer}. Your order is in.
        </h1>
        <p className={cn('mt-4 max-w-lg text-[15px] leading-relaxed text-pretty', muted)}>
          A receipt is on its way to <span className="font-medium text-[color:var(--fg)]">{ORDER.email}</span>. We will email tracking as soon as the box leaves the studio.
        </p>
      </Reveal>
      <Reveal run={ctx.run} delay={0.22} className={cn('mt-6 flex flex-wrap items-center gap-x-4 gap-y-2', centered && 'justify-center')}>
        <span className={cn('inline-flex items-center gap-1 rounded-[calc(var(--r)*0.7)] py-1 pr-1 pl-3', surface)}>
          <span className={cn('text-xs', muted)}>Order</span>
          <span className="pr-1 text-sm font-medium tabular-nums" style={{ fontFamily: MONO }}>
            {ORDER.number}
          </span>
          <CopyButton ctx={ctx} target="order" value={ORDER.number} label="order number" />
        </span>
        <span className={cn('text-sm', muted)}>Placed {ORDER.placed}</span>
      </Reveal>
    </div>
  )
}

/** 四段物流进度：停在第一站，第一段上有一道光往「打包」方向走，表示正在处理。 */
function Progress({ compact }: { compact?: boolean }) {
  const ref = useRef<HTMLOListElement>(null)
  useFrameLoop(
    ref,
    ({ time }) => {
      const el = ref.current
      if (!el) return
      el.style.setProperty('--ping', ((time % 2.4) / 2.4).toFixed(3))
      el.style.setProperty('--sweep', ((time % 2) / 2).toFixed(3))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
  return (
    <ol ref={ref} aria-label="Order progress" className="relative grid grid-cols-4" style={{ ['--ping' as string]: 0.35, ['--sweep' as string]: 0.4 }}>
      <span aria-hidden className="absolute top-[13px] right-[12.5%] left-[12.5%] h-0.5 rounded-full bg-[color:var(--line)]" />
      <span aria-hidden className="absolute top-[13px] left-[12.5%] h-0.5 w-[calc(25%*0.42)] rounded-full bg-[color:var(--acc)]" />
      <span aria-hidden className="absolute top-[13px] left-[12.5%] h-0.5 w-1/4 overflow-hidden rounded-full motion-reduce:hidden print:hidden">
        <span className="absolute inset-y-0 left-0 w-2/5 [background:linear-gradient(90deg,transparent,var(--acc),transparent)]" style={{ transform: 'translateX(calc(var(--sweep) * 350% - 100%))' }} />
      </span>
      {STAGES.map((s, i) => {
        const current = i === 0
        return (
          <li key={s.label} aria-current={current ? 'step' : undefined} className="relative flex min-w-0 flex-col items-center text-center">
            <span className={cn('relative grid size-7 place-items-center rounded-full', current ? 'bg-[color:var(--acc)] text-[color:var(--on-acc)]' : 'border-2 bg-[color:var(--card)]')} style={current ? undefined : { borderColor: i === 1 ? 'color-mix(in oklab, var(--acc) 45%, var(--line))' : 'var(--line)' }}>
              {current ? (
                <>
                  <span aria-hidden className="absolute inset-0 rounded-full border-2 border-[color:var(--acc)] motion-reduce:hidden print:hidden" style={{ transform: 'scale(calc(1 + var(--ping) * 0.9))', opacity: 'calc((1 - var(--ping)) * 0.55)' }} />
                  <Icon d={ICONS.check} className="size-3.5" strokeWidth={2.4} />
                </>
              ) : (
                <span className="size-1.5 rounded-full" style={{ background: i === 1 ? 'color-mix(in oklab, var(--acc) 60%, var(--line))' : 'var(--line)' }} />
              )}
            </span>
            <span className={cn('mt-2.5 text-xs font-medium sm:text-[13px]', current ? 'text-[color:var(--fg)]' : muted)}>{s.label}</span>
            {!compact && <span className={cn('mt-0.5 text-[11px] leading-tight sm:text-xs', muted)}>{s.note}</span>}
            <span className="sr-only">{current ? ', current stage' : ', upcoming'}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Delivery({ ctx, bare }: { ctx: Ctx; bare?: boolean }) {
  const { heading: h } = ctx
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cn('text-xs font-medium tracking-[0.08em] uppercase', muted)}>Estimated delivery</h2>
          <p className="mt-1.5 text-[1.45rem] leading-tight sm:text-2xl" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking }}>
            {ORDER.estimate}
          </p>
          <p className={cn('mt-1 text-sm', muted)}>{ORDER.method}</p>
        </div>
        <span className="hidden size-11 shrink-0 place-items-center rounded-full text-[color:var(--acc-text)] sm:grid" style={{ background: 'color-mix(in oklab, var(--acc) 12%, var(--card))' }}>
          <Icon d={ICONS.truck} className="size-5" />
        </span>
      </div>
      <div className="mt-7">
        <Progress />
      </div>
      <p className={cn('mt-6 rounded-[calc(var(--r)*0.6)] bg-[color:var(--sunken)] px-3.5 py-3 text-[13px] leading-relaxed', muted)}>
        <span className="font-medium text-[color:var(--fg)]">Packing starts Monday morning.</span> Need to change the address? Reply to your receipt before 9:00 AM Monday and we will fix it.
      </p>
    </>
  )
  if (bare) return body
  return <section className={cn('rounded-[var(--r)] p-5 sm:p-6', surface)}>{body}</section>
}

function Details({ ctx, columns = 3 }: { ctx: Ctx; columns?: 2 | 3 }) {
  const rows: { term: string; value: ReactNode }[] = [
    {
      term: 'Shipping to',
      value: ctx.region.address.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      )),
    },
    {
      term: 'Payment',
      value: (
        <>
          <span className="flex items-center gap-2">
            <CardGlyph />
            Card ending {ORDER.cardLast4}
          </span>
          <span className={cn('block', muted)}>Billing same as shipping</span>
        </>
      ),
    },
    {
      term: 'Delivery',
      value: (
        <>
          <span className="block">Standard, free</span>
          <span className={cn('block', muted)}>No signature needed</span>
        </>
      ),
    },
  ]
  const list = columns === 2 ? rows.slice(0, 2) : rows
  return (
    <dl className={cn('grid gap-5 text-sm leading-relaxed', columns === 3 ? 'sm:grid-cols-3' : '@sm:grid-cols-2')}>
      {list.map((r) => (
        <div key={r.term} className="min-w-0">
          <dt className={cn('mb-1.5 text-xs font-medium tracking-[0.08em] uppercase', muted)}>{r.term}</dt>
          <dd className="break-words">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Summary({ ctx, open, onToggle, bare }: { ctx: Ctx; open: boolean; onToggle: () => void; bare?: boolean }) {
  const id = useId()
  const { region, fmt, heading: h } = ctx
  const lines = ITEMS.map((item, i) => ({ ...item, unit: region.prices[i] ?? 0, total: (region.prices[i] ?? 0) * item.qty }))
  const count = ITEMS.reduce((n, item) => n + item.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.total, 0)
  const discount = round(subtotal * ORDER.discountRate, region.code)
  const taxable = subtotal - discount
  const tax = round(region.tax.included ? (taxable * region.tax.rate) / (1 + region.tax.rate) : taxable * region.tax.rate, region.code)
  const total = round(region.tax.included ? taxable : taxable + tax, region.code)

  return (
    <section className={cn(!bare && cn('overflow-hidden rounded-[var(--r)]', surface))}>
      <h2 className="m-0">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className={cn('flex w-full items-center gap-3 text-left transition-[background-color] duration-200 motion-reduce:transition-none', bare ? 'py-1' : 'px-5 py-4 hover:bg-[color:var(--sunken)] sm:px-6', focus, 'focus-visible:-outline-offset-2')}>
          <Icon d={ICONS.bag} className={cn('size-[18px]', muted)} />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-medium">Order summary</span>
            <span className={muted}> · {count} items</span>
          </span>
          <span className="text-sm font-semibold tabular-nums">{fmt(total)}</span>
          <Icon d={ICONS.chevron} className={cn('size-4 transition-transform duration-300 motion-reduce:transition-none print:hidden', muted, open && 'rotate-180')} />
        </button>
      </h2>
      {/* 打印时总是展开：收起的摘要印出来就只剩一个总价。 */}
      <div id={id} inert={!open} className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none print:grid-rows-[1fr]!" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="min-h-0 overflow-hidden">
          <div className={cn(bare ? 'pt-4' : 'border-t border-[color:var(--line)] px-5 pt-5 pb-5 sm:px-6')}>
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.name} className="flex items-center gap-3.5">
                  <span className="relative shrink-0">
                    <Thumb art={l.art} size={bare ? 44 : 56} />
                    {l.qty > 1 && <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[color:var(--fg)] text-[10px] font-semibold text-[color:var(--card)] tabular-nums">{l.qty}</span>}
                  </span>
                  {/* 这一页就是用来看买了什么：品名最多两行，规格和单价自然换行，都不截断。 */}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm leading-snug font-medium">{l.name}</span>
                    <span className={cn('mt-0.5 block text-xs leading-snug text-pretty', muted)}>
                      {l.variant}
                      {l.qty > 1 && <span className="whitespace-nowrap"> · {fmt(l.unit)} each</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm whitespace-nowrap tabular-nums">{fmt(l.total)}</span>
                </li>
              ))}
            </ul>
            <dl className={cn('mt-5 space-y-2.5 border-t border-dashed border-[color:var(--line)] pt-4 text-sm')}>
              <div className="flex justify-between gap-4">
                <dt className={muted}>Subtotal</dt>
                <dd className="tabular-nums">{fmt(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className={cn('flex items-center gap-2', muted)}>
                  Discount
                  <span className="rounded-[calc(var(--r)*0.35)] px-1.5 py-px text-[11px] font-medium text-[color:var(--acc-text)]" style={{ background: 'color-mix(in oklab, var(--acc) 12%, var(--card))', fontFamily: MONO }}>
                    {ORDER.discountCode}
                  </span>
                </dt>
                <dd className="text-[color:var(--acc-text)] tabular-nums">−{fmt(discount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className={muted}>Shipping</dt>
                <dd>Free</dd>
              </div>
              {!region.tax.included && (
                <div className="flex justify-between gap-4">
                  <dt className={muted}>{region.tax.label}</dt>
                  <dd className="tabular-nums">{fmt(tax)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-[color:var(--line)] pt-4">
              <div>
                <p className="text-sm font-medium">Total paid</p>
                {region.tax.included && (
                  <p className={cn('mt-0.5 text-xs', muted)}>
                    Includes {fmt(tax)} {region.tax.label}
                  </p>
                )}
              </div>
              <p className="flex items-baseline gap-1.5">
                <span className={cn('text-xs', muted)}>{region.code}</span>
                <span className="text-2xl tabular-nums" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking }}>
                  {fmt(total)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** 注册成功的提示：挂载时接住焦点，原来那个按钮所在的表单已经卸载了。 */
function SavedNote({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <motion.p ref={ref} tabIndex={-1} role="status" className={cn('mt-5 flex items-start gap-2.5 rounded-[calc(var(--r)*0.6)] bg-[color:var(--sunken)] px-3.5 py-3 text-sm', focus)} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[color:var(--acc)] text-[color:var(--on-acc)]">
        <Icon d={ICONS.check} className="size-3" strokeWidth={2.6} />
      </span>
      <span>
        Account created. Sign in with <span className="font-medium [overflow-wrap:anywhere]">{ORDER.email}</span> to follow this order.
      </span>
    </motion.p>
  )
}

const field =
  'h-10 w-full rounded-[calc(var(--r)*0.6)] border text-sm text-[color:var(--fg)] transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-[color:var(--acc-text)] focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--acc)_22%,transparent)] motion-reduce:transition-none'

function AccountPrompt({ ctx, onCreate }: { ctx: Ctx; onCreate?: (password: string) => void }) {
  const [state, setState] = useState<'idle' | 'error' | 'saved' | 'dismissed'>('idle')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  // 每次提交失败加一：提示文字换成错误之后再把焦点送回输入框，读屏连同 aria-describedby 一起读出来。
  const [attempts, setAttempts] = useState(0)
  const id = useId()
  const section = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const { heading: h } = ctx
  useEffect(() => {
    if (attempts > 0) input.current?.focus()
  }, [attempts])
  // 不走原生表单提交：预览沙箱没有 allow-forms，原生提交会被拦下；按钮点击和回车都直接调用这里。
  const submit = () => {
    if (password.length < 8) {
      setState('error')
      setAttempts((n) => n + 1)
      return
    }
    onCreate?.(password)
    setState('saved')
  }
  const dismiss = () => {
    // 卡片卸载前先把焦点交出去，否则键盘焦点会掉回 <body>。
    landNear(section.current)
    setState('dismissed')
  }
  return (
    <AnimatePresence initial={false}>
      {state !== 'dismissed' && (
        <motion.section ref={section} key="prompt" aria-labelledby={`${id}-title`} className={cn('@container relative rounded-[var(--r)] p-5 sm:p-6 print:hidden', surface)} exit={ctx.reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.25, ease }}>
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-[calc(var(--r)*0.6)] text-[color:var(--acc-text)]" style={{ background: 'color-mix(in oklab, var(--acc) 12%, var(--card))' }}>
              <Icon d={ICONS.user} className="size-5" />
            </span>
            <div className="min-w-0 flex-1 pr-8">
              <h2 id={`${id}-title`} className="text-lg leading-snug text-balance" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking }}>
                Save your details for next time
              </h2>
              <p className={cn('mt-1 text-sm leading-relaxed text-pretty', muted)}>Set a password and we keep this address on file. Track deliveries and reorder beans in two taps.</p>
            </div>
            <button type="button" aria-label="Dismiss" onClick={dismiss} className={cn('absolute top-4 right-4 grid size-8 place-items-center rounded-[calc(var(--r)*0.5)] transition-[background-color] duration-200 hover:bg-[color:var(--sunken)] motion-reduce:transition-none', muted, focus)}>
              <Icon d={ICONS.close} />
            </button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {state === 'saved' ? (
              <SavedNote key="saved" reduced={ctx.reduced} />
            ) : (
              <motion.form key="form" onSubmit={(event: FormEvent) => event.preventDefault()} noValidate className="mt-5" exit={ctx.reduced ? { opacity: 0 } : { opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                <div className="grid items-start gap-3 @lg:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor={`${id}-email`} className={cn('mb-1.5 block text-xs font-medium', muted)}>
                      Email
                    </label>
                    {/* 只读但是真的输入框：密码管理器靠它把新密码和账号配对。 */}
                    <input id={`${id}-email`} type="email" name="email" autoComplete="username" readOnly value={ORDER.email} className={cn(field, 'border-transparent bg-[color:var(--sunken)] px-3 text-ellipsis')} />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={`${id}-pw`} className={cn('mb-1.5 block text-xs font-medium', muted)}>
                      Choose a password
                    </label>
                    <span className="relative block">
                      <input
                        ref={input}
                        id={`${id}-pw`}
                        type={visible ? 'text' : 'password'}
                        name="new-password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (state === 'error') setState('idle')
                        }}
                        aria-invalid={state === 'error'}
                        aria-describedby={`${id}-hint`}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          submit()
                        }}
                        className={cn(field, 'bg-[color:var(--card)] pr-10 pl-3', state === 'error' ? 'border-[color:var(--danger)]' : 'border-[color:var(--line)]')}
                      />
                      <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className={cn('absolute top-1 right-1 grid size-8 place-items-center rounded-[calc(var(--r)*0.45)] hover:text-[color:var(--fg)]', muted, focus)}>
                        <Icon d={visible ? ICONS.eyeOff : ICONS.eye} />
                      </button>
                    </span>
                    {/* 规则一直显示在输入框下面，而不是写在占位文字里（一输入就没了，对比度也不够）。 */}
                    <p id={`${id}-hint`} className={cn('mt-1.5 flex items-center gap-1.5 text-xs', state === 'error' ? 'text-[color:var(--danger)]' : muted)}>
                      {state === 'error' && <Icon d={ICONS.alert} className="size-3.5" />}
                      {state === 'error' ? (
                        <span role="alert">
                          Use at least 8 characters{password.length > 0 && ` (${password.length} so far)`}.
                        </span>
                      ) : (
                        'At least 8 characters.'
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col-reverse gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
                  <p className={cn('text-xs', muted)}>No marketing email unless you opt in later.</p>
                  <PrimaryButton onClick={submit}>Create account</PrimaryButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function Referral({ ctx }: { ctx: Ctx }) {
  const { region, fmt, heading: h } = ctx
  const amount = fmt(region.referral).replace(/\.00$/, '')
  const min = fmt(region.minOrder).replace(/\.00$/, '')
  const id = useId()
  return (
    <section data-landing tabIndex={-1} aria-labelledby={id} className={cn('relative overflow-hidden rounded-[var(--r)] border print:hidden', focus)} style={{ background: 'var(--tint)', borderColor: 'var(--tint-line)' }}>
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--acc-text)] uppercase">Refer a friend</p>
          <h2 id={id} className="mt-2 text-[1.35rem] leading-tight" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking }}>
            Give {amount}, get {amount}
          </h2>
          <p className={cn('mt-1.5 text-sm leading-relaxed text-pretty', muted)}>
            Friends take {amount} off a first order over {min}. You get {amount} in credit once theirs ships.
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--acc)] text-[color:var(--on-acc)]">
          <Icon d={ICONS.gift} className="size-5" />
        </span>
      </div>
      {/* 撕票口：两侧半圆缺口 + 虚线。 */}
      <div className="relative border-t border-dashed" style={{ borderColor: 'var(--tint-line)' }}>
        <span aria-hidden className="absolute -top-2.5 -left-2.5 size-5 rounded-full border" style={{ background: 'var(--page)', borderColor: 'var(--tint-line)' }} />
        <span aria-hidden className="absolute -top-2.5 -right-2.5 size-5 rounded-full border" style={{ background: 'var(--page)', borderColor: 'var(--tint-line)' }} />
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          <span className="min-w-0 flex-1">
            <span className={cn('block text-[11px] font-medium tracking-[0.08em] uppercase', muted)}>Your code</span>
            <span className="mt-0.5 block truncate text-lg font-medium tracking-[0.12em]" style={{ fontFamily: MONO }}>
              {ORDER.referralCode}
            </span>
          </span>
          <CopyButton ctx={ctx} target="referral" value={ORDER.referralCode} label="referral code" variant="solid" />
        </div>
      </div>
    </section>
  )
}

function Help({ onContinue, centered }: { onContinue?: () => void; centered?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-4 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between', centered && 'sm:flex-col sm:items-center sm:text-center')}>
      <p data-landing tabIndex={-1} className={cn('max-w-md rounded-[calc(var(--r)*0.4)] text-sm leading-relaxed text-pretty', muted, focus)}>
        Questions about this order? Reply to the receipt email. Lena or Theo will get back to you within one working day.
      </p>
      <div className="flex flex-wrap gap-2 print:hidden">
        <GhostButton onClick={() => window.print()}>
          <Icon d={ICONS.print} />
          Print receipt
        </GhostButton>
        <PrimaryButton onClick={onContinue}>
          Continue shopping
          <Icon d={ICONS.arrow} />
        </PrimaryButton>
      </div>
    </div>
  )
}

function TopBar({ ctx, centered }: { ctx: Ctx; centered?: boolean }) {
  const { heading: h } = ctx
  const steps = ['Cart', 'Details', 'Payment', 'Confirmation']
  return (
    <header className={cn('flex items-center gap-6 border-b border-[color:var(--line)] py-5', centered ? 'justify-center' : 'justify-between')}>
      <span className="flex items-center gap-2.5">
        <Mark />
        <span className="text-lg" style={{ fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.tracking }}>
          {STORE}
        </span>
      </span>
      {!centered && (
        <nav aria-label="Checkout steps" className="hidden md:block print:hidden">
          <ol className={cn('flex items-center gap-2 text-[13px]', muted)}>
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <Icon d="m8 5 5 5-5 5" className="size-3 opacity-60" />}
                <span aria-current={i === steps.length - 1 ? 'step' : undefined} className={cn(i === steps.length - 1 && 'font-medium text-[color:var(--fg)]')}>
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </header>
  )
}

// ---------- 主组件 ----------

/** 下单成功页：订单号、预计送达与四段进度、可折叠摘要、游客注册卡和邀请卡；分栏、单栏、小票三种版式。 */
export function CheckoutOrderConfirmation({ className, style, copied, onCopy, summaryOpen, onSummaryOpenChange, onCreateAccount, onContinueShopping, ...props }: CheckoutOrderConfirmationProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion() === true
  const run = !reduced
  const tone = TONES[o.tone] ?? TONES.paper
  const region = REGIONS[o.currency] ?? REGIONS.usd
  const heading = HEADINGS[o.font] ?? HEADINGS.serif
  const radius = Math.max(0, Math.min(24, o.radius))

  // 颜色全部在 palette() 里算好，以变量传下去。深色底打印出来是白纸上的浅色字：打印时换成纯白底那一套。
  const uid = useId()
  const vars = { ...palette(tone, o.accent), '--r': `${radius}px` } as CSSProperties
  const dark = luminance(rgb(tone.bg)) < 0.2
  const printCss = dark
    ? `@media print{[data-order-root="${uid}"]{${Object.entries(palette(TONES.white, o.accent))
        .map(([k, v]) => `${k}:${v} !important`)
        .join(';')}}}`
    : ''

  const [openState, setOpenState] = useState(true)
  const open = summaryOpen ?? openState
  const toggle = () => {
    const next = !open
    setOpenState(next)
    onSummaryOpenChange?.(next)
  }

  const [feedback, setFeedback] = useState<CopyFeedback | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = (target: CopyTarget, value: string) => {
    void writeClipboard(value).then((ok) => {
      if (ok) onCopy?.(target, value)
      // 两条路都失败（权限被拒、沙箱）也要给反馈：按钮显示 Failed，读屏听到原因。
      setFeedback({ target, ok })
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setFeedback(null), ok ? 1800 : 2800)
    })
  }

  const ctx: Ctx = { run, reduced, heading, fmt: money(region.code), region, feedback, forced: copied ?? null, copy }
  const layout = o.layout

  // 只播报用户真的点过的复制；演示通过 copied 强制显示的状态不出声。
  const what = feedback?.target === 'referral' ? 'referral code' : 'order number'
  const live = (
    <span role="status" aria-live="polite" className="sr-only">
      {feedback && (feedback.ok ? `Copied the ${what}.` : `Couldn't copy the ${what}. Select it and copy it by hand.`)}
    </span>
  )

  const shell = (children: ReactNode) => (
    <section data-order-root={uid} className={cn('w-full bg-[color:var(--page)] text-[color:var(--fg)] antialiased', className)} style={{ ...vars, fontFamily: SANS, ...style }} aria-label="Order confirmation">
      {printCss && <style>{printCss}</style>}
      {children}
      {live}
    </section>
  )

  if (layout === 'receipt') {
    const both = o.showAccountPrompt && o.showReferral
    return shell(
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Reveal run={run} delay={0} className="mx-auto max-w-[460px] [filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.06))_drop-shadow(0_14px_28px_rgb(0_0_0/0.08))]">
          <div
            className="@container rounded-t-[var(--r)] bg-[color:var(--card)] px-5 pt-8 pb-12 sm:px-8"
            style={{
              WebkitMask: 'linear-gradient(#000 0 0) top / 100% calc(100% - 9px) no-repeat, conic-gradient(from -45deg at 50% 100%, #0000, #000 1deg 89deg, #0000 90deg) bottom / 18px 9px repeat-x',
              mask: 'linear-gradient(#000 0 0) top / 100% calc(100% - 9px) no-repeat, conic-gradient(from -45deg at 50% 100%, #0000, #000 1deg 89deg, #0000 90deg) bottom / 18px 9px repeat-x',
            }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="flex items-center gap-2">
                <Mark className="size-5" />
                <span className="text-[15px]" style={{ fontFamily: heading.family, fontWeight: heading.weight, letterSpacing: heading.tracking }}>
                  {STORE}
                </span>
              </span>
              <div className="mt-8">
                <CheckBadge run={run} />
              </div>
              <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[color:var(--acc-text)] uppercase">Payment received</p>
              <h1 className="mt-2 text-[2rem] text-balance sm:text-[2.4rem]" style={{ fontFamily: heading.family, fontWeight: heading.weight, letterSpacing: heading.tracking, lineHeight: 1.05 }}>
                Thank you, {ORDER.customer}.
              </h1>
              <p className={cn('mt-2 text-sm leading-relaxed', muted)}>
                Receipt sent to <span className="text-[color:var(--fg)]">{ORDER.email}</span>
              </p>
              <div className="mt-5 flex items-center gap-1 rounded-[calc(var(--r)*0.7)] bg-[color:var(--sunken)] py-1 pr-1 pl-3">
                <span className={cn('text-xs', muted)}>Order</span>
                <span className="pr-1 text-sm font-medium" style={{ fontFamily: MONO }}>
                  {ORDER.number}
                </span>
                <CopyButton ctx={ctx} target="order" value={ORDER.number} label="order number" />
              </div>
            </div>
            <div className="my-7 border-t-2 border-dashed border-[color:var(--line)]" />
            <Delivery ctx={ctx} bare />
            <div className="my-7 border-t-2 border-dashed border-[color:var(--line)]" />
            <Summary ctx={ctx} open={open} onToggle={toggle} bare />
            <div className="my-7 border-t-2 border-dashed border-[color:var(--line)]" />
            <Details ctx={ctx} columns={2} />
            <div className={cn('mt-8 flex flex-col items-center gap-2', muted)}>
              <Barcode value={ORDER.number} />
              <span className="text-[11px] tracking-[0.3em]" style={{ fontFamily: MONO }}>
                {ORDER.number} · {ORDER.placed.split(' at ')[0].replace(/^[A-Za-z]+, /, '')}
              </span>
            </div>
          </div>
        </Reveal>
        {(o.showAccountPrompt || o.showReferral) && (
          <Reveal run={run} delay={0.25} className={cn('mt-10 grid items-start gap-5 print:hidden', both ? 'md:grid-cols-2' : 'mx-auto max-w-[460px]')}>
            {o.showAccountPrompt && <AccountPrompt ctx={ctx} onCreate={onCreateAccount} />}
            {o.showReferral && <Referral ctx={ctx} />}
          </Reveal>
        )}
        <div className="mt-10">
          <Help onContinue={onContinueShopping} centered />
        </div>
      </div>,
    )
  }

  if (layout === 'stacked') {
    return shell(
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <TopBar ctx={ctx} centered />
        <div className="space-y-6 py-10 sm:py-14">
          <div className="pb-4">
            <Hero ctx={ctx} centered />
          </div>
          <Reveal run={run} delay={0.3}>
            <Delivery ctx={ctx} />
          </Reveal>
          <Reveal run={run} delay={0.38}>
            <Summary ctx={ctx} open={open} onToggle={toggle} />
          </Reveal>
          <Reveal run={run} delay={0.44} className={cn('rounded-[var(--r)] p-5 sm:p-6', surface)}>
            <Details ctx={ctx} />
          </Reveal>
          {o.showAccountPrompt && <AccountPrompt ctx={ctx} onCreate={onCreateAccount} />}
          {o.showReferral && <Referral ctx={ctx} />}
          <div className="pt-4">
            <Help onContinue={onContinueShopping} centered />
          </div>
        </div>
      </div>,
    )
  }

  // split：左边是状态，右边是吸顶的摘要。手机上摘要排在送达卡片之后。
  return shell(
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <TopBar ctx={ctx} />
      <div className="grid gap-6 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-12 lg:py-12">
        <div className="min-w-0 pb-2 lg:col-start-1 lg:row-start-1">
          <Hero ctx={ctx} />
        </div>
        <Reveal run={run} delay={0.3} className="min-w-0 lg:col-start-1 lg:row-start-2">
          <Delivery ctx={ctx} />
        </Reveal>
        <Reveal run={run} delay={0.34} className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-start">
          <Summary ctx={ctx} open={open} onToggle={toggle} />
          {o.showReferral && <Referral ctx={ctx} />}
        </Reveal>
        <Reveal run={run} delay={0.4} className={cn('min-w-0 rounded-[var(--r)] p-5 sm:p-6 lg:col-start-1 lg:row-start-3', surface)}>
          <Details ctx={ctx} />
        </Reveal>
        {o.showAccountPrompt && (
          <div className="min-w-0 lg:col-start-1 lg:row-start-4 lg:self-start print:hidden">
            <AccountPrompt ctx={ctx} onCreate={onCreateAccount} />
          </div>
        )}
      </div>
      <div className="pb-12">
        <Help onContinue={onContinueShopping} />
      </div>
    </div>,
  )
}
