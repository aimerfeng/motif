// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/loading-carousel.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  autoplayInterval: 4500,
  aspectRatio: 'video',
  textPosition: 'bottom',
  backgroundTips: false,
  backgroundGradient: false,
  showProgress: true,
  showIndicators: true,
  showNavigation: false,
  radius: 12,
}
/* @motif:end */

export interface Tip {
  text: string
  /** 幻灯片画面：任意节点（SVG、渐变块……）。 */
  media?: ReactNode
  /** 画面的 CSS 背景。 */
  background?: string
  url?: string
}

export type LoadingCarouselProps = Partial<typeof defaults> & {
  tips?: Tip[]
  onTipChange?: (index: number) => void
  className?: string
  style?: CSSProperties
}

const defaultTips: Tip[] = [
  { text: 'Backend snippets. Headless components, but for your backend.', background: 'radial-gradient(80% 90% at 20% 20%, #6d28d9, transparent), linear-gradient(135deg, #1e1b4b, #0f172a)' },
  { text: 'Create your first directory app today. Batch scripts process hundreds of URLs in seconds.', background: 'radial-gradient(70% 80% at 80% 30%, #0e7490, transparent), linear-gradient(160deg, #082f49, #020617)' },
  { text: 'Landing page template. Motion, headless components and Tailwind.', background: 'radial-gradient(70% 90% at 30% 80%, #c2410c, transparent), linear-gradient(200deg, #431407, #1c1917)' },
  { text: 'Vector embeddings, semantic search and chat-based retrieval on easy mode.', background: 'radial-gradient(80% 80% at 70% 70%, #15803d, transparent), linear-gradient(120deg, #052e16, #0a0a0a)' },
]

const carouselVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } },
}

const aspectRatioClasses: Record<string, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[2/1]',
}

const tipTextClass =
  'text-center text-base leading-relaxed font-medium tracking-tight text-pretty wrap-break-word text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg md:text-left md:text-xl lg:text-2xl lg:font-bold'

const navClass =
  'bg-background/80 text-foreground absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96]'

