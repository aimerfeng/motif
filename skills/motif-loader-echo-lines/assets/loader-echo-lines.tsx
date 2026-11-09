// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/pinwheel.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'pinwheel',
  size: 35,
  color: '#f4f4f5',
  stroke: 3.5,
  echoes: 5,
  falloff: 0.2,
  speed: 0.9,
  label: 'Loading',
}
/* @motif:end */

export type LoaderEchoLinesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/**
 * ldrs 的 pinwheel / miyagi / hatch。pinwheel 与 miyagi 是一根主线加 echoes 根残影，
 * 延迟从 -0.375 到 -0.075 个周期，透明度按 falloff 逐根递减（上游为 0.8…0.1）。
 */
export function LoaderEchoLines({ className, style, ...props }: LoaderEchoLinesProps) {
  const { variant, size, color, stroke, echoes, falloff, speed, label } = { ...defaults, ...props }
  const n = Math.round(Math.min(Math.max(echoes, 1), 8))
  const lines = [{ delay: -0.375, opacity: 1 }]
  for (let k = 1; k <= n; k++) {
    lines.push({ delay: -0.375 * (1 - (k - 1) / n), opacity: Math.max(0.1, 1 - k * falloff) })
  }

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy
      className={cn('mel-root', className)}
      style={
        {
          '--uib-size': `${size}px`,
          '--uib-size-n': size,
          '--uib-color': color,
          '--uib-speed': `${speed}s`,
          '--uib-stroke': `${stroke}px`,
          '--uib-stroke-n': stroke,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{label}</span>
      {variant === 'hatch' ? (
        <span className="mel-hatch" aria-hidden>
          <span className="mel-hatch-line" />
        </span>
      ) : (
        <span className={cn('mel-container', variant === 'miyagi' && 'mel-miyagi')} aria-hidden>
          {lines.map((line, i) => (
            <span
              key={i}
              className="mel-line"
              style={{ '--mel-delay': `calc(var(--uib-speed) * ${line.delay})`, '--mel-opacity': line.opacity, '--mel-phase': -line.delay } as CSSProperties}
            />
          ))}
        </span>
      )}
    </span>
  )
}
