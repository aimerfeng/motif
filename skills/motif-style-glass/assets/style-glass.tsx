import { cn } from '@/lib/motif-runtime'
import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  radius: 22,
  borderWidth: 1,
  blur: 26,
  depth: 0.6,
  fontPairing: 'geist',
  dark: true,
}
/* @motif:end */

export type StyleGlassProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 字体搭配：display 用于标题，body 用于正文，mono 用于数字与标签。 */
export const fontPairings = {
  geist: { display: "'Geist Variable'", body: "'Geist Variable'", mono: "'Geist Mono Variable'" },
  jakarta: { display: "'Plus Jakarta Sans Variable'", body: "'Plus Jakarta Sans Variable'", mono: "'Geist Mono Variable'" },
  outfit: { display: "'Outfit Variable'", body: "'Manrope Variable'", mono: "'Geist Mono Variable'" },
  grotesk: { display: "'Space Grotesk Variable'", body: "'Manrope Variable'", mono: "'Geist Mono Variable'" },
} as const

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

/** 在任意底色上挑一个可读的前景色（WCAG 相对亮度）。 */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.34 ? '#0b0d1f' : '#ffffff'
}

/*
 * 玻璃风格的全部规则都在这里，用 CSS 变量参数化。
 * 嵌套规则：只有最外层的面板（.mg-glass）使用 backdrop-filter；面板里面的按钮、输入框只用半透明填充，
 * 因为 backdrop-filter 不会穿透另一层 backdrop-filter 去模糊真正的背景。
 * 不支持 backdrop-filter 的浏览器退回到实色面板（见文末 @supports）。
 * 全部规则放在 @layer components 里，这样调用方的 Tailwind 工具类（p-*、rounded-*、absolute）总能覆盖它。
 */
