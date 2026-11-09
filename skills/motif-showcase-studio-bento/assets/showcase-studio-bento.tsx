// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/bento-grid-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#8b7cf6',
  tone: 'dark',
  galleryStyle: 'gradient',
  radius: 16,
  density: 'comfortable',
  showReel: true,
}
/* @motif:end */

export type ShowcaseStudioBentoProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

interface AvatarProfile {
  initials: string
  alt: string
  hue: number
}

interface Metric {
  label: string
  value: string
  caption: string
}

interface ProcessStep {
  label: string
  progress: number
}

interface GalleryImage {
  alt: string
  hue: number
}

interface ReelStat {
  label: string
}

const avatarProfiles: AvatarProfile[] = [
  { initials: 'MK', alt: 'Mira Kovač, motion designer', hue: 0 },
  { initials: 'TO', alt: 'Tomás Okafor, product strategist', hue: 70 },
  { initials: 'LS', alt: 'Lena Sato, UX researcher', hue: 150 },
]

const keyMetrics: Metric[] = [
  { label: 'Project satisfaction', value: '98%', caption: 'Last quarter' },
  { label: 'Delivery cadence', value: '2.4x', caption: 'Faster' },
  { label: 'Retention rate', value: '92%', caption: 'After 6 months' },
]

const motionProcess: ProcessStep[] = [
  { label: 'Ideate & storyboard', progress: 82 },
  { label: 'Motion exploration', progress: 64 },
  { label: 'Polish & delivery', progress: 91 },
]

const inspirationGallery: GalleryImage[] = [
  { alt: 'Collage of lighting references for motion design', hue: 0 },
  { alt: 'Creative workspace with monitors and sketchbook', hue: 40 },
  { alt: 'Colorful motion design storyboard pinned to a wall', hue: 300 },
  { alt: 'Designer adjusting camera lighting in a studio', hue: 190 },
]

const reelStats: ReelStat[] = [{ label: '3:42 min' }, { label: '4.2K views' }, { label: 'Dynamic timing curves' }]

const LIGHT_VARS = {
  '--background': 'oklch(0.985 0.003 270)',
  '--foreground': 'oklch(0.2 0.012 270)',
  '--border': 'oklch(0.86 0.006 270)',
  '--ring': 'oklch(0.55 0.16 280)',
} as CSSProperties

const DARK_VARS = {
  '--background': 'oklch(0.155 0.008 275)',
  '--foreground': 'oklch(0.96 0.004 270)',
  '--border': 'oklch(1 0 0 / 16%)',
  '--ring': 'oklch(0.7 0.14 285)',
} as CSSProperties

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0').slice(0, 6)
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: number, b: number) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// 强调色既用作文字也用作填充：跟当前底色对比不够时往白/黑里混，直到达到 4.5:1
function readableAccent(hex: string, tone: string) {
  const base = hexToRgb(hex)
  const bg = tone === 'light' ? 0.96 : 0.012
  const target: [number, number, number] = tone === 'light' ? [0, 0, 0] : [255, 255, 255]
  for (let t = 0; t <= 1; t += 0.05) {
    const mixed = base.map((c, i) => c + (target[i]! - c) * t) as [number, number, number]
    if (contrast(luminance(mixed), bg) >= 4.5) return rgbToHex(mixed)
  }
  return rgbToHex(target)
}

function accentHue(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255) as [number, number, number]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 250
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return h < 0 ? h + 360 : h
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', className)} aria-hidden="true">
      {children}
    </svg>
  )
}

const ArrowUpRight = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </Icon>
)

const PlayCircle = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 6 4-6 4Z" />
  </Icon>
)

const Sparkles = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M9.94 14.06 8 20l-1.94-5.94L0 12l6.06-1.94L8 4l1.94 6.06L16 12Z" transform="translate(2 -1) scale(0.9)" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
  </Icon>
)

