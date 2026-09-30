// SPDX-License-Identifier: MIT
// Copyright (c) 2020 Pouya Saadeghi
// Source: https://github.com/saadeghi/daisyui/blob/c51f501/packages/daisyui/src/themes/synthwave.css
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  theme: 'synthwave',
  accent: '#f861b4',
  radius: 14,
  borderWidth: 2,
  glow: 0.7,
  fontPairing: 'space',
}
/* @motif:end */

export type StyleSynthwaveProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * daisyUI 的 synthwave（深色霓虹）与 cyberpunk（黄底黑字、直角）两套配色，取自它们的 oklch 令牌。
 * primary 由 accent 参数覆盖，其余颜色保持原样。
 */
export const themes = {
  synthwave: {
    dark: true,
    base100: 'oklch(15% 0.09 281.288)',
    base200: 'oklch(20% 0.09 281.288)',
    base300: 'oklch(25% 0.09 281.288)',
    content: 'oklch(78% 0.115 274.713)',
    secondary: 'oklch(82% 0.111 230.318)',
    tertiary: 'oklch(75% 0.183 55.934)',
    neutral: 'oklch(45% 0.24 277.023)',
    success: 'oklch(77% 0.152 181.912)',
    warning: 'oklch(90% 0.182 98.111)',
    error: 'oklch(73.7% 0.121 32.639)',
  },
  cyberpunk: {
    dark: false,
    base100: 'oklch(94.51% 0.179 104.32)',
    base200: 'oklch(91.51% 0.179 104.32)',
    base300: 'oklch(85.51% 0.179 104.32)',
    content: 'oklch(0% 0 0)',
    secondary: 'oklch(83.33% 0.184 204.72)',
    tertiary: 'oklch(71.86% 0.217 310.43)',
    neutral: 'oklch(23.04% 0.065 269.31)',
    success: 'oklch(64.8% 0.15 160)',
    warning: 'oklch(84.71% 0.199 83.87)',
    error: 'oklch(71.76% 0.221 22.18)',
  },
} as const
export type Theme = keyof typeof themes

