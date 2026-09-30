import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'gradient',
  thickness: 10,
  color: '#8b5cf6',
  colorEnd: '#ec4899',
  radius: 24,
  spring: {
    visualDuration: 0.6,
    bounce: 0,
  },
  label: 'Uploading',
  showLabel: true,
  showValue: true,
}
/* @motif:end */

export type ProgressBarProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 0–100。省略或为 null 时是不确定进度（循环扫描），且不写 aria-valuenow。 */
  value?: number | null
}

const STRIPE_PERIOD = 16 * Math.SQRT2

/**
 * 确定进度条：填充层整体平移（transform）而不是改宽度，末端始终保持圆头；
 * 数字与填充同步用弹簧插值。role="progressbar"，带 aria-valuenow / aria-valuetext。
 */
export function ProgressBar({ className, style, value, ...props }: ProgressBarProps) {
  const { variant, thickness, color, colorEnd, radius, spring, label, showValue, showLabel } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const indeterminate = value === undefined || value === null
  const target = indeterminate ? 0 : Math.min(Math.max(value, 0), 100)
  const progress = useMotionValue(target)

  useEffect(() => {
    if (indeterminate) return
    const controls = reduced
      ? animate(progress, target, { duration: 0.2, ease: 'easeOut' })
      : animate(progress, target, { type: 'spring', visualDuration: spring.visualDuration, bounce: Math.min(spring.bounce, 0.3) })
    return () => controls.stop()
  }, [target, indeterminate, reduced, spring.visualDuration, spring.bounce, progress])

  const fillX = useTransform(progress, (v) => `${v - 100}%`)
  const percent = useTransform(progress, (v) => `${Math.round(Math.min(Math.max(v, 0), 100))}%`)
  const rounded = radius
  const segmented = variant === 'segmented'
  const done = !indeterminate && target >= 100

  return (
    <div className={cn('w-full', className)} style={style}>
      {(showLabel || showValue) && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          {showLabel ? <span className="font-medium text-foreground">{label}</span> : <span />}
          {showValue && !indeterminate && (
            <motion.span aria-hidden className="text-xs tabular-nums text-muted-foreground">
              {percent}
            </motion.span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(target)}
        aria-valuetext={indeterminate ? `${label}…` : done ? `${label} complete` : `${label} ${Math.round(target)}%`}
        className="relative w-full overflow-hidden"
        style={
          {
            height: thickness,
            borderRadius: rounded,
            background: 'color-mix(in oklab, var(--foreground) 10%, transparent)',
            // 发光：滤镜作用在裁切之后的轨道上，光晕才不会被 overflow 剪掉。
            filter: variant === 'glow' ? `drop-shadow(0 0 ${thickness * 0.8}px color-mix(in oklab, ${colorEnd} 75%, transparent))` : undefined,
            // 分段：用蒙版把轨道和填充一起切成小格，格宽随粗细变化。
            ...(segmented
              ? {
                  WebkitMaskImage: `repeating-linear-gradient(90deg, #000 0 ${thickness * 0.9}px, transparent ${thickness * 0.9}px ${thickness * 1.3}px)`,
                  maskImage: `repeating-linear-gradient(90deg, #000 0 ${thickness * 0.9}px, transparent ${thickness * 0.9}px ${thickness * 1.3}px)`,
                }
              : null),
          } as CSSProperties
        }
      >
        {indeterminate ? (
          <motion.div
            className="absolute inset-y-0 w-2/5"
            style={{ borderRadius: rounded, background: `linear-gradient(90deg, ${color}, ${colorEnd})` }}
            animate={reduced ? { x: '80%', opacity: [1, 0.5, 1] } : { x: ['-100%', '250%'] }}
            transition={reduced ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 1.5, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{
              x: fillX,
              borderRadius: rounded,
              background: variant === 'solid' || segmented ? color : `linear-gradient(90deg, ${color}, ${colorEnd})`,
            }}
          >
            {variant === 'striped' && (
              <span
                aria-hidden
                className="mpb-stripes absolute inset-y-0"
                style={
                  {
                    left: -STRIPE_PERIOD,
                    right: 0,
                    '--mpb-period': `${STRIPE_PERIOD}px`,
                    backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0 8px, transparent 8px 16px)',
                  } as CSSProperties
                }
              />
            )}
            {variant === 'glow' && (
              <span aria-hidden className="absolute inset-y-0 right-0 w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55))', borderRadius: rounded }} />
            )}
          </motion.div>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {done ? `${label} complete` : ''}
      </span>
    </div>
  )
}
