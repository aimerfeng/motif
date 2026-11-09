// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 Modulz
// Copyright (c) 2022-Present WorkOS
// Source: https://github.com/radix-ui/colors/blob/dbdb854/src/dark.ts
// Source: https://github.com/radix-ui/colors/blob/dbdb854/src/whiteA.ts (and src/blackA.ts)
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3e63dd',
  grayFamily: 'slate',
  elevationContrast: 0.5,
  highlight: 2,
  glow: 0.6,
  radius: 8,
  density: 'regular',
  font: 'geist',
}
/* @motif:end */

export type StyleDarkProProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * Radix Colors 的六套暗色灰阶（实色 12 级 + 透明 12 级），原样取自 src/dark.ts。
 * 实色铺面，透明色做线和悬停：同一个透明值叠在任何一层上都成立。
 */
export const grayScales = {
  gray: {
    solid: ['#111111', '#191919', '#222222', '#2a2a2a', '#313131', '#3a3a3a', '#484848', '#606060', '#6e6e6e', '#7b7b7b', '#b4b4b4', '#eeeeee'],
    alpha: ['#00000000', '#ffffff09', '#ffffff12', '#ffffff1b', '#ffffff22', '#ffffff2c', '#ffffff3b', '#ffffff55', '#ffffff64', '#ffffff72', '#ffffffaf', '#ffffffed'],
  },
  mauve: {
    solid: ['#121113', '#1a191b', '#232225', '#2b292d', '#323035', '#3c393f', '#49474e', '#625f69', '#6f6d78', '#7c7a85', '#b5b2bc', '#eeeef0'],
    alpha: ['#00000000', '#f5f4f609', '#ebeaf814', '#eee5f81d', '#efe6fe25', '#f1e6fd30', '#eee9ff40', '#eee7ff5d', '#eae6fd6e', '#ece9fd7c', '#f5f1ffb7', '#fdfdffef'],
  },
  slate: {
    solid: ['#111113', '#18191b', '#212225', '#272a2d', '#2e3135', '#363a3f', '#43484e', '#5a6169', '#696e77', '#777b84', '#b0b4ba', '#edeef0'],
    alpha: ['#00000000', '#d8f4f609', '#ddeaf814', '#d3edf81d', '#d9edfe25', '#d6ebfd30', '#d9edff40', '#d9edff5d', '#dfebfd6d', '#e5edfd7b', '#f1f7feb5', '#fcfdffef'],
  },
  sage: {
    solid: ['#101211', '#171918', '#202221', '#272a29', '#2e3130', '#373b39', '#444947', '#5b625f', '#63706b', '#717d79', '#adb5b2', '#eceeed'],
    alpha: ['#00000000', '#f0f2f108', '#f3f5f412', '#f2fefd1a', '#f1fbfa22', '#edfbf42d', '#edfcf73c', '#ebfdf657', '#dffdf266', '#e5fdf674', '#f4fefbb0', '#fdfffeed'],
  },
  olive: {
    solid: ['#111210', '#181917', '#212220', '#282a27', '#2f312e', '#383a36', '#454843', '#5c625b', '#687066', '#767d74', '#afb5ad', '#eceeec'],
    alpha: ['#00000000', '#f1f2f008', '#f4f5f312', '#f3fef21a', '#f2fbf122', '#f4faed2c', '#f2fced3b', '#edfdeb57', '#ebfde766', '#f0fdec74', '#f6fef4b0', '#fdfffded'],
  },
  sand: {
    solid: ['#111110', '#191918', '#222221', '#2a2a28', '#31312e', '#3b3a37', '#494844', '#62605b', '#6f6d66', '#7c7b74', '#b5b3ad', '#eeeeec'],
    alpha: ['#00000000', '#f4f4f309', '#f6f6f513', '#fefef31b', '#fbfbeb23', '#fffaed2d', '#fffbed3c', '#fff9eb57', '#fffae965', '#fffdee73', '#fffcf4b0', '#fffffded'],
  },
} as const

export type GrayFamily = keyof typeof grayScales

