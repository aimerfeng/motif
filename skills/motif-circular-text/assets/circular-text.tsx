// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/text/circular-text.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useId, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'AVAILABLE FOR WORK • BOOKING SPRING 2027 • ',
  center: 'arrow',
  discColor: '#1c1917',
  textColor: '#d9f26b',
  size: 200,
  fontSize: 13,
  direction: 'clockwise',
  spinDuration: 22,
  hoverBoost: 3,
}
/* @motif:end */

export type CircularTextProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 点击徽章时触发，传了之后徽章渲染成按钮。 */
  onClick?: () => void
}

const RING_RADIUS = 92
const CENTER = 100

/** 文字沿圆环排布并缓缓旋转的徽章，指针经过时转得更快。文字会均匀铺满整圈，所以长短不同的文案都不会留缺口。 */
export function CircularText({ className, style, onClick, ...props }: CircularTextProps) {
  const { text, size, fontSize, spinDuration, direction, hoverBoost, center, discColor, textColor } = { ...defaults, ...props }
  const pathId = useId()
  const ringRef = useRef<SVGGElement>(null)
  const hovered = useRef(false)
  // 悬停加速时多出来的角度，平缓地累积，松开后速度平滑回落。
  const extra = useRef(0)
  const boost = useRef(0)

  // 文字基线放在圆环里侧，字高刚好顶到圆环边缘。
  const radius = RING_RADIUS - fontSize * 0.75
  const path = `M ${CENTER - radius},${CENTER} a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 ${-radius * 2},0`
  const circumference = 2 * Math.PI * radius
  const sign = direction === 'clockwise' ? 1 : -1

  useFrameLoop(
    ringRef,
    ({ time, delta }) => {
      const rate = 360 / Math.max(1, spinDuration)
      const target = hovered.current ? hoverBoost - 1 : 0
      boost.current += (target - boost.current) * Math.min(1, delta * 4)
      extra.current += rate * boost.current * delta
      const angle = sign * (rate * time + extra.current)
      ringRef.current?.setAttribute('transform', `rotate(${angle.toFixed(2)} ${CENTER} ${CENTER})`)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const Root = onClick ? 'button' : 'div'
  return (
    <Root
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      aria-label={text.replace(/[•·|]/g, ' ').replace(/\s+/g, ' ').trim()}
      className={cn('relative inline-grid place-items-center rounded-full select-none', className)}
      style={{ width: size, height: size, ...style }}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS + 8} fill={discColor} />
        <defs>
          <path id={pathId} d={path} />
        </defs>
        <g ref={ringRef}>
          <text fill={textColor} fontSize={fontSize} fontWeight={600} letterSpacing={0} style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
            <textPath href={`#${pathId}`} textLength={circumference - 2} lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </g>
        {center === 'arrow' && (
          <g fill="none" stroke={textColor} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M82 118 118 82M92 82h26v26" />
          </g>
        )}
        {center === 'dot' && <circle cx={CENTER} cy={CENTER} r={11} fill={textColor} />}
        {center === 'ring' && <circle cx={CENTER} cy={CENTER} r={26} fill="none" stroke={textColor} strokeWidth={2.5} />}
      </svg>
    </Root>
  )
}
