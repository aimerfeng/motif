// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/dynamic-grid-gallery.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  columns: 3,
  rows: 2,
  expandFactor: 1.95,
  gap: 10,
  radius: 0,
  duration: 500,
  ease: [0.25, 1, 0.5, 1],
}
/* @motif:end */

export interface GalleryItem {
  id: string | number
  title?: string
  alt?: string
  /** 任意内容（图片、SVG、渐变）；不传时用生成的沙漠插画。 */
  art?: ReactNode
}

export type DynamicGridGalleryProps = Partial<typeof defaults> & {
  items?: GalleryItem[]
  /** 受控：当前放大的格子（演示自动播放用）；null 为全部等分。 */
  activeIndex?: number | null
  className?: string
  style?: CSSProperties
}

/* 生成的暖琥珀色沙漠插画，替代上游的 Unsplash 照片。 */
const PALETTES = [
  { sky: ['#f6c58a', '#e9895a'], sun: '#ffe2b0', layers: ['#d9824e', '#b85c35', '#7f3a22'] },
  { sky: ['#f3a970', '#b5523a'], sun: '#ffd49a', layers: ['#c4643c', '#93402a', '#5b2519'] },
  { sky: ['#fbd9a4', '#f0a560'], sun: '#fff1d2', layers: ['#e6a467', '#c97d44', '#8f4e2a'] },
  { sky: ['#e7b38b', '#8f4a3a'], sun: '#ffd8b5', layers: ['#b9674a', '#83402f', '#4a221b'] },
  { sky: ['#f8e1bd', '#e3b07a'], sun: '#fff6e4', layers: ['#d6a06a', '#b07446', '#6e4026'] },
  { sky: ['#f0965f', '#6e2d2a'], sun: '#ffc98d', layers: ['#a8503a', '#6f2f25', '#3a1715'] },
] as const

const TITLES = [
  'Dune Crests',
  'Canyon Glow',
  'Golden Monolith',
  'Terracotta Ridges',
  'Sahara Solitude',
  'Amber Mesa',
  'Salt Flat',
  'Red Arch',
  'Wind Ripples',
  'Dry Wash',
  'Sand Sea',
  'Last Light',
]

function DesertArt({ index }: { index: number }) {
  const p = PALETTES[index % PALETTES.length]!
  const v = (index * 37) % 60
  const id = `dgg-${index}`
  const sunX = 90 + ((index * 71) % 220)
  const sunY = 70 + ((index * 23) % 60)
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="1" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <circle cx={sunX} cy={sunY} r="90" fill={`url(#${id}-sun)`} />
      <circle cx={sunX} cy={sunY} r="18" fill={p.sun} />
      {index % 3 === 2 ? (
        <path
          d={`M${40 + v} 300 L${60 + v} 150 L${90 + v} 140 L${110 + v} 300 Z M${250 - v} 300 L${262 - v} 120 L${300 - v} 112 L${318 - v} 300 Z`}
          fill={p.layers[2]}
          opacity="0.85"
        />
      ) : null}
      <path d={`M0 ${190 + v / 3} C 80 ${150 + v / 2}, 160 200, 240 ${170 - v / 4} S 360 150, 400 175 V300 H0 Z`} fill={p.layers[0]} />
      <path d={`M0 230 C 100 ${200 - v / 3}, 170 250, 270 215 S 380 ${220 + v / 4}, 400 205 V300 H0 Z`} fill={p.layers[1]} />
      <path d={`M0 ${270 - v / 4} C 120 245, 220 290, 320 258 S 390 262, 400 255 V300 H0 Z`} fill={p.layers[2]} />
      <path d={`M0 232 C 100 ${202 - v / 3}, 170 252, 270 217`} fill="none" stroke={p.sun} strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * DynamicGridGallery - Framer-style interactive dynamic expandable grid gallery.
 * Drop-in, fully responsive, Tailwind CSS friendly.
 */
export function DynamicGridGallery({ items, activeIndex, className, style, ...props }: DynamicGridGalleryProps) {
  const { columns, rows, expandFactor, gap, radius, duration, ease } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const cols = Math.max(1, Math.round(columns))
  const rowCount = Math.max(1, Math.round(rows))
  const count = cols * rowCount
  const list: GalleryItem[] = Array.from({ length: count }, (_, i) => items?.[i] ?? { id: i, title: TITLES[i % TITLES.length] })
  const current = hoveredIndex ?? activeIndex ?? null
  const active = current !== null && current >= 0 && current < count ? current : null

  // Dynamic calculation for cols x rows
  const getGridTemplate = () => {
    if (active === null) {
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rowCount}, 1fr)`,
      }
    }
    const hoveredRow = Math.floor(active / cols)
    const hoveredCol = active % cols
    const rowTemplates = Array.from({ length: rowCount }, (_, r) => (r === hoveredRow ? `${expandFactor}fr` : '0.9fr')).join(' ')
    const colTemplates = Array.from({ length: cols }, (_, c) => (c === hoveredCol ? `${expandFactor}fr` : '0.9fr')).join(' ')
    return { gridTemplateColumns: colTemplates, gridTemplateRows: rowTemplates }
  }

  const gridStyles = getGridTemplate()
  const easing = `cubic-bezier(${ease.join(',')})`

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }
    const step = moves[e.key]
    if (step === undefined) return
    const next = index + step
    if (next < 0 || next >= count) return
    e.preventDefault()
    const el = e.currentTarget.parentElement?.children[next] as HTMLElement | undefined
    el?.focus()
  }

  return (
    <div
      className={cn('relative h-full min-h-0 w-full select-none', className)}
      style={style}
      onMouseLeave={() => setHoveredIndex(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoveredIndex(null)
      }}
    >
      <div
        role="list"
        aria-label="Gallery"
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: gridStyles.gridTemplateColumns,
          gridTemplateRows: gridStyles.gridTemplateRows,
          gap: `${gap}px`,
          transitionProperty: 'grid-template-columns, grid-template-rows',
          transitionDuration: `${reduced ? 0 : duration}ms`,
          transitionTimingFunction: easing,
        }}
      >
        {list.map((item, index) => {
          const isHovered = active === index
          return (
            <div
              key={item.id ?? index}
              role="listitem"
              tabIndex={0}
              aria-label={item.alt || item.title || `Image ${index + 1}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className="group relative h-full w-full cursor-pointer select-none overflow-hidden bg-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ borderRadius: radius }}
            >
              <div
                className="absolute inset-0 h-full w-full brightness-[0.98] contrast-[1.04]"
                style={{
                  transform: isHovered && !reduced ? 'scale(1.05)' : 'scale(1)',
                  transitionProperty: 'transform',
                  transitionDuration: reduced ? '0ms' : '700ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                {item.art ?? <DesertArt index={index} />}
              </div>
              {/* Subtle ambient lighting vignette */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 transition-opacity duration-300 motion-reduce:transition-none',
                  isHovered ? 'opacity-0' : 'opacity-40',
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
