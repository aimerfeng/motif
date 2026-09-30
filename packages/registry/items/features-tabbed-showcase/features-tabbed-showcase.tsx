// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/feature-cards-block.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  eyebrow: 'The support desk',
  heading: 'Answer faster without sounding like a bot',
  subline: 'Relay keeps the customer’s history next to the reply box, so agents spend their time on people, not tabs.',
  accent: '#38bdf8',
  tone: 'dark',
  font: 'geist',
  radius: 26,
  layout: 'right',
  autoplay: true,
  dwell: 4.5,
}
/* @motif:end */

export type FeaturesTabbedShowcaseProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.04em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.02em' },
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
    '--s-sf': dark ? '#0f1117' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.58)' : 'rgba(12,13,16,0.6)',
    '--s-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(12,13,16,0.1)',
    '--s-cd': dark ? 'rgba(255,255,255,0.04)' : 'rgba(12,13,16,0.035)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span className={cn('inline-grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white', className)} style={{ background: `linear-gradient(135deg, hsl(${h} 80% 62%), hsl(${(h + 48) % 360} 75% 45%))` }}>
      {name.slice(0, 1)}
    </span>
  )
}

function Pill({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
      {children}
    </span>
  )
}

function Inbox() {
  const rows: [string, string, string, string, string][] = [
    ['Dana R.', 'Charged twice for the annual plan', 'Hi, I noticed two charges on…', 'Urgent', '#f87171'],
    ['Kofi A.', 'How do I add a teammate?', 'I invited someone but they…', 'How-to', '#60a5fa'],
    ['Lena S.', 'Export to CSV is timing out', 'It worked last week, now…', 'Bug', '#fbbf24'],
    ['Omar B.', 'Invoice needs our VAT number', 'Could you re-issue invoice…', 'Billing', '#a78bfa'],
    ['Yuki T.', 'Thanks, that fixed it', 'Really appreciate the quick…', 'Solved', '#34d399'],
  ]
  return (
    <div className="space-y-1.5">
      {rows.map(([n, s, p, tag, c], i) => (
        <div key={n} className="flex items-center gap-3 rounded-xl border px-3 py-2.5" style={{ borderColor: i === 0 ? 'color-mix(in oklab, var(--s-ac) 50%, transparent)' : 'var(--s-ln)', background: i === 0 ? 'color-mix(in oklab, var(--s-ac) 10%, transparent)' : 'var(--s-cd)' }}>
          <Avatar name={n} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium">{s}</div>
            <div className="truncate text-[11px]" style={{ color: 'var(--s-mu)' }}>
              {n} · {p}
            </div>
          </div>
          <Pill color={c}>{tag}</Pill>
        </div>
      ))}
    </div>
  )
}

function Composer() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <Avatar name="Dana" />
        <div className="max-w-[82%] rounded-2xl rounded-tl-md border px-3.5 py-2.5 text-[12.5px] leading-relaxed" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
          Hi, I noticed two charges on my card for the annual plan on Sep 3. Can you check?
        </div>
      </div>
      <div className="rounded-2xl border p-3.5" style={{ borderColor: 'color-mix(in oklab, var(--s-ac) 45%, transparent)', background: 'var(--s-sf)', boxShadow: '0 0 0 4px color-mix(in oklab, var(--s-ac) 10%, transparent)' }}>
        <div className="mb-2 flex items-center gap-2 text-[10.5px]" style={{ color: 'var(--s-ac)' }}>
          <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
            <path d="M8 1.5 9.4 6 14 7.4 9.4 8.8 8 13.5 6.6 8.8 2 7.4 6.6 6z" />
          </svg>
          Suggested from 3 help articles
        </div>
        <p className="text-[12.5px] leading-relaxed">
          Thanks for flagging this, Dana. I can see the duplicate charge from Sep 3 and have refunded <b>$228.00</b> to your card. It should appear within 3 to 5 business days.
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10.5px]" style={{ color: 'var(--s-mu)' }}>
            Tone: warm · 46 words
          </span>
          <span className="rounded-lg px-3 py-1.5 text-[11.5px] font-medium" style={{ background: 'var(--s-ac)', color: 'var(--s-on)' }}>
            Send reply
          </span>
        </div>
      </div>
    </div>
  )
}