function Chevron({ dir, className }: { dir: 'left' | 'right'; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={dir === 'right' ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'} />
    </svg>
  )
}

/** 自动播放的幻灯片：当前页的进度条走满后切到下一页；悬停或聚焦时暂停，←/→ 键切换。 */
export function LoadingCarousel({ tips = defaultTips, onTipChange, className, style, ...props }: LoadingCarouselProps) {
  const { autoplayInterval, aspectRatio, textPosition, showProgress, showNavigation, showIndicators, backgroundTips, backgroundGradient, radius } = {
    ...defaults,
    ...props,
  }
  const prefersReducedMotion = useReducedMotion()
  const host = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [[current, direction], setState] = useState<[number, number]>([0, 0])
  const elapsed = useRef(0)
  const paused = useRef(false)
  const count = tips.length

  const go = useCallback(
    (index: number, dir: number) => {
      const next = ((index % count) + count) % count
      elapsed.current = 0
      setState([next, dir])
      onTipChange?.(next)
    },
    [count, onTipChange],
  )

  // embla-carousel-autoplay 的替代：按帧时间累计，走满 autoplayInterval 就翻页。
  useFrameLoop(
    host,
    ({ delta }) => {
      if (count < 2) return
      if (!paused.current) elapsed.current += delta
      const p = Math.min(elapsed.current / (autoplayInterval / 1000), 1)
      if (bar.current) bar.current.style.transform = `scaleX(${prefersReducedMotion ? 1 : p})`
      if (p >= 1) go(current + 1, 1)
    },
    { reducedMotion: 'static' },
  )

  const tip = tips[current]

  return (
    <motion.div
      ref={host}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(current + 1, 1)
        else if (e.key === 'ArrowLeft') go(current - 1, -1)
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Tips"
      style={{ borderRadius: radius, ...style }}
      className={cn(
        'bg-muted mx-auto w-full max-w-6xl overflow-hidden shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)]',
        className,
      )}
    >
      <div className="w-full overflow-hidden" style={{ borderRadius: radius }}>
        <div className={cn('relative w-full overflow-hidden', aspectRatioClasses[aspectRatio] ?? 'aspect-video')}>
          <AnimatePresence initial={false} custom={direction}>
            {tip && (
              <motion.div
                key={current}
                variants={carouselVariants}
                initial={prefersReducedMotion ? false : 'enter'}
                animate="center"
                exit={prefersReducedMotion ? undefined : 'exit'}
                custom={direction}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 w-full overflow-hidden"
                role="group"
                aria-roledescription="slide"
                aria-label={`${current + 1} of ${count}`}
              >
                <div className="absolute inset-0" style={{ background: tip.background }} aria-hidden="true">
                  {tip.media}
                </div>
                {backgroundGradient && <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />}
                {backgroundTips ? (
                  <motion.div
                    variants={textVariants}
                    initial={prefersReducedMotion ? false : 'hidden'}
                    animate="visible"
                    className={`absolute ${textPosition === 'top' ? 'top-0' : 'bottom-0'} right-0 left-0 min-w-0 p-4 sm:p-6 md:p-8`}
                  >
                    {tip.url ? (
                      <a href={tip.url} className="block min-w-0 rounded-sm focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none">
                        <p className={tipTextClass}>{tip.text}</p>
                      </a>
                    ) : (
                      <p className={tipTextClass}>{tip.text}</p>
                    )}
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
          {showNavigation && (
            <>
              <button type="button" aria-label="Previous tip" onClick={() => go(current - 1, -1)} className={cn(navClass, 'left-2')}>
                <Chevron dir="left" className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Next tip" onClick={() => go(current + 1, 1)} className={cn(navClass, 'right-2')}>
                <Chevron dir="right" className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <div className={cn('bg-muted p-4 sm:p-5', showIndicators && !backgroundTips ? 'lg:px-4 lg:py-3' : '')}>
          <div
            className={cn(
              'flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center',
              showIndicators && !backgroundTips ? 'sm:flex-col sm:items-start' : '',
            )}
          >
            {showIndicators && (
              <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
                {tips.map((item, index) => {
                  const isActive = index === current
                  const isComplete = index < current
                  return (
                    <button
                      key={`${item.text}-${index}`}
                      type="button"
                      className="focus-visible:ring-ring focus-visible:ring-offset-muted flex h-10 min-w-8 flex-1 items-center rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none active:scale-[0.96] sm:min-w-0 sm:shrink"
                      onClick={() => go(index, index >= current ? 1 : -1)}
                      aria-label={`Go to tip ${index + 1}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className="bg-foreground/15 relative h-1 w-full overflow-hidden rounded-full">
                        {showProgress ? (
                          isComplete ? (
                            <span className="bg-foreground/70 absolute inset-0 rounded-full" />
                          ) : isActive ? (
                            <span ref={bar} className="bg-foreground/70 absolute inset-0 origin-left rounded-full" style={{ transform: `scaleX(${prefersReducedMotion ? 1 : 0})` }} />
                          ) : null
                        ) : (
                          <span
                            className={cn(
                              'bg-foreground/70 absolute inset-0 origin-left rounded-full transition-transform',
                              prefersReducedMotion ? 'duration-0' : 'duration-300 ease-out',
                              isActive ? 'scale-x-100' : 'scale-x-0',
                            )}
                          />
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            <div className="text-primary flex min-w-0 items-center gap-2" aria-live="polite">
              {backgroundTips ? (
                <span className="text-sm font-medium whitespace-nowrap tabular-nums">
                  Tip {current + 1}/{count}
                </span>
              ) : (
                <div className="max-w-full min-w-0">
                  {tip?.url ? (
                    <a
                      href={tip.url}
                      className="focus-visible:ring-ring focus-visible:ring-offset-muted block max-w-full rounded-sm text-base leading-tight font-medium tracking-tight text-pretty wrap-break-word focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none lg:text-xl xl:font-semibold"
                    >
                      {tip.text}
                    </a>
                  ) : (
                    <span className="block max-w-full text-base leading-tight font-medium tracking-tight text-pretty wrap-break-word lg:text-2xl xl:font-semibold">{tip?.text}</span>
                  )}
                </div>
              )}
              {backgroundTips && <Chevron dir="right" className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingCarousel
