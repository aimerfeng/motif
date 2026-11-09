// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-306.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'buttons',
  message: 'It‘s live and ready to use! Start exploring the latest addition to your toolkit.',
  badgeLabel: '',
  align: 'start',
  theme: 'dark',
  dismissible: true,
  accent: '#f4f4f5',
}
/* @motif:end */

export type AnnouncementVariant = 'link' | 'inline' | 'learn' | 'buttons' | 'pill' | 'feature' | 'subscribe' | 'update'

export type AnnouncementBarProps = Partial<typeof defaults> & {
  /** 「图标标题」样式的标题。 */
  heading?: ReactNode
  /** 版本号（update 样式）。 */
  version?: string
  href?: string
  /** 受控的「更新中」状态（update 样式）；不传时点击后自己转 2 秒。 */
  updating?: boolean
  onUpdate?: () => void
  onDismiss?: () => void
  /** 强制显示悬停时的箭头轻推（演示用）。 */
  nudge?: boolean
  className?: string
  style?: CSSProperties
}

const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function EclipseIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a7 7 0 1 0 10 10" />
    </svg>
  )
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}

function LoaderCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

/** 按亮度挑一个可读的文字色。 */
function inkFor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0b'
  const n = Number.parseInt(m[1] ?? '000000', 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0a0a0b' : '#ffffff'
}

const LIGHT: Record<string, string> = {
  '--background': 'oklch(0.99 0.002 270)',
  '--foreground': 'oklch(0.2 0.012 270)',
  '--muted': 'oklch(0.955 0.005 270)',
  '--muted-foreground': 'oklch(0.52 0.012 270)',
  '--accent': 'oklch(0.93 0.006 270)',
  '--border': 'oklch(0.91 0.006 270)',
  '--input': 'oklch(0.88 0.006 270)',
  '--ring': 'oklch(0.62 0.16 280)',
}

const btn =
  'inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 font-medium text-sm outline-none transition-[color,background-color,box-shadow,opacity] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50'
const btnPrimary = 'bg-(--ab-accent) text-(--ab-ink) shadow-xs hover:opacity-90'
const btnOutline = 'border border-input bg-background text-foreground shadow-xs hover:bg-accent'
const linkFocus = 'rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
const arrowCls = 'inline-flex opacity-60 transition-transform group-hover:translate-x-0.5 group-data-[nudge=true]:translate-x-0.5 motion-reduce:transition-none'

