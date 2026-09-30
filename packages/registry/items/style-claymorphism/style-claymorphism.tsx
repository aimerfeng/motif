// SPDX-License-Identifier: Apache-2.0
// tweakcn (https://github.com/jnsahaj/tweakcn)
// Source: https://github.com/jnsahaj/tweakcn/blob/a3b47b3/utils/theme-presets.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  radius: 22,
  borderWidth: 1,
  puff: 0.85,
  fontPairing: 'jakarta',
  dark: false,
}
/* @motif:end */

export type StyleClaymorphismProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** tweakcn「claymorphism」预设的中性色（亮 / 暗）。主色由 accent 参数覆盖。 */
export const palettes = {
  light: { background: '#e7e5e4', foreground: '#1e293b', card: '#f5f5f4', muted: '#e7e5e4', mutedForeground: '#6b7280', secondary: '#d6d3d1', secondaryForeground: '#4b5563', accent: '#f3e5f5', border: '#d6d3d1', destructive: '#ef4444', shadow: '240 4% 60%' },
  dark: { background: '#1e1b18', foreground: '#e2e8f0', card: '#2c2825', muted: '#1f1c19', mutedForeground: '#9ca3af', secondary: '#3a3633', secondaryForeground: '#d1d5db', accent: '#484441', border: '#3a3633', destructive: '#ef4444', shadow: '0 0% 0%' },
} as const

