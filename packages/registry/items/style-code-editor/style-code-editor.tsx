// SPDX-License-Identifier: MIT
// Copyright (c) 2021 Catppuccin
// Source: https://github.com/catppuccin/catppuccin/blob/d09787d/docs/style-guide.md
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useId, useMemo, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type PointerEvent, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  flavor: 'mocha',
  accent: 'mauve',
  showGutter: true,
  showMinimap: true,
  font: 'jetbrains',
  radius: 6,
  density: 1,
}
/* @motif:end */

export type StyleCodeEditorProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Catppuccin 四种风味的调色板，取自上游 README 的色表，数值未改。 */
export const palettes = {
  latte: { rosewater: '#dc8a78', flamingo: '#dd7878', pink: '#ea76cb', mauve: '#8839ef', red: '#d20f39', maroon: '#e64553', peach: '#fe640b', yellow: '#df8e1d', green: '#40a02b', teal: '#179299', sky: '#04a5e5', sapphire: '#209fb5', blue: '#1e66f5', lavender: '#7287fd', text: '#4c4f69', subtext1: '#5c5f77', subtext0: '#6c6f85', overlay2: '#7c7f93', overlay1: '#8c8fa1', overlay0: '#9ca0b0', surface2: '#acb0be', surface1: '#bcc0cc', surface0: '#ccd0da', base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8' },
  frappe: { rosewater: '#f2d5cf', flamingo: '#eebebe', pink: '#f4b8e4', mauve: '#ca9ee6', red: '#e78284', maroon: '#ea999c', peach: '#ef9f76', yellow: '#e5c890', green: '#a6d189', teal: '#81c8be', sky: '#99d1db', sapphire: '#85c1dc', blue: '#8caaee', lavender: '#babbf1', text: '#c6d0f5', subtext1: '#b5bfe2', subtext0: '#a5adce', overlay2: '#949cbb', overlay1: '#838ba7', overlay0: '#737994', surface2: '#626880', surface1: '#51576d', surface0: '#414559', base: '#303446', mantle: '#292c3c', crust: '#232634' },
  macchiato: { rosewater: '#f4dbd6', flamingo: '#f0c6c6', pink: '#f5bde6', mauve: '#c6a0f6', red: '#ed8796', maroon: '#ee99a0', peach: '#f5a97f', yellow: '#eed49f', green: '#a6da95', teal: '#8bd5ca', sky: '#91d7e3', sapphire: '#7dc4e4', blue: '#8aadf4', lavender: '#b7bdf8', text: '#cad3f5', subtext1: '#b8c0e0', subtext0: '#a5adcb', overlay2: '#939ab7', overlay1: '#8087a2', overlay0: '#6e738d', surface2: '#5b6078', surface1: '#494d64', surface0: '#363a4f', base: '#24273a', mantle: '#1e2030', crust: '#181926' },
  mocha: { rosewater: '#f5e0dc', flamingo: '#f2cdcd', pink: '#f5c2e7', mauve: '#cba6f7', red: '#f38ba8', maroon: '#eba0ac', peach: '#fab387', yellow: '#f9e2af', green: '#a6e3a1', teal: '#94e2d5', sky: '#89dceb', sapphire: '#74c7ec', blue: '#89b4fa', lavender: '#b4befe', text: '#cdd6f4', subtext1: '#bac2de', subtext0: '#a6adc8', overlay2: '#9399b2', overlay1: '#7f849c', overlay0: '#6c7086', surface2: '#585b70', surface1: '#45475a', surface0: '#313244', base: '#1e1e2e', mantle: '#181825', crust: '#11111b' },
} as const

export type Flavor = keyof typeof palettes
export type ColorName = keyof (typeof palettes)['mocha']
export const flavorLabels: Record<Flavor, string> = { latte: 'Latte', frappe: 'Frappé', macchiato: 'Macchiato', mocha: 'Mocha' }
export const accentNames = ['rosewater', 'flamingo', 'pink', 'mauve', 'red', 'maroon', 'peach', 'yellow', 'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender'] as const
export type AccentName = (typeof accentNames)[number]
export const neutralNames = ['text', 'subtext1', 'subtext0', 'overlay2', 'overlay1', 'overlay0', 'surface2', 'surface1', 'surface0', 'base', 'mantle', 'crust'] as const

/** 上游 style guide「Code Editors → Language Defaults」：语法角色 → 颜色名。 */
export const syntax = {
  keyword: 'mauve',
  string: 'green',
  symbol: 'red',
  escape: 'pink',
  comment: 'overlay2',
  number: 'peach',
  operator: 'sky',
  punctuation: 'overlay2',
  function: 'blue',
  parameter: 'maroon',
  builtin: 'red',
  type: 'yellow',
  variant: 'teal',
  property: 'blue',
  attribute: 'yellow',
  macro: 'rosewater',
} as const satisfies Record<string, ColorName>
export type SyntaxRole = keyof typeof syntax

/** 上游「Rainbow Highlights」：标题和括号按层级依次取色。 */
export const rainbow = ['red', 'peach', 'yellow', 'green', 'sapphire', 'lavender'] as const

export const fontPairings = {
  jetbrains: { mono: "'JetBrains Mono Variable'", sans: "'Inter Tight Variable'" },
  geist: { mono: "'Geist Mono Variable'", sans: "'Geist Variable'" },
  plex: { mono: "'IBM Plex Mono'", sans: "'IBM Plex Sans Variable'" },
  mono: { mono: "'JetBrains Mono Variable'", sans: "'JetBrains Mono Variable'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

// ---- 可读性：上游说明「Legibility always comes first」。Latte 上的粉彩字色达不到 4.5:1，
// 在 OKLCH 里只降低明度（保留色相），直到在 base / mantle / crust 上都够清楚；深色风味原样通过。

type Lin = [number, number, number]
const toLin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
const hexToLin = (hex: string): Lin => [toLin(parseInt(hex.slice(1, 3), 16) / 255), toLin(parseInt(hex.slice(3, 5), 16) / 255), toLin(parseInt(hex.slice(5, 7), 16) / 255)]
const linToHex = (c: Lin) => `#${c.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255).toString(16).padStart(2, '0')).join('')}`
const lumOf = (c: Lin) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

function toOklab([r, g, b]: Lin): Lin {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
function fromOklab([L, a, b]: Lin): Lin {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}

/** 把一个颜色调到在所有背景上对比度都 ≥ min：只动明度，色度不够时才收一点。 */
function ink(hex: string, backgrounds: readonly string[], min: number): string {
  const lums = backgrounds.map((bg) => lumOf(hexToLin(bg)))
  const worst = (c: Lin) => Math.min(...lums.map((l) => ratio(lumOf(c), l)))
  const start = hexToLin(hex)
  if (worst(start) >= min) return hex
  const [L, a, b] = toOklab(start)
  const dir = lums[0]! > 0.18 ? -1 : 1
  for (let step = 1; step <= 80; step++) {
    for (let k = 1; k >= 0; k -= 0.1) {
      const c = fromOklab([L + dir * step * 0.01, a * k, b * k])
      if (c.every((v) => v >= -0.0005 && v <= 1.0005)) {
        if (worst(c) >= min) return linToHex(c)
        break
      }
    }
  }
  return dir < 0 ? '#11111b' : '#ffffff'
}

/** 强调色底上的字：上游写的是 Base，但 Latte 的浅色强调色上要换成深色字。 */
function onAccent(hex: string, candidates: readonly string[]): string {
  const l = lumOf(hexToLin(hex))
  return candidates.reduce((best, c) => (ratio(lumOf(hexToLin(c)), l) > ratio(lumOf(hexToLin(best)), l) ? c : best))
}

const INKED = [...accentNames, 'text', 'subtext1', 'subtext0', 'overlay2', 'overlay1'] as const

/** 一个风味 + 强调色的全部 CSS 变量。 */
export function editorTokens(flavor: Flavor, accent: AccentName): Record<string, string> {
  const p = palettes[flavor]
  const bgs = [p.base, p.mantle, p.crust]
  const vars: Record<string, string> = {}
  for (const [name, value] of Object.entries(p)) vars[`--ce-${name}`] = value
  for (const name of INKED) vars[`--ce-i-${name}`] = ink(p[name], bgs, name === 'overlay1' ? 3 : 4.6)
  vars['--ce-accent'] = p[accent]
  vars['--ce-i-accent'] = vars[`--ce-i-${accent}`]!
  vars['--ce-on-accent'] = onAccent(p[accent], [p.base, p.crust, '#11111b', '#ffffff'])
  return vars
}

const roleCss = Object.entries(syntax)
  .map(([role, color]) => `.ce-t-${role}{color:var(--ce-i-${color})}`)
  .join('')
const toneCss = [...accentNames, 'accent']
  .map((name) => `.ce [data-tone=${name}]{--tone:var(--ce-${name});--ink:var(--ce-i-${name})}`)
  .join('')

/*
 * 代码编辑器：活动栏、带未保存圆点的标签条、行号栏、按语法角色上色的标题和标签、小地图、状态栏。
 * 颜色全部是 Catppuccin 的具名颜色，角色分配照上游 style guide。规则放在 @layer components，调用方的 Tailwind 类可以覆盖。
 */
const CSS = `@layer components{
.ce{position:relative;min-height:100%;background:var(--ce-base);color:var(--ce-text);font:400 14px/1.6 var(--ce-sans),${CJK};-webkit-font-smoothing:antialiased;
  --line:var(--ce-surface0);--hover:color-mix(in oklab,var(--ce-text) 7%,transparent);--cursorline:color-mix(in oklab,var(--ce-text) 8%,transparent);
  --row:calc(22px*var(--ce-d));--gw:3.6em;--pad:28px}
.ce *,.ce *::before,.ce *::after{box-sizing:border-box}
.ce ::selection{background:color-mix(in oklab,var(--ce-overlay2) 28%,transparent)}
@media (max-width:640px){.ce{--gw:2.9em;--pad:14px}}
.ce-mono{font-family:var(--ce-mono),ui-monospace,monospace}
.ce-sub{color:var(--ce-i-subtext0)}.ce-sub1{color:var(--ce-i-subtext1)}.ce-faint{color:var(--ce-i-overlay1)}
.ce-label{font:600 11px/1.2 var(--ce-mono),ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ce-i-subtext0)}
.ce-comment{font-family:var(--ce-mono),ui-monospace,monospace;font-style:italic;color:var(--ce-i-overlay2)}
.ce-link{color:var(--ce-i-blue);text-decoration:underline;text-decoration-color:color-mix(in oklab,currentColor 40%,transparent);text-underline-offset:3px;transition:color .12s}
.ce-link:hover{color:var(--ce-i-sky)}.ce-link:visited{color:var(--ce-i-lavender)}
.ce-code{font:500 .88em var(--ce-mono),ui-monospace,monospace;white-space:nowrap;padding:.08em .4em;border-radius:calc(var(--ce-r)*.6);background:var(--ce-mantle);border:1px solid var(--line)}
${roleCss}.ce-t-comment{font-style:italic}
${toneCss}

/* 窗口：标题栏、活动栏、侧栏、编辑区、状态栏 */
.ce-window{display:grid;grid-template-columns:auto auto minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;height:100%;min-height:0;background:var(--ce-base)}
.ce-titlebar{grid-column:1/-1;display:flex;align-items:center;gap:12px;height:calc(38px*var(--ce-d));padding:0 12px;background:var(--ce-crust);border-bottom:1px solid var(--line);min-width:0}
.ce-lights{display:flex;gap:7px;flex:none}.ce-lights i{width:11px;height:11px;border-radius:50%;background:var(--ce-surface1)}
.ce-lights i:nth-child(1){background:var(--ce-red)}.ce-lights i:nth-child(2){background:var(--ce-yellow)}.ce-lights i:nth-child(3){background:var(--ce-green)}
.ce-command{flex:1;min-width:0;max-width:440px;margin:0 auto;height:calc(26px*var(--ce-d));display:flex;align-items:center;justify-content:center;gap:8px;padding:0 10px;border-radius:var(--ce-r);background:var(--ce-mantle);border:1px solid var(--line);color:var(--ce-i-subtext0);font-size:12px;white-space:nowrap;overflow:hidden;cursor:pointer;transition:border-color .12s}
.ce-command:hover{border-color:var(--ce-surface2)}
.ce-command span{overflow:hidden;text-overflow:ellipsis}

.ce-activity{display:flex;flex-direction:column;width:48px;padding:4px 0;background:var(--ce-crust);border-right:1px solid var(--line)}
.ce-act{position:relative;display:grid;place-items:center;width:100%;height:calc(46px*var(--ce-d));border:0;background:transparent;color:var(--ce-i-overlay1);cursor:pointer;transition:color .12s}
.ce-act:hover,.ce-act[aria-pressed=true]{color:var(--ce-text)}
.ce-act[aria-pressed=true]::before{content:'';position:absolute;left:0;top:9px;bottom:9px;width:2px;border-radius:0 2px 2px 0;background:var(--ce-accent)}
.ce-act-count{position:absolute;right:7px;bottom:8px;min-width:15px;height:15px;padding:0 4px;border-radius:8px;background:var(--ce-accent);color:var(--ce-on-accent);font:700 9.5px/15px var(--ce-sans),${CJK};text-align:center}
.ce-act-spacer{flex:1}
@media (max-width:480px){.ce-activity{width:40px}}

.ce-sidebar{display:flex;flex-direction:column;width:244px;min-height:0;overflow:hidden;background:var(--ce-mantle);border-right:1px solid var(--line)}
@media (max-width:767px){.ce-sidebar{display:none}}
.ce-side-head{display:flex;align-items:center;justify-content:space-between;height:calc(36px*var(--ce-d));padding:0 12px 0 18px;flex:none}
.ce-tree{list-style:none;margin:0;padding:0 0 10px;overflow-y:auto;min-height:0}
.ce-node{display:flex;align-items:center;gap:6px;width:100%;height:calc(24px*var(--ce-d));padding:0 12px 0 calc(10px + var(--depth,0)*14px);border:0;background:transparent;color:var(--ce-i-subtext1);font:400 13px/1 var(--ce-sans),${CJK};text-align:left;cursor:pointer;transition:background-color .12s,color .12s}
.ce-node:hover{background:var(--hover)}
.ce-node[aria-current=page]{background:var(--cursorline);color:var(--ce-text);box-shadow:inset 2px 0 0 var(--ce-accent)}
.ce-node-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ce-node[data-git=M] .ce-node-name,.ce-node-git[data-git=M]{color:var(--ce-i-yellow)}
.ce-node[data-git=U] .ce-node-name,.ce-node-git[data-git=U]{color:var(--ce-i-green)}
.ce-node-git{margin-left:auto;font:600 11px/1 var(--ce-mono),ui-monospace,monospace}
.ce-chevron{flex:none;transition:transform .15s}.ce-node[aria-expanded=false] .ce-chevron{transform:rotate(-90deg)}

.ce-main{display:grid;grid-template-rows:auto auto minmax(0,1fr);min-width:0;min-height:0}
.ce-tabs{display:flex;min-width:0;overflow-x:auto;scrollbar-width:none;background:var(--ce-mantle);border-bottom:1px solid var(--line)}
.ce-tabs::-webkit-scrollbar{display:none}
.ce-tab{position:relative;flex:none;display:inline-flex;align-items:center;gap:8px;height:calc(36px*var(--ce-d));padding:0 8px 0 14px;border:0;border-right:1px solid var(--line);background:transparent;color:var(--ce-i-subtext0);font:400 13px/1 var(--ce-sans),${CJK};cursor:pointer;transition:background-color .12s,color .12s}
.ce-tab:hover{background:var(--hover);color:var(--ce-text)}
.ce-tab[aria-selected=true]{background:var(--ce-base);color:var(--ce-text);box-shadow:inset 0 2px 0 var(--ce-accent)}
.ce-tab[aria-selected=true]::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--ce-base)}
.ce-tab-end{display:grid;place-items:center;width:18px;height:18px;border-radius:calc(var(--ce-r)*.6);color:var(--ce-i-overlay1)}
.ce-tab-end .ce-x{display:none}.ce-tab-end .ce-dot{width:8px;height:8px;border-radius:50%;background:var(--ce-text)}
.ce-tab:hover .ce-tab-end .ce-x,.ce-tab[aria-selected=true]:not([data-dirty=true]) .ce-tab-end .ce-x{display:block}
.ce-tab:hover .ce-tab-end .ce-dot{display:none}
.ce-crumbs{display:flex;align-items:center;gap:6px;height:calc(26px*var(--ce-d));padding:0 16px;color:var(--ce-i-subtext0);font-size:12px;white-space:nowrap;overflow:hidden;background:var(--ce-base)}
.ce-crumbs b{font-weight:500;color:var(--ce-text)}

/* 编辑区：每一行（或一个内容块）在行号栏里占一个号 */
.ce-editor{position:relative;display:flex;min-width:0;min-height:0;background:var(--ce-base)}
.ce-scroll{flex:1;min-width:0;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--ce-surface1) transparent}
.ce-doc{counter-reset:ce-line;padding:calc(10px*var(--ce-d)) 0 64px}
.ce-row{display:grid;grid-template-columns:var(--gw) minmax(0,1fr);align-items:baseline;min-height:var(--row);padding-right:var(--pad)}
.ce-row::before{counter-increment:ce-line;content:counter(ce-line);padding-right:1.4em;text-align:right;font:400 12.5px/var(--row) var(--ce-mono),ui-monospace,monospace;color:var(--ce-i-overlay1);user-select:none}
.ce-row>*{min-width:0}
.ce-row[data-block]{align-items:start;padding-block:calc(6px*var(--ce-d))}
.ce-row[data-active=true]{background:var(--cursorline)}
.ce-row[data-active=true]::before{color:var(--ce-i-lavender)}
.ce[data-gutter=false] .ce-row{grid-template-columns:minmax(0,1fr);padding-left:var(--pad)}
.ce[data-gutter=false] .ce-row::before{display:none}
.ce-caret{display:inline-block;width:2px;height:1em;margin-left:3px;vertical-align:-.12em;background:var(--ce-rosewater);animation:ce-blink 1.1s steps(1) infinite}

.ce-minimap{position:relative;flex:none;width:96px;border-left:1px solid color-mix(in oklab,var(--line) 70%,transparent);cursor:pointer;overflow:hidden}
.ce-minimap svg{position:absolute;inset:8px 12px 8px 10px;width:calc(100% - 22px);height:calc(100% - 16px)}
.ce-mm-view{position:absolute;left:0;right:0;top:var(--top,0%);height:var(--h,20%);background:color-mix(in oklab,var(--ce-overlay2) 14%,transparent);transition:background-color .12s}
.ce-minimap:hover .ce-mm-view{background:color-mix(in oklab,var(--ce-overlay2) 24%,transparent)}
.ce[data-minimap=false] .ce-minimap{display:none}
@media (max-width:1023px){.ce-minimap{display:none}}

.ce-status{grid-column:1/-1;display:flex;align-items:center;min-width:0;height:calc(24px*var(--ce-d));background:var(--ce-mantle);border-top:1px solid var(--line);color:var(--ce-i-subtext0);font:500 12px/1 var(--ce-sans),${CJK};white-space:nowrap;overflow:hidden}
.ce-stat{display:inline-flex;align-items:center;gap:5px;height:100%;padding:0 9px}
.ce-stat[data-tone]{color:var(--ink)}
.ce-stat-mode{background:var(--ce-accent);color:var(--ce-on-accent);font:700 11px/1 var(--ce-mono),ui-monospace,monospace;letter-spacing:.06em;padding:0 12px}
.ce-status-spacer{flex:1}
@media (max-width:640px){.ce-stat[data-wide]{display:none}}

/* 文字：标题用等宽，标题前的 # 按 rainbow 上色；正文用无衬线 */
.ce-h{margin:0;font-family:var(--ce-mono),ui-monospace,monospace;font-weight:700;color:var(--ce-text);letter-spacing:-.02em;text-wrap:balance}
.ce-h1{font-size:clamp(26px,4.6vw,48px);line-height:1.12;letter-spacing:-.04em}
.ce-h2{font-size:clamp(19px,2.4vw,24px);line-height:1.3;letter-spacing:-.025em}
.ce-h3{font-size:16px;line-height:1.45}
.ce-hm{font-weight:500;margin-right:.55ch;letter-spacing:0}
.ce-h1 .ce-hm{color:var(--ce-i-red)}.ce-h2 .ce-hm{color:var(--ce-i-peach)}.ce-h3 .ce-hm{color:var(--ce-i-yellow)}
.ce-p{margin:0;max-width:66ch;font-size:15px;line-height:1.65;color:var(--ce-text)}
.ce-lead{margin:0;max-width:60ch;font-size:16.5px;line-height:1.6;color:var(--ce-i-subtext1)}

/* 按钮 */
.ce-btn{--h:calc(32px*var(--ce-d));display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--h);padding:0 14px;border-radius:var(--ce-r);border:1px solid transparent;background:var(--ce-surface0);color:var(--ce-text);font:500 13px/1 var(--ce-sans),${CJK};white-space:nowrap;cursor:pointer;text-decoration:none;transition:background-color .12s,color .12s,border-color .12s}
.ce-btn:hover{background:var(--ce-surface1)}
.ce-btn[data-variant=primary]{background:var(--ce-accent);color:var(--ce-on-accent);font-weight:600}
.ce-btn[data-variant=primary]:hover{background:color-mix(in oklab,var(--ce-accent) 86%,var(--ce-text))}
.ce-btn[data-variant=outline]{background:transparent;border-color:var(--ce-surface2)}
.ce-btn[data-variant=outline]:hover{background:var(--hover);border-color:var(--ce-overlay0)}
.ce-btn[data-variant=ghost]{background:transparent;color:var(--ce-i-subtext1)}
.ce-btn[data-variant=ghost]:hover{background:var(--hover);color:var(--ce-text)}
.ce-btn[data-size=sm]{--h:calc(26px*var(--ce-d));padding:0 10px;font-size:12px;gap:6px}
.ce-btn:active{transform:translateY(1px)}
.ce-btn:disabled{opacity:.45;pointer-events:none}
.ce-btn:focus-visible,.ce-act:focus-visible,.ce-node:focus-visible,.ce-tab:focus-visible,.ce-switch:focus-visible,.ce-command:focus-visible{outline:2px solid var(--ce-accent);outline-offset:-2px}
.ce-btn:focus-visible,.ce-switch:focus-visible{outline-offset:2px}

/* 徽标：Tags / Pills 默认蓝色 */
.ce-badge{--tone:var(--ce-blue);--ink:var(--ce-i-blue);display:inline-flex;align-items:center;gap:6px;height:calc(22px*var(--ce-d));padding:0 9px;border-radius:calc(var(--ce-r)*2);background:color-mix(in oklab,var(--tone) 13%,var(--ce-base));box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--tone) 34%,transparent);color:var(--ink);font:600 11.5px/1 var(--ce-mono),ui-monospace,monospace;white-space:nowrap}
.ce-badge[data-dot]::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--tone)}

/* 输入 */
.ce-field{display:grid;gap:6px;min-width:0}
.ce-input-wrap{position:relative;display:flex;align-items:center}
.ce-input-wrap>svg{position:absolute;left:10px;color:var(--ce-i-subtext0);pointer-events:none}
.ce-input-wrap>.ce-kbd{position:absolute;right:6px}
.ce-input{width:100%;height:calc(32px*var(--ce-d));padding:0 10px;border-radius:var(--ce-r);border:1px solid var(--ce-surface1);background:var(--ce-mantle);color:var(--ce-text);font:400 13px var(--ce-sans),${CJK};transition:border-color .12s,box-shadow .12s}
.ce-input-wrap>svg+.ce-input{padding-left:32px}
.ce-input::placeholder{color:var(--ce-i-subtext0)}
.ce-input:hover{border-color:var(--ce-surface2)}
.ce-input:focus{outline:none;border-color:var(--ce-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--ce-accent) 22%,transparent)}
.ce-kbd{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:calc(var(--ce-r)*.6);border:1px solid var(--ce-surface1);border-bottom-width:2px;background:var(--ce-base);color:var(--ce-i-subtext1);font:500 11px/1 var(--ce-mono),ui-monospace,monospace;white-space:nowrap}

/* 开关 */
.ce-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:0;border-radius:min(10px,calc(var(--ce-r)*2));background:var(--ce-surface1);cursor:pointer;transition:background-color .15s}
.ce-switch::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:min(7px,calc(var(--ce-r)*1.4));background:var(--ce-i-subtext1);transition:transform .18s cubic-bezier(.3,.7,.4,1),background-color .15s}
.ce-switch[aria-checked=true]{background:var(--ce-accent)}
.ce-switch[aria-checked=true]::after{transform:translateX(16px);background:var(--ce-on-accent)}

/* 面板、代码块、诊断 */
.ce-panel{min-width:0;border:1px solid var(--line);border-radius:var(--ce-r);background:var(--ce-mantle);overflow:hidden}
.ce-panel-head{display:flex;align-items:center;gap:8px;min-height:calc(32px*var(--ce-d));padding:0 12px;border-bottom:1px solid var(--line);background:var(--ce-crust);color:var(--ce-i-subtext0);font:500 12px/1 var(--ce-mono),ui-monospace,monospace}
.ce-pre{margin:0;padding:8px 0;font:400 13px/1.7 var(--ce-mono),ui-monospace,monospace;counter-reset:ce-cl;color:var(--ce-text)}
.ce-cl{display:grid;grid-template-columns:3.2em 1.4em minmax(0,1fr);padding-right:14px;white-space:pre-wrap;overflow-wrap:anywhere}
.ce-cl::before{counter-increment:ce-cl;content:counter(ce-cl);padding-right:.8em;text-align:right;color:var(--ce-i-overlay1);user-select:none}
.ce-cl-sign{color:var(--ce-i-overlay2);user-select:none}
.ce-cl[data-diff='+']{background:color-mix(in oklab,var(--ce-green) 15%,transparent)}.ce-cl[data-diff='+'] .ce-cl-sign{color:var(--ce-i-green)}
.ce-cl[data-diff='-']{background:color-mix(in oklab,var(--ce-red) 15%,transparent)}.ce-cl[data-diff='-'] .ce-cl-sign{color:var(--ce-i-red)}
.ce[data-gutter=false] .ce-cl{grid-template-columns:1.6em minmax(0,1fr);padding-left:6px}
.ce[data-gutter=false] .ce-cl::before{display:none}
.ce-diag{--tone:var(--ce-teal);--ink:var(--ce-i-teal);display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start;padding:9px 12px;border-radius:var(--ce-r);background:color-mix(in oklab,var(--tone) 8%,var(--ce-base));box-shadow:inset 2px 0 0 var(--tone);font-size:13px;line-height:1.5}
.ce-diag>svg{margin-top:2px;color:var(--ink)}
.ce-diag-src{font:400 12px/1.5 var(--ce-mono),ui-monospace,monospace;color:var(--ce-i-subtext0);white-space:nowrap}
@media (max-width:640px){.ce-diag{grid-template-columns:auto minmax(0,1fr)}.ce-diag-src{grid-column:2}}

/* 色板 */
.ce-swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--min,92px),1fr));gap:12px 10px}
.ce-swatch{display:grid;gap:5px;min-width:0}
.ce-chip{height:calc(42px*var(--ce-d));border-radius:var(--ce-r);background:var(--c);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--ce-text) 12%,transparent)}
.ce-swatch b{font:600 12px/1.2 var(--ce-mono),ui-monospace,monospace;color:var(--ce-text);overflow:hidden;text-overflow:ellipsis}
.ce-swatch span{font:400 11px/1.2 var(--ce-mono),ui-monospace,monospace;color:var(--ce-i-subtext0)}
.ce-decor{display:inline-block;width:.8em;height:.8em;margin:0 .35em -.05em .1em;border-radius:2px;background:var(--c);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--ce-text) 25%,transparent)}

@media (prefers-reduced-motion:reduce){.ce-caret{animation:none}.ce-btn,.ce-switch,.ce-switch::after,.ce-chevron,.ce-tab,.ce-node,.ce-input{transition:none}}
}
@keyframes ce-blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}`

export function StyleCodeEditor({ className, style, children, ...props }: StyleCodeEditorProps) {
  const { flavor, accent, showGutter, showMinimap, font, radius, density } = { ...defaults, ...props }
  const f = (flavor in palettes ? flavor : 'mocha') as Flavor
  const a = ((accentNames as readonly string[]).includes(accent) ? accent : 'mauve') as AccentName
  const tokens = useMemo(() => editorTokens(f, a), [f, a])
  const fonts = fontPairings[font as keyof typeof fontPairings] ?? fontPairings.jetbrains
  const vars: Record<string, string | number> = { ...tokens, '--ce-r': `${radius}px`, '--ce-d': density, '--ce-mono': fonts.mono, '--ce-sans': fonts.sans, colorScheme: f === 'latte' ? 'light' : 'dark' }
  return (
    <div className={cn('ce', className)} data-flavor={f} data-gutter={showGutter} data-minimap={showMinimap} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

// ---- 图标（内联 SVG） ----

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const icons = {
  files: 'M9 3.5h6l4 4v10H9z M15 3.5v4h4 M5.5 7v13.5H15',
  search: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z M15.5 15.5 20 20',
  branch: 'M7 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M7 16.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M17 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z M7 7.5v9 M17 8.5v1a4 4 0 0 1-4 4H11a4 4 0 0 0-4 3',
  run: 'M8 5.5v13l10-6.5z',
  blocks: 'M4 4h6.5v6.5H4z M4 13.5h6.5V20H4z M13.5 13.5H20V20h-6.5z M17 3l3.5 3.5L17 10l-3.5-3.5z',
  user: 'M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
  gear: 'M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5.3 5.3l2.1 2.1 M16.6 16.6l2.1 2.1 M5.3 18.7l2.1-2.1 M16.6 7.4l2.1-2.1',
  error: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z M9 9l6 6 M15 9l-6 6',
  warning: 'M12 3.5 21 19.5H3z M12 10v4.5 M12 17v.01',
  info: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z M12 11v5.5 M12 7.8v.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevron: 'M6 9l6 6 6-6',
  close: 'M7 7l10 10 M17 7 7 17',
  sync: 'M19.5 11a7.5 7.5 0 0 0-13.6-3.5 M4.5 4v3.5H8 M4.5 13a7.5 7.5 0 0 0 13.6 3.5 M19.5 20v-3.5H16',
  bell: 'M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z M10 20.5h4',
  file: 'M5.5 2.5h8l5 5v14h-13z M13.5 2.5v5h5',
  folder: 'M3 6.5a1.5 1.5 0 0 1 1.5-1.5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z',
  arrow: 'M5 12h13 M13 7l5 5-5 5',
} as const
export type IconName = keyof typeof icons

export function Icon({ name, size = 16, className, style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden {...stroke}>
      <path d={icons[name]} />
    </svg>
  )
}

/** 文件图标：颜色按扩展名取 Catppuccin 的具名颜色。 */
const extColor: Record<string, ColorName> = { ts: 'blue', tsx: 'sapphire', mdx: 'yellow', md: 'sapphire', css: 'mauve', toml: 'peach', json: 'yellow' }
export function FileIcon({ ext, size = 15 }: { ext: string; size?: number }) {
  const color = extColor[ext] ?? 'overlay2'
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ flex: 'none', color: `var(--ce-i-${color}, var(--ce-${color}))` }} {...stroke} strokeWidth={1.8}>
      <path d={icons.file} />
    </svg>
  )
}

// ---- 窗口骨架 ----

export function Window({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ce-window', className)} {...rest} />
}

export function TitleBar({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('ce-titlebar', className)}>
      <span className="ce-lights" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {children}
      <span className="w-[47px] flex-none max-sm:hidden" aria-hidden />
    </div>
  )
}

export function ActivityBar({ className, children, label = 'Views' }: { className?: string; children?: ReactNode; label?: string }) {
  return (
    <nav className={cn('ce-activity', className)} aria-label={label}>
      {children}
    </nav>
  )
}

export type ActivityItemProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; active?: boolean; count?: number }
export function ActivityItem({ icon, label, active = false, count, className, ...rest }: ActivityItemProps) {
  return (
    <button type="button" className={cn('ce-act', className)} aria-label={label} aria-pressed={active} title={label} {...rest}>
      <Icon name={icon} size={22} />
      {count ? (
        <span className="ce-act-count" aria-hidden>
          {count}
        </span>
      ) : null}
    </button>
  )
}

export function Sidebar({ title, actions, children, className }: { title: string; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <aside className={cn('ce-sidebar', className)} aria-label={title}>
      <div className="ce-side-head">
        <span className="ce-label">{title}</span>
        {actions}
      </div>
      {children}
    </aside>
  )
}

export type TreeNode = { id: string; name: string; ext?: string; git?: 'M' | 'U'; children?: TreeNode[] }
/** 文件树：目录可折叠，当前文件标 aria-current，git 状态（M 修改 / U 未跟踪）用黄 / 绿。 */
export function FileTree({ nodes, current, onOpen, label = 'Files' }: { nodes: TreeNode[]; current?: string; onOpen?: (id: string) => void; label?: string }) {
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const render = (list: TreeNode[], depth: number): ReactNode =>
    list.map((node) => {
      const folder = Boolean(node.children)
      const open = folder && !closed[node.id]
      return (
        <li key={node.id}>
          <button
            type="button"
            className="ce-node"
            style={{ '--depth': depth } as CSSProperties}
            data-git={node.git}
            aria-expanded={folder ? open : undefined}
            aria-current={!folder && node.id === current ? 'page' : undefined}
            onClick={() => (folder ? setClosed((c) => ({ ...c, [node.id]: open })) : onOpen?.(node.id))}
          >
            {folder ? <Icon name="chevron" size={14} className="ce-chevron" /> : <span className="w-[14px] flex-none" />}
            {folder ? <Icon name="folder" size={15} style={{ flex: 'none', color: 'var(--ce-i-overlay1)' }} /> : <FileIcon ext={node.ext ?? ''} />}
            <span className="ce-node-name">{node.name}</span>
            {node.git ? (
              <span className="ce-node-git" data-git={node.git} aria-label={node.git === 'M' ? 'modified' : 'untracked'}>
                {node.git}
              </span>
            ) : null}
          </button>
          {folder && open ? <ul className="ce-tree !p-0">{render(node.children!, depth + 1)}</ul> : null}
        </li>
      )
    })
  return (
    <ul className="ce-tree" aria-label={label}>
      {render(nodes, 0)}
    </ul>
  )
}

export function Main({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <main className={cn('ce-main', className)} {...rest} />
}

export type EditorTab = { id: string; label: string; ext?: string; dirty?: boolean }
/** 标签条：未保存的文件显示一个圆点，悬停时换成关闭符号；方向键切换。 */
export function TabStrip({ items, value, onValueChange, label = 'Open editors', className }: { items: EditorTab[]; value: string; onValueChange?: (id: string) => void; label?: string; className?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, items.findIndex((item) => item.id === value))
  const select = (i: number) => {
    const at = (i + items.length) % items.length
    onValueChange?.(items[at]!.id)
    refs.current[at]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('ce-tabs', className)}
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
          className="ce-tab"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          data-dirty={item.dirty}
          onClick={() => select(i)}
        >
          <FileIcon ext={item.ext ?? ''} />
          {item.label}
          {item.dirty ? <span className="sr-only">(unsaved)</span> : null}
          <span className="ce-tab-end" aria-hidden>
            {item.dirty ? <span className="ce-dot" /> : null}
            <Icon name="close" size={13} className="ce-x" />
          </span>
        </button>
      ))}
    </div>
  )
}

