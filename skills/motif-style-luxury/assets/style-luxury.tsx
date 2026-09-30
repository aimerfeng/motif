// SPDX-License-Identifier: MIT
// Copyright (c) 2020 Pouya Saadeghi
// Source: https://github.com/saadeghi/daisyui/blob/c51f501/packages/daisyui/src/themes/luxury.css
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#dca54d',
  radius: 2,
  borderWidth: 1,
  depth: 0.5,
  fontPairing: 'playfair',
  dark: true,
}
/* @motif:end */

export type StyleLuxuryProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * daisyUI luxury 主题的令牌：近黑的三层底、香槟色的 neutral-content、午夜蓝与梅紫两个深色面板色。
 * 金色 accent 默认取它的 base-content（oklch 75.7% .123 76.9），可以换成别的贵金属色。
 * 浅色模式是 Motif 补充的象牙纸版本，不属于 daisyUI。
 */
export const tokens = {
  dark: { base100: 'oklch(14.076% 0.004 285.822)', base200: 'oklch(20.219% 0.004 308.229)', base300: 'oklch(23.219% 0.004 308.229)', champagne: 'oklch(93.203% 0.089 90.861)', navy: 'oklch(27.581% 0.064 261.069)', plum: 'oklch(36.674% 0.051 338.825)' },
  light: { base100: '#f6f1e7', base200: '#efe8da', base300: '#e3dac8', champagne: '#1c1812', navy: '#1d2a44', plum: '#4a2d40' },
} as const

export const fontPairings = {
  playfair: { display: "'Playfair Display Variable'", body: "'Inter Tight Variable'" },
  fraunces: { display: "'Fraunces Variable'", body: "'Manrope Variable'" },
  dmserif: { display: "'DM Serif Display'", body: "'Inter Tight Variable'" },
  instrument: { display: "'Instrument Serif'", body: "'Geist Variable'" },
} as const

const CJK = "'PingFang SC', 'Songti SC', 'Microsoft YaHei', serif"
const CJK_SANS = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.3 ? '#14110b' : '#faf6ec'
}

/*
 * 奢华：近黑（或象牙）的底、金色发丝线、高反差衬线标题、大写加宽字距的小标签、双线分隔。
 * 没有渐变按钮，没有圆角胶囊，没有彩色。金色只用来「勾边」。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.lx{position:relative;isolation:isolate;min-height:100%;color:var(--lx-fg);background:var(--lx-base100);font-family:var(--lx-body),${CJK_SANS};font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased;
  --r:var(--lx-radius);--gold:var(--lx-accent);--hair:color-mix(in oklab,var(--lx-accent) 38%,transparent);--hair-soft:color-mix(in oklab,var(--lx-accent) 18%,transparent);--dim:color-mix(in oklab,var(--lx-fg) 68%,transparent)}
.lx *,.lx *::before,.lx *::after{box-sizing:border-box}
.lx[data-mode=dark]{--lx-fg:color-mix(in oklab,var(--lx-champagne) 42%,#f3eee3);--gold-ink:var(--lx-accent);--shadow:0 0 0}
.lx[data-mode=light]{--lx-fg:var(--lx-champagne);--gold-ink:color-mix(in oklab,var(--lx-accent) 62%,#000);--shadow:52 38 12}
.lx::before{content:'';position:absolute;inset:0 0 auto 0;height:min(760px,100vh);z-index:-1;pointer-events:none;background:radial-gradient(60% 70% at 50% -20%,color-mix(in oklab,var(--lx-accent) 16%,transparent),transparent 72%)}
.lx[data-mode=light]::before{background:radial-gradient(60% 70% at 50% -20%,color-mix(in oklab,var(--lx-accent) 22%,transparent),transparent 72%)}

/* 文字 */
.lx-display{font-family:var(--lx-display),${CJK};font-weight:400;letter-spacing:-.015em;line-height:1.04}
.lx-em{font-style:italic;color:var(--gold-ink)}
.lx-eyebrow{font:600 .68rem/1 var(--lx-body),${CJK_SANS};letter-spacing:.3em;text-transform:uppercase;color:var(--gold-ink)}
.lx-dim{color:var(--dim)}
.lx-num{font-family:var(--lx-display),${CJK};font-variant-numeric:lining-nums tabular-nums}
.lx-dropcap::first-letter{float:left;font:400 4em/.8 var(--lx-display),${CJK};padding:.05em .07em 0 0;color:var(--gold-ink)}

