import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Selected work',
  view: 'grid',
  columns: 4,
  radius: 18,
  accent: '#2b59ff',
  tone: 'light',
  spring: {
    visualDuration: 0.5,
    bounce: 0.18,
  },
  stagger: 0.025,
}
/* @motif:end */

export type Pattern = 'sunrise' | 'blueprint' | 'rings' | 'dots' | 'bars' | 'arc' | 'letter' | 'contour'

export interface Project {
  id: string
  title: string
  /** 筛选用的分类。 */
  kind: string
  year: number
  /** 缩略图的两到三个颜色。 */
  colors: string[]
  pattern: Pattern
}

export const PROJECTS: Project[] = [
  { id: 'northwind', title: 'Northwind Ferries', kind: 'Brand', year: 2026, colors: ['#0f2a4a', '#2f6fd6', '#ffcf6e'], pattern: 'sunrise' },
  { id: 'kiln', title: 'Kiln & Co. checkout', kind: 'Product', year: 2025, colors: ['#f4e3d0', '#c2643b'], pattern: 'blueprint' },
  { id: 'tidal', title: 'Tidal launch film', kind: 'Motion', year: 2026, colors: ['#0c3b3a', '#4fd1b5'], pattern: 'rings' },
  { id: 'oddfellow', title: 'Oddfellow Coffee', kind: 'Brand', year: 2024, colors: ['#2a1a12', '#e9b872'], pattern: 'dots' },
  { id: 'ledger', title: 'Ledger for teams', kind: 'Product', year: 2026, colors: ['#e9ecff', '#8f9bff', '#3346ff'], pattern: 'bars' },
  { id: 'halyard', title: 'Halyard title sequence', kind: 'Motion', year: 2025, colors: ['#1b1530', '#ff7a59', '#ffd29d'], pattern: 'arc' },
  { id: 'parade', title: 'Parade typeface', kind: 'Brand', year: 2025, colors: ['#ffdf3d', '#161616'], pattern: 'letter' },
  { id: 'atlas', title: 'Atlas field app', kind: 'Product', year: 2024, colors: ['#e8efe2', '#55784b'], pattern: 'contour' },
]

export type View = 'grid' | 'list'
export type Sort = 'newest' | 'az'
export interface GridState {
  /** 'All' 或某个分类。 */
  filter: string
  sort: Sort
  view: View
}

export type FlipGridProps = Partial<typeof defaults> & {
  projects?: Project[]
  /** 受控模式：传入当前状态，用户操作时通过 onStateChange 通知；不传就由组件自己管理。 */
  state?: GridState
  onStateChange?: (state: GridState) => void
  className?: string
  style?: CSSProperties
}

const ALL = 'All'
const TONES = {
  light: { background: '#efebe4', ink: '#1b1a17' },
  dark: { background: '#121315', ink: '#efece6' },
}

/**
 * 缩略图全部用 CSS 渐变画，尺寸一律用百分比：两种视图的缩略图都是 4:3，
 * 小图就是大图的等比缩小。FLIP 动画期间缩略图靠 transform 缩放，用 px 画的图案会在切换瞬间变疏变密。
 */
function art({ pattern, colors }: Project): CSSProperties {
  const [a = '#222222', b = '#888888', c = b] = colors
  switch (pattern) {
    case 'sunrise':
      return {
        background: `radial-gradient(circle at 68% 42%, ${c} 0 13%, transparent 13.5%), repeating-linear-gradient(-8deg, ${b} 0 7%, ${a} 7% 18%) 0 100% / 100% 42% no-repeat, ${a}`,
      }
    case 'blueprint':
      return {
        background: `linear-gradient(${b}, ${b}) 50% 58% / 46% 38% no-repeat, linear-gradient(${b}33 0 8%, transparent 8%) 0 0 / 6.25% 8.333%, linear-gradient(90deg, ${b}33 0 8%, transparent 8%) 0 0 / 6.25% 8.333%, ${a}`,
      }
    case 'rings':
      return { background: `repeating-radial-gradient(circle at 28% 108%, ${b} 0 0.9%, transparent 0.9% 5.5%), ${a}` }
    case 'dots':
      return { background: `radial-gradient(circle, ${b} 0 24%, transparent 27%) 0 0 / 7% 9.333%, ${a}` }
    case 'bars': {
      const heights = [38, 60, 46, 82, 56]
      const layers = heights.map((height, index) => `linear-gradient(${index === 3 ? c : b}, ${index === 3 ? c : b}) ${14 + index * 18}% 100% / 10% ${height}% no-repeat`)
      return { background: `${layers.join(', ')}, ${a}` }
    }
    case 'arc':
      return { background: `radial-gradient(circle at 50% 120%, transparent 0 34%, ${a} 70%), conic-gradient(from 270deg at 50% 100%, ${b}, ${c}, ${b})` }
    case 'contour':
      return { background: `repeating-radial-gradient(ellipse at 70% 38%, ${a} 0 3.1%, ${b} 3.1% 3.6%)` }
    case 'letter':
      return { background: a, color: b }
  }
}

