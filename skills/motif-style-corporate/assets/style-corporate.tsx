// SPDX-License-Identifier: MIT
// Copyright (c) 2020 Pouya Saadeghi
// Source: https://github.com/saadeghi/daisyui/blob/c51f501/packages/daisyui/src/themes/corporate.css
// Source: https://github.com/saadeghi/daisyui/blob/c51f501/packages/daisyui/src/themes/business.css
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#0082ce',
  grayTone: 'neutral',
  radius: 4,
  borderEmphasis: 1,
  density: 'regular',
  tableStripes: true,
  font: 'plex',
  dark: false,
}
/* @motif:end */

export type StyleCorporateProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * daisyUI corporate（浅色）与 business（深色）主题的令牌，oklch 原值照搬。
 * 底色三层按灰阶色调加一点彩度：neutral 是原版（彩度 0），slate / stone 是 Motif 补充的。
 * primary 由 accent 参数给出，不在这里。
 */
const THEMES = {
  light: {
    secondary: 'oklch(55% 0.046 257.417)',
    secondaryContent: 'oklch(100% 0 0)',
    accent: 'oklch(60% 0.118 184.704)',
    accentContent: 'oklch(100% 0 0)',
    neutral: 'oklch(0% 0 0)',
    neutralContent: 'oklch(100% 0 0)',
    info: 'oklch(60% 0.126 221.723)',
    success: 'oklch(62% 0.194 149.214)',
    warning: 'oklch(85% 0.199 91.936)',
    error: 'oklch(70% 0.191 22.216)',
    errorContent: 'oklch(0% 0 0)',
    // 语义色直接当文字太浅：同色相压暗到对比度 ≥ 4.5 的「墨色」。
    infoInk: 'oklch(50% 0.11 221.723)',
    successInk: 'oklch(48% 0.13 149.214)',
    warningInk: 'oklch(52% 0.11 75)',
    errorInk: 'oklch(53% 0.18 22.216)',
  },
  dark: {
    secondary: 'oklch(64.092% 0.027 229.389)',
    secondaryContent: 'oklch(12.818% 0.005 229.389)',
    accent: 'oklch(67.271% 0.167 35.791)',
    accentContent: 'oklch(13.454% 0.033 35.791)',
    neutral: 'oklch(27.441% 0.013 253.041)',
    neutralContent: 'oklch(85.488% 0.002 253.041)',
    info: 'oklch(62.616% 0.143 240.033)',
    success: 'oklch(70.226% 0.094 156.596)',
    warning: 'oklch(77.482% 0.115 81.519)',
    error: 'oklch(51.61% 0.146 29.674)',
    errorContent: 'oklch(90.322% 0.029 29.674)',
    infoInk: 'oklch(75% 0.11 240.033)',
    successInk: 'oklch(77% 0.094 156.596)',
    warningInk: 'oklch(81% 0.11 81.519)',
    errorInk: 'oklch(73% 0.13 29.674)',
  },
} as const

export const grayTones = {
  neutral: { c: 0, h: 0, ink: 'oklch(22.389% 0.031 278.072)', darkInk: 'oklch(84.87% 0 0)' },
  slate: { c: 0.013, h: 256, ink: 'oklch(22.4% 0.036 264)', darkInk: 'oklch(85% 0.012 256)' },
  stone: { c: 0.008, h: 70, ink: 'oklch(23% 0.014 55)', darkInk: 'oklch(85.5% 0.008 70)' },
} as const