export const fontPairings = {
  space: { display: "'Space Grotesk Variable'", body: "'Space Grotesk Variable'", mono: "'JetBrains Mono Variable'" },
  syne: { display: "'Syne Variable'", body: "'Manrope Variable'", mono: "'JetBrains Mono Variable'" },
  archivo: { display: "'Archivo Black'", body: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  mono: { display: "'JetBrains Mono Variable'", body: "'JetBrains Mono Variable'", mono: "'JetBrains Mono Variable'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.3 ? '#0a0324' : '#ffffff'
}

/*
 * 合成波：深靛蓝底 + 霓虹描边与辉光 + 大写的显示字体。cyberpunk 主题去掉辉光，改成黑色硬阴影。
 * 辉光强度（--sw-glow）是唯一的「阴影」参数，同时缩放卡片、按钮、文字的光晕。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.sw{position:relative;isolation:isolate;min-height:100%;color:var(--sw-content);background:var(--sw-base100);font-family:var(--sw-body),${CJK};font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;
  --r:var(--sw-radius);--r-sm:calc(var(--sw-radius)*.6);--g:var(--sw-glow);--bw:var(--sw-bw);
  --line:color-mix(in oklab,var(--sw-primary) 42%,transparent);--dim:color-mix(in oklab,var(--sw-content) 74%,transparent)}
.sw *,.sw *::before,.sw *::after{box-sizing:border-box}
.sw[data-theme=synthwave]{background:linear-gradient(180deg,var(--sw-base100),color-mix(in oklab,var(--sw-base100) 82%,var(--sw-primary)) 140%)}
.sw[data-theme=cyberpunk]{--line:var(--sw-neutral);--dim:color-mix(in oklab,var(--sw-content) 68%,var(--sw-base100))}

/* 文字 */
.sw-display{font-family:var(--sw-display),${CJK};font-weight:700;letter-spacing:-.02em;line-height:.98;text-transform:uppercase}
.sw-mono{font-family:var(--sw-mono),ui-monospace,monospace}
.sw-dim{color:var(--dim)}
.sw-eyebrow{font:600 .72rem/1 var(--sw-mono),ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--sw-secondary)}
.sw[data-theme=cyberpunk] .sw-eyebrow{color:var(--sw-neutral)}
.sw-neon{color:#fff;text-shadow:0 0 calc(6px*var(--g)) color-mix(in oklab,var(--sw-primary) 90%,transparent),0 0 calc(26px*var(--g)) color-mix(in oklab,var(--sw-primary) 80%,transparent),0 0 calc(64px*var(--g)) color-mix(in oklab,var(--sw-primary) 60%,transparent)}
.sw[data-theme=cyberpunk] .sw-neon{color:var(--sw-content);text-shadow:3px 3px 0 var(--sw-primary)}
.sw-chrome{background:linear-gradient(180deg,#fff 18%,color-mix(in oklab,var(--sw-secondary) 65%,#fff) 46%,var(--sw-primary) 54%,color-mix(in oklab,var(--sw-primary) 70%,var(--sw-tertiary)) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 calc(16px*var(--g)) color-mix(in oklab,var(--sw-primary) 70%,transparent))}
.sw[data-theme=cyberpunk] .sw-chrome{background:none;color:var(--sw-content);filter:none;text-shadow:4px 4px 0 var(--sw-primary)}

/* 地平线场景：夕阳 + 透视网格 */
.sw-horizon{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.sw-sun{position:absolute;left:var(--sun-x,50%);bottom:var(--horizon,22%);width:min(480px,64vw);aspect-ratio:1;transform:translateX(-50%);border-radius:50%;
  background:linear-gradient(180deg,#ffe75a 0%,var(--sw-tertiary) 34%,var(--sw-primary) 66%,color-mix(in oklab,var(--sw-primary) 55%,var(--sw-secondary)) 100%);
  -webkit-mask:linear-gradient(#000,#000) top/100% 50% no-repeat,linear-gradient(to bottom,#000 0 6%,transparent 6% 9%,#000 9% 22%,transparent 22% 27%,#000 27% 42%,transparent 42% 49%,#000 49% 64%,transparent 64% 73%,#000 73% 88%,transparent 88% 100%) bottom/100% 50% no-repeat;
  mask:linear-gradient(#000,#000) top/100% 50% no-repeat,linear-gradient(to bottom,#000 0 6%,transparent 6% 9%,#000 9% 22%,transparent 22% 27%,#000 27% 42%,transparent 42% 49%,#000 49% 64%,transparent 64% 73%,#000 73% 88%,transparent 88% 100%) bottom/100% 50% no-repeat;
  filter:drop-shadow(0 0 calc(60px*var(--g)) color-mix(in oklab,var(--sw-primary) 70%,transparent));opacity:.95}
.sw-ground{position:absolute;left:0;right:0;bottom:0;height:var(--horizon,22%);background:linear-gradient(180deg,color-mix(in oklab,var(--sw-base100) 88%,var(--sw-primary)),var(--sw-base100))}
.sw-floor{position:absolute;left:-60%;right:-60%;bottom:0;height:var(--horizon,22%);background-image:linear-gradient(color-mix(in oklab,var(--sw-primary) 85%,transparent) 2px,transparent 2px),linear-gradient(90deg,color-mix(in oklab,var(--sw-primary) 85%,transparent) 2px,transparent 2px);background-size:72px 72px;
  transform:perspective(380px) rotateX(58deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 35%);mask-image:linear-gradient(to bottom,transparent,#000 35%);
  filter:drop-shadow(0 0 calc(8px*var(--g)) var(--sw-primary))}
.sw-horizon::after{content:'';position:absolute;left:0;right:0;bottom:var(--horizon,22%);height:2px;background:linear-gradient(90deg,transparent,var(--sw-primary),var(--sw-secondary),var(--sw-primary),transparent);box-shadow:0 0 calc(24px*var(--g)) var(--sw-primary)}
.sw-horizon::before{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--horizon,22%);z-index:1;background:linear-gradient(180deg,color-mix(in oklab,var(--sw-base100) 60%,var(--sw-primary)),transparent 60%);opacity:.4}
@media (prefers-reduced-motion:no-preference){.sw-floor{animation:sw-scroll 2.4s linear infinite}}
@keyframes sw-scroll{to{background-position:0 72px,0 0}}
.sw[data-theme=cyberpunk] .sw-horizon{display:none}

/* 卡片：霓虹描边 + 光晕 + 四角括号 */
.sw-card{position:relative;padding:24px;border-radius:var(--r);border:var(--bw) solid var(--line);background:linear-gradient(180deg,color-mix(in oklab,var(--sw-base200) 92%,var(--sw-primary)),var(--sw-base200));
  box-shadow:0 0 calc(40px*var(--g)) color-mix(in oklab,var(--sw-primary) 18%,transparent),inset 0 0 calc(30px*var(--g)) color-mix(in oklab,var(--sw-primary) 8%,transparent)}
.sw-card::before,.sw-card::after{content:'';position:absolute;width:14px;height:14px;pointer-events:none;border:calc(var(--bw) + .5px) solid var(--sw-secondary)}
.sw-card::before{top:-1px;left:-1px;border-right:0;border-bottom:0;border-top-left-radius:var(--r);filter:drop-shadow(0 0 calc(5px*var(--g)) var(--sw-secondary))}
.sw-card::after{right:-1px;bottom:-1px;border-left:0;border-top:0;border-bottom-right-radius:var(--r);filter:drop-shadow(0 0 calc(5px*var(--g)) var(--sw-secondary))}
.sw[data-theme=cyberpunk] .sw-card{background:var(--sw-base100);border-color:var(--sw-neutral);box-shadow:6px 6px 0 var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-card::before,.sw[data-theme=cyberpunk] .sw-card::after{border-color:var(--sw-primary);filter:none}
.sw-card-title{margin:0;font:700 1.05rem/1.2 var(--sw-display),${CJK};letter-spacing:.02em;text-transform:uppercase}
.sw-card-desc{margin:.35rem 0 0;color:var(--dim);font-size:.9rem}

/* 按钮 */
.sw-btn{--h:42px;--c:var(--sw-secondary);position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:var(--h);padding:0 1.3em;border-radius:var(--r-sm);border:var(--bw) solid var(--c);background:transparent;color:var(--c);
  font:700 .82rem/1 var(--sw-display),${CJK};letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;text-decoration:none;
  box-shadow:0 0 calc(14px*var(--g)) color-mix(in oklab,var(--c) 40%,transparent),inset 0 0 calc(10px*var(--g)) color-mix(in oklab,var(--c) 22%,transparent);
  transition:transform .16s cubic-bezier(.2,.8,.2,1),background-color .18s,box-shadow .18s,color .18s}
.sw-btn[data-size=sm]{--h:34px;font-size:.72rem;padding:0 1em}
.sw-btn[data-size=lg]{--h:54px;font-size:.92rem;padding:0 1.9em}
.sw-btn:hover{background:color-mix(in oklab,var(--c) 16%,transparent);box-shadow:0 0 calc(28px*var(--g)) color-mix(in oklab,var(--c) 65%,transparent),inset 0 0 calc(14px*var(--g)) color-mix(in oklab,var(--c) 30%,transparent)}
.sw-btn:active{transform:translateY(1px) scale(.98)}
.sw-btn:focus-visible,.sw-input:focus-visible,.sw-tab:focus-visible,.sw-switch:focus-visible{outline:2px solid var(--sw-tertiary);outline-offset:3px}
.sw-btn:disabled{opacity:.4;pointer-events:none}
.sw-btn[data-variant=primary]{--c:var(--sw-primary);background:var(--sw-primary);color:var(--sw-primary-fg);box-shadow:0 0 calc(30px*var(--g)) color-mix(in oklab,var(--sw-primary) 70%,transparent),inset 0 1px 0 rgb(255 255 255/.35)}
.sw-btn[data-variant=primary]:hover{background:color-mix(in oklab,var(--sw-primary) 88%,#fff);box-shadow:0 0 calc(44px*var(--g)) color-mix(in oklab,var(--sw-primary) 85%,transparent),inset 0 1px 0 rgb(255 255 255/.4)}
.sw-btn[data-variant=ghost]{--c:var(--sw-content);border-color:transparent;box-shadow:none}
.sw-btn[data-variant=ghost]:hover{box-shadow:none;background:color-mix(in oklab,var(--sw-content) 10%,transparent)}
.sw[data-theme=cyberpunk] .sw-btn{--c:var(--sw-neutral);border-color:var(--sw-neutral);background:var(--sw-base100);box-shadow:4px 4px 0 var(--sw-neutral);color:var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--sw-neutral);background:var(--sw-secondary)}
.sw[data-theme=cyberpunk] .sw-btn:active{transform:translate(4px,4px);box-shadow:0 0 0 var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-btn[data-variant=primary]{background:var(--sw-primary);color:var(--sw-primary-fg);--c:var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-btn[data-variant=primary]:hover{background:color-mix(in oklab,var(--sw-primary) 85%,#fff)}
.sw[data-theme=cyberpunk] .sw-btn[data-variant=ghost]{box-shadow:none;background:transparent;border-color:transparent}
.sw[data-theme=cyberpunk] .sw-btn[data-variant=ghost]:hover{transform:none;background:color-mix(in oklab,var(--sw-neutral) 12%,transparent);box-shadow:none}

/* 输入框 */
.sw-field{display:grid;gap:.5rem}.sw-label{font:600 .72rem/1 var(--sw-mono),ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--sw-secondary)}
.sw[data-theme=cyberpunk] .sw-label{color:var(--sw-neutral)}
.sw-input{width:100%;height:46px;padding:0 1em;border-radius:var(--r-sm);border:var(--bw) solid color-mix(in oklab,var(--sw-secondary) 45%,transparent);background:color-mix(in oklab,var(--sw-base100) 85%,#000);color:var(--sw-content);font:500 .95rem var(--sw-mono),ui-monospace,monospace;transition:border-color .18s,box-shadow .18s}
.sw-input::placeholder{color:color-mix(in oklab,var(--sw-content) 45%,transparent)}
.sw-input:hover{border-color:color-mix(in oklab,var(--sw-secondary) 75%,transparent)}
.sw-input:focus{outline:none;border-color:var(--sw-secondary);box-shadow:0 0 calc(20px*var(--g)) color-mix(in oklab,var(--sw-secondary) 55%,transparent),inset 0 0 calc(12px*var(--g)) color-mix(in oklab,var(--sw-secondary) 15%,transparent)}
.sw[data-theme=cyberpunk] .sw-input{background:#fff;border-color:var(--sw-neutral);border-width:2px;box-shadow:3px 3px 0 var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-input:focus{box-shadow:3px 3px 0 var(--sw-primary);border-color:var(--sw-neutral)}

/* 徽标 */
.sw-badge{--tone:var(--sw-primary);display:inline-flex;align-items:center;gap:.4rem;height:24px;padding:0 .75em;border-radius:calc(var(--r-sm)*.6);font:600 .68rem/1 var(--sw-mono),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--tone);border:1px solid color-mix(in oklab,var(--tone) 70%,transparent);background:color-mix(in oklab,var(--tone) 12%,transparent);box-shadow:0 0 calc(10px*var(--g)) color-mix(in oklab,var(--tone) 35%,transparent)}
.sw-badge[data-tone=neutral]{--tone:var(--sw-content)}.sw-badge[data-tone=cyan]{--tone:var(--sw-secondary)}.sw-badge[data-tone=success]{--tone:var(--sw-success)}.sw-badge[data-tone=warning]{--tone:var(--sw-warning)}.sw-badge[data-tone=danger]{--tone:var(--sw-error)}
.sw[data-theme=cyberpunk] .sw-badge{color:var(--sw-content);background:var(--tone);border:2px solid var(--sw-neutral);box-shadow:none}
.sw[data-theme=cyberpunk] .sw-badge[data-tone=neutral]{background:var(--sw-base300)}

/* 选项卡：底部霓虹条 */
.sw-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);border-bottom:var(--bw) solid color-mix(in oklab,var(--sw-content) 22%,transparent)}
.sw-tab-thumb{position:absolute;left:0;bottom:calc(var(--bw)*-1);height:calc(var(--bw) + 1px);width:calc(100%/var(--n));transform:translateX(calc(var(--i)*100%));background:var(--sw-primary);box-shadow:0 0 calc(16px*var(--g)) var(--sw-primary),0 0 calc(4px*var(--g)) var(--sw-primary);transition:transform .32s cubic-bezier(.3,1.2,.4,1)}
.sw-tab{height:44px;border:0;background:transparent;color:var(--dim);font:700 .76rem var(--sw-display),${CJK};letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:color .2s,text-shadow .2s}
.sw-tab[aria-selected=true]{color:var(--sw-primary);text-shadow:0 0 calc(12px*var(--g)) color-mix(in oklab,var(--sw-primary) 80%,transparent)}.sw-tab:hover{color:var(--sw-content)}
.sw[data-theme=cyberpunk] .sw-tab-thumb{box-shadow:none;height:4px;background:var(--sw-neutral)}.sw[data-theme=cyberpunk] .sw-tab[aria-selected=true]{color:var(--sw-content);text-shadow:none}

/* 提示条 */
.sw-alert{--tone:var(--sw-secondary);position:relative;display:flex;gap:.9rem;align-items:flex-start;padding:16px 18px;border-radius:var(--r-sm);border:1px solid color-mix(in oklab,var(--tone) 55%,transparent);border-left:calc(var(--bw) + 2px) solid var(--tone);background:color-mix(in oklab,var(--tone) 9%,var(--sw-base200));box-shadow:0 0 calc(26px*var(--g)) color-mix(in oklab,var(--tone) 18%,transparent)}
.sw-alert[data-tone=success]{--tone:var(--sw-success)}.sw-alert[data-tone=warning]{--tone:var(--sw-warning)}.sw-alert[data-tone=danger]{--tone:var(--sw-error)}
.sw-alert-icon{flex:none;display:grid;place-items:center;width:28px;height:28px;color:var(--tone);border:1.5px solid var(--tone);border-radius:50%;filter:drop-shadow(0 0 calc(6px*var(--g)) var(--tone))}
.sw-alert-title{margin:0;font:700 .85rem var(--sw-display),${CJK};letter-spacing:.08em;text-transform:uppercase}.sw-alert-body{margin:.25rem 0 0;font-size:.88rem;color:var(--dim)}
.sw[data-theme=cyberpunk] .sw-alert{background:var(--tone);color:var(--sw-content);border:2px solid var(--sw-neutral);box-shadow:4px 4px 0 var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-alert-body{color:var(--sw-content)}.sw[data-theme=cyberpunk] .sw-alert-icon{color:var(--sw-content);border-color:var(--sw-content);filter:none}

/* 开关 */
.sw-switch{position:relative;flex:none;width:52px;height:28px;padding:0;border-radius:999px;border:var(--bw) solid color-mix(in oklab,var(--sw-content) 45%,transparent);background:transparent;cursor:pointer;transition:border-color .2s,background-color .2s,box-shadow .2s}
.sw-switch::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:color-mix(in oklab,var(--sw-content) 70%,transparent);transition:transform .28s cubic-bezier(.3,1.3,.5,1),background-color .2s,box-shadow .2s}
.sw-switch[aria-checked=true]{border-color:var(--sw-primary);background:color-mix(in oklab,var(--sw-primary) 20%,transparent);box-shadow:0 0 calc(16px*var(--g)) color-mix(in oklab,var(--sw-primary) 55%,transparent)}
.sw-switch[aria-checked=true]::after{transform:translateX(24px);background:var(--sw-primary);box-shadow:0 0 calc(10px*var(--g)) var(--sw-primary)}
.sw[data-theme=cyberpunk] .sw-switch{border-color:var(--sw-neutral);background:#fff}.sw[data-theme=cyberpunk] .sw-switch::after{background:var(--sw-neutral)}
.sw[data-theme=cyberpunk] .sw-switch[aria-checked=true]{background:var(--sw-secondary);box-shadow:none}.sw[data-theme=cyberpunk] .sw-switch[aria-checked=true]::after{background:var(--sw-neutral);box-shadow:none}

@media (prefers-reduced-motion:reduce){.sw-btn,.sw-tab-thumb,.sw-switch::after{transition:none}}
}`

export function StyleSynthwave({ className, style, children, ...props }: StyleSynthwaveProps) {
  const { theme, accent, radius, borderWidth, glow, fontPairing } = { ...defaults, ...props }
  const t = themes[theme as Theme] ?? themes.synthwave
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.space
  const vars = {
    '--sw-base100': t.base100,
    '--sw-base200': t.base200,
    '--sw-base300': t.base300,
    '--sw-content': t.content,
    '--sw-secondary': t.secondary,
    '--sw-tertiary': t.tertiary,
    '--sw-neutral': t.neutral,
    '--sw-success': t.success,
    '--sw-warning': t.warning,
    '--sw-error': t.error,
    '--sw-primary': accent,
    '--sw-primary-fg': readableOn(accent),
    '--sw-radius': theme === 'cyberpunk' ? `${Math.min(radius, 4)}px` : `${radius}px`,
    '--sw-bw': `${borderWidth}px`,
    '--sw-glow': glow,
    '--sw-display': fonts.display,
    '--sw-body': fonts.body,
    '--sw-mono': fonts.mono,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('sw', className)} data-theme={theme} style={vars}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 夕阳与透视网格。放在一个 `relative overflow-hidden` 的容器里，内容用 `relative z-10` 盖在上面。 */
export function Horizon({ horizon = 24, sunX = 50, className }: { horizon?: number; sunX?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('sw-horizon', className)} style={{ '--horizon': `${horizon}%`, '--sun-x': `${sunX}%` } as CSSProperties}>
      <div className="sw-sun" />
      <div className="sw-ground" />
      <div className="sw-floor" />
    </div>
  )
}

export type CardProps = HTMLAttributes<HTMLDivElement>
export function Card({ className, ...rest }: CardProps) {
  return <div className={cn('sw-card', className)} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('sw-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('sw-card-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('sw-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('sw-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="sw-field">
      <label className="sw-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'cyan' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('sw-badge', className)} data-tone={tone} {...rest} />
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
      className={cn('sw-tabs', className)}
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
      <span className="sw-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="sw-tab"
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
    <div role="status" className={cn('sw-alert', className)} data-tone={tone} {...rest}>
      <span className="sw-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="sw-alert-title">{title}</p>
        {children ? <p className="sw-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('sw-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