/** 主色上的文字用黑还是白：按相对亮度挑对比更强的一个。 */
function onColor(hex: string): string {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return luminance > 0.36 ? '#111111' : '#ffffff'
}

function Segmented<T extends string>({ label, options, value, onChange, accent, ink, group }: { label: string; options: { value: T; content: ReactNode; title?: string }[]; value: T; onChange: (value: T) => void; accent: string; ink: string; group: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full p-1" style={{ background: `color-mix(in oklab, ${ink} 6%, transparent)` }}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className="relative grid h-8 min-w-8 place-items-center rounded-full px-3 text-[13px] font-medium outline-offset-2 focus-visible:outline-2"
            style={{ outlineColor: accent }}
          >
            {active && <motion.span layoutId={`${group}-pill`} className="absolute inset-0 rounded-full" style={{ background: accent }} />}
            <span className="relative transition-colors duration-200" style={{ color: active ? onColor(accent) : `color-mix(in oklab, ${ink} 70%, transparent)` }}>
              {option.content}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const GridIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
  </svg>
)
const ListIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
    <rect x="1.5" y="2" width="13" height="3" rx="1" />
    <rect x="1.5" y="6.5" width="13" height="3" rx="1" />
    <rect x="1.5" y="11" width="13" height="3" rx="1" />
  </svg>
)

/**
 * 可筛选、排序、切换网格 / 列表的作品墙。每次变化时卡片从旧位置平滑飞到新位置（FLIP），
 * 缩略图在两种视图之间变形，被筛掉的卡片原地淡出、其余的立刻补位。
 * 用 motion 的 layout 动画实现；开启「减少动态效果」时直接切换。
 */