export const fontPairings = {
  plex: { sans: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'" },
  inter: { sans: "'Inter Tight Variable'", mono: "'Geist Mono Variable'" },
  geist: { sans: "'Geist Variable'", mono: "'Geist Mono Variable'" },
  jakarta: { sans: "'Plus Jakarta Sans Variable'", mono: "'JetBrains Mono Variable'" },
} as const

/** 密度对应 daisyUI 的 --size-field（字段高 = size × 10）和 table-sm / md / lg 的单元格内距。 */
export const densities = {
  compact: { size: '0.2rem', cell: '0.5rem 0.75rem', table: '0.8125rem', pad: '1rem' },
  regular: { size: '0.25rem', cell: '0.75rem 1rem', table: '0.875rem', pad: '1.25rem' },
  comfortable: { size: '0.3rem', cell: '1rem 1.25rem', table: '0.9375rem', pad: '1.5rem' },
} as const

// ---- 颜色：只为 primary 计算深色档和可读的文字色 ----
type Vec3 = [number, number, number]
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function hexToLinear(hex: string): Vec3 {
  let v = hex.replace('#', '')
  if (v.length === 3) v = v.replace(/./g, (c) => c + c)
  const n = parseInt(v.slice(0, 6), 16) || 0
  return [toLinear(((n >> 16) & 255) / 255), toLinear(((n >> 8) & 255) / 255), toLinear((n & 255) / 255)]
}
function linearToHex(rgb: Vec3): string {
  return '#' + rgb.map((c) => Math.round(clamp01(toGamma(clamp01(c))) * 255).toString(16).padStart(2, '0')).join('')
}
function toOklab([r, g, b]: Vec3): Vec3 {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
function fromOklab([L, a, b]: Vec3): Vec3 {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)]
}
const luminance = ([r, g, b]: Vec3) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const contrast = (x: Vec3, y: Vec3) => {
  const [a, b] = [luminance(x), luminance(y)].sort((p, q) => q - p)
  return (a + 0.05) / (b + 0.05)
}

const WHITE: Vec3 = [1, 1, 1]
const LIGHT_INK = hexToLinear('#181a2a')
const DARK_BASE = hexToLinear('#202020')
const DARK_PRIMARY_CONTENT = hexToLinear('#d4dde8')

/**
 * primary 的三个值：填充色、填充上的文字色、可以直接当文字用的同色相「墨色」。
 * 深色模式像 business 相对 corporate 那样，把明度压到约 72%（上下限保证在深底上仍看得见）。
 * 填充上的文字优先用浅色（daisyUI 两套主题都是），浅色对比度不够时才换深色。
 */
export function primaryTokens(accent: string, dark: boolean) {
  const lab = toOklab(hexToLinear(accent))
  const fill = dark ? fromOklab([Math.min(0.62, Math.max(0.38, lab[0] * 0.72)), lab[1] * 0.72, lab[2] * 0.72]) : fromOklab(lab)
  const light = dark ? DARK_PRIMARY_CONTENT : WHITE
  const fg = contrast(fill, light) >= 3.6 || contrast(fill, light) >= contrast(fill, LIGHT_INK) ? light : LIGHT_INK
  const bg = dark ? DARK_BASE : WHITE
  const ink: Vec3 = [...lab]
  for (let i = 0; i < 50 && contrast(fromOklab(ink), bg) < 4.8; i++) ink[0] = clamp01(ink[0] + (dark ? 0.02 : -0.02))
  return { fill: linearToHex(fill), fg: linearToHex(fg), ink: linearToHex(fromOklab(ink)) }
}

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

/*
 * 企业商务：灰阶为主，一种主色承担所有操作；1px 边框、4px 圆角、没有阴影（daisyUI 的 depth 0）。
 * 按钮、输入框、校验、表格、面包屑的规则来自 daisyUI 组件 CSS，去掉 @apply 写成普通 CSS，
 * 变量换成 --cp-*，避免和宿主 Tailwind 的 --color-* 冲突。放在 @layer components，工具类可以覆盖。
 */
