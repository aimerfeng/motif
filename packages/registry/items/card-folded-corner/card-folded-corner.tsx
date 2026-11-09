// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/feature-sections/feature-section-08.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  foldSize: 30,
  lift: 1.67,
  shadow: 0.05,
  accent: '#3b82f6',
  radius: 8,
  tone: 'light',
  columns: 3,
}
/* @motif:end */

type Options = {
  foldSize: number
  accent: string
  radius: number
  lift: number
  shadow: number
  columns: number
  tone: string
}

const TONES = {
  light: { card: '#ffffff', page: '#ffffff', ring: '#e5e7eb', under: '#f9fafb', title: '#111827', body: '#4b5563' },
  dark: { card: '#111827', page: '#030712', ring: '#1f2937', under: '#111827', title: '#f9fafb', body: '#9ca3af' },
}

export function toneColors(tone: string) {
  return tone === 'dark' ? TONES.dark : TONES.light
}

type IconProps = { className?: string; style?: CSSProperties }

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.9 13.9 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.05 13.05 0 0 0 6.844 6.844l1.54-2.154a.46.46 0 0 1 .573-.149 13.9 13.9 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498Z" />
    </svg>
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3 12h4v9H3v-9Zm14-4h4v13h-4V8Zm-7-6h4v19h-4V2Z" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm1-10V7h-2v7h6v-2h-4Z" />
    </svg>
  )
}

export type StickerCardProps = {
  icon: (props: IconProps) => ReactNode
  title: string
  children: ReactNode
  href?: string
  /** 强制显示悬停（折角掀起）状态，用于演示自动播放。 */
  lifted?: boolean
  options: Options
}

export function StickerCard({ icon: Icon, title, children, href = '#', lifted, options }: StickerCardProps) {
  const c = toneColors(options.tone)
  const f = options.foldSize
  const fl = Math.round(f * options.lift)
  const vars = {
    '--fc-r': `${options.radius}px`,
    '--fc-tr': `${Math.round(f * 0.87)}px`,
    '--fc-tr-l': `${Math.round(fl * 0.9)}px`,
    '--fc-f': `${f}px`,
    '--fc-f-l': `${fl}px`,
    '--fc-u': `${f - 2}px`,
    '--fc-u-l': `${Math.round(fl * 0.84)}px`,
    '--fc-o': `${Math.round(f * 0.27)}px`,
    '--fc-sh': String(options.shadow),
    '--fc-card': c.card,
    '--fc-page': c.page,
    '--fc-ring': c.ring,
    '--fc-under': c.under,
    color: c.title,
  } as CSSProperties

  return (
    <div>
      <a
        href={href}
        data-lifted={lifted ? 'true' : undefined}
        style={vars}
        className={cn(
          'relative z-10 mt-0 block size-full overflow-hidden outline-none',
          'rounded-[var(--fc-r)] rounded-tr-[var(--fc-tr)]',
          'px-4 pb-4 pt-5',
          // Card
          'bg-[var(--fc-card)] font-normal leading-8',
          'ring-1 ring-inset ring-[var(--fc-ring)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--fc-accent)]',

          // Animation
          'transition-[border-radius] duration-200 ease-in-out motion-reduce:transition-none',

          // Before Element (Corner Fold)
          'before:content-[""]',
          'before:absolute before:right-0 before:top-0',
          'before:z-[3]',
          'before:h-[var(--fc-f)] before:w-[var(--fc-f)]',
          'before:-translate-y-1/2 before:translate-x-1/2',
          'before:rotate-45',
          'before:bg-[var(--fc-page)]',
          'before:ring-1 before:ring-[var(--fc-ring)]',
          'before:transition-[width,height] before:duration-200 before:ease-in-out motion-reduce:before:transition-none',

          // After Element (Corner Shadow)
          'after:content-[""]',
          'after:absolute after:right-0 after:top-0',
          'after:z-[2]',
          'after:h-[var(--fc-u)] after:w-[var(--fc-u)]',
          'after:-translate-y-[var(--fc-o)] after:translate-x-[var(--fc-o)]',
          'after:rounded-bl-lg',
          'after:border after:border-[var(--fc-ring)] after:bg-[var(--fc-under)]',
          'after:shadow-sm',
          'after:transition-[width,height,box-shadow] after:duration-200 after:ease-in-out motion-reduce:after:transition-none',

          // Hover States (also on keyboard focus and when lifted by the demo)
          'hover:cursor-pointer',
          'hover:rounded-tr-[var(--fc-tr-l)] focus-visible:rounded-tr-[var(--fc-tr-l)] data-[lifted=true]:rounded-tr-[var(--fc-tr-l)]',
          'hover:before:h-[var(--fc-f-l)] hover:before:w-[var(--fc-f-l)]',
          'focus-visible:before:h-[var(--fc-f-l)] focus-visible:before:w-[var(--fc-f-l)]',
          'data-[lifted=true]:before:h-[var(--fc-f-l)] data-[lifted=true]:before:w-[var(--fc-f-l)]',
          'hover:after:h-[var(--fc-u-l)] hover:after:w-[var(--fc-u-l)]',
          'focus-visible:after:h-[var(--fc-u-l)] focus-visible:after:w-[var(--fc-u-l)]',
          'data-[lifted=true]:after:h-[var(--fc-u-l)] data-[lifted=true]:after:w-[var(--fc-u-l)]',
          'hover:after:shadow-[0_10px_15px_-3px_rgb(0_0_0/var(--fc-sh)),0_4px_6px_-4px_rgb(0_0_0/var(--fc-sh))]',
          'focus-visible:after:shadow-[0_10px_15px_-3px_rgb(0_0_0/var(--fc-sh)),0_4px_6px_-4px_rgb(0_0_0/var(--fc-sh))]',
          'data-[lifted=true]:after:shadow-[0_10px_15px_-3px_rgb(0_0_0/var(--fc-sh)),0_4px_6px_-4px_rgb(0_0_0/var(--fc-sh))]',
        )}
      >
        <div>
          <div className="relative flex items-center gap-2">
            <div className="absolute -left-4 h-5 w-1 rounded-r-sm" style={{ backgroundColor: options.accent }} />
            <Icon className="h-5 w-5 shrink-0" style={{ color: options.accent }} />
            <h3 className="font-medium" style={{ color: c.title }}>
              {title}
            </h3>
          </div>
          <p className="mt-2 sm:text-sm" style={{ color: c.body }}>
            {children}
          </p>
        </div>
      </a>
    </div>
  )
}

