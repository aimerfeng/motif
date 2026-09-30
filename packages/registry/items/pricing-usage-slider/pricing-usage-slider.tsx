// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/glassmorphism-pricing-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Pay for the traffic you actually send',
  subline: 'One plan, no seat fees. Slide to your monthly volume and see the bill before you sign up.',
  cta: 'Start with the Scale plan',
  currency: '$',
  basePrice: 29,
  overage: 1.2,
  accent: '#8b7bff',
  tone: 'dark',
  surface: 'glass',
  font: 'geist',
  radius: 28,
}
/* @motif:end */

export type PricingUsageSliderProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：滑块位置 0–1（对数刻度）。不传时组件自己管理。 */
  position?: number
  onPositionChange?: (position: number) => void
}

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.05em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.025em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

/** 把主色的色相转一个角度，得到背景里的第二种光。 */
function shift(hex: string, deg: number) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0
  return `hsl(${(Math.round(h * 60) + deg + 360) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#07080d' : '#f4f2ee',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.64)' : 'rgba(12,13,16,0.62)',
    '--s-ln': dark ? 'rgba(255,255,255,0.14)' : 'rgba(12,13,16,0.12)',
    '--s-cd': dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

const MIN = 1
const MAX = 100
const toRequests = (t: number) => MIN * Math.pow(MAX / MIN, t)
const toPos = (m: number) => Math.log(m / MIN) / Math.log(MAX / MIN)

/** 阶梯计价：2M 以内含在基础价里，超出的部分越多单价越低。 */
function cost(base: number, overage: number, millions: number) {
  const tiers: [number, number, number][] = [
    [2, 10, overage],
    [10, 50, overage * 0.66],
    [50, 100, overage * 0.42],
  ]
  let total = base
  for (const [from, to, rate] of tiers) total += Math.max(0, Math.min(millions, to) - from) * rate
  return total
}

const FEATURES = ['Unlimited projects and seats', '90-day trace retention', 'Rollback timelines', 'SSO on request', 'Priority support in one business day']

function fmtRequests(m: number) {
  return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, '')}M`
}

