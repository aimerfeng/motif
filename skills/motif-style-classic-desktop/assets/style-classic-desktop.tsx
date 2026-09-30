// SPDX-License-Identifier: MIT
// Copyright 2020 Jordan Scales
// Source: https://github.com/jdan/98.css/blob/b1d7a90/style.css
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#0a2a7a',
  desktop: '#008080',
  bevel: 1,
  radius: 0,
  fontPairing: 'plex-sans',
  density: 1,
  gradient: true,
}
/* @motif:end */

// 字体搭配：value 是参数里的选项，head / body 是完整的 font-family 栈（系统字体兜底）。
const PAIRINGS: Record<string, { head: string; body: string }> = {
  'plex-sans': { head: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif", body: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  'geist': { head: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", body: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" },
  'plex-mono': { head: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", body: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  'grotesk': { head: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", body: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif" },
}

// 在强调色上挑对比度更高的文字色，这样任何强调色都不会出现看不清的按钮。
const INK = '#111111'
const PAPER = '#ffffff'

function inkOn(hex: string): string {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return INK
  const n = parseInt(match[1]!, 16)
  const channel = (shift: number) => {
    const s = ((n >> shift) & 255) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return luminance > 0.179 ? INK : PAPER
}

export type ClassicDesktopProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 风格根节点：把参数写成 CSS 变量，子孙组件全部读这些变量。 */
export function ClassicDesktop({ className, style, children, ...props }: ClassicDesktopProps) {
  const o = { ...defaults, ...props }
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS[defaults.fontPairing]!
  const vars = {
    '--cd-accent': o.accent,
    '--cd-desktop': o.desktop,
    '--cd-bw': `${o.bevel}px`,
    '--cd-radius': `${o.radius}px`,
    '--cd-density': o.density,
    '--cd-accent-ink': inkOn(o.accent),
    '--cd-head': pair.head,
    '--cd-body': pair.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('cd-root', className)} style={vars} data-fontpairing={o.fontPairing} data-gradient={o.gradient ? 'on' : 'off'}>
      {children}
    </div>
  )
}

type Tone = 'default' | 'accent' | 'sun' | 'pink' | 'mint' | 'ink'

export function CdButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn('cd-btn', `cd-btn-${variant}`, `cd-btn-${size}`, className)} {...rest} />
}

export function CdCard({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('cd-card', `cd-tone-${tone}`, className)} {...rest} />
}

export function CdTitle({ as: Tag = 'h3', className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('cd-title', className)} {...rest} />
}

export function CdText({ muted, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return <p className={cn('cd-text', muted && 'cd-muted', className)} {...rest} />
}

export function CdField({
  label,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn('cd-field', className)}>
      <span className="cd-label">{label}</span>
      <input id={id} className="cd-input" {...rest} />
      {hint ? <span className="cd-hint">{hint}</span> : null}
    </label>
  )
}

export function CdBadge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('cd-badge', `cd-tone-${tone}`, className)} {...rest} />
}

export function CdTabs({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  label?: string
  className?: string
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const index = tabs.findIndex((tab) => tab.id === value)
    const nextIndex = (index + step + tabs.length) % tabs.length
    const next = tabs[nextIndex]
    if (!next) return
    onChange(next.id)
    ;(event.currentTarget.children[nextIndex] as HTMLElement | undefined)?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className={cn('cd-tabs', className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="cd-tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

const ALERT_PATHS = {
  info: 'M12 8v.01M12 11v5',
  success: 'M7 12.5l3.2 3.2L17 9',
  warn: 'M12 8v5M12 16.5v.01',
} as const

export function CdAlert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: 'info' | 'success' | 'warn'
  title: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div role={tone === 'warn' ? 'alert' : 'status'} className={cn('cd-alert', `cd-alert-${tone}`, className)}>
      <span className="cd-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'warn' ? <path d="M12 3.5 21.5 20h-19L12 3.5Z" /> : <circle cx="12" cy="12" r="9" />}
          <path d={ALERT_PATHS[tone]} />
        </svg>
      </span>
      <div className="cd-alert-body">
        <strong className="cd-alert-title">{title}</strong>
        {children ? <div className="cd-alert-text">{children}</div> : null}
      </div>
    </div>
  )
}

export function CdSwitch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}) {
  return (
    <label className={cn('cd-switch', className)}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="cd-switch-track" aria-hidden />
      <span className="cd-switch-label">{label}</span>
    </label>
  )
}

/** 窗口：标题栏 + 三个控制按钮（全部用 CSS 画的中性图形）。 */
export function CdWindow({
  title,
  children,
  className,
  active = true,
  heading = false,
}: {
  title: string
  children?: ReactNode
  className?: string
  active?: boolean
  heading?: boolean
}) {
  const Title = heading ? 'h2' : 'div'
  return (
    <div className={cn('cd-window', className)} role="group" aria-label={title}>
      <div className="cd-titlebar" data-active={active ? 'on' : 'off'}>
        <span className="cd-titlebar-icon" aria-hidden />
        <Title className="cd-titlebar-text">{title}</Title>
        <span className="cd-controls" aria-hidden>
          <i data-k="min" />
          <i data-k="max" />
          <i data-k="close" />
        </span>
      </div>
      <div className="cd-window-body">{children}</div>
    </div>
  )
}

/** 分格进度条。 */
export function CdProgress({ value, label, className }: { value: number; label: string; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} className={cn('cd-progress', className)}>
      <span className="cd-progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}

