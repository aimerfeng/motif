// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/hero-dithering.tsx
// Modified by Motif; see the item's provenance.
import { Dithering } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Halcyon',
  headline: 'Every deploy, traced end to end',
  subline: 'Halcyon stitches logs, traces and rollbacks into one timeline, so the 3 a.m. page takes four minutes instead of forty.',
  cta: 'Start free trial',
  accent: '#22d3ee',
  tone: 'dark',
  font: 'geist',
  radius: 12,
  layout: 'split',
  shape: 'swirl',
  pixel: 2,
  speed: 0.8,
}
/* @motif:end */

export type HeroDitheringOrbProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.05em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.025em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

/** 按背景亮度挑一个可读的前景色，保证任意主色上的按钮文字都清楚。 */
function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#06070a' : '#f6f5f0',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.6)' : 'rgba(12,13,16,0.6)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.11)',
    '--s-cd': dark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.7)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', className)} fill="none" aria-hidden>
      <rect width="24" height="24" rx="7" fill="var(--s-ac)" />
      <path d="M6.5 15.5c1.6-4.8 4.2-7 5.5-7s3.9 2.2 5.5 7" stroke="var(--s-on)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="1.5" fill="var(--s-on)" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

const LINKS = ['Product', 'Changelog', 'Pricing', 'Docs']

const TRACE = [
  { name: 'api-gateway', w: 92, o: 0, tone: 0.9 },
  { name: 'checkout-svc', w: 64, o: 8, tone: 0.65 },
  { name: 'ledger-db', w: 38, o: 30, tone: 0.45 },
  { name: 'notify-worker', w: 26, o: 58, tone: 0.3 },
]

export function HeroDitheringOrb({ className, style, ...props }: HeroDitheringOrbProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const dark = o.tone === 'dark'
  const centered = o.layout === 'centered'
  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  const orb = (
    <div className={cn('relative mx-auto aspect-square w-full', centered ? 'max-w-[520px]' : 'max-w-[560px]')}>
      {/* 光晕：让圆球和背景过渡自然 */}
      <div className="absolute -inset-[12%] rounded-full opacity-45 blur-3xl" style={{ background: 'radial-gradient(circle, var(--s-ac) 0%, transparent 62%)' }} />
      <div className="absolute inset-0 overflow-hidden rounded-full" style={{ boxShadow: '0 0 0 1px var(--s-ln)', borderRadius: '9999px' }}>
        <Dithering
          style={{ width: '100%', height: '100%' }}
          colorBack={dark ? '#05060a' : '#f6f5f0'}
          colorFront={o.accent}
          shape={o.shape as 'swirl'}
          type="4x4"
          size={o.pixel}
          speed={reduced ? 0 : o.speed}
          frame={reduced ? 3000 : 0}
          scale={0.62}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 50%, transparent 58%, ${dark ? '#06070a' : '#f6f5f0'} 100%)` }} />
      </div>
      {/* 悬浮在圆球上的追踪卡片：用 JSX 画的产品界面 */}
      <motion.div
        {...fade(0.5)}
        className="absolute -bottom-3 left-[-4%] w-[62%] min-w-[220px] rounded-2xl border p-3.5 backdrop-blur-xl sm:p-4"
        style={{ borderColor: 'var(--s-ln)', background: dark ? 'rgba(12,14,20,0.72)' : 'rgba(255,255,255,0.82)', boxShadow: dark ? '0 24px 60px -20px rgba(0,0,0,0.8)' : '0 24px 60px -24px rgba(20,20,40,0.35)' }}
      >
        <div className="mb-3 flex items-center justify-between text-[11px]" style={{ color: 'var(--s-mu)' }}>
          <span className="font-medium" style={{ color: 'var(--s-fg)' }}>
            trace 9f3a · POST /checkout
          </span>
          <span className="tabular-nums">412 ms</span>
        </div>
        <div className="space-y-1.5">
          {TRACE.map((t) => (
            <div key={t.name} className="grid grid-cols-[84px_1fr] items-center gap-2 text-[10.5px]" style={{ color: 'var(--s-mu)' }}>
              <span className="truncate">{t.name}</span>
              <span className="relative h-2 rounded-full" style={{ background: 'var(--s-ln)' }}>
                <span className="absolute inset-y-0 rounded-full" style={{ left: `${t.o}%`, width: `${t.w}%`, background: 'var(--s-ac)', opacity: t.tone }} />
              </span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        {...fade(0.65)}
        className="absolute -top-2 right-[-2%] rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-xl"
        style={{ borderColor: 'var(--s-ln)', background: dark ? 'rgba(12,14,20,0.7)' : 'rgba(255,255,255,0.85)', color: 'var(--s-fg)' }}
      >
        <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: '#34d399' }} />
        p95 38 ms
      </motion.div>
    </div>
  )

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="mx-auto flex min-h-[800px] w-full max-w-7xl flex-col px-6 pb-16 sm:px-10">
        <nav className="flex items-center justify-between py-6">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold" style={{ letterSpacing: '-0.02em' }}>
            <Mark />
            {o.brand}
          </span>
          <div className="hidden items-center gap-7 text-[13px] md:flex" style={{ color: 'var(--s-mu)' }}>
            {LINKS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <span className="rounded-full border px-4 py-1.5 text-[13px] font-medium" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
            Sign in
          </span>
        </nav>

        <div className={cn('grid flex-1 items-center gap-12 pt-6', centered ? 'justify-items-center text-center' : 'lg:grid-cols-[1.05fr_0.95fr] lg:gap-8')}>
          <div className={cn('flex flex-col', centered ? 'items-center' : 'items-start')}>
            <motion.span
              {...fade(0)}
              className="mb-7 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[12px]"
              style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', color: 'var(--s-mu)' }}
            >
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--s-ac)', color: 'var(--s-on)' }}>
                New
              </span>
              Rollback timelines are live
            </motion.span>
            <motion.h1
              {...fade(0.08)}
              className={cn('text-balance', centered ? 'max-w-3xl' : 'max-w-xl', o.font === 'serif' ? 'text-[clamp(3rem,7.4vw,5.6rem)] leading-[0.98]' : 'text-[clamp(2.5rem,6vw,4.6rem)] leading-[1.02]')}
              style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}
            >
              {o.headline}
            </motion.h1>
            <motion.p {...fade(0.16)} className={cn('mt-6 text-pretty text-[17px] leading-relaxed', centered ? 'max-w-xl' : 'max-w-md')} style={{ color: 'var(--s-mu)' }}>
              {o.subline}
            </motion.p>
            <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-5 py-3 text-[14px] font-medium"
                style={{ background: 'var(--s-ac)', color: 'var(--s-on)', borderRadius: `${o.radius}px` }}
              >
                {o.cta}
                <Arrow />
              </span>
              <span className="inline-flex items-center gap-2 border px-5 py-3 text-[14px] font-medium" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', borderRadius: `${o.radius}px` }}>
                Read the docs
              </span>
            </motion.div>
            <motion.div {...fade(0.32)} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]" style={{ color: 'var(--s-mu)' }}>
              {['SOC 2 Type II', 'EU data residency', '14-day free trial'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="var(--s-ac)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
          <div className={cn('w-full', centered && 'mt-2')}>{orb}</div>
        </div>
      </div>
    </section>
  )
}