/** src/whiteA.ts 与 src/blackA.ts：白色做内顶高光，黑色做投影。 */
export const whiteA = ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)'] as const
export const blackA = ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.95)'] as const

/** 状态色：Radix 暗色 green / amber / red 的第 9 级（实色）与第 11 级（文字）。 */
export const statusColors = {
  success: { solid: '#30a46c', text: '#3dd68c' },
  warning: { solid: '#ffc53d', text: '#ffca16' },
  danger: { solid: '#e5484d', text: '#ff9592' },
} as const

export const fontPairings = {
  geist: { sans: "'Geist Variable'", mono: "'Geist Mono Variable'" },
  inter: { sans: "'Inter Tight Variable'", mono: "'JetBrains Mono Variable'" },
  plex: { sans: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'" },
  manrope: { sans: "'Manrope Variable'", mono: "'JetBrains Mono Variable'" },
} as const

/** 密度：控件高度、列表行高和基础字号。默认 13px 文字配 32px 控件。 */
export const densities = {
  compact: { control: 28, row: 30, font: 13 },
  regular: { control: 32, row: 36, font: 13 },
  comfortable: { control: 36, row: 40, font: 14 },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function rgbOf(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = parseInt(h.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hexOf(rgb: number[]): string {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
}

function mix(a: string, b: string, t: number): string {
  const x = rgbOf(a)
  const y = rgbOf(b)
  return hexOf(x.map((v, i) => v + (y[i]! - v) * t))
}

function luminance(hex: string): number {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgbOf(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** 强调色实底上的文字：白或近黑，取对比度更高的一个。 */
function inkOn(hex: string): string {
  return contrast(hex, '#ffffff') >= contrast(hex, '#111111') ? '#ffffff' : '#111111'
}

/** 暗面上的强调色文字：任何强调色都向白色提亮，直到在最亮的一层上也达到 4.5:1。 */
function readableAccent(accent: string, surface: string): string {
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(accent, '#ffffff', t)
    if (contrast(candidate, surface) >= 4.5) return candidate
  }
  return '#ffffff'
}

/*
 * 专业暗色：Radix 暗色灰阶分出四层面（页面、面板、凸起、浮层），每层顶边一条 1px 的 whiteA 高光，
 * 关键面板背后一团强调色的径向光晕，13px 的紧凑控件，键帽和命令面板。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.dp{position:relative;isolation:isolate;overflow-x:clip;min-height:100%;color:var(--dp-12);background:var(--dp-s0);color-scheme:dark;font-family:var(--dp-sans),${CJK};font-size:var(--dp-fs);line-height:1.5;-webkit-font-smoothing:antialiased;
  --r:var(--dp-radius);--line:var(--dp-a5);--line-strong:var(--dp-a6);--hl:inset 0 1px 0 0 var(--dp-hl)}
.dp *,.dp *::before,.dp *::after{box-sizing:border-box}
.dp ::selection{background:color-mix(in oklab,var(--dp-accent) 45%,transparent)}
.dp-wrap{width:100%;max-width:1240px;margin:0 auto;padding:0 24px}
@media (max-width:640px){.dp-wrap{padding:0 16px}}
.dp-muted{color:var(--dp-11)}
.dp-mono{font-family:var(--dp-mono),ui-monospace,monospace}
.dp-accent-text{color:var(--dp-accent-text)}
.dp-label{font:500 11px/1.3 var(--dp-mono),ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--dp-11)}
.dp-title{font-weight:600;letter-spacing:-.025em;line-height:1.1;color:var(--dp-12)}

/* 面：四层灰阶，顶边高光，浮层加 blackA 投影 */
.dp-panel{position:relative;background:var(--dp-s1);border:1px solid var(--line);border-radius:calc(var(--r)*1.5);box-shadow:var(--hl)}
.dp-panel[data-elevation=raised]{background:var(--dp-s2);box-shadow:var(--hl),var(--dp-shadow-1)}
.dp-panel[data-elevation=overlay]{background:var(--dp-s3);border-color:var(--line-strong);box-shadow:var(--hl),var(--dp-shadow-2)}
.dp-panel[data-glow=true]::before{content:'';position:absolute;left:18%;right:18%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,var(--dp-accent-text),transparent);opacity:calc(var(--dp-glow)*.85);pointer-events:none}
.dp-glow{position:absolute;z-index:-1;left:-28%;right:-28%;top:-58%;height:165%;background:radial-gradient(closest-side,var(--dp-glow-c),var(--dp-glow-c2) 55%,transparent);pointer-events:none}

/* 按钮：13px、紧凑；次级按钮是凸起的灰面，主按钮是强调色实底 */
.dp-btn{--h:var(--dp-h);position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--h);padding:0 calc(var(--h)*.36);border-radius:var(--r);border:1px solid var(--line-strong);background:var(--dp-s2);color:var(--dp-12);box-shadow:var(--hl),var(--dp-shadow-1);
  font:500 var(--dp-fs)/1 var(--dp-sans),${CJK};white-space:nowrap;cursor:pointer;text-decoration:none;transition:background-color .14s,border-color .14s,color .14s}
.dp-btn:hover{background:var(--dp-s2h)}
.dp-btn:active{transform:translateY(.5px)}
.dp-btn svg{flex:none;width:15px;height:15px}
.dp-btn[data-size=sm]{--h:calc(var(--dp-h) - 6px);font-size:12px;padding:0 9px}
.dp-btn[data-size=icon]{width:var(--h);padding:0}
.dp-btn[data-variant=primary]{background:var(--dp-accent);border-color:color-mix(in oklab,var(--dp-accent) 70%,#fff);color:var(--dp-accent-fg);box-shadow:inset 0 1px 0 0 ${whiteA[3]},0 1px 2px ${blackA[5]},0 0 0 1px ${blackA[3]}}
.dp-btn[data-variant=primary]:hover{background:var(--dp-accent-hover)}
.dp-btn[data-variant=ghost]{background:transparent;border-color:transparent;box-shadow:none;color:var(--dp-11)}
.dp-btn[data-variant=ghost]:hover{background:var(--dp-a3);color:var(--dp-12)}
.dp-btn[data-variant=danger]{background:color-mix(in oklab,${statusColors.danger.solid} 14%,transparent);border-color:color-mix(in oklab,${statusColors.danger.solid} 34%,transparent);color:${statusColors.danger.text};box-shadow:none}
.dp-btn[data-variant=danger]:hover{background:color-mix(in oklab,${statusColors.danger.solid} 22%,transparent)}
.dp-btn:disabled{opacity:.45;pointer-events:none}
.dp-btn:focus-visible,.dp-switch:focus-visible,.dp-seg-tab:focus-visible,.dp-nav-item:focus-visible{outline:2px solid var(--dp-accent-text);outline-offset:2px}

/* 键帽 */
.dp-kbd{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:calc(var(--r)*.6);border:1px solid var(--dp-a5);border-bottom-color:var(--dp-a6);background:var(--dp-a3);color:var(--dp-11);box-shadow:var(--hl);font:500 11px/1 var(--dp-mono),ui-monospace,monospace;text-transform:none}
.dp-btn[data-variant=primary] .dp-kbd{background:color-mix(in oklab,currentColor 16%,transparent);border-color:color-mix(in oklab,currentColor 22%,transparent);color:inherit;box-shadow:none}

/* 输入框：比面板更深的凹槽，聚焦时强调色描边和光环 */
.dp-stack{display:grid;gap:6px}
.dp-field-label{font-size:12px;font-weight:500;color:var(--dp-11)}
.dp-field{display:flex;align-items:center;gap:8px;height:var(--dp-h);padding:0 10px;border-radius:var(--r);border:1px solid var(--line-strong);background:var(--dp-s0);box-shadow:inset 0 1px 2px ${blackA[3]};transition:border-color .14s,box-shadow .14s}
.dp-field:hover{border-color:var(--dp-a7)}
.dp-field:focus-within{border-color:var(--dp-accent-line);box-shadow:inset 0 1px 2px ${blackA[3]},0 0 0 3px var(--dp-accent-ring)}
.dp-field-icon{display:grid;place-items:center;flex:none;color:var(--dp-10)}
.dp-field-icon svg{width:15px;height:15px}
.dp-input{flex:1;min-width:0;height:100%;border:0;padding:0;background:transparent;color:var(--dp-12);font:400 var(--dp-fs)/1 var(--dp-sans),${CJK};outline:none}
.dp-input::placeholder{color:var(--dp-10)}

/* 徽标：浅色底 + 同色描边 + 第 11 级文字 */
.dp-badge{--tone:var(--dp-11);--tone-bg:var(--dp-a3);--tone-line:var(--dp-a5);display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:calc(var(--r)*.75);background:var(--tone-bg);box-shadow:inset 0 0 0 1px var(--tone-line);color:var(--tone);font:500 11.5px/1 var(--dp-sans),${CJK};white-space:nowrap}
.dp-badge[data-tone=accent]{--tone:var(--dp-accent-text);--tone-bg:color-mix(in oklab,var(--dp-accent) 16%,transparent);--tone-line:color-mix(in oklab,var(--dp-accent) 34%,transparent)}
.dp-badge[data-tone=success]{--tone:${statusColors.success.text};--tone-bg:color-mix(in oklab,${statusColors.success.solid} 15%,transparent);--tone-line:color-mix(in oklab,${statusColors.success.solid} 32%,transparent)}
.dp-badge[data-tone=warning]{--tone:${statusColors.warning.text};--tone-bg:color-mix(in oklab,${statusColors.warning.solid} 12%,transparent);--tone-line:color-mix(in oklab,${statusColors.warning.solid} 28%,transparent)}
.dp-badge[data-tone=danger]{--tone:${statusColors.danger.text};--tone-bg:color-mix(in oklab,${statusColors.danger.solid} 15%,transparent);--tone-line:color-mix(in oklab,${statusColors.danger.solid} 34%,transparent)}
.dp-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}

/* 开关 */
.dp-switch{position:relative;flex:none;width:32px;height:18px;padding:0;border:0;border-radius:999px;background:var(--dp-a5);box-shadow:inset 0 0 0 1px var(--dp-a4);cursor:pointer;transition:background-color .16s}
.dp-switch::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dp-12);box-shadow:0 1px 2px ${blackA[5]};transition:transform .18s cubic-bezier(.3,.7,.4,1),background-color .16s}
.dp-switch[aria-checked=true]{background:var(--dp-accent)}
.dp-switch[aria-checked=true]::after{transform:translateX(14px);background:var(--dp-accent-fg)}

/* 分段选项卡：凹槽里一块凸起的滑块 */
.dp-seg{position:relative;isolation:isolate;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:2px;border-radius:calc(var(--r) + 2px);background:var(--dp-s0);box-shadow:inset 0 0 0 1px var(--line)}
.dp-seg-thumb{position:absolute;z-index:-1;top:2px;bottom:2px;left:2px;width:calc((100% - 4px)/var(--n));transform:translateX(calc(var(--i)*100%));border-radius:var(--r);background:var(--dp-s2);box-shadow:var(--hl),0 0 0 1px var(--line-strong),0 1px 2px ${blackA[5]};transition:transform .2s cubic-bezier(.3,.7,.4,1)}
.dp-seg-tab{height:calc(var(--dp-h) - 4px);padding:0 12px;border:0;border-radius:var(--r);background:transparent;color:var(--dp-11);font:500 var(--dp-fs)/1 var(--dp-sans),${CJK};white-space:nowrap;cursor:pointer;transition:color .14s}
.dp-seg-tab[aria-selected=true],.dp-seg-tab:hover{color:var(--dp-12)}

/* 侧栏导航与列表行 */
.dp-nav-item{display:flex;align-items:center;gap:9px;width:100%;height:calc(var(--dp-h) - 2px);padding:0 8px;border:0;border-radius:var(--r);background:transparent;color:var(--dp-11);font:500 var(--dp-fs)/1 var(--dp-sans),${CJK};text-align:left;cursor:pointer;transition:background-color .12s,color .12s}
.dp-nav-item:hover{background:var(--dp-a2);color:var(--dp-12)}
.dp-nav-item[aria-current=page]{background:var(--dp-a3);color:var(--dp-12);box-shadow:var(--hl)}
.dp-nav-item svg{flex:none;width:15px;height:15px;color:var(--dp-10)}
.dp-nav-item[aria-current=page] svg{color:var(--dp-accent-text)}
.dp-row{display:flex;align-items:center;gap:10px;min-height:var(--dp-row);padding:0 14px;border-bottom:1px solid var(--dp-a3);transition:background-color .12s}
.dp-row:hover{background:var(--dp-a2)}

/* 命令面板：浮层 + 光晕，组合框配列表框 */
.dp-cmd{display:flex;flex-direction:column;width:100%}
.dp-cmd-head{display:flex;align-items:center;gap:10px;height:calc(var(--dp-h) + 18px);padding:0 14px;border-bottom:1px solid var(--line)}
.dp-cmd-head>svg{flex:none;width:16px;height:16px;color:var(--dp-10)}
.dp-cmd-input{flex:1;min-width:0;height:100%;border:0;padding:0;background:transparent;color:var(--dp-12);font:400 calc(var(--dp-fs) + 1px)/1 var(--dp-sans),${CJK};outline:none}
.dp-cmd-input::placeholder{color:var(--dp-10)}
.dp-cmd-list{max-height:var(--dp-cmd-max,380px);overflow-y:auto;padding:6px;scrollbar-width:thin}
.dp-cmd-group{padding:8px 8px 5px;font:500 11px/1.2 var(--dp-sans),${CJK};color:var(--dp-11)}
.dp-cmd-item{display:flex;align-items:center;gap:10px;height:var(--dp-row);padding:0 8px;border-radius:var(--r);color:var(--dp-12);cursor:pointer;transition:background-color .12s}
.dp-cmd-item[aria-selected=true]{background:var(--dp-a4);box-shadow:var(--hl)}
.dp-cmd-icon{display:grid;place-items:center;flex:none;width:16px;height:16px;color:var(--dp-10);transition:color .12s}
.dp-cmd-icon svg{width:15px;height:15px}
.dp-cmd-item[aria-selected=true] .dp-cmd-icon{color:var(--dp-accent-text)}
.dp-cmd-label{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dp-cmd-hint{flex:none;color:var(--dp-11);font-size:12px}
.dp-cmd-keys{display:flex;flex:none;gap:3px}
.dp-cmd-empty{padding:28px 12px;text-align:center;color:var(--dp-11)}
.dp-cmd-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-top:1px solid var(--line);font-size:12px;color:var(--dp-11)}
.dp-cmd-foot>span{display:flex;align-items:center;gap:6px}
@media (max-width:480px){.dp-cmd-hint{display:none}}

@media (prefers-reduced-motion:reduce){.dp-btn,.dp-field,.dp-switch,.dp-switch::after,.dp-seg-thumb,.dp-seg-tab,.dp-nav-item,.dp-row,.dp-cmd-item,.dp-cmd-icon{transition:none}}
}`

/** 由参数算出的面色和强调色派生值；组件和演示都从这里取，保证一致。 */
export function tokensOf(props: Partial<typeof defaults>) {
  const { accent, grayFamily, elevationContrast } = { ...defaults, ...props }
  const g = (grayScales[grayFamily as GrayFamily] ?? grayScales.slate).solid
  const c = Math.min(1, Math.max(0, elevationContrast))
  // 四层面：页面固定第 1 级，其余三层在相邻级之间按「层次对比」插值。
  const s1 = mix(g[1], g[2], c)
  const s2 = mix(g[2], g[4], c)
  const s3 = mix(g[2], g[5], c * 0.85 + 0.15)
  return { s0: g[0] as string, s1, s2, s2h: mix(s2, g[5], 0.45), s3, accentFg: inkOn(accent), accentText: readableAccent(accent, s3), accentHover: mix(accent, '#ffffff', 0.08) }
}

export function StyleDarkPro({ className, style, children, ...props }: StyleDarkProProps) {
  const { accent, grayFamily, highlight, glow, radius, density, font } = { ...defaults, ...props }
  const scale = grayScales[grayFamily as GrayFamily] ?? grayScales.slate
  const fonts = fontPairings[font as keyof typeof fontPairings] ?? fontPairings.geist
  const size = densities[density as keyof typeof densities] ?? densities.regular
  const g = scale.solid
  const t = tokensOf(props)
  const vars: Record<string, string | number> = {}
  g.forEach((value, i) => {
    vars[`--dp-${i + 1}`] = value
  })
  scale.alpha.forEach((value, i) => {
    vars[`--dp-a${i + 1}`] = value
  })
  vars['--dp-s0'] = t.s0
  vars['--dp-s1'] = t.s1
  vars['--dp-s2'] = t.s2
  vars['--dp-s2h'] = t.s2h
  vars['--dp-s3'] = t.s3
  const step = Math.round(Math.min(whiteA.length, Math.max(0, highlight)))
  vars['--dp-hl'] = step > 0 ? whiteA[step - 1]! : 'transparent'
  vars['--dp-shadow-1'] = `0 1px 2px ${blackA[4]}`
  vars['--dp-shadow-2'] = `0 24px 64px -12px ${blackA[7]}, 0 8px 20px -8px ${blackA[5]}`
  vars['--dp-accent'] = accent
  vars['--dp-accent-fg'] = t.accentFg
  vars['--dp-accent-hover'] = t.accentHover
  vars['--dp-accent-text'] = t.accentText
  vars['--dp-accent-line'] = `color-mix(in oklab, ${accent} 70%, transparent)`
  vars['--dp-accent-ring'] = `color-mix(in oklab, ${accent} 28%, transparent)`
  const glowAmount = Math.min(1, Math.max(0, glow))
  vars['--dp-glow'] = glowAmount
  vars['--dp-glow-c'] = `color-mix(in oklab, ${accent} ${Math.round(glowAmount * 55)}%, transparent)`
  vars['--dp-glow-c2'] = `color-mix(in oklab, ${accent} ${Math.round(glowAmount * 22)}%, transparent)`
  vars['--dp-radius'] = `${radius}px`
  vars['--dp-h'] = `${size.control}px`
  vars['--dp-row'] = `${size.row}px`
  vars['--dp-fs'] = `${size.font}px`
  vars['--dp-sans'] = fonts.sans
  vars['--dp-mono'] = fonts.mono
  return (
    <div className={cn('dp', className)} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 面板：`elevation` 选层（panel / raised / overlay），`glow` 在背后加一团强调色光晕（父元素不要 overflow-hidden）。 */
export type PanelProps = HTMLAttributes<HTMLDivElement> & { elevation?: 'panel' | 'raised' | 'overlay'; glow?: boolean }
export function Panel({ className, elevation = 'panel', glow = false, children, ...rest }: PanelProps) {
  return (
    <div className={cn('dp-panel', className)} data-elevation={elevation} data-glow={glow || undefined} {...rest}>
      {glow ? <span className="dp-glow" aria-hidden /> : null}
      {children}
    </div>
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'icon' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('dp-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cn('dp-kbd', className)} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: ReactNode; trailing?: ReactNode }
export function Input({ className, label, icon, trailing, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const field = (
    <div className={cn('dp-field', label ? undefined : className)}>
      {icon ? (
        <span className="dp-field-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <input id={inputId} className="dp-input" {...rest} />
      {trailing}
    </div>
  )
  if (!label) return field
  return (
    <div className={cn('dp-stack', className)}>
      <label className="dp-field-label" htmlFor={inputId}>
        {label}
      </label>
      {field}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'; dot?: boolean }
export function Badge({ className, tone = 'neutral', dot = false, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('dp-badge', className)} data-tone={tone} {...rest}>
      {dot ? <span className="dp-dot" aria-hidden /> : null}
      {children}
    </span>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('dp-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

export type SegmentedProps = { items: { id: string; label: string }[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; className?: string; label?: string }
/** 分段选项卡：方向键切换，Home / End 跳到两端。 */
export function Segmented({ items, value, defaultValue, onValueChange, className, label }: SegmentedProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id)
  const current = value ?? inner
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, items.findIndex((item) => item.id === current))
  const select = (i: number) => {
    const at = (i + items.length) % items.length
    setInner(items[at]!.id)
    onValueChange?.(items[at]!.id)
    refs.current[at]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('dp-seg', className)}
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
      <span className="dp-seg-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="dp-seg-tab"
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

export type Command = { id: string; label: string; group?: string; icon?: ReactNode; hint?: string; shortcut?: string[] }
export type CommandBarProps = {
  commands: Command[]
  placeholder?: string
  /** 受控的高亮项（过滤后列表里的序号）。 */
  active?: number
  onActiveChange?: (index: number) => void
  onSelect?: (command: Command) => void
  label?: string
  footer?: ReactNode
  glow?: boolean
  className?: string
}

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </svg>
)

/** 命令面板：输入框是 combobox，列表是 listbox；上下键移动、回车执行、Home / End 跳到两端。 */
export function CommandBar({ commands, placeholder = 'Type a command or search…', active, onActiveChange, onSelect, label = 'Command menu', footer, glow = true, className }: CommandBarProps) {
  const [query, setQuery] = useState('')
  const [inner, setInner] = useState(0)
  const listId = useId()
  const q = query.trim().toLowerCase()
  const filtered = q ? commands.filter((command) => `${command.label} ${command.group ?? ''}`.toLowerCase().includes(q)) : commands
  const current = Math.min(Math.max(0, active ?? inner), Math.max(0, filtered.length - 1))
  const move = (i: number) => {
    const n = filtered.length
    if (!n) return
    const at = (i + n) % n
    setInner(at)
    onActiveChange?.(at)
  }
  const optionId = (i: number) => `${listId}-o${i}`

  // 按 group 连续分段渲染。
  const groups: { name: string; items: { command: Command; index: number }[] }[] = []
  filtered.forEach((command, index) => {
    const name = command.group ?? ''
    const last = groups[groups.length - 1]
    if (last && last.name === name) last.items.push({ command, index })
    else groups.push({ name, items: [{ command, index }] })
  })

  return (
    <Panel elevation="overlay" glow={glow} className={cn('dp-cmd', className)}>
      <div className="dp-cmd-head">
        <SearchIcon />
        <input
          className="dp-cmd-input"
          role="combobox"
          aria-label={label}
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={filtered.length ? optionId(current) : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setInner(0)
            onActiveChange?.(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') move(current + 1)
            else if (event.key === 'ArrowUp') move(current - 1)
            else if (event.key === 'Home' && !query) move(0)
            else if (event.key === 'End' && !query) move(filtered.length - 1)
            else if (event.key === 'Enter' && filtered[current]) onSelect?.(filtered[current]!)
            else if (event.key === 'Escape' && query) {
              setQuery('')
              setInner(0)
            } else return
            event.preventDefault()
          }}
        />
        <Kbd>esc</Kbd>
      </div>
      <div id={listId} role="listbox" aria-label={label} className="dp-cmd-list">
        {filtered.length === 0 ? <div className="dp-cmd-empty">No commands match “{query}”.</div> : null}
        {groups.map((group, g) => (
          <div key={`${group.name}-${g}`} role="group" aria-labelledby={group.name ? `${listId}-g${g}` : undefined}>
            {group.name ? (
              <div id={`${listId}-g${g}`} className="dp-cmd-group">
                {group.name}
              </div>
            ) : null}
            {group.items.map(({ command, index }) => (
              <div
                key={command.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === current}
                className="dp-cmd-item"
                onPointerMove={() => {
                  if (index !== current) move(index)
                }}
                onClick={() => onSelect?.(command)}
              >
                <span className="dp-cmd-icon" aria-hidden>
                  {command.icon}
                </span>
                <span className="dp-cmd-label">{command.label}</span>
                {command.hint ? <span className="dp-cmd-hint">{command.hint}</span> : null}
                {command.shortcut ? (
                  <span className="dp-cmd-keys">
                    {command.shortcut.map((key, k) => (
                      <Kbd key={k}>{key}</Kbd>
                    ))}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      {footer !== undefined ? footer : (
        <div className="dp-cmd-foot">
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate
          </span>
          <span>
            <Kbd>↵</Kbd> to run
          </span>
        </div>
      )}
    </Panel>
  )
}
