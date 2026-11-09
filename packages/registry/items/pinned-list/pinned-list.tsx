// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/pinned-list/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  maxPinned: 5,
  showDivider: true,
  density: 'comfortable',
  accent: '#fe65b0',
  spring: {
    visualDuration: 0.3,
    bounce: 0.3,
  },
  label: 'Inbox',
}
/* @motif:end */

/* -------------------------------------------------------------------------- */
/* Motion tokens                                                              */
/* -------------------------------------------------------------------------- */

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const INSTANT = { duration: 0 }
/** Entrance/exit of a brand-new row — restrained. */
const ENTER_SPRING = { bounce: 0.1, duration: 0.25, type: 'spring' as const }
/** Leaving is the user's decision already made — get out of the way faster. */
const EXIT_TRANSITION = { duration: 0.15, ease: EASE_OUT }
/** The pin icon's own, snappier spring. */
const PIN_SPRING = { bounce: 0.32, duration: 0.2, type: 'spring' as const }
/** Rows closing the gap settle one after the other instead of as a rigid block. */
const STAGGER_STEP = 0.025
const MAX_STAGGER = 0.1
/**
 * The landing pop, as a damped squash rather than an inflate. A row that grows
 * past 1 pushes outside the list's box, and the list almost always sits inside
 * a scroller — so the pop got sliced off exactly when it was biggest. Every
 * keyframe here stays at or below 1, so the row can never breach its own
 * bounds no matter how wide it is; the compression settles in two decaying
 * steps, which is how weight actually lands.
 */
const POP_SCALE = [1, 0.985, 0.997, 1]
const POP_TIMES = [0, 0.3, 0.62, 1]
const POP_DURATION = 0.34
const PINNED_ROTATION = 45
/**
 * Rows never sit flush against the list's edge: 4px of padding keeps the
 * landing rebound, the launch spring's overshoot and the 4px focus ring
 * (2px ring + 2px offset) inside whatever clips this list.
 */
const ROW_HALO = 'p-1'

/** 两档密度：comfortable 即上游的间距。 */
const DENSITY = {
  comfortable: { list: 'gap-2', row: 'gap-3 p-3', empty: 'p-3' },
  compact: { list: 'gap-1', row: 'gap-2.5 px-3 py-2', empty: 'px-3 py-2' },
}
type Density = (typeof DENSITY)[keyof typeof DENSITY]

type Spring = { visualDuration: number; bounce: number }

export type PinnedListItem = {
  icon?: ReactNode
  id: string
  meta?: string
  pinned?: boolean
  title: string
}

export type PinnedListProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  emptyPinnedMessage?: string
  items: PinnedListItem[]
  onPinnedChange?: (ids: string[]) => void
  pinnedIds?: string[]
  renderItem?: (item: PinnedListItem, isPinned: boolean) => ReactNode
}

const PinIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M8 3h8" />
    <path d="M9.5 3h5v6.2l3 3.8v3h-11v-3l3-3.8z" />
    <path d="M12 16v5" />
  </svg>
)

/* -------------------------------------------------------------------------- */
/* Row                                                                       */
/* -------------------------------------------------------------------------- */

type RowProps = {
  density: Density
  groupIndex: number
  isFocused: boolean
  isPinned: boolean
  item: PinnedListItem
  justPinned: boolean
  launchSpring: Spring
  onKeyDownRow: (event: KeyboardEvent<HTMLDivElement>, index: number) => void
  onPopDone: () => void
  onTogglePin: (id: string) => void
  pinDisabled: boolean
  registerRef: (id: string, el: HTMLDivElement | null) => void
  renderItem?: (item: PinnedListItem, isPinned: boolean) => ReactNode
  rowIndex: number
  shouldReduceMotion: boolean
}

