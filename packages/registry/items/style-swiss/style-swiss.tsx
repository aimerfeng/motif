// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 Modulz
// Copyright (c) 2022-Present WorkOS
// Source: https://github.com/radix-ui/colors/blob/dbdb854/src/light.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#e5484d',
  radius: 0,
  borderWidth: 1,
  showGrid: true,
  fontPairing: 'grotesk',
  dark: false,
}
/* @motif:end */

export type StyleSwissProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Radix Colors 的灰阶（12 级），亮色与暗色各一套。整套风格只用它加一个强调色。 */
export const grays = {
  light: ['#fcfcfc', '#f9f9f9', '#f0f0f0', '#e8e8e8', '#e0e0e0', '#d9d9d9', '#cecece', '#bbbbbb', '#8d8d8d', '#838383', '#646464', '#202020'],
  dark: ['#111111', '#191919', '#222222', '#2a2a2a', '#313131', '#3a3a3a', '#484848', '#606060', '#6e6e6e', '#7b7b7b', '#b4b4b4', '#eeeeee'],
} as const

export const fontPairings = {
  grotesk: { display: "'Space Grotesk Variable'", body: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  neutral: { display: "'Inter Tight Variable'", body: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  geist: { display: "'Geist Variable'", body: "'Geist Variable'", mono: "'Geist Mono Variable'" },
  plex: { display: "'IBM Plex Sans Variable'", body: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#111111' : '#ffffff'
}

/*
 * 瑞士：12 栏网格、灰阶加一个强调色、左对齐的紧凑无衬线大标题、用线分区而不是用色块。
 * 页面里所有内容都放进 .sz-wrap（最大 1200px，两侧边距 24px），栏线 overlay 与它对齐。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.sz{position:relative;isolation:isolate;min-height:100%;color:var(--sz-12);background:var(--sz-1);font-family:var(--sz-body),${CJK};font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;
  --r:var(--sz-radius);--rule:var(--sz-12);--rule-soft:var(--sz-6);--muted:var(--sz-11);--gutter:24px;--margin:24px}
.sz *,.sz *::before,.sz *::after{box-sizing:border-box}
@media (max-width:640px){.sz{--gutter:12px;--margin:16px}}
.sz-wrap{position:relative;z-index:1;width:100%;max-width:calc(1200px + var(--margin)*2);margin:0 auto;padding:0 var(--margin)}
.sz-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gutter)}

/* 栏线 overlay：12 栏，与 .sz-wrap 对齐 */
.sz-cols{position:absolute;inset:0;z-index:0;pointer-events:none}
.sz-cols>div{max-width:calc(1200px + var(--margin)*2);height:100%;margin:0 auto;padding:0 var(--margin);display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gutter)}
.sz-cols i{background:color-mix(in oklab,var(--sz-accent) 3.5%,transparent);border-inline:1px solid color-mix(in oklab,var(--sz-accent) 8%,transparent)}

/* 文字：一个字族、几个尺寸，靠粗细和位置分层 */
.sz-display{font-family:var(--sz-display),${CJK};font-weight:600;letter-spacing:-.045em;line-height:.92}
.sz-h2{font-family:var(--sz-display),${CJK};font-weight:600;letter-spacing:-.035em;line-height:1}
.sz-h3{font-family:var(--sz-display),${CJK};font-weight:600;letter-spacing:-.02em;line-height:1.15;font-size:1.15rem}
.sz-muted{color:var(--muted)}
.sz-mono{font-family:var(--sz-mono),ui-monospace,monospace}
.sz-label{font:500 .69rem/1.2 var(--sz-mono),ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.sz-accent{color:var(--sz-accent)}
.sz-rule{height:0;border:0;border-top:var(--sz-bw) solid var(--rule)}
.sz-rule-thick{height:0;border:0;border-top:calc(var(--sz-bw)*3) solid var(--rule)}
.sz-rule-soft{height:0;border:0;border-top:var(--sz-bw) solid var(--rule-soft)}

/* 面：没有阴影。层次只来自线和灰阶。 */
.sz-card{position:relative;padding:20px;border:var(--sz-bw) solid var(--rule);border-radius:var(--r);background:var(--sz-1)}
.sz-card[data-fill=true]{background:var(--sz-3);border-color:transparent}
.sz-card[data-fill=accent]{background:var(--sz-accent);color:var(--sz-accent-fg);border-color:transparent}
.sz-card[data-fill=ink]{background:var(--sz-12);color:var(--sz-1);border-color:transparent}
.sz-card-title{margin:0;font:600 1.15rem/1.15 var(--sz-display),${CJK};letter-spacing:-.02em}
.sz-card-desc{margin:.4rem 0 0;color:inherit;opacity:.68;font-size:.9rem}

/* 按钮：矩形，黑底白字，悬停变强调色 */
.sz-btn{--h:44px;position:relative;display:inline-flex;align-items:center;justify-content:space-between;gap:1.5rem;height:var(--h);padding:0 1.15em;border-radius:var(--r);border:var(--sz-bw) solid var(--sz-12);background:var(--sz-12);color:var(--sz-1);
  font:500 .9rem/1 var(--sz-body),${CJK};letter-spacing:-.005em;white-space:nowrap;cursor:pointer;text-decoration:none;transition:background-color .16s,color .16s,border-color .16s}
.sz-btn[data-size=sm]{--h:34px;font-size:.8rem;gap:1rem;padding:0 .9em}
.sz-btn[data-size=lg]{--h:56px;font-size:1.02rem;padding:0 1.4em}
.sz-btn:hover{background:var(--sz-accent);border-color:var(--sz-accent);color:var(--sz-accent-fg)}
.sz-btn:active{transform:translateY(1px)}
.sz-btn:focus-visible,.sz-input:focus-visible,.sz-tab:focus-visible,.sz-switch:focus-visible{outline:2px solid var(--sz-accent);outline-offset:3px}
.sz-btn:disabled{opacity:.35;pointer-events:none}
.sz-btn[data-variant=secondary]{background:transparent;color:var(--sz-12)}
.sz-btn[data-variant=secondary]:hover{background:var(--sz-12);border-color:var(--sz-12);color:var(--sz-1)}
.sz-btn[data-variant=primary]{background:var(--sz-accent);border-color:var(--sz-accent);color:var(--sz-accent-fg)}
.sz-btn[data-variant=primary]:hover{background:var(--sz-12);border-color:var(--sz-12);color:var(--sz-1)}
.sz-btn[data-variant=ghost]{background:transparent;border-color:transparent;color:var(--sz-12);padding:0 .6em}
.sz-btn[data-variant=ghost]:hover{background:var(--sz-3);border-color:var(--sz-3);color:var(--sz-12)}
.sz-btn[data-variant=link]{--h:auto;padding:0 0 .25em;border:0;border-bottom:var(--sz-bw) solid var(--sz-12);border-radius:0;background:transparent;color:var(--sz-12);gap:.6rem}
.sz-btn[data-variant=link]:hover{background:transparent;color:var(--sz-accent);border-bottom-color:var(--sz-accent)}

/* 输入框：灰底，只有下边线；聚焦时线变成强调色并加粗 */
.sz-field{display:grid;gap:.5rem}.sz-field .sz-label,.sz-label-block{display:block}
.sz-input{width:100%;height:48px;padding:0 12px;border:0;border-bottom:var(--sz-bw) solid var(--sz-12);border-radius:var(--r) var(--r) 0 0;background:var(--sz-3);color:var(--sz-12);font:400 1rem var(--sz-body),${CJK};transition:background-color .16s,box-shadow .16s}
.sz-input::placeholder{color:var(--sz-9)}
.sz-input:hover{background:var(--sz-4)}
.sz-input:focus{outline:none;background:var(--sz-3);box-shadow:inset 0 calc(var(--sz-bw)*-2) 0 var(--sz-accent);border-bottom-color:var(--sz-accent)}

/* 徽标：矩形小标签，等宽大写 */
.sz-badge{--bg:var(--sz-4);--fg:var(--sz-12);display:inline-flex;align-items:center;height:22px;padding:0 .6em;border-radius:var(--r);background:var(--bg);color:var(--fg);font:500 .66rem/1 var(--sz-mono),ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}
.sz-badge[data-tone=accent],.sz-badge[data-tone=danger]{--bg:var(--sz-accent);--fg:var(--sz-accent-fg)}
.sz-badge[data-tone=success]{--bg:var(--sz-12);--fg:var(--sz-1)}
.sz-badge[data-tone=warning]{--bg:transparent;--fg:var(--sz-accent);box-shadow:inset 0 0 0 var(--sz-bw) var(--sz-accent)}
.sz-badge[data-tone=outline]{--bg:transparent;box-shadow:inset 0 0 0 var(--sz-bw) var(--sz-12)}

/* 选项卡：文字 + 一条粗下划线 */
.sz-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);border-bottom:var(--sz-bw) solid var(--sz-12)}
.sz-tab-thumb{position:absolute;left:0;bottom:calc(var(--sz-bw)*-1);height:calc(var(--sz-bw)*4);width:calc(100%/var(--n));transform:translateX(calc(var(--i)*100%));background:var(--sz-accent);transition:transform .22s cubic-bezier(.6,0,.2,1)}
.sz-tab{height:46px;border:0;background:transparent;color:var(--sz-11);font:500 .9rem var(--sz-body),${CJK};text-align:left;padding:0 2px;cursor:pointer;transition:color .16s}
.sz-tab[aria-selected=true]{color:var(--sz-12)}.sz-tab:hover{color:var(--sz-12)}

/* 提示条：上方一根粗线，图标是一个方块 */
.sz-alert{--tone:var(--sz-12);display:flex;gap:1rem;align-items:flex-start;padding:16px 0 0;border-top:calc(var(--sz-bw)*3) solid var(--tone)}
.sz-alert[data-tone=accent],.sz-alert[data-tone=danger],.sz-alert[data-tone=warning]{--tone:var(--sz-accent)}
.sz-alert-icon{flex:none;display:grid;place-items:center;width:24px;height:24px;background:var(--tone);color:var(--sz-1);border-radius:var(--r)}
.sz-alert[data-tone=accent] .sz-alert-icon,.sz-alert[data-tone=danger] .sz-alert-icon,.sz-alert[data-tone=warning] .sz-alert-icon{color:var(--sz-accent-fg)}
.sz-alert-title{margin:0;font:600 1rem/1.25 var(--sz-display),${CJK};letter-spacing:-.015em}.sz-alert-body{margin:.25rem 0 0;font-size:.9rem;color:var(--muted)}

/* 开关：方形滑块 */
.sz-switch{position:relative;flex:none;width:48px;height:26px;padding:0;border:var(--sz-bw) solid var(--sz-12);border-radius:var(--r);background:transparent;cursor:pointer;transition:background-color .16s}
.sz-switch::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:calc(var(--r)*.6);background:var(--sz-12);transition:transform .2s cubic-bezier(.6,0,.2,1),background-color .16s}
.sz-switch[aria-checked=true]{background:var(--sz-12)}
.sz-switch[aria-checked=true]::after{transform:translateX(22px);background:var(--sz-accent)}

