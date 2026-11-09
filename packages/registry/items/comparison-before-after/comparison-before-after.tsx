import { cn, useFrameLoop } from '@motif/runtime'
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Close the books in fourteen minutes, not six hours',
  product: 'Coppice',
  accent: '#6ee7b7',
  tone: 'dark',
  stepStyle: 'timeline',
  radius: 18,
  mode: 'switch',
  showTimeSaved: true,
}
/* @motif:end */

export type CompareSide = 'before' | 'after'

export type ComparisonBeforeAfterProps = Partial<typeof defaults> & {
  /** 受控：当前聚焦哪一边。 */
  focus?: CompareSide
  /** 非受控时一开始聚焦哪一边。 */
  defaultFocus?: CompareSide
  onFocusChange?: (focus: CompareSide) => void
  className?: string
  style?: CSSProperties
}

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, 'SFMono-Regular', monospace"
const EASE = [0.16, 1, 0.3, 1] as const

// ---- 内容：同一件事（一次月末结账）新旧两种做法，时间按「每次结账的实际动手时间」计。换成自己的流程时只改这里。 ----
type Tool = 'bank' | 'chat' | 'sheet' | 'mail' | 'ledger' | 'card' | 'receipt'

interface Step {
  title: string
  tool?: Tool
  note: string
  minutes: number
}

const TOOLS: Record<Tool, { name: string; glyph: ReactNode }> = {
  bank: { name: 'Bank portal', glyph: <path d="M2.5 6.2 8 3l5.5 3.2M4 7.4v4.4M6.7 7.4v4.4M9.3 7.4v4.4M12 7.4v4.4M2.5 13h11" /> },
  chat: { name: 'Team chat', glyph: <path d="M3.2 3.5h9.6A1.2 1.2 0 0 1 14 4.7v5.6a1.2 1.2 0 0 1-1.2 1.2H7.6l-2.8 2.1v-2.1H3.2A1.2 1.2 0 0 1 2 10.3V4.7a1.2 1.2 0 0 1 1.2-1.2z" /> },
  sheet: {
    name: 'Spreadsheet',
    glyph: (
      <>
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.6" />
        <path d="M2.5 6.5h11M2.5 10h11M6.3 2.5v11" />
      </>
    ),
  },
  mail: {
    name: 'Email',
    glyph: (
      <>
        <rect x="2" y="3.5" width="12" height="9" rx="1.6" />
        <path d="m2.6 4.6 5.4 4.2 5.4-4.2" />
      </>
    ),
  },
  ledger: {
    name: 'Accounting app',
    glyph: (
      <>
        <path d="M4 3.6a1.1 1.1 0 0 1 1.1-1.1h7.4v9.4H5.4A1.4 1.4 0 0 0 4 13.3z" />
        <path d="M4 13.3a1.4 1.4 0 0 1 1.4-1.4h7.1v1.6H5.4M6.6 5.6h3.6" />
      </>
    ),
  },
  card: {
    name: 'Company cards',
    glyph: (
      <>
        <rect x="1.8" y="3.8" width="12.4" height="8.4" rx="1.6" />
        <path d="M1.8 6.8h12.4M4.2 9.9h2.6" />
      </>
    ),
  },
  receipt: {
    name: 'Receipts',
    glyph: (
      <>
        <path d="M4 2.2h8v11.6l-1.6-1-1.6 1-1.6-1-1.6 1-1.6-1z" />
        <path d="M6 5.4h4M6 7.8h4M6 10.2h2.2" />
      </>
    ),
  },
}

const BEFORE: Step[] = [
  { title: 'Download card statements', tool: 'bank', note: 'Three cards, three CSV layouts', minutes: 20 },
  { title: 'Chase missing receipts', tool: 'chat', note: '23 pings sent, 6 never answered', minutes: 95 },
  { title: 'Match receipts to lines', tool: 'sheet', note: 'Duplicate amounts break the lookup', minutes: 130 },
  { title: 'Code each line to an account', tool: 'sheet', note: 'One vendor, three different codes', minutes: 45 },
  { title: 'Collect manager approvals', tool: 'mail', note: 'Then two days in someone’s inbox', minutes: 30 },
  { title: 'Re-key totals into the ledger', tool: 'ledger', note: 'Typos surface at audit', minutes: 55 },
]

const AFTER: Step[] = [
  { title: 'Review 7 flagged lines', note: 'The other 412 matched as receipts arrived', minutes: 9 },
  { title: 'Nudge two missing receipts', note: 'One reminder, sent from the close checklist', minutes: 2 },
  { title: 'Approve and post', note: 'Coded lines reach the ledger in one batch', minutes: 3 },
]

/** 新做法里不用再动手的旧步骤。 */
const HANDLED = ['Statement downloads', 'Receipt chasing', 'Line matching', 'Account coding', 'Re-keying totals']

/** 旧做法在工具之间的往返（下标指向 BEFORE_TOOLS），画成一团来回绕的线。 */
const HOPS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 1],
  [1, 3],
  [3, 2],
  [2, 4],
]

