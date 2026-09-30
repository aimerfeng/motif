// SPDX-License-Identifier: ISC
// Copyright (c) 2017–2018, Rhyne Vlaservich <rhyneav@gmail.com>
// Source: https://github.com/papercss/papercss/blob/b341c16/src/core/_mixins.scss
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ff6b57',
  wobble: 15,
  lineWidth: 2.5,
  hatchOffset: 4,
  fontPairing: 'bricolage',
  density: 1,
  tilt: true,
  grid: true,
}
/* @motif:end */

// 字体搭配：value 是参数里的选项，head / body 是完整的 font-family 栈（系统字体兜底）。
const PAIRINGS: Record<string, { head: string; body: string }> = {
  'bricolage': { head: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif", body: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif" },
  'fraunces': { head: "'Fraunces Variable', ui-serif, Georgia, serif", body: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  'instrument': { head: "'Instrument Serif', ui-serif, Georgia, serif", body: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif" },
  'syne': { head: "'Syne Variable', ui-sans-serif, system-ui, sans-serif", body: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif" },
}

// 在强调色上挑对比度更高的文字色，这样任何强调色都不会出现看不清的按钮。
const INK = '#2b2623'
const PAPER = '#fffdf7'

function inkOn(hex: string): string {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return INK
  const n = parseInt(match[1]!, 16)
  const channel = (shift: number) => {
    const s = ((n >> shift) & 255) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return luminance > 0.2 ? INK : PAPER
}

export type HandDrawnProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 风格根节点：把参数写成 CSS 变量，子孙组件全部读这些变量。 */
export function HandDrawn({ className, style, children, ...props }: HandDrawnProps) {
  const o = { ...defaults, ...props }
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS[defaults.fontPairing]!
  const vars = {
    '--hd-accent': o.accent,
    '--hd-wob': o.wobble,
    '--hd-bw': `${o.lineWidth}px`,
    '--hd-sh': `${o.hatchOffset}px`,
    '--hd-density': o.density,
    '--hd-accent-ink': inkOn(o.accent),
    '--hd-head': pair.head,
    '--hd-body': pair.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('hd-root', className)} style={vars} data-tilt={o.tilt ? 'on' : 'off'} data-grid={o.grid ? 'on' : 'off'}>
      {children}
    </div>
  )
}

type Tone = 'default' | 'accent' | 'sun' | 'pink' | 'mint' | 'ink'

export function HdButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn('hd-btn', `hd-btn-${variant}`, `hd-btn-${size}`, className)} {...rest} />
}

export function HdCard({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('hd-card', `hd-tone-${tone}`, className)} {...rest} />
}

export function HdTitle({ as: Tag = 'h3', className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('hd-title', className)} {...rest} />
}

export function HdText({ muted, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return <p className={cn('hd-text', muted && 'hd-muted', className)} {...rest} />
}

export function HdField({
  label,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn('hd-field', className)}>
      <span className="hd-label">{label}</span>
      <input id={id} className="hd-input" {...rest} />
      {hint ? <span className="hd-hint">{hint}</span> : null}
    </label>
  )
}

export function HdBadge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('hd-badge', `hd-tone-${tone}`, className)} {...rest} />
}

export function HdTabs({
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
    <div role="tablist" aria-label={label} className={cn('hd-tabs', className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="hd-tab"
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

export function HdAlert({
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
    <div role={tone === 'warn' ? 'alert' : 'status'} className={cn('hd-alert', `hd-alert-${tone}`, className)}>
      <span className="hd-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'warn' ? <path d="M12 3.5 21.5 20h-19L12 3.5Z" /> : <circle cx="12" cy="12" r="9" />}
          <path d={ALERT_PATHS[tone]} />
        </svg>
      </span>
      <div className="hd-alert-body">
        <strong className="hd-alert-title">{title}</strong>
        {children ? <div className="hd-alert-text">{children}</div> : null}
      </div>
    </div>
  )
}

export function HdSwitch({
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
    <label className={cn('hd-switch', className)}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="hd-switch-track" aria-hidden />
      <span className="hd-switch-label">{label}</span>
    </label>
  )
}

