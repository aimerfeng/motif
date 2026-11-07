// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/toolbar-expandable.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Transition, type Variants } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  spring: {
    visualDuration: 0.32,
    bounce: 0.12,
  },
  contentTransition: 'slide',
  placement: 'top',
  panelWidth: 300,
  buttonSize: 40,
  radius: 20,
  indicator: 'pill',
  closeOnOutsideClick: true,
}
/* @motif:end */

export type ToolbarItem = {
  id: string
  /** 图标按钮的可读名称，也是面板的标签。 */
  label: string
  icon: ReactNode
  content: ReactNode
}

export type ToolbarExpandableProps = Partial<typeof defaults> & {
  items?: ToolbarItem[]
  /** 受控：展开的是哪一项，null 为收起。 */
  active?: string | null
  onActiveChange?: (id: string | null) => void
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

const sampleButton = 'mt-3 h-8 w-full rounded-lg border text-sm text-muted-foreground transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'

// 没传 items 时用的示例（对应上游的四项：个人、消息、文件、钱包）。
const SAMPLE: ToolbarItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: svg(
      <>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
      </>,
    ),
    content: (
      <div className="p-2">
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-full bg-linear-to-br from-sky-400 to-indigo-500" />
          <div>
            <p className="text-sm font-medium">Mira Okafor</p>
            <p className="text-xs text-muted-foreground">Product designer</p>
          </div>
        </div>
        <button type="button" className={sampleButton}>
          Edit profile
        </button>
      </div>
    ),
  },
  {
    id: 'inbox',
    label: 'Messages',
    icon: svg(<path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5z" />),
    content: (
      <div className="p-2">
        <p className="text-sm">You have 3 unread messages.</p>
        <button type="button" className={sampleButton}>
          Open inbox
        </button>
      </div>
    ),
  },
  {
    id: 'files',
    label: 'Files',
    icon: svg(<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2.5h6.5A1.5 1.5 0 0 1 20 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />),
    content: (
      <div className="space-y-1 p-2 text-sm">
        <p>Roadmap-Q3.pdf</p>
        <p>Interview-notes.md</p>
        <p>Budget-2026.xlsx</p>
        <button type="button" className={sampleButton}>
          Manage files
        </button>
      </div>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: svg(
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
        <path d="M16 12h1.5" />
      </>,
    ),
    content: (
      <div className="p-2">
        <p className="text-xs text-muted-foreground">Current balance</p>
        <p className="text-lg font-semibold tabular-nums">$1,250.32</p>
        <button type="button" className={sampleButton}>
          View transactions
        </button>
      </div>
    ),
  },
]

/**
 * 切换工具时内容的过渡；custom 是方向（往右切为 1，往左为 -1）。
 * 旧内容先快速淡出、新内容稍晚淡入，两者不会在半透明时叠成一团；位移仍然走弹簧。
 */
function contentVariants(kind: string, move: Transition): Variants {
  const fadeIn = { duration: 0.2, delay: 0.06, ease: 'easeOut' } as const
  const fadeOut = { duration: 0.12, ease: 'easeIn' } as const
  const enter: Transition = { ...move, opacity: fadeIn, filter: fadeIn }
  const leave: Transition = { ...move, opacity: fadeOut, filter: fadeOut }
  if (kind === 'slide') {
    return {
      enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
      center: { opacity: 1, x: 0, transition: enter },
      exit: (direction: number) => ({ opacity: 0, x: direction * -28, transition: leave }),
    }
  }
  if (kind === 'blur') {
    return {
      enter: { opacity: 0, filter: 'blur(6px)' },
      center: { opacity: 1, filter: 'blur(0px)', transition: enter },
      exit: { opacity: 0, filter: 'blur(6px)', transition: leave },
    }
  }
  return { enter: { opacity: 0 }, center: { opacity: 1, transition: enter }, exit: { opacity: 0, transition: leave } }
}

/** 工具栏的内边距和按钮间距（px），量到真实尺寸之前用它们估算。 */
const PAD = 6
const GAP = 4

/**
 * 展开式工具栏：选中一个工具，外框顺着弹簧长高（可同时变宽），露出它的面板；
 * 内容层贴着外框底边（面板在下方时贴顶边），所以面板是被外框「揭开」的，工具栏本身纹丝不动。
 * 组件在文档流里只占收起时工具栏的大小，展开的部分浮在上方（或下方），不会把周围的布局挤开。
 */
export function ToolbarExpandable({ items = SAMPLE, active, onActiveChange, className, style, 'aria-label': ariaLabel = 'Tools', ...props }: ToolbarExpandableProps) {
  const { spring, contentTransition, placement, panelWidth, buttonSize, radius, indicator, closeOnOutsideClick } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const uid = useId()
  const panelId = `${uid}-panel`
  const rootRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())

  const [inner, setInner] = useState<string | null>(null)
  const requested = active !== undefined ? active : inner
  const activeItem = items.find((item) => item.id === requested)
  const activeId = activeItem?.id ?? null
  const open = activeItem !== undefined

  const setActive = (id: string | null) => {
    if (active === undefined) setInner(id)
    onActiveChange?.(id)
  }

  // 记住上一次展开的是哪个，用来决定内容往哪边滑（渲染期间派生状态的写法）。
  const [previous, setPrevious] = useState(activeId)
  const [direction, setDirection] = useState(1)
  if (previous !== activeId) {
    setPrevious(activeId)
    if (previous && activeId) setDirection(items.findIndex((item) => item.id === activeId) >= items.findIndex((item) => item.id === previous) ? 1 : -1)
  }

  // 键盘的停留点：当前展开的那个；都没展开时是上一次聚焦的那个。
  const [focusId, setFocusId] = useState(items[0]?.id ?? '')
  const tabStop = activeId ?? (items.some((item) => item.id === focusId) ? focusId : items[0]?.id)

  // 工具栏的真实尺寸；量到之前按参数估算，外框不会从 0 长出来。
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null)
  const bar = measured ?? { width: items.length * buttonSize + Math.max(0, items.length - 1) * GAP + PAD * 2, height: buttonSize + PAD * 2 }
  useEffect(() => {
    const element = toolbarRef.current
    if (!element) return
    const measure = () =>
      setMeasured((current) => (current && current.width === element.offsetWidth && current.height === element.offsetHeight ? current : { width: element.offsetWidth, height: element.offsetHeight }))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // 面板换内容时在绘制前量高度，外框直接朝正确的高度长；内容之后自己变高变矮由 ResizeObserver 跟上。
  const [panelHeight, setPanelHeight] = useState(0)
  useLayoutEffect(() => {
    const element = panelRef.current
    if (!element) return
    setPanelHeight(element.offsetHeight)
    const observer = new ResizeObserver(() => setPanelHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [activeId])

  // 只在展开时监听点外面；回调走 ref，监听器不必每次渲染都重挂。
  const setActiveRef = useRef(setActive)
  setActiveRef.current = setActive
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActiveRef.current(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, closeOnOutsideClick])

  const focusButton = (id: string) => {
    setFocusId(id)
    buttons.current.get(id)?.focus()
  }

  const onToolbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === (document.activeElement as HTMLElement | null)?.dataset.toolId)
    if (index < 0) return
    const next =
      event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1
    if (next < 0) return
    event.preventDefault()
    focusButton(items[next]!.id)
  }

  const onRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !activeId) return
    event.preventDefault()
    const id = activeId
    setActive(null)
    focusButton(id)
  }

  const openWidth = Math.max(panelWidth, bar.width)
  // 收起的过程中内容层保持上一次展开的宽度，正在退场的面板不会被挤得重新换行。
  const lastWidth = useRef(openWidth)
  if (open) lastWidth.current = openWidth
  const contentWidth = open ? openWidth : lastWidth.current
  // +2 是外框的 1px 边。
  const frame = open ? { width: openWidth + 2, height: bar.height + panelHeight + 2 } : { width: bar.width + 2, height: bar.height + 2 }

  // 外框的宽高不是 transform，reducedMotion="user" 管不到，所以减少动态效果时直接给 0 时长；淡入淡出保留。
  const move: Transition = reduced ? { duration: 0 } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }
  const transition: Transition = { ...move, opacity: { duration: reduced ? 0.15 : 0.18, ease: 'easeOut' } }
  const inset = Math.max(4, radius - buttonSize / 4 - 2)
  const anchor = placement === 'bottom' ? 'top-0' : 'bottom-0'

  return (
    <MotionConfig transition={transition} reducedMotion="user">
      <div ref={rootRef} className={cn('relative shrink-0', className)} style={{ width: bar.width + 2, height: bar.height + 2, ...style }} onKeyDown={onRootKeyDown}>
        <motion.div
          initial={false}
          animate={frame}
          className={cn('absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden border bg-popover text-popover-foreground shadow-[0_18px_50px_-20px_rgb(0_0_0/0.7),0_4px_12px_-4px_rgb(0_0_0/0.3)]', anchor)}
          style={{ borderRadius: radius }}
        >
          {/* DOM 里工具栏永远在面板前面，Tab 从按钮进入面板；面板在上方时用 column-reverse 摆上去。 */}
          <div className={cn('absolute left-1/2 flex -translate-x-1/2', anchor, placement === 'bottom' ? 'flex-col' : 'flex-col-reverse')} style={{ width: contentWidth }}>
            <div ref={toolbarRef} role="toolbar" aria-label={ariaLabel} aria-orientation="horizontal" className="mx-auto flex w-max items-center" style={{ gap: GAP, padding: PAD }} onKeyDown={onToolbarKeyDown}>
              {items.map((item) => {
                const selected = item.id === activeId
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      if (element) buttons.current.set(item.id, element)
                      else buttons.current.delete(item.id)
                    }}
                    type="button"
                    data-tool-id={item.id}
                    aria-label={item.label}
                    aria-expanded={selected}
                    aria-controls={selected ? panelId : undefined}
                    tabIndex={item.id === tabStop ? 0 : -1}
                    onFocus={() => setFocusId(item.id)}
                    onClick={() => setActive(selected ? null : item.id)}
                    className={cn(
                      'relative grid shrink-0 cursor-pointer place-items-center outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring',
                      selected ? 'text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                    )}
                    style={{ width: buttonSize, height: buttonSize, borderRadius: inset }}
                  >
                    {selected && indicator === 'pill' && <motion.span layoutId={`${uid}-marker`} className="absolute inset-0 bg-foreground/10" style={{ borderRadius: inset }} />}
                    {selected && indicator === 'dot' && <motion.span layoutId={`${uid}-marker`} className="absolute bottom-1 left-[calc(50%-2px)] size-1 rounded-full bg-foreground" />}
                    <span className="relative grid place-items-center [&>svg]:size-5">{item.icon}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence initial={false}>
              {activeItem && (
                <motion.div
                  key="panel"
                  ref={panelRef}
                  id={panelId}
                  role="region"
                  aria-label={activeItem.label}
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* popLayout：退场的内容立刻脱离文档流，面板马上换成新内容的高度。 */}
                  <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                    <motion.div
                      key={activeItem.id}
                      custom={direction}
                      variants={contentVariants(contentTransition, move)}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className={cn('w-full px-2', placement === 'bottom' ? 'pb-2' : 'pt-2')}
                    >
                      {activeItem.content}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  )
}
