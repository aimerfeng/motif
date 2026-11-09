// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/hero/hero-section-text-hover.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  phraseOne: 'Uncharted Adventures',
  phraseTwo: 'Feel Alive',
  ctaLabel: 'Begin your journey',
  accent: '#38bdf8',
  accentTwo: '#f97316',
  stickerCount: 4,
  spread: 1,
  spin: 1,
  overshoot: 1.8,
  autoplay: true,
}
/* @motif:end */

export type HeroStickerHeadlineProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制某个短语处于「悬停」状态（演示的自动播放用）；undefined 时只响应真实指针和焦点。 */
  active?: number | null
  onCta?: () => void
}

type Opts = {
  phraseOne: string
  phraseTwo: string
  ctaLabel: string
  accent: string
  accentTwo: string
  stickerCount: number
  spread: number
  spin: number
  overshoot: number
}

/**
 * 上游的 Tailwind 位置类换算成 em（以 md 断点、24px 字号为基准），这样贴纸随标题字号一起缩放。
 * side: 'start' 相对短语左端，'end' 相对短语右端。rest 是静止时的旋转；hover 是悬停时的位移和旋转。
 */
interface Sticker {
  icon: ReactNode
  side: 'start' | 'end'
  x: number
  y: number
  rest: number
  tx: number
  ty: number
  rot: number
}

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

/** 亮色强调色直接当文字会看不清：按亮度往前景色里混一些。 */
function readable(hex: string) {
  const l = luminance(hex)
  const keep = l > 0.6 ? 50 : l > 0.35 ? 62 : l > 0.18 ? 80 : 100
  return keep === 100 ? hex : `color-mix(in oklab, ${hex} ${keep}%, var(--color-foreground, #18181b))`
}

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 40 40" width="1em" height="1em" aria-hidden="true" style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 2px rgb(0 0 0 / 0.18))' }}>
    <g stroke="#fff" strokeWidth="3.2" strokeLinejoin="round" paintOrder="stroke">
      {children}
    </g>
  </svg>
)

