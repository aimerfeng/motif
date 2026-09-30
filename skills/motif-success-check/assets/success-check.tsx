import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'burst',
  size: 96,
  color: '#22c55e',
  thickness: 5,
  duration: 1.2,
  loop: true,
  hold: 2.8,
  label: 'Success',
}
/* @motif:end */

export type SuccessCheckProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

const clamp = (v: number) => Math.min(Math.max(v, 0), 1)
/** 把时间 t 落在 [a, b] 里的进度归一化到 0–1。 */
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOutCubic = (x: number) => 1 - (1 - x) ** 3
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)
const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
}

function onColor(hex: string): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.62 ? '#ffffff' : '#0a0a0a'
}

/** 十二瓣的「印章」轮廓：半径随角度起伏，采样成多边形路径。 */
function sealPath(radius: number, lobes: number, depth: number): string {
  const points: string[] = []
  const steps = 144
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const r = radius + depth * Math.cos(angle * lobes)
    points.push(`${(50 + Math.cos(angle) * r).toFixed(2)} ${(50 + Math.sin(angle) * r).toFixed(2)}`)
  }
  return `M${points.join('L')}Z`
}

const SEAL = sealPath(35, 12, 2.6)
const CHECK = 'M31 52 44 65 70 36'

/**
 * 画出来的对勾：圆环描边、对勾描边、回弹、涟漪和迸发的粒子，由同一个时间值驱动，
 * 所以每一帧都是确定的。开启「减少动态效果」时直接停在画完的那一帧。
 */
export function SuccessCheck({ className, style, ...props }: SuccessCheckProps) {
  const { variant, size, color, thickness, duration, hold, loop, label } = { ...defaults, ...props }
  const ref = useRef<HTMLSpanElement>(null)
  const [time, setTime] = useState(0)
  const cycle = duration + hold
  const D = duration

  useFrameLoop(ref, ({ time: t }) => setTime(loop ? t % cycle : Math.min(t, D + 0.5)), { reducedMotion: 'static', staticTime: D * 1.05 })

  const t = time
  const ink = onColor(color)
  // 循环末尾 0.35 秒整体淡出，下一轮从空白重新画起
  const fade = loop ? 1 - seg(t, cycle - 0.35, cycle) : 1

  const ringP = easeInOut(seg(t, 0, 0.5 * D))
  const soft = seg(t, 0.3 * D, 0.65 * D)
  const checkP = easeOutCubic(seg(t, 0.45 * D, 0.85 * D))
  const pop = 1 + 0.09 * Math.sin(Math.PI * seg(t, 0.75 * D, 1.05 * D))
  const pulse = easeOutCubic(seg(t, 0.55 * D, 1.15 * D))
  const burst = easeOutCubic(seg(t, 0.5 * D, 1.05 * D))
  const stampScale = easeOutBack(seg(t, 0, 0.45 * D))
  const ringRadius = variant === 'burst' ? 27 : 33

  return (
    <span ref={ref} role="img" aria-label={label} className={cn('inline-block shrink-0', className)} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden style={{ opacity: fade }}>
        {/* 涟漪：所有样式共用，从边缘向外扩散并淡出 */}
        {pulse > 0 && pulse < 1 && <circle cx="50" cy="50" r={ringRadius + 2 + 16 * pulse} fill="none" stroke={color} strokeWidth={Math.max(thickness * 0.5, 1.5) * (1 - pulse * 0.6)} opacity={0.55 * (1 - pulse)} />}

        {variant === 'burst' && burst > 0 && burst < 1 && (
          <g stroke={color} strokeLinecap="round">
            {Array.from({ length: 10 }, (_, i) => {
              const angle = ((i * 36 + 18) * Math.PI) / 180
              const from = 36 + 10 * burst
              const to = from + 9 * (1 - burst)
              return <line key={i} x1={50 + Math.cos(angle) * from} y1={50 + Math.sin(angle) * from} x2={50 + Math.cos(angle) * to} y2={50 + Math.sin(angle) * to} strokeWidth={thickness * 0.5} opacity={1 - burst ** 2} />
            })}
            {Array.from({ length: 10 }, (_, i) => {
              const angle = ((i * 36) * Math.PI) / 180
              const radius = 38 + 12 * burst
              return <circle key={`d${i}`} cx={50 + Math.cos(angle) * radius} cy={50 + Math.sin(angle) * radius} r={Math.max(0.3, 1.9 * (1 - burst))} fill={color} stroke="none" opacity={0.9 * (1 - burst)} />
            })}
          </g>
        )}

        {(variant === 'circle' || variant === 'burst') && (
          <g>
            <circle cx="50" cy="50" r={ringRadius} fill={color} fillOpacity={0.14 * soft} />
            <circle cx="50" cy="50" r={ringRadius} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ringP} transform="rotate(-90 50 50)" />
            <path d={CHECK} fill="none" stroke={color} strokeWidth={thickness * 1.15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - checkP} transform={`translate(50 50) scale(${variant === 'burst' ? 0.86 : 1}) scale(${pop}) translate(-50 -50)`} />
          </g>
        )}

        {variant === 'stamp' && (
          <g transform={`translate(50 50) scale(${Math.max(stampScale, 0.001) * pop}) translate(-50 -50)`}>
            <circle cx="50" cy="50" r="34" fill={color} />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.2" />
            <path d={CHECK} fill="none" stroke={ink} strokeWidth={thickness * 1.15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - checkP} />
          </g>
        )}

        {variant === 'seal' && (
          <g transform={`translate(50 50) rotate(${-40 * (1 - easeOutCubic(seg(t, 0, 0.6 * D)))}) scale(${Math.max(stampScale, 0.001) * pop}) translate(-50 -50)`}>
            <path d={SEAL} fill={color} />
            <path d={SEAL} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" transform="translate(50 50) scale(0.86) translate(-50 -50)" />
            <path d={CHECK} fill="none" stroke={ink} strokeWidth={thickness * 1.15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - checkP} />
          </g>
        )}
      </svg>
    </span>
  )
}
