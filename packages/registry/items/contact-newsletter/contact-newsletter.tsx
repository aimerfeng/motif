// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/contact-form-section.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  variant: 'contact',
  density: 'comfortable',
  heading: '',
  subheading: '',
  buttonLabel: '',
  animate: true,
}
/* @motif:end */

export type ContactNewsletterProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
}
const COPY = {
  contact: { heading: 'Tell us what you’re building', subheading: 'A real person reads every message. Share a few details and we’ll come back with next steps, usually within three hours.', button: 'Send message' },
  newsletter: { heading: 'One thoughtful email a month', subheading: 'Product notes, design write-ups and the occasional experiment that went sideways. No tracking pixels, no filler.', button: 'Subscribe' },
}
const TOPICS = ['Sales', 'Support', 'Partnerships', 'Press']
const PEOPLE = ['Chloe Beaumont', 'Ibrahim Yusuf', 'Sofia Marchetti', 'Lucas Ferreira']

/** 按主色亮度选文字色，任意主色上的按钮都读得清。 */
function readable(color: string) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!m) return '#ffffff'
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? '#0b0b10' : '#ffffff'
}

function Avatars({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-1.5">
        {PEOPLE.map((name) => {
          let h = 0
          for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
          return (
            <span key={name} className="grid size-8 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-background" style={{ background: `linear-gradient(135deg, hsl(${h} 70% 58%), hsl(${(h + 50) % 360} 68% 42%))` }} aria-hidden>
              {name.split(' ').map((p) => p[0]).join('')}
            </span>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
const INPUT =
  'w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklab,var(--acc)_65%,var(--border))] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--acc)_18%,transparent)]'

function Info({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-card" style={{ color: 'var(--acc)' }}>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
        </svg>
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  )
}

function Sent({ title, text, again, onAgain }: { title: string; text: string; again: string; onAgain: () => void }) {
  return (
    <motion.div className="flex min-h-72 flex-col items-center justify-center text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <span className="grid size-14 place-items-center rounded-full" style={{ background: 'color-mix(in oklab, var(--acc) 16%, transparent)', color: 'var(--acc)' }}>
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="m5 12.500 4.500 4.500L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
        </svg>
      </span>
      <p className="mt-5 text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{text}</p>
      <button type="button" onClick={onAgain} className="mt-5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        {again}
      </button>
    </motion.div>
  )
}

const PAD: Record<string, string> = { compact: 'py-10 sm:py-14', comfortable: 'py-14 sm:py-20', spacious: 'py-20 sm:py-28' }

/** 联系表单 / 订阅框二合一：表单本地可用（提交后显示成功状态），背景的光斑缓慢漂移。 */
export function ContactNewsletter({ className, style, ...props }: ContactNewsletterProps) {
  const { accent, font, variant, heading, subheading, buttonLabel, density, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const copy = variant === 'newsletter' ? COPY.newsletter : COPY.contact
  const title = heading || copy.heading
  const sub = subheading || copy.subheading
  const button = buttonLabel || copy.button
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [topic, setTopic] = useState('Sales')
  const [name, setName] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (status !== 'idle') return
    setStatus('sending')
    timer.current = setTimeout(() => setStatus('sent'), 900)
  }
  const fg = readable(accent)
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (d: number) => ({ initial: run ? { opacity: 0, y: 18 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, delay: d, ease } })

  const submitButton = (
    <button
      type="submit"
      disabled={status === 'sending'}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-[transform,opacity,box-shadow] outline-none hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--acc)_30%,transparent)] active:scale-[0.98] disabled:opacity-70"
      style={{ background: 'var(--acc)', color: fg, boxShadow: '0 8px 24px -8px color-mix(in oklab, var(--acc) 70%, transparent)' }}
    >
      {status === 'sending' ? (
        <>
          <span className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" aria-hidden />
          Sending
        </>
      ) : (
        <>
          {button}
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </>
      )}
    </button>
  )

  return (
    <section className={cn('relative w-full overflow-hidden text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)]">
      <motion.div aria-hidden className="pointer-events-none absolute top-[6%] left-[8%] size-[26rem] rounded-full opacity-[0.16] blur-3xl" style={{ background: 'var(--acc)' }} animate={run ? { x: [0, 60, -20, 0], y: [0, 30, 60, 0] } : undefined} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="pointer-events-none absolute right-[6%] bottom-[4%] size-[22rem] rounded-full opacity-[0.12] blur-3xl" style={{ background: 'color-mix(in oklab, var(--acc) 55%, #38bdf8)' }} animate={run ? { x: [0, -50, 20, 0], y: [0, -40, -10, 0] } : undefined} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className={cn('relative mx-auto max-w-6xl px-5 sm:px-8', PAD[density] ?? PAD.comfortable)}>
        {variant === 'newsletter' ? (
          <motion.div {...enter(0)} className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl border bg-card" style={{ color: 'var(--acc)', boxShadow: '0 10px 30px -12px color-mix(in oklab, var(--acc) 60%, transparent)' }}>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3.500" y="5.500" width="17" height="13" rx="2.500" />
                <path d="m4.500 7.500 7.500 5.500 7.500-5.500" />
              </svg>
            </span>
            <h2 className="mt-6 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">{sub}</p>
            {status === 'sent' ? (
              <div className="mt-8 rounded-2xl border bg-card/70 px-6 backdrop-blur">
                <Sent title="You’re on the list" text="Check your inbox for a confirmation link. The next issue lands on the first Tuesday." again="Use another address" onAgain={() => setStatus('idle')} />
              </div>
            ) : (
              <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row">
                <label className="sr-only" htmlFor="nl-email">
                  Email address
                </label>
                <input id="nl-email" type="email" required placeholder="you@company.com" className={cn(INPUT, 'h-11 flex-1 py-0')} />
                {submitButton}
              </form>
            )}
            <div className="mt-8 flex justify-center">
              <Avatars label="12,400 readers · Unsubscribe anytime" />
            </div>
          </motion.div>
        ) : (
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <motion.div {...enter(0)} className="lg:pt-4">
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
                Contact
              </p>
              <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
                {title}
              </h2>
              <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">{sub}</p>
              <ul className="mt-9 space-y-5">
                <Info icon="M3.500 6.500A1.500 1.500 0 0 1 5 5h14a1.500 1.500 0 0 1 1.500 1.500v11A1.500 1.500 0 0 1 19 19H5a1.500 1.500 0 0 1-1.500-1.500zM4 7l8 6 8-6" title="Email" text="hello@halcyon.example" />
                <Info icon="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 12.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z" title="Studio" text="Rua da Prata 88, Lisbon" />
                <Info icon="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" title="Hours" text="Monday to Friday, 9:00–18:00 WET" />
              </ul>
              <div className="mt-9">
                <Avatars label="The team usually replies within 3 hours" />
              </div>
            </motion.div>

            <motion.div {...enter(0.12)} className="rounded-2xl border bg-card/80 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-7">
              {status === 'sent' ? (
                <Sent title={`Thanks${name ? `, ${name.split(' ')[0]}` : ''}`} text="Your message is with the team. Expect a reply from a real person, not a ticket number." again="Send another" onAgain={() => setStatus('idle')} />
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name">
                      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amara Osei" className={INPUT} />
                    </Field>
                    <Field label="Work email">
                      <input required type="email" placeholder="amara@northwind.dev" className={INPUT} />
                    </Field>
                  </div>
                  <fieldset>
                    <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Topic</legend>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={topic === t}
                          onClick={() => setTopic(t)}
                          className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring', topic === t ? 'border-transparent text-foreground' : 'text-muted-foreground hover:text-foreground')}
                          style={topic === t ? { background: 'color-mix(in oklab, var(--acc) 20%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--acc) 45%, transparent)' } : undefined}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Field label="Message">
                    <textarea required rows={5} placeholder="We’re migrating a 40-person team off spreadsheets and want to talk about…" className={cn(INPUT, 'resize-none leading-relaxed')} />
                  </Field>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <p className="text-xs text-muted-foreground">We’ll only use your email to reply.</p>
                    {submitButton}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