const Parachute = () => (
  <Svg>
    <path d="M4 18a16 13 0 0 1 32 0z" fill="#ef4444" />
    <path d="M14 18a6 13 0 0 1 12 0z" fill="#fde68a" stroke="none" />
    <path d="M5 18l13 13M35 18L22 31M20 18v13" stroke="#57534e" strokeWidth="1" fill="none" />
    <rect x="17" y="30" width="6" height="7" rx="2" fill="#2563eb" />
  </Svg>
)
const Umbrella = () => (
  <Svg>
    <path d="M4 34h32v3H4z" fill="#fcd34d" />
    <path d="M20 10v24" stroke="#78350f" strokeWidth="1.6" />
    <path d="M5 16a15 11 0 0 1 30 0q-3.75-3-7.5 0q-3.75-3-7.5 0q-3.75-3-7.5 0q-3.75-3-7.5 0z" fill="#f472b6" />
    <path d="M20 5a6 11 0 0 0-5 11q2.5-3 5 0q2.5-3 5 0a6 11 0 0 0-5-11z" fill="#fff" stroke="none" />
  </Svg>
)
const Helicopter = () => (
  <Svg>
    <path d="M6 8h28" stroke="#334155" strokeWidth="2" />
    <path d="M20 8v6" stroke="#334155" strokeWidth="2" />
    <path d="M10 22a9 8 0 0 1 9-8h4a7 7 0 0 1 0 14h-4a9 8 0 0 1-9-6z" fill="#facc15" />
    <path d="M29 20h8l1-5" fill="none" stroke="#facc15" strokeWidth="3" />
    <path d="M22 16h3a4 4 0 0 1 4 4v2h-7z" fill="#7dd3fc" stroke="none" />
    <path d="M13 33h16M16 28v5M26 28v5" stroke="#334155" strokeWidth="1.8" fill="none" />
  </Svg>
)
const Pagoda = () => (
  <Svg>
    <path d="M20 3l9 7H11z" fill="#dc2626" />
    <rect x="15" y="10" width="10" height="6" fill="#fef3c7" />
    <path d="M7 19l4-3h18l4 3z" fill="#dc2626" />
    <rect x="12" y="19" width="16" height="8" fill="#fef3c7" />
    <path d="M4 30l5-3h22l5 3z" fill="#dc2626" />
    <rect x="9" y="30" width="22" height="7" fill="#fef3c7" />
    <rect x="18" y="31" width="4" height="6" fill="#78350f" stroke="none" />
  </Svg>
)
const Raccoon = () => (
  <Svg>
    <path d="M8 6l6 8M32 6l-6 8" stroke="#57534e" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="20" cy="22" rx="14" ry="12" fill="#a8a29e" />
    <path d="M7 20q6-5 13 0q7-5 13 0q-6 6-13 1q-7 5-13-1z" fill="#292524" stroke="none" />
    <circle cx="14" cy="20" r="1.8" fill="#fff" stroke="none" />
    <circle cx="26" cy="20" r="1.8" fill="#fff" stroke="none" />
    <ellipse cx="20" cy="28" rx="5" ry="4" fill="#f5f5f4" stroke="none" />
    <circle cx="20" cy="27" r="1.5" fill="#292524" stroke="none" />
  </Svg>
)
const Noodles = () => (
  <Svg>
    <path d="M28 4L18 20M34 6L22 21" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 20h32a16 14 0 0 1-32 0z" fill="#f97316" />
    <path d="M6 20q3-4 6 0q3-4 6 0q3-4 6 0q3-4 6 0q3-4 6 0" fill="none" stroke="#fde68a" strokeWidth="2" />
    <circle cx="13" cy="17" r="3" fill="#fff" stroke="none" />
    <circle cx="13" cy="17" r="1.3" fill="#facc15" stroke="none" />
    <path d="M10 27h20" stroke="#fff" strokeWidth="1.5" />
  </Svg>
)
const Island = () => (
  <Svg>
    <path d="M2 34q9-4 18 0t18 0v4H2z" fill="#38bdf8" />
    <path d="M8 33q12-10 24 0z" fill="#fcd34d" />
    <path d="M20 29q1-10 4-18" fill="none" stroke="#92400e" strokeWidth="2.4" />
    <path d="M24 11q-8-4-14 2q7-1 14-2zM24 11q8-5 13 2q-7-2-13-2zM24 11q-3-6-9-7q5 4 9 7zM24 11q3-7 10-6q-6 2-10 6z" fill="#22c55e" />
  </Svg>
)
const Diamond = () => (
  <Svg>
    <path d="M11 8h18l7 9-16 19L4 17z" fill="#22d3ee" />
    <path d="M4 17h32M11 8l5 9 4-9 4 9 5-9M16 17l4 19 4-19" fill="none" stroke="#0e7490" strokeWidth="1" />
    <path d="M13 10l-4 6h5z" fill="#fff" stroke="none" opacity="0.8" />
  </Svg>
)

const DESTINATIONS: Sticker[] = [
  { icon: <Parachute />, side: 'start', x: -4.67, y: -0.08, rest: 0, tx: 0, ty: -2, rot: -10 },
  { icon: <Umbrella />, side: 'start', x: -5.6, y: -0.08, rest: 0, tx: -1.67, ty: 0, rot: -20 },
  { icon: <Helicopter />, side: 'end', x: -1.9, y: -0.04, rest: 0, tx: 0, ty: -1.67, rot: 10 },
  { icon: <Pagoda />, side: 'end', x: -2.7, y: -0.08, rest: 0, tx: 2.67, ty: 0, rot: 20 },
]

const TREASURES: Sticker[] = [
  { icon: <Raccoon />, side: 'start', x: -6.67, y: -2.67, rest: -30, tx: 0, ty: -1.33, rot: -30 },
  { icon: <Noodles />, side: 'start', x: -7.33, y: -0.04, rest: 0, tx: 0, ty: 0, rot: -45 },
  { icon: <Island />, side: 'end', x: 2.9, y: -2.92, rest: 30, tx: 0, ty: 0, rot: 30 },
  { icon: <Diamond />, side: 'end', x: 2.9, y: -0.04, rest: 0, tx: 0, ty: 0, rot: 45 },
]

