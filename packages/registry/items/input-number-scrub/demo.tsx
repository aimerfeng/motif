import { useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { defaults, InputNumberScrub, ScrubCursorIcon, type InputNumberScrubProps } from './input-number-scrub'

type Key = 'w' | 'h' | 'radius' | 'rotation' | 'opacity'
type Values = Record<Key, number>

const KEYS: Key[] = ['w', 'h', 'radius', 'rotation', 'opacity']
const START: Values = { w: 248, h: 160, radius: 14, rotation: 0, opacity: 100 }

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const Letter = ({ children }: { children: string }) => <span className="text-[0.86em] font-semibold">{children}</span>
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="14" height="14" {...stroke}>
    <path d={d} />
  </svg>
)

const FIELDS: Record<Key, { label: string; icon: ReactNode; min: number; max: number; unit: string }> = {
  w: { label: 'Width', icon: <Letter>W</Letter>, min: 120, max: 340, unit: 'px' },
  h: { label: 'Height', icon: <Letter>H</Letter>, min: 80, max: 240, unit: 'px' },
  radius: { label: 'Radius', icon: <Icon d="M3 13V8.5A5.5 5.5 0 0 1 8.5 3H13" />, min: 0, max: 64, unit: 'px' },
  rotation: { label: 'Rotation', icon: <Icon d="M13 8a5 5 0 1 1-1.47-3.54M13 2.75V5h-2.25" />, min: -180, max: 180, unit: '°' },
  opacity: {
    label: 'Opacity',
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" {...stroke}>
        <circle cx="8" cy="8" r="5.25" />
        <path d="M8 2.75a5.25 5.25 0 0 1 0 10.5z" fill="currentColor" />
      </svg>
    ),
    min: 0,
    max: 100,
    unit: '%',
  },
}

// 一轮 10 秒：依次拖动圆角、旋转、宽度、透明度，最后按「重置」回到初始值。
const SCRUBS: { key: Key; from: number; to: number; target: number }[] = [
  { key: 'radius', from: 0.9, to: 2.5, target: 36 },
  { key: 'rotation', from: 3.0, to: 4.3, target: 8 },
  { key: 'w', from: 4.9, to: 6.6, target: 296 },
  { key: 'opacity', from: 7.1, to: 8.1, target: 72 },
]
const LOOP = 10
const RESET = { press: 8.55, from: 8.7, to: 9.5 }
// 海报取宽度刚开始拖的一刻：外框和指示条已经亮起，指针还停在「W」正下方。
const POSTER = 5.2
/** 虚拟指针图标宽 26、高 14，热点在中心。 */
const CURSOR = { half: 13, height: 14 }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const ease = (t: number) => t * t * (3 - 2 * t)

interface Frame {
  values: Values
  active: Key | null
  resetPressed: boolean
  /** travel：想走的像素（带方向），实际距离在摆放时再按字段宽度收窄；p：拖拽进度。 */
  cursor: { key: Key; travel: number; p: number; opacity: number } | null
}

function scripted(time: number, sensitivity: number, reach: number): Frame {
  const t = time % LOOP
  const values = { ...START }
  let active: Key | null = null
  let cursor: Frame['cursor'] = null
  for (const s of SCRUBS) {
    const from = START[s.key]
    const p = ease(clamp((t - s.from) / (s.to - s.from), 0, 1))
    if (t >= s.from) values[s.key] = Math.round(from + (s.target - from) * p)
    if (t >= s.from && t <= s.to + 0.1) active = s.key
    // 前后各留 0.25 秒淡入淡出；相邻两段拖拽的时间窗不重叠，指针不会从一个字段跳到另一个。
    const shown = { from: s.from - 0.25, to: s.to + 0.25 }
    if (t > shown.from && t < shown.to) {
      // 指针移动距离跟着「拖拽距离」参数走，但有上限：演示里的指针只在字段自己的宽度里走。
      const travel = Math.sign(s.target - from) * Math.min(Math.abs(s.target - from) * sensitivity, reach)
      cursor = { key: s.key, travel, p, opacity: Math.min(1, (t - shown.from) / 0.2, (shown.to - t) / 0.2) }
    }
  }
  if (t >= RESET.from) {
    const p = ease(clamp((t - RESET.from) / (RESET.to - RESET.from), 0, 1))
    for (const key of KEYS) values[key] = Math.round(values[key] + (START[key] - values[key]) * p)
  }
  return { values, active, cursor, resetPressed: t >= RESET.press && t < RESET.from + 0.05 }
}

const same = (a: Frame, b: Frame) => a.active === b.active && a.resetPressed === b.resetPressed && KEYS.every((key) => a.values[key] === b.values[key])