export function FlipGrid({ className, style, projects = PROJECTS, state, onStateChange, ...props }: FlipGridProps) {
  const options = { ...defaults, ...props }
  const { heading, view, columns, radius, accent, tone, spring, stagger } = options
  const { background, ink } = TONES[tone as keyof typeof TONES] ?? TONES.light
  const reduced = useReducedMotion()
  const group = useId()

  const [own, setOwn] = useState<GridState>({ filter: ALL, sort: 'newest', view: view as View })
  // 调参面板改了默认视图时同步过来（渲染期间根据上一次的参数调整状态，不用 effect）。
  const [lastView, setLastView] = useState(view)
  if (view !== lastView) {
    setLastView(view)
    setOwn((current) => ({ ...current, view: view as View }))
  }
  const current = state ?? own
  const update = (patch: Partial<GridState>) => {
    const next = { ...current, ...patch }
    if (!state) setOwn(next)
    onStateChange?.(next)
  }

  const kinds = [ALL, ...new Set(projects.map((project) => project.kind))]
  const visible = projects
    .filter((project) => current.filter === ALL || project.kind === current.filter)
    .sort((a, b) => (current.sort === 'az' ? a.title.localeCompare(b.title) : b.year - a.year || a.title.localeCompare(b.title)))
  const list = current.view === 'list'
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const settle = (index: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: reduced ? { duration: 0 } : { duration: 0.3, delay: spring.visualDuration * 0.6 + index * stagger },
  })
  const muted = `color-mix(in oklab, ${ink} 55%, transparent)`
  const line = `color-mix(in oklab, ${ink} 10%, transparent)`

  return (
    <div className={cn('@container', className)} style={{ background, color: ink, fontFamily: "'Inter Tight Variable', 'PingFang SC', sans-serif", ...style }}>
      <LayoutGroup id={group}>
        <div className="mx-auto w-full max-w-5xl px-5 py-8 @3xl:px-10 @3xl:py-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <h2 className="text-[28px] leading-none font-semibold tracking-[-0.02em] @3xl:text-[34px]">
              {heading}
              <span className="ml-2 align-top text-[14px] font-medium tabular-nums" style={{ color: muted }}>
                {visible.length}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented label="Filter" group={`${group}-filter`} accent={accent} ink={ink} value={current.filter} onChange={(filter) => update({ filter })} options={kinds.map((kind) => ({ value: kind, content: kind }))} />
              <Segmented
                label="Sort"
                group={`${group}-sort`}
                accent={accent}
                ink={ink}
                value={current.sort}
                onChange={(sort) => update({ sort })}
                options={[
                  { value: 'newest', content: 'Newest' },
                  { value: 'az', content: 'A–Z' },
                ]}
              />
              <Segmented
                label="View"
                group={`${group}-view`}
                accent={accent}
                ink={ink}
                value={current.view}
                onChange={(next) => update({ view: next })}
                options={[
                  { value: 'grid', content: <GridIcon />, title: 'Grid' },
                  { value: 'list', content: <ListIcon />, title: 'List' },
                ]}
              />
            </div>
          </div>

          <motion.ul
            layout
            transition={transition}
            className={cn('relative mt-8', list ? 'flex flex-col' : 'grid grid-cols-2 gap-x-4 gap-y-6 @3xl:grid-cols-[repeat(var(--columns),minmax(0,1fr))] @3xl:gap-x-5 @3xl:gap-y-8')}
            style={{ '--columns': columns } as CSSProperties}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((project, index) => (
                <motion.li
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ ...transition, delay: reduced ? 0 : index * stagger }}
                  className={cn('flex min-w-0', list ? 'items-center gap-4 border-b py-3' : 'flex-col gap-3')}
                  style={{ borderColor: line }}
                >
                  <motion.div
                    layout
                    transition={{ ...transition, delay: reduced ? 0 : index * stagger }}
                    className={cn('relative shrink-0 overflow-hidden', list ? 'h-12 w-16' : 'aspect-[4/3] w-full')}
                    style={{ ...art(project), borderRadius: list ? Math.min(radius, 10) : radius }}
                  >
                    {/* 字样用 SVG 画：跟着缩略图一起缩放，不需要单独做布局动画。 */}
                    {project.pattern === 'letter' && (
                      <svg viewBox="0 0 40 30" className="absolute inset-0 h-full w-full" aria-hidden>
                        <text x="20" y="19.5" textAnchor="middle" fontSize="13" fill="currentColor" style={{ fontFamily: "'Instrument Serif', serif" }}>
                          Aa
                        </text>
                      </svg>
                    )}
                  </motion.div>
                  <motion.div layout="position" transition={{ ...transition, delay: reduced ? 0 : index * stagger }} className={cn('min-w-0', list && 'flex-1')}>
                    <p className="truncate text-[15px] font-medium">{project.title}</p>
                    {!list && (
                      <motion.p key="card" {...settle(index)} className="mt-0.5 text-[13px] tabular-nums" style={{ color: muted }}>
                        {project.kind} · {project.year}
                      </motion.p>
                    )}
                  </motion.div>
                  {/* 分类和年份在两种视图里位置完全不同：不跟着飞，等卡片落定再淡入。 */}
                  {list && (
                    <motion.p key="row" {...settle(index)} className="flex shrink-0 gap-6 text-[13px] tabular-nums" style={{ color: muted }}>
                      <span className="hidden @xl:inline">{project.kind}</span>
                      <span className="w-10 text-right">{project.year}</span>
                    </motion.p>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </LayoutGroup>
    </div>
  )
}
