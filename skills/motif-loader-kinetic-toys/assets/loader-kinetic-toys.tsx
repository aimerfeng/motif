// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Griffin Johnston
// Source: https://github.com/GriffinJohnston/ldrs/blob/f759f65/src/elements/newtonsCradle.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'newtons-cradle',
  size: 40,
  color: '#e4e4e7',
  speed: 1,
  amplitude: 1,
  echoes: 3,
  squash: 1,
  label: 'Loading',
}
/* @motif:end */

export type LoaderKineticToysProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

type Variant = 'newtons-cradle' | 'metronome' | 'leapfrog' | 'bouncy-arc' | 'treadmill' | 'momentum'

/** Upstream default size (px) and speed (s) per element; `size` is relative to 40 px, `speed` is a multiplier. */
const UPSTREAM: Record<Variant, { size: number; speed: number }> = {
  'newtons-cradle': { size: 78, speed: 1.4 },
  metronome: { size: 40, speed: 1.6 },
  leapfrog: { size: 40, speed: 2.5 },
  'bouncy-arc': { size: 70, speed: 1.65 },
  treadmill: { size: 70, speed: 1.25 },
  momentum: { size: 40, speed: 1.1 },
}

/** Desk-toy loaders from ldrs: Newton's cradle, metronome, leapfrog, bouncy arc, treadmill and momentum. */
export function LoaderKineticToys({ className, style, ...props }: LoaderKineticToysProps) {
  const { variant, size, color, speed, amplitude, echoes, squash, label } = { ...defaults, ...props }
  const v = (variant in UPSTREAM ? variant : 'newtons-cradle') as Variant
  const base = UPSTREAM[v]
  const px = (base.size * size) / 40
  const seconds = base.speed / Math.max(speed, 0.1)

  let inner: ReactNode
  if (v === 'newtons-cradle') {
    inner = (
      <div className="mkt-container">
        <div className="mkt-dot" />
        <div className="mkt-dot" />
        <div className="mkt-dot" />
        <div className="mkt-dot" />
      </div>
    )
  } else if (v === 'metronome') {
    const n = 1 + Math.max(0, Math.min(3, Math.round(echoes)))
    inner = (
      <div className="mkt-container">
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="mkt-dot" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
    )
  } else if (v === 'leapfrog') {
    inner = (
      <div className="mkt-container">
        <div className="mkt-dot" />
        <div className="mkt-dot" />
        <div className="mkt-dot" />
      </div>
    )
  } else if (v === 'bouncy-arc' || v === 'treadmill') {
    inner = (
      <div className="mkt-container">
        <div className="mkt-cube" />
      </div>
    )
  } else {
    inner = <div className="mkt-container" />
  }

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy
      className={cn('mkt-root', `mkt-${v}`, className)}
      style={
        {
          '--uib-size': `${px}px`,
          '--uib-color': color,
          '--uib-speed': `${seconds}s`,
          '--mkt-amp': amplitude,
          '--mkt-sq': squash,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden style={{ display: 'contents' }}>
        {inner}
      </span>
    </span>
  )
}