const CSS = `@layer components{
.cp{position:relative;isolation:isolate;min-height:100%;color:var(--cp-bc);background:var(--cp-canvas);font-family:var(--cp-font),${CJK};font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;
  --cp-canvas:color-mix(in oklab,var(--cp-b2) 45%,var(--cp-b1));
  --cp-muted:color-mix(in oklab,var(--cp-bc) 66%,var(--cp-b1));
  --cp-hair:color-mix(in oklab,var(--cp-bc) calc(5% * var(--cp-e)),transparent);
  --cp-line:color-mix(in oklab,var(--cp-bc) calc(11% * var(--cp-e)),transparent);
  --cp-field-line:color-mix(in oklab,var(--cp-bc) calc(20% * var(--cp-e)),transparent);
  --cp-h:calc(var(--cp-size) * 10)}
.cp[data-mode=dark]{--cp-canvas:var(--cp-b3)}
.cp *,.cp *::before,.cp *::after{box-sizing:border-box}
.cp .cp-mono{font-family:var(--cp-mono),ui-monospace,monospace;font-size:.92em}
.cp .cp-num{font-variant-numeric:tabular-nums}
.cp .cp-muted{color:var(--cp-muted)}
.cp-link{color:var(--cp-primary-ink);text-decoration:none;cursor:pointer}.cp-link:hover{text-decoration:underline}
.cp-title{margin:0;font-size:1.5rem;line-height:1.25;font-weight:600;letter-spacing:-.01em}
.cp-heading{margin:0;font-size:1.125rem;line-height:1.35;font-weight:600}
.cp-label{display:block;font-size:.8125rem;font-weight:600;line-height:1.3}
.cp-overline{font-size:.75rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--cp-muted)}
.cp-divider{height:0;border:0;border-top:var(--cp-border) solid var(--cp-line);margin:0}

/* 卡片：base-100 面、1px 边框、没有阴影 */
.cp-card{min-width:0;border-radius:var(--cp-r);border:var(--cp-border) solid var(--cp-line);background:var(--cp-b1)}
.cp-card-body{padding:var(--cp-pad)}
.cp-card-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;padding:var(--cp-pad) var(--cp-pad) 0}

/* 按钮（daisyUI .btn，depth 0） */
.cp-btn{--btn-color:var(--cp-b2);--btn-fg:var(--cp-bc);--btn-bg:var(--btn-color);--btn-border:var(--btn-color);display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:.375rem;height:var(--cp-h);padding:0 1rem;border:var(--cp-border) solid var(--btn-border);border-radius:var(--cp-r);background:var(--btn-bg);color:var(--btn-fg);
  font:600 .875rem/1 var(--cp-font),${CJK};white-space:nowrap;text-decoration:none;cursor:pointer;user-select:none;outline-offset:2px;touch-action:manipulation;
  transition:color .2s cubic-bezier(0,0,.2,1),background-color .2s cubic-bezier(0,0,.2,1),border-color .2s cubic-bezier(0,0,.2,1),transform .2s cubic-bezier(0,0,.2,1)}
@media (hover:hover){.cp-btn:hover{--btn-bg:color-mix(in oklab,var(--btn-color) 93%,#000);--btn-border:var(--btn-bg)}}
.cp-btn:active{transform:translateY(.5px) scale(.98)}
.cp-btn:focus-visible{outline:2px solid var(--btn-outline,var(--cp-bc))}
.cp-btn:disabled{opacity:.5;pointer-events:none}
.cp-btn[data-variant=primary]{--btn-color:var(--cp-primary);--btn-fg:var(--cp-primary-fg);--btn-outline:var(--cp-primary)}
.cp-btn[data-variant=neutral]{--btn-color:var(--cp-neutral);--btn-fg:var(--cp-neutral-fg)}
.cp-btn[data-variant=error]{--btn-color:var(--cp-error);--btn-fg:var(--cp-error-fg);--btn-outline:var(--cp-error)}
.cp-btn[data-variant=outline]{--btn-color:var(--cp-b2);--btn-bg:var(--cp-b1);--btn-border:var(--cp-field-line)}
.cp-btn[data-variant=ghost]{--btn-bg:transparent;--btn-border:transparent}
@media (hover:hover){.cp-btn[data-variant=outline]:hover,.cp-btn[data-variant=ghost]:hover{--btn-bg:var(--cp-b2);--btn-border:var(--cp-b2)}}
.cp-btn[data-size=sm]{height:calc(var(--cp-size) * 8);padding:0 .75rem;font-size:.75rem}
.cp-btn[data-size=lg]{height:calc(var(--cp-size) * 12);padding:0 1.25rem;font-size:1rem}
.cp-btn[data-square=true]{width:var(--cp-h);padding:0}
.cp-btn[data-square=true][data-size=sm]{width:calc(var(--cp-size) * 8)}

/* 输入框与校验（daisyUI .input / .validator） */
.cp-field{display:grid;gap:.375rem;min-width:0}
.cp-input{--input-color:var(--cp-field-line);width:100%;min-width:0;height:var(--cp-h);padding:0 .75rem;border:var(--cp-border) solid var(--input-color);border-radius:var(--cp-r);background:var(--cp-b1);color:var(--cp-bc);
  font:400 .875rem/1 var(--cp-font),${CJK};appearance:none;transition:border-color .15s,outline-color .15s}
.cp-input::placeholder{color:var(--cp-bc);opacity:.5}
.cp-input:focus,.cp-input:focus-visible{--input-color:var(--cp-bc);outline:2px solid var(--input-color);outline-offset:2px}
.cp-input[data-valid=true],.cp-input[data-valid=true]:focus{--input-color:var(--cp-success)}
.cp-input[aria-invalid=true],.cp-input[aria-invalid=true]:focus{--input-color:var(--cp-error)}
.cp-input:disabled{background:var(--cp-b2);border-color:var(--cp-b2);color:color-mix(in oklab,var(--cp-bc) 50%,transparent);cursor:not-allowed}
.cp-hint{margin:0;font-size:.75rem;line-height:1.4;color:var(--cp-muted)}
.cp-hint[data-state=error]{color:var(--cp-error-ink)}.cp-hint[data-state=success]{color:var(--cp-success-ink)}
.cp-select{position:relative;display:block;min-width:0}
.cp-select>select{padding-right:2.25rem;cursor:pointer}
.cp-select>svg{position:absolute;right:.75rem;top:50%;width:14px;height:14px;transform:translateY(-50%);pointer-events:none;color:var(--cp-muted)}
.cp-search{position:relative;display:block;min-width:0}
.cp-search>svg{position:absolute;left:.75rem;top:50%;width:15px;height:15px;transform:translateY(-50%);pointer-events:none;color:var(--cp-muted)}
.cp-search>input{padding-left:2.25rem}

/* 复选框与开关 */
.cp-checkbox{position:relative;flex:none;display:inline-grid;place-items:center;width:calc(var(--cp-size) * 4.5);height:calc(var(--cp-size) * 4.5);margin:0;border:var(--cp-border) solid var(--cp-field-line);border-radius:min(var(--cp-r),4px);background:var(--cp-b1);color:var(--cp-primary-fg);appearance:none;cursor:pointer;vertical-align:middle;transition:background-color .15s,border-color .15s}
.cp-checkbox::before{content:'';width:32%;height:58%;margin-top:-12%;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg) scale(.4);opacity:0;transition:transform .15s cubic-bezier(0,0,.2,1),opacity .15s}
.cp-checkbox:checked,.cp-checkbox:indeterminate{background:var(--cp-primary);border-color:var(--cp-primary)}
.cp-checkbox:checked::before{transform:rotate(45deg) scale(1);opacity:1}
.cp-checkbox:indeterminate::before{width:50%;height:0;margin:0;border-width:0 0 2px;transform:none;opacity:1}
.cp-checkbox:focus-visible,.cp-switch:focus-visible,.cp-tab:focus-visible,.cp-crumbs a:focus-visible{outline:2px solid var(--cp-primary);outline-offset:2px}
.cp-switch{position:relative;flex:none;width:calc(var(--cp-size) * 9);height:calc(var(--cp-size) * 5);padding:0;border:var(--cp-border) solid var(--cp-field-line);border-radius:calc(var(--cp-r) + 2px);background:var(--cp-b2);cursor:pointer;transition:background-color .2s,border-color .2s}
.cp-switch::after{content:'';position:absolute;top:2px;left:2px;width:calc(var(--cp-size) * 5 - 6px);height:calc(var(--cp-size) * 5 - 6px);border-radius:var(--cp-r);background:var(--cp-muted);transition:transform .2s cubic-bezier(0,0,.2,1),background-color .2s}
.cp-switch[aria-checked=true]{background:var(--cp-primary);border-color:var(--cp-primary)}
.cp-switch[aria-checked=true]::after{transform:translateX(calc(var(--cp-size) * 4));background:var(--cp-primary-fg)}

/* 徽标：soft 变体，文字用墨色 */
.cp-badge{--tone:var(--cp-bc);--tone-ink:var(--cp-bc);display:inline-flex;align-items:center;gap:.375rem;height:1.375rem;padding:0 .5rem;border-radius:var(--cp-r);border:var(--cp-border) solid color-mix(in oklab,var(--tone) 22%,transparent);background:color-mix(in oklab,var(--tone) 10%,var(--cp-b1));color:var(--tone-ink);font-size:.75rem;font-weight:600;line-height:1;white-space:nowrap}
.cp-badge[data-dot=true]::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--tone)}
.cp-badge[data-tone=primary]{--tone:var(--cp-primary);--tone-ink:var(--cp-primary-ink)}
.cp-badge[data-tone=info]{--tone:var(--cp-info);--tone-ink:var(--cp-info-ink)}
.cp-badge[data-tone=success]{--tone:var(--cp-success);--tone-ink:var(--cp-success-ink)}
.cp-badge[data-tone=warning]{--tone:var(--cp-warning);--tone-ink:var(--cp-warning-ink)}
.cp-badge[data-tone=error]{--tone:var(--cp-error);--tone-ink:var(--cp-error-ink)}

/* 提示条 */
.cp-alert{--tone:var(--cp-info);--tone-ink:var(--cp-info-ink);display:flex;gap:.75rem;align-items:flex-start;padding:.75rem 1rem;border-radius:var(--cp-r);border:var(--cp-border) solid color-mix(in oklab,var(--tone) 30%,transparent);background:color-mix(in oklab,var(--tone) 8%,var(--cp-b1))}
.cp-alert[data-tone=success]{--tone:var(--cp-success);--tone-ink:var(--cp-success-ink)}
.cp-alert[data-tone=warning]{--tone:var(--cp-warning);--tone-ink:var(--cp-warning-ink)}
.cp-alert[data-tone=error]{--tone:var(--cp-error);--tone-ink:var(--cp-error-ink)}
.cp-alert>svg{flex:none;width:18px;height:18px;margin-top:1px;color:var(--tone-ink)}
.cp-alert-title{margin:0;font-weight:600;font-size:.875rem;line-height:1.4}
.cp-alert-body{margin:.125rem 0 0;font-size:.8125rem;line-height:1.45;color:var(--cp-muted)}

/* 面包屑（daisyUI .breadcrumbs） */
.cp-crumbs{max-width:100%;overflow-x:auto;padding:.25rem 0;font-size:.8125rem}
.cp-crumbs>ol{display:flex;align-items:center;min-height:min-content;margin:0;padding:0 0 0 .125rem;list-style:none;white-space:nowrap}
.cp-crumbs li{display:flex;align-items:center}
.cp-crumbs li>*{display:flex;align-items:center;gap:.5rem;color:inherit;text-decoration:none}
.cp-crumbs li>a{cursor:pointer;color:var(--cp-muted)}.cp-crumbs li>a:hover{text-decoration:underline;color:var(--cp-bc)}
.cp-crumbs li+li::before{content:'';display:block;width:.375rem;height:.375rem;margin:0 .75rem 0 .5rem;rotate:45deg;border-top:1px solid;border-right:1px solid;opacity:.4}
.cp-crumbs [aria-current=page]{font-weight:600}

/* 选项卡：文字 + 2px 底线 */
.cp-tabs{display:flex;gap:.25rem;min-width:0;overflow-x:auto;scrollbar-width:none;box-shadow:inset 0 calc(var(--cp-border) * -1) 0 var(--cp-line)}
.cp-tab{display:inline-flex;align-items:center;gap:.5rem;flex:none;height:calc(var(--cp-h) + 4px);padding:0 .75rem;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--cp-muted);font:500 .875rem/1 var(--cp-font),${CJK};white-space:nowrap;cursor:pointer;transition:color .15s,border-color .15s}
.cp-tab:hover{color:var(--cp-bc)}
.cp-tab[aria-selected=true]{color:var(--cp-bc);font-weight:600;border-bottom-color:var(--cp-primary)}
.cp-tab-count{min-width:1.5rem;padding:.125rem .375rem;border-radius:var(--cp-r);background:var(--cp-b2);color:var(--cp-muted);font-size:.6875rem;font-weight:600;text-align:center;font-variant-numeric:tabular-nums}
.cp-tab[aria-selected=true] .cp-tab-count{background:color-mix(in oklab,var(--cp-primary) 14%,var(--cp-b1));color:var(--cp-primary-ink)}

/* 表格（daisyUI .table / .table-zebra） */
.cp-table{width:100%;border-collapse:separate;border-spacing:0;text-align:left;font-size:var(--cp-tfs)}
.cp-table :where(th,td){padding:var(--cp-cell);vertical-align:middle}
.cp-table thead th{color:var(--cp-muted);font-size:.8125rem;font-weight:600;white-space:nowrap}
.cp-table :where(thead tr th,tbody tr:not(:last-child) td){border-bottom:var(--cp-border) solid var(--cp-hair)}
.cp-table tbody tr{transition:background-color .15s}
.cp[data-stripes=true] .cp-table tbody tr:nth-child(even){background:var(--cp-b2)}
@media (hover:hover){.cp-table tbody tr:hover{background:var(--cp-b2)}.cp[data-stripes=true] .cp-table tbody tr:hover{background:var(--cp-b3)}}
.cp[data-mode] .cp-table tbody tr[data-selected=true]{background:color-mix(in oklab,var(--cp-primary) 9%,var(--cp-b1))}
.cp-table .cp-end{text-align:right}

/* 统计与头像 */
.cp-stat-value{margin:0;font-size:1.5rem;line-height:1.2;font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.cp-avatar{display:inline-grid;place-items:center;flex:none;width:2rem;height:2rem;border-radius:999px;background:var(--cp-b3);color:var(--cp-bc);font-size:.75rem;font-weight:600}

@media (prefers-reduced-motion:reduce){.cp-btn,.cp-input,.cp-checkbox,.cp-checkbox::before,.cp-switch,.cp-switch::after,.cp-tab,.cp-table tbody tr{transition:none}.cp-btn:active{transform:none}}
}`

