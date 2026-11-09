// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/cta-hero-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  headline: 'Transform Your Business Today',
  accent: '#7c5cff',
  secondary: '#a855f7',
  tone: 'dark',
  mediaSide: 'right',
  showChips: true,
  floatAmplitude: 10,
}
/* @motif:end */

export type HeroVideoPreviewProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONT = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

const TONES = {
  dark: { bg: '#09090b', fg: '#fafafa', muted: '#a1a1aa', card: '#141417', border: 'rgba(255,255,255,0.1)', chip: 'rgba(9,9,11,0.8)', soft: 'rgba(255,255,255,0.05)' },
  light: { bg: '#ffffff', fg: '#09090b', muted: '#52525b', card: '#ffffff', border: 'rgba(9,9,11,0.1)', chip: 'rgba(255,255,255,0.85)', soft: 'rgba(9,9,11,0.04)' },
} as const

type RGB = [number, number, number]

function rgb(hex: string): RGB {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function lum(c: RGB) {
  const l = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
}
function contrast(a: RGB, b: RGB) {
  const x = lum(a)
  const y = lum(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
function rgba(hex: string, a: number) {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}
/** Ink for text on a solid color fill: whichever of white / near-black contrasts more. */
function onColor(hex: string) {
  const c = rgb(hex)
  return contrast(c, [255, 255, 255]) >= contrast(c, [9, 9, 11]) ? '#ffffff' : '#09090b'
}
/** Mix a color toward the page ink until it reads as text on the page background. */
function readable(hex: string, bg: string, ink: string) {
  const c = rgb(hex)
  const b = rgb(bg)
  const k = rgb(ink)
  for (let t = 0; t <= 1.001; t += 0.1) {
    const m = c.map((v, i) => Math.round(v + (k[i] - v) * t)) as RGB
    if (contrast(m, b) >= 4.5) return `rgb(${m[0]},${m[1]},${m[2]})`
  }
  return ink
}

type IconProps = { className?: string; style?: CSSProperties }

const Icon = ({ children, className, style }: IconProps & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} style={style}>
    {children}
  </svg>
)
const Sparkles = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </Icon>
)
const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)
const CheckCircle2 = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
)
const Zap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </Icon>
)
const Play = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
  </svg>
)

const benefits = ['No credit card required', 'Cancel anytime', 'Free 14-day trial']
const people = ['MK', 'JR', 'AL', 'SO']
const stats = [
  { label: 'Users', value: '50K+' },
  { label: 'Rating', value: '4.9★' },
  { label: 'Countries', value: '120+' },
]