export function Breadcrumbs({ items, className }: { items: string[]; className?: string }) {
  return (
    <nav className={cn('ce-crumbs', className)} aria-label="Breadcrumbs">
      {items.map((item, i) => (
        <span key={item} className="contents">
          {i > 0 ? <span aria-hidden>›</span> : null}
          {i === items.length - 1 ? <b>{item}</b> : <span>{item}</span>}
        </span>
      ))}
    </nav>
  )
}

/** 编辑区：滚动的文档 + 右侧小地图。scrollRef 交给 Minimap 同步视口。 */
export function Editor({ children, minimap, scrollRef, className, label = 'Editor' }: { children?: ReactNode; minimap?: ReactNode; scrollRef?: RefObject<HTMLDivElement | null>; className?: string; label?: string }) {
  return (
    <div className={cn('ce-editor', className)}>
      <div ref={scrollRef} className="ce-scroll" role="region" aria-label={label} tabIndex={0}>
        <div className="ce-doc">{children}</div>
      </div>
      {minimap}
    </div>
  )
}

/** 一行：行号栏里占一个号。block 表示内容块（色板、面板），行号贴顶。 */
export function Line({ children, active, block, indent = 0, className }: { children?: ReactNode; active?: boolean; block?: boolean; indent?: number; className?: string }) {
  return (
    <div className={cn('ce-row', className)} data-active={active || undefined} data-block={block || undefined}>
      <div style={indent ? { paddingLeft: `${indent * 2}ch` } : undefined}>{children ?? ' '}</div>
    </div>
  )
}

