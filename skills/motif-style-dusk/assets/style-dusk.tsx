// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Rosé Pine
// Source: https://github.com/rose-pine/rose-pine-theme/blob/781bb84/README.md
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'main',
  accent: 'iris',
  radius: 10,
  borderWidth: 1,
  depth: 0.35,
  fontPairing: 'serif',
}
/* @motif:end */

export type StyleDuskProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Rosé Pine 三个变体：Main 与 Moon 是深色，Dawn 是浅色。 */
export const palettes = {
  main: { base: '#191724', surface: '#1f1d2e', overlay: '#26233a', muted: '#6e6a86', subtle: '#908caa', text: '#e0def4', love: '#eb6f92', gold: '#f6c177', rose: '#ebbcba', pine: '#31748f', foam: '#9ccfd8', iris: '#c4a7e7', hlLow: '#21202e', hlMed: '#403d52', hlHigh: '#524f67' },
  moon: { base: '#232136', surface: '#2a273f', overlay: '#393552', muted: '#6e6a86', subtle: '#908caa', text: '#e0def4', love: '#eb6f92', gold: '#f6c177', rose: '#ea9a97', pine: '#3e8fb0', foam: '#9ccfd8', iris: '#c4a7e7', hlLow: '#2a283e', hlMed: '#44415a', hlHigh: '#56526e' },
  dawn: { base: '#faf4ed', surface: '#fffaf3', overlay: '#f2e9e1', muted: '#9893a5', subtle: '#797593', text: '#575279', love: '#b4637a', gold: '#ea9d34', rose: '#d7827e', pine: '#286983', foam: '#56949f', iris: '#907aa9', hlLow: '#f4ede8', hlMed: '#dfdad9', hlHigh: '#cecacd' },
} as const

export type Variant = keyof typeof palettes
export const accentNames = ['iris', 'rose', 'foam', 'gold', 'pine', 'love'] as const
export type Accent = (typeof accentNames)[number]