const CSS = `@layer components{
.mg{position:relative;isolation:isolate;min-height:100%;color:var(--g-fg);background:var(--g-bg);font-family:var(--g-body),${CJK};font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;
  --g-accent-2:var(--g-accent);--g-accent-3:var(--g-accent);
  --g-r:var(--g-radius);--g-r-md:calc(var(--g-radius)*.7);--g-r-sm:calc(var(--g-radius)*.45);
  --g-ok:#4ade80;--g-warn:#fbbf24;--g-bad:#fb7185}
@supports (color:oklch(from red l c h)){.mg{--g-accent-2:oklch(from var(--g-accent) l c calc(h + 62));--g-accent-3:oklch(from var(--g-accent) l c calc(h - 74))}}
.mg *,.mg *::before,.mg *::after{box-sizing:border-box}
.mg[data-mode=dark]{--g-bg:#070813;--g-fg:rgb(255 255 255/.95);--g-muted:rgb(255 255 255/.64);--g-faint:rgb(255 255 255/.4);
  --g-panel-a:rgb(255 255 255/.15);--g-panel-b:rgb(255 255 255/.04);--g-line:rgb(255 255 255/.15);--g-rim:rgb(255 255 255/.6);
  --g-fill:rgb(255 255 255/.08);--g-fill-hi:rgb(255 255 255/.15);--g-well:rgb(4 5 20/.34);--g-shade:0 0 0;--g-spec:.34;--g-solid:#171a2e;--g-aurora:.9}
.mg[data-mode=light]{--g-bg:#e9edfb;--g-fg:#12162f;--g-muted:rgb(18 22 47/.66);--g-faint:rgb(18 22 47/.42);
  --g-panel-a:rgb(255 255 255/.78);--g-panel-b:rgb(255 255 255/.36);--g-line:rgb(255 255 255/.8);--g-rim:rgb(255 255 255/1);
  --g-fill:rgb(255 255 255/.5);--g-fill-hi:rgb(255 255 255/.85);--g-well:rgb(255 255 255/.55);--g-shade:52 62 130;--g-spec:.9;--g-solid:#f4f6ff;--g-aurora:.55}

/* 背景：固定在视口里的极光，玻璃面板从它上面滑过 */
.mg-aurora{position:sticky;top:0;height:100vh;margin-bottom:-100vh;z-index:-1;overflow:hidden;pointer-events:none}
.mg-aurora i{position:absolute;border-radius:50%;filter:blur(60px);opacity:var(--g-aurora);will-change:transform}
.mg-aurora i:nth-child(1){width:640px;height:640px;left:-8%;top:-24%;background:radial-gradient(closest-side,var(--g-accent),transparent)}
.mg-aurora i:nth-child(2){width:560px;height:560px;right:-6%;top:4%;background:radial-gradient(closest-side,var(--g-accent-2),transparent)}
.mg-aurora i:nth-child(3){width:620px;height:620px;left:26%;bottom:-34%;background:radial-gradient(closest-side,var(--g-accent-3),transparent)}
.mg-aurora::after{content:'';position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,transparent 45%,rgb(var(--g-shade)/.22))}
@media (prefers-reduced-motion:no-preference){
  .mg-aurora i:nth-child(1){animation:mg-drift-a 26s ease-in-out infinite alternate}
  .mg-aurora i:nth-child(2){animation:mg-drift-b 32s ease-in-out infinite alternate}
  .mg-aurora i:nth-child(3){animation:mg-drift-a 38s ease-in-out infinite alternate-reverse}
}
@keyframes mg-drift-a{to{transform:translate3d(90px,60px,0) scale(1.08)}}
@keyframes mg-drift-b{to{transform:translate3d(-80px,90px,0) scale(.94)}}
.mg-content{position:relative;z-index:1}

/* 玻璃面板：渐变填充 + 模糊 + 顶部镜面高光 + 渐变描边 */
.mg-glass{position:relative;border-radius:var(--g-r);border:var(--g-bw) solid var(--g-line);
  background:linear-gradient(145deg,var(--g-panel-a),var(--g-panel-b) 58%,var(--g-panel-a));
  -webkit-backdrop-filter:blur(var(--g-blur)) saturate(175%);backdrop-filter:blur(var(--g-blur)) saturate(175%);
  box-shadow:inset 0 1px 0 rgb(255 255 255/var(--g-spec)),inset 0 -1px 0 rgb(255 255 255/.05),
    0 calc(30px*var(--g-depth)) calc(70px*var(--g-depth)) calc(-18px*var(--g-depth)) rgb(var(--g-shade)/calc(.55*var(--g-depth))),
    0 calc(4px*var(--g-depth)) calc(14px*var(--g-depth)) rgb(var(--g-shade)/calc(.22*var(--g-depth)))}
.mg-glass::before{content:'';position:absolute;inset:calc(var(--g-bw)*-1);border-radius:inherit;padding:var(--g-bw);pointer-events:none;
  background:linear-gradient(155deg,var(--g-rim),transparent 28%,transparent 68%,rgb(255 255 255/.28));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);opacity:.75}
.mg-glass::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(130% 70% at 12% -8%,rgb(255 255 255/.2),transparent 58%)}
.mg-card{padding:22px}
.mg-card>*{position:relative;z-index:1}
.mg-card-title{margin:0;font:600 1.1rem/1.25 var(--g-display),${CJK};letter-spacing:-.02em}
.mg-card-desc{margin:.3rem 0 0;color:var(--g-muted);font-size:.9rem}

/* 文字 */
.mg-display{font-family:var(--g-display),${CJK};font-weight:600;letter-spacing:-.035em;line-height:1.02}
.mg-mono{font-family:var(--g-mono),ui-monospace,monospace;font-feature-settings:'tnum'}
.mg-muted{color:var(--g-muted)}.mg-faint{color:var(--g-faint)}
.mg-eyebrow{font:500 .72rem/1 var(--g-mono),ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--g-faint)}
.mg-grad-text{background:linear-gradient(120deg,var(--g-fg) 20%,var(--g-accent-2) 60%,var(--g-accent-3));-webkit-background-clip:text;background-clip:text;color:transparent}

/* 按钮 */
.mg-btn{--h:40px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:var(--h);padding:0 1.15em;border-radius:var(--g-r-md);
  border:var(--g-bw) solid transparent;color:var(--g-fg);font:600 .9rem/1 var(--g-body),${CJK};letter-spacing:-.005em;white-space:nowrap;cursor:pointer;text-decoration:none;
  transition:transform .2s cubic-bezier(.2,.8,.2,1),background-color .2s,box-shadow .2s,filter .2s,border-color .2s}
.mg-btn[data-size=sm]{--h:32px;font-size:.82rem;padding:0 .95em}
.mg-btn[data-size=lg]{--h:48px;font-size:1rem;padding:0 1.5em}
.mg-btn:hover{transform:translateY(-1px)}.mg-btn:active{transform:translateY(0) scale(.975)}
.mg-btn:focus-visible,.mg-input:focus-visible,.mg-tab:focus-visible,.mg-switch:focus-visible{outline:2px solid var(--g-accent);outline-offset:3px}
.mg-btn:disabled{opacity:.45;pointer-events:none}
.mg-btn[data-variant=primary]{color:var(--g-accent-fg);background:linear-gradient(180deg,color-mix(in oklab,var(--g-accent) 74%,#fff),var(--g-accent) 55%,color-mix(in oklab,var(--g-accent) 82%,#000));
  border-color:color-mix(in oklab,var(--g-accent) 60%,#fff);
  box-shadow:inset 0 1px 0 rgb(255 255 255/.55),inset 0 -1px 0 rgb(0 0 0/.14),0 calc(10px*var(--g-depth) + 2px) calc(28px*var(--g-depth) + 4px) -8px color-mix(in oklab,var(--g-accent) 85%,transparent)}
.mg-btn[data-variant=primary]:hover{filter:brightness(1.07) saturate(1.05)}
.mg-btn[data-variant=glass]{background:linear-gradient(180deg,var(--g-fill-hi),var(--g-fill));border-color:var(--g-line);box-shadow:inset 0 1px 0 rgb(255 255 255/calc(var(--g-spec)*.85)),0 calc(6px*var(--g-depth)) calc(16px*var(--g-depth)) -6px rgb(var(--g-shade)/.4)}
.mg-btn[data-variant=glass]:hover{background:linear-gradient(180deg,var(--g-panel-a),var(--g-fill-hi))}
.mg-btn[data-variant=ghost]{background:transparent;color:var(--g-muted)}
.mg-btn[data-variant=ghost]:hover{background:var(--g-fill);color:var(--g-fg)}

/* 输入框 */
.mg-field{display:grid;gap:.4rem}
.mg-label{font-size:.8rem;font-weight:500;color:var(--g-muted)}
.mg-input{width:100%;height:42px;padding:0 .95em;border-radius:var(--g-r-md);border:var(--g-bw) solid var(--g-line);background:var(--g-well);color:var(--g-fg);font:500 .92rem var(--g-body),${CJK};
  box-shadow:inset 0 1.5px 3px rgb(var(--g-shade)/.28),0 1px 0 rgb(255 255 255/.08);transition:border-color .2s,box-shadow .2s,background-color .2s}
.mg-input::placeholder{color:var(--g-faint)}
.mg-input:hover{border-color:color-mix(in oklab,var(--g-line) 60%,var(--g-accent))}
.mg-input:focus{outline:none;border-color:var(--g-accent);box-shadow:inset 0 1.5px 3px rgb(var(--g-shade)/.2),0 0 0 3px color-mix(in oklab,var(--g-accent) 32%,transparent)}

/* 徽标 */
.mg-badge{--tone:var(--g-fg);display:inline-flex;align-items:center;gap:.4rem;height:24px;padding:0 .7em;border-radius:999px;font:600 .72rem/1 var(--g-body),${CJK};letter-spacing:.01em;color:color-mix(in oklab,var(--tone) 55%,var(--g-fg));
  background:color-mix(in oklab,var(--tone) 14%,transparent);border:var(--g-bw) solid color-mix(in oklab,var(--tone) 30%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255/.16)}
.mg-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--tone);box-shadow:0 0 8px var(--tone)}
.mg-badge[data-tone=accent]{--tone:var(--g-accent)}.mg-badge[data-tone=success]{--tone:var(--g-ok)}.mg-badge[data-tone=warning]{--tone:var(--g-warn)}.mg-badge[data-tone=danger]{--tone:var(--g-bad)}

/* 分段选项卡：滑块用 transform 移动 */
.mg-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);padding:4px;border-radius:var(--g-r-md);background:var(--g-well);border:var(--g-bw) solid var(--g-line);box-shadow:inset 0 1.5px 3px rgb(var(--g-shade)/.25)}
.mg-tab-thumb{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px)/var(--n));border-radius:calc(var(--g-r-md) - 4px);transform:translateX(calc(var(--i)*100%));
  background:linear-gradient(180deg,var(--g-fill-hi),var(--g-fill));border:var(--g-bw) solid var(--g-line);box-shadow:inset 0 1px 0 rgb(255 255 255/var(--g-spec)),0 4px 12px -3px rgb(var(--g-shade)/.45);transition:transform .34s cubic-bezier(.3,1.25,.5,1)}
.mg-tab{position:relative;z-index:1;height:34px;border:0;background:transparent;color:var(--g-muted);font:600 .84rem var(--g-body),${CJK};cursor:pointer;border-radius:calc(var(--g-r-md) - 4px);transition:color .2s}
.mg-tab[aria-selected=true]{color:var(--g-fg)}
.mg-tab:hover{color:var(--g-fg)}

/* 提示条 */
.mg-alert{--tone:var(--g-accent);display:flex;gap:.85rem;align-items:flex-start;padding:16px 18px;border-radius:var(--g-r-md)}
.mg-alert[data-tone=success]{--tone:var(--g-ok)}.mg-alert[data-tone=warning]{--tone:var(--g-warn)}.mg-alert[data-tone=danger]{--tone:var(--g-bad)}
.mg-alert>*{position:relative;z-index:1}
.mg-alert-icon{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;color:var(--tone);background:color-mix(in oklab,var(--tone) 18%,transparent);box-shadow:inset 0 1px 0 rgb(255 255 255/.25),0 0 18px -2px color-mix(in oklab,var(--tone) 70%,transparent)}
.mg-alert-title{margin:0;font-weight:600;font-size:.92rem}.mg-alert-body{margin:.15rem 0 0;font-size:.86rem;color:var(--g-muted)}

/* 开关 */
.mg-switch{position:relative;flex:none;width:46px;height:28px;padding:0;border-radius:999px;border:var(--g-bw) solid var(--g-line);background:var(--g-well);cursor:pointer;box-shadow:inset 0 1.5px 3px rgb(var(--g-shade)/.3);transition:background-color .25s,border-color .25s}
.mg-switch::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:linear-gradient(180deg,#fff,#dfe3f5);box-shadow:0 2px 6px rgb(var(--g-shade)/.5),inset 0 -1px 1px rgb(0 0 0/.1);transition:transform .3s cubic-bezier(.3,1.3,.5,1)}
.mg-switch[aria-checked=true]{background:linear-gradient(180deg,color-mix(in oklab,var(--g-accent) 80%,#fff),var(--g-accent));border-color:color-mix(in oklab,var(--g-accent) 60%,#fff)}
.mg-switch[aria-checked=true]::after{transform:translateX(18px)}

/* 退路：没有 backdrop-filter 时，面板换成实色 */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .mg-glass{background:linear-gradient(145deg,color-mix(in oklab,var(--g-solid) 92%,#fff),var(--g-solid))}
}
@media (prefers-reduced-transparency:reduce){
  .mg-glass{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--g-solid)}
}
@media (prefers-reduced-motion:reduce){
  .mg-btn,.mg-tab-thumb,.mg-switch::after{transition:none}
}
}`