const Row = ({
  density,
  groupIndex,
  isFocused,
  isPinned,
  item,
  justPinned,
  launchSpring,
  onKeyDownRow,
  onPopDone,
  onTogglePin,
  pinDisabled,
  registerRef,
  renderItem,
  rowIndex,
  shouldReduceMotion,
}: RowProps) => {
  // The row that was just acted on leads; the rows closing the gap trail it.
  const layoutDelay = isPinned ? 0 : Math.min(groupIndex * STAGGER_STEP, MAX_STAGGER)

  return (
    <motion.li
      className="list-none"
      layout={shouldReduceMotion ? false : 'position'}
      transition={
        shouldReduceMotion
          ? INSTANT
          : {
              default: ENTER_SPRING,
              layout: { type: 'spring', visualDuration: launchSpring.visualDuration, bounce: launchSpring.bounce, delay: layoutDelay },
            }
      }
    >
      {/* The row itself is the control: it carries the roving tabindex, so
          Arrow/Home/End/P all reach a handler that is actually focused. */}
      <motion.div
        animate={justPinned && !shouldReduceMotion ? { scale: POP_SCALE } : { scale: 1 }}
        aria-disabled={pinDisabled || undefined}
        aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${item.title}`}
        aria-pressed={isPinned}
        className={cn(
          'group relative flex items-center rounded-xl border outline-none',
          density.row,
          'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Pinned rows are raised, not tinted: a solid surface lifted off the
          // list with a real shadow and a crisper edge, the way the rest of the
          // library marks a selected surface. Dark mode lifts with light
          // instead, because a shadow has nothing to fall on there.
          isPinned
            ? 'border-foreground/15 bg-background shadow-black/[0.07] shadow-sm dark:border-foreground/20 dark:bg-foreground/[0.07] dark:shadow-none'
            : 'border-foreground/[0.08] bg-transparent',
          pinDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-foreground/20',
        )}
        initial={false}
        onAnimationComplete={() => {
          // 上游用 setTimeout 复位；这里等落地动画真正播完再复位，时间跟着动画走。
          if (justPinned) onPopDone()
        }}
        onClick={() => {
          if (!pinDisabled) {
            onTogglePin(item.id)
          }
        }}
        onKeyDown={(event) => onKeyDownRow(event, rowIndex)}
        ref={(el) => {
          registerRef(item.id, el)
        }}
        role="button"
        tabIndex={isFocused ? 0 : -1}
        transition={shouldReduceMotion ? INSTANT : { duration: POP_DURATION, ease: EASE_OUT, times: POP_TIMES }}
      >
        {/* The only piece of brand colour on the row: a short rail on the
            leading edge. It grows out of nothing on pin, so the state change
            is structural rather than a rectangle of fill appearing. */}
        <motion.span
          animate={{
            opacity: isPinned ? 1 : 0,
            scaleY: isPinned ? 1 : 0.2,
          }}
          aria-hidden="true"
          className="absolute top-1/2 left-0 h-5 w-[3px] rounded-r-full bg-(--pl-accent)"
          initial={false}
          style={{ y: '-50%' }}
          transition={shouldReduceMotion ? INSTANT : PIN_SPRING}
        />
        <div className="min-w-0 flex-1">
          {renderItem ? (
            renderItem(item, isPinned)
          ) : (
            <div className="flex items-center gap-2">
              {item.icon ? (
                <span aria-hidden="true" className={cn('shrink-0 transition-colors duration-200', isPinned ? 'text-foreground' : 'text-foreground/45')}>
                  {item.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground text-sm">{item.title}</p>
                {item.meta ? <p className="truncate text-muted-foreground text-xs">{item.meta}</p> : null}
              </div>
            </div>
          )}
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
            isPinned ? 'text-(--pl-accent)' : 'text-foreground/40 group-hover:bg-foreground/5 group-hover:text-foreground',
          )}
        >
          <motion.span
            animate={{ rotate: isPinned ? PINNED_ROTATION : 0 }}
            className="flex items-center justify-center"
            initial={false}
            transition={shouldReduceMotion ? INSTANT : PIN_SPRING}
          >
            <PinIcon className={cn('size-4', isPinned && 'fill-current')} />
          </motion.span>
        </span>
      </motion.div>
    </motion.li>
  )
}

/* -------------------------------------------------------------------------- */
/* Root                                                                      */
/* -------------------------------------------------------------------------- */

/** 置顶列表：点击或按 P / Enter / Space 置顶，行飞进顶部的置顶区；方向键、Home / End 在行间移动。 */
export const PinnedList = ({
  className,
  style,
  emptyPinnedMessage = 'Pin an item to keep it at the top.',
  items,
  onPinnedChange,
  pinnedIds,
  renderItem,
  ...props
}: PinnedListProps) => {
  const { maxPinned, showDivider, density: densityKey, accent, spring, label } = { ...defaults, ...props }
  const density = DENSITY[densityKey as keyof typeof DENSITY] ?? DENSITY.comfortable
  const shouldReduceMotion = Boolean(useReducedMotion())
  const [internalPinned, setInternalPinned] = useState<string[]>(() => items.filter((item) => item.pinned).map((item) => item.id))
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [justPinnedId, setJustPinnedId] = useState<string | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  // A row that moves between the two groups is re-inserted in the DOM, which
  // can drop focus. Remember which row to hand focus back to after the move.
  const restoreFocusRef = useRef<string | null>(null)

  const isControlled = pinnedIds !== undefined
  const pinned = isControlled ? pinnedIds : internalPinned

  const clearJustPinned = useCallback(() => setJustPinnedId(null), [])

  const pinnedItems = useMemo(() => items.filter((item) => pinned.includes(item.id)), [items, pinned])
  const unpinnedItems = useMemo(() => items.filter((item) => !pinned.includes(item.id)), [items, pinned])
  const orderedItems = useMemo(() => [...pinnedItems, ...unpinnedItems], [pinnedItems, unpinnedItems])

  // Exactly one row is tabbable at a time, and it is always a row that exists.
  const activeFocusId = focusedId && orderedItems.some((item) => item.id === focusedId) ? focusedId : (orderedItems[0]?.id ?? null)

  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      rowRefs.current.set(id, el)
    } else {
      rowRefs.current.delete(id)
    }
  }, [])

  const setPinned = (next: string[]) => {
    if (!isControlled) {
      setInternalPinned(next)
    }
    onPinnedChange?.(next)
  }

  const togglePin = (id: string) => {
    // Keep focus on the row the user acted on, even though pinning moves it.
    if (rowRefs.current.get(id) === document.activeElement) {
      restoreFocusRef.current = id
    }
    setFocusedId(id)

    if (pinned.includes(id)) {
      setJustPinnedId(null)
      setPinned(pinned.filter((pinnedId) => pinnedId !== id))
      return
    }
    if (pinned.length >= maxPinned) {
      return
    }
    setJustPinnedId(id)
    setPinned([...pinned, id])
  }

  useEffect(() => {
    const id = restoreFocusRef.current
    if (!id) {
      return
    }
    restoreFocusRef.current = null
    rowRefs.current.get(id)?.focus()
  })

  const focusRowAt = (index: number) => {
    const total = orderedItems.length
    if (total === 0) {
      return
    }
    const nextItem = orderedItems[((index % total) + total) % total]
    setFocusedId(nextItem.id)
    rowRefs.current.get(nextItem.id)?.focus()
  }

  const handleKeyDownRow = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusRowAt(index + 1)
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusRowAt(index - 1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusRowAt(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusRowAt(orderedItems.length - 1)
      return
    }
    if (event.key === 'p' || event.key === 'P' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const item = orderedItems[index]
      if (item) {
        togglePin(item.id)
      }
    }
  }

  const pinDisabled = pinned.length >= maxPinned
  const showEmptyPinned = pinnedItems.length === 0
  const showSeparator = showDivider && pinnedItems.length > 0 && unpinnedItems.length > 0

  const rowProps = {
    density,
    launchSpring: spring,
    onKeyDownRow: handleKeyDownRow,
    onPopDone: clearJustPinned,
    onTogglePin: togglePin,
    registerRef,
    renderItem,
    shouldReduceMotion,
  }

  return (
    <div className={cn('flex flex-col', className)} style={{ '--pl-accent': accent, ...style } as CSSProperties}>
      {/* One list, not two: a pinned row is reordered inside its own parent
          instead of being torn out of one list and rebuilt in another. */}
      <ul aria-label={label} className={cn('flex flex-col', density.list, ROW_HALO)}>
        {/* popLayout takes the leaving placeholder out of flow on the first
            frame, so the rows above it move as one — and, because nothing is
            left waiting on a layout animation, its exit actually completes. */}
        <AnimatePresence initial={false} mode="popLayout">
          {showEmptyPinned ? (
            <motion.li
              animate={{ opacity: 1 }}
              className={cn('list-none rounded-xl border border-foreground/15 border-dashed text-muted-foreground text-sm', density.empty)}
              exit={shouldReduceMotion ? { opacity: 0, transition: INSTANT } : { opacity: 0, transition: EXIT_TRANSITION }}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              key="empty-pinned"
              transition={shouldReduceMotion ? INSTANT : ENTER_SPRING}
            >
              {emptyPinnedMessage}
            </motion.li>
          ) : null}
        </AnimatePresence>

        {/* 两组行放进同一个数组：React 只在同一个数组里按 key 复用节点，
            分成两个 map 时换组的行会被卸载重建，飞入的布局动画就丢了。 */}
        {[
          ...pinnedItems.map((item, groupIndex) => (
            <Row
              {...rowProps}
              groupIndex={groupIndex}
              isFocused={activeFocusId === item.id}
              isPinned
              item={item}
              justPinned={justPinnedId === item.id}
              key={item.id}
              pinDisabled={false}
              rowIndex={groupIndex}
            />
          )),
          // A hairline is below the threshold worth animating; it also keeps
          // the exiting-child machinery off the one element in the list that
          // has no content of its own.
          showSeparator ? <li aria-hidden="true" className="my-1 list-none border-foreground/10 border-t" key="pinned-separator" /> : null,
          ...unpinnedItems.map((item, groupIndex) => (
            <Row
              {...rowProps}
              groupIndex={groupIndex}
              isFocused={activeFocusId === item.id}
              isPinned={false}
              item={item}
              justPinned={false}
              key={item.id}
              pinDisabled={pinDisabled}
              rowIndex={pinnedItems.length + groupIndex}
            />
          )),
        ]}
      </ul>
    </div>
  )
}
