// SPDX-License-Identifier: MIT
// Copyright (c) 2021 Catppuccin
// Source: https://github.com/catppuccin/catppuccin/blob/d09787d/README.md
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  flavor: 'latte',
  accent: 'mauve',
  radius: 20,
  borderWidth: 2,
  depth: 0.6,
  fontPairing: 'bricolage',
}
/* @motif:end */

export type StyleSoftPastelProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Catppuccin 四种风味的调色板（亮色 Latte，三档暗色）。 */
export const palettes = {
  latte: {rosewater: '#dc8a78', flamingo: '#dd7878', pink: '#ea76cb', mauve: '#8839ef', red: '#d20f39', maroon: '#e64553', peach: '#fe640b', yellow: '#df8e1d', green: '#40a02b', teal: '#179299', sky: '#04a5e5', sapphire: '#209fb5', blue: '#1e66f5', lavender: '#7287fd', text: '#4c4f69', subtext1: '#5c5f77', subtext0: '#6c6f85', overlay2: '#7c7f93', overlay1: '#8c8fa1', overlay0: '#9ca0b0', surface2: '#acb0be', surface1: '#bcc0cc', surface0: '#ccd0da', base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8'},
  frappe: {rosewater: '#f2d5cf', flamingo: '#eebebe', pink: '#f4b8e4', mauve: '#ca9ee6', red: '#e78284', maroon: '#ea999c', peach: '#ef9f76', yellow: '#e5c890', green: '#a6d189', teal: '#81c8be', sky: '#99d1db', sapphire: '#85c1dc', blue: '#8caaee', lavender: '#babbf1', text: '#c6d0f5', subtext1: '#b5bfe2', subtext0: '#a5adce', overlay2: '#949cbb', overlay1: '#838ba7', overlay0: '#737994', surface2: '#626880', surface1: '#51576d', surface0: '#414559', base: '#303446', mantle: '#292c3c', crust: '#232634'},
  macchiato: {rosewater: '#f4dbd6', flamingo: '#f0c6c6', pink: '#f5bde6', mauve: '#c6a0f6', red: '#ed8796', maroon: '#ee99a0', peach: '#f5a97f', yellow: '#eed49f', green: '#a6da95', teal: '#8bd5ca', sky: '#91d7e3', sapphire: '#7dc4e4', blue: '#8aadf4', lavender: '#b7bdf8', text: '#cad3f5', subtext1: '#b8c0e0', subtext0: '#a5adcb', overlay2: '#939ab7', overlay1: '#8087a2', overlay0: '#6e738d', surface2: '#5b6078', surface1: '#494d64', surface0: '#363a4f', base: '#24273a', mantle: '#1e2030', crust: '#181926'},
  mocha: {rosewater: '#f5e0dc', flamingo: '#f2cdcd', pink: '#f5c2e7', mauve: '#cba6f7', red: '#f38ba8', maroon: '#eba0ac', peach: '#fab387', yellow: '#f9e2af', green: '#a6e3a1', teal: '#94e2d5', sky: '#89dceb', sapphire: '#74c7ec', blue: '#89b4fa', lavender: '#b4befe', text: '#cdd6f4', subtext1: '#bac2de', subtext0: '#a6adc8', overlay2: '#9399b2', overlay1: '#7f849c', overlay0: '#6c7086', surface2: '#585b70', surface1: '#45475a', surface0: '#313244', base: '#1e1e2e', mantle: '#181825', crust: '#11111b'},
} as const

export type Flavor = keyof typeof palettes
export const accentNames = ['mauve', 'pink', 'flamingo', 'peach', 'yellow', 'green', 'teal', 'blue', 'lavender'] as const
export type Accent = (typeof accentNames)[number]

export const fontPairings = {
  bricolage: { display: "'Bricolage Grotesque Variable'", body: "'Plus Jakarta Sans Variable'", mono: "'JetBrains Mono Variable'" },
  outfit: { display: "'Outfit Variable'", body: "'Outfit Variable'", mono: "'JetBrains Mono Variable'" },
  fraunces: { display: "'Fraunces Variable'", body: "'Manrope Variable'", mono: "'JetBrains Mono Variable'" },
  manrope: { display: "'Manrope Variable'", body: "'Manrope Variable'", mono: "'JetBrains Mono Variable'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string, dark: string, light: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.3 ? dark : light
}

/*
 * 柔和粉彩：Catppuccin 调色板 + 圆润的形状 + 按钮底部的一道「厚边」。
 * 所有规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.cp{position:relative;min-height:100%;color:var(--cp-text);font-family:var(--cp-body),${CJK};font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;
  background-color:var(--cp-base);background-image:radial-gradient(color-mix(in oklab,var(--cp-overlay0) 30%,transparent) 1.3px,transparent 1.6px);background-size:24px 24px;
  --r:var(--cp-radius);--r-md:calc(var(--cp-radius)*.72);--r-sm:calc(var(--cp-radius)*.5);
  --edge:calc(1px + 4px*var(--cp-depth));
  --shadow-tint:color-mix(in oklab,var(--cp-accent) 45%,var(--cp-crust));
  --line:color-mix(in oklab,var(--cp-overlay0) 32%,var(--cp-base))}
.cp *,.cp *::before,.cp *::after{box-sizing:border-box}
.cp-lift{box-shadow:0 calc(2px + 8px*var(--cp-depth)) calc(6px + 26px*var(--cp-depth)) calc(-6px) color-mix(in oklab,var(--shadow-tint) calc(38% * var(--cp-depth) + 6%),transparent)}

/* 文字 */
.cp-display{font-family:var(--cp-display),${CJK};font-weight:700;letter-spacing:-.03em;line-height:1.02}
.cp-mono{font-family:var(--cp-mono),ui-monospace,monospace}
.cp-sub{color:var(--cp-subtext0)}.cp-faint{color:var(--cp-overlay1)}
.cp-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font:700 .74rem/1 var(--cp-body),${CJK};letter-spacing:.08em;text-transform:uppercase;color:var(--cp-accent-ink)}
.cp-hl{background:linear-gradient(transparent 62%,color-mix(in oklab,var(--cp-accent) 38%,transparent) 62% 92%,transparent 92%);padding:0 .08em}

/* 卡片：可以带一种粉彩底色 */
.cp-card{--t:transparent;position:relative;padding:22px;border-radius:var(--r);border:var(--cp-bw) solid var(--line);background:var(--cp-mantle)}
.cp-card[data-tint]{background:color-mix(in oklab,var(--t) 18%,var(--cp-base));border-color:color-mix(in oklab,var(--t) 44%,var(--cp-base))}
.cp-card[data-tint=surface]{background:var(--cp-base);border-color:var(--line)}
[data-tint=mauve]{--t:var(--cp-mauve)}[data-tint=pink]{--t:var(--cp-pink)}[data-tint=peach]{--t:var(--cp-peach)}[data-tint=yellow]{--t:var(--cp-yellow)}
[data-tint=green]{--t:var(--cp-green)}[data-tint=teal]{--t:var(--cp-teal)}[data-tint=blue]{--t:var(--cp-blue)}[data-tint=lavender]{--t:var(--cp-lavender)}[data-tint=flamingo]{--t:var(--cp-flamingo)}
.cp-card-title{margin:0;font:700 1.15rem/1.2 var(--cp-display),${CJK};letter-spacing:-.02em}
.cp-card-desc{margin:.3rem 0 0;color:var(--cp-subtext0);font-size:.9rem}

/* 按钮：底部一道厚边，按下时压下去 */
.cp-btn{--h:42px;--bg:var(--cp-accent);--fg:var(--cp-accent-fg);--edge-c:color-mix(in oklab,var(--cp-accent) 66%,var(--cp-crust));
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:var(--h);padding:0 1.25em;border:0;border-radius:var(--r-md);
  background:var(--bg);color:var(--fg);font:700 .92rem/1 var(--cp-body),${CJK};white-space:nowrap;cursor:pointer;text-decoration:none;
  box-shadow:0 var(--edge) 0 var(--edge-c);transform:translateY(0);transition:transform .14s cubic-bezier(.3,1.4,.5,1),box-shadow .14s,background-color .18s}
.cp-btn[data-size=sm]{--h:34px;font-size:.82rem;padding:0 1em}
.cp-btn[data-size=lg]{--h:52px;font-size:1.02rem;padding:0 1.6em;border-radius:var(--r)}
.cp-btn:hover{transform:translateY(-2px);box-shadow:0 calc(var(--edge) + 2px) 0 var(--edge-c)}
.cp-btn:active{transform:translateY(calc(var(--edge)*.85));box-shadow:0 calc(var(--edge)*.15) 0 var(--edge-c)}
.cp-btn:focus-visible,.cp-input:focus-visible,.cp-tab:focus-visible,.cp-switch:focus-visible,.cp-check:focus-visible{outline:3px solid color-mix(in oklab,var(--cp-accent) 55%,transparent);outline-offset:2px}
.cp-btn:disabled{opacity:.5;pointer-events:none;box-shadow:none}
.cp-btn[data-variant=soft]{--bg:color-mix(in oklab,var(--cp-accent) 20%,var(--cp-base));--fg:var(--cp-accent-ink);--edge-c:color-mix(in oklab,var(--cp-accent) 36%,var(--cp-base))}
.cp-btn[data-variant=outline]{--bg:var(--cp-base);--fg:var(--cp-text);--edge-c:var(--cp-surface1);box-shadow:0 var(--edge) 0 var(--edge-c),inset 0 0 0 var(--cp-bw) var(--cp-surface1)}
.cp-btn[data-variant=ghost]{--bg:transparent;--fg:var(--cp-subtext1);box-shadow:none}
.cp-btn[data-variant=ghost]:hover{--bg:color-mix(in oklab,var(--cp-accent) 14%,transparent);--fg:var(--cp-accent-ink);box-shadow:none}
.cp-btn[data-variant=ghost]:active{box-shadow:none;transform:translateY(1px)}

/* 输入框 */
.cp-field{display:grid;gap:.4rem}.cp-label{font-size:.82rem;font-weight:700;color:var(--cp-subtext1)}
.cp-input{width:100%;height:46px;padding:0 1em;border-radius:var(--r-md);border:var(--cp-bw) solid var(--cp-surface0);background:var(--cp-base);color:var(--cp-text);font:600 .95rem var(--cp-body),${CJK};
  box-shadow:inset 0 2px 0 color-mix(in oklab,var(--cp-surface0) 60%,transparent);transition:border-color .18s,box-shadow .18s}
.cp-input::placeholder{color:var(--cp-overlay0);font-weight:500}
.cp-input:hover{border-color:var(--cp-surface1)}
.cp-input:focus{outline:none;border-color:var(--cp-accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--cp-accent) 24%,transparent)}

