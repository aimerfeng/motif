// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/cta-01/components/cta.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useId, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  headline: 'Lightweight Analytics Built For Simplicity',
  buttonLabel: 'Get Started',
  accent: '#3b82f6',
  tone: 'dark',
  gridSize: 48,
  traceShape: 'elbow',
  pulseSpeed: 3,
}
/* @motif:end */

export type CtaCircuitPulseProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  description?: string
  href?: string
}

type Side = 'left' | 'right'

// elbow 是上游的路径；另两种是同一 viewBox 里的变体。motion 是 offset-path（上游比可见路径多走 10 个单位，让光点完整离开）。
const TRACES: Record<string, Record<Side, { d: string; motion: string }>> = {
  elbow: {
    left: { d: 'M 1 12 v 65 l 28 24 v 70', motion: 'M 1 12 v 65 l 28 24 v 80' },
    right: { d: 'M 29 12 v 65 l -28 24 v 65', motion: 'M 29 12 v 65 l -28 24 v 80' },
  },
  zigzag: {
    left: { d: 'M 1 12 v 30 l 28 24 v 20 l -28 24 v 60', motion: 'M 1 12 v 30 l 28 24 v 20 l -28 24 v 70' },
    right: { d: 'M 29 12 v 30 l -28 24 v 20 l 28 24 v 60', motion: 'M 29 12 v 30 l -28 24 v 20 l 28 24 v 70' },
  },
  straight: {
    left: { d: 'M 15 12 v 160', motion: 'M 15 12 v 170' },
    right: { d: 'M 15 12 v 160', motion: 'M 15 12 v 170' },
  },
}

