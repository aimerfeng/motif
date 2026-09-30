// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/navbar/default.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Halcyon',
  cta: 'Get started',
  accent: '#7c8cff',
  tone: 'dark',
  radius: 999,
  blur: 16,
  layout: 'floating',
}
/* @motif:end */

export type NavbarFloatingMenuProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前高亮的导航项（null 表示没有）。不传时由指针悬停决定。 */
  active?: string | null
  onActiveChange?: (id: string | null) => void
}

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bar': dark ? 'rgba(14,16,22,0.72)' : 'rgba(255,255,255,0.78)',
    '--s-pop': dark ? '#0f1117' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.62)' : 'rgba(12,13,16,0.62)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.11)',
    '--s-cd': dark ? 'rgba(255,255,255,0.06)' : 'rgba(12,13,16,0.05)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <rect width="24" height="24" rx="7" fill="var(--s-ac)" />
      <path d="M6.5 15.5c1.6-4.8 4.2-7 5.5-7s3.9 2.2 5.5 7" stroke="var(--s-on)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="1.5" fill="var(--s-on)" />
    </svg>
  )
}

const LINKS: { id: string; label: string; menu?: boolean }[] = [
  { id: 'products', label: 'Products', menu: true },
  { id: 'solutions', label: 'Solutions' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'docs', label: 'Docs' },
]

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const MENU: { title: string; body: string; icon: ReactNode }[] = [
  { title: 'Traces', body: 'Follow one request across every service.', icon: <Icon d="M3 5h6v4H3zM11 11h6v4h-6zM9 7h2a2 2 0 0 1 2 2v2" /> },
  { title: 'Rollbacks', body: 'Undo a bad release in one click, with a paper trail.', icon: <Icon d="M4 8V4M4 8h4M4 8a6 6 0 1 1-1 4" /> },
  { title: 'Alerts', body: 'Pages that arrive with the deploy that caused them.', icon: <Icon d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 0 0 10 3zM8.5 15.5a1.5 1.5 0 0 0 3 0" /> },
]

export function NavbarFloatingMenu({ className, style, active: controlled, onActiveChange, ...props }: NavbarFloatingMenuProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const [inner, setInner] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const active = controlled !== undefined ? controlled : inner
  const set = (id: string | null) => {
    setInner(id)
    onActiveChange?.(id)
  }
  const floating = o.layout === 'floating'
  const menuOpen = active === 'products'
  const t = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <header className={cn('relative z-50 w-full', floating ? 'px-4 pt-4 sm:px-6' : '', className)} style={{ ...palette(o.tone, o.accent), color: 'var(--s-fg)', fontFamily: BODY, ...style }} onPointerLeave={() => controlled === undefined && set(null)}>
      <div className={cn('relative mx-auto', floating ? 'max-w-5xl' : 'max-w-none')}>
        <nav
          aria-label="Main"
          className={cn('flex items-center justify-between gap-4 border', floating ? 'px-3 py-2.5 pl-5' : 'border-x-0 border-t-0 px-6 py-3.5 sm:px-10')}
          style={{
            borderColor: 'var(--s-ln)',
            background: 'var(--s-bar)',
            backdropFilter: `blur(${o.blur}px) saturate(1.4)`,
            WebkitBackdropFilter: `blur(${o.blur}px) saturate(1.4)`,
            borderRadius: floating ? `${o.radius}px` : 0,
            boxShadow: floating ? '0 18px 50px -24px rgba(0,0,0,0.55)' : undefined,
          }}
        >
          <span className="flex items-center gap-2.5 text-[15px] font-semibold" style={{ letterSpacing: '-0.02em' }}>
            <Mark />
            {o.brand}
          </span>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.id} className="relative">
                <button
                  type="button"
                  aria-expanded={l.menu ? menuOpen : undefined}
                  onPointerEnter={() => controlled === undefined && set(l.id)}
                  onFocus={() => controlled === undefined && set(l.id)}
                  className="relative flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: active === l.id ? 'var(--s-fg)' : 'var(--s-mu)', outlineColor: 'var(--s-ac)' }}
                >
                  {active === l.id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full" style={{ background: 'var(--s-cd)' }} transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.3, bounce: 0.15 }} />}
                  <span className="relative">{l.label}</span>
                  {l.menu && (
                    <svg viewBox="0 0 12 12" className="relative size-3 transition-transform duration-200" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m3 4.5 3 3 3-3" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden px-3 py-2 text-[13.5px] font-medium sm:block" style={{ color: 'var(--s-mu)' }}>
              Sign in
            </span>
            <span className="hidden px-4 py-2 text-[13.5px] font-medium sm:block" style={{ background: 'var(--s-ac)', color: 'var(--s-on)', borderRadius: `${Math.min(o.radius, 999)}px` }}>
              {o.cta}
            </span>
            <button type="button" aria-label="Menu" aria-expanded={mobile} onClick={() => setMobile((m) => !m)} className="grid size-9 place-items-center rounded-full border md:hidden" style={{ borderColor: 'var(--s-ln)' }}>
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                <path d={mobile ? 'M5 5l10 10M15 5 5 15' : 'M4 7h12M4 13h12'} />
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : -8, scale: reduced ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : -6 }}
              transition={t}
              className="absolute top-full left-1/2 z-10 mt-3 hidden w-[min(680px,94%)] origin-top -translate-x-1/2 grid-cols-[1.1fr_0.9fr] gap-2 border p-2 md:grid"
              style={{ borderColor: 'var(--s-ln)', background: 'var(--s-pop)', borderRadius: `${Math.min(o.radius, 28)}px`, boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7)' }}
            >
              <ul className="p-1">
                {MENU.map((m, i) => (
                  <li key={m.title} className="flex gap-3 rounded-xl p-3" style={{ background: i === 0 ? 'var(--s-cd)' : undefined }}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border" style={{ borderColor: 'var(--s-ln)', color: 'var(--s-ac)', background: 'var(--s-cd)' }}>
                      {m.icon}
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-semibold">{m.title}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: 'var(--s-mu)' }}>
                        {m.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="relative overflow-hidden rounded-xl p-4" style={{ background: 'radial-gradient(90% 80% at 100% 0%, color-mix(in oklab, var(--s-ac) 55%, transparent), transparent), radial-gradient(70% 70% at 0% 100%, color-mix(in oklab, var(--s-ac) 22%, transparent), transparent), var(--s-cd)' }}>
                <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: 'var(--s-ac)', color: 'var(--s-on)' }}>
                  New
                </span>
                <div className="mt-3 text-[15px] leading-snug font-semibold" style={{ letterSpacing: '-0.015em' }}>
                  Deploy timelines you can share with a link
                </div>
                <div className="mt-2 text-[12.5px] leading-snug" style={{ color: 'var(--s-mu)' }}>
                  Read the September release notes
                </div>
                <div className="absolute right-3 bottom-3 flex items-end gap-1" aria-hidden>
                  {[10, 18, 13, 24].map((h, i) => (
                    <span key={i} className="w-1.5 rounded-full" style={{ height: h, background: 'var(--s-ac)', opacity: 0.5 + i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mobile && (
          <ul className="mt-2 border p-2 md:hidden" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-pop)', borderRadius: `${Math.min(o.radius, 24)}px` }}>
            {LINKS.map((l) => (
              <li key={l.id} className="rounded-lg px-3 py-2.5 text-[14px] font-medium">
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