/* 徽标：粉彩底 + 深色字 */
.cp-badge{--tone:var(--cp-accent);display:inline-flex;align-items:center;gap:.35rem;height:26px;padding:0 .8em;border-radius:999px;font:700 .74rem/1 var(--cp-body),${CJK};
  color:color-mix(in oklab,var(--tone) 62%,var(--cp-text));background:color-mix(in oklab,var(--tone) 22%,var(--cp-base));border:var(--cp-bw) solid color-mix(in oklab,var(--tone) 34%,var(--cp-base))}
.cp-badge[data-tone=neutral]{--tone:var(--cp-overlay1)}.cp-badge[data-tone=green]{--tone:var(--cp-green)}.cp-badge[data-tone=yellow]{--tone:var(--cp-yellow)}
.cp-badge[data-tone=red]{--tone:var(--cp-red)}.cp-badge[data-tone=blue]{--tone:var(--cp-blue)}.cp-badge[data-tone=peach]{--tone:var(--cp-peach)}.cp-badge[data-tone=pink]{--tone:var(--cp-pink)}

/* 选项卡：药丸滑块 */
.cp-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);padding:5px;border-radius:calc(var(--r-md) + 4px);background:color-mix(in oklab,var(--cp-surface0) 55%,var(--cp-base));border:var(--cp-bw) solid var(--line)}
.cp-tab-thumb{position:absolute;top:5px;bottom:5px;left:5px;width:calc((100% - 10px)/var(--n));border-radius:var(--r-md);transform:translateX(calc(var(--i)*100%));
  background:var(--cp-base);box-shadow:0 2px 0 var(--cp-surface1),0 6px 14px -6px color-mix(in oklab,var(--shadow-tint) 50%,transparent);transition:transform .32s cubic-bezier(.3,1.35,.5,1)}
