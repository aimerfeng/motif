// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/kanban/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars, usePrefersReducedMotion } from '@motif/runtime'
import { animate, LayoutGroup, motion, useMotionValue } from 'motion/react'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal, flushSync } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  density: 'comfortable',
  radius: 8,
  showAvatars: true,
  spring: {
    visualDuration: 0.3,
    bounce: 0.2,
  },
  tilt: 2,
}
/* @motif:end */

type Spring = { visualDuration: number; bounce: number }

// 替代 @dnd-kit 的事件对象：只保留 active 和 over；over.id 是卡片落在的列
export type DragStartEvent = { active: { id: string } }
export type DragOverEvent = { active: { id: string }; over: { id: string } | null }
export type DragEndEvent = DragOverEvent

type KanbanItemProps = {
  id: string
  name: string
  column: string
} & Record<string, unknown>

type KanbanColumnProps = {
  id: string
  name: string
} & Record<string, unknown>

type DragMode = 'pointer' | 'keyboard'

type KanbanContextProps<T extends KanbanItemProps = KanbanItemProps, C extends KanbanColumnProps = KanbanColumnProps> = {
  columns: C[]
  data: T[]
  activeCardId: string | null
  mode: DragMode | null
  /** 正在拖动的卡片当前所在的列（替代 useDroppable 的 isOver）。 */
  overColumn: string | null
  /** 拖动浮层的节点：卡片把自己的副本 portal 进去（替代 tunnel-rat）。 */
  overlay: HTMLElement | null
  density: string
  spring: Spring
  reduced: boolean
  instructionsId: string
  onCardPointerDown: (id: string, event: ReactPointerEvent<HTMLElement>) => void
  onCardKeyDown: (id: string, event: ReactKeyboardEvent<HTMLElement>) => void
}

const noop = () => {}

const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
  mode: null,
  overColumn: null,
  overlay: null,
  density: defaults.density,
  spring: defaults.spring,
  reduced: false,
  instructionsId: '',
  onCardPointerDown: noop,
  onCardKeyDown: noop,
})

export type KanbanBoardProps = {
  id: string
  children: ReactNode
  className?: string
}

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { overColumn } = useContext(KanbanContext)
  const isOver = overColumn === id

  return (
    <div
      className={cn(
        'flex size-full min-h-40 flex-col divide-y overflow-hidden rounded-[var(--kanban-radius)] border bg-secondary text-xs shadow-sm ring-2 transition-shadow duration-200 motion-reduce:transition-none',
        isOver ? 'ring-[color:var(--kanban-accent)]' : 'ring-transparent',
        className,
      )}
      data-kanban-board={id}
    >
      {children}
    </div>
  )
}

export type KanbanCardProps<T extends KanbanItemProps = KanbanItemProps> = T & {
  children?: ReactNode
  className?: string
}

// shadcn Card 的类名，后面再按上游的覆盖写法合并
const CARD = 'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm'

export const KanbanCard = <T extends KanbanItemProps = KanbanItemProps>({ id, name, children, className }: KanbanCardProps<T>) => {
  const { activeCardId, mode, overlay, density, spring, reduced, instructionsId, onCardPointerDown, onCardKeyDown } = useContext(KanbanContext)
  const isDragging = activeCardId === id
  const compact = density === 'compact'
  const content = children ?? <p className="m-0 font-medium text-sm">{name}</p>

  return (
    <>
      <motion.div
        aria-describedby={instructionsId}
        aria-pressed={isDragging || undefined}
        aria-roledescription="sortable"
        className="touch-none select-none rounded-[var(--kanban-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kanban-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
        data-kanban-card={id}
        layout="position"
        layoutId={id}
        onKeyDown={(event) => onCardKeyDown(id, event)}
        onPointerDown={(event) => onCardPointerDown(id, event)}
        role="button"
        tabIndex={0}
        transition={reduced ? { duration: 0 } : { type: 'spring', ...spring }}
      >
        <div
          className={cn(
            CARD,
            'cursor-grab gap-4 rounded-[var(--kanban-radius)] p-3 shadow-sm',
            compact && 'gap-2 p-2.5',
            isDragging && mode === 'pointer' && 'pointer-events-none cursor-grabbing opacity-30',
            isDragging && mode === 'keyboard' && 'shadow-lg ring-2 ring-[color:var(--kanban-accent)]',
            className,
          )}
        >
          {content}
        </div>
      </motion.div>
      {isDragging &&
        mode === 'pointer' &&
        overlay &&
        createPortal(
          <div
            className={cn(
              CARD,
              'cursor-grab gap-4 rounded-[var(--kanban-radius)] p-3 shadow-sm ring-2 ring-[color:var(--kanban-accent)]',
              compact && 'gap-2 p-2.5',
              'cursor-grabbing shadow-black/25 shadow-xl',
              className,
            )}
          >
            {content}
          </div>,
          overlay,
        )}
    </>
  )
}

