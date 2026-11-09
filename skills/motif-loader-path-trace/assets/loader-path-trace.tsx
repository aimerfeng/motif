// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/tree/f759f65/src/elements (infinity, squircle, trefoil, reuleaux, square, cardio)
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  shape: 'infinity',
  size: 44,
  color: '#38bdf8',
  stroke: 4,
  dashLength: 16,
  trackOpacity: 16,
  speed: 1,
  delay: 0,
  label: 'Loading',
}
/* @motif:end */

export type LoaderPathTraceProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 是否处于加载中；为 false 时不渲染图形，只保留（空的）读屏区域。 */
  loading?: boolean
}

interface Shape {
  /** 上游的路径数据（50 单位坐标系；心跳线是 40 × 25）。 */
  d: string
  /** 路径本身的包围盒 [x, y, w, h]，viewBox 在它四周再留出半个线宽。 */
  box: readonly [number, number, number, number]
  /** 宽度是 size 的几倍：横向的图形画得更宽，和方形图形的视觉分量一致。 */
  wide: number
  /** 上游调好的一圈秒数，除以 speed 得到实际时长。 */
  seconds: number
  /** 沿路径反向行进（上游 infinity、reuleaux 的 dashoffset 走向 +100）。 */
  reverse?: boolean
  /** 减少动态效果时线段停的位置（dashoffset），挑一段好看的弯。 */
  rest: number
  /** 方框用平头，转角是锐角；其余用圆头。 */
  cap: 'round' | 'butt'
  /** 心跳线：开放路径，从头画到尾再淡出，而不是绕圈。 */
  draw?: boolean
}

const SHAPES: Record<string, Shape> = {
  infinity: {
    d: 'M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z',
    box: [1, 1, 48, 19],
    wide: 1.4,
    seconds: 1.3,
    reverse: true,
    rest: -12,
    cap: 'round',
  },
  squircle: {
    d: 'M0.5,25C0.5,7.8,7.8,0.5,25,0.5S49.5,7.8,49.5,25S42.2,49.5,25,49.5S0.5,42.2,0.5,25z',
    box: [0.5, 0.5, 49, 49],
    wide: 1,
    seconds: 0.9,
    rest: -33,
    cap: 'round',
  },
  trefoil: {
    d: 'M37.2,23.4c0,9.1-4.9,17-12.3,21.2c-3.6,2.1-7.8,3.3-12.3,3.3c-4.5,0-8.6-1.2-12.2-3.3c0-9.1,4.9-16.9,12.3-21.2c3.6-2.1,7.8-3.3,12.2-3.3S33.6,21.3,37.2,23.4c7.3,4.2,12.2,12.1,12.3,21.2c-3.6,2.1-7.8,3.3-12.2,3.3c-4.5,0-8.6-1.2-12.3-3.3c-7.3-4.2-12.2-12.1-12.2-21.2c0-9.1,4.9-17,12.2-21.2C32.3,6.4,37.2,14.3,37.2,23.4z',
    box: [0.4, 2.2, 49.1, 45.7],
    wide: 1,
    seconds: 1.4,
    rest: -5,
    cap: 'round',
  },
  reuleaux: {
    d: 'M49.5,42.9c0-18.1-9.9-34-24.5-42.4C10.4,9,0.5,24.8,0.5,42.9c7.2,4.2,15.6,6.6,24.5,6.6S42.3,47.1,49.5,42.9z',
    box: [0.5, 0.5, 49, 49],
    wide: 1,
    seconds: 0.9,
    reverse: true,
    rest: -10,
    cap: 'round',
  },
  square: {
    // 上游是从左上角起笔的 rect；改成从上边中点起笔，平头线段经过起点时不会在转角留缝。
    d: 'M25,1H49V49H1V1z',
    box: [1, 1, 48, 48],
    wide: 1,
    seconds: 1.2,
    rest: -4,
    cap: 'butt',
  },
  cardio: {
    d: 'M0.5,17.2h8.2l3-4.7l5.9,12l7.8-24l5.9,16.7v0h8.2',
    box: [0.5, 0.5, 39, 24],
    wide: 1.3,
    seconds: 1.5,
    rest: 0,
    cap: 'round',
    draw: true,
  },
}

/**
 * 延迟出现：短请求根本不显示加载器，避免一闪而过。
 * 用 rAF + performance.now 计时而不是 setTimeout，这样手动时钟下也是确定的。
 */
function useDelayedVisible(active: boolean, delayMs: number): boolean {
  const [visible, setVisible] = useState(delayMs <= 0)
  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    if (delayMs <= 0) {
      setVisible(true)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = () => {
      if (performance.now() - start >= delayMs) setVisible(true)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, delayMs])
  return active && visible
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * 描线加载器：一小段线条沿闭合轮廓绕行（无限符号、超椭圆、三叶结、勒洛三角形、方框），
 * 或者心跳线从头画到尾再淡出。开启「减少动态效果」时线段停在轮廓上，只做缓慢的明暗呼吸。
 */
export function LoaderPathTrace({ className, style, loading = true, ...props }: LoaderPathTraceProps) {
  const { shape, size, color, stroke, dashLength, trackOpacity, speed, delay, label } = { ...defaults, ...props }
  const visible = useDelayedVisible(loading, delay * 1000)
  const spec = SHAPES[shape] ?? SHAPES.infinity!
  const [bx, by, bw, bh] = spec.box

  const width = size * spec.wide
  // 线宽封顶：尺寸很小时粗线会把三叶结、无限符号的内圈糊住。
  const strokePx = clamp(stroke, 1, size * 0.13)
  // 让线宽在屏幕上正好是 strokePx：viewBox 宽 bw + sw，缩放比 width / (bw + sw)，解出 sw。
  const sw = (strokePx * bw) / (width - strokePx)
  const height = (width * (bh + sw)) / (bw + sw)
  const viewBox = `${bx - sw / 2} ${by - sw / 2} ${bw + sw} ${bh + sw}`
  const dash = clamp(dashLength, 2, 60)
  const seconds = spec.seconds / clamp(speed, 0.1, 10)
  const common = {
    d: spec.d,
    pathLength: 100,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: spec.cap,
    strokeLinejoin: spec.cap === 'butt' ? ('miter' as const) : ('round' as const),
  }

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy={loading}
      className={cn('mpt-root', className)}
      style={
        {
          '--mpt-color': color,
          '--mpt-dur': `${seconds}s`,
          '--mpt-rest': spec.rest,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{loading ? label : ''}</span>
      {visible && (
        <svg
          aria-hidden
          focusable="false"
          className={cn('mpt-svg', spec.draw && 'mpt-draw')}
          viewBox={viewBox}
          width={width}
          height={height}
        >
          <path {...common} className="mpt-track" strokeOpacity={clamp(trackOpacity, 0, 100) / 100} />
          <path
            {...common}
            className={cn('mpt-car', spec.reverse && 'mpt-reverse')}
            strokeDasharray={spec.draw ? '100 100' : `${dash} ${100 - dash}`}
          />
        </svg>
      )}
    </span>
  )
}
