// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/power-off-slide/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#ff5a47',
  icon: 'arrow',
  size: 60,
  width: 320,
  shimmer: 2.4,
  spring: {
    visualDuration: 0.3,
    bounce: 0.2,
  },
  label: 'Slide to power off',
  doneLabel: 'Shutting down…',
}
/* @motif:end */

export type SlideToConfirmProps = Partial<typeof defaults> & {
  onConfirm?: () => void
  /** 受控：已确认。不传则由组件自己管理，并在 resetAfter 毫秒后复位。 */
  done?: boolean
  /** 确认后多久自动复位（毫秒），0 为不复位。 */
  resetAfter?: number
  /** 强制把手位置 0–1（演示自动播放用）。 */
  progress?: number
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

function Glyph({ icon, done, size }: { icon: string; done: boolean; size: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
  if (done) {
    return (
      <svg {...common}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    )
  }
  if (icon === 'power') {
    return (
      <svg {...common}>
        <path d="M12 3v8" />
        <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
      </svg>
    )
  }
  if (icon === 'lock') {
    return (
      <svg {...common}>
        <rect x="5" y="11" width="14" height="9" rx="2.5" />
        <path d="M8.5 11V8a3.5 3.5 0 0 1 6.8-1.2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="m7.5 6.5 5.5 5.5-5.5 5.5" />
      <path d="m12.5 6.5 5.5 5.5-5.5 5.5" opacity="0.5" />
    </svg>
  )
}

/** 滑动确认：把手拖过约 80% 才算数，否则弹回；Enter / Space / → 也能直接确认。 */
export function SlideToConfirm({ onConfirm, done: controlledDone, resetAfter = 2400, progress, disabled, className, style, ...props }: SlideToConfirmProps) {
  const { color, icon, size, width, shimmer, spring, label, doneLabel } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(width)
  const [inner, setInner] = useState(false)
  const dragging = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const done = controlledDone ?? inner

  const pad = 4
  const knob = size - pad * 2
  const max = Math.max(1, trackWidth - knob - pad * 2)
  const x = useMotionValue(0)
  const fillScale = useTransform(() => Math.min(1, (x.get() + knob + pad * 2) / Math.max(1, trackWidth)))
  const labelOpacity = useTransform(() => Math.max(0, 1 - (x.get() / max) * 1.7))

  useEffect(() => {
    const el = track.current
    if (!el) return
    const observer = new ResizeObserver(() => setTrackWidth(el.clientWidth))
    observer.observe(el)
    setTrackWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  // 外部强制位置（演示）优先；否则跟随 done 状态
  useEffect(() => {
    if (progress !== undefined) {
      x.set(Math.min(1, Math.max(0, progress)) * max)
      return
    }
    if (dragging.current) return
    const controls = animate(x, done ? max : 0, transition)
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, done, max])

  useEffect(() => () => clearTimeout(timer.current), [])

  const confirm = () => {
    if (disabled || done) return
    if (controlledDone === undefined) {
      setInner(true)
      if (resetAfter > 0) {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setInner(false), resetAfter)
      }
    }
    onConfirm?.()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault()
      confirm()
    }
  }

  return (
    <div className={cn('relative select-none', disabled && 'opacity-50', className)} style={{ width, maxWidth: '100%', ...style }}>
      <div
        ref={track}
        role="group"
        aria-label={label}
        className="relative overflow-hidden rounded-full border bg-foreground/[0.06] shadow-inner"
        style={{ '--c': color, height: size } as CSSProperties}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-left"
          style={{ scaleX: fillScale, background: `linear-gradient(90deg, color-mix(in oklab, ${color} 8%, transparent), color-mix(in oklab, ${color} 55%, transparent))` }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 grid place-items-center text-[15px] font-medium"
          style={{ paddingLeft: knob + pad, opacity: done ? 0 : labelOpacity }}
        >
          <span className={cn('stc-shimmer', !reduced && 'stc-shimmer-run')} style={{ '--stc-dur': `${shimmer}s` } as CSSProperties}>
            {label}
          </span>
        </motion.div>
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-0 grid place-items-center text-[15px] font-medium text-foreground transition-opacity duration-200 motion-reduce:transition-none"
          style={{ opacity: done ? 1 : 0, paddingRight: knob + pad }}
        >
          {done ? doneLabel : ''}
        </div>
        <motion.div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-disabled={disabled}
          onKeyDown={onKeyDown}
          drag={disabled || done ? false : 'x'}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => {
            dragging.current = true
          }}
          onDragEnd={() => {
            dragging.current = false
            if (x.get() > max * 0.8) {
              // 受控时先回到起点，父组件把 done 设为 true 后会自己滑到终点
              animate(x, controlledDone === undefined ? max : 0, transition)
              confirm()
            } else animate(x, 0, transition)
          }}
          className={cn(
            'absolute grid touch-none place-items-center rounded-full bg-background text-(--c) shadow-md ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-(--c)',
            disabled || done ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
          )}
          style={{ x, top: pad, left: pad, width: knob, height: knob }}
        >
          <Glyph icon={icon} done={done} size={Math.round(knob * 0.46)} />
        </motion.div>
      </div>
    </div>
  )
}