/** 页面顶部公告条：8 种 Origin UI 样式（链接、按钮、订阅、版本更新……），可选角标与关闭键。 */
export function AnnouncementBar({
  heading = 'Boost your experience with Northwind',
  version = 'v2.1.0',
  href = '#',
  updating,
  onUpdate,
  onDismiss,
  nudge = false,
  className,
  style,
  ...props
}: AnnouncementBarProps) {
  const { variant, message, badgeLabel, align, theme, dismissible, accent } = { ...defaults, ...props }
  const [isVisible, setIsVisible] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  if (!isVisible) return null

  const center = align === 'center'
  const filled = theme === 'accent'
  const ink = inkFor(accent)
  const onLight = ink !== '#ffffff'
  const vars: Record<string, string> = filled
    ? {
        '--ab-accent': ink,
        '--ab-ink': accent,
        '--muted': accent,
        '--foreground': ink,
        '--muted-foreground': onLight ? 'rgb(10 10 11 / 0.66)' : 'rgb(255 255 255 / 0.72)',
        '--background': 'transparent',
        '--accent': onLight ? 'rgb(10 10 11 / 0.08)' : 'rgb(255 255 255 / 0.12)',
        '--border': onLight ? 'rgb(10 10 11 / 0.14)' : 'rgb(255 255 255 / 0.2)',
        '--input': onLight ? 'rgb(10 10 11 / 0.22)' : 'rgb(255 255 255 / 0.32)',
        '--ring': ink,
      }
    : { ...(theme === 'light' ? LIGHT : {}), '--ab-accent': accent, '--ab-ink': ink }

  const busy = updating ?? isDownloading
  const badge = badgeLabel ? (
    <span className="me-2 inline-flex -translate-y-px items-center rounded-full bg-(--ab-accent) px-2 py-0.5 font-medium text-(--ab-ink) text-[11px] leading-none">{badgeLabel}</span>
  ) : null

  const close = dismissible ? (
    <button
      type="button"
      aria-label="Close banner"
      className="group -my-1.5 -me-2 flex size-8 shrink-0 items-center justify-center rounded-md p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={() => {
        setIsVisible(false)
        onDismiss?.()
      }}
    >
      <XIcon className="opacity-60 transition-opacity group-hover:opacity-100" />
    </button>
  ) : null

  const learnMore = (
    <a className={cn('group whitespace-nowrap font-medium text-sm', linkFocus)} data-nudge={nudge} href={href}>
      Learn more
      <ArrowRightIcon className={cn('ms-1 -mt-0.5', arrowCls)} />
    </a>
  )

  let body: ReactNode
  switch (variant as AnnouncementVariant) {
    case 'link':
      body = (
        <p className={cn('flex grow text-sm', center ? 'justify-center' : 'justify-start')}>
          <a className={cn('group', linkFocus)} data-nudge={nudge} href={href}>
            <span className="me-1 text-base leading-none">✨</span>
            {badge}
            {message}
            <ArrowRightIcon className={cn('ms-2 -mt-0.5', arrowCls)} />
          </a>
        </p>
      )
      break
    case 'inline':
    case 'subscribe':
      body = (
        <p className={cn('grow text-sm', center ? 'text-center' : 'text-start')}>
          {variant === 'subscribe' ? <span className="me-1 text-base leading-none">📫</span> : <EclipseIcon className="me-3 -mt-0.5 inline-flex opacity-60" />}
          {badge}
          {message} <span className={cn('text-muted-foreground', variant === 'subscribe' && 'mx-1')}>·</span>{' '}
          <a className={cn('font-medium underline hover:no-underline', linkFocus)} href={href}>
            {variant === 'subscribe' ? 'Subscribe' : 'Upgrade'}
          </a>
        </p>
      )
      break
    case 'learn':
      body = (
        <div className="flex grow gap-3">
          <EclipseIcon className="mt-0.5 shrink-0 opacity-60" />
          <div className={cn('flex grow flex-col gap-2 md:flex-row md:items-center', center ? 'md:justify-center md:gap-4' : 'justify-between')}>
            <p className="text-sm">
              {badge}
              {message}
            </p>
            {learnMore}
          </div>
        </div>
      )
      break
    case 'feature':
      body = (
        <div className={cn('flex grow gap-3 md:items-center', center && 'md:justify-center')}>
          <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--ab-accent)/15 max-md:mt-0.5">
            <RocketIcon className="opacity-80" />
          </div>
          <div className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', center ? 'md:gap-6' : 'grow')}>
            <div className="space-y-0.5">
              <p className="font-medium text-sm">
                {badge}
                {heading}
              </p>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            <div className="flex gap-2 max-md:flex-wrap">
              <button type="button" className={cn(btn, btnPrimary)}>
                Try now
              </button>
            </div>
          </div>
        </div>
      )
      break
    case 'update':
      body = (
        <div className={cn('flex grow flex-wrap items-center gap-x-4 gap-y-2', center ? 'justify-center' : 'justify-between')}>
          <p className="text-sm">
            {badge}
            <span className="font-medium">{version}</span>
            <span className="mx-2 text-muted-foreground">•</span>
            {message}
          </p>
          <button
            type="button"
            className={cn(btn, btnOutline, 'min-w-24')}
            disabled={busy}
            aria-live="polite"
            onClick={() => {
              onUpdate?.()
              if (updating !== undefined) return
              setIsDownloading(true)
              clearTimeout(timer.current)
              timer.current = setTimeout(() => setIsDownloading(false), 2000)
            }}
          >
            {busy ? (
              <>
                <LoaderCircleIcon className="-ms-0.5 animate-spin motion-reduce:animate-none" />
                Updating...
              </>
            ) : (
              <>
                <DownloadIcon className="-ms-0.5" />
                Update now
              </>
            )}
          </button>
        </div>
      )
      break
    default: {
      const pill = variant === 'pill'
      body = (
        <div className={cn('flex grow gap-3 md:items-center', (pill || center) && 'md:justify-center')}>
          <EclipseIcon className="shrink-0 opacity-60 max-md:mt-0.5" />
          <div className={cn('flex flex-col justify-between gap-3 md:flex-row md:items-center', !(pill || center) && 'grow')}>
            <p className="text-sm">
              {badge}
              {message}
            </p>
            <div className="flex gap-2 max-md:flex-wrap">
              {pill ? (
                <a href={href} className={cn(btn, btnPrimary, 'rounded-full')}>
                  Learn more
                </a>
              ) : (
                <>
                  <button type="button" className={cn(btn, btnPrimary)}>
                    Download
                  </button>
                  <a href={href} className={cn(btn, btnOutline)}>
                    Learn more
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  const surface = variant === 'subscribe' && !filled ? 'border-b bg-background' : 'bg-muted'
  const compact = variant === 'buttons' || variant === 'pill' || variant === 'update'

  return (
    <div
      role="region"
      aria-label="Announcement"
      className={cn(theme === 'dark' && 'dark', surface, 'px-4 py-3 text-foreground', compact && 'md:py-2', className)}
      style={{ ...vars, ...style } as CSSProperties}
    >
      <div className="flex gap-2 md:items-center">
        {body}
        {close}
      </div>
    </div>
  )
}