function Routing() {
  const agents: [string, string[], string][] = [
    ['Marisol', ['Billing', 'EU'], '94%'],
    ['Theo', ['API', 'Bugs'], '61%'],
    ['Amara', ['Onboarding'], '38%'],
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-[0.85fr_1.15fr] sm:items-center">
      <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
        <div className="text-[10.5px]" style={{ color: 'var(--s-mu)' }}>
          Incoming · #4821
        </div>
        <div className="mt-1 text-[13px] leading-snug font-medium">Charged twice for the annual plan</div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Pill color="#a78bfa">Billing</Pill>
          <Pill color="#60a5fa">EU</Pill>
          <Pill color="#f87171">Urgent</Pill>
        </div>
      </div>
      <div className="space-y-2">
        {agents.map(([n, skills, score], i) => (
          <div key={n} className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: i === 0 ? 'var(--s-ac)' : 'var(--s-ln)', background: i === 0 ? 'color-mix(in oklab, var(--s-ac) 12%, transparent)' : 'var(--s-cd)' }}>
            <Avatar name={n} />
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium">{n}</div>
              <div className="text-[10.5px]" style={{ color: 'var(--s-mu)' }}>
                {skills.join(' · ')}
              </div>
            </div>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: i === 0 ? 'var(--s-ac)' : 'var(--s-mu)' }}>
              {score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sla() {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
      <div className="relative mx-auto size-[132px]">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--s-ln)" strokeWidth="9" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--s-ac)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * 0.964} ${c}`} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[26px] leading-none font-semibold tabular-nums" style={{ letterSpacing: '-0.03em' }}>
              96.4%
            </div>
            <div className="mt-1 text-[10px]" style={{ color: 'var(--s-mu)' }}>
              within SLA
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          ['First reply', '3m 12s', '-41%'],
          ['Resolution', '2h 08m', '-18%'],
          ['CSAT', '4.8 / 5', '+0.3'],
        ].map(([k, v, d]) => (
          <div key={k} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
            <span style={{ color: 'var(--s-mu)' }}>{k}</span>
            <span className="flex items-baseline gap-2">
              <b className="font-semibold tabular-nums">{v}</b>
              <span className="text-[10.5px]" style={{ color: '#34d399' }}>
                {d}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURES: { title: string; body: string; panel: ReactNode; chrome: string }[] = [
  { title: 'Triage in seconds', body: 'Tickets are tagged, prioritised and deduplicated the moment they arrive.', panel: <Inbox />, chrome: 'Inbox · 24 open' },
  { title: 'Replies that know the account', body: 'Drafts pull from your help center and the customer’s billing history.', panel: <Composer />, chrome: 'Ticket #4821' },
  { title: 'Route by skill, not by turn', body: 'Send each ticket to whoever has solved this kind of problem before.', panel: <Routing />, chrome: 'Routing' },
  { title: 'Reports without exports', body: 'SLA, first reply time and CSAT update live and share as a link.', panel: <Sla />, chrome: 'This week' },
]

export function FeaturesTabbedShowcase({ className, style, ...props }: FeaturesTabbedShowcaseProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const hostRef = useRef<HTMLDivElement>(null)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  // 用户点击后，从点击的那一刻重新计时；自动切换用帧循环给的 time，截图时也能推进。
  const anchor = useRef({ time: 0, index: 0, now: 0, dirty: false })
  const shown = useRef(0)
  const left = o.layout === 'left'

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const a = anchor.current
      a.now = time
      if (a.dirty) {
        a.time = time
        a.dirty = false
      }
      if (!o.autoplay) {
        bars.current.forEach((b, i) => b && (b.style.transform = `scaleX(${i === a.index ? 1 : 0})`))
        if (shown.current !== a.index) setActive((shown.current = a.index))
        return
      }
      const elapsed = Math.max(0, time - a.time)
      const step = Math.floor(elapsed / o.dwell)
      const idx = (a.index + step) % FEATURES.length
      if (idx !== shown.current) setActive((shown.current = idx))
      const p = (elapsed % o.dwell) / o.dwell
      bars.current.forEach((b, i) => b && (b.style.transform = `scaleX(${i === idx ? p : 0})`))
    },
    { reducedMotion: 'static', staticTime: 0.4 },
  )

  const pick = (i: number) => {
    anchor.current.index = i
    anchor.current.dirty = true
    shown.current = i
    setActive(i)
  }

  return (
    <section
      ref={hostRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="max-w-2xl">
          <span className="text-[12px] font-medium tracking-[0.14em] uppercase" style={{ color: 'var(--s-ac)' }}>
            {o.eyebrow}
          </span>
          <h2 className="mt-4 text-balance text-[clamp(2rem,4.4vw,3.3rem)] leading-[1.05]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
            {o.heading}
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
            {o.subline}
          </p>
        </div>

        <div className={cn('mt-14 grid items-stretch gap-8 lg:gap-12', left ? 'lg:grid-cols-[1.15fr_0.85fr]' : 'lg:grid-cols-[0.85fr_1.15fr]')}>
          <div role="tablist" aria-label="Features" className={cn('flex flex-col justify-center', left && 'lg:order-2')}>
            {FEATURES.map((f, i) => {
              const on = i === active
              return (
                <button
                  key={f.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => pick(i)}
                  className="group relative border-t py-5 text-left transition-opacity duration-300 first:border-t-0 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: 'var(--s-ln)', opacity: on ? 1 : 0.55, outlineColor: 'var(--s-ac)' }}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-[12px] tabular-nums" style={{ color: on ? 'var(--s-ac)' : 'var(--s-mu)' }}>
                      0{i + 1}
                    </span>
                    <span className="text-[19px] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                      {f.title}
                    </span>
                  </span>
                  <span className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                    <span className="overflow-hidden">
                      <span className="mt-2 block max-w-sm pl-[30px] text-[14px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
                        {f.body}
                      </span>
                    </span>
                  </span>
                  <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left" style={{ background: 'var(--s-ln)' }} aria-hidden />
                  <span
                    ref={(el) => {
                      bars.current[i] = el
                    }}
                    className="absolute bottom-[-1px] left-0 h-[2px] w-full origin-left"
                    style={{ background: 'var(--s-ac)', transform: 'scaleX(0)' }}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>

          <div
            className={cn('relative overflow-hidden border p-4 sm:p-6', left && 'lg:order-1')}
            style={{
              borderColor: 'var(--s-ln)',
              borderRadius: `${o.radius}px`,
              background: 'radial-gradient(90% 70% at 80% 0%, color-mix(in oklab, var(--s-ac) 34%, transparent), transparent), radial-gradient(70% 60% at 0% 100%, color-mix(in oklab, var(--s-ac) 16%, transparent), transparent), var(--s-cd)',
            }}
          >
            <div className="relative min-h-[380px] overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)', boxShadow: '0 30px 70px -30px rgba(0,0,0,0.55)' }}>
              <div className="flex items-center justify-between border-b px-4 py-2.5 text-[11px]" style={{ borderColor: 'var(--s-ln)', color: 'var(--s-mu)' }}>
                <span className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <i key={i} className="block size-2 rounded-full" style={{ background: 'var(--s-ln)' }} />
                  ))}
                </span>
                <span>{FEATURES[active]!.chrome}</span>
                <span className="w-9" />
              </div>
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  role="tabpanel"
                  aria-hidden={i !== active}
                  className="absolute inset-x-0 top-[41px] bottom-0 p-4 transition-[opacity,transform] duration-500 sm:p-5"
                  style={{ opacity: i === active ? 1 : 0, transform: i === active ? 'none' : 'translateY(10px)', pointerEvents: i === active ? 'auto' : 'none' }}
                >
                  {f.panel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
