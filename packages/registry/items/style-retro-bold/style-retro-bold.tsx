// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Arif Hossain
// Source: https://github.com/Logging-Studio/RetroUI/blob/d5fbc0e/app/global.css
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ffdb33',
  radius: 4,
  borderWidth: 2,
  shadowOffset: 4,
  fontPairing: 'archivo-plex',
  density: 1,
  halftone: true,
}
/* @motif:end */

// 字体搭配：value 是参数里的选项，head / body 是完整的 font-family 栈（系统字体兜底）。
const PAIRINGS: Record<string, { head: string; body: string }> = {
  'archivo-plex': { head: "'Archivo Black', ui-sans-serif, system-ui, sans-serif", body: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  'dm-serif': { head: "'DM Serif Display', ui-serif, Georgia, serif", body: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif" },
  'fraunces': { head: "'Fraunces Variable', ui-serif, Georgia, serif", body: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  'syne': { head: "'Syne Variable', ui-sans-serif, system-ui, sans-serif", body: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif" },
}

// 在强调色上挑对比度更高的文字色，这样任何强调色都不会出现看不清的按钮。
const INK = '#161210'
const PAPER = '#fffaf0'

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

export type RetroBoldProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 风格根节点：把参数写成 CSS 变量，子孙组件全部读这些变量。 */
export function RetroBold({ className, style, children, ...props }: RetroBoldProps) {
  const o = { ...defaults, ...props }
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS[defaults.fontPairing]!
  const vars = {
    '--rb-accent': o.accent,
    '--rb-radius': `${o.radius}px`,
    '--rb-bw': `${o.borderWidth}px`,
    '--rb-shadow': `${o.shadowOffset}px`,
    '--rb-density': o.density,
    '--rb-accent-ink': inkOn(o.accent),
    '--rb-head': pair.head,
    '--rb-body': pair.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('rb-root', className)} style={vars} data-halftone={o.halftone ? 'on' : 'off'}>
      {children}
    </div>
  )
}

type Tone = 'default' | 'accent' | 'sun' | 'pink' | 'mint' | 'ink'

export function RbButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn('rb-btn', `rb-btn-${variant}`, `rb-btn-${size}`, className)} {...rest} />
}

export function RbCard({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('rb-card', `rb-tone-${tone}`, className)} {...rest} />
}

export function RbTitle({ as: Tag = 'h3', className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('rb-title', className)} {...rest} />
}

export function RbText({ muted, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return <p className={cn('rb-text', muted && 'rb-muted', className)} {...rest} />
}

export function RbField({
  label,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn('rb-field', className)}>
      <span className="rb-label">{label}</span>
      <input id={id} className="rb-input" {...rest} />
      {hint ? <span className="rb-hint">{hint}</span> : null}
    </label>
  )
}

export function RbBadge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('rb-badge', `rb-tone-${tone}`, className)} {...rest} />
}

export function RbTabs({
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
    <div role="tablist" aria-label={label} className={cn('rb-tabs', className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="rb-tab"
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

export function RbAlert({
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
    <div role={tone === 'warn' ? 'alert' : 'status'} className={cn('rb-alert', `rb-alert-${tone}`, className)}>
      <span className="rb-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'warn' ? <path d="M12 3.5 21.5 20h-19L12 3.5Z" /> : <circle cx="12" cy="12" r="9" />}
          <path d={ALERT_PATHS[tone]} />
        </svg>
      </span>
      <div className="rb-alert-body">
        <strong className="rb-alert-title">{title}</strong>
        {children ? <div className="rb-alert-text">{children}</div> : null}
      </div>
    </div>
  )
}

export function RbSwitch({
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
    <label className={cn('rb-switch', className)}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="rb-switch-track" aria-hidden />
      <span className="rb-switch-label">{label}</span>
    </label>
  )
}