// 替代上游的 Unsplash 照片：按强调色色相生成的 SVG 画面
function Frame({ variant, hue, seed, alt, className }: { variant: string; hue: number; seed: number; alt: string; className?: string }) {
  const id = useId().replace(/:/g, '')
  const h = (o: number) => `${(hue + o + 360) % 360}`
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt} className={className}>
      {variant === 'shapes' ? (
        <>
          <rect width="400" height="300" fill={`hsl(${h(0)} 45% 22%)`} />
          <rect x={40 + seed * 30} y="60" width="190" height="240" fill={`hsl(${h(20)} 70% 55%)`} />
          <circle cx={290 - seed * 20} cy="110" r="70" fill={`hsl(${h(320)} 80% 68%)`} />
          <path d={`M0 300 L${160 + seed * 40} ${150 + seed * 10} L400 300 Z`} fill={`hsl(${h(180)} 55% 40%)`} />
          <rect x="300" y="200" width="60" height="60" fill={`hsl(${h(40)} 90% 80%)`} transform={`rotate(${seed * 15} 330 230)`} />
        </>
      ) : variant === 'lines' ? (
        <>
          <rect width="400" height="300" fill={`hsl(${h(0)} 30% 12%)`} />
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse
              key={i}
              cx={120 + seed * 60}
              cy={180 - seed * 20}
              rx={20 + i * 22}
              ry={14 + i * 15}
              fill="none"
              stroke={`hsl(${h(i * 8)} 70% ${55 + i * 2}%)`}
              strokeOpacity={1 - i * 0.055}
              strokeWidth="2"
              transform={`rotate(${seed * 20 - 10} 200 150)`}
            />
          ))}
        </>
      ) : (
        <>
          <defs>
            <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={`hsl(${h(0)} 60% 30%)`} />
              <stop offset="1" stopColor={`hsl(${h(200)} 50% 10%)`} />
            </linearGradient>
            <radialGradient id={`${id}-a`}>
              <stop offset="0" stopColor={`hsl(${h(30)} 95% 72%)`} />
              <stop offset="1" stopColor={`hsl(${h(30)} 95% 72%)`} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-b`}>
              <stop offset="0" stopColor={`hsl(${h(300)} 85% 62%)`} />
              <stop offset="1" stopColor={`hsl(${h(300)} 85% 62%)`} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${id}-bg)`} />
          <circle cx={100 + seed * 50} cy={80 + seed * 20} r="180" fill={`url(#${id}-a)`} />
          <circle cx={320 - seed * 40} cy="250" r="200" fill={`url(#${id}-b)`} />
          <rect x="0" y="210" width="400" height="2" fill="white" opacity="0.25" />
        </>
      )}
    </svg>
  )
}