export function StyleGlass({ className, style, children, ...props }: StyleGlassProps) {
  const { accent, radius, borderWidth, blur, depth, fontPairing, dark } = { ...defaults, ...props }
  const fonts = fontPairings[fontPairing as keyof typeof fontPairings] ?? fontPairings.geist
  const vars = {
    '--g-accent': accent,
    '--g-accent-fg': readableOn(accent),
    '--g-radius': `${radius}px`,
    '--g-bw': `${borderWidth}px`,
    '--g-blur': `${blur}px`,
    '--g-depth': depth,
    '--g-display': fonts.display,
    '--g-body': fonts.body,
    '--g-mono': fonts.mono,
    ...style,
  } as CSSProperties
  return (
    <div className={cn('mg', className)} data-mode={dark ? 'dark' : 'light'} style={vars}>
      <style>{CSS}</style>
      <div className="mg-aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="mg-content">{children}</div>
    </div>
  )
}

/** 任意玻璃面板（导航条、浮层、小组件）。 */
export function Glass({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mg-glass', className)} {...rest} />
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mg-glass mg-card', className)} {...rest} />
}
export const CardTitle = ({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('mg-card-title', className)} {...rest} />
export const CardDescription = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('mg-card-desc', className)} {...rest} />

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'glass' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'glass', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('mg-btn', className)} data-variant={variant} data-size={size} {...rest} />
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }
export function Input({ className, label, id, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const input = <input id={inputId} className={cn('mg-input', className)} {...rest} />
  if (!label) return input
  return (
    <div className="mg-field">
      <label className="mg-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
    </div>
  )
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }
export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return <span className={cn('mg-badge', className)} data-tone={tone} {...rest} />
}

export type TabsProps = { items: { id: string; label: string }[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; className?: string; label?: string }
/** 分段选项卡：方向键切换，Home / End 跳到两端。 */
export function Tabs({ items, value, defaultValue, onValueChange, className, label }: TabsProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id)
  const current = value ?? inner
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, items.findIndex((item) => item.id === current))
  const select = (i: number) => {
    const target = items[(i + items.length) % items.length]
    setInner(target.id)
    onValueChange?.(target.id)
    refs.current[(i + items.length) % items.length]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('mg-tabs', className)}
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
      <span className="mg-tab-thumb" aria-hidden />
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="tab"
          className="mg-tab"
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
    <div role="status" className={cn('mg-glass mg-alert', className)} data-tone={tone} {...rest}>
      <span className="mg-alert-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={path} />
        </svg>
      </span>
      <div>
        <p className="mg-alert-title">{title}</p>
        {children ? <p className="mg-alert-body">{children}</p> : null}
      </div>
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('mg-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}