/** 每个短语先放哪几张（数量少时保留左右各一张）。 */
const ORDER = [0, 2, 1, 3]

function Phrase({
  text,
  color,
  stickers,
  on,
  opts,
  reduced,
  onHover,
}: {
  text: string
  color: string
  stickers: Sticker[]
  on: boolean
  opts: Opts
  reduced: boolean
  onHover: (on: boolean) => void
}) {
  const count = Math.max(1, Math.min(4, Math.round(opts.stickerCount)))
  const shown = ORDER.slice(0, count).sort((a, b) => a - b)
  return (
    <div
      className="group/hero relative flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      tabIndex={0}
      data-active={on}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="whitespace-nowrap text-zinc-500 transition-colors duration-300" style={on ? { color } : undefined}>
        {text}
      </span>
      <div
        aria-hidden="true"
        className={cn('absolute inset-0 cursor-pointer transition-opacity duration-[400ms]', on ? 'opacity-100' : 'opacity-0')}
      >
        {shown.map((i) => {
          const s = stickers[i]!
          const rest = s.rest * opts.spin
          const transform = on
            ? `translate(${s.tx * opts.spread}em, ${s.ty * opts.spread}em) rotate(${s.rot * opts.spin}deg) scale(1.1)`
            : `rotate(${rest}deg)`
          return (
            <span
              key={i}
              className="pointer-events-none absolute text-[1.5em] leading-none"
              style={{
                left: s.side === 'start' ? `${s.x / 1.5}em` : `calc(100% + ${s.x / 1.5}em)`,
                top: `${s.y / 1.5}em`,
                transform,
                transitionProperty: 'transform',
                transitionDuration: reduced ? '0ms' : '300ms',
                transitionTimingFunction: `cubic-bezier(0.5, ${opts.overshoot}, 0.4, 1)`,
              }}
            >
              {s.icon}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function HeroStickerHeadline({ className, style, active, onCta, ...props }: HeroStickerHeadlineProps) {
  const opts = { ...defaults, ...props } as Opts
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)
  const current = active === undefined ? hovered : active
  const set = (i: number) => (on: boolean) => setHovered((prev) => (on ? i : prev === i ? null : prev))

  return (
    <div
      className={cn('relative min-h-[100px] w-full overflow-x-clip rounded-2xl border border-border bg-background py-12 md:min-h-[200px]', className)}
      style={style}
    >
      <div className="mb-2 flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center justify-center p-5 text-base font-bold sm:text-2xl md:text-4xl">
          <div className="mt-5 mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" className="fill-zinc-900 text-white" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
              <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
              <path d="M9 3v15M15 6v15" fill="none" />
            </svg>
          </div>
          <h1 className="m-0 flex flex-col items-center text-[1em] font-bold">
            <span className="flex items-center justify-center gap-[0.25em]">
              <span className="text-muted-foreground">Embark on</span>
              <Phrase text={opts.phraseOne} color={readable(opts.accent)} stickers={DESTINATIONS} on={current === 0} opts={opts} reduced={reduced} onHover={set(0)} />
            </span>
            <span className="flex items-center justify-center gap-[0.25em]">
              <span className="text-muted-foreground">and</span>
              <Phrase text={opts.phraseTwo} color={readable(opts.accentTwo)} stickers={TREASURES} on={current === 1} opts={opts} reduced={reduced} onHover={set(1)} />
            </span>
          </h1>
        </div>
        <button
          className="cursor-pointer rounded-3xl bg-yellow-400 px-4 py-2 font-mono tracking-tighter text-zinc-900 transition-colors hover:bg-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          type="button"
          onClick={onCta}
        >
          {opts.ctaLabel}
        </button>
      </div>
    </div>
  )
}
