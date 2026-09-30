// SPDX-License-Identifier: MIT
// Copyright (c) 2014 Dave Liepmann
// Source: https://github.com/edwardtufte/tufte-css/blob/b5d7b7b/tufte.css
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#b3261e',
  ruleWeight: 1,
  radius: 0,
  fontPairing: 'instrument',
  measure: 64,
  density: 1,
  mode: 'paper',
  margin: true,
  dropcap: true,
}
/* @motif:end */

// 字体搭配：value 是参数里的选项，head / body 是完整的 font-family 栈（系统字体兜底）。
const PAIRINGS: Record<string, { head: string; body: string }> = {
  'instrument': { head: "'Instrument Serif', ui-serif, Georgia, serif", body: "'Newsreader Variable', ui-serif, Georgia, serif" },
  'playfair': { head: "'Playfair Display Variable', ui-serif, Georgia, serif", body: "'Newsreader Variable', ui-serif, Georgia, serif" },
  'fraunces': { head: "'Fraunces Variable', ui-serif, Georgia, serif", body: "'Newsreader Variable', ui-serif, Georgia, serif" },
  'dm-serif': { head: "'DM Serif Display', ui-serif, Georgia, serif", body: "'Newsreader Variable', ui-serif, Georgia, serif" },
}

// 在强调色上挑对比度更高的文字色，这样任何强调色都不会出现看不清的按钮。
const INK = '#1c1a17'
const PAPER = '#fffdf8'

function inkOn(hex: string): string {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return INK
  const n = parseInt(match[1]!, 16)
  const channel = (shift: number) => {
    const s = ((n >> shift) & 255) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return luminance > 0.3 ? INK : PAPER
}

export type EditorialProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 风格根节点：把参数写成 CSS 变量，子孙组件全部读这些变量。 */
export function Editorial({ className, style, children, ...props }: EditorialProps) {
  const o = { ...defaults, ...props }
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS[defaults.fontPairing]!
  const vars = {
    '--ed-accent': o.accent,
    '--ed-bw': `${o.ruleWeight}px`,
    '--ed-radius': `${o.radius}px`,
    '--ed-measure': o.measure,
    '--ed-density': o.density,
    '--ed-accent-ink': inkOn(o.accent),
    '--ed-head': pair.head,
    '--ed-body': pair.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('ed-root', className)} style={vars} data-mode={o.mode} data-margin={o.margin ? 'on' : 'off'} data-dropcap={o.dropcap ? 'on' : 'off'}>
      {children}
    </div>
  )
}

type Tone = 'default' | 'accent' | 'sun' | 'pink' | 'mint' | 'ink'

export function EdButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn('ed-btn', `ed-btn-${variant}`, `ed-btn-${size}`, className)} {...rest} />
}

export function EdCard({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn('ed-card', `ed-tone-${tone}`, className)} {...rest} />
}

export function EdTitle({ as: Tag = 'h3', className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('ed-title', className)} {...rest} />
}

export function EdText({ muted, className, ...rest }: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return <p className={cn('ed-text', muted && 'ed-muted', className)} {...rest} />
}

export function EdField({
  label,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn('ed-field', className)}>
      <span className="ed-label">{label}</span>
      <input id={id} className="ed-input" {...rest} />
      {hint ? <span className="ed-hint">{hint}</span> : null}
    </label>
  )
}

export function EdBadge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('ed-badge', `ed-tone-${tone}`, className)} {...rest} />
}

export function EdTabs({
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
    <div role="tablist" aria-label={label} className={cn('ed-tabs', className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="ed-tab"
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

export function EdAlert({
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
    <div role={tone === 'warn' ? 'alert' : 'status'} className={cn('ed-alert', `ed-alert-${tone}`, className)}>
      <span className="ed-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {tone === 'warn' ? <path d="M12 3.5 21.5 20h-19L12 3.5Z" /> : <circle cx="12" cy="12" r="9" />}
          <path d={ALERT_PATHS[tone]} />
        </svg>
      </span>
      <div className="ed-alert-body">
        <strong className="ed-alert-title">{title}</strong>
        {children ? <div className="ed-alert-text">{children}</div> : null}
      </div>
    </div>
  )
}

export function EdSwitch({
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
    <label className={cn('ed-switch', className)}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="ed-switch-track" aria-hidden />
      <span className="ed-switch-label">{label}</span>
    </label>
  )
}

