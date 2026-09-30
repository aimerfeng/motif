// SPDX-License-Identifier: MIT
// Copyright (c) 2025 WebTUI
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/base.css
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#5af78e',
  radius: 2,
  borderWidth: 1,
  fontPairing: 'jetbrains',
  glow: 0.5,
  density: 1,
  mode: 'dark',
  scanlines: true,
}
/* @motif:end */

// 字体搭配：value 是参数里的选项，head / body 是完整的 font-family 栈（系统字体兜底）。
const PAIRINGS: Record<string, { head: string; body: string }> = {
  'jetbrains': { head: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", body: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  'geist-mono': { head: "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", body: "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  'plex-mono': { head: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", body: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  'vt323': { head: "'VT323', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", body: "'VT323', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
}

// 在强调色上挑对比度更高的文字色，这样任何强调色都不会出现看不清的按钮。
const INK = '#07100a'
const PAPER = '#f4f8f5'

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

export type TerminalProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 风格根节点：把参数写成 CSS 变量，子孙组件全部读这些变量。 */
export function Terminal({ className, style, children, ...props }: TerminalProps) {
  const o = { ...defaults, ...props }
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS[defaults.fontPairing]!
  const vars = {
    '--tm-accent': o.accent,
    '--tm-radius': `${o.radius}px`,
    '--tm-bw': `${o.borderWidth}px`,
    '--tm-glow': o.glow,
    '--tm-density': o.density,
    '--tm-accent-ink': inkOn(o.accent),
    '--tm-head': pair.head,
    '--tm-body': pair.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('tm-root', className)} style={vars} data-fontpairing={o.fontPairing} data-mode={o.mode} data-scanlines={o.scanlines ? 'on' : 'off'}>
      {children}
    </div>
  )
}

type Tone = 'default' | 'accent' | 'sun' | 'pink' | 'mint' | 'ink'

export function TermButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn('tm-btn', `tm-btn-${variant}`, `tm-btn-${size}`, className)} {...rest} />
}

export function TermCard({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('tm-card', `tm-tone-${tone}`, className)} {...rest} />
}

export function TermTitle({ as: Tag = 'h3', className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('tm-title', className)} {...rest} />
}

export function TermText({ muted, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return <p className={cn('tm-text', muted && 'tm-muted', className)} {...rest} />
}

export function TermField({
  label,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn('tm-field', className)}>
      <span className="tm-label">{label}</span>
      <input id={id} className="tm-input" {...rest} />
      {hint ? <span className="tm-hint">{hint}</span> : null}
    </label>
  )
}

export function TermBadge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('tm-badge', `tm-tone-${tone}`, className)} {...rest} />
}

export function TermTabs({
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
    <div role="tablist" aria-label={label} className={cn('tm-tabs', className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="tm-tab"
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

export function TermAlert({
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
    <div role={tone === 'warn' ? 'alert' : 'status'} className={cn('tm-alert', `tm-alert-${tone}`, className)}>
      <span className="tm-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'warn' ? <path d="M12 3.5 21.5 20h-19L12 3.5Z" /> : <circle cx="12" cy="12" r="9" />}
          <path d={ALERT_PATHS[tone]} />
        </svg>
      </span>
      <div className="tm-alert-body">
        <strong className="tm-alert-title">{title}</strong>
        {children ? <div className="tm-alert-text">{children}</div> : null}
      </div>
    </div>
  )
}

export function TermSwitch({
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
    <label className={cn('tm-switch', className)}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="tm-switch-track" aria-hidden />
      <span className="tm-switch-label">{label}</span>
    </label>
  )
}