export type FoldedCornerItem = {
  icon: (props: IconProps) => ReactNode
  title: string
  description: ReactNode
  href?: string
}

export const DEFAULT_ITEMS: FoldedCornerItem[] = [
  {
    icon: PhoneIcon,
    title: 'Call Analytics',
    description: 'Real-time voice analytics and sentiment tracking to improve customer interactions.',
  },
  {
    icon: ChartIcon,
    title: 'Performance Metrics',
    description: 'Comprehensive reporting on KPIs including call resolution rates and response times.',
  },
  {
    icon: ClockIcon,
    title: 'Queue Management',
    description: 'Smart call routing and queue optimization to minimize wait times and maximize agent efficiency.',
  },
]

export type FoldedCornerCardsProps = Partial<Options> & {
  className?: string
  style?: CSSProperties
  items?: FoldedCornerItem[]
  /** 强制掀起某一张卡片的折角（演示自动播放用）。 */
  liftedIndex?: number
}

export function FoldedCornerCards({ className, style, items = DEFAULT_ITEMS, liftedIndex, ...props }: FoldedCornerCardsProps) {
  const options = { ...defaults, ...props } as Options
  return (
    <div className={cn('@container w-full', className)} style={{ ['--fc-accent' as string]: options.accent, ...style }}>
      <div
        className="grid grid-cols-1 gap-4 @xl:grid-cols-[repeat(var(--fc-cols),minmax(0,1fr))]"
        style={{ ['--fc-cols' as string]: options.columns }}
      >
        {items.map((item, i) => (
          <StickerCard key={item.title} icon={item.icon} title={item.title} href={item.href} lifted={liftedIndex === i} options={options}>
            {item.description}
          </StickerCard>
        ))}
      </div>
    </div>
  )
}
