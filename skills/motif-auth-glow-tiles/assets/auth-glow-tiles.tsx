// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/logins/login-08.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  brandName: 'Larchmont',
  accent: '#3b82f6',
  tone: 'dark',
  cardStyle: 'split',
  tileSize: 36,
  tileGap: 8,
  litCount: 40,
  cycleSeconds: 3,
  glowStrength: 1,
}
/* @motif:end */

export type AuthGlowTilesProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Opts = typeof defaults

const FONT = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, '$&$&')
  const n = parseInt(h.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function contrast(a: [number, number, number], b: [number, number, number]) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const css = ([r, g, b]: [number, number, number], a = 1) => `rgb(${r} ${g} ${b} / ${a})`
/** 把主色向前景色混合，直到在背景上可读（≥ 4.5:1）。 */
function readable(c: [number, number, number], bg: [number, number, number], toward: [number, number, number]) {
  for (let t = 0; t <= 1; t += 0.05) {
    const m = c.map((v, i) => Math.round(v + (toward[i]! - v) * t)) as [number, number, number]
    if (contrast(m, bg) >= 4.5) return m
  }
  return toward
}

const TONES = {
  dark: { bg: '#030712', fg: '#f9fafb', muted: '#9ca3af', border: '#1f2937', field: '#030712', hover: 'rgb(17 24 39 / 0.6)', ring: 'rgb(255 255 255 / 0.05)', card: 'rgb(3 7 18 / 0.86)' },
  light: { bg: '#ffffff', fg: '#111827', muted: '#4b5563', border: '#d1d5db', field: '#ffffff', hover: '#f9fafb', ring: 'rgb(0 0 0 / 0.05)', card: 'rgb(255 255 255 / 0.88)' },
}

/** 按周期序号生成一组固定的随机方格（mulberry32），同一周期每次渲染结果相同。 */
function pick(cycle: number, total: number, count: number) {
  let a = (cycle + 1) * 0x9e3779b9
  const rand = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const min = Math.round(count * 0.5)
  const max = Math.round(count * 1.5)
  const n = Math.min(total, Math.floor(rand() * (max - min + 1)) + min)
  const set = new Set<number>()
  while (set.size < n) set.add(Math.floor(rand() * total))
  return set
}

function useBox(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      if (!e) return
      const { width, height } = e.contentRect
      setBox((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return box
}

function TileField({ o, cycle, accent }: { o: Opts; cycle: number; accent: [number, number, number] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { w, h } = useBox(ref)
  const pitch = o.tileSize + o.tileGap
  const cols = w ? Math.ceil(w / pitch) + 1 : 0
  const rows = h ? Math.ceil(h / pitch) + 1 : 0
  const total = cols * rows
  const selected = useMemo(() => (total ? pick(cycle, total, o.litCount) : new Set<number>()), [cycle, total, o.litCount])
  const t = TONES[o.tone === 'light' ? 'light' : 'dark']
  const s = o.glowStrength
  const dim = `0 1px 3px 0 ${css(accent, 0.1)}, 0 1px 2px -1px ${css(accent, 0.1)}`
  const lit = `0 1px 3px 0 ${css(accent, Math.min(1, 0.5 * s))}, 0 1px 2px -1px ${css(accent, Math.min(1, 0.5 * s))}, 0 0 ${Math.round(10 * s)}px ${css(accent, Math.min(1, 0.32 * s))}`

  const grid = useMemo(
    () =>
      Array.from({ length: rows }, (_, rowIdx) => (
        <div key={`outer-${rowIdx}`}>
          <div className="flex size-full" style={{ gap: o.tileGap }}>
            {Array.from({ length: cols }, (_, colIdx) => {
              const divId = rowIdx * cols + colIdx
              const isSelected = selected.has(divId)
              return (
                <div key={`inner-${rowIdx}-${colIdx}`}>
                  <div className="relative shrink-0 rounded-lg" style={{ width: o.tileSize, height: o.tileSize, boxShadow: `${dim}, 0 0 0 1px ${t.ring}` }}>
                    <div
                      className="absolute inset-0 rounded-[inherit] transition-[opacity] ease-in-out motion-reduce:transition-none"
                      style={{ boxShadow: lit, background: css(accent, 0.05 * s), opacity: isSelected ? 1 : 0, transitionDuration: `${o.cycleSeconds}s` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )),
    [rows, cols, selected, o.tileGap, o.tileSize, o.cycleSeconds, dim, lit, t.ring, accent, s],
  )

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="-mt-2 -ml-2 flex flex-col" style={{ gap: o.tileGap }}>
        {grid}
      </div>
    </div>
  )
}

/* 内联 SVG：通用的 SSO 图标，不使用任何真实品牌标志。 */
function KeyGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="10" r="3.25" />
      <path d="M10.25 10H17.5M14.5 10v2.75M16.75 10v2" />
    </svg>
  )
}
function BuildingGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 17.5V3.5h8v14M12 8h4v9.5M2.5 17.5h15" />
      <path d="M7 6.5h2M7 9.5h2M7 12.5h2" strokeLinecap="round" />
    </svg>
  )
}

const btn = 'relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-sm transition-[background-color,border-color] duration-100 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--agt-acc-ring)] focus-visible:ring-offset-0'

function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className={cn(btn, 'w-full border-[var(--agt-border)] bg-[var(--agt-field)] text-[var(--agt-fg)] hover:bg-[var(--agt-hover)]')}>
      {children}
    </button>
  )
}

export function AuthGlowTiles({ className, style, ...props }: AuthGlowTilesProps) {
  const o: Opts = { ...defaults, ...props }
  const id = useId()
  const host = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)
  const period = Math.max(0.5, o.cycleSeconds)

  useFrameLoop(
    host,
    ({ time }) => {
      const next = Math.floor(time / period)
      setCycle((c) => (c === next ? c : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const t = TONES[o.tone === 'light' ? 'light' : 'dark']
  const accent = rgb(o.accent)
  const bgRgb = rgb(t.bg)
  const link = readable(accent, bgRgb, rgb(t.fg))
  const ink: [number, number, number] = contrast(accent, [255, 255, 255]) >= contrast(accent, [3, 7, 18]) ? [255, 255, 255] : [3, 7, 18]
  const floating = o.cardStyle === 'floating'
  const brand = o.brandName.trim()

  const vars = {
    '--agt-bg': t.bg,
    '--agt-fg': t.fg,
    '--agt-muted': t.muted,
    '--agt-border': t.border,
    '--agt-field': t.field,
    '--agt-hover': t.hover,
    '--agt-link': css(link),
    '--agt-acc': o.accent,
    '--agt-ink': css(ink),
    '--agt-acc-ring': css(accent, 0.35),
  } as CSSProperties

  const linkCls = 'rounded-sm font-medium text-[var(--agt-link)] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--agt-acc-ring)]'
  const inputCls =
    'relative block w-full appearance-none rounded-md border border-[var(--agt-border)] bg-[var(--agt-field)] px-2.5 py-2 text-sm text-[var(--agt-fg)] shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-[var(--agt-muted)]/70 focus:border-[var(--agt-acc)] focus:ring-2 focus:ring-[var(--agt-acc-ring)]'

  const form = (
    <div className="w-full">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--agt-fg)]">{brand ? `Sign in to ${brand}` : 'Sign in'}</h1>
        <p className="text-sm text-[var(--agt-muted)]">
          Do not have an account?{' '}
          <a href="#" className={linkCls}>
            Sign up.
          </a>
        </p>
      </div>
      <form className="mt-12" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={`${id}-email`} className="text-sm font-medium text-[var(--agt-fg)]">
              Email
            </label>
            <input type="email" id={`${id}-email`} name="email" autoComplete="email" placeholder="ana@ferncastle.io" className={cn(inputCls, 'mt-2')} required aria-required="true" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between gap-3">
              <label htmlFor={`${id}-password`} className="text-sm font-medium text-[var(--agt-fg)]">
                Password
              </label>
              <a href="#" className={cn(linkCls, 'text-sm')}>
                Forgot password?
              </a>
            </div>
            <input type="password" id={`${id}-password`} name="password" autoComplete="current-password" placeholder="Password" className={cn(inputCls, 'mt-2')} required aria-required="true" />
          </div>
          <button type="submit" className={cn(btn, 'w-full border-transparent bg-[var(--agt-acc)] font-semibold text-[var(--agt-ink)] hover:brightness-110')}>
            Continue
          </button>
        </div>
      </form>
      <div>
        <div className="mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm text-[var(--agt-muted)]" role="separator">
          <div className="h-px w-full bg-[var(--agt-border)]" />
          <span className="whitespace-nowrap">or</span>
          <div className="h-px w-full bg-[var(--agt-border)]" />
        </div>
        <div className="space-y-4">
          <div className="flex w-full flex-col gap-4 min-[420px]:flex-row">
            <SecondaryButton>
              <span className="inline-flex items-center gap-2">
                <KeyGlyph />
                Login with passkey
              </span>
            </SecondaryButton>
            <SecondaryButton>
              <span className="inline-flex items-center gap-2">
                <BuildingGlyph />
                Login with workspace
              </span>
            </SecondaryButton>
          </div>
          <SecondaryButton>Sign in with SSO</SecondaryButton>
        </div>
        <div className="mt-4">
          <p className="text-xs text-[var(--agt-muted)]">
            By signing in, you agree to our{' '}
            <a href="#" className={linkCls}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className={linkCls}>
              Privacy Policy.
            </a>
          </p>
        </div>
      </div>
    </div>
  )

  if (floating) {
    return (
      <div ref={host} className={cn('relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12', className)} style={{ ...vars, background: t.bg, fontFamily: FONT, ...style }}>
        <TileField o={o} cycle={cycle} accent={accent} />
        <div className="relative w-full max-w-sm rounded-xl border border-[var(--agt-border)] p-6 shadow-xl backdrop-blur-sm sm:p-8" style={{ background: t.card }}>
          {form}
        </div>
      </div>
    )
  }

  return (
    <div ref={host} className={cn('flex min-h-screen w-full', className)} style={{ ...vars, background: t.bg, fontFamily: FONT, ...style }}>
      <main className="relative z-10 flex-1 border-[var(--agt-border)] shadow-xl lg:border-r" style={{ background: t.bg }}>
        <div className="flex h-full flex-col items-center justify-center py-12">
          <div className="w-full px-4 sm:max-w-sm sm:px-0">{form}</div>
        </div>
      </main>
      <div className="relative hidden flex-1 overflow-hidden lg:flex" aria-hidden="true">
        <TileField o={o} cycle={cycle} accent={accent} />
      </div>
    </div>
  )
}