export const fontPairings = {
  serif: { display: "'Newsreader Variable'", body: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  instrument: { display: "'Instrument Serif'", body: "'Geist Variable'", mono: "'Geist Mono Variable'" },
  sans: { display: "'Inter Tight Variable'", body: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  plex: { display: "'IBM Plex Sans Variable'", body: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string, dark: string, light: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.28 ? dark : light
}

/*
 * 暮色：极简。发丝线边框、几乎没有阴影、衬线标题里一个斜体强调词、远处一抹暮光。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.rp{position:relative;isolation:isolate;min-height:100%;color:var(--rp-text);background:var(--rp-base);font-family:var(--rp-body),${CJK};font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;
  --r:var(--rp-radius);--r-sm:calc(var(--rp-radius)*.6);--r-lg:calc(var(--rp-radius)*1.5);--line:var(--rp-hlMed);--line-soft:var(--rp-hlLow)}
.rp *,.rp *::before,.rp *::after{box-sizing:border-box}
.rp::before{content:'';position:absolute;inset:0 0 auto 0;height:min(720px,100vh);z-index:-1;pointer-events:none;
  background:radial-gradient(70% 90% at 50% -25%,color-mix(in oklab,var(--rp-accent) 34%,transparent),transparent 70%),radial-gradient(40% 50% at 92% 8%,color-mix(in oklab,var(--rp-rose) 12%,transparent),transparent 70%)}

/* 文字 */
.rp-display{font-family:var(--rp-display),${CJK};font-weight:400;letter-spacing:-.02em;line-height:1.06}
.rp-em{font-style:italic;color:var(--rp-accent)}
.rp-sub{color:var(--rp-subtle)}.rp-faint{color:var(--rp-muted)}
.rp-mono{font-family:var(--rp-mono),ui-monospace,monospace}
.rp-eyebrow{font:500 .72rem/1 var(--rp-mono),ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--rp-muted)}
.rp-rule{height:0;border:0;border-top:var(--rp-bw) solid var(--line)}

/* 卡片：发丝线，不靠阴影分层。raised 才有一点悬浮。 */
.rp-card{position:relative;padding:24px;border-radius:var(--r-lg);border:var(--rp-bw) solid var(--line);background:var(--rp-surface)}
.rp-card[data-raised=true]{background:var(--rp-overlay);border-color:var(--rp-hlHigh);box-shadow:0 calc(30px*var(--rp-depth)) calc(70px*var(--rp-depth)) calc(-20px*var(--rp-depth)) rgb(0 0 0/calc(.6*var(--rp-depth))),0 1px 0 rgb(255 255 255/.04) inset}
.rp[data-variant=dawn] .rp-card[data-raised=true]{box-shadow:0 calc(30px*var(--rp-depth)) calc(70px*var(--rp-depth)) calc(-24px*var(--rp-depth)) rgb(87 82 121/calc(.5*var(--rp-depth)))}
.rp-card[data-flat=true]{background:transparent}
.rp-card-title{margin:0;font:500 1.2rem/1.25 var(--rp-display),${CJK};letter-spacing:-.01em}
.rp-card-desc{margin:.35rem 0 0;color:var(--rp-subtle);font-size:.9rem}

/* 按钮 */
.rp-btn{--h:38px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:var(--h);padding:0 1.15em;border-radius:var(--r);border:var(--rp-bw) solid transparent;
  font:500 .9rem/1 var(--rp-body),${CJK};white-space:nowrap;cursor:pointer;text-decoration:none;color:var(--rp-text);background:transparent;
  transition:background-color .18s,border-color .18s,color .18s,transform .18s cubic-bezier(.2,.8,.2,1)}
.rp-btn[data-size=sm]{--h:30px;font-size:.82rem;padding:0 .9em}
.rp-btn[data-size=lg]{--h:46px;font-size:.98rem;padding:0 1.6em}
.rp-btn:active{transform:scale(.98)}
.rp-btn:focus-visible,.rp-input:focus-visible,.rp-tab:focus-visible,.rp-switch:focus-visible{outline:1.5px solid var(--rp-accent);outline-offset:3px}
.rp-btn:disabled{opacity:.4;pointer-events:none}
.rp-btn[data-variant=primary]{background:var(--rp-accent);color:var(--rp-accent-fg);font-weight:600}
.rp-btn[data-variant=primary]:hover{background:color-mix(in oklab,var(--rp-accent) 88%,var(--rp-text))}
.rp-btn[data-variant=secondary]{background:var(--rp-overlay);border-color:var(--rp-hlHigh)}
.rp-btn[data-variant=secondary]:hover{border-color:var(--rp-muted)}
.rp-btn[data-variant=ghost]{color:var(--rp-subtle)}
.rp-btn[data-variant=ghost]:hover{background:var(--rp-hlLow);color:var(--rp-text)}
.rp-btn[data-variant=link]{padding:0;height:auto;color:var(--rp-accent);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.28em}
.rp-btn[data-variant=link]:hover{text-decoration-thickness:2px}

/* 输入框 */
.rp-field{display:grid;gap:.45rem}.rp-label{font-size:.8rem;color:var(--rp-subtle)}
.rp-input{width:100%;height:42px;padding:0 .9em;border-radius:var(--r);border:var(--rp-bw) solid var(--line);background:var(--rp-base);color:var(--rp-text);font:400 .95rem var(--rp-body),${CJK};transition:border-color .18s,box-shadow .18s}
.rp[data-variant=dawn] .rp-input{background:var(--rp-surface)}
.rp-input::placeholder{color:var(--rp-muted)}
.rp-input:hover{border-color:var(--rp-hlHigh)}
.rp-input:focus{outline:none;border-color:var(--rp-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--rp-accent) 20%,transparent)}

/* 徽标：只有一个小圆点带颜色 */
.rp-badge{--tone:var(--rp-accent);display:inline-flex;align-items:center;gap:.45rem;height:24px;padding:0 .7em;border-radius:999px;font:500 .74rem/1 var(--rp-body),${CJK};color:var(--rp-subtle);border:var(--rp-bw) solid var(--line);background:var(--rp-surface)}
.rp-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--tone)}
.rp-badge[data-tone=neutral]{--tone:var(--rp-muted)}.rp-badge[data-tone=success]{--tone:var(--rp-foam)}.rp-badge[data-tone=warning]{--tone:var(--rp-gold)}.rp-badge[data-tone=danger]{--tone:var(--rp-love)}.rp-badge[data-tone=rose]{--tone:var(--rp-rose)}

/* 选项卡：下划线滑动 */
.rp-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);border-bottom:var(--rp-bw) solid var(--line)}
.rp-tab-thumb{position:absolute;left:0;bottom:calc(var(--rp-bw)*-1);height:max(1.5px,var(--rp-bw));width:calc(100%/var(--n));transform:translateX(calc(var(--i)*100%));background:var(--rp-accent);transition:transform .34s cubic-bezier(.3,1,.4,1)}
.rp-tab{height:40px;border:0;background:transparent;color:var(--rp-muted);font:500 .88rem var(--rp-body),${CJK};cursor:pointer;transition:color .2s}
.rp-tab[aria-selected=true]{color:var(--rp-text)}.rp-tab:hover{color:var(--rp-text)}

