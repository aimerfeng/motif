// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/jelly.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'jelly',
  size: 48,
  color: '#a78bfa',
  speed: 1,
  label: 'Loading',
}
/* @motif:end */

export type LoaderGooeyBlobsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/** Upstream default durations (seconds) per variant; divided by speed. */
const SECONDS: Record<string, number> = { jelly: 0.9, jellyTriangle: 1.75, mirage: 2.5 }
/** Upstream blur divisor per variant (stdDeviation = size / n). */
const BLUR: Record<string, number> = { jelly: 8, jellyTriangle: 9, mirage: 20 }

function Ooze({ id, size, variant }: { id: string; size: number; variant: string }) {
  return (
    <defs>
      <filter id={id}>
        <feGaussianBlur in="SourceGraphic" stdDeviation={size / (BLUR[variant] ?? 8)} result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="ooze" />
        <feBlend in="SourceGraphic" in2="ooze" />
      </filter>
    </defs>
  )
}

/**
 * Gooey loaders from ldrs (jelly, jelly triangle, mirage): circles fused by an SVG goo filter.
 */
export function LoaderGooeyBlobs({ className, style, ...props }: LoaderGooeyBlobsProps) {
  const { variant, size, color, speed, label } = { ...defaults, ...props }
  const filterId = `mlgb-ooze-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const seconds = (SECONDS[variant] ?? 0.9) / Math.max(speed, 0.1)
  const svgStyle: CSSProperties = { filter: `url(#${filterId})` }

  let svg: ReactNode
  if (variant === 'jellyTriangle') {
    const d = size / 3
    svg = (
      <svg className="mlgb-svg" x="0px" y="0px" viewBox={`0 0 ${size} ${size}`} height={size} width={size} preserveAspectRatio="xMidYMid meet" style={svgStyle}>
        <circle className="mlgb-dot" cx={size / 2} cy={d / 2} r={d / 2} />
        <circle className="mlgb-dot" cx={size - d / 2} cy={size - d / 2} r={d / 2} />
        <circle className="mlgb-dot" cx={d / 2} cy={size - d / 2} r={d / 2} />
        <circle className="mlgb-traveler" cx={size / 2} cy={d / 2} r={d / 2} />
        <Ooze id={filterId} size={size} variant={variant} />
      </svg>
    )
  } else if (variant === 'mirage') {
    const height = size * 0.23
    svg = (
      <svg className="mlgb-svg" x="0px" y="0px" viewBox={`0 0 ${size} ${height}`} height={height} width={size} preserveAspectRatio="xMidYMid meet" style={svgStyle}>
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} className="mlgb-dot" cx={0} cy={height / 2} r={height / 2} />
        ))}
        <Ooze id={filterId} size={size} variant={variant} />
      </svg>
    )
  } else {
    const height = size / 2
    svg = (
      <svg className="mlgb-svg" x="0px" y="0px" viewBox={`0 0 ${size} ${height}`} height={height} width={size} preserveAspectRatio="xMidYMid meet" style={svgStyle}>
        <circle className="mlgb-dot" cx={size / 2} cy={height / 2} r={size / 4} />
        <circle className="mlgb-dot" cx={size / 2} cy={height / 2} r={size / 4} />
        <Ooze id={filterId} size={size} variant={variant} />
      </svg>
    )
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('mlgb-root', `mlgb-${variant}`, className)}
      style={
        {
          '--uib-size': `${size}px`,
          '--uib-color': color,
          '--uib-speed': `${seconds}s`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{label}</span>
      <span className="mlgb-container" aria-hidden>
        {svg}
      </span>
    </span>
  )
}
