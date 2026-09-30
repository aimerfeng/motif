// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/particle-button.tsx
// Modified by Motif; see the item's provenance.
import { animate, motion, useAnimationControls, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Send message',
  doneLabel: 'Sent',
  particleCount: 20,
  spread: 104,
  particleSize: 7,
  duration: 0.9,
  gravity: 26,
  shape: 'mix',
  colors: ['#a78bfa', '#f472b6', '#38bdf8', '#fbbf24'],
}
/* @motif:end */

export type ParticleButtonProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 递增这个数字即可从外部触发一次迸发（演示的自动播放用）。 */
  burstKey?: number
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

/** 可复现的伪随机数：同一次迸发在任何时候渲染都一样，录屏才稳定。 */
function seeded(seed: number) {
  let a = (seed * 2654435761) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SPARK = 'M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z'

type Particle = { dx: number; dy: number; fall: number; size: number; color: string; delay: number; spark: boolean; spin: number }

function makeParticles(id: number, count: number, spread: number, size: number, gravity: number, shape: string, colors: string[]): Particle[] {
  const random = seeded(id)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.9
    const distance = spread * (0.45 + random() * 0.55)
    return {
      // 按钮是横向的，水平方向多飞一点；整体略向上，落下时再受重力。
      dx: Math.cos(angle) * distance * 1.2,
      dy: Math.sin(angle) * distance * 0.7 - distance * 0.12,
      fall: gravity * (0.6 + random() * 0.8),
      size: size * (0.55 + random() * 0.9),
      color: colors[i % colors.length] ?? '#ffffff',
      delay: random() * 0.07,
      spark: shape === 'spark' || (shape === 'mix' && i % 3 === 0),
      spin: (random() - 0.5) * 240,
    }
  })
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (v: number) => 1 - (1 - v) ** 3
/** 0 → mid（前 30%）→ end，两段都缓出，对应原来的三个关键帧。 */
const lerp3 = (v: number, mid: number, end: number) => (v < 0.3 ? easeOut(v / 0.3) * mid : mid + easeOut((v - 0.3) / 0.7) * (end - mid))

function Particle({ p, clock, duration }: { p: Particle; clock: MotionValue<number>; duration: number }) {
  // 进度由一个 motion value 驱动，而不是 WAAPI 加速的 opacity 动画：这样手动时钟录屏时每一帧都是确定的。
  const local = (v: number) => clamp01((v - p.delay) / duration)
  const x = useTransform(clock, (v) => lerp3(local(v), p.dx, p.dx * 1.06))
  const y = useTransform(clock, (v) => lerp3(local(v), p.dy, p.dy + p.fall))
  const scale = useTransform(clock, (v) => {
    const t = local(v)
    return t <= 0 ? 0 : t < 0.3 ? easeOut(t / 0.3) : 1 - easeOut((t - 0.3) / 0.7)
  })
  const opacity = useTransform(clock, (v) => {
    const t = local(v)
    return t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45
  })
  const rotate = useTransform(clock, (v) => p.spin * easeOut(local(v)))
  const box = p.size * (p.spark ? 2 : 1)
  return (
    <motion.span className="absolute top-1/2 left-1/2" style={{ width: box, height: box, marginLeft: -box / 2, marginTop: -box / 2, x, y, scale, opacity, rotate }}>
      {p.spark ? (
        <svg viewBox="0 0 24 24" className="size-full" fill={p.color}>
          <path d={SPARK} />
        </svg>
      ) : (
        <span className="block size-full rounded-full" style={{ background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}` }} />
      )}
    </motion.span>
  )
}

function Burst({ particles, duration, color }: { particles: Particle[]; duration: number; color: string }) {
  const clock = useMotionValue(0)
  useEffect(() => {
    const total = duration + 0.1
    const controls = animate(clock, total, { duration: total, ease: 'linear' })
    return () => controls.stop()
  }, [clock, duration])
  const ringScale = useTransform(clock, (v) => 1 + 0.35 * easeOut(clamp01(v / (duration * 0.75))))
  const ringOpacity = useTransform(clock, (v) => 0.9 * (1 - easeOut(clamp01(v / (duration * 0.75)))))
  return (
    <>
      <motion.span className="absolute inset-0 rounded-full border-2" style={{ borderColor: color, scale: ringScale, opacity: ringOpacity }} />
      {particles.map((p, i) => (
        <Particle key={i} p={p} clock={clock} duration={duration} />
      ))}
    </>
  )
}

/**
 * 点击时迸出粒子的按钮。粒子画在按钮内部的绝对定位层上，不会被布局或滚动甩开。
 */
export function ParticleButton({ className, style, burstKey, onClick, ...props }: ParticleButtonProps) {
  const { label, doneLabel, particleCount, spread, particleSize, duration, gravity, shape, colors } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const controls = useAnimationControls()
  const [burst, setBurst] = useState(0)
  const [done, setDone] = useState(false)
  const counter = useRef(0)
  const holdSeconds = Math.max(duration + 0.6, 1.5)

  const fire = useCallback(() => {
    counter.current += 1
    setBurst(counter.current)
    setDone(true)
    if (!reduced) void controls.start({ scale: [1, 0.93, 1], transition: { duration: 0.38, times: [0, 0.3, 1], ease: 'easeOut' } })
  }, [controls, reduced])

  // 外部触发：burstKey 变化时迸发一次（跳过初始值）。
  const lastKey = useRef(burstKey)
  useEffect(() => {
    if (burstKey === undefined || burstKey === lastKey.current) return
    lastKey.current = burstKey
    if (burstKey > 0) fire()
  }, [burstKey, fire])

  // 用 rAF 计时而不是 setTimeout，这样手动时钟录屏和真实播放的表现一致。
  useEffect(() => {
    if (!burst) return
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      if (now - start >= holdSeconds * 1000) {
        setDone(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [burst, holdSeconds])

  const particles = useMemo(
    () => (burst && !reduced ? makeParticles(burst, particleCount, spread, particleSize, gravity, shape, colors) : []),
    [burst, reduced, particleCount, spread, particleSize, gravity, shape, colors],
  )

  const swap = (visible: boolean, from: number) => ({
    opacity: visible ? 1 : 0,
    y: reduced ? 0 : visible ? 0 : from,
    filter: reduced || visible ? 'blur(0px)' : 'blur(4px)',
  })

  return (
    <motion.button
      type="button"
      animate={controls}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      onClick={(event) => {
        fire()
        onClick?.(event)
      }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium tracking-tight text-background shadow-lg shadow-black/30 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      style={style}
    >
      {/* 两个文案叠在同一格里，按钮宽度取较长的那个，切换时不会抖。 */}
      <span className="grid place-items-center">
        <motion.span className="col-start-1 row-start-1" animate={swap(!done, -10)} transition={{ duration: 0.22 }} aria-hidden={done}>
          {label}
        </motion.span>
        <motion.span className="col-start-1 row-start-1 inline-flex items-center gap-1.5" animate={swap(done, 10)} transition={{ duration: 0.22 }} aria-hidden={!done}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
          {doneLabel}
        </motion.span>
      </span>

      <span className="pointer-events-none absolute inset-0" aria-hidden>
        {burst > 0 && !reduced && <Burst key={burst} particles={particles} duration={duration} color={colors[0] ?? '#ffffff'} />}
      </span>
    </motion.button>
  )
}
