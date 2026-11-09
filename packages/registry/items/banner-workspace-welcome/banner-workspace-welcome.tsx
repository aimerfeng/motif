// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/banners/banner-03.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'steps',
  title: 'Welcome to your workspace',
  description: 'Follow the steps below or browse our developer documentation to start using the platform.',
  accent: '#3b82f6',
  tone: 'dark',
  decor: false,
  dismissible: true,
}
/* @motif:end */

export type WorkspaceWelcomeVariant = 'intro' | 'steps' | 'highlight' | 'dashboard'

export type WorkspaceWelcomeStep = {
  title: string
  description: string
  linkText: string
  href?: string
  disabled?: boolean
}

export type WorkspaceWelcomeBannerProps = Partial<typeof defaults> & {
  /** 三个起步步骤（steps / highlight / dashboard 样式）。 */
  items?: WorkspaceWelcomeStep[]
  /** 受控的显示状态；不传时由组件自己管理（点关闭后隐藏）。 */
  open?: boolean
  onDismiss?: () => void
  onPrimary?: () => void
  className?: string
  style?: CSSProperties
}

const STEP_LINKS: WorkspaceWelcomeStep[] = [
  { title: 'How it works', description: 'Learn how the platform works before getting started.', linkText: 'View tutorials', href: '#' },
  { title: 'Get started', description: 'Learn how to install and configure this magic app into your project.', linkText: 'Start introduction', href: '#' },
  { title: 'Examples gallery', description: 'Browse and take inspiration from our templates and demo apps.', linkText: 'View examples', href: '#' },
]

const STEP_ACTIONS: WorkspaceWelcomeStep[] = [
  { title: 'Connect data', description: 'Bring your existing data source or create a new one.', linkText: 'Add data' },
  { title: 'Add metrics', description: 'Create metrics using custom SQL or with our aggregation mask.', linkText: 'Add metric', disabled: true },
  { title: 'Create report', description: 'Transform metrics into visualizations and add layout elements.', linkText: 'Create report', disabled: true },
]

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  const n = Number.parseInt(m?.[1] ?? '3b82f6', 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

const TONES = {
  dark: { bg: '#090E1A', tint: '#111827', border: '#1F2937', fg: '#F9FAFB', muted: '#9CA3AF', close: '#6B7280', closeHover: '#D1D5DB', ghost: 'rgb(31 41 55 / 0.8)', rule: 'rgb(156 163 175 / 0.12)' },
  light: { bg: '#FFFFFF', tint: '#F9FAFB', border: '#E5E7EB', fg: '#111827', muted: '#6B7280', close: '#6B7280', closeHover: '#374151', ghost: '#F3F4F6', rule: '#F3F4F6' },
} as const

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-(--ww-accent-text)/50'
const button =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-sm transition-[background-color,color,opacity,filter] duration-100 ease-in-out disabled:pointer-events-none disabled:shadow-none'
const primary = 'border-transparent bg-(--ww-accent) text-(--ww-accent-ink) hover:brightness-110 disabled:opacity-45'

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5 shrink-0">
      <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-2 size-4">
      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
    </svg>
  )
}

export function WorkspaceWelcomeBanner({ items, open, onDismiss, onPrimary, className, style, ...props }: WorkspaceWelcomeBannerProps) {
  const o = { ...defaults, ...props } as typeof defaults & {
    variant: WorkspaceWelcomeVariant
    title: string
    description: string
    accent: string
    tone: 'dark' | 'light'
    decor: boolean
    dismissible: boolean
  }
  const reduce = useReducedMotion()
  const titleId = useId()
  const [selfOpen, setSelfOpen] = useState(true)
  const isOpen = open ?? selfOpen
  const t = TONES[o.tone] ?? TONES.dark
  const bg = o.decor ? t.tint : t.bg
  const lAccent = luminance(o.accent)
  // 链接文字用主色；主色和卡片底色太接近时退回前景色，保证可读。
  const accentText = contrast(lAccent, luminance(bg)) >= 3 ? o.accent : t.fg
  const accentInk = lAccent > 0.36 ? '#0a0a0b' : '#ffffff'
  const steps = items ?? (o.variant === 'dashboard' ? STEP_ACTIONS : STEP_LINKS)

  const vars = {
    '--ww-bg': bg,
    '--ww-border': t.border,
    '--ww-fg': t.fg,
    '--ww-muted': t.muted,
    '--ww-close': t.close,
    '--ww-close-hover': t.closeHover,
    '--ww-ghost': t.ghost,
    '--ww-rule': t.rule,
    '--ww-accent': o.accent,
    '--ww-accent-ink': accentInk,
    '--ww-accent-text': accentText,
    ...style,
  } as CSSProperties

  const dismiss = () => {
    if (open === undefined) setSelfOpen(false)
    onDismiss?.()
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="banner"
          className={className}
          style={vars}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <section
            aria-labelledby={titleId}
            className="relative w-full rounded-lg border border-(--ww-border) bg-(--ww-bg) p-6 text-left text-(--ww-fg) shadow-sm"
          >
            {o.dismissible ? (
              <div className="absolute top-0 right-0 pt-3 pr-3">
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center justify-center rounded-md p-1 text-(--ww-close) transition-[background-color,color] duration-100 hover:bg-(--ww-ghost) hover:text-(--ww-close-hover)',
                    focusRing,
                  )}
                  onClick={dismiss}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : null}
            <h3 id={titleId} className="pr-8 text-lg font-semibold text-(--ww-fg)">
              {o.title}
            </h3>
            <p className={cn('text-sm/6 text-(--ww-muted)', o.variant === 'intro' || o.variant === 'dashboard' ? 'mt-2' : 'mt-1')}>{o.description}</p>

            {o.variant === 'intro' ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button type="button" className={cn(button, primary, focusRing)} onClick={onPrimary}>
                  Get started
                </button>
                <a
                  href="#"
                  className={cn(button, 'border-transparent bg-transparent text-(--ww-accent-text) shadow-none hover:bg-(--ww-ghost)', focusRing)}
                >
                  View tutorials
                  <ExternalLinkIcon />
                </a>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {steps.map((item, i) =>
                  o.variant === 'dashboard' ? (
                    <div key={item.title} className="flex flex-col justify-between border-l-2 border-(--ww-accent)/25 py-1 pl-4">
                      <div>
                        <span className="inline-flex items-center rounded-md bg-(--ww-accent)/15 px-2 py-1 text-xs font-semibold text-(--ww-accent-text)">
                          Step {i + 1}
                        </span>
                        <h4 className="mt-4 text-sm font-medium text-(--ww-fg)">{item.title}</h4>
                        <p className="mt-2 text-sm/6 text-(--ww-muted)">{item.description}</p>
                      </div>
                      <button type="button" disabled={item.disabled} className={cn(button, primary, focusRing, 'mt-8')} onClick={onPrimary}>
                        {item.linkText}
                      </button>
                    </div>
                  ) : (
                    <div
                      key={item.title}
                      className={cn('flex flex-col items-start justify-between py-1 pl-4', o.variant === 'steps' && 'border-l-2 border-(--ww-rule)')}
                    >
                      <div>
                        <p className={cn('text-sm font-medium text-(--ww-fg)', o.variant === 'highlight' && '-ml-2 border-l-2 border-(--ww-accent) pl-2')}>
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm/6 text-(--ww-muted)">{item.description}</p>
                      </div>
                      <a
                        href={item.href ?? '#'}
                        className={cn('mt-4 rounded-sm text-sm font-medium text-(--ww-accent-text) transition-opacity hover:opacity-80', focusRing)}
                      >
                        {item.linkText} &#8594;
                      </a>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