export type KanbanCardsProps<T extends KanbanItemProps = KanbanItemProps> = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> & {
  children: (item: T) => ReactNode
  id: string
}

export const KanbanCards = <T extends KanbanItemProps = KanbanItemProps>({ children, className, id, ...props }: KanbanCardsProps<T>) => {
  const { data, density } = useContext(KanbanContext) as KanbanContextProps<T>
  const filteredData = data.filter((item) => item.column === id)

  return (
    // 替代 ScrollArea：原生滚动容器；layoutScroll 让布局动画把滚动偏移算进去
    <motion.div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]" layoutScroll>
      <div className={cn('flex flex-grow flex-col gap-2 p-2', density === 'compact' && 'gap-1.5 p-1.5', className)} {...props}>
        {filteredData.map(children)}
      </div>
    </motion.div>
  )
}

export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>

export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => <div className={cn('m-0 p-2 font-semibold text-sm', className)} {...props} />

export type KanbanProviderProps<T extends KanbanItemProps = KanbanItemProps, C extends KanbanColumnProps = KanbanColumnProps> = {
  children: (column: C) => ReactNode
  className?: string
  style?: CSSProperties
  columns: C[]
  data: T[]
  onDataChange?: (data: T[]) => void
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  accent?: string
  density?: string
  radius?: number
  spring?: Spring
  tilt?: number
}

type Session<T> = {
  id: string
  /** null 表示键盘拖动。 */
  pointerId: number | null
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  started: boolean
  column: string
  snapshot: T[]
  cleanup: () => void
}

/** 指针移动超过这个距离才算开始拖动，单击不会被吞掉。 */
const ACTIVATION_DISTANCE = 5

const subscribeNothing = () => noop

const byCardId = (id: string) => `[data-kanban-card="${CSS.escape(id)}"]`

