// SPDX-License-Identifier: Apache-2.0
// tweakcn (https://github.com/jnsahaj/tweakcn)
// Source: https://github.com/jnsahaj/tweakcn/blob/a3b47b3/utils/theme-presets.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  hazardColor: '#f7b500',
  steelTone: 'light',
  stripeAngle: 45,
  stripeWidth: 14,
  rivets: true,
  radius: 6,
  displayFont: 'archivo',
  shadowOffset: 2,
}
/* @motif:end */

export type StyleIndustrialProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * tweakcn「graphite」预设的亮 / 暗两套中性色，原样保留（暗色的 muted 文字提亮了一档，小标签在深色面板上才看得清）。
 * edge 取自预设的 chart-3 / chart-4：面板边缘需要比 border 更硬的一道钢灰线。
 */
export const palettes = {
  light: { background: '#f0f0f0', foreground: '#333333', card: '#f5f5f5', primary: '#606060', secondary: '#e0e0e0', muted: '#d9d9d9', mutedForeground: '#666666', accent: '#c0c0c0', destructive: '#cc3333', border: '#d0d0d0', input: '#e0e0e0', teal: '#476666', edge: '#909090', shadow: 'hsl(0 0% 20%)' },
  dark: { background: '#1a1a1a', foreground: '#d9d9d9', card: '#202020', primary: '#a0a0a0', secondary: '#303030', muted: '#2a2a2a', mutedForeground: '#8f8f8f', accent: '#404040', destructive: '#e06666', border: '#353535', input: '#303030', teal: '#7e9ca0', edge: '#585858', shadow: 'hsl(0 0% 0%)' },
} as const

/** 标题字体：weight 是字重（Archivo Black 只有 400），tracking 是大写标题的字距。 */
export const displayFonts = {
  archivo: { family: "'Archivo Black'", weight: 400, tracking: '-0.005em' },
  grotesk: { family: "'Space Grotesk Variable'", weight: 700, tracking: '-0.02em' },
  plex: { family: "'IBM Plex Mono'", weight: 700, tracking: '-0.03em' },
} as const

const BODY = "'IBM Plex Sans Variable'"
const MONO = "'IBM Plex Mono'"
const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

/** 墨色就是预设暗色模式的底色；浅色的「墨」取预设亮色模式的底色。 */
export const INK = '#1a1a1a'
const PAPER = '#ffffff'

function luminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return 0.5
  const n = parseInt(match[1]!, 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

/** 在填充色上挑对比度更高的文字色（墨色或白色）。 */
export function inkOn(hex: string, light: string = PAPER): string {
  const l = luminance(hex)
  const onInk = (l + 0.05) / (luminance(INK) + 0.05)
  const onLight = (luminance(light) + 0.05) / (l + 0.05)
  return onInk >= onLight ? INK : light
}

/*
 * 工业风：钢板面板 + 四角铆钉，黄黑斜纹只出现在边缘和状态上，所有凸起物都是零模糊的硬阴影。
 * 规则放在 @layer components，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.ind{position:relative;isolation:isolate;min-height:100%;color:var(--ind-foreground);background:var(--ind-background);font-family:var(--ind-body),${CJK};font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;
  --r:var(--ind-radius);--r-sm:calc(var(--ind-radius)*.6);--off:var(--ind-off);
  --hard:var(--off) var(--off) 0 0 var(--ind-shadow);
  --sw-sm:calc(var(--ind-sw)*.5);
  --stripes:repeating-linear-gradient(var(--ind-angle),var(--ind-hazard) 0 var(--ind-sw),var(--ind-stripe) 0 calc(var(--ind-sw)*2));
  --stripes-sm:repeating-linear-gradient(var(--ind-angle),var(--ind-hazard) 0 var(--sw-sm),var(--ind-stripe) 0 calc(var(--sw-sm)*2))}
.ind[data-tone=light]{--sheen:rgb(255 255 255/.8);--grain:rgb(0 0 0/.022);--rivet-hi:#ffffff;--rivet:#b8b8b8;--rivet-lo:#6a6a6a;--well:#e2e2e2;--field:#fbfbfb;--bevel:rgb(255 255 255/.9)}
.ind[data-tone=dark]{--sheen:rgb(255 255 255/.05);--grain:rgb(255 255 255/.016);--rivet-hi:#a0a0a0;--rivet:#4e4e4e;--rivet-lo:#0c0c0c;--well:#121212;--field:#161616;--bevel:rgb(255 255 255/.06)}
.ind *,.ind *::before,.ind *::after{box-sizing:border-box}

/* 文字 */
.ind-display{font-family:var(--ind-display),${CJK};font-weight:var(--ind-dw);letter-spacing:var(--ind-track);line-height:.98;text-transform:uppercase}
.ind-mono{font-family:var(--ind-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums}
.ind-sub{color:var(--ind-mutedForeground)}
.ind-label{font:700 .7rem/1.2 var(--ind-mono),${CJK};letter-spacing:.16em;text-transform:uppercase;color:var(--ind-mutedForeground)}

/* 警示斜纹带 */
.ind-hazard{display:block;height:var(--h,14px);background:var(--stripes)}
.ind-hazard[data-edge=true]{border-block:2px solid var(--ind-ink)}

/* 钢板面板：顶部高光 + 拉丝纹理 + 钢灰边 + 硬阴影；铆钉在四角 */
.ind-panel{position:relative;padding:22px;border-radius:var(--r);border:1px solid var(--ind-edge);
  background:linear-gradient(180deg,var(--sheen),transparent 42%),repeating-linear-gradient(90deg,var(--grain) 0 1px,transparent 1px 3px),var(--ind-card);
  box-shadow:inset 0 1px 0 var(--bevel),var(--hard)}
.ind[data-rivets=on] .ind-panel:not([data-rivets=off])::before{content:'';position:absolute;inset:6px;pointer-events:none;
  --hi:radial-gradient(circle at 38% 34%,var(--rivet-hi) 0 .7px,transparent 1.7px);
  --rv:radial-gradient(circle,var(--rivet) 0 2.3px,var(--rivet-lo) 2.9px 3.4px,transparent 3.9px);
  background:var(--hi) left top/9px 9px no-repeat,var(--hi) right top/9px 9px no-repeat,var(--hi) left bottom/9px 9px no-repeat,var(--hi) right bottom/9px 9px no-repeat,
    var(--rv) left top/9px 9px no-repeat,var(--rv) right top/9px 9px no-repeat,var(--rv) left bottom/9px 9px no-repeat,var(--rv) right bottom/9px 9px no-repeat}
.ind-panel-title{margin:0;font:var(--ind-dw) 1.02rem/1.15 var(--ind-display),${CJK};letter-spacing:calc(var(--ind-track) + .03em);text-transform:uppercase}
.ind-panel-desc{margin:.35rem 0 0;color:var(--ind-mutedForeground);font-size:.88rem}

/* 按钮：硬阴影，按下时平移一个偏移量、阴影归零 */
.ind-btn{--c:var(--ind-secondary);--fg:var(--ind-foreground);--bd:var(--ind-edge);position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.55rem;height:44px;padding:0 1.25em;border-radius:var(--r-sm);
  border:2px solid var(--bd);background-color:var(--c);color:var(--fg);font:var(--ind-dw) .8rem/1 var(--ind-display),${CJK};letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;cursor:pointer;text-decoration:none;
  box-shadow:var(--hard);transition:transform .1s ease-out,box-shadow .1s ease-out,background-color .15s ease-out}
.ind-btn[data-size=sm]{height:36px;padding:0 .95em;font-size:.72rem}
.ind-btn[data-size=lg]{height:52px;padding:0 1.6em;font-size:.9rem}
.ind-btn:hover{background-color:color-mix(in oklab,var(--c) 88%,var(--ind-foreground))}
.ind-btn:active{transform:translate(var(--off),var(--off));box-shadow:0 0 0 0 var(--ind-shadow)}
.ind-btn:focus-visible,.ind-switch:focus-visible{outline:2px solid var(--ind-foreground);outline-offset:3px}
.ind-btn:disabled{opacity:.5;pointer-events:none}
.ind-btn[data-variant=hazard]{--c:var(--ind-hazard);--fg:var(--ind-hazard-fg);--bd:var(--ind-ink)}
.ind-btn[data-variant=steel]{--c:var(--ind-primary);--fg:var(--ind-primary-fg);--bd:color-mix(in oklab,var(--ind-primary) 72%,#000)}
.ind-btn[data-variant=danger]{--c:var(--ind-destructive);--fg:var(--ind-destructive-fg);--bd:var(--ind-ink)}
.ind-btn[data-variant=outline]{--c:transparent;--fg:var(--ind-foreground);--bd:var(--ind-foreground)}
.ind-btn[data-variant=ghost]{--c:transparent;--fg:var(--ind-foreground);--bd:transparent;box-shadow:none}
.ind-btn[data-variant=ghost]:hover{background-color:var(--ind-secondary)}

/* 吊牌：左侧切角 + 冲孔 + 金属孔圈；外层负责硬投影（clip-path 会裁掉 box-shadow） */
.ind-tag{display:inline-flex;vertical-align:middle;filter:drop-shadow(var(--off) var(--off) 0 var(--ind-shadow))}
.ind-tag-body{--c:var(--ind-secondary);--fg:var(--ind-foreground);position:relative;display:inline-flex;align-items:center;gap:.4rem;height:26px;padding:0 .8em 0 23px;border-radius:0 calc(var(--r-sm)*.7) calc(var(--r-sm)*.7) 0;
  background:var(--c);color:var(--fg);font:700 .68rem/1 var(--ind-mono),${CJK};letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;
  clip-path:polygon(8px 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px),0 8px);
  -webkit-mask:radial-gradient(circle at 12px 50%,transparent 0 2.6px,#000 3.2px);mask:radial-gradient(circle at 12px 50%,transparent 0 2.6px,#000 3.2px)}
.ind-tag-body::before{content:'';position:absolute;left:7px;top:50%;width:10px;height:10px;margin-top:-5px;border-radius:50%;box-shadow:inset 0 0 0 1.5px color-mix(in oklab,var(--fg) 50%,transparent)}
.ind-tag-body[data-tone=hazard]{--c:var(--ind-hazard);--fg:var(--ind-hazard-fg)}
.ind-tag-body[data-tone=steel]{--c:var(--ind-primary);--fg:var(--ind-primary-fg)}
.ind-tag-body[data-tone=ok]{--c:var(--ind-teal);--fg:var(--ind-teal-fg)}
.ind-tag-body[data-tone=danger]{--c:var(--ind-destructive);--fg:var(--ind-destructive-fg)}
.ind-tag-body[data-tone=ink]{--c:var(--ind-ink);--fg:#f0f0f0}

/* 输入框：亮面嵌在钢框里，数值用等宽字体 */
.ind-field{display:grid;gap:.5rem}
.ind-input-wrap{position:relative;display:flex;align-items:stretch}
.ind-input{width:100%;min-width:0;height:44px;padding:0 .9em;border-radius:var(--r-sm);border:2px solid var(--ind-edge);background:var(--field);color:var(--ind-foreground);font:500 .92rem var(--ind-mono),${CJK};
  box-shadow:inset 0 2px 0 rgb(0 0 0/.07);transition:border-color .15s ease-out,box-shadow .15s ease-out}
.ind-input-wrap .ind-input[data-unit=true]{border-radius:var(--r-sm) 0 0 var(--r-sm);border-right-width:0}
.ind-unit{display:grid;place-items:center;flex:none;min-width:44px;padding:0 .7em;border:2px solid var(--ind-edge);border-radius:0 var(--r-sm) var(--r-sm) 0;background:var(--ind-secondary);font:700 .72rem var(--ind-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ind-foreground)}
.ind-input::placeholder{color:var(--ind-mutedForeground)}
.ind-input:focus{outline:none;border-color:var(--ind-foreground);box-shadow:inset 0 2px 0 rgb(0 0 0/.07),0 0 0 3px color-mix(in oklab,var(--ind-hazard) 60%,transparent)}

/* 开关：凹槽轨道，打开时露出斜纹；滑块是带防滑纹的钢块 */
.ind-switch{position:relative;flex:none;width:56px;height:30px;padding:0;border-radius:var(--r-sm);border:2px solid var(--ind-edge);background:var(--well);cursor:pointer;overflow:hidden;box-shadow:inset 0 2px 3px rgb(0 0 0/.14)}
.ind-switch::before{content:'';position:absolute;inset:0;background:var(--stripes-sm);opacity:0;transition:opacity .15s ease-out}
.ind-switch::after{content:'';position:absolute;top:2px;left:2px;width:22px;height:22px;border-radius:calc(var(--r-sm)*.6);
  background:repeating-linear-gradient(90deg,rgb(0 0 0/.28) 0 1px,transparent 1px 4px) center/11px 10px no-repeat,linear-gradient(180deg,#fafafa,#b9b9b9);
  box-shadow:0 0 0 1px rgb(0 0 0/.35),1px 2px 0 var(--ind-shadow);transition:transform .14s ease-out}
.ind-switch[aria-checked=true]{border-color:var(--ind-ink)}
.ind-switch[aria-checked=true]::before{opacity:1}
.ind-switch[aria-checked=true]::after{transform:translateX(26px)}

/* 仪表条：凹槽 + 斜纹填充；运行中的斜纹像传送带一样慢慢移动 */
.ind-meter{position:relative;height:20px;border-radius:var(--r-sm);border:2px solid var(--ind-edge);background:var(--well);overflow:hidden;box-shadow:inset 0 2px 3px rgb(0 0 0/.14)}
.ind-meter-fill{position:absolute;top:0;bottom:0;left:0;width:var(--v);overflow:hidden;border-right:2px solid var(--ind-ink)}
.ind-meter-belt{position:absolute;top:0;bottom:0;left:calc(var(--ind-period)*-1);right:0;background:var(--stripes-sm)}
.ind-meter[data-running=true] .ind-meter-belt{animation:ind-belt 1.4s linear infinite}
.ind-meter-fill[data-tone=solid]{background:var(--ind-primary)}
@keyframes ind-belt{to{transform:translateX(var(--ind-period))}}

/* 告示牌：左缘一条斜纹 */
.ind-alert{--tone:var(--ind-hazard);--tone-fg:var(--ind-hazard-fg);position:relative;display:flex;gap:14px;align-items:flex-start;padding:14px 16px 14px 28px;border-radius:var(--r-sm);border:1px solid var(--ind-edge);background:var(--ind-card);box-shadow:inset 0 1px 0 var(--bevel),var(--hard);overflow:hidden}
.ind-alert::before{content:'';position:absolute;left:0;top:0;bottom:0;width:12px;border-right:2px solid var(--ind-ink);background:repeating-linear-gradient(var(--ind-angle),var(--tone) 0 var(--sw-sm),var(--tone-fg) 0 calc(var(--sw-sm)*2))}
.ind-alert[data-tone=danger]{--tone:var(--ind-destructive);--tone-fg:var(--ind-destructive-fg)}
.ind-alert[data-tone=info]{--tone:var(--ind-primary);--tone-fg:var(--ind-primary-fg)}
.ind-alert-icon{flex:none;margin-top:1px}
.ind-alert-title{margin:0;font:700 .78rem/1.3 var(--ind-mono),${CJK};letter-spacing:.12em;text-transform:uppercase}
.ind-alert-body{margin:.25rem 0 0;font-size:.88rem;color:var(--ind-mutedForeground)}

/* 状态灯 */
.ind-lamp{display:inline-block;flex:none;width:10px;height:10px;border-radius:50%;background:var(--c,var(--ind-teal));box-shadow:0 0 0 2px var(--ind-ink),inset -1px -2px 0 rgb(0 0 0/.25),inset 1px 1px 0 rgb(255 255 255/.45)}

@media (prefers-reduced-motion:reduce){.ind-btn,.ind-input,.ind-switch::before,.ind-switch::after{transition:none}.ind-meter[data-running=true] .ind-meter-belt{animation:none}}
}`

export function StyleIndustrial({ className, style, children, ...props }: StyleIndustrialProps) {
  const { hazardColor, steelTone, stripeAngle, stripeWidth, rivets, radius, displayFont, shadowOffset } = { ...defaults, ...props }
  const tone = steelTone === 'dark' ? 'dark' : 'light'
  const palette = palettes[tone]
  const font = displayFonts[displayFont as keyof typeof displayFonts] ?? displayFonts.archivo
  const vars: Record<string, string | number> = {}
  for (const [name, value] of Object.entries(palette)) vars[`--ind-${name}`] = value
  vars['--ind-ink'] = INK
  vars['--ind-hazard'] = hazardColor
  vars['--ind-hazard-fg'] = inkOn(hazardColor)
  // 斜纹的第二色：浅警示色配墨色，深警示色配预设亮色底色，保证斜纹任何时候都看得见。
  vars['--ind-stripe'] = inkOn(hazardColor, '#f0f0f0')
  vars['--ind-primary-fg'] = inkOn(palette.primary)
  vars['--ind-destructive-fg'] = inkOn(palette.destructive)
  vars['--ind-teal-fg'] = inkOn(palette.teal)
  vars['--ind-angle'] = `${stripeAngle}deg`
  vars['--ind-sw'] = `${stripeWidth}px`
  // 传送带一个周期在水平方向上的长度：小斜纹的周期（= stripeWidth）除以 sin(角度)。
  vars['--ind-period'] = `${(stripeWidth / Math.sin((Math.max(20, stripeAngle) * Math.PI) / 180)).toFixed(3)}px`
  vars['--ind-radius'] = `${radius}px`
  vars['--ind-off'] = `${shadowOffset}px`
  vars['--ind-display'] = font.family
  vars['--ind-dw'] = font.weight
  vars['--ind-track'] = font.tracking
  vars['--ind-body'] = BODY
  vars['--ind-mono'] = MONO
  return (
    <div className={cn('ind', className)} data-tone={tone} data-rivets={rivets ? 'on' : 'off'} style={{ ...vars, ...style } as CSSProperties}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 黄黑斜纹警示带。`edge` 在上下各加一道墨线。 */
export function HazardStripe({ height = 14, edge = false, className, style }: { height?: number; edge?: boolean; className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cn('ind-hazard', className)} data-edge={edge} style={{ '--h': `${height}px`, ...style } as CSSProperties} />
}

/** 钢板面板。`rivets={false}` 单独去掉这一块的铆钉。 */
export type PanelProps = HTMLAttributes<HTMLDivElement> & { rivets?: boolean }
export function Panel({ className, rivets, ...rest }: PanelProps) {
  return <div className={cn('ind-panel', className)} data-rivets={rivets === false ? 'off' : undefined} {...rest} />
}
export const PanelTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('ind-panel-title', className)} {...rest} />
export const PanelDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('ind-panel-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'hazard' | 'steel' | 'plain' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'plain', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('ind-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

/** 吊牌徽标：切角、冲孔、硬投影。 */
export type TagProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'plain' | 'hazard' | 'steel' | 'ok' | 'danger' | 'ink' }
export function Tag({ className, tone = 'plain', children, ...rest }: TagProps) {
  return (
    <span className={cn('ind-tag', className)} {...rest}>
      <span className="ind-tag-body" data-tone={tone}>
        {children}
      </span>
    </span>
  )
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; unit?: string }
export function Input({ className, label, unit, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('ind-input', className)} data-unit={unit ? true : undefined} {...rest} />
  const control = unit ? (
    <div className="ind-input-wrap">
      {input}
      <span className="ind-unit" aria-hidden>
        {unit}
      </span>
    </div>
  ) : (
    input
  )
  if (!label) return control
  return (
    <div className="ind-field">
      <label className="ind-label" htmlFor={inputId}>
        {label}
        {unit ? <span className="sr-only"> ({unit})</span> : null}
      </label>
      {control}
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('ind-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

/** 仪表条（role=meter）。`running` 时斜纹缓慢移动，`solid` 改用钢灰实色填充。 */
export type MeterProps = { value: number; max?: number; label: string; running?: boolean; solid?: boolean; className?: string }
export function Meter({ value, max = 100, label, running = false, solid = false, className }: MeterProps) {
  const ratio = Math.min(1, Math.max(0, value / max))
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className={cn('ind-meter', className)} data-running={running}>
      <div className="ind-meter-fill" data-tone={solid ? 'solid' : undefined} style={{ '--v': `${ratio * 100}%` } as CSSProperties}>
        {solid ? null : <div className="ind-meter-belt" />}
      </div>
    </div>
  )
}

const ALERT_ICONS = {
  warning: (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d="M12 2.8 22.4 20.6H1.6Z" fill="var(--tone)" stroke="var(--ind-ink)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v5.6M12 17.2v.1" stroke="var(--tone-fg)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="2" fill="var(--tone)" stroke="var(--ind-ink)" strokeWidth="1.8" />
      <path d="M12 11v6M12 7.4v.1" stroke="var(--tone-fg)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { tone?: 'warning' | 'danger' | 'info'; title: string }
export function Alert({ className, tone = 'warning', title, children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'info' ? 'status' : 'alert'} className={cn('ind-alert', className)} data-tone={tone} {...rest}>
      <span className="ind-alert-icon">{tone === 'info' ? ALERT_ICONS.info : ALERT_ICONS.warning}</span>
      <div className="min-w-0">
        <p className="ind-alert-title">{title}</p>
        {children ? <p className="ind-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

/** 状态灯。`color` 默认是预设里的青钢色。 */
export function Lamp({ color, className }: { color?: string; className?: string }) {
  return <span aria-hidden className={cn('ind-lamp', className)} style={color ? ({ '--c': color } as CSSProperties) : undefined} />
}