export function Caret() {
  return <span className="ce-caret" aria-hidden />
}

export function Heading({ level = 2, children, className, id }: { level?: 1 | 2 | 3; children?: ReactNode; className?: string; id?: string }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  return (
    <Tag id={id} className={cn('ce-h', `ce-h${level}`, className)}>
      <span className="ce-hm" aria-hidden>
        {'#'.repeat(level)}
      </span>
      {children}
    </Tag>
  )
}

/** 按语法角色上色的一段文字。 */
export function Tok({ k, children, className }: { k: SyntaxRole; children?: ReactNode; className?: string }) {
  return <span className={cn(`ce-t-${k}`, className)}>{children}</span>
}

export function Comment({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn('ce-comment', className)}>{'// '}{children}</span>
}

export type CodeToken = readonly [SyntaxRole | 'text', string]
export type CodeLine = { t: readonly CodeToken[]; diff?: '+' | '-' }
/** 代码块：自带行号，可选 diff 标记（新增绿、删除红，上游 Diff & Merge 的 15% 底色）。 */
export function CodeBlock({ lines, label }: { lines: readonly CodeLine[]; label?: string }) {
  return (
    <pre className="ce-pre" aria-label={label}>
      {lines.map((line, i) => (
        <span key={i} className="ce-cl" data-diff={line.diff}>
          <span className="ce-cl-sign" aria-hidden>
            {line.diff ?? ' '}
          </span>
          <code>
            {line.t.length === 0
              ? ' '
              : line.t.map(([role, text], j) =>
                  role === 'text' ? (
                    <span key={j}>{text}</span>
                  ) : (
                    <span key={j} className={`ce-t-${role}`}>
                      {text}
                    </span>
                  ),
                )}
          </code>
        </span>
      ))}
    </pre>
  )
}

