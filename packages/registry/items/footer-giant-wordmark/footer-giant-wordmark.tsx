// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/footer-01/components/text-hover-effect.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'halcyon',
  tagline: 'Deploy tracing for teams that would rather sleep. Built in Rotterdam, used everywhere.',
  accent: '#22d3ee',
  tone: 'dark',
  font: 'geist',
  layout: 'giant',
  showStatus: true,
  sweep: 0.8,
}
/* @motif:end */

export type FooterGiantWordmarkProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 700, tracking: '-0.06em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 700, tracking: '-0.06em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.03em' },
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
    '--s-bg': dark ? '#07080b' : '#f7f6f2',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.56)' : 'rgba(12,13,16,0.58)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.12)',
    '--s-cd': dark ? 'rgba(255,255,255,0.045)' : 'rgba(12,13,16,0.04)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Product', links: ['Overview', 'Traces', 'Rollbacks', 'Alerts', 'Pricing'] },
  { title: 'Company', links: ['About', 'Customers', 'Careers', 'Press kit'] },
  { title: 'Resources', links: ['Docs', 'API reference', 'Changelog', 'Status'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
]

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <rect width="24" height="24" rx="7" fill="var(--s-ac)" />
      <path d="M6.5 15.5c1.6-4.8 4.2-7 5.5-7s3.9 2.2 5.5 7" stroke="var(--s-on)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="1.5" fill="var(--s-on)" />
    </svg>
  )
}

/** 让巨型字标刚好撑满容器宽度：先按 100px 量一次，再按比例缩放。 */
function useFitFontSize(text: string, family: string, weight: number, tracking: string) {
  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState(160)
  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !probe.current) return
      const w = probe.current.getBoundingClientRect().width
      if (w > 0) setSize(Math.min(420, (box.current.clientWidth / w) * 100))
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (box.current) ro.observe(box.current)
    void document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text, family, weight, tracking])
  return { box, probe, size }
}

export function FooterGiantWordmark({ className, style, ...props }: FooterGiantWordmarkProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const giant = o.layout === 'giant'
  const { box, probe, size } = useFitFontSize(o.brand, font.family, font.weight, font.tracking)
  const glow = useRef<HTMLSpanElement>(null)
  const host = useRef<HTMLElement>(null)
  const pointer = useRef<{ x: number; y: number; until: number } | null>(null)
  const last = useRef(0)

  // 高光自己沿字标来回扫；指针经过时跟着指针，离开 1.5 秒后回到自动扫动。
  useFrameLoop(
    host,
    ({ time }) => {
      last.current = time
      const p = pointer.current && pointer.current.until > time ? pointer.current : null
      const x = p ? p.x : 50 + 46 * Math.sin(time * o.sweep * 0.6)
      const y = p ? p.y : 50 + 12 * Math.sin(time * o.sweep * 0.9 + 1)
      glow.current?.style.setProperty('--fx', `${x}%`)
      glow.current?.style.setProperty('--fy', `${y}%`)
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  const textStyle: CSSProperties = { fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking, fontSize: size, lineHeight: 0.95, whiteSpace: 'nowrap' }
  const mask = 'radial-gradient(ellipse 20% 80% at var(--fx, 50%) var(--fy, 50%), #000 0%, #000 28%, rgba(0,0,0,0.5) 62%, transparent 100%)'

  return (
    <footer
      ref={host}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 pt-20 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <span className="flex items-center gap-2.5 text-[16px] font-semibold" style={{ letterSpacing: '-0.02em' }}>
              <Mark />
              {o.brand}
            </span>
            <p className="mt-4 text-[14px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
              {o.tagline}
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl border p-1.5" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
              <span className="flex-1 px-3 text-[13px]" style={{ color: 'var(--s-mu)' }}>
                you@company.com
              </span>
              <span className="rounded-lg px-3.5 py-2 text-[12.5px] font-medium" style={{ background: 'var(--s-ac)', color: 'var(--s-on)' }}>
                Subscribe
              </span>
            </div>
            <p className="mt-2.5 text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
              One email a month. Unsubscribe in one click.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h3 className="text-[12px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--s-mu)' }}>
                  {c.title}
                </h3>
                <ul className="mt-4 space-y-3 text-[14px]">
                  {c.links.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {giant && (
          <div
            ref={box}
            className="relative mt-20 select-none"
            style={{ height: size * 1.02 }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              pointer.current = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, until: last.current + 1.5 }
            }}
            aria-hidden
          >
            <span ref={probe} className="pointer-events-none invisible absolute top-0 left-0" style={{ ...textStyle, fontSize: 100 }}>
              {o.brand}
            </span>
            <span className="absolute inset-x-0 top-0 block text-center" style={{ ...textStyle, color: 'transparent', WebkitTextStroke: '1.5px color-mix(in oklab, var(--s-fg) 24%, transparent)' }}>
              {o.brand}
            </span>
            <span
              ref={glow}
              className="absolute inset-x-0 top-0 block text-center"
              style={{
                ...textStyle,
                backgroundImage: 'linear-gradient(100deg, var(--s-ac), color-mix(in oklab, var(--s-ac) 62%, #ffffff) 48%, color-mix(in oklab, var(--s-ac) 70%, #a78bfa))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            >
              {o.brand}
            </span>
          </div>
        )}

        <div className={cn('flex flex-wrap items-center justify-between gap-4 border-t py-7 text-[12.5px]', giant ? 'mt-6' : 'mt-16')} style={{ borderColor: 'var(--s-ln)', color: 'var(--s-mu)' }}>
          <span>© 2026 {o.brand}, Inc. All rights reserved.</span>
          {o.showStatus && (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
              <span className="size-1.5 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              All systems normal
            </span>
          )}
          <span className="flex items-center gap-4">
            {[
              <path key="m" d="M3 5.5h14v9H3zM3 6l7 5 7-5" />,
              <path key="r" d="M4 15.5a1 1 0 1 0 0 .01M4 10a6 6 0 0 1 6 6M4 5a11 11 0 0 1 11 11" />,
              <path key="c" d="m7 6-4 4 4 4M13 6l4 4-4 4" />,
            ].map((p, i) => (
              <svg key={i} viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {p}
              </svg>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