export const fontPairings = {
  jakarta: { display: "'Plus Jakarta Sans Variable'", body: "'Plus Jakarta Sans Variable'", mono: "'Geist Mono Variable'" },
  outfit: { display: "'Outfit Variable'", body: "'Outfit Variable'", mono: "'Geist Mono Variable'" },
  syne: { display: "'Syne Variable'", body: "'Manrope Variable'", mono: "'Geist Mono Variable'" },
  dmserif: { display: "'DM Serif Display'", body: "'Plus Jakarta Sans Variable'", mono: "'Geist Mono Variable'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string, dark: string, light: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? dark : light
}

/*
 * 黏土：一切都是「充了气」的。凸起靠四层阴影叠出来：内侧左上高光、内侧右下暗部、右下投影、左上反光。
 * 凹陷（输入框、选项卡轨道）把内阴影反过来。按下按钮就是从凸变凹。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.cl{position:relative;isolation:isolate;min-height:100%;color:var(--cl-foreground);background:var(--cl-background);font-family:var(--cl-body),${CJK};font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;
  --r:var(--cl-radius);--r-md:calc(var(--cl-radius)*.75);--r-sm:calc(var(--cl-radius)*.5);--d:var(--cl-puff);
  --rim:color-mix(in oklab,#fff 55%,transparent);
  --puff:inset calc(6px*var(--d)) calc(6px*var(--d)) calc(12px*var(--d)) var(--hl),inset calc(-6px*var(--d)) calc(-6px*var(--d)) calc(12px*var(--d)) var(--lo),calc(9px*var(--d)) calc(11px*var(--d)) calc(26px*var(--d)) var(--drop),calc(-6px*var(--d)) calc(-6px*var(--d)) calc(16px*var(--d)) var(--lift);
  --dent:inset calc(5px*var(--d)) calc(5px*var(--d)) calc(10px*var(--d)) var(--lo-strong),inset calc(-5px*var(--d)) calc(-5px*var(--d)) calc(10px*var(--d)) var(--hl-soft)}
.cl[data-mode=light]{--hl:rgb(255 255 255/.95);--hl-soft:rgb(255 255 255/.85);--lo:rgb(96 92 110/.16);--lo-strong:rgb(96 92 110/.3);--drop:hsl(var(--cl-shadow)/.5);--lift:rgb(255 255 255/.9);--well:color-mix(in oklab,var(--cl-background) 92%,#000)}
.cl[data-mode=dark]{--hl:rgb(255 255 255/.075);--hl-soft:rgb(255 255 255/.05);--lo:rgb(0 0 0/.4);--lo-strong:rgb(0 0 0/.55);--drop:rgb(0 0 0/.55);--lift:rgb(255 255 255/.035);--well:color-mix(in oklab,var(--cl-background) 88%,#000);--rim:rgb(255 255 255/.07)}
.cl *,.cl *::before,.cl *::after{box-sizing:border-box}

/* 文字 */
.cl-display{font-family:var(--cl-display),${CJK};font-weight:800;letter-spacing:-.035em;line-height:1.02}
.cl-mono{font-family:var(--cl-mono),ui-monospace,monospace}
.cl-sub{color:var(--cl-mutedForeground)}
.cl-eyebrow{font:800 .72rem/1 var(--cl-body),${CJK};letter-spacing:.1em;text-transform:uppercase;color:var(--cl-accent)}

/* 凸起面（卡片）与凹陷面 */
.cl-card{position:relative;padding:24px;border-radius:var(--r);background:var(--cl-card);border:var(--cl-bw) solid var(--rim);box-shadow:var(--puff)}
.cl-dent{border-radius:var(--r-md);background:var(--well);border:var(--cl-bw) solid transparent;box-shadow:var(--dent)}
.cl-card-title{margin:0;font:800 1.15rem/1.2 var(--cl-display),${CJK};letter-spacing:-.02em}
.cl-card-desc{margin:.3rem 0 0;color:var(--cl-mutedForeground);font-size:.9rem}

/* 黏土球：径向渐变 + 内阴影 */
.cl-ball{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 26%,color-mix(in oklab,var(--c) 55%,#fff) 0,var(--c) 46%,color-mix(in oklab,var(--c) 78%,#000) 100%);
  box-shadow:inset calc(-8px*var(--d)) calc(-10px*var(--d)) calc(18px*var(--d)) rgb(0 0 0/.18),inset calc(6px*var(--d)) calc(6px*var(--d)) calc(12px*var(--d)) rgb(255 255 255/.5),calc(10px*var(--d)) calc(16px*var(--d)) calc(28px*var(--d)) var(--drop)}

/* 按钮：凸起，按下变凹 */
.cl-btn{--h:44px;--c:var(--cl-secondary);--fg:var(--cl-secondaryForeground);position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:var(--h);padding:0 1.35em;border-radius:var(--r-md);
  border:var(--cl-bw) solid var(--rim);background:var(--c);color:var(--fg);font:800 .92rem/1 var(--cl-body),${CJK};white-space:nowrap;cursor:pointer;text-decoration:none;
  box-shadow:inset calc(3px*var(--d)) calc(3px*var(--d)) calc(6px*var(--d)) var(--hl),inset calc(-4px*var(--d)) calc(-4px*var(--d)) calc(8px*var(--d)) var(--lo),calc(5px*var(--d)) calc(7px*var(--d)) calc(14px*var(--d)) var(--drop),calc(-3px*var(--d)) calc(-3px*var(--d)) calc(10px*var(--d)) var(--lift);
  transition:transform .18s cubic-bezier(.3,1.4,.5,1),box-shadow .18s,filter .18s}
.cl-btn[data-size=sm]{--h:36px;font-size:.84rem;padding:0 1.05em}
.cl-btn[data-size=lg]{--h:56px;font-size:1.05rem;padding:0 1.9em;border-radius:var(--r)}
.cl-btn:hover{transform:translateY(-2px);filter:brightness(1.03)}
.cl-btn:active{transform:translateY(1px) scale(.985);box-shadow:inset calc(5px*var(--d)) calc(5px*var(--d)) calc(10px*var(--d)) var(--lo-strong),inset calc(-4px*var(--d)) calc(-4px*var(--d)) calc(8px*var(--d)) var(--hl-soft)}
.cl-btn:focus-visible,.cl-input:focus-visible,.cl-tab:focus-visible,.cl-switch:focus-visible{outline:3px solid color-mix(in oklab,var(--cl-accent) 55%,transparent);outline-offset:3px}
.cl-btn:disabled{opacity:.5;pointer-events:none}
.cl-btn[data-variant=primary]{--c:var(--cl-accent);--fg:var(--cl-accent-fg);border-color:color-mix(in oklab,#fff 30%,transparent);
  box-shadow:inset calc(4px*var(--d)) calc(4px*var(--d)) calc(8px*var(--d)) rgb(255 255 255/.4),inset calc(-5px*var(--d)) calc(-5px*var(--d)) calc(10px*var(--d)) rgb(0 0 0/.22),calc(6px*var(--d)) calc(9px*var(--d)) calc(18px*var(--d)) color-mix(in oklab,var(--cl-accent) 50%,transparent),calc(-3px*var(--d)) calc(-3px*var(--d)) calc(10px*var(--d)) var(--lift)}
.cl-btn[data-variant=primary]:active{box-shadow:inset calc(5px*var(--d)) calc(5px*var(--d)) calc(10px*var(--d)) rgb(0 0 0/.3),inset calc(-4px*var(--d)) calc(-4px*var(--d)) calc(8px*var(--d)) rgb(255 255 255/.25)}
.cl-btn[data-variant=soft]{--c:var(--cl-card);--fg:var(--cl-foreground)}
.cl-btn[data-variant=ghost]{--c:transparent;--fg:var(--cl-mutedForeground);box-shadow:none;border-color:transparent}
.cl-btn[data-variant=ghost]:hover{--fg:var(--cl-foreground);box-shadow:var(--dent)}

/* 输入框：凹陷 */
.cl-field{display:grid;gap:.5rem}.cl-label{font-size:.82rem;font-weight:800;color:var(--cl-secondaryForeground)}
.cl-input{width:100%;height:48px;padding:0 1.1em;border-radius:var(--r-md);border:var(--cl-bw) solid transparent;background:var(--well);color:var(--cl-foreground);font:600 .95rem var(--cl-body),${CJK};box-shadow:var(--dent);transition:box-shadow .2s,border-color .2s}
.cl-input::placeholder{color:var(--cl-mutedForeground);font-weight:500}
.cl-input:focus{outline:none;border-color:color-mix(in oklab,var(--cl-accent) 60%,transparent);box-shadow:var(--dent),0 0 0 4px color-mix(in oklab,var(--cl-accent) 22%,transparent)}

/* 徽标：小小的凸起药丸 */
.cl-badge{--tone:var(--cl-accent);display:inline-flex;align-items:center;gap:.4rem;height:28px;padding:0 .9em;border-radius:999px;font:800 .74rem/1 var(--cl-body),${CJK};color:color-mix(in oklab,var(--tone) 70%,var(--cl-foreground));
  background:color-mix(in oklab,var(--tone) 18%,var(--cl-card));box-shadow:inset 2px 2px 4px var(--hl),inset -2px -2px 4px var(--lo),2px 3px 7px var(--drop)}
.cl-badge[data-tone=neutral]{--tone:var(--cl-mutedForeground)}.cl-badge[data-tone=success]{--tone:#10b981}.cl-badge[data-tone=warning]{--tone:#f59e0b}.cl-badge[data-tone=danger]{--tone:var(--cl-destructive)}.cl-badge[data-tone=pink]{--tone:#ec4899}

/* 选项卡：凹陷轨道 + 凸起滑块 */
.cl-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);padding:6px;border-radius:calc(var(--r-md) + 4px);background:var(--well);box-shadow:var(--dent)}
.cl-tab-thumb{position:absolute;top:6px;bottom:6px;left:6px;width:calc((100% - 12px)/var(--n));border-radius:var(--r-md);transform:translateX(calc(var(--i)*100%));background:var(--cl-card);
  box-shadow:inset 3px 3px 6px var(--hl),inset -3px -3px 6px var(--lo),3px 5px 10px var(--drop);transition:transform .34s cubic-bezier(.3,1.35,.5,1)}
.cl-tab{position:relative;z-index:1;height:38px;border:0;background:transparent;color:var(--cl-mutedForeground);font:800 .88rem var(--cl-body),${CJK};cursor:pointer;border-radius:var(--r-md);transition:color .2s}
.cl-tab[aria-selected=true]{color:var(--cl-accent)}.cl-tab:hover{color:var(--cl-foreground)}

/* 提示条 */
.cl-alert{--tone:var(--cl-accent);display:flex;gap:.9rem;align-items:flex-start;padding:16px 18px;border-radius:var(--r-md);background:var(--cl-card);border:var(--cl-bw) solid var(--rim);box-shadow:var(--puff)}
.cl-alert[data-tone=success]{--tone:#10b981}.cl-alert[data-tone=warning]{--tone:#f59e0b}.cl-alert[data-tone=danger]{--tone:var(--cl-destructive)}
.cl-alert-icon{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:#fff;background:var(--tone);box-shadow:inset 2px 2px 4px rgb(255 255 255/.45),inset -3px -3px 5px rgb(0 0 0/.2),3px 4px 9px color-mix(in oklab,var(--tone) 45%,transparent)}
.cl-alert-title{margin:0;font-weight:800;font-size:.94rem}.cl-alert-body{margin:.15rem 0 0;font-size:.88rem;color:var(--cl-mutedForeground)}

/* 开关：凹陷轨道 + 凸起圆珠 */
.cl-switch{position:relative;flex:none;width:56px;height:32px;padding:0;border-radius:999px;border:0;background:var(--well);cursor:pointer;box-shadow:var(--dent);transition:background-color .25s}
.cl-switch::after{content:'';position:absolute;top:4px;left:4px;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,#e9e6e4 70%);box-shadow:2px 3px 6px var(--drop),inset -2px -2px 4px rgb(0 0 0/.1);transition:transform .3s cubic-bezier(.3,1.5,.5,1)}
.cl[data-mode=dark] .cl-switch::after{background:radial-gradient(circle at 32% 28%,#6a635d,#3d3833 70%)}
.cl-switch[aria-checked=true]{background:color-mix(in oklab,var(--cl-accent) 80%,var(--well))}
.cl-switch[aria-checked=true]::after{transform:translateX(24px)}

@media (prefers-reduced-motion:reduce){.cl-btn,.cl-tab-thumb,.cl-switch::after{transition:none}}
}`

export function StyleClaymorphism({ className, style, children, ...props }: StyleClaymorphismProps) {
  const { accent, radius, borderWidth, puff, fontPairing, dark } = { ...defaults, ...props }
  const palette = dark ? palettes.dark : palettes.light
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.jakarta
  const vars: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(palette)) vars[`--cl-${name}`] = value
  vars['--cl-accent'] = accent
  vars['--cl-accent-fg'] = readableOn(accent, '#1e1b18', '#ffffff')
  vars['--cl-radius'] = `${radius}px`
  vars['--cl-bw'] = `${borderWidth}px`
  vars['--cl-puff'] = puff
  vars['--cl-display'] = fonts.display
  vars['--cl-body'] = fonts.body
  vars['--cl-mono'] = fonts.mono
  return (
    <div className={cn('cl', className)} data-mode={dark ? 'dark' : 'light'} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 凸起的卡片。`dent` 让它反过来变成凹陷面（嵌在卡片里的小面板）。 */
export type CardProps = HTMLAttributes<HTMLDivElement> & { dent?: boolean }
export function Card({ className, dent, ...rest }: CardProps) {
  return <div className={cn(dent ? 'cl-dent' : 'cl-card', className)} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('cl-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('cl-card-desc', className)} {...rest} />

/** 黏土球：纯装饰，颜色由 `color` 决定。 */
export function Ball({ color, size, className, style }: { color: string; size: number; className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cn('cl-ball', className)} style={{ '--c': color, width: size, height: size, ...style } as CSSProperties} />
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'soft', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('cl-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('cl-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="cl-field">
      <label className="cl-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'pink' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('cl-badge', className)} data-tone={tone} {...rest} />
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
      className={cn('cl-tabs', className)}
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
      <span className="cl-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="cl-tab"
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
    <div role="status" className={cn('cl-alert', className)} data-tone={tone} {...rest}>
      <span className="cl-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="cl-alert-title">{title}</p>
        {children ? <p className="cl-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('cl-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
