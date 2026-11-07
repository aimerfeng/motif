// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/card-flip.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  title: 'Motion Fundamentals',
  subtitle: 'A six-part course for product teams',
  accent: '#ff9f1c',
  radius: 16,
  trigger: 'hover',
  axis: 'y',
  duration: 0.6,
  easing: [0.77, 0, 0.175, 1],
}
/* @motif:end */

export type CardFlipProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 背面的说明文字。 */
  description?: string
  /** 背面的要点列表，翻过来时依次滑入。 */
  features?: string[]
  /** 背面按钮的文案。 */
  ctaLabel?: string
  onAction?: () => void
  /** 受控用法：是否翻到背面。不传时卡片自己记住状态。 */
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
}

const ARROW = 'M5 12h14m-6-6 6 6-6 6'
/** 两道首尾相接的弧形箭头：翻面。 */
const FLIP = 'M4.5 12a7.5 7.5 0 0 1 13.2-4.9M19.5 12a7.5 7.5 0 0 1-13.2 4.9M18 3.5v4h-4M6 20.5v-4h4'

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

/**
 * 翻转卡片：正面是一团缓缓收缩的光和标题，悬停（或点击）后整张卡在三维空间里翻到背面，要点依次滑入。
 * 两面各有一个翻面按钮，键盘和触屏都能用；看不见的那一面设为 inert，Tab 不会走到背面去。
 */
export function CardFlip({
  className,
  style,
  description = 'Timing, easing and choreography for product UI, in 24 short exercises.',
  features = ['Six video lessons', '24 hands-on exercises', 'Figma and code files', 'Certificate on completion'],
  ctaLabel = 'Start lesson one',
  onAction,
  flipped,
  onFlippedChange,
  ...props
}: CardFlipProps) {
  const { title, subtitle, accent, trigger, axis, duration, easing, radius } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const [own, setOwn] = useState(false)
  const isFlipped = flipped ?? own
  const frontButton = useRef<HTMLButtonElement>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  const moveFocus = useRef<'front' | 'back' | null>(null)

  const set = (next: boolean) => {
    if (flipped === undefined) setOwn(next)
    onFlippedChange?.(next)
  }

  // 用翻面按钮翻过去之后，焦点跟到另一面的翻面按钮上（原来的按钮已经被 inert 了）。
  useEffect(() => {
    const target = moveFocus.current
    if (!target) return
    moveFocus.current = null
    ;(target === 'back' ? backButton : frontButton).current?.focus({ preventScroll: true })
  }, [isFlipped])

  const flipBy = (next: boolean) => {
    moveFocus.current = next ? 'back' : 'front'
    set(next)
  }

  const rotate = axis === 'x' ? 'rotateX' : 'rotateY'
  const ease = `cubic-bezier(${easing.join(', ')})`
  // 减少动态效果：不转动，两面原地交叉淡入淡出。
  const face = (visible: boolean): CSSProperties =>
    reduced ? { opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease-out', borderRadius: radius } : { borderRadius: radius }

  return (
    <div
      className={cn('mcf group relative h-[320px] w-full max-w-[280px] [perspective:2000px]', trigger === 'click' && 'cursor-pointer', className)}
      style={cssVars({ '--mcf-accent': accent, '--mcf-glow': `color-mix(in srgb, ${accent} 50%, transparent)` }, style)}
      data-flipped={isFlipped ? '' : undefined}
      onPointerEnter={trigger === 'hover' ? (event) => event.pointerType === 'mouse' && set(true) : undefined}
      onPointerLeave={trigger === 'hover' ? (event) => event.pointerType === 'mouse' && set(false) : undefined}
      onClick={
        trigger === 'click'
          ? (event) => {
              if ((event.target as HTMLElement).closest('button')) return
              set(!isFlipped)
            }
          : undefined
      }
    >
      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ transform: reduced ? 'none' : `${rotate}(${isFlipped ? 180 : 0}deg)`, transition: `transform ${duration}s ${ease}` }}
      >
        {/* 正面 */}
        <div
          inert={isFlipped}
          className="absolute inset-0 overflow-hidden border bg-card shadow-lg shadow-black/30 [backface-visibility:hidden]"
          style={face(!isFlipped)}
        >
          <div className="relative h-full overflow-hidden bg-[linear-gradient(to_bottom,var(--card),var(--background))]">
            <div aria-hidden className="absolute inset-0 flex items-start justify-center pt-24">
              <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className="mcf-ring" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <h3 className="text-lg leading-snug font-semibold tracking-tighter text-card-foreground transition-transform duration-500 group-hover:-translate-y-1">{title}</h3>
                <p className="line-clamp-2 text-sm tracking-tight text-pretty text-muted-foreground transition-transform delay-50 duration-500 group-hover:-translate-y-1">{subtitle}</p>
              </div>
              <button
                ref={frontButton}
                type="button"
                aria-label="Show details"
                onClick={() => flipBy(true)}
                className="relative grid size-9 shrink-0 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: 'var(--mcf-accent)', background: 'color-mix(in srgb, var(--mcf-accent) 14%, transparent)' }}
              >
                <Icon d={FLIP} className="size-4 transition-transform duration-300 group-hover:-rotate-12" />
              </button>
            </div>
          </div>
        </div>

        {/* 背面 */}
        <div
          inert={!isFlipped}
          className="absolute inset-0 flex flex-col border bg-[linear-gradient(to_bottom,var(--card),var(--background))] p-6 shadow-lg shadow-black/30 [backface-visibility:hidden]"
          style={{ ...face(isFlipped), transform: reduced ? undefined : `${rotate}(180deg)` }}
        >
          <div className="flex-1 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg leading-snug font-semibold tracking-tight text-card-foreground">{title}</h3>
                <button
                  ref={backButton}
                  type="button"
                  aria-label="Show front"
                  onClick={() => flipBy(false)}
                  className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none hover:text-card-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon d={FLIP} className="size-4" />
                </button>
              </div>
              <p className="line-clamp-2 text-sm tracking-tight text-pretty text-muted-foreground">{description}</p>
            </div>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-card-foreground/85 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    transform: isFlipped || reduced ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: isFlipped ? `${index * 50 + 150}ms` : '0ms',
                  }}
                >
                  <Icon d={ARROW} className="size-3 shrink-0 text-(--mcf-accent)" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 按钮的内边距用负外边距抵消，不占卡片高度。 */}
          <div className="mt-5 border-t pt-4">
            <button
              type="button"
              onClick={onAction}
              className="group/cta -mx-3 -my-2 flex w-[calc(100%+1.5rem)] items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-card-foreground outline-none transition-[background-color,scale] duration-300 hover:bg-[color-mix(in_srgb,var(--mcf-accent)_14%,transparent)] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              {ctaLabel}
              <Icon d={ARROW} className="size-4 text-(--mcf-accent) transition-transform duration-300 group-hover/cta:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