/** 浅色强调色上用深色字。 */
function inkOn(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.62 ? '#0b0b10' : '#ffffff'
}

export function Demo(props: InputNumberScrubProps) {
  const options = { ...defaults, ...props }
  const above = options.labelPlacement === 'above'
  const reach = above ? 64 : 40
  const reduced = usePrefersReducedMotion()
  const host = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const fields = useRef<Partial<Record<Key, HTMLDivElement | null>>>({})
  const [auto, setAuto] = useState<Frame>(() => scripted(0, options.scrubSensitivity, reach))
  const [manual, setManual] = useState<Values | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, options.scrubSensitivity, reach)
      setAuto((prev) => (same(prev, next) ? prev : next))
      const el = cursor.current
      const root = host.current
      if (!el || !root) return
      const wrap = next.cursor && fields.current[next.cursor.key]
      const handle = wrap?.querySelector('[data-scrub-handle]')
      const field = wrap?.querySelector('[data-scrub-field]')
      // 减少动态效果时只画一帧、之后不再摆放，字体加载或改参数挪动布局后指针会悬在别处：
      // 干脆不画，激活的外框和指示条已经说明了状态。
      if (reduced || !next.cursor || !handle || !field) {
        el.style.opacity = '0'
        return
      }
      const box = root.getBoundingClientRect()
      const scale = box.width / root.offsetWidth || 1
      // 换算到宿主内容坐标（宿主可以滚动，绝对定位的指针跟着内容走）。
      const dx = root.scrollLeft - box.left / scale
      const dy = root.scrollTop - box.top / scale
      const local = (rect: DOMRect) => ({ left: rect.left / scale + dx, right: rect.right / scale + dx, top: rect.top / scale + dy, bottom: rect.bottom / scale + dy })
      const f = local(field.getBoundingClientRect())
      const h = local(handle.getBoundingClientRect())
      // 指针整个留在字段的宽度里：不跑到相邻字段的按钮上，也不跑出面板。
      const lo = f.left + CURSOR.half
      const hi = Math.max(lo, f.right - CURSOR.half)
      const { travel, p, opacity } = next.cursor
      // 往左拖时从标签右侧按下，留出一点往左走的余地；往右拖从标签中间按下。
      const start = clamp(travel < 0 ? h.right - 4 : (h.left + h.right) / 2, lo, hi)
      const room = travel < 0 ? start - lo : hi - start
      const x = start + Math.sign(travel) * Math.min(Math.abs(travel), room) * p
      // 标签在框内时，指针整个落在框的下沿之外，不盖住 − / + 和数字；标签在上方时停在标签那一行。
      const y = above ? (h.top + h.bottom) / 2 - CURSOR.height / 2 : f.bottom + 2
      el.style.opacity = String(opacity)
      el.style.transform = `translate3d(${x - CURSOR.half}px, ${y}px, 0)`
    },
    { reducedMotion: 'static', staticTime: POSTER },
  )

  const values = manual ?? auto.values
  const takeOver = () => {
    if (manual) return
    setManual(auto.values)
    if (cursor.current) cursor.current.style.opacity = '0'
  }

  // 面板宽度按按钮布局和高度算，保证两列字段永远放得下。
  const { size, buttonLayout, labelPlacement, accent } = options
  const handleWidth = labelPlacement === 'above' ? 0 : size * 0.82
  const buttonsWidth = buttonLayout === 'split' || buttonLayout === 'end' ? size * 2 : buttonLayout === 'stacked' ? size * 0.62 : 0
  const column = Math.ceil(handleWidth + buttonsWidth + 62)
  const panelWidth = Math.max(288, column * 2 + 10 + 28 + 2)
  // 放不下两列时（手机宽度）自动变成一列。
  const grid: CSSProperties = { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${column}px), 1fr))` }

  const field = (key: Key, wide = false) => {
    const spec = FIELDS[key]
    return (
      <div
        key={key}
        ref={(el) => {
          fields.current[key] = el
        }}
        className={wide ? 'col-span-full min-w-0' : 'min-w-0'}
      >
        <InputNumberScrub
          {...props}
          label={spec.label}
          icon={spec.icon}
          min={spec.min}
          max={spec.max}
          unit={spec.unit}
          value={values[key]}
          scrubbing={manual ? undefined : auto.active === key}
          onValueChange={(v) => setManual((m) => ({ ...(m ?? auto.values), [key]: v }))}
        />
      </div>
    )
  }

  const ink = inkOn(accent)
  return (
    <div
      ref={host}
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
      className="relative grid h-full w-full place-items-center overflow-auto bg-[radial-gradient(60%_55%_at_30%_100%,oklch(0.32_0.08_255/0.35),transparent)] bg-background p-4 sm:p-6"
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", '--c': accent } as CSSProperties}
    >
      <div className="flex w-full max-w-[860px] flex-col items-stretch gap-3 md:flex-row">
        {/* 画布：被选中的定价卡片，跟着右侧数值实时变化 */}
        <section aria-label="Canvas" className="relative flex min-h-[300px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_13%,transparent)_1px,transparent_1.2px)] bg-size-[18px_18px] bg-card/40">
          <div className="absolute top-3 left-3.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <svg viewBox="0 0 16 16" width="11" height="11" {...stroke}>
              <path d="M5 2v12M11 2v12M2 5h12M2 11h12" />
            </svg>
            Pricing / Desktop
          </div>
          <div className="absolute right-3 bottom-3 rounded-md border bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">100%</div>
          <div className="relative" style={{ width: values.w, height: values.h, transform: `rotate(${values.rotation}deg)` }}>
            <div
              className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4 text-white shadow-2xl shadow-black/50"
              style={{
                borderRadius: values.radius,
                opacity: values.opacity / 100,
                background: 'radial-gradient(120% 90% at 0% 0%, rgb(255 255 255 / 0.28), transparent 55%), linear-gradient(140deg, #ff9f5a 0%, #ff5f7e 52%, #a83fd6 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span className="size-3.5 rounded-full border-2 border-white/90" />
                  Studio
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">Most popular</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[30px] leading-none font-semibold tracking-tight">$24</span>
                  <span className="text-[11px] text-white/80">/ seat · month</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[10.5px] text-white/75">Billed yearly · 5 seats</span>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-[#3a1450]">Upgrade</span>
                </div>
              </div>
            </div>
            <div aria-hidden className="pointer-events-none absolute -inset-px border-[1.5px] border-(--c)" />
            {['-top-[4px] -left-[4px]', '-top-[4px] -right-[4px]', '-bottom-[4px] -left-[4px]', '-right-[4px] -bottom-[4px]'].map((pos) => (
              <span key={pos} aria-hidden className={`absolute size-[8px] border-[1.5px] border-(--c) bg-white ${pos}`} />
            ))}
            <span aria-hidden className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2 rounded-[4px] bg-(--c) px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap tabular-nums" style={{ color: ink }}>
              {values.w} × {values.h}
            </span>
          </div>
        </section>

        {/* 属性面板 */}
        <aside aria-label="Inspector" className="mx-auto w-full shrink-0 rounded-xl border bg-card/85 p-3.5 shadow-2xl shadow-black/30 md:mx-0" style={{ maxWidth: panelWidth }}>
          <header className="flex items-center gap-2.5 pb-3">
            <span className="grid size-7 place-items-center rounded-md bg-foreground/[0.06] text-muted-foreground">
              <svg viewBox="0 0 16 16" width="14" height="14" {...stroke}>
                <rect x="2.5" y="3.5" width="11" height="9" rx="2" />
                <path d="M2.5 6.5h11" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">Pricing card</div>
              <div className="text-[11px] text-muted-foreground">Frame · 3 layers</div>
            </div>
            <button
              type="button"
              aria-label="Reset to defaults"
              onClick={() => setManual(START)}
              className={`grid size-7 place-items-center rounded-md text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-foreground/[0.07] hover:text-foreground active:scale-90 ${!manual && auto.resetPressed ? 'scale-90 bg-foreground/[0.12] text-foreground' : ''}`}
            >
              <Icon d="M3 8a5 5 0 1 0 1.47-3.54M3 2.75V5h2.25" />
            </button>
          </header>
          <div className="border-t pt-3">
            <div className="mb-2 text-[11px] font-medium text-muted-foreground">Layout</div>
            <div className="grid gap-2.5" style={grid}>
              {field('w')}
              {field('h')}
            </div>
          </div>
          <div className="mt-3.5 border-t pt-3">
            <div className="mb-2 text-[11px] font-medium text-muted-foreground">Appearance</div>
            <div className="grid gap-2.5" style={grid}>
              {field('radius')}
              {field('rotation')}
              {field('opacity', true)}
            </div>
          </div>
          <p className="mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
            Drag a label to scrub
            <span aria-hidden>·</span>
            <kbd className="rounded border bg-background/60 px-1 font-sans text-[10px]">⇧</kbd>
            ×10
            <span aria-hidden>·</span>
            <kbd className="rounded border bg-background/60 px-1 font-sans text-[10px]">↑↓</kbd>
            to nudge
          </p>
        </aside>
      </div>
      <div ref={cursor} aria-hidden className="pointer-events-none absolute top-0 left-0 opacity-0" style={{ filter: 'drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.55))' }}>
        <ScrubCursorIcon />
      </div>
    </div>
  )
}