export function ShowcaseStudioBento({ className, style, ...props }: ShowcaseStudioBentoProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const primary = readableAccent(options.accent, options.tone)
  const primaryForeground = luminance(hexToRgb(primary)) > 0.4 ? '#0b0b10' : '#ffffff'
  const hue = accentHue(options.accent)
  const compact = options.density === 'compact'
  const radius = options.radius
  const tileRadius = { borderRadius: radius } as CSSProperties
  const innerRadius = { borderRadius: Math.max(4, radius * 0.75) } as CSSProperties
  const pad = compact ? 'p-5' : 'p-6'
  const lift = reduced ? undefined : { y: -4 }

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  const initial = reduced ? false : 'hidden'
  const tile = 'transition-[border-color,box-shadow] hover:border-border/80 hover:shadow-lg'

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden bg-background text-foreground', className)}
      style={{
        ...(options.tone === 'light' ? LIGHT_VARS : DARK_VARS),
        '--primary': primary,
        '--primary-foreground': primaryForeground,
        fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
        ...style,
      } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground/[0.035] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-primary/[0.08] blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-foreground/[0.02] blur-[150px]" />
      </div>

      <div className={cn('relative mx-auto max-w-7xl px-4 md:px-6', compact ? 'py-12 md:py-16' : 'py-16 md:py-24')}>
        <motion.header variants={sectionVariants} initial={initial} animate="visible" className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-foreground/70 backdrop-blur">
            Halden Studio
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">Bento storytelling built for modern motion systems</h2>
          <p className="max-w-2xl text-base text-foreground/70 md:text-lg">
            Pair narrative, metrics, and cinematic visuals inside a responsive layout designed around motion micro-interactions and accessible navigation.
          </p>
        </motion.header>

        <motion.div
          className={cn('grid auto-rows-[minmax(200px,auto)] sm:grid-cols-2 lg:grid-cols-4', compact ? 'mt-8 gap-3 md:gap-4' : 'mt-12 gap-4 md:gap-6')}
          initial={initial}
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.08, delayChildren: 0.12 } },
          }}
        >
          <motion.article
            variants={cardVariants}
            whileHover={lift}
            transition={{ duration: 0.2 }}
            style={tileRadius}
            className={cn('group relative col-span-1 flex h-full flex-col justify-between overflow-hidden border border-border/40 bg-background/70 backdrop-blur sm:col-span-2 lg:row-span-2', pad, tile)}
            aria-label="Featured case study"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex w-fit rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">Featured case study</span>
                <h3 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">Designing delightful product experiences</h3>
                <p className="text-sm text-foreground/70 md:text-base">
                  We choreograph micro-interactions and depth cues that elevate usability across every product surface, without sacrificing performance or accessibility.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex -space-x-3" role="list" aria-label="Project team avatars">
                  {avatarProfiles.map((profile) => (
                    <div
                      key={profile.initials}
                      role="listitem"
                      aria-label={profile.alt}
                      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border/50 text-xs font-semibold text-white transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                      style={{ background: `linear-gradient(135deg, hsl(${(hue + profile.hue) % 360} 60% 52%), hsl(${(hue + profile.hue + 60) % 360} 55% 30%))` }}
                    >
                      {profile.initials}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="group/cta inline-flex items-center gap-2 rounded-lg bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="View the featured case study"
                >
                  View story
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1 motion-reduce:group-hover/cta:translate-x-0" />
                </button>
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={lift}
            transition={{ duration: 0.2 }}
            style={tileRadius}
            className={cn('group col-span-1 flex h-full flex-col border border-border/40 bg-background/70 backdrop-blur sm:col-span-2', pad, tile)}
            aria-label="Key performance metrics"
          >
            <div className="flex items-center justify-between">
              <span className="w-fit rounded-full bg-foreground/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">Performance</span>
              <motion.div animate={reduced ? undefined : { rotate: [0, -6, 0, 6, 0] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}>
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {keyMetrics.map((metric) => (
                <div key={metric.label} className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground/60">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{metric.value}</p>
                  <p className={cn('mt-1 inline-flex items-center gap-2 py-1 text-xs font-semibold', options.tone === 'light' ? 'text-emerald-700' : 'text-emerald-400')}>{metric.caption}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={lift}
            transition={{ duration: 0.2 }}
            style={tileRadius}
            className={cn('group relative col-span-1 min-h-[380px] overflow-hidden border border-border/40 bg-background/70 backdrop-blur sm:col-span-2 lg:row-span-3', tile)}
            aria-label="Behind the scenes studio imagery"
          >
            <div className="absolute inset-0">
              <Frame variant={options.galleryStyle} hue={hue + 220} seed={1} alt="Designer workstation lit with cinematic lighting" className="h-full w-full opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
            <div className={cn('relative flex h-full flex-col justify-end space-y-4', compact ? 'p-5 md:p-6' : 'p-6 md:p-8')}>
              <span className="w-fit rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">Behind the scenes</span>
              <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">Immersive motion prototypes with cinematic lighting</h3>
              <p className="max-w-sm text-sm text-foreground/70 md:text-base">
                Layered light, shadow, and depth cues help teams experience the product as it will ship, well before the first line of production code.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Micro-interactions', 'Depth cues', 'Narrative flow'].map((tag) => (
                  <span key={tag} className="rounded-full border border-border/40 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-foreground/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={lift}
            transition={{ duration: 0.2 }}
            style={tileRadius}
            className={cn('group col-span-1 flex h-full flex-col border border-border/40 bg-background/70 backdrop-blur sm:col-span-2 lg:row-span-2', pad, tile)}
            aria-label="Motion sprint process overview"
          >
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-primary/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">Motion sprint</span>
              <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">From first sketch to polished prototype in seven days</h3>
              <p className="text-sm text-foreground/70 md:text-base">
                We compress discovery, exploration, and refinement into a focused week-long sprint so your team can feel the flow of the final experience sooner.
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {motionProcess.map((step, index) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-foreground/60">
                    <span>{step.label}</span>
                    <span aria-label={`${step.progress}% complete`}>{step.progress}%</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"
                    role="progressbar"
                    aria-label={step.label}
                    aria-valuenow={step.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={reduced ? false : { scaleX: 0 }}
                      animate={{ scaleX: step.progress / 100 }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + index * 0.1 }}
                      className="h-full w-full origin-left rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Play sprint walkthrough video"
            >
              <PlayCircle className="h-4 w-4" />
              Play walkthrough
            </button>
          </motion.article>

          {options.showReel && (
            <motion.article
              variants={cardVariants}
              whileHover={lift}
              transition={{ duration: 0.2 }}
              style={tileRadius}
              className={cn('group col-span-1 flex h-full flex-col overflow-hidden border border-border/40 bg-gradient-to-br from-primary/15 via-background/70 to-background/90 p-0 backdrop-blur sm:col-span-2', tile)}
              aria-label="Motion showcase video"
            >
              <div className="relative h-full">
                <Frame
                  variant={options.galleryStyle}
                  hue={hue + 120}
                  seed={2}
                  alt="Motion design workspace with monitors"
                  className="absolute inset-0 h-full w-full opacity-30 transition-opacity duration-500 group-hover:opacity-40"
                />
                <div className={cn('relative flex h-full flex-col justify-between bg-gradient-to-br from-background/90 via-background/70 to-transparent', compact ? 'p-5 md:p-6' : 'p-6 md:p-8')}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-fit rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">Motion showcase</span>
                      <motion.div
                        animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20"
                      >
                        <PlayCircle className="h-4 w-4 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">Watch our latest animation breakdown</h3>
                    <p className="max-w-md text-sm text-foreground/70 md:text-base">
                      A three-minute deep dive into timing curves, coordinated transitions, and how we translate component choreography into production-ready systems.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-foreground/70">
                    <div className="flex flex-wrap gap-2">
                      {reelStats.map((stat) => (
                        <span key={stat.label} className="rounded-full bg-background/80 px-3 py-1 uppercase tracking-[0.18em]">
                          {stat.label}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Watch now
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          )}

          <motion.article
            variants={cardVariants}
            whileHover={lift}
            transition={{ duration: 0.2 }}
            style={tileRadius}
            className={cn('group col-span-1 flex h-full flex-col border border-border/40 bg-background/70 backdrop-blur sm:col-span-2', pad, tile)}
            aria-label="Visual research gallery"
          >
            <div className="space-y-3">
              <span className="inline-flex w-fit rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">Visual research</span>
              <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">Capturing texture, light, and pace for new explorations</h3>
              <p className="text-sm text-foreground/70 md:text-base">
                A snapshot of the references that steer our motion language and narrative rhythm, curated for both product and marketing surfaces.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {inspirationGallery.map((image, index) => (
                <div key={image.alt} style={innerRadius} className="relative aspect-[4/3] overflow-hidden border border-border/30 bg-background/60">
                  <Frame
                    variant={options.galleryStyle}
                    hue={hue + image.hue}
                    seed={index % 3}
                    alt={image.alt}
                    className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open the visual inspiration archive"
            >
              Open inspiration archive
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