/* 提示条 */
.rp-alert{--tone:var(--rp-accent);position:relative;display:flex;gap:.85rem;align-items:flex-start;padding:16px 18px 16px 20px;border-radius:var(--r);border:var(--rp-bw) solid var(--line);background:var(--rp-surface);overflow:hidden}
.rp-alert::before{content:'';position:absolute;inset:0 auto 0 0;width:2px;background:var(--tone)}
.rp-alert[data-tone=success]{--tone:var(--rp-foam)}.rp-alert[data-tone=warning]{--tone:var(--rp-gold)}.rp-alert[data-tone=danger]{--tone:var(--rp-love)}
.rp-alert-icon{flex:none;display:grid;place-items:center;width:24px;height:24px;margin-top:1px;color:var(--tone)}
.rp-alert-title{margin:0;font-weight:600;font-size:.92rem}.rp-alert-body{margin:.15rem 0 0;font-size:.86rem;color:var(--rp-subtle)}

/* 开关 */
.rp-switch{position:relative;flex:none;width:40px;height:22px;padding:0;border-radius:999px;border:var(--rp-bw) solid var(--rp-hlHigh);background:var(--rp-overlay);cursor:pointer;transition:background-color .22s,border-color .22s}
.rp-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--rp-subtle);transition:transform .26s cubic-bezier(.3,1.2,.5,1),background-color .22s}
.rp-switch[aria-checked=true]{background:color-mix(in oklab,var(--rp-accent) 28%,var(--rp-overlay));border-color:var(--rp-accent)}
.rp-switch[aria-checked=true]::after{transform:translateX(18px);background:var(--rp-accent)}

@media (prefers-reduced-motion:reduce){.rp-btn,.rp-tab-thumb,.rp-switch::after{transition:none}}
}`

export function StyleDusk({ className, style, children, ...props }: StyleDuskProps) {
  const { variant, accent, radius, borderWidth, depth, fontPairing } = { ...defaults, ...props }
  const palette = palettes[variant as Variant] ?? palettes.main
  const accentHex = palette[(accentNames as readonly string[]).includes(accent) ? (accent as Accent) : 'iris']
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.serif
  const vars: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(palette)) vars[`--rp-${name}`] = value
  vars['--rp-accent'] = accentHex
  vars['--rp-accent-fg'] = readableOn(accentHex, palette.base === '#faf4ed' ? palette.text : palette.base, '#faf4ed')
  vars['--rp-radius'] = `${radius}px`
  vars['--rp-bw'] = `${borderWidth}px`
  vars['--rp-depth'] = depth
  vars['--rp-display'] = fonts.display
  vars['--rp-body'] = fonts.body
  vars['--rp-mono'] = fonts.mono
  return (
    <div className={cn('rp', className)} data-variant={variant} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

export type CardProps = HTMLAttributes<HTMLDivElement> & { raised?: boolean; flat?: boolean }
export function Card({ className, raised, flat, ...rest }: CardProps) {
  return <div className={cn('rp-card', className)} data-raised={raised} data-flat={flat} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('rp-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('rp-card-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'link'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('rp-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('rp-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="rp-field">
      <label className="rp-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'rose' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('rp-badge', className)} data-tone={tone} {...rest} />
}

export type TabsProps = { items: { id: string; label: string }[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; className?: string; label?: string }
export function Tabs({ items, value, defaultValue, onValueChange, className, label }: TabsProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id)
  const current = value ?? inner
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, items.findIndex((item) => item.id === current))
  const select = (i: number) => {
    const at = (i + items.length) % items.length
    setInner(items[at].id)
    onValueChange?.(items[at].id)
    refs.current[at]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('rp-tabs', className)}
      style={{ '--n': items.length, '--i': index } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') select(index + 1)
        else if (event.key === 'ArrowLeft') select(index - 1)
        else if (event.key === 'Home') select(0)
        else if (event.key === 'End') select(items.length - 1)
        else return
        event.preventDefault()
      }}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="rp-tab"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => select(i)}
        >
          {item.label}
        </button>
      ))}
      <span className="rp-tab-thumb" aria-hidden />
    </div>
  )
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'accent' | 'success' | 'warning' | 'danger'; title: string }
export function Alert({ className, tone = 'accent', title, children, ...rest }: AlertProps) {
  const path = tone === 'success' ? 'M5 12.5l4.5 4.5L19 7.5' : tone === 'accent' ? 'M12 8v.01M12 11.5v5' : 'M12 7v6m0 3.5v.01'
  return (
    <div role="status" className={cn('rp-alert', className)} data-tone={tone} {...rest}>
      <span className="rp-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="rp-alert-title">{title}</p>
        {children ? <p className="rp-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('rp-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
