// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/glassmorphism-listen-app-block.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#a78bfa',
  coverStyle: 'aurora',
  glassBlur: 40,
  tone: 'dark',
  playing: true,
  showEqualizer: true,
}
/* @motif:end */

export type ShowcaseNowPlayingProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const highlights = [
  {
    title: 'Spatial audio',
    description: 'Immerse yourself in cinematic soundscapes crafted for every mood.',
  },
]

const playlist = [
  { id: 'tidal-lines', title: 'Tidal Lines', artist: 'Mara Ellison', album: 'Low Coast', duration: 400, start: 72, hue: 0 },
  { id: 'paper-lanterns', title: 'Paper Lanterns', artist: 'The Quiet Hours', album: 'Night Market', duration: 203, start: 48, hue: 48 },
  { id: 'glasshouse', title: 'Glasshouse', artist: 'Juno Park', album: 'Greenroom', duration: 238, start: 161, hue: 120 },
  { id: 'after-the-rain', title: 'After the Rain', artist: 'Okeke & Vale', album: 'Petrichor', duration: 178, start: 36, hue: 210 },
]

const LIGHT_VARS = {
  '--background': 'oklch(0.99 0.002 270)',
  '--foreground': 'oklch(0.2 0.012 270)',
  '--border': 'oklch(0.91 0.006 270)',
  '--ring': 'oklch(0.62 0.16 280)',
} as CSSProperties

const DARK_VARS = {
  '--background': 'oklch(0.155 0.008 275)',
  '--foreground': 'oklch(0.96 0.004 270)',
  '--border': 'oklch(1 0 0 / 10%)',
  '--ring': 'oklch(0.6 0.14 285)',
} as CSSProperties

const EQ_BARS = 28

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0').slice(0, 6)
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function accentHue(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return h < 0 ? h + 360 : h
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function coverBackground(style: string, accent: string, hueOffset: number) {
  const h = (accentHue(accent) + hueOffset) % 360
  if (style === 'sunset') {
    return `linear-gradient(160deg, hsl(${(h + 20) % 360} 90% 66%), hsl(${(h + 340) % 360} 80% 52%) 55%, hsl(${(h + 300) % 360} 60% 24%))`
  }
  if (style === 'glass') return undefined
  return `radial-gradient(circle at 25% 20%, hsl(${(h + 40) % 360} 90% 72% / 0.95), transparent 55%), radial-gradient(circle at 80% 85%, hsl(${(h + 300) % 360} 85% 60% / 0.9), transparent 60%), linear-gradient(135deg, hsl(${h} 70% 52%), hsl(${(h + 200) % 360} 60% 26%))`
}

const iconButton =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10'

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden>
      {children}
    </svg>
  )
}