export function PricingUsageSlider({ className, style, position, onPositionChange, ...props }: PricingUsageSliderProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const [inner, setInner] = useState(0.52)
  const t = Math.min(1, Math.max(0, position ?? inner))
  const millions = toRequests(t)
  const price = cost(o.basePrice, o.overage, millions)
  const effective = price / millions
  const glass = o.surface === 'glass'
  const dark = o.tone === 'dark'
  const second = shift(o.accent, 48)

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      {/* 极光背景：主色加上转了 48° 的第二种光 */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden style={{ background: `radial-gradient(50% 55% at 12% 20%, color-mix(in oklab, var(--s-ac) ${dark ? 42 : 30}%, transparent), transparent), radial-gradient(45% 55% at 92% 78%, color-mix(in oklab, ${second} ${dark ? 34 : 26}%, transparent), transparent), radial-gradient(40% 40% at 60% 0%, color-mix(in oklab, var(--s-ac) 16%, transparent), transparent)` }} />
      <div className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-[clamp(2.1rem,4.8vw,3.5rem)] leading-[1.04]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
            {o.heading}
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
            {o.subline}
          </p>
        </div>

        <div
          className="mt-14 grid overflow-hidden border lg:grid-cols-[1.25fr_1fr]"
          style={{
            borderColor: 'var(--s-ln)',
            borderRadius: `${o.radius}px`,
            background: glass ? 'var(--s-cd)' : dark ? '#0e1016' : '#ffffff',
            backdropFilter: glass ? 'blur(24px) saturate(1.5)' : undefined,
            WebkitBackdropFilter: glass ? 'blur(24px) saturate(1.5)' : undefined,
            boxShadow: `0 40px 100px -40px ${dark ? 'rgba(0,0,0,0.8)' : 'rgba(40,30,90,0.35)'}`,
          }}
        >
          <div className="p-7 sm:p-9">
            <div className="flex items-baseline justify-between">
              <label htmlFor="usage-range" className="text-[14px] font-medium">
                Requests per month
              </label>
              <span className="text-[26px] font-semibold tabular-nums" style={{ fontFamily: font.family, letterSpacing: '-0.03em' }}>
                {fmtRequests(millions)}
              </span>
            </div>

            <div className="relative mt-6 h-8">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ background: 'var(--s-ln)' }}>
                <div className="h-full rounded-full" style={{ width: `${t * 100}%`, background: 'linear-gradient(90deg, color-mix(in oklab, var(--s-ac) 60%, transparent), var(--s-ac))' }} />
              </div>
              {[2, 10, 50].map((m) => (
                <span key={m} className="absolute top-1/2 h-3 w-px -translate-y-1/2" style={{ left: `${toPos(m) * 100}%`, background: 'var(--s-mu)', opacity: 0.4 }} aria-hidden />
              ))}
              <span className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ left: `${t * 100}%`, background: 'var(--s-fg)', borderColor: 'var(--s-ac)', boxShadow: '0 0 0 6px color-mix(in oklab, var(--s-ac) 22%, transparent), 0 6px 16px rgba(0,0,0,0.4)' }} aria-hidden />
              <input
                id="usage-range"
                type="range"
                min={0}
                max={1000}
                step={1}
                value={Math.round(t * 1000)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 1000
                  setInner(v)
                  onPositionChange?.(v)
                }}
                aria-valuetext={`${fmtRequests(millions)} requests, ${o.currency}${Math.round(price)} a month`}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <div className="relative mt-1 h-5 text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
              {[1, 5, 10, 50, 100].map((m) => (
                <span key={m} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${toPos(m) * 100}%`, transform: m === 1 ? 'none' : m === 100 ? 'translateX(-100%)' : undefined }}>
                  {m}M
                </span>
              ))}
            </div>

            <ul className="mt-9 grid gap-3.5 border-t pt-7 sm:grid-cols-2" style={{ borderColor: 'var(--s-ln)' }}>
              {FEATURES.map((f) => (
                <li key={f} className="flex gap-2.5 text-[14px] leading-snug">
                  <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" fill="none" stroke="var(--s-ac)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col justify-between overflow-hidden border-t p-7 sm:p-9 lg:border-t-0 lg:border-l" style={{ borderColor: 'var(--s-ln)', background: 'linear-gradient(160deg, color-mix(in oklab, var(--s-ac) 20%, transparent), transparent 70%)' }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: 'var(--s-mu)' }}>
                Scale plan
              </div>
              <div className="mt-3 flex items-baseline gap-1.5" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
                <span className="text-[26px] opacity-60">{o.currency}</span>
                <span className="text-[68px] leading-none tabular-nums">{Math.round(price)}</span>
                <span className="text-[14px] font-normal tracking-normal" style={{ color: 'var(--s-mu)', fontFamily: BODY }}>
                  / month
                </span>
              </div>
              <dl className="mt-6 space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--s-mu)' }}>Base, includes 2M</dt>
                  <dd className="tabular-nums">
                    {o.currency}
                    {o.basePrice}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--s-mu)' }}>Usage above 2M</dt>
                  <dd className="tabular-nums">
                    {o.currency}
                    {Math.max(0, Math.round(price - o.basePrice))}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-2.5" style={{ borderColor: 'var(--s-ln)' }}>
                  <dt style={{ color: 'var(--s-mu)' }}>Effective rate</dt>
                  <dd className="tabular-nums">
                    {o.currency}
                    {effective.toFixed(2)} per 1M
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-8">
              <span className="flex items-center justify-center px-5 py-3.5 text-[15px] font-medium" style={{ borderRadius: `${Math.min(o.radius, 16)}px`, background: 'var(--s-ac)', color: 'var(--s-on)', boxShadow: '0 12px 30px -10px var(--s-ac)' }}>
                {o.cta}
              </span>
              <p className="mt-3 text-center text-[12px]" style={{ color: 'var(--s-mu)' }}>
                Overage is billed in arrears. Cap it any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