export function Panel({ title, icon, actions, children, className }: { title?: ReactNode; icon?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('ce-panel', className)}>
      {title ? (
        <div className="ce-panel-head">
          {icon}
          <div className="min-w-0 truncate">{title}</div>
          {actions ? <span className="ml-auto flex items-center gap-2">{actions}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

const minimapRows = (() => {
  // 确定性的伪代码轮廓：长短不一的行、偶尔空行，颜色取语法角色。
  const roles: ColorName[] = ['mauve', 'text', 'blue', 'green', 'overlay2', 'peach', 'text', 'yellow', 'sky', 'text']
  const rows: { x: number; w: number; c: ColorName }[][] = []
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 168; i++) {
    if (rand() < 0.16) {
      rows.push([])
      continue
    }
    const indent = Math.floor(rand() * 3) * 6
    let x = indent
    const segs: { x: number; w: number; c: ColorName }[] = []
    const count = 1 + Math.floor(rand() * 3)
    for (let s = 0; s < count && x < 70; s++) {
      const w = Math.min(70 - x, 6 + Math.floor(rand() * 22))
      segs.push({ x, w, c: roles[Math.floor(rand() * roles.length)]! })
      x += w + 3
    }
    rows.push(segs)
  }
  return rows
})()

/** 小地图：整篇文档的缩略轮廓 + 当前视口；点击跳转。 */
export function Minimap({ target, className }: { target: RefObject<HTMLElement | null>; className?: string }) {
  const viewRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = target.current
    const view = viewRef.current
    if (!el || !view) return
    const update = () => {
      const h = Math.max(1, el.scrollHeight)
      view.style.setProperty('--top', `${(el.scrollTop / h) * 100}%`)
      view.style.setProperty('--h', `${Math.min(1, el.clientHeight / h) * 100}%`)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [target])
  const jump = (event: PointerEvent<HTMLDivElement>) => {
    const el = target.current
    if (!el) return
    const rect = event.currentTarget.getBoundingClientRect()
    el.scrollTop = ((event.clientY - rect.top) / rect.height) * el.scrollHeight - el.clientHeight / 2
  }
  return (
    <div className={cn('ce-minimap', className)} aria-hidden onPointerDown={jump}>
      <svg viewBox={`0 0 72 ${minimapRows.length * 4}`} preserveAspectRatio="none">
        {minimapRows.map((segs, i) =>
          segs.map((s, j) => <rect key={`${i}-${j}`} x={s.x} y={i * 4} width={s.w} height={2.2} rx={0.6} style={{ fill: `var(--ce-${s.c})`, opacity: 0.6 }} />),
        )}
      </svg>
      <div ref={viewRef} className="ce-mm-view" />
    </div>
  )
}

export function StatusBar({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <footer className={cn('ce-status', className)} aria-label="Status bar">
      {children}
    </footer>
  )
}

export function StatusItem({ className, mode, wide, tone, children }: { className?: string; mode?: boolean; wide?: boolean; tone?: AccentName; children?: ReactNode }) {
  return (
    <span className={cn('ce-stat', mode && 'ce-stat-mode', className)} data-wide={wide || undefined} data-tone={tone}>
      {children}
    </span>
  )
}

// ---- 基础组件 ----

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; size?: 'sm' | 'md' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('ce-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: AccentName | 'accent'; dot?: boolean }
export function Badge({ className, tone = 'blue', dot, ...rest }: BadgeProps) {
  return <span className={cn('ce-badge', className)} data-tone={tone} data-dot={dot || undefined} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: IconName; shortcut?: string }
export function Input({ className, label, icon, shortcut, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = (
    <span className="ce-input-wrap">
      {icon ? <Icon name={icon} size={15} /> : null}
      <input id={inputId} className={cn('ce-input', className)} style={shortcut ? { paddingRight: 64 } : undefined} {...rest} />
      {shortcut ? (
        <kbd className="ce-kbd" aria-hidden>
          {shortcut}
        </kbd>
      ) : null}
    </span>
  )
  if (!label) return input
  return (
    <span className="ce-field">
      <label className="ce-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </span>
  )
}

export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cn('ce-kbd', className)} {...rest} />
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('ce-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

const diagTone = { error: 'red', warning: 'yellow', info: 'teal', success: 'green' } as const
const diagIcon = { error: 'error', warning: 'warning', info: 'info', success: 'check' } as const
/** 诊断：错误红、警告黄、信息青（上游 General 表）。 */
export function Diagnostic({ level = 'info', children, source, className }: { level?: keyof typeof diagTone; children?: ReactNode; source?: ReactNode; className?: string }) {
  return (
    <div className={cn('ce-diag', className)} data-tone={diagTone[level]} role={level === 'error' ? 'alert' : 'status'}>
      <Icon name={diagIcon[level]} size={16} />
      <div className="min-w-0">{children}</div>
      {source ? <span className="ce-diag-src">{source}</span> : null}
    </div>
  )
}

/** 色块：用于色板。note 是这个颜色承担的角色，用它自己的字色。 */
export function Swatch({ name, value, note, ink: inkVar }: { name: string; value: string; note?: ReactNode; ink?: string }) {
  return (
    <div className="ce-swatch">
      <div className="ce-chip" style={{ '--c': value } as CSSProperties} />
      <b>{name}</b>
      <span>{value}</span>
      {note ? <span style={inkVar ? { color: inkVar } : undefined}>{note}</span> : null}
    </div>
  )
}