export const KanbanProvider = <T extends KanbanItemProps = KanbanItemProps, C extends KanbanColumnProps = KanbanColumnProps>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  style,
  columns,
  data,
  onDataChange,
  accent = defaults.accent,
  density = defaults.density,
  radius = defaults.radius,
  spring = defaults.spring,
  tilt = defaults.tilt,
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [mode, setMode] = useState<DragMode | null>(null)
  const [lifted, setLifted] = useState<{ width: number; font: string; color: string } | null>(null)
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false)
  const reduced = usePrefersReducedMotion()
  const instructionsId = useId()
  const groupId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rotate = useMotionValue(0)

  // 窗口上的指针监听器在拖动期间一直存在，通过 ref 读最新的 props
  const latest = useRef({ data, columns, onDataChange, onDragStart, onDragOver, onDragEnd, spring, tilt, reduced })
  latest.current = { data, columns, onDataChange, onDragStart, onDragOver, onDragEnd, spring, tilt, reduced }
  const drag = useRef<{ session: Session<T> | null; dropping: (() => void) | null; token: number }>({ session: null, dropping: null, token: 0 })

  const nameOf = (id: string) => latest.current.data.find((item) => item.id === id)?.name
  const columnName = (id: string) => latest.current.columns.find((column) => column.id === id)?.name ?? id

  /** 同步提交新顺序：下一次命中检测量到的就是新布局。 */
  const commit = (next: T[]) => {
    latest.current.data = next
    flushSync(() => latest.current.onDataChange?.(next))
  }

  /** 把卡片放到某一列的第 index 张（不计它自己），顺序没变时什么都不做。 */
  const moveCard = (id: string, column: string, index: number) => {
    const list = latest.current.data
    const item = list.find((entry) => entry.id === id)
    if (!item) return
    const rest = list.filter((entry) => entry.id !== id)
    const siblings = rest.filter((entry) => entry.column === column)
    const target = Math.max(0, Math.min(index, siblings.length))
    if (item.column === column && list.filter((entry) => entry.column === column).indexOf(item) === target) return
    const before = siblings[target]
    const last = siblings.at(-1)
    const at = before ? rest.indexOf(before) : last ? rest.indexOf(last) + 1 : rest.length
    commit([...rest.slice(0, at), { ...item, column }, ...rest.slice(at)])
  }

  const notifyOver = (session: Session<T>, column: string) => {
    if (session.column === column) return
    session.column = column
    setAnnouncement(`Dragged the card "${nameOf(session.id)}" over the "${columnName(column)}" column`)
    latest.current.onDragOver?.({ active: { id: session.id }, over: { id: column } })
  }

  /** 替代 closestCenter：离浮层中心最近的列，再按列里其他卡片的中线算插入位置。 */
  const hitTest = (cx: number, cy: number, id: string) => {
    const root = rootRef.current
    if (!root) return null
    let best: { column: string; element: HTMLElement; distance: number } | null = null
    for (const element of root.querySelectorAll<HTMLElement>('[data-kanban-board]')) {
      const rect = element.getBoundingClientRect()
      const dx = Math.max(rect.left - cx, 0, cx - rect.right)
      const dy = Math.max(rect.top - cy, 0, cy - rect.bottom)
      const distance = Math.hypot(dx, dy)
      if (!best || distance < best.distance) best = { column: element.dataset.kanbanBoard ?? '', element, distance }
    }
    if (!best) return null
    let index = 0
    for (const card of best.element.querySelectorAll<HTMLElement>('[data-kanban-card]')) {
      if (card.dataset.kanbanCard === id) continue
      const rect = card.getBoundingClientRect()
      if (rect.top + rect.height / 2 < cy) index++
    }
    return { column: best.column, index }
  }

  const settle = () => {
    const state = drag.current
    state.dropping?.()
    state.dropping = null
    state.token++
    setLifted(null)
    setActiveCardId(null)
    setMode(null)
  }

  /** 松手：浮层飞回占位卡片的位置再消失（dnd-kit 的 drop animation）。 */
  const land = (id: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(byCardId(id))
    if (!target || latest.current.reduced) {
      settle()
      return
    }
    // 占位卡片可能还在做布局动画，扣掉当前的位移就是它最终的位置
    const rect = target.getBoundingClientRect()
    const transform = getComputedStyle(target).transform
    const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : new DOMMatrixReadOnly()
    const transition = { type: 'spring', ...latest.current.spring } as const
    const controls = [animate(x, rect.left - matrix.e, transition), animate(y, rect.top - matrix.f, transition), animate(scale, 1, transition), animate(rotate, 0, transition)]
    const state = drag.current
    const token = ++state.token
    state.dropping = () => controls.forEach((control) => control.stop())
    void Promise.all(controls.map((control) => control.finished)).then(() => {
      if (drag.current.token === token) settle()
    })
  }

  const endSession = (session: Session<T>, cancelled: boolean) => {
    session.cleanup()
    drag.current.session = null
    if (!session.started) return
    const name = nameOf(session.id)
    if (cancelled) {
      commit(session.snapshot)
      setAnnouncement(`Cancelled dragging the card "${name}"`)
    } else {
      setAnnouncement(`Dropped the card "${name}" into the "${columnName(session.column)}" column`)
    }
    const column = latest.current.data.find((item) => item.id === session.id)?.column ?? session.column
    latest.current.onDragEnd?.({ active: { id: session.id }, over: cancelled ? null : { id: column } })
    if (session.pointerId === null) {
      setActiveCardId(null)
      setMode(null)
    } else {
      land(session.id)
    }
  }

  const begin = (session: Session<T>, source: HTMLElement) => {
    const rect = source.getBoundingClientRect()
    session.started = true
    session.offsetX = session.startX - rect.left
    session.offsetY = session.startY - rect.top
    session.width = rect.width
    session.height = rect.height
    x.set(rect.left)
    y.set(rect.top)
    scale.set(1)
    rotate.set(0)
    // 浮层 portal 到 body，字体和文字颜色从看板根节点带过去
    const computed = getComputedStyle(rootRef.current ?? source)
    setLifted({ width: rect.width, font: computed.fontFamily, color: computed.color })
    setActiveCardId(session.id)
    setMode('pointer')
    const { spring: lift, tilt: angle, reduced: still } = latest.current
    if (!still) {
      animate(scale, 1.03, { type: 'spring', ...lift })
      animate(rotate, angle, { type: 'spring', ...lift })
    }
    setAnnouncement(`Picked up the card "${nameOf(session.id)}" from the "${columnName(session.column)}" column`)
    latest.current.onDragStart?.({ active: { id: session.id } })
  }

  const onCardPointerDown = (id: string, event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    const current = drag.current.session
    if (current) {
      if (current.pointerId !== null) return
      endSession(current, false)
    }
    if (drag.current.dropping) settle()
    const item = latest.current.data.find((entry) => entry.id === id)
    if (!item) return
    const source = event.currentTarget
    const pointerId = event.pointerId
    const session: Session<T> = {
      id,
      pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
      started: false,
      column: item.column,
      snapshot: latest.current.data,
      cleanup: noop,
    }
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      if (!session.started) {
        if (Math.hypot(moveEvent.clientX - session.startX, moveEvent.clientY - session.startY) < ACTIVATION_DISTANCE) return
        begin(session, source)
      }
      const left = moveEvent.clientX - session.offsetX
      const top = moveEvent.clientY - session.offsetY
      x.set(left)
      y.set(top)
      const hit = hitTest(left + session.width / 2, top + session.height / 2, id)
      if (!hit) return
      moveCard(id, hit.column, hit.index)
      notifyOver(session, hit.column)
    }
    const up = (upEvent: PointerEvent) => {
      if (upEvent.pointerId === pointerId) endSession(session, false)
    }
    const cancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId === pointerId) endSession(session, true)
    }
    const escape = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== 'Escape') return
      keyEvent.preventDefault()
      endSession(session, true)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('keydown', escape)
    session.cleanup = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('keydown', escape)
    }
    drag.current.session = session
  }

  // 替代 KeyboardSensor：空格 / 回车拿起和放下，方向键在列内和列间移动，Esc 取消
  const onCardKeyDown = (id: string, event: ReactKeyboardEvent<HTMLElement>) => {
    const session = drag.current.session
    const pick = event.key === ' ' || event.key === 'Enter'
    if (!session) {
      if (!pick) return
      event.preventDefault()
      if (drag.current.dropping) settle()
      const item = latest.current.data.find((entry) => entry.id === id)
      if (!item) return
      drag.current.session = {
        id,
        pointerId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        started: true,
        column: item.column,
        snapshot: latest.current.data,
        cleanup: noop,
      }
      setActiveCardId(id)
      setMode('keyboard')
      setAnnouncement(`Picked up the card "${item.name}" from the "${columnName(item.column)}" column`)
      latest.current.onDragStart?.({ active: { id } })
      return
    }
    if (session.pointerId !== null || session.id !== id) return
    const list = latest.current.data
    const item = list.find((entry) => entry.id === id)
    if (!item) return
    const index = list.filter((entry) => entry.column === item.column).indexOf(item)
    const order = latest.current.columns
    const columnIndex = order.findIndex((column) => column.id === item.column)
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        moveCard(id, item.column, index + (event.key === 'ArrowUp' ? -1 : 1))
        break
      case 'ArrowLeft':
      case 'ArrowRight': {
        const next = order[columnIndex + (event.key === 'ArrowLeft' ? -1 : 1)]
        if (!next) break
        moveCard(id, next.id, index)
        notifyOver(session, next.id)
        break
      }
      case ' ':
      case 'Enter':
        endSession(session, false)
        break
      case 'Escape':
        endSession(session, true)
        break
      default:
        return
    }
    event.preventDefault()
  }

  // 卡片换列时会重新挂载，键盘拖动中把焦点还给它
  useLayoutEffect(() => {
    if (mode !== 'keyboard' || !activeCardId) return
    const element = rootRef.current?.querySelector<HTMLElement>(byCardId(activeCardId))
    if (element && document.activeElement !== element) element.focus()
  }, [mode, activeCardId, data])

  useEffect(() => {
    const state = drag.current
    return () => {
      state.session?.cleanup()
      state.dropping?.()
    }
  }, [])

  const overColumn = activeCardId ? (data.find((item) => item.id === activeCardId)?.column ?? null) : null
  const vars = { '--kanban-accent': accent, '--kanban-radius': `${radius}px` }

  return (
    <KanbanContext.Provider
      value={{
        columns,
        data,
        activeCardId,
        mode,
        overColumn,
        overlay,
        density,
        spring,
        reduced,
        instructionsId,
        onCardPointerDown,
        onCardKeyDown,
      }}
    >
      <LayoutGroup id={groupId}>
        <div className={cn('grid size-full auto-cols-fr grid-flow-col gap-4', className)} ref={rootRef} style={cssVars(vars, style)}>
          {columns.map((column) => children(column))}
        </div>
      </LayoutGroup>
      <p hidden id={instructionsId}>
        Press space or enter to pick up a card. Use the arrow keys to move it within a column or to the next column, space or enter to drop it, and escape to cancel.
      </p>
      <div aria-atomic="true" aria-live="assertive" className="sr-only">
        {announcement}
      </div>
      {isClient &&
        createPortal(
          <div style={cssVars(vars)}>
            <motion.div
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 z-50 text-xs"
              ref={setOverlay}
              style={{ x, y, scale, rotate, width: lifted?.width, fontFamily: lifted?.font, color: lifted?.color, visibility: lifted ? 'visible' : 'hidden' }}
            />
          </div>,
          document.body,
        )}
    </KanbanContext.Provider>
  )
}

