// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/quantum.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'helix',
  size: 48,
  color: '#e0e7ff',
  farColor: '#818cf8',
  particleSize: 1,
  depth: 1,
  speed: 1,
  label: 'Loading',
}
/* @motif:end */

export type LoaderDepthParticlesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

type Options = {
  variant: string
  size: number
  color: string
  farColor: string
  particleSize: number
  depth: number
  speed: number
  label: string
}

/** 上游各元素的默认时长（秒），除以 speed 得到实际时长。 */
const BASE_SECONDS: Record<string, number> = { helix: 2.5, quantum: 1.75, grid: 1.5, superballs: 1.4 }

/** quantum 的 13 个粒子：静态旋转角和相位延迟（单位：一个周期），照抄上游。 */
const QUANTUM: [number, number][] = [
  [8, 0], [36, -0.4], [72, -0.9], [90, -0.5], [144, -0.3], [180, -0.2], [216, -0.6],
  [252, -0.7], [300, -0.1], [324, -0.8], [335, -1.2], [290, -0.5], [240, -0.2],
]

/** grid 的 16 个点：bottom%、right%、延迟（周期）、上游的远近缩放。 */
const GRID: [number, number, number, number][] = [
  [24, -35, -0.48, 0.94], [16, -6, -0.4, 0.96], [8, 23, -0.32, 0.98], [-1, 51, -0.24, 0.92],
  [38, -17.5, -0.4, 0.9], [30, 10, -0.32, 0.92], [22, 39, -0.24, 0.94], [14, 67, -0.16, 0.96],
  [53, -0.8, -0.32, 0.86], [44.5, 27, -0.24, 0.88], [36, 55.7, -0.16, 0.9], [28.7, 84.3, -0.08, 0.92],
  [66.8, 15, -0.24, 0.82], [58.8, 43, -0.16, 0.84], [50, 72, -0.08, 0.86], [42, 100, 0, 0.88],
]

const vars = (v: Record<string, string | number>) => v as CSSProperties

/**
 * 减少动态效果时的静态姿态：预览时钟会直接改写动画的 currentTime，暂停不可靠，
 * 所以按相位算出每颗粒子在轨道上的位置，CSS 里关掉动画后用这些变量定格。
 * 相位 p 处 x = cos(2πp)，纵深 f = (1 - sin(2πp)) / 2（0 最远、1 最近），与关键帧一致。
 */
function orbitPose(d: number, amp: number, farScale: number, farOp: number) {
  const p = (((-d % 1) + 1) % 1) * Math.PI * 2
  const f = (1 - Math.sin(p)) / 2
  return {
    '--mdp-d': d,
    '--mdp-sx': `${(amp * Math.cos(p)).toFixed(2)}px`,
    '--mdp-ss': (farScale + (1 - farScale) * f).toFixed(3),
    '--mdp-so': (farOp + (1 - farOp) * f).toFixed(3),
    '--mdp-st': (1 - f).toFixed(3),
  }
}

function Dot({ className, style, tint }: { className?: string; style?: CSSProperties; tint?: number }) {
  return (
    <i className={cn('mdp-dot', className)} style={style}>
      <i className="mdp-tint" style={tint === undefined ? undefined : { opacity: tint }} />
    </i>
  )
}

/**
 * 纵深粒子加载器：只用缩放和透明度伪造 3D —— DNA 双螺旋、量子云、等距点阵、交叉电子。
 * 远处的粒子更小、更淡并渐变到 farColor；depth 控制远近差异。
 */
export function LoaderDepthParticles({ className, style, ...props }: LoaderDepthParticlesProps) {
  const { variant, size, color, farColor, particleSize, depth, speed, label } = {
    ...defaults,
    ...props,
  } as Options
  const seconds = (BASE_SECONDS[variant] ?? 2) / Math.max(speed, 0.1)
  // 上游最远处 scale 0.47368、opacity 0.3；depth=1 时与上游一致。
  const farScale = Math.max(0.2, 1 - 0.52632 * depth)
  const farOp = Math.max(0.08, 1 - 0.7 * depth)

  const root = vars({
    '--mdp-size': `${size}px`,
    '--mdp-color': color,
    '--mdp-far': farColor,
    '--mdp-dur': `${seconds}s`,
    '--mdp-far-scale': farScale,
    '--mdp-far-op': farOp,
    '--mdp-mid-scale': (1 + farScale) / 2,
    '--mdp-mid-op': (1 + farOp) / 2,
  })

  let body: ReactNode
  if (variant === 'helix') {
    body = (
      <div className="mdp-container mdp-helix" style={vars({ '--mdp-dot': `${(size / 6) * particleSize}px`, '--mdp-amp': `${size * 0.25}px` })}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="mdp-slice">
            <Dot className="mdp-orbit" style={vars(orbitPose(-i / 6, size * 0.25, farScale, farOp))} />
            <Dot className="mdp-orbit" style={vars(orbitPose(-0.5 - i / 6, size * 0.25, farScale, farOp))} />
          </div>
        ))}
      </div>
    )
  } else if (variant === 'quantum') {
    body = (
      <div className="mdp-container mdp-quantum" style={vars({ '--mdp-dot': `${size * 0.175 * particleSize}px`, '--mdp-amp': `${size * 0.5}px` })}>
        {QUANTUM.map(([deg, d], i) => (
          <div key={i} className="mdp-particle" style={{ transform: `rotate(${deg}deg)` }}>
            <Dot className="mdp-orbit" style={vars(orbitPose(d, size * 0.5, farScale, farOp))} />
          </div>
        ))}
      </div>
    )
  } else if (variant === 'grid') {
    body = (
      <div className="mdp-container mdp-grid" style={vars({ '--mdp-cell': `${size * 0.1}px`, '--mdp-dot': `${size * 0.1 * particleSize}px` })}>
        {GRID.map(([bottom, right, d, s], i) => {
          const scale = Math.max(0.3, 1 - (1 - s) * depth)
          const tint = Math.min(1, Math.max(0, (0.98 - s) / 0.16))
          return (
            <div
              key={i}
              className="mdp-grid-cell"
              style={vars({
                '--mdp-bottom': `${bottom}%`,
                '--mdp-right': `${right}%`,
                '--mdp-d': d,
                '--mdp-scale': scale,
                '--mdp-sy': `${(120 * Math.cos((((-d % 1) + 1) % 1) * Math.PI * 2)).toFixed(1)}%`,
              })}
            >
              <Dot tint={tint} />
            </div>
          )
        })}
      </div>
    )
  } else {
    body = (
      <div className="mdp-container" style={vars({ '--mdp-dot': `${size * 0.35 * particleSize}px`, '--mdp-amp': `${size * 0.5}px` })}>
        <div className="mdp-electron" style={{ transform: 'rotate(45deg)' }}>
          <Dot className="mdp-orbit" style={vars(orbitPose(-0.143, size * 0.5, farScale, farOp))} />
        </div>
        <div className="mdp-electron" style={{ transform: 'rotate(-45deg)' }}>
          <Dot className="mdp-orbit" style={vars(orbitPose(-0.5, size * 0.5, farScale, farOp))} />
        </div>
      </div>
    )
  }

  return (
    <span role="status" aria-live="polite" aria-busy="true" data-variant={variant} className={cn('mdp-root', className)} style={{ ...root, ...style }}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="contents">
        {body}
      </span>
    </span>
  )
}
