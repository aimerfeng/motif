// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/cta-03/components/ripple-bg.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  eyebrow: 'Free for 14 days',
  heading: 'Ship the next release with the whole timeline in view',
  subline: 'Connect your repo in two minutes. Your first trace shows up before the coffee is ready.',
  cta: 'Start free trial',
  note: 'No card required. Cancel from settings.',
  accent: '#8b7bff',
  tone: 'dark',
  font: 'geist',
  radius: 32,
  layout: 'centered',
  rings: 6,
  speed: 4,
}
/* @motif:end */

export type CtaRipplePanelProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

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

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#08090c' : '#f7f6f2',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.62)' : 'rgba(12,13,16,0.62)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.12)',
    '--s-panel': dark ? '#0d0f15' : '#ffffff',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

/** 同心圆环，随时间轻轻收放。圆环大小、透明度沿用上游 Ripple 的递增规则。 */
function Rings({ count, speed }: { count: number; speed: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden style={{ maskImage: 'linear-gradient(to top, #000 15%, transparent 88%)', WebkitMaskImage: 'linear-gradient(to top, #000 15%, transparent 88%)' }}>
      {Array.from({ length: count }, (_, i) => {
        const size = 260 + i * 110
        return (
          <div
            key={i}
            className="crp-ring absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: '100%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid color-mix(in oklab, var(--s-ac) 70%, transparent)',
              background: `radial-gradient(closest-side, color-mix(in oklab, var(--s-ac) ${Math.max(6, 24 - i * 3)}%, transparent), transparent 92%)`,
              ['--crp-o' as string]: Math.max(0.2, 1 - i * 0.12),
              animationDelay: `${i * 0.18}s`,
              ['--crp-dur' as string]: `${speed}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export function CtaRipplePanel({ className, style, ...props }: CtaRipplePanelProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const split = o.layout === 'split'
  const btn = { borderRadius: `${Math.min(o.radius, 18)}px` }

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div
          className="relative isolate overflow-hidden border px-6 py-20 sm:px-14 sm:py-24"
          style={{ borderColor: 'var(--s-ln)', borderRadius: `${o.radius}px`, background: 'var(--s-panel)', boxShadow: '0 40px 100px -50px color-mix(in oklab, var(--s-ac) 55%, transparent)' }}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3" aria-hidden style={{ background: 'radial-gradient(60% 100% at 50% 100%, color-mix(in oklab, var(--s-ac) 38%, transparent), transparent)' }} />
          <Rings count={o.rings} speed={o.speed} />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden style={{ backgroundImage: 'linear-gradient(var(--s-ln) 1px, transparent 1px), linear-gradient(90deg, var(--s-ln) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(60% 70% at 50% 40%, #000, transparent)', WebkitMaskImage: 'radial-gradient(60% 70% at 50% 40%, #000, transparent)' }} />

          <div className={cn('relative mx-auto', split ? 'grid max-w-5xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]' : 'flex max-w-3xl flex-col items-center text-center')}>
            <div className={cn(split ? 'text-left' : 'text-center')}>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]" style={{ borderColor: 'var(--s-ln)', color: 'var(--s-mu)' }}>
                <span className="size-1.5 rounded-full" style={{ background: 'var(--s-ac)', boxShadow: '0 0 10px var(--s-ac)' }} />
                {o.eyebrow}
              </span>
              <h2 className="mt-6 text-balance text-[clamp(2.1rem,5vw,3.8rem)] leading-[1.03]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
                {o.heading}
              </h2>
              <p className={cn('mt-5 text-pretty text-[16px] leading-relaxed', !split && 'mx-auto max-w-xl')} style={{ color: 'var(--s-mu)' }}>
                {o.subline}
              </p>
            </div>

            {split ? (
              <div className="w-full rounded-2xl border p-2" style={{ borderColor: 'var(--s-ln)', background: 'color-mix(in oklab, var(--s-bg) 70%, transparent)', backdropFilter: 'blur(10px)' }}>
                <div className="px-3 pt-2 pb-3 text-[12.5px]" style={{ color: 'var(--s-mu)' }}>
                  Work email
                </div>
                <div className="mx-1 mb-2 rounded-xl border px-4 py-3 text-[14px]" style={{ borderColor: 'var(--s-ln)', color: 'var(--s-mu)' }}>
                  you@company.com
                </div>
                <span className="mx-1 mb-1 flex items-center justify-center px-5 py-3 text-[14px] font-medium" style={{ ...btn, background: 'var(--s-ac)', color: 'var(--s-on)', boxShadow: '0 10px 30px -10px var(--s-ac)' }}>
                  {o.cta}
                </span>
                <p className="px-3 pt-2 pb-2 text-center text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
                  {o.note}
                </p>
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium" style={{ ...btn, background: 'var(--s-ac)', color: 'var(--s-on)', boxShadow: '0 10px 30px -10px var(--s-ac)' }}>
                    {o.cta}
                  </span>
                  <span className="inline-flex items-center border px-6 py-3.5 text-[15px] font-medium" style={{ ...btn, borderColor: 'var(--s-ln)', background: 'transparent' }}>
                    Book a walkthrough
                  </span>
                </div>
                <p className="text-[12.5px]" style={{ color: 'var(--s-mu)' }}>
                  {o.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
