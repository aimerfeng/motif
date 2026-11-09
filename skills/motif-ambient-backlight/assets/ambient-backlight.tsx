// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/backlight.tsx
// Modified by Motif; see the item's provenance.
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  blur: 20,
  saturation: 4,
  artwork: 'aurora',
  artSpeed: 1,
}
/* @motif:end */

export type BacklightProps = Partial<typeof defaults> & {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Casts a blurred, saturated copy of its children behind them, like a TV ambilight.
 */
export function Backlight({ children, className, style, ...props }: BacklightProps) {
  const { blur, saturation } = { ...defaults, ...props }
  const id = useId()

  return (
    <div className={className} style={style}>
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred"></feGaussianBlur>
          <feColorMatrix type="saturate" in="blurred" values={String(saturation)}></feColorMatrix>
          <feComposite in="SourceGraphic" operator="over"></feComposite>
        </filter>
      </svg>

      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  )
}