export function ShowcaseNowPlaying({ className, style, ...props }: ShowcaseNowPlayingProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(options.playing)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const activeTrack = playlist[activeIndex]!

  useEffect(() => setIsPlaying(options.playing), [options.playing])

  const host = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const current = useRef<HTMLSpanElement>(null)
  const eq = useRef<(HTMLSpanElement | null)[]>([])
  const elapsed = useRef(activeTrack.start)
  const level = useRef(isPlaying ? 1 : 0)
  const state = useRef({ isPlaying, activeIndex, repeat, shuffle })
  state.current = { isPlaying, activeIndex, repeat, shuffle }

  useEffect(() => {
    elapsed.current = playlist[activeIndex]!.start
  }, [activeIndex])

  useFrameLoop(
    host,
    ({ time, delta }) => {
      const s = state.current
      const track = playlist[s.activeIndex]!
      if (s.isPlaying) elapsed.current += delta
      if (elapsed.current >= track.duration) {
        if (s.repeat) elapsed.current = 0
        else {
          const next = s.shuffle ? (s.activeIndex + 2) % playlist.length : (s.activeIndex + 1) % playlist.length
          elapsed.current = 0
          setActiveIndex(next)
        }
      }
      const p = Math.min(1, elapsed.current / track.duration)
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      if (current.current) current.current.textContent = formatTime(elapsed.current)
      const target = s.isPlaying ? 1 : 0
      level.current += (target - level.current) * Math.min(1, delta * 6)
      if (delta === 0) level.current = target
      eq.current.forEach((el, i) => {
        if (!el) return
        const wave = 0.5 + 0.5 * Math.sin(time * (2.1 + (i % 5) * 0.43) + i * 1.7) * Math.sin(time * 1.3 + i * 0.6)
        const rest = 0.18 + 0.12 * Math.abs(Math.sin(i * 2.3))
        el.style.transform = `scaleY(${rest + (0.9 - rest) * wave * level.current})`
      })
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  const ink = luminance(options.accent) > 0.45 ? '#0b0b10' : '#ffffff'
  const toneVars = options.tone === 'light' ? LIGHT_VARS : DARK_VARS
  const blur = `blur(${options.glassBlur}px)`
  const cover = coverBackground(options.coverStyle, options.accent, activeTrack.hue)
  const isLiked = Boolean(liked[activeTrack.id])
  const swap = reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } }

  return (
    <section
      ref={host}
      className={cn('relative isolate overflow-hidden bg-background px-4 py-20 text-foreground sm:px-6 md:py-32', className)}
      style={{ ...toneVars, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: `color-mix(in oklab, ${options.accent} 14%, transparent)` }} />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-foreground/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-xl border border-border/50 bg-background/40 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.25)] sm:p-10 md:p-16"
          style={{ backdropFilter: blur, WebkitBackdropFilter: blur }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0 space-y-10">
              <div className="space-y-5">
                <span className="inline-flex w-fit items-center rounded-md border border-border/60 bg-background/40 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground/70 backdrop-blur">
                  listen app
                </span>
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">Sound that feels like a private concert</h2>
                  <p className="max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg">
                    Stream, discover, and share music with glassy interfaces, subtle motion, and immersive visuals that keep the focus on the sound.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ background: options.accent, color: ink }}
                >
                  Start listening
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/40 px-8 text-base font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View plans
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="group h-full rounded-3xl border border-border/40 bg-background/60 p-6 backdrop-blur-xl transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-border motion-reduce:hover:translate-y-0"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-foreground/10 text-foreground/80">
                      <Icon>
                        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                      </Icon>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{highlight.title}</h3>
                    <p className="text-sm leading-relaxed text-foreground/70">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div
                className="rounded-3xl border border-border/40 bg-background/70 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.35)] sm:p-6"
                style={{ backdropFilter: blur, WebkitBackdropFilter: blur }}
              >
                <div className="flex items-start gap-4">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTrack.id}
                      {...swap}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/40',
                        options.coverStyle === 'glass' && 'bg-gradient-to-br from-foreground/30 via-foreground/10 to-transparent',
                      )}
                      style={cover ? { background: cover } : undefined}
                      aria-hidden
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)]" />
                      <div className="absolute bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-background/70" />
                    </motion.div>
                  </AnimatePresence>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={activeTrack.id} {...swap} transition={{ duration: 0.25 }} className="min-w-0" aria-live="polite">
                          <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">Now playing</p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{activeTrack.title}</h3>
                          <p className="text-sm text-foreground/60">
                            {activeTrack.artist} · {activeTrack.album}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                      <button
                        type="button"
                        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                        aria-pressed={isLiked}
                        onClick={() => setLiked((l) => ({ ...l, [activeTrack.id]: !isLiked }))}
                        className={iconButton}
                        style={isLiked ? { color: options.accent } : undefined}
                      >
                        <Icon>
                          <path
                            fill={isLiked ? 'currentColor' : 'none'}
                            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                          />
                        </Icon>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center rounded-full border border-border/50 bg-background/60 px-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground/70 backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Add to queue
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <div className="flex items-center justify-between text-xs font-medium tabular-nums tracking-wide text-foreground/50">
                    <span ref={current}>{formatTime(activeTrack.start)}</span>
                    <span>{formatTime(activeTrack.duration)}</span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
                    role="progressbar"
                    aria-label="Playback position"
                    aria-valuemin={0}
                    aria-valuemax={activeTrack.duration}
                    aria-valuenow={activeTrack.start}
                  >
                    <div
                      ref={bar}
                      className="h-full w-full origin-left rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${options.accent}, color-mix(in oklab, ${options.accent} 40%, transparent))`,
                        transform: `scaleX(${activeTrack.start / activeTrack.duration})`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button type="button" aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle((v) => !v)} className={iconButton} style={shuffle ? { color: options.accent } : undefined}>
                      <Icon>
                        <path d="m18 14 4 4-4 4" />
                        <path d="m18 2 4 4-4 4" />
                        <path d="M2 18h1.97a4 4 0 0 0 3.3-1.7l5.46-8.6a4 4 0 0 1 3.3-1.7H22" />
                        <path d="M2 6h1.97a4 4 0 0 1 3.3 1.7l.62.97" />
                        <path d="M22 18h-6.03a4 4 0 0 1-3.3-1.7l-.62-.97" />
                      </Icon>
                    </button>
                    <button type="button" aria-label="Previous track" onClick={() => setActiveIndex((i) => (i + playlist.length - 1) % playlist.length)} className={iconButton}>
                      <Icon>
                        <polygon points="19 20 9 12 19 4 19 20" />
                        <line x1="5" x2="5" y1="19" y2="5" />
                      </Icon>
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {isPlaying ? (
                      <Icon className="h-5 w-5">
                        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                      </Icon>
                    ) : (
                      <Icon className="h-5 w-5">
                        <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
                      </Icon>
                    )}
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button type="button" aria-label="Next track" onClick={() => setActiveIndex((i) => (i + 1) % playlist.length)} className={iconButton}>
                      <Icon>
                        <polygon points="5 4 15 12 5 20 5 4" />
                        <line x1="19" x2="19" y1="5" y2="19" />
                      </Icon>
                    </button>
                    <button type="button" aria-label="Repeat" aria-pressed={repeat} onClick={() => setRepeat((v) => !v)} className={iconButton} style={repeat ? { color: options.accent } : undefined}>
                      <Icon>
                        <path d="m17 2 4 4-4 4" />
                        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                        <path d="m7 22-4-4 4-4" />
                        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                      </Icon>
                    </button>
                    <button type="button" aria-label="Volume" className={iconButton}>
                      <Icon>
                        <path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5Z" />
                        <path d="M16 9a5 5 0 0 1 0 6" />
                        <path d="M19.4 18.4a9 9 0 0 0 0-12.7" />
                      </Icon>
                    </button>
                  </div>
                </div>

                {options.showEqualizer && (
                  <div
                    className="mt-8 flex h-[152px] items-center gap-[3px] overflow-hidden rounded-3xl border border-border/40 bg-background/80 px-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur"
                    aria-hidden
                  >
                    {Array.from({ length: EQ_BARS }, (_, i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          eq.current[i] = el
                        }}
                        className="h-[96px] min-w-0 flex-1 rounded-full"
                        style={{
                          background: `linear-gradient(to top, color-mix(in oklab, ${options.accent} 35%, transparent), ${options.accent})`,
                          transform: 'scaleY(0.3)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2 sm:max-h-[24rem]">
                  {playlist.map((track, index) => {
                    const isActive = index === activeIndex

                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-pressed={isActive}
                        className={cn(
                          'group flex w-full items-center gap-4 rounded-3xl border border-border/40 bg-background/60 p-5 text-left backdrop-blur-xl transition-[transform,border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50',
                          isActive ? 'bg-foreground/[0.08] shadow-[0_20px_60px_rgba(15,23,42,0.35)]' : 'hover:-translate-y-1 hover:border-border/60 motion-reduce:hover:translate-y-0',
                        )}
                        style={isActive ? { borderColor: `color-mix(in oklab, ${options.accent} 55%, transparent)` } : undefined}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border/40 text-sm font-semibold transition-colors',
                            isActive ? 'bg-foreground/20 text-foreground' : 'bg-background/70 text-foreground/70',
                          )}
                        >
                          {track.title.charAt(0)}
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground/90">{track.title}</p>
                            <p className="truncate text-xs text-foreground/60">{track.artist}</p>
                          </div>
                          <span className="text-xs font-medium uppercase tabular-nums tracking-[0.2em] text-foreground/50">{formatTime(track.duration).replace(/^0/, '')}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/90 via-background/40 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