.cp-tab{position:relative;z-index:1;height:36px;border:0;background:transparent;color:var(--cp-subtext0);font:700 .86rem var(--cp-body),${CJK};cursor:pointer;border-radius:var(--r-md);transition:color .2s}
.cp-tab[aria-selected=true]{color:var(--cp-accent-ink)}.cp-tab:hover{color:var(--cp-text)}

/* 提示条 */
.cp-alert{--tone:var(--cp-accent);display:flex;gap:.9rem;align-items:flex-start;padding:16px 18px;border-radius:var(--r-md);background:color-mix(in oklab,var(--tone) 16%,var(--cp-base));border:var(--cp-bw) solid color-mix(in oklab,var(--tone) 40%,var(--cp-base))}
.cp-alert[data-tone=success]{--tone:var(--cp-green)}.cp-alert[data-tone=warning]{--tone:var(--cp-yellow)}.cp-alert[data-tone=danger]{--tone:var(--cp-red)}
.cp-alert-icon{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--tone);color:var(--cp-crust);box-shadow:0 2px 0 color-mix(in oklab,var(--tone) 60%,var(--cp-crust))}
.cp-alert-title{margin:0;font-weight:800;font-size:.94rem}.cp-alert-body{margin:.15rem 0 0;font-size:.88rem;color:var(--cp-subtext0)}