const BEFORE_TOOLS = [...new Set(BEFORE.flatMap((step) => (step.tool ? [step.tool] : [])))]
const AFTER_ROUTE: (Tool | 'mark')[] = ['card', 'receipt', 'mark', 'ledger']
const BEFORE_MIN = BEFORE.reduce((sum, step) => sum + step.minutes, 0)
const AFTER_MIN = AFTER.reduce((sum, step) => sum + step.minutes, 0)
const SAVED_MIN = BEFORE_MIN - AFTER_MIN
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const word = (n: number) => WORDS[n] ?? String(n)
/** 标题参数清空时的兜底：区块用它做无障碍名称，不能是空的。 */
const FALLBACK_HEADING = 'Close the books in fourteen minutes, not six hours'

/** 「20 min」「2 h 10 min」。 */
function span(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h === 0 ? `${m} min` : `${h} h ${String(m).padStart(2, '0')} min`
}

// ---- 颜色：主色可以是任何值，文字用的主色按对比度往前景色方向混，填充上的文字按亮度选深浅。 ----
type RGB = [number, number, number]

function rgbOf(hex: string): RGB {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6)
  const value = Number.parseInt(full, 16)
  return Number.isFinite(value) ? [(value >> 16) & 255, (value >> 8) & 255, value & 255] : [128, 128, 128]
}