export function StyleCorporate({ className, style, children, ...props }: StyleCorporateProps) {
  const { accent, grayTone, radius, borderEmphasis, density, tableStripes, font, dark } = { ...defaults, ...props }
  const theme = dark ? THEMES.dark : THEMES.light
  const tone = grayTones[grayTone as keyof typeof grayTones] ?? grayTones.neutral
  const fonts = fontPairings[font as keyof typeof fontPairings] ?? fontPairings.plex
  const size = densities[density as keyof typeof densities] ?? densities.regular
  const primary = primaryTokens(accent, dark)
  const base = (l: string) => `oklch(${l} ${tone.c} ${tone.h})`
  const vars = {
    '--cp-b1': dark ? base('24.353%') : 'oklch(100% 0 0)',
    '--cp-b2': dark ? base('22.648%') : base('93%'),
    '--cp-b3': dark ? base('20.944%') : base('86%'),
    '--cp-bc': dark ? tone.darkInk : tone.ink,
    '--cp-primary': primary.fill,
    '--cp-primary-fg': primary.fg,
    '--cp-primary-ink': primary.ink,
    '--cp-secondary': theme.secondary,
    '--cp-secondary-fg': theme.secondaryContent,
    '--cp-accent': theme.accent,
    '--cp-accent-fg': theme.accentContent,
    '--cp-neutral': theme.neutral,
    '--cp-neutral-fg': theme.neutralContent,
    '--cp-info': theme.info,
    '--cp-success': theme.success,
    '--cp-warning': theme.warning,
    '--cp-error': theme.error,
    '--cp-error-fg': theme.errorContent,
    '--cp-info-ink': theme.infoInk,
    '--cp-success-ink': theme.successInk,
    '--cp-warning-ink': theme.warningInk,
    '--cp-error-ink': theme.errorInk,
    '--cp-r': `${radius}px`,
    '--cp-border': '1px',
    '--cp-e': borderEmphasis,
    '--cp-size': size.size,
    '--cp-cell': size.cell,
    '--cp-tfs': size.table,
    '--cp-pad': size.pad,
    '--cp-font': fonts.sans,
    '--cp-mono': fonts.mono,
    colorScheme: dark ? 'dark' : 'light',
    ...style,
  } as CSSProperties
  return (
    <div className={cn('cp', className)} data-mode={dark ? 'dark' : 'light'} data-stripes={tableStripes} style={vars}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

const ICONS = {
  info: 'M12 16v-4.5M12 8.5v-.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  success: 'M8.5 12.5l2.5 2.5 4.5-5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9.5v4M12 16.5v.01M10.3 4.2 2.6 17.6A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0Z',
  error: 'M15 9l-6 6M9 9l6 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  chevron: 'M6 9l6 6 6-6',
  search: 'M20 20l-4.2-4.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
} as const

/** 线性图标：24 网格、1.75 描边，颜色跟随 currentColor。 */
export function Icon({ d, size = 16, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  )
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('cp-card', className)} {...rest} />
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'neutral' | 'error'; size?: 'sm' | 'md' | 'lg'; square?: boolean }
export function Button({ className, variant = 'default', size = 'md', square, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('cp-btn', className)} data-variant={variant} data-size={size} data-square={square} {...rest} />
}

type FieldState = 'error' | 'success'
function Field({ id, label, hint, state, children }: { id: string; label?: string; hint?: string; state?: FieldState; children: ReactNode }) {
  return (
    <div className="cp-field">
      {label ? (
        <label className="cp-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="cp-hint" data-state={state}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** 输入框。`state="error"` 设置 aria-invalid 并把提示读给读屏；`state="success"` 只改边框色。 */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; state?: FieldState }
export function Input({ className, label, hint, state, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <Field id={inputId} label={label} hint={hint} state={state}>
      <input id={inputId} className={cn('cp-input', className)} aria-invalid={state === 'error' || undefined} aria-describedby={hint ? `${inputId}-hint` : undefined} data-valid={state === 'success' || undefined} {...rest} />
    </Field>
  )
}

/** 带放大镜的搜索框。 */
export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cn('cp-search', className)}>
      <Icon d={ICONS.search} />
      <input type="search" className="cp-input" {...rest} />
    </span>
  )
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; options: { value: string; label: string }[] }
export function Select({ className, label, hint, id, options, ...rest }: SelectProps) {
  const auto = useId()
  const selectId = id ?? auto
  return (
    <Field id={selectId} label={label} hint={hint}>
      <span className={cn('cp-select', className)}>
        <select id={selectId} className="cp-input" aria-describedby={hint ? `${selectId}-hint` : undefined} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon d={ICONS.chevron} />
      </span>
    </Field>
  )
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { indeterminate?: boolean }
export function Checkbox({ className, indeterminate = false, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return <input ref={ref} type="checkbox" className={cn('cp-checkbox', className)} {...rest} />
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('cp-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error'; dot?: boolean }
export function Badge({ className, tone = 'neutral', dot, ...rest }: BadgeProps) {
  return <span className={cn('cp-badge', className)} data-tone={tone} data-dot={dot} {...rest} />
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'info' | 'success' | 'warning' | 'error'; title: string }
export function Alert({ className, tone = 'info', title, children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'} className={cn('cp-alert', className)} data-tone={tone} {...rest}>
      <Icon d={ICONS[tone]} size={18} />
      <div className="min-w-0">
        <p className="cp-alert-title">{title}</p>
        {children ? <p className="cp-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

/** 面包屑：最后一项是当前页，不是链接。 */
export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('cp-crumbs', className)}>
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>{i === items.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.href ?? '#'}>{item.label}</a>}</li>
        ))}
      </ol>
    </nav>
  )
}

export type TabsProps = { items: { id: string; label: string; count?: number }[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; className?: string; label?: string }
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
      className={cn('cp-tabs', className)}
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
          className="cp-tab"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          onClick={() => select(i)}
        >
          {item.label}
          {item.count !== undefined ? <span className="cp-tab-count">{item.count}</span> : null}
        </button>
      ))}
    </div>
  )
}