/* 开关与复选框 */
.cp-switch{position:relative;flex:none;width:52px;height:30px;padding:0;border-radius:999px;border:0;background:var(--cp-surface1);cursor:pointer;box-shadow:inset 0 2px 0 color-mix(in oklab,var(--cp-crust) 14%,transparent);transition:background-color .2s}
.cp-switch::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:var(--cp-base);box-shadow:0 2px 0 color-mix(in oklab,var(--cp-crust) 26%,transparent);transition:transform .28s cubic-bezier(.3,1.5,.5,1)}
.cp-switch[aria-checked=true]{background:var(--cp-accent)}.cp-switch[aria-checked=true]::after{transform:translateX(22px)}
.cp-check{flex:none;display:grid;place-items:center;width:26px;height:26px;padding:0;border-radius:9px;border:var(--cp-bw) solid var(--cp-surface1);background:var(--cp-base);color:transparent;cursor:pointer;transition:background-color .16s,border-color .16s,transform .2s cubic-bezier(.3,1.6,.5,1)}
.cp-check[aria-checked=true]{background:var(--cp-accent);border-color:var(--cp-accent);color:var(--cp-accent-fg);transform:scale(1.06)}

@media (prefers-reduced-motion:reduce){.cp-btn,.cp-tab-thumb,.cp-switch::after,.cp-check{transition:none}}
}`

export function StyleSoftPastel({ className, style, children, ...props }: StyleSoftPastelProps) {
  const { flavor, accent, radius, borderWidth, depth, fontPairing } = { ...defaults, ...props }
  const palette = palettes[flavor as Flavor] ?? palettes.latte
  const accentHex = palette[(accentNames as readonly string[]).includes(accent) ? (accent as Accent) : 'mauve']
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.bricolage
  const vars: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(palette)) vars[`--cp-${name}`] = value
  vars['--cp-accent'] = accentHex
  vars['--cp-accent-fg'] = flavor === 'latte' ? readableOn(accentHex, palette.text, '#ffffff') : palette.crust
  // 在浅色底上，强调色文字要更深一点才够对比度。
  vars['--cp-accent-ink'] = flavor === 'latte' ? `color-mix(in oklab, ${accentHex} 72%, ${palette.text})` : accentHex
  vars['--cp-radius'] = `${radius}px`
  vars['--cp-bw'] = `${borderWidth}px`
  vars['--cp-depth'] = depth
  vars['--cp-display'] = fonts.display
  vars['--cp-body'] = fonts.body
  vars['--cp-mono'] = fonts.mono
  return (
    <div className={cn('cp', className)} data-flavor={flavor} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

export type Tint = 'surface' | 'mauve' | 'pink' | 'peach' | 'yellow' | 'green' | 'teal' | 'blue' | 'lavender' | 'flamingo'

export type CardProps = HTMLAttributes<HTMLDivElement> & { tint?: Tint }
export function Card({ className, tint, ...rest }: CardProps) {
  return <div className={cn('cp-card cp-lift', className)} data-tint={tint} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('cp-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('cp-card-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'outline' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'primary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('cp-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('cp-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="cp-field">
      <label className="cp-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'green' | 'yellow' | 'red' | 'blue' | 'peach' | 'pink' }
export function Badge({ className, tone = 'accent', ...rest }: BadgeProps) {
  return <span className={cn('cp-badge', className)} data-tone={tone} {...rest} />
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
      className={cn('cp-tabs', className)}
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
      <span className="cp-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="cp-tab"
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
    <div role="status" className={cn('cp-alert', className)} data-tone={tone} {...rest}>
      <span className="cp-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="cp-alert-title">{title}</p>
        {children ? <p className="cp-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('cp-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

export function Checkbox({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} className={cn('cp-check', className)} onClick={() => onCheckedChange?.(!checked)} {...rest}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </button>
  )
}