@media (prefers-reduced-motion:reduce){.sz-btn,.sz-tab-thumb,.sz-switch::after{transition:none}}
}`

export function StyleSwiss({ className, style, children, ...props }: StyleSwissProps) {
  const { accent, radius, borderWidth, showGrid, fontPairing, dark } = { ...defaults, ...props }
  const scale = dark ? grays.dark : grays.light
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.grotesk
  const vars: Record<string, string | number> = {}
  scale.forEach((value, i) => {
    vars[`--sz-${i + 1}`] = value
  })
  vars['--sz-accent'] = accent
  vars['--sz-accent-fg'] = readableOn(accent)
  vars['--sz-radius'] = `${radius}px`
  vars['--sz-bw'] = `${borderWidth}px`
  vars['--sz-display'] = fonts.display
  vars['--sz-body'] = fonts.body
  vars['--sz-mono'] = fonts.mono
  return (
    <div className={cn('sz', className)} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {showGrid ? (
        <div className="sz-cols" aria-hidden>
          <div>
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  )
}

/** 内容容器：最大 1200px，与栏线对齐。 */
export function Wrap({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('sz-wrap', className)} {...rest} />
}

/** 12 栏网格，子元素用 Tailwind 的 col-span-*。 */
export function Grid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('sz-grid', className)} {...rest} />
}

/** 卡片：默认是线框；`fill` 换成灰底、黑底或强调色底。 */
export type CardProps = HTMLAttributes<HTMLDivElement> & { fill?: boolean | 'accent' | 'ink' }
export function Card({ className, fill, ...rest }: CardProps) {
  return <div className={cn('sz-card', className)} data-fill={fill} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('sz-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('sz-card-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'link'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('sz-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('sz-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="sz-field">
      <label className="sz-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'outline' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('sz-badge', className)} data-tone={tone} {...rest} />
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
      className={cn('sz-tabs', className)}
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
      <span className="sz-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="sz-tab"
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
    <div role="status" className={cn('sz-alert', className)} data-tone={tone} {...rest}>
      <span className="sz-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="sz-alert-title">{title}</p>
        {children ? <p className="sz-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('sz-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