// ---- 以下是按上游示例（apps/docs/examples/kanban.tsx）组合好的看板，参数从这里接入 ----

export type KanbanOwner = { name: string; initials?: string; color?: string }

export type KanbanFeature = {
  id: string
  name: string
  column: string
  startAt?: Date
  endAt?: Date
  owner?: KanbanOwner
}

export type KanbanColumn = { id: string; name: string; color?: string }

export type KanbanProps = Partial<typeof defaults> & {
  columns: KanbanColumn[]
  data: KanbanFeature[]
  onDataChange?: (data: KanbanFeature[]) => void
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  className?: string
  style?: CSSProperties
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

/** 头像底色上用深色还是浅色字：按相对亮度挑对比度更高的那个。 */
function inkFor(hex: string) {
  const value = hex.replace('#', '')
  const channel = (offset: number) => {
    const c = Number.parseInt(value.slice(offset, offset + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return (luminance + 0.05) / 0.05 > 1.05 / (luminance + 0.05) ? '#111827' : '#ffffff'
}

// 替代 shadcn Avatar：没有图片，用首字母
function Avatar({ owner }: { owner: KanbanOwner }) {
  const color = owner.color ?? '#64748b'
  const initials =
    owner.initials ??
    owner.name
      .split(/\s+/)
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
  return (
    <span
      aria-label={owner.name}
      className="grid size-5 shrink-0 place-items-center rounded-full font-semibold text-[9px] leading-none"
      role="img"
      style={{ backgroundColor: color, color: inkFor(color) }}
    >
      {initials}
    </span>
  )
}

export function Kanban({ columns, data, onDataChange, onDragStart, onDragEnd, onDragOver, className, style, ...props }: KanbanProps) {
  const options = { ...defaults, ...props }

  return (
    // 窄屏时列宽保持在 13rem 以上，看板横向滚动
    <motion.div className={cn('size-full min-w-0 overflow-x-auto', className)} layoutScroll style={style}>
      <KanbanProvider
        accent={options.accent}
        className="auto-cols-[minmax(13rem,1fr)] p-[2px]"
        columns={columns}
        data={data}
        density={options.density}
        onDataChange={onDataChange}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        radius={options.radius}
        spring={options.spring}
        tilt={options.tilt}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                <span>{column.name}</span>
                <span className="ml-auto font-normal text-muted-foreground text-xs tabular-nums">{data.filter((item) => item.column === column.id).length}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(feature: KanbanFeature) => (
                <KanbanCard column={column.id} id={feature.id} key={feature.id} name={feature.name}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex-1 font-medium text-sm">{feature.name}</p>
                    </div>
                    {options.showAvatars && feature.owner && <Avatar owner={feature.owner} />}
                  </div>
                  {feature.startAt && feature.endAt && (
                    <p className="m-0 text-muted-foreground text-xs">
                      {shortDateFormatter.format(feature.startAt)} - {dateFormatter.format(feature.endAt)}
                    </p>
                  )}
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </motion.div>
  )
}