/* 分隔线：单线、双线、带菱形的装饰线 */
.lx-rule{height:0;border:0;border-top:var(--lx-bw) solid var(--hair)}
.lx-rule-double{height:5px;border:0;border-top:var(--lx-bw) solid var(--hair);border-bottom:var(--lx-bw) solid var(--hair)}
.lx-ornament{display:flex;align-items:center;gap:14px;color:var(--gold-ink)}
.lx-ornament::before,.lx-ornament::after{content:'';flex:1;border-top:var(--lx-bw) solid var(--hair)}
.lx-ornament>i{width:7px;height:7px;transform:rotate(45deg);border:var(--lx-bw) solid currentColor}

/* 卡片：金色发丝线外框 + 内缩的细线框 */
.lx-card{position:relative;padding:28px;border-radius:var(--r);border:var(--lx-bw) solid var(--hair);background:linear-gradient(180deg,var(--lx-base200),color-mix(in oklab,var(--lx-base200) 70%,var(--lx-base100)));
  box-shadow:0 calc(34px*var(--lx-depth)) calc(70px*var(--lx-depth)) calc(-26px*var(--lx-depth)) rgb(var(--shadow)/calc(.85*var(--lx-depth)))}
.lx[data-mode=light] .lx-card{background:var(--lx-base200)}
.lx-card[data-framed=true]::before{content:'';position:absolute;inset:7px;border:var(--lx-bw) solid var(--hair-soft);border-radius:max(0px,calc(var(--r) - 2px));pointer-events:none}
.lx-card[data-tone=navy]{background:linear-gradient(160deg,color-mix(in oklab,var(--lx-navy) 100%,#000),color-mix(in oklab,var(--lx-navy) 70%,#000));border-color:var(--hair)}
.lx-card[data-tone=plum]{background:linear-gradient(160deg,var(--lx-plum),color-mix(in oklab,var(--lx-plum) 66%,#000))}
.lx-card[data-tone=navy],.lx-card[data-tone=plum]{color:#f3eee3}
.lx-card-title{margin:0;font:400 1.5rem/1.15 var(--lx-display),${CJK};letter-spacing:-.01em}
.lx-card-desc{margin:.45rem 0 0;color:var(--dim);font-size:.92rem}

/* 按钮：直角、大写、加宽字距 */
.lx-btn{--h:46px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.7rem;height:var(--h);padding:0 1.9em;border-radius:var(--r);border:var(--lx-bw) solid var(--gold);background:transparent;color:var(--gold-ink);
  font:600 .7rem/1 var(--lx-body),${CJK_SANS};letter-spacing:.22em;text-transform:uppercase;white-space:nowrap;cursor:pointer;text-decoration:none;transition:background-color .25s,color .25s,border-color .25s,letter-spacing .35s cubic-bezier(.2,.8,.2,1)}
.lx-btn[data-size=sm]{--h:36px;font-size:.64rem;padding:0 1.4em}
.lx-btn[data-size=lg]{--h:56px;font-size:.76rem;padding:0 2.4em}
.lx-btn:hover{background:var(--gold);color:var(--lx-accent-fg);letter-spacing:.26em}
.lx-btn:active{filter:brightness(.92)}
.lx-btn:focus-visible,.lx-input:focus-visible,.lx-tab:focus-visible,.lx-switch:focus-visible{outline:1px solid var(--gold);outline-offset:4px}
.lx-btn:disabled{opacity:.38;pointer-events:none}
.lx-btn[data-variant=primary]{background:var(--gold);color:var(--lx-accent-fg)}
.lx-btn[data-variant=primary]:hover{background:color-mix(in oklab,var(--gold) 82%,#fff);border-color:color-mix(in oklab,var(--gold) 82%,#fff)}
.lx-btn[data-variant=ghost]{border-color:transparent;color:var(--dim)}
.lx-btn[data-variant=ghost]:hover{background:transparent;color:var(--gold-ink);letter-spacing:.26em}
.lx-btn[data-variant=link]{--h:auto;padding:0 0 .4em;border:0;border-bottom:var(--lx-bw) solid var(--hair);border-radius:0}
.lx-btn[data-variant=link]:hover{background:transparent;color:var(--gold-ink);border-bottom-color:var(--gold)}

/* 输入框：只有一条底线 */
.lx-field{display:grid;gap:.55rem}.lx-label{font:600 .64rem/1 var(--lx-body),${CJK_SANS};letter-spacing:.26em;text-transform:uppercase;color:var(--gold-ink)}
.lx-input{width:100%;height:44px;padding:0 .1em;border:0;border-bottom:var(--lx-bw) solid var(--hair);border-radius:0;background:transparent;color:var(--lx-fg);font:400 1.15rem var(--lx-display),${CJK};transition:border-color .25s,box-shadow .25s}
.lx-input::placeholder{color:color-mix(in oklab,var(--lx-fg) 40%,transparent);font-style:italic}
.lx-input:hover{border-bottom-color:var(--gold)}
.lx-input:focus{outline:none;border-bottom-color:var(--gold);box-shadow:0 var(--lx-bw) 0 var(--gold)}

/* 徽标：小型大写字，一圈发丝线 */
.lx-badge{--tone:var(--gold-ink);display:inline-flex;align-items:center;gap:.5rem;height:24px;padding:0 .9em;border-radius:var(--r);font:600 .6rem/1 var(--lx-body),${CJK_SANS};letter-spacing:.22em;text-transform:uppercase;color:var(--tone);border:var(--lx-bw) solid color-mix(in oklab,var(--tone) 50%,transparent)}
.lx-badge[data-tone=success]{--tone:#7fb69a}.lx-badge[data-tone=warning]{--tone:#d9a441}.lx-badge[data-tone=danger]{--tone:#d17474}.lx-badge[data-tone=neutral]{--tone:var(--dim)}
.lx[data-mode=light] .lx-badge[data-tone=success]{--tone:#2f6b50}.lx[data-mode=light] .lx-badge[data-tone=warning]{--tone:#8a5b00}.lx[data-mode=light] .lx-badge[data-tone=danger]{--tone:#9a2f2f}

/* 选项卡：文字 + 一条金线，线上停一个菱形 */
.lx-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);border-bottom:var(--lx-bw) solid var(--hair-soft)}
.lx-tab-thumb{position:absolute;left:0;bottom:calc(var(--lx-bw)*-1);height:var(--lx-bw);width:calc(100%/var(--n));transform:translateX(calc(var(--i)*100%));background:var(--gold);transition:transform .45s cubic-bezier(.3,1,.4,1)}
.lx-tab-thumb::after{content:'';position:absolute;left:50%;top:50%;width:7px;height:7px;background:var(--lx-base100);border:var(--lx-bw) solid var(--gold);transform:translate(-50%,-50%) rotate(45deg)}
.lx-tab{height:48px;border:0;background:transparent;color:var(--dim);font:600 .66rem var(--lx-body),${CJK_SANS};letter-spacing:.24em;text-transform:uppercase;cursor:pointer;transition:color .25s}
.lx-tab[aria-selected=true]{color:var(--gold-ink)}.lx-tab:hover{color:var(--lx-fg)}

/* 提示条 */
.lx-alert{--tone:var(--gold-ink);display:flex;gap:1rem;align-items:flex-start;padding:18px 22px;border-radius:var(--r);border:var(--lx-bw) solid var(--hair);border-left:calc(var(--lx-bw) + 1px) solid var(--tone);background:color-mix(in oklab,var(--lx-base200) 80%,transparent)}
.lx-alert[data-tone=success]{--tone:#7fb69a}.lx-alert[data-tone=warning]{--tone:#d9a441}.lx-alert[data-tone=danger]{--tone:#d17474}
.lx[data-mode=light] .lx-alert[data-tone=success]{--tone:#2f6b50}.lx[data-mode=light] .lx-alert[data-tone=warning]{--tone:#8a5b00}.lx[data-mode=light] .lx-alert[data-tone=danger]{--tone:#9a2f2f}
.lx-alert-icon{flex:none;display:grid;place-items:center;width:26px;height:26px;margin-top:1px;color:var(--tone)}
.lx-alert-title{margin:0;font:400 1.15rem/1.3 var(--lx-display),${CJK};font-style:italic}.lx-alert-body{margin:.2rem 0 0;font-size:.88rem;color:var(--dim)}

/* 开关 */
.lx-switch{position:relative;flex:none;width:46px;height:24px;padding:0;border-radius:999px;border:var(--lx-bw) solid var(--hair);background:transparent;cursor:pointer;transition:border-color .25s,background-color .25s}
.lx-switch::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--dim);transition:transform .35s cubic-bezier(.3,1,.4,1),background-color .25s}
.lx-switch[aria-checked=true]{border-color:var(--gold);background:color-mix(in oklab,var(--gold) 14%,transparent)}
.lx-switch[aria-checked=true]::after{transform:translateX(22px);background:var(--gold)}

@media (prefers-reduced-motion:reduce){.lx-btn,.lx-tab-thumb,.lx-switch::after{transition:none}}
}`

export function StyleLuxury({ className, style, children, ...props }: StyleLuxuryProps) {
  const { accent, radius, borderWidth, depth, fontPairing, dark } = { ...defaults, ...props }
  const t = dark ? tokens.dark : tokens.light
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.playfair
  const vars = {
    '--lx-base100': t.base100,
    '--lx-base200': t.base200,
    '--lx-base300': t.base300,
    '--lx-champagne': t.champagne,
    '--lx-navy': t.navy,
    '--lx-plum': t.plum,
    '--lx-accent': accent,
    '--lx-accent-fg': readableOn(accent),
    '--lx-radius': `${radius}px`,
    '--lx-bw': `${borderWidth}px`,
    '--lx-depth': depth,
    '--lx-display': fonts.display,
    '--lx-body': fonts.body,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('lx', className)} data-mode={dark ? 'dark' : 'light'} style={vars}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 卡片。`framed` 加一圈内缩细线；`tone` 换成午夜蓝或梅紫的深色面板。 */
export type CardProps = HTMLAttributes<HTMLDivElement> & { framed?: boolean; tone?: 'navy' | 'plum' }
export function Card({ className, framed, tone, ...rest }: CardProps) {
  return <div className={cn('lx-card', className)} data-framed={framed} data-tone={tone} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('lx-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('lx-card-desc', className)} {...rest} />

/** 带菱形的装饰分隔线。 */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('lx-ornament', className)} aria-hidden>
      <i />
    </div>
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'link'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('lx-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('lx-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="lx-field">
      <label className="lx-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('lx-badge', className)} data-tone={tone} {...rest} />
}

export type TabsProps = { items: { id: string; label: string }[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; className?: string; label?: string }
/** 选项卡：方向键切换，Home / End 跳到两端。 */
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
      className={cn('lx-tabs', className)}
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
      <span className="lx-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="lx-tab"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => select(i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'accent' | 'success' | 'warning' | 'danger'; title: string }
export function Alert({ className, tone = 'accent', title, children, ...rest }: AlertProps) {
  const path = tone === 'success' ? 'M5 12.5l4.5 4.5L19 7.5' : tone === 'accent' ? 'M12 8v.01M12 11.5v5' : 'M12 7v6m0 3.5v.01'
  return (
    <div role="status" className={cn('lx-alert', className)} data-tone={tone} {...rest}>
      <span className="lx-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="lx-alert-title">{title}</p>
        {children ? <p className="lx-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('lx-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