function Trace({
  side,
  path,
  isLight,
  accent,
  uid,
  dotRef,
}: {
  side: Side
  path: { d: string; motion: string }
  isLight: boolean
  accent: string
  uid: string
  dotRef: (el: SVGCircleElement | null) => void
}) {
  const ink = isLight ? '#737373' : '#404040'
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0, ease: 'easeInOut' }}
      className={cn('absolute hidden h-full w-24 md:block', side === 'left' ? 'left-0' : 'right-0')}
      aria-hidden
    >
      <svg className="h-full w-full" width="100%" height="100%" viewBox="0 0 30 120" fill="none">
        <g stroke={`url(#${uid}-${side}-fadeStroke)`} strokeWidth="0.4">
          <path d={path.d} />
        </g>
        <g mask={`url(#${uid}-${side}-mask)`}>
          <circle
            ref={dotRef}
            cx="0"
            cy="0"
            r="12"
            fill={`url(#${uid}-${side}-grad)`}
            style={{ offsetPath: `path("${path.motion}")`, offsetAnchor: '10px 0px', offsetDistance: '0%' }}
          />
        </g>
        <defs>
          <mask id={`${uid}-${side}-mask`}>
            <path d={path.d} strokeWidth="0.4" stroke="white" />
          </mask>
          <linearGradient id={`${uid}-${side}-fadeStroke`} gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="0" y2="170">
            <stop offset="0%" stopColor={ink} stopOpacity="0" />
            <stop offset="10%" stopColor={ink} stopOpacity="1" />
            <stop offset="90%" stopColor={ink} stopOpacity="1" />
            <stop offset="100%" stopColor={ink} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}-${side}-grad`} fx="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

function TextGlitch({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden">
      <span className="invisible">{text}</span>
      <span className="absolute top-0 left-0 font-semibold transition-transform duration-500 ease-in-out group-hover:-translate-y-full group-focus-visible:-translate-y-full hover:duration-300 motion-reduce:transition-none">
        {text}
      </span>
      <span
        className="absolute top-0 left-0 translate-y-full font-semibold transition-transform duration-500 ease-in-out group-hover:translate-y-0 group-focus-visible:translate-y-0 hover:duration-300 motion-reduce:transition-none"
        aria-hidden
      >
        {text}
      </span>
    </div>
  )
}

export function CtaCircuitPulse({ className, style, description, href = '#', ...props }: CtaCircuitPulseProps) {
  const o = { ...defaults, ...props }
  const isLight = o.tone === 'light'
  const reduce = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const hostRef = useRef<HTMLDivElement>(null)
  const dots = useRef<(SVGCircleElement | null)[]>([null, null])
  const paths = TRACES[o.traceShape] ?? TRACES.elbow
  const grid = `${o.gridSize}px ${o.gridSize}px`

  // 上游关键帧：前 60% 走完路径，剩下 40% 停在终点（光点已被遮罩藏起）。
  useFrameLoop(
    hostRef,
    ({ time }) => {
      const p = (time % o.pulseSpeed) / o.pulseSpeed
      const dist = `${Math.min(p / 0.6, 1) * 100}%`
      for (const el of dots.current) if (el) el.style.offsetDistance = dist
    },
    { reducedMotion: 'static', staticTime: o.pulseSpeed * 0.3 },
  )

  const blurIn = (y: number, blur: number, duration: number, delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { y, filter: `blur(${blur}px)`, opacity: 0 },
          animate: { y: 0, filter: 'blur(0px)', opacity: 1 },
          transition: { duration, delay, ease: 'easeInOut' as const },
        }

  return (
    <div
      ref={hostRef}
      className={cn('relative min-h-[70vh] w-full pb-24 md:pb-32', isLight ? 'bg-neutral-50' : 'bg-neutral-950', className)}
      style={style}
      data-theme={o.tone}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundSize: grid,
          backgroundImage: isLight
            ? 'linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)'
            : 'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 pt-24 pb-24 md:pt-32 md:pb-32">
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent)]"
          style={{
            backgroundSize: grid,
            backgroundImage: isLight
              ? 'linear-gradient(rgba(0,0,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.06) 1px,transparent 1px)'
              : 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',
          }}
          aria-hidden
        />
        <Trace side="left" path={paths.left} isLight={isLight} accent={o.accent} uid={uid} dotRef={(el) => void (dots.current[0] = el)} />
        <Trace side="right" path={paths.right} isLight={isLight} accent={o.accent} uid={uid} dotRef={(el) => void (dots.current[1] = el)} />
        <motion.h2
          {...blurIn(10, 10, 0.5, 0.1)}
          className={cn(
            'relative z-10 mx-auto mt-48 max-w-3xl bg-clip-text pb-2 text-center text-5xl leading-[1.15] font-medium tracking-tighter text-balance text-transparent md:text-[4.2rem]',
            isLight ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-100 via-neutral-100 via-50% to-neutral-100/40',
          )}
        >
          {o.headline}
        </motion.h2>
        {description ? (
          <motion.p
            {...blurIn(10, 10, 0.4, 0.3)}
            className={cn(
              'relative z-10 mx-auto mb-12 max-w-sm bg-clip-text text-center text-[0.8rem] leading-relaxed text-balance text-transparent sm:max-w-[32rem] sm:text-[0.87rem] lg:text-[1rem]',
              isLight ? 'bg-gradient-to-br from-neutral-600 via-neutral-500 to-neutral-600/90' : 'bg-gradient-to-br from-neutral-400 via-neutral-300 to-neutral-400/90',
            )}
          >
            {description}
          </motion.p>
        ) : null}
        <motion.div {...blurIn(5, 5, 0.3, 0.5)} className={cn('relative z-10', !description && 'mt-10')}>
          <a
            href={href}
            className={cn(
              'group flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold outline-none transition-[background-color,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 md:text-[1rem]',
              isLight
                ? 'border border-neutral-300 bg-white text-neutral-900 shadow-sm hover:border-neutral-400 hover:bg-neutral-50 focus-visible:ring-neutral-900 focus-visible:ring-offset-neutral-50'
                : 'border border-white/15 bg-neutral-950/90 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/25 hover:bg-neutral-900/90 focus-visible:ring-white focus-visible:ring-offset-neutral-950',
            )}
          >
            <TextGlitch text={o.buttonLabel} />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