export function HeroVideoPreview({ className, style, ...props }: HeroVideoPreviewProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const [email, setEmail] = useState('')
  const [isVideoHovered, setIsVideoHovered] = useState(false)
  const id = useId()
  const t = TONES[o.tone as keyof typeof TONES] ?? TONES.dark
  const accentInk = onColor(o.accent)
  const accentText = readable(o.accent, t.bg, t.fg)
  const secondaryText = readable(o.secondary, t.bg, t.fg)
  const amp = o.floatAmplitude
  const mediaLeft = o.mediaSide === 'left'
  // The last word of the headline gets the accent gradient, like upstream's "Today".
  const words = o.headline.trim().split(/\s+/)
  const lead = words.slice(0, -1).join(' ')
  const tail = words[words.length - 1] ?? ''

  const loop = (animate: TargetAndTransition, transition: Transition) => (reduced ? {} : { animate, transition })
  const enter = (initial: TargetAndTransition, transition: Transition) =>
    reduced ? { initial: false as const } : { initial, animate: { opacity: 1, x: 0, y: 0, scale: 1 }, transition }

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden px-4 py-16 md:py-24 lg:py-32', className)}
      style={{ background: `linear-gradient(to bottom, ${rgba(o.accent, 0.06)}, ${t.bg} 50%, ${t.bg})`, color: t.fg, fontFamily: FONT, ...style }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <motion.div
          {...loop({ scale: [1, 1.2, 1], rotate: [0, 180, 360], opacity: [0.3, 0.5, 0.3] }, { duration: 25, repeat: Infinity, ease: 'linear' })}
          className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full blur-3xl md:h-[600px] md:w-[600px]"
          style={{ background: rgba(o.accent, 0.3), opacity: 0.4 }}
        />
        <motion.div
          {...loop({ scale: [1.2, 1, 1.2], rotate: [360, 180, 0], opacity: [0.3, 0.5, 0.3] }, { duration: 20, repeat: Infinity, ease: 'linear' })}
          className="absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full blur-3xl md:h-[600px] md:w-[600px]"
          style={{ background: rgba(o.secondary, 0.25), opacity: 0.4 }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <motion.div
            {...enter({ opacity: 0, x: mediaLeft ? 50 : -50 }, { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] })}
            className={cn('flex min-w-0 flex-col justify-center', mediaLeft && 'lg:order-2')}
          >
            <motion.div {...enter({ opacity: 0, y: 20 }, { delay: 0.2 })}>
              <span
                className="mb-4 inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold md:mb-6"
                style={{ background: t.soft, border: `1px solid ${t.border}`, color: t.fg }}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Limited Time Offer
              </span>
            </motion.div>

            <motion.h1
              {...enter({ opacity: 0, y: 20 }, { delay: 0.3 })}
              className="mb-4 text-balance break-words text-4xl font-bold tracking-tight md:mb-6 md:text-5xl lg:text-6xl"
            >
              {lead && (
                <>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${t.fg}, ${rgba(t.fg, 0.75)})` }}>
                    {lead}
                  </span>{' '}
                </>
              )}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${accentText}, ${secondaryText})` }}>
                {tail}
              </span>
            </motion.h1>

            <motion.p {...enter({ opacity: 0, y: 20 }, { delay: 0.4 })} className="mb-6 text-base md:mb-8 md:text-lg lg:text-xl" style={{ color: t.muted }}>
              Join thousands of teams using Relaywise to route requests, review changes in one place, and ship releases on schedule.
            </motion.p>

            {/* Email signup form */}
            <motion.form {...enter({ opacity: 0, y: 20 }, { delay: 0.5 })} className="mb-6 md:mb-8" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email address
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 min-w-0 flex-1 rounded-md bg-transparent px-3 text-base outline-none transition-[box-shadow] focus-visible:ring-2 md:h-14"
                  style={{ border: `1px solid ${t.border}`, color: t.fg, ['--tw-ring-color' as string]: rgba(o.accent, 0.6) }}
                />
                <button
                  type="submit"
                  className="group inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-medium shadow-sm outline-none transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 md:h-14"
                  style={{ background: o.accent, color: accentInk, ['--tw-ring-color' as string]: rgba(o.accent, 0.6), ['--tw-ring-offset-color' as string]: t.bg }}
                >
                  Get Started
                  <motion.span className="ml-2 inline-flex" {...loop({ x: [0, 5, 0] }, { repeat: Infinity, duration: 1.5 })}>
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </button>
              </div>
            </motion.form>

            {/* Benefits list */}
            <motion.ul {...enter({ opacity: 0 }, { delay: 0.6 })} className="flex flex-wrap gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <motion.li key={benefit} {...enter({ opacity: 0, x: -20 }, { delay: 0.7 + index * 0.1 })} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: accentText }} />
                  <span className="text-sm md:text-base" style={{ color: t.muted }}>
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Social proof */}
            <motion.div {...enter({ opacity: 0, y: 20 }, { delay: 0.9 })} className="mt-8 flex flex-wrap items-center gap-4 md:mt-12">
              <div className="flex -space-x-2" aria-hidden>
                {people.map((initials, i) => {
                  const a = i % 2 ? o.secondary : o.accent
                  const b = i % 2 ? o.accent : o.secondary
                  return (
                    <motion.div
                      key={initials}
                      {...enter({ scale: 0 }, { delay: 1 + (i + 1) * 0.1, type: 'spring' })}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-semibold"
                      style={{ border: `2px solid ${t.bg}`, background: `linear-gradient(135deg, ${a}, ${b})`, color: onColor(a) }}
                    >
                      {initials}
                    </motion.div>
                  )
                })}
              </div>
              <div className="text-sm">
                <span className="font-semibold">10,000+</span>
                <span style={{ color: t.muted }}> happy customers</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Video / visual */}
          <motion.div
            {...enter({ opacity: 0, x: mediaLeft ? -50 : 50 }, { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] })}
            className={cn('flex min-w-0 items-center justify-center', mediaLeft && 'lg:order-1')}
          >
            <motion.div onHoverStart={() => setIsVideoHovered(true)} onHoverEnd={() => setIsVideoHovered(false)} className="relative w-full max-w-lg">
              <div
                className="relative overflow-hidden rounded-xl p-4 shadow-2xl md:p-6"
                style={{ border: `1px solid ${t.border}`, background: `linear-gradient(to bottom right, ${t.card}, ${rgba(t.card, 0.5)})` }}
              >
                <motion.div
                  className="relative aspect-video overflow-hidden rounded-lg"
                  style={{ background: `linear-gradient(to bottom right, ${rgba(o.accent, 0.2)}, ${rgba(o.accent, 0.05)})` }}
                  whileHover={reduced ? undefined : { scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Video thumbnail */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(to bottom right, ${rgba(o.accent, 0.1)}, ${rgba(o.secondary, 0.14)})` }}
                  >
                    <motion.button
                      type="button"
                      aria-label="Play product tour"
                      animate={isVideoHovered && !reduced ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ ['--tw-ring-color' as string]: o.accent, ['--tw-ring-offset-color' as string]: t.card }}
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{ background: rgba(o.accent, 0.4) }}
                        {...loop({ scale: [1, 1.3, 1] }, { duration: 2, repeat: Infinity })}
                      />
                      <span className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg md:h-20 md:w-20" style={{ background: o.accent }}>
                        <Play className="ml-1 h-8 w-8 md:h-10 md:w-10" style={{ color: accentInk }} />
                      </span>
                    </motion.button>
                  </div>

                  {/* Floating elements */}
                  {o.showChips && (
                    <>
                      <motion.div
                        aria-hidden
                        className="absolute right-4 top-4 rounded-lg p-2 shadow-lg backdrop-blur-sm md:p-3"
                        style={{ background: t.chip }}
                        {...loop({ y: [0, -amp, 0] }, { duration: 3, repeat: Infinity })}
                      >
                        <Zap className="h-4 w-4 md:h-5 md:w-5" style={{ color: accentText }} />
                      </motion.div>
                      <motion.div
                        aria-hidden
                        className="absolute bottom-4 left-4 rounded-lg p-2 shadow-lg backdrop-blur-sm md:p-3"
                        style={{ background: t.chip }}
                        {...loop({ y: [0, amp, 0] }, { duration: 3, repeat: Infinity, delay: 1 })}
                      >
                        <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" style={{ color: accentText }} />
                      </motion.div>
                    </>
                  )}
                </motion.div>

                {/* Stats */}
                <motion.dl {...enter({ opacity: 0, y: 20 }, { delay: 1.2 })} className="mt-4 grid grid-cols-3 gap-2 md:gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      {...enter({ scale: 0 }, { delay: 1.3 + index * 0.1, type: 'spring' })}
                      className="flex flex-col-reverse rounded-lg p-2 text-center backdrop-blur-sm md:p-3"
                      style={{ background: t.soft }}
                    >
                      <dt className="text-xs" style={{ color: t.muted }}>
                        {stat.label}
                      </dt>
                      <dd className="text-base font-bold md:text-lg">{stat.value}</dd>
                    </motion.div>
                  ))}
                </motion.dl>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
