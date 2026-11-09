// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry/bases/base/ui/resizable.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { animate, useReducedMotion } from 'motion/react'
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  handleStyle: 'pill',
  layout: 'nested',
  accent: '#fafafa',
  minSize: 15,
  collapsible: true,
  radius: 16,
  spring: {
    visualDuration: 0.35,
    bounce: 0.15,
  },
}
/* @motif:end */

type Options = typeof defaults
type HandleState = 'idle' | 'hover' | 'drag'
type Orientation = 'horizontal' | 'vertical'

interface GroupContext {
  options: Options
  orientation: Orientation
  sizes: number[]
  ids: string[]
  forced: { index: number; state: Exclude<HandleState, 'idle'> } | null
  startDrag: (index: number, event: ReactPointerEvent<HTMLDivElement>) => void
  step: (index: number, delta: number) => void
  jump: (index: number, edge: 'min' | 'max') => void
  toggleCollapse: (index: number) => void
}

const OptionsContext = createContext<Options | null>(null)
const GroupCtx = createContext<GroupContext | null>(null)
const SlotCtx = createContext(0)

export type ResizablePanelGroupProps = Partial<Options> & {
  orientation?: Orientation
  /** Controlled sizes in percent, one per panel. */
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  /** Force a handle into its hover or drag look (demo autoplay). */
  forceHandle?: { index: number; state: 'hover' | 'drag' } | null
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

function ResizablePanelGroup({ orientation = 'horizontal', sizes: controlled, onSizesChange, forceHandle = null, className, style, children, ...props }: ResizablePanelGroupProps) {
  const parent = useContext(OptionsContext)
  const options: Options = { ...defaults, ...parent, ...props }
  const reduced = useReducedMotion()
  const baseId = useId()
  const ref = useRef<HTMLDivElement>(null)

  // Children are direct ResizablePanel / ResizableHandle elements (as with react-resizable-panels).
  const items = Children.toArray(children).filter(isValidElement)
  const panelProps = items.filter((child) => child.type === ResizablePanel).map((child) => child.props as ResizablePanelProps)
  const count = panelProps.length

  const [inner, setInner] = useState<number[]>(() => {
    const given = panelProps.reduce((sum, p) => sum + (p.defaultSize ?? 0), 0)
    const missing = panelProps.filter((p) => p.defaultSize == null).length
    return panelProps.map((p) => p.defaultSize ?? (missing ? Math.max(0, 100 - given) / missing : 0))
  })
  const sizes = controlled ?? inner
  const sizesRef = useRef(sizes)
  useEffect(() => {
    sizesRef.current = sizes
  })
  const collapsedFrom = useRef<Record<number, number>>({})
  const anim = useRef<{ stop: () => void } | null>(null)
  useEffect(() => () => anim.current?.stop(), [])

  const commit = (next: number[]) => {
    sizesRef.current = next
    if (!controlled) setInner(next)
    onSizesChange?.(next)
  }
  const minOf = (i: number) => panelProps[i]?.minSize ?? options.minSize

  /** Move the boundary after panel `index` by `delta` percent, starting from `from`. */
  const resize = (index: number, from: number[], delta: number) => {
    const a = from[index] ?? 0
    const b = from[index + 1] ?? 0
    const d = Math.min(Math.max(delta, Math.min(0, minOf(index) - a)), Math.max(0, b - minOf(index + 1)))
    const next = from.slice()
    next[index] = a + d
    next[index + 1] = b - d
    if (next[index]! > 0) delete collapsedFrom.current[index]
    commit(next)
  }

  const startDrag = (index: number, event: ReactPointerEvent<HTMLDivElement>) => {
    const host = ref.current
    if (!host) return
    anim.current?.stop()
    const rect = host.getBoundingClientRect()
    const total = orientation === 'horizontal' ? rect.width : rect.height
    const origin = orientation === 'horizontal' ? event.clientX : event.clientY
    const from = sizesRef.current.slice()
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (e: PointerEvent) => {
      const pos = orientation === 'horizontal' ? e.clientX : e.clientY
      resize(index, from, total > 0 ? ((pos - origin) / total) * 100 : 0)
    }
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  const step = (index: number, delta: number) => {
    anim.current?.stop()
    resize(index, sizesRef.current, delta)
  }
  const jump = (index: number, edge: 'min' | 'max') => step(index, edge === 'min' ? -100 : 100)

  const toggleCollapse = (index: number) => {
    if (!options.collapsible) return
    const from = sizesRef.current.slice()
    const a = from[index] ?? 0
    const b = from[index + 1] ?? 0
    const restore = collapsedFrom.current[index]
    let target: number
    if (a > 0.5) {
      collapsedFrom.current[index] = a
      target = 0
    } else {
      delete collapsedFrom.current[index]
      target = Math.min(restore ?? Math.max(minOf(index), 25), a + b - minOf(index + 1))
    }
    const to = from.slice()
    to[index] = target
    to[index + 1] = a + b - target
    anim.current?.stop()
    if (reduced) {
      commit(to)
      return
    }
    anim.current = animate(0, 1, {
      type: 'spring',
      visualDuration: options.spring.visualDuration,
      bounce: options.spring.bounce,
      onUpdate: (p) => {
        const x = Math.min(Math.max(a + (target - a) * p, 0), a + b)
        const next = from.slice()
        next[index] = x
        next[index + 1] = a + b - x
        commit(next)
      },
    })
  }

  const ids = Array.from({ length: count }, (_, i) => `${baseId}-panel-${i}`)
  let panelIndex = -1
  const isRoot = parent === null

  return (
    <OptionsContext.Provider value={options}>
      <GroupCtx.Provider value={{ options, orientation, sizes, ids, forced: forceHandle, startDrag, step, jump, toggleCollapse }}>
        <div
          ref={ref}
          data-slot="resizable-panel-group"
          data-orientation={orientation}
          className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', isRoot && 'overflow-hidden', className)}
          style={{ ...(isRoot ? { borderRadius: options.radius } : null), ...style }}
        >
          {items.map((child) => {
            if (child.type === ResizablePanel) panelIndex += 1
            return (
              <SlotCtx.Provider key={child.key} value={Math.max(panelIndex, 0)}>
                {child}
              </SlotCtx.Provider>
            )
          })}
        </div>
      </GroupCtx.Provider>
    </OptionsContext.Provider>
  )
}

export type ResizablePanelProps = {
  defaultSize?: number
  minSize?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

function ResizablePanel({ className, style, children }: ResizablePanelProps) {
  const group = useContext(GroupCtx)
  const index = useContext(SlotCtx)
  const size = group?.sizes[index] ?? 50
  return (
    <div
      data-slot="resizable-panel"
      id={group?.ids[index]}
      data-collapsed={size < 0.5 ? '' : undefined}
      className={cn('min-h-0 min-w-0 overflow-hidden', className)}
      style={{ flex: `${size} 1 0px`, ...style }}
    >
      {children}
    </div>
  )
}

// Upstream pill classes (c-resizable-6/7/8/9); `active:` / `hover:` became data-[state=…] so the look can be forced.
const PILLS: Record<string, { vertical: string; horizontal: string; line?: string }> = {
  pill: {
    vertical:
      'before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-6 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-muted-foreground/25 before:transition-[height,width,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:h-10 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:h-12 data-[state=drag]:before:w-1.5 data-[state=drag]:before:bg-(--rp-accent)',
    horizontal:
      'before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-1 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-muted-foreground/25 before:transition-[height,width,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:w-10 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:h-1.5 data-[state=drag]:before:w-12 data-[state=drag]:before:bg-(--rp-accent)',
  },
  grow: {
    vertical:
      'before:bg-muted-foreground/20 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:bg-(--rp-accent) before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-8 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:scale-y-75 before:rounded-full before:transition-[height,width,scale,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:scale-y-100 data-[state=drag]:before:h-14 data-[state=drag]:before:w-1.5 data-[state=drag]:before:scale-y-100',
    horizontal:
      'before:bg-muted-foreground/20 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:bg-(--rp-accent) before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-1 before:w-8 before:-translate-x-1/2 before:-translate-y-1/2 before:scale-x-75 before:rounded-full before:transition-[height,width,scale,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:scale-x-100 data-[state=drag]:before:h-1.5 data-[state=drag]:before:w-14 data-[state=drag]:before:scale-x-100',
  },
  stretch: {
    line: 'data-[state=drag]:bg-(--rp-accent-soft) transition-colors duration-200',
    vertical:
      'before:bg-muted-foreground/20 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:bg-(--rp-accent) before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-6 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-[height,width,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:h-10 data-[state=hover]:before:w-1.5 data-[state=drag]:before:h-20 data-[state=drag]:before:w-1.5',
    horizontal:
      'before:bg-muted-foreground/20 data-[state=hover]:before:bg-muted-foreground/40 data-[state=drag]:before:bg-(--rp-accent) before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-1 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-[height,width,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=hover]:before:h-1.5 data-[state=hover]:before:w-10 data-[state=drag]:before:h-1.5 data-[state=drag]:before:w-20',
  },
}

export type ResizableHandleProps = {
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

function ResizableHandle({ className, style, 'aria-label': ariaLabel = 'Resize panels' }: ResizableHandleProps) {
  const group = useContext(GroupCtx)
  const index = useContext(SlotCtx)
  const [hover, setHover] = useState(false)
  const [drag, setDrag] = useState(false)
  if (!group) return null
  const { options, orientation, sizes, ids, forced } = group
  const ariaOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'
  const state: HandleState = drag ? 'drag' : forced?.index === index ? forced.state : hover ? 'hover' : 'idle'
  const pills = PILLS[options.handleStyle] ?? PILLS.pill!
  const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
  const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const amount = event.shiftKey ? 10 : 5
    if (event.key === prev) group.step(index, -amount)
    else if (event.key === next) group.step(index, amount)
    else if (event.key === 'Home') group.jump(index, 'min')
    else if (event.key === 'End') group.jump(index, 'max')
    else if (event.key === 'Enter') group.toggleCollapse(index)
    else return
    event.preventDefault()
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation={ariaOrientation}
      aria-controls={ids[index]}
      aria-valuenow={Math.round(sizes[index] ?? 0)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="resizable-handle"
      data-state={state}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        setDrag(true)
        group.startDrag(index, event)
      }}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      onLostPointerCapture={() => setDrag(false)}
      onDoubleClick={() => group.toggleCollapse(index)}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex w-px shrink-0 touch-none items-center justify-center bg-border ring-offset-background select-none after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 motion-reduce:before:transition-none',
        orientation === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize',
        pills.line,
        ariaOrientation === 'vertical' ? pills.vertical : pills.horizontal,
        className,
      )}
      style={
        {
          '--rp-accent': options.accent,
          '--rp-accent-soft': `color-mix(in oklab, ${options.accent} 20%, transparent)`,
          ...style,
        } as CSSProperties
      }
    />
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