function luminance([r, g, b]: RGB) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: RGB, b: RGB) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const hexOf = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`

const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i]! - v) * t)) as RGB

/** 把颜色往 toward 混，直到在每个背景上都达到 min 的对比度。 */
function readable(color: RGB, backgrounds: RGB[], toward: RGB, min: number): RGB {
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const mixed = mix(color, toward, t)
    if (backgrounds.every((bg) => contrast(mixed, bg) >= min)) return mixed
  }
  return toward
}

/**
 * 与 c 亮度相同的灰。对比度只取决于亮度，所以未聚焦一侧换成这些灰之后，文字的对比度和彩色时一样。
 * 不用 CSS 的 grayscale()：它按 sRGB 加权，饱和的红、蓝会变暗很多，深色底上的主色文字会看不清。
 * 取整可能让对比度差一点点，给了 backgrounds 时再一级一级往 toward 推到达标。
 */
function greyOf(c: RGB, backgrounds: RGB[] = [], toward: RGB = [255, 255, 255], min = 0): RGB {
  const y = luminance(c)
  const s = y <= 0.0031308 ? y * 12.92 : 1.055 * y ** (1 / 2.4) - 0.055
  let v = Math.round(Math.min(1, Math.max(0, s)) * 255)
  const step = toward[0] > v ? 1 : -1
  while (v > 0 && v < 255 && !backgrounds.every((bg) => contrast([v, v, v], bg) >= min)) v += step
  return [v, v, v]
}

/** 褪色时换成灰的颜色变量：根上定义彩色（-c）和灰（-g），每个面板按聚焦程度在两者之间混。 */
const CHROMA = ['ac', 'fill', 'at', 'ui', 'warm', 'warm-bg'] as const

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone !== 'light'
  const bg = rgbOf(dark ? '#0b0c0f' : '#f3f2ed')
  const surface = rgbOf(dark ? '#121418' : '#ffffff')
  const raised = rgbOf(dark ? '#181b20' : '#f7f6f2')
  const toward: RGB = dark ? [255, 255, 255] : [0, 0, 0]
  const a = rgbOf(accent)
  const aGrey = greyOf(a)
  const warm = rgbOf(dark ? '#f0b45e' : '#a3500b')
  const warmGrey = greyOf(warm)
  const warmAlpha = dark ? 0.12 : 0.08
  // 文字要落在的底：页面、面板、卡片，以及时间标签的淡色底（主色 14%）。未聚焦一侧的底还盖着一半页面底色（见 veil），标签底是灰的。
  // 文字目标取 4.8 而不是 4.5：11–12px 的小字抗锯齿后，屏幕上实测会比理论值低 0.2–0.3。
  const veiled = [mix(surface, bg, 0.5), mix(raised, bg, 0.5)]
  const grounds = [bg, surface, raised, mix(surface, a, 0.14), mix(raised, a, 0.14)]
  const greyGrounds = (tint: RGB, alpha: number) => [bg, ...veiled, ...veiled.map((g) => mix(g, tint, alpha))]
  const white: RGB = [255, 255, 255]
  const black: RGB = [11, 12, 15]
  // 实心填充（序号、标、开关滑块、进度条）：主色和面板几乎一样亮时（深底配深色、浅底配淡黄）往前景色推一点，否则保持原色。
  let fill = contrast(a, surface) >= 1.6 ? a : readable(a, [surface], toward, 1.6)
  const inkRgb = contrast(white, fill) >= contrast(black, fill) ? white : black
  const awayFromInk: RGB = inkRgb === white ? [0, 0, 0] : white
  // 中等亮度的主色上，黑白两种字都只有 4.4:1 左右：把填充往远离字色的方向推一点，序号保证对比度。
  fill = readable(fill, [inkRgb], awayFromInk, 4.6)
  const at = readable(a, grounds, toward, 4.8)
  const ui = readable(a, grounds, toward, 3)
  const colors: Record<(typeof CHROMA)[number], [string, string]> = {
    ac: [hexOf(a), hexOf(aGrey)],
    fill: [hexOf(fill), hexOf(greyOf(fill, [inkRgb], awayFromInk, 4.6))],
    at: [hexOf(at), hexOf(greyOf(at, greyGrounds(aGrey, 0.14), toward, 4.8))],
    ui: [hexOf(ui), hexOf(greyOf(ui, greyGrounds(aGrey, 0.14), toward, 3))],
    // 旧做法的「卡点」色：固定的琥珀色，深浅两种底上都过 4.5:1。
    warm: [hexOf(warm), hexOf(greyOf(warm, greyGrounds(warmGrey, warmAlpha), toward, 4.8))],
    'warm-bg': [`rgba(${warm.join(',')},${warmAlpha})`, `rgba(${warmGrey.join(',')},${warmAlpha})`],
  }
  const chroma: Record<string, string> = {}
  for (const key of CHROMA) {
    const [color, grey] = colors[key]
    chroma[`--ba-${key}`] = color
    chroma[`--ba-${key}-c`] = color
    chroma[`--ba-${key}-g`] = grey
  }
  return {
    '--ba-bg': hexOf(bg),
    '--ba-sf': hexOf(surface),
    '--ba-sf2': hexOf(raised),
    '--ba-fg': dark ? '#f2f2ee' : '#121316',
    // 未聚焦一侧的标题色：比前景色淡，但仍在 9:1 以上。
    '--ba-dim': dark ? 'rgba(242,242,238,0.78)' : 'rgba(18,19,22,0.8)',
    '--ba-mu': dark ? 'rgba(242,242,238,0.6)' : 'rgba(18,19,22,0.62)',
    '--ba-ln': dark ? 'rgba(255,255,255,0.08)' : 'rgba(18,19,22,0.1)',
    '--ba-ln2': dark ? 'rgba(255,255,255,0.2)' : 'rgba(18,19,22,0.24)',
    '--ba-track': dark ? '#0d0e11' : '#e8e7e1',
    '--ba-knob': dark ? '#262a31' : '#ffffff',
    ...chroma,
    '--ba-ink': hexOf(inkRgb),
    '--ba-glow': dark ? '20%' : '12%',
    '--ba-shadow': dark ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -42px rgba(0,0,0,0.85)' : '0 1px 0 rgba(255,255,255,0.8) inset, 0 26px 50px -38px rgba(30,28,20,0.28)',
  } as CSSProperties
}

/** 面板里的彩色变量：weight 为 1 时是原色，为 0 时是等亮度的灰（见 greyOf）。 */
function faded(weight: string): CSSProperties {
  const vars: Record<string, string> = {}
  for (const key of CHROMA) vars[`--ba-${key}`] = `color-mix(in oklab, var(--ba-${key}-c) calc(${weight} * 100%), var(--ba-${key}-g))`
  return vars as CSSProperties
}

function Glyph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-3.5 shrink-0', className)} {...{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden>
      {children}
    </svg>
  )
}

/** 虚构产品的标：几根冒出来的新枝（coppice 是「截干萌枝」）。 */
function Mark({ size = 30, round = 9 }: { size?: number; round?: number }) {
  return (
    <span className="grid shrink-0 place-items-center" style={{ width: size, height: size, borderRadius: round, background: 'var(--ba-fill)', color: 'var(--ba-ink)' }}>
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M5 11.6V8.4M8 11.6V4.6M11 11.6V7M3.6 12.4h8.8" />
      </svg>
    </span>
  )
}

/** 工具之间的路线：旧做法是一团来回的弧线，新做法是一条直线。虚线的流动由外面每帧写入 --ba-o。 */
function Route({ side, round, svgRef }: { side: CompareSide; round: number; svgRef: (el: SVGSVGElement | null) => void }) {
  const before = side === 'before'
  const cells: (Tool | 'mark')[] = before ? BEFORE_TOOLS : AFTER_ROUTE
  const n = cells.length
  const x = (i: number) => ((i + 0.5) / n) * 100
  return (
    <div className="relative h-9 lg:h-8" aria-hidden>
      <svg ref={svgRef} viewBox="0 0 100 36" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" fill="none">
        {before ? (
          HOPS.map(([a, b], i) => {
            const lift = (7 + 4 * Math.abs(b - a)) * (i % 2 === 0 ? -1 : 1)
            return (
              <path
                key={i}
                d={`M${x(a)} 18Q${(x(a) + x(b)) / 2} ${18 + 2 * lift} ${x(b)} 18`}
                stroke="var(--ba-warm)"
                strokeOpacity={0.62}
                strokeWidth="1.25"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
                style={{ strokeDashoffset: 'var(--ba-o, 0px)' }}
              />
            )
          })
        ) : (
          <>
            <path d={`M${x(0)} 18H${x(n - 1)}`} stroke="var(--ba-ui)" strokeOpacity={0.4} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d={`M${x(0)} 18H${x(n - 1)}`} stroke="var(--ba-fill)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1.5 9" vectorEffect="non-scaling-stroke" style={{ strokeDashoffset: 'var(--ba-o, 0px)' }} />
          </>
        )}
      </svg>
      <div className="relative grid h-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {cells.map((cell) => (
          <span key={cell} className="grid place-items-center">
            {cell === 'mark' ? (
              <Mark round={round} />
            ) : (
              <span className="grid size-7 place-items-center rounded-full border" style={{ background: 'var(--ba-sf2)', borderColor: 'var(--ba-ln)', color: before ? 'var(--ba-fg)' : 'var(--ba-mu)' }}>
                <Glyph>{TOOLS[cell].glyph}</Glyph>
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

interface Shape {
  node: number
  chip: number
  pill: number
}

function Node({ side, step, index, shape, small }: { side: CompareSide; step: Step; index: number; shape: Shape; small?: boolean }) {
  const size = small ? 24 : 28
  if (side === 'after') {
    return (
      <span className="relative z-10 grid shrink-0 place-items-center text-[12px] font-semibold tabular-nums" style={{ width: size, height: size, borderRadius: shape.node, background: 'var(--ba-fill)', color: 'var(--ba-ink)' }}>
        {index + 1}
      </span>
    )
  }
  return (
    <span className="relative z-10 grid shrink-0 place-items-center border" style={{ width: size, height: size, borderRadius: shape.node, background: 'var(--ba-sf2)', borderColor: 'var(--ba-ln2)', color: 'var(--ba-fg)' }}>
      {step.tool && <Glyph className={small ? 'size-3' : undefined}>{TOOLS[step.tool].glyph}</Glyph>}
    </span>
  )
}

function Time({ side, minutes, shape }: { side: CompareSide; minutes: number; shape: Shape }) {
  const before = side === 'before'
  return (
    <span
      className="shrink-0 px-1.5 text-[11.5px] leading-[19px] whitespace-nowrap tabular-nums"
      style={{ fontFamily: MONO, borderRadius: shape.pill, color: before ? 'var(--ba-warm)' : 'var(--ba-at)', background: before ? 'var(--ba-warm-bg)' : 'color-mix(in oklab, var(--ba-ac) 14%, transparent)' }}
    >
      {span(minutes)}
    </span>
  )
}

function StepText({ side, step, shape, compact }: { side: CompareSide; step: Step; shape: Shape; compact?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-px text-[14px] leading-5 font-medium text-pretty">{step.title}</p>
        <Time side={side} minutes={step.minutes} shape={shape} />
      </div>
      <p className={cn('mt-0.5 text-[12.5px] leading-[18px] text-pretty', compact && 'lg:mt-0')}>
        {step.tool && <span style={{ color: 'var(--ba-mu)' }}>{TOOLS[step.tool].name} · </span>}
        <span style={{ color: side === 'before' ? 'var(--ba-warm)' : 'var(--ba-mu)' }}>{step.note}</span>
      </p>
    </div>
  )
}

/** 旧做法的卡片故意摆得歪一点（角度、缩进），新做法的整整齐齐。 */
const JITTER: [number, number][] = [
  [-0.6, 0],
  [0.5, 12],
  [-0.35, 4],
  [0.7, 15],
  [-0.5, 6],
  [0.35, 11],
]

function Steps({ side, steps, variant, shape }: { side: CompareSide; steps: Step[]; variant: string; shape: Shape }) {
  const before = side === 'before'

  if (variant === 'receipt') {
    return (
      <ol className="space-y-[11px] pt-2">
        {steps.map((step, i) => (
          <li key={step.title}>
            <div className="flex items-baseline gap-2.5 text-[14px] leading-5">
              <span className="w-5 shrink-0 text-[11.5px] tabular-nums" style={{ fontFamily: MONO, color: 'var(--ba-mu)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 font-medium">{step.title}</span>
              <span aria-hidden className="min-w-3 flex-1 -translate-y-1 border-b border-dotted" style={{ borderColor: 'var(--ba-ln2)' }} />
              <span className="shrink-0 text-[12.5px] whitespace-nowrap tabular-nums" style={{ fontFamily: MONO, color: before ? 'var(--ba-warm)' : 'var(--ba-at)' }}>
                {span(step.minutes)}
              </span>
            </div>
            <p className="mt-0.5 pl-[30px] text-[12.5px] leading-[18px]">
              {step.tool && <span style={{ color: 'var(--ba-mu)' }}>{TOOLS[step.tool].name} · </span>}
              <span style={{ color: before ? 'var(--ba-warm)' : 'var(--ba-mu)' }}>{step.note}</span>
            </p>
          </li>
        ))}
      </ol>
    )
  }

  if (variant === 'cards') {
    return (
      <ol className="space-y-1.5 pt-2 lg:space-y-[3px] lg:pt-1">
        {steps.map((step, i) => {
          const [rotate, shift] = before ? (JITTER[i % JITTER.length] ?? [0, 0]) : [0, 0]
          return (
            <li
              key={step.title}
              className="flex gap-3 border px-3 py-2 lg:py-[5px]"
              style={{
                borderRadius: shape.chip,
                background: 'var(--ba-sf2)',
                borderColor: 'var(--ba-ln)',
                width: before ? 'calc(100% - 15px)' : undefined,
                transform: before ? `translateX(${shift}px) rotate(${rotate}deg)` : undefined,
                boxShadow: before ? undefined : 'inset 2px 0 0 var(--ba-fill)',
              }}
            >
              <Node side={side} step={step} index={i} shape={shape} small />
              <StepText side={side} step={step} shape={shape} compact />
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="relative pt-1">
      <span
        aria-hidden
        className="absolute top-[26px] bottom-[26px] left-[13.5px] w-px"
        style={before ? { backgroundImage: 'linear-gradient(var(--ba-ln2) 55%, transparent 0)', backgroundSize: '1px 6px' } : { background: 'color-mix(in oklab, var(--ba-ui) 60%, transparent)' }}
      />
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-3.5 py-[6px] lg:py-[5px]">
          <Node side={side} step={step} index={i} shape={shape} />
          <StepText side={side} step={step} shape={shape} />
        </li>
      ))}
    </ol>
  )
}

/** 「老办法 / 新办法」对比区块：开关或分隔条切换焦点，另一边褪成灰色，底部对比条上省下的那一段随之铺开。 */
export function ComparisonBeforeAfter({ focus, defaultFocus = 'before', onFocusChange, className, style, ...props }: ComparisonBeforeAfterProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const uid = useId()
  const heading = o.heading.trim() || FALLBACK_HEADING
  const product = o.product.trim() || 'the new way'
  const divider = o.mode === 'divider'
  const variant = o.stepStyle === 'cards' || o.stepStyle === 'receipt' ? o.stepStyle : 'timeline'
  const radius = Math.min(28, Math.max(0, o.radius))
  const shape: Shape = {
    node: radius <= 4 ? Math.max(2, radius) : 999,
    chip: Math.min(12, Math.max(2, radius * 0.5)),
    pill: radius <= 6 ? Math.max(2, radius * 0.5) : 999,
  }
  const track = radius >= 14 ? 999 : radius * 0.7 + 3
  const knob = track === 999 ? 999 : Math.max(2, track - 4)

  const [inner, setInner] = useState<CompareSide>(defaultFocus)
  const current = focus ?? inner
  const target = current === 'after' ? 1 : 0

  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const routes = useRef<(SVGSVGElement | null)[]>([])
  const radios = useRef<(HTMLButtonElement | null)[]>([])
  const drag = useRef<{ x: number; moved: boolean } | null>(null)
  // 每松开一次分隔条加一：让下面的 effect 在松开后按「当前的」目标归位（受控时父组件可能没有采纳这次切换）。
  const [release, setRelease] = useState(0)
  // f：0 聚焦旧做法，1 聚焦新做法，驱动褪色、分隔条位置和开关滑块；r：对比条上「省下的时间」铺开的进度和数字的高亮。
  const f = useMotionValue(target)
  const r = useMotionValue(target)

  const applyF = (v: number) => {
    const el = root.current
    if (!el) return
    el.style.setProperty('--ba-f', v.toFixed(4))
    if (!divider) return
    // 分隔条模式下聚焦的一边占 60%：fr 不能写进 calc，所以直接写好两列的值。
    // 这里有意动了布局（grid-template-columns）：分隔条就是可拖的分栏，文字要跟着栏宽重新排。
    // 用 transform 缩放会把字压扁，用 clip-path 会把未聚焦一侧的字截掉。只有两栏、二十来行文字，
    // 而且只在拖动和松手后 0.6 秒的弹簧里重排；开关模式完全不动布局。
    el.style.setProperty('--ba-l', `${(0.6 - 0.2 * v).toFixed(4)}fr`)
    el.style.setProperty('--ba-r', `${(0.4 + 0.2 * v).toFixed(4)}fr`)
  }
  const applyR = (v: number) => {
    root.current?.style.setProperty('--ba-r-p', v.toFixed(4))
  }
  useMotionValueEvent(f, 'change', applyF)
  useMotionValueEvent(r, 'change', applyR)
  useLayoutEffect(() => {
    applyF(f.get())
    applyR(r.get())
    // 挂载和切换方式时同步一次当前值，其余时候由 motion value 的 change 事件驱动。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divider])

  const settle = (to: number) => {
    if (reduced) {
      f.jump(to)
      r.jump(to)
      return
    }
    animate(f, to, { type: 'spring', visualDuration: 0.6, bounce: 0.12 })
    // 往新做法铺得慢一点（看得见省下的那一段在展开），退回旧做法时很快收起。
    animate(r, to, { duration: to > r.get() ? 1.4 : 0.45, ease: EASE })
  }

  // 归位只在这里发生：目标变了，或分隔条刚松开（release）。拖动中不打断手指。
  useEffect(() => {
    if (drag.current) return
    settle(target)
    // settle 每次渲染都是新函数，只需要在目标、减少动态效果或松手时触发。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced, release])

  const choose = (side: CompareSide) => {
    if (focus === undefined) setInner(side)
    if (side !== current) onFocusChange?.(side)
  }

  // 路线虚线缓缓流动：旧做法慢吞吞地绕，新做法顺畅地流过去。只写两个 SVG 的变量，不触发整块重算。
  useFrameLoop(
    root,
    ({ time }) => {
      const [a, b] = routes.current
      a?.style.setProperty('--ba-o', `${(-(time * 5) % 7).toFixed(2)}px`)
      b?.style.setProperty('--ba-o', `${(-(time * 16) % 10.5).toFixed(2)}px`)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  // ---- 分隔条：拖动时直接跟手，松开后弹到更近的一边；只点一下就切换。 ----
  const fromPointer = (clientX: number) => {
    const el = grid.current
    if (!el) return f.get()
    const rect = el.getBoundingClientRect()
    const share = (clientX - rect.left - 18) / Math.max(1, rect.width - 36)
    return Math.min(1, Math.max(0, (0.6 - share) / 0.2))
  }
  const onDividerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, moved: false }
  }
  const onDividerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.abs(event.clientX - d.x) < 4) return
    d.moved = true
    const v = fromPointer(event.clientX)
    f.jump(v)
    r.jump(v)
  }
  const onDividerUp = (cancelled: boolean) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (!d.moved) {
      if (!cancelled) choose(current === 'after' ? 'before' : 'after')
      return
    }
    // 拖过了：先提出切换，再让 effect 按渲染后的目标归位。父组件采纳了就弹到新的一边，
    // 没采纳（受控且忽略 onFocusChange）就弹回原来的一边，画面和 aria 状态始终一致。
    if (!cancelled) choose(f.get() > 0.5 ? 'after' : 'before')
    setRelease((n) => n + 1)
  }
  const onDividerKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, CompareSide | 'toggle'> = { ArrowLeft: 'after', ArrowDown: 'after', Home: 'after', ArrowRight: 'before', ArrowUp: 'before', End: 'before', Enter: 'toggle', ' ': 'toggle' }
    const next = map[event.key]
    if (!next) return
    event.preventDefault()
    choose(next === 'toggle' ? (current === 'after' ? 'before' : 'after') : next)
  }
  const onRadioKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, CompareSide> = { ArrowLeft: 'before', ArrowUp: 'before', Home: 'before', ArrowRight: 'after', ArrowDown: 'after', End: 'after' }
    const next = map[event.key]
    if (!next) return
    event.preventDefault()
    choose(next)
    radios.current[next === 'before' ? 0 : 1]?.focus()
  }

  const sides: { side: CompareSide; label: string; title: string; steps: Step[]; total: number }[] = [
    { side: 'before', label: 'Before', title: `${word(BEFORE.length)} steps across ${word(BEFORE_TOOLS.length).toLowerCase()} tools`, steps: BEFORE, total: BEFORE_MIN },
    { side: 'after', label: `With ${product}`, title: `${word(AFTER.length)} steps in one place`, steps: AFTER, total: AFTER_MIN },
  ]
  const ring = 'focus-visible:ring-2 focus-visible:ring-[color:var(--ba-ui)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ba-bg)]'

  return (
    <section
      ref={root}
      aria-labelledby={`${uid}-heading`}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--ba-bg)', color: 'var(--ba-fg)', fontFamily: BODY, ...style }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 40% at 78% 58%, color-mix(in oklab, var(--ba-ac) 7%, transparent), transparent)', opacity: 'var(--ba-f, 0)' }} />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 sm:py-14 lg:py-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[38rem]">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase" style={{ fontFamily: MONO, color: 'var(--ba-at)' }}>
              Month-end close
            </p>
            <h2 id={`${uid}-heading`} className="mt-3 text-[30px] leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-[36px]">
              {heading}
            </h2>
          </div>
          <div className="flex flex-col gap-4 lg:max-w-[23rem] lg:items-end lg:gap-3">
            <p className="text-[14.5px] leading-relaxed text-pretty lg:text-right" style={{ color: 'var(--ba-mu)' }}>
              Measured on a 40-person team’s March close, before and after the switch to {product}.
            </p>
            <div
              role="radiogroup"
              aria-label="Compare workflows"
              onKeyDown={onRadioKey}
              // 手机上两半平分整行（太长才截断）；从 sm 起每半至少是较长标签的宽度，产品名不会被截断。
              className={cn('relative grid w-full grid-cols-2 border p-1 sm:w-auto sm:min-w-[19rem] sm:grid-cols-[repeat(2,minmax(max-content,1fr))] sm:self-start lg:self-end', divider && 'lg:hidden')}
              style={{ borderRadius: track, background: 'var(--ba-track)', borderColor: 'var(--ba-ln)' }}
            >
              <span aria-hidden className="absolute inset-y-1 left-1 w-[calc(50%-4px)]" style={{ transform: 'translateX(calc(var(--ba-f, 0) * 100%))' }}>
                <span className="absolute inset-0 shadow-sm" style={{ borderRadius: knob, background: 'var(--ba-knob)' }} />
                <span className="absolute inset-0" style={{ borderRadius: knob, background: 'var(--ba-fill)', opacity: 'var(--ba-f, 0)' }} />
              </span>
              {sides.map(({ side, label }, i) => {
                const on = current === side
                const weight = side === 'after' ? 'var(--ba-f, 0)' : 'calc(1 - var(--ba-f, 0))'
                const strong = side === 'after' ? 'var(--ba-ink)' : 'var(--ba-fg)'
                return (
                  <button
                    key={side}
                    ref={(el) => {
                      radios.current[i] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(side)}
                    title={label}
                    className={cn('relative grid h-9 min-w-0 px-2.5 text-[13px] font-medium outline-none sm:px-4 sm:text-[13.5px]', ring)}
                    style={{ borderRadius: knob, color: `color-mix(in oklab, ${strong} calc(${weight} * 100%), var(--ba-mu))` }}
                  >
                    {/* 两个标签叠在同一格里、只显示自己的：两颗按钮的内容宽度一样，两半就一样宽，滑块正好盖住一半。 */}
                    {sides.map((other) => (
                      <span key={other.side} aria-hidden={other.side !== side || undefined} className={cn('col-start-1 row-start-1 min-w-0 truncate self-center', other.side !== side && 'invisible')}>
                        {other.label}
                      </span>
                    ))}
                  </button>
                )
              })}
            </div>
            {divider && (
              <p className="hidden items-center gap-2 text-[12.5px] lg:flex" style={{ color: 'var(--ba-mu)' }}>
                <Glyph>
                  <path d="M5.5 4.5 2.5 8l3 3.5M10.5 4.5l3 3.5-3 3.5" />
                </Glyph>
                Drag the divider to compare
              </p>
            )}
          </div>
        </header>

        <div ref={grid} className={cn('mt-8 grid sm:mt-10 lg:mt-7', divider ? 'lg:[grid-template-columns:minmax(0,var(--ba-l,0.6fr))_2.25rem_minmax(0,var(--ba-r,0.4fr))]' : 'lg:grid-cols-2 lg:gap-4')}>
          {sides.map(({ side, label, title, steps, total }, i) => {
            const before = side === 'before'
            const on = current === side
            const weight = before ? 'calc(1 - var(--ba-f, 0))' : 'var(--ba-f, 0)'
            return (
              <div
                key={side}
                className={cn(
                  'col-start-1 row-start-1 min-w-0',
                  !before && (divider ? 'lg:col-start-3' : 'lg:col-start-2'),
                  // 窄屏只显示聚焦的一边：另一边不占高度，切换时新面板从灰色慢慢恢复颜色。
                  !on && 'max-lg:hidden',
                )}
              >
                <article
                  aria-labelledby={`${uid}-panel-${i}`}
                  onClick={() => {
                    if (!on) choose(side)
                  }}
                  className={cn('relative h-full overflow-hidden border', !on && 'lg:cursor-pointer')}
                  // 未聚焦一侧不降整体透明度（会把小字的对比度拉到 3:1 以下）：彩色换成等亮度的灰、标题略淡、
                  // 底色往页面底色退一点、路线图变淡、描边和光晕消失。正文和次要文字的对比度保持不变。
                  style={{
                    ...faded(weight),
                    borderRadius: radius,
                    background: 'var(--ba-sf)',
                    borderColor: 'var(--ba-ln)',
                    boxShadow: 'var(--ba-shadow)',
                    color: `color-mix(in oklab, var(--ba-fg) calc(${weight} * 100%), var(--ba-dim))`,
                  }}
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'var(--ba-bg)', opacity: `calc((1 - ${weight}) * 0.5)` }} />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 border"
                    style={{ borderRadius: radius, borderColor: before ? 'color-mix(in oklab, var(--ba-warm) 34%, transparent)' : 'color-mix(in oklab, var(--ba-ui) 60%, transparent)', opacity: weight }}
                  />
                  {!before && (
                    <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 50% at 85% 0%, color-mix(in oklab, var(--ba-ac) var(--ba-glow), transparent), transparent)', opacity: weight }} />
                  )}
                  <div className="relative flex h-full flex-col p-4 sm:p-6 lg:p-5">
                    <header className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium tracking-[0.16em] [overflow-wrap:anywhere] uppercase" style={{ fontFamily: MONO, color: before ? 'var(--ba-warm)' : 'var(--ba-at)' }}>
                          {label}
                        </p>
                        <h3 id={`${uid}-panel-${i}`} className="mt-1.5 text-[16px] leading-tight font-medium">
                          <span className="sr-only">{label}: </span>
                          {title}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[22px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{span(total)}</p>
                        <p className="mt-1.5 text-[11.5px]" style={{ color: 'var(--ba-mu)' }}>
                          hands-on per close
                        </p>
                      </div>
                    </header>
                    <div className="mt-3.5" style={{ opacity: `calc(0.4 + ${weight} * 0.6)` }}>
                      <Route
                        side={side}
                        round={Math.min(9, shape.chip)}
                        svgRef={(el) => {
                          routes.current[i] = el
                        }}
                      />
                      <p className="sr-only">Tools: {before ? BEFORE_TOOLS.map((tool) => TOOLS[tool].name).join(', ') : `${TOOLS.card.name} and ${TOOLS.receipt.name} flow through ${product} into the ${TOOLS.ledger.name.toLowerCase()}`}.</p>
                    </div>
                    <div className="mt-3.5 border-t pt-1" style={{ borderColor: 'var(--ba-ln)' }}>
                      <Steps side={side} steps={steps} variant={variant} shape={shape} />
                    </div>
                    {!before && (
                      <div className="mt-auto pt-5">
                        <p className="text-[10.5px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: MONO, color: 'var(--ba-mu)' }}>
                          Now handled for you
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {HANDLED.map((item) => (
                            <li key={item} className="border px-2.5 py-[3px] text-[12px] line-through decoration-[color:var(--ba-ui)]" style={{ borderRadius: shape.pill, borderColor: 'var(--ba-ln)', color: 'var(--ba-mu)' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            )
          })}

          {divider && (
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare workflows"
              aria-orientation="horizontal"
              aria-valuemin={40}
              aria-valuemax={60}
              aria-valuenow={current === 'after' ? 40 : 60}
              aria-valuetext={current === 'after' ? `With ${product} in focus` : 'Before in focus'}
              onPointerDown={onDividerDown}
              onPointerMove={onDividerMove}
              onPointerUp={() => onDividerUp(false)}
              onPointerCancel={() => onDividerUp(true)}
              onKeyDown={onDividerKey}
              className="group relative col-start-2 row-start-1 hidden cursor-col-resize touch-none justify-center outline-none select-none lg:flex"
            >
              <span aria-hidden className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2" style={{ background: 'var(--ba-ln2)' }} />
              <span
                aria-hidden
                className="sticky top-1/2 my-auto grid size-9 place-items-center rounded-full border transition-[transform,box-shadow] duration-200 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--ba-ui)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[color:var(--ba-bg)] group-active:scale-95 motion-reduce:transition-none"
                style={{ background: 'var(--ba-knob)', borderColor: 'var(--ba-ln2)', color: 'var(--ba-fg)', boxShadow: '0 6px 18px -8px rgba(0,0,0,0.5)' }}
              >
                <Glyph>
                  <path d="M5.5 4.5 2.5 8l3 3.5M10.5 4.5l3 3.5-3 3.5" />
                </Glyph>
              </span>
            </div>
          )}
        </div>

        {o.showTimeSaved && (
          <div
            className="mt-4 grid gap-5 border p-4 sm:p-6 lg:px-6 lg:py-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-center lg:gap-10"
            style={{ borderRadius: radius, background: 'var(--ba-sf)', borderColor: 'var(--ba-ln)', boxShadow: 'var(--ba-shadow)' }}
          >
            <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ fontFamily: MONO, color: 'var(--ba-mu)' }}>
                  Saved every close
                </p>
                {/* 数字一直是完整的节省时间（无论聚焦哪边都成立），聚焦新做法时从次要色亮成主色。 */}
                <p
                  className="mt-2 text-[38px] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap tabular-nums sm:text-[42px]"
                  style={{ color: 'color-mix(in oklab, var(--ba-at) calc(var(--ba-r-p, 0) * 100%), var(--ba-mu))' }}
                >
                  {span(SAVED_MIN)}
                </p>
              </div>
              <p className="max-w-[21ch] pb-0.5 text-[13px] leading-snug" style={{ color: 'var(--ba-mu)' }}>
                <span className="font-medium" style={{ color: 'var(--ba-fg)' }}>
                  −{Math.round((SAVED_MIN / BEFORE_MIN) * 100)}% hands-on time.
                </span>{' '}
                About {Math.round((SAVED_MIN * 12) / 60)} hours a year for one finance lead.
              </p>
            </div>
            <div className="grid grid-cols-[minmax(0,max-content)_minmax(3rem,1fr)_auto] items-center gap-x-3 gap-y-2.5 text-[12.5px]">
              <span className="truncate" style={{ color: 'var(--ba-mu)' }}>
                Before
              </span>
              <span aria-hidden className="relative h-2.5 overflow-hidden" style={{ borderRadius: shape.pill, background: 'var(--ba-track)' }}>
                <span className="absolute inset-0" style={{ borderRadius: shape.pill, background: 'var(--ba-warm)', opacity: 0.8 }} />
              </span>
              <span className="text-right font-medium whitespace-nowrap tabular-nums">
                {span(BEFORE_MIN)}
              </span>
              <span className="truncate" style={{ color: 'var(--ba-mu)' }}>
                With {product}
              </span>
              <span aria-hidden className="relative h-2.5 overflow-hidden" style={{ borderRadius: shape.pill, background: 'var(--ba-track)' }}>
                <span
                  className="absolute inset-y-0 right-0"
                  style={{
                    left: `${(AFTER_MIN / BEFORE_MIN) * 100}%`,
                    background: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--ba-ac) 42%, transparent) 0 2px, transparent 2px 6px)',
                    clipPath: 'inset(0 calc((1 - var(--ba-r-p, 0)) * 100%) 0 0)',
                  }}
                />
                <span className="absolute inset-y-0 left-0" style={{ width: `max(8px, ${(AFTER_MIN / BEFORE_MIN) * 100}%)`, borderRadius: shape.pill, background: 'var(--ba-fill)' }} />
              </span>
              <span className="text-right font-medium whitespace-nowrap tabular-nums">
                {span(AFTER_MIN)}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
