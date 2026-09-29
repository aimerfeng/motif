// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/background-paths.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useId, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  count: 40,
  amplitude: 1,
  mirror: true,
  strokeWidth: 1.5,
  baseOpacity: 0.12,
  colors: ['#8b5cf6', '#ec4899', '#38bdf8'],
  speed: 1,
  streak: 16,
}
/* @motif:end */

export type BackgroundPathsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Kind = 'primary' | 'secondary' | 'accent'

/** 一条从右上向左下展开的贝塞尔曲线，叠加三层正弦起伏（沿用上游的算法）。 */
function generatePath(index: number, total: number, position: number, kind: Kind, amplitude: number): string {
  const base = (kind === 'primary' ? 150 : kind === 'secondary' ? 100 : 60) * amplitude
  const phase = index * 0.2
  const segments = kind === 'primary' ? 10 : kind === 'secondary' ? 8 : 6
  const startX = 2400
  const startY = 800
  const endX = -2400
  const endY = -800 + index * (1000 / total)

  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= segments; i++) {
    const progress = i / segments
    const eased = 1 - (1 - progress) ** 2
    const baseX = startX + (endX - startX) * eased
    const baseY = startY + (endY - startY) * eased
    const falloff = 1 - eased * 0.3
    const wave1 = Math.sin(progress * Math.PI * 3 + phase) * base * 0.7 * falloff
    const wave2 = Math.cos(progress * Math.PI * 4 + phase) * base * 0.3 * falloff
    const wave3 = Math.sin(progress * Math.PI * 2 + phase) * base * 0.2 * falloff
    points.push({ x: baseX * position, y: baseY + wave1 + wave2 + wave3 })
  }

  const tension = 0.4
  return points
    .map((point, i) => {
      if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
      const prev = points[i - 1]!
      const cp1x = prev.x + (point.x - prev.x) * tension
      const cp2x = prev.x + (point.x - prev.x) * (1 - tension)
      return `C ${cp1x.toFixed(1)} ${prev.y.toFixed(1)}, ${cp2x.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    })
    .join(' ')
}

const KINDS: Kind[] = ['primary', 'secondary', 'accent']
// 三层曲线的流动周期（秒，speed = 1）。互为约数，循环视频可以无缝衔接。
const PERIODS: Record<Kind, number> = { primary: 6, secondary: 3, accent: 2 }

type PathItem = { d: string; kind: Kind; width: number; alpha: number; phase: number }

export function BackgroundPaths({ className, style, children, ...props }: BackgroundPathsProps) {
  const { count, amplitude, mirror, strokeWidth, baseOpacity, colors, speed, streak } = { ...defaults, ...props }
  const gradientId = `bp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const flowRefs = useRef<(SVGPathElement | null)[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  const paths = useMemo<PathItem[]>(() => {
    const fans = mirror ? [1, -1] : [1]
    const perFan = Math.max(6, Math.round(count / fans.length))
    return fans.flatMap((position, fan) =>
      Array.from({ length: perFan }, (_, i) => {
        const kind = KINDS[i % 3]!
        return {
          d: generatePath(i, perFan, position, kind, amplitude),
          kind,
          width: 2.4 + (i % 5) * 0.55,
          alpha: 0.65 + ((i * 7 + fan * 3) % 10) * 0.045,
          // 每条曲线的流动相位错开，画面里的光点疏密自然。
          phase: ((i * 0.618 + fan * 0.31) % 1) as number,
        }
      }),
    )
  }, [count, amplitude, mirror])

  const streakLength = streak / 100
  const dashOffset = (item: PathItem, time: number) => -(((time / PERIODS[item.kind] + item.phase) % 1 + 1) % 1)

  // 只有光点在动：每帧改写 dashoffset。减少动态效果时停在 staticTime 这一帧。
  useFrameLoop(
    rootRef,
    ({ time }) => {
      paths.forEach((item, i) => flowRefs.current[i]?.setAttribute('stroke-dashoffset', String(dashOffset(item, time))))
    },
    { speed, reducedMotion: 'static', staticTime: 2.4 },
  )

  return (
    <div ref={rootRef} className={cn('relative isolate overflow-hidden bg-background', className)} style={style}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 60% 55% at 62% 58%, color-mix(in oklab, ${colors[0]} 16%, transparent), transparent 70%)` }}
      />
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" fill="none" preserveAspectRatio="xMidYMid slice" viewBox="-2400 -800 4800 1600">
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="-1700" x2="1700" y1="0" y2="0">
            {colors.map((color, i) => (
              <stop key={`${color}-${i}`} offset={`${colors.length === 1 ? 0 : (i / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
        {/* 底线：整条曲线淡淡地铺开，构成丝带的形状。 */}
        <g stroke={`url(#${gradientId})`} strokeLinecap="round" strokeOpacity={baseOpacity}>
          {paths.map((item, i) => (
            <path key={`base-${i}`} d={item.d} strokeWidth={item.width * strokeWidth} />
          ))}
        </g>
        {/* 光点：同一条曲线上的一段亮线，沿着曲线流动。pathLength 归一化后 dashoffset 走 0 → -1 正好一圈。 */}
        <g stroke={`url(#${gradientId})`} strokeLinecap="round">
          {paths.map((item, i) => (
            <path
              key={`flow-${i}`}
              ref={(el) => {
                flowRefs.current[i] = el
              }}
              d={item.d}
              pathLength={1}
              strokeWidth={item.width * strokeWidth * 1.15}
              strokeOpacity={item.alpha}
              strokeDasharray={`${streakLength} ${1 - streakLength}`}
              strokeDashoffset={dashOffset(item, 2.4)}
            />
          ))}
        </g>
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, color-mix(in oklab, var(--background) 75%, transparent) 100%)' }}
      />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
