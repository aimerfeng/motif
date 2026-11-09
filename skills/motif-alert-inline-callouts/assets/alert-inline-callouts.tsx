// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-267.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  tone: 'warning',
  variant: 'neutral',
  message: 'Some information is missing!',
  showIcon: true,
  action: 'Link',
  dismissible: false,
  density: 'comfortable',
  radius: 6,
}
/* @motif:end */

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

export type InlineAlertProps = Partial<typeof defaults> & {
  /** 覆盖默认文案。 */
  children?: ReactNode
  /** 可选的要点列表（例如未满足的密码规则）。 */
  items?: string[]
  href?: string
  onAction?: () => void
  onDismiss?: () => void
  className?: string
  style?: CSSProperties
}

const TONES: Record<AlertTone, { icon: string; outline: string; accent: string }> = {
  info: { icon: 'text-blue-500', outline: 'border-blue-500/50 text-blue-600 dark:text-blue-400', accent: 'border-s-blue-500' },
  success: { icon: 'text-emerald-500', outline: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400', accent: 'border-s-emerald-500' },
  warning: { icon: 'text-amber-500', outline: 'border-amber-500/50 text-amber-600 dark:text-amber-400', accent: 'border-s-amber-500' },
  error: { icon: 'text-red-500', outline: 'border-red-500/50 text-red-600 dark:text-red-400', accent: 'border-s-red-500' },
}

const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function ToneIcon({ tone, className }: { tone: AlertTone; className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      {tone === 'warning' ? (
        <>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          {tone === 'success' && <path d="m9 12 2 2 4-4" />}
          {tone === 'error' && (
            <>
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </>
          )}
          {tone === 'info' && (
            <>
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </>
          )}
        </>
      )}
    </svg>
  )
}

/** 内联提示条：info / success / warning / error；neutral（中性边框 + 彩色图标）、outline（彩色边框和文字）或 accent（左侧色条）。 */
export function InlineAlert({ children, items, href = '#', onAction, onDismiss, className, style, ...props }: InlineAlertProps) {
  const { tone, variant, message, showIcon, action, dismissible, density, radius } = { ...defaults, ...props }
  const [open, setOpen] = useState(true)
  if (!open) return null
  const t = TONES[tone as AlertTone] ?? TONES.info
  const outline = variant === 'outline'
  const hasList = items !== undefined && items.length > 0

  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cn(
        'border',
        density === 'compact' ? 'px-3 py-2' : 'px-4 py-3',
        outline ? t.outline : 'text-foreground',
        variant === 'accent' && cn('border-s-4', t.accent),
        className,
      )}
      style={{ borderRadius: radius, ...style }}
    >
      <div className="flex gap-3">
        {showIcon && <ToneIcon tone={tone as AlertTone} className={cn('mt-0.5 shrink-0', outline ? 'opacity-60' : t.icon)} />}
        <div className={cn('flex min-w-0 grow', hasList ? 'flex-col gap-1' : 'justify-between gap-3')}>
          <p className={cn('text-sm', hasList && 'font-medium')}>{children ?? message}</p>
          {hasList && (
            <ul className={cn('list-inside list-disc text-sm', outline ? 'opacity-80' : 'text-muted-foreground')}>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {action && !hasList && (
            <a
              className="group whitespace-nowrap rounded-sm font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={href}
              onClick={(e) => {
                if (onAction) {
                  e.preventDefault()
                  onAction()
                }
              }}
            >
              {action}
              <svg {...svg} aria-hidden="true" className="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            className="-my-1 -me-1 flex size-6 shrink-0 items-center justify-center rounded-sm opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setOpen(false)
              onDismiss?.()
            }}
          >
            <svg {...svg} aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
