// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/deck/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, type PanInfo, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import {
  Children,
  cloneElement,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

/* @motif:defaults */
export const defaults = {
  threshold: 150,
  maxRotate: 25,
  stackDepth: 3,
  radius: 16,
  showStamps: true,
  spring: {
    visualDuration: 0.3,
    bounce: 0,
  },
  cardAspect: '3 / 4',
}
/* @motif:end */

type Direction = 'left' | 'right'
type Spring = { visualDuration: number; bounce: number }

/** 受控 / 非受控状态（替代 @radix-ui/react-use-controllable-state）。 */
function useControllableState<T>({ prop, defaultProp, onChange }: { prop?: T; defaultProp: T; onChange?: (value: T) => void }) {
  const [inner, setInner] = useState(defaultProp)
  const controlled = prop !== undefined
  const value = controlled ? (prop as T) : inner
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )
  return [value, setValue] as const
}

export type DeckProps = HTMLAttributes<HTMLDivElement>

export const Deck = ({ className, ...props }: DeckProps) => <div className={cn('relative isolate', className)} {...props} />

export type DeckCardsProps = HTMLAttributes<HTMLDivElement> & {
  onSwipe?: (index: number, direction: Direction) => void
  onSwipeEnd?: (index: number, direction: Direction) => void
  threshold?: number
  stackSize?: number
  perspective?: number
  scale?: number
  maxRotate?: number
  radius?: number
  showStamps?: boolean
  spring?: Spring
  currentIndex?: number
  defaultCurrentIndex?: number
  onCurrentIndexChange?: (index: number) => void
  animateOnIndexChange?: boolean
  indexChangeDirection?: Direction
  /** 不拖动时强制顶部卡片的横向偏移（演示自动播放用）。 */
  previewOffset?: number
}

export const DeckCards = ({
  children,
  className,
  onSwipe,
  onSwipeEnd,
  threshold = 150,
  stackSize = 3,
  perspective = 1000,
  scale = 0.05,
  maxRotate = 25,
  radius = 8,
  showStamps = true,
  spring = { visualDuration: 0.3, bounce: 0 },
  currentIndex: currentIndexProp,
  defaultCurrentIndex = 0,
  onCurrentIndexChange,
  animateOnIndexChange = true,
  indexChangeDirection = 'left',
  previewOffset,
  style,
  ...props
}: DeckCardsProps) => {
  const reduced = useReducedMotion() ?? false
  const childrenArray = Children.toArray(children) as ReactElement[]
  const [currentIndex, setCurrentIndex] = useControllableState({
    prop: currentIndexProp,
    defaultProp: defaultCurrentIndex,
    onChange: onCurrentIndexChange,
  })
  const [exitDirection, setExitDirection] = useState<Direction | null>(null)
  const [displayIndex, setDisplayIndex] = useState(currentIndex)
  const isInternalChangeRef = useRef(false)
  const prevIndexRef = useRef(currentIndex)
  // 退场动画结束后要做的事（替代上游的 setTimeout(300)）
  const pendingRef = useRef<(() => void) | null>(null)

  // Detect external currentIndex changes and trigger animation
  useEffect(() => {
    const prevIndex = prevIndexRef.current

    // Skip initial mount and internal changes
    if (prevIndex === currentIndex || isInternalChangeRef.current) {
      isInternalChangeRef.current = false
      prevIndexRef.current = currentIndex
      setDisplayIndex(currentIndex)
      return
    }

    // Only animate if the option is enabled and we have cards to show
    if (animateOnIndexChange && !reduced && currentIndex > prevIndex && prevIndex < childrenArray.length) {
      setExitDirection(indexChangeDirection)
      pendingRef.current = () => {
        setExitDirection(null)
        setDisplayIndex(currentIndex)
      }
    } else {
      // No animation, update display index immediately
      pendingRef.current = null
      setExitDirection(null)
      setDisplayIndex(currentIndex)
    }

    prevIndexRef.current = currentIndex
  }, [currentIndex, animateOnIndexChange, indexChangeDirection, childrenArray.length, reduced])

  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (displayIndex >= childrenArray.length || exitDirection) {
        return
      }

      onSwipe?.(displayIndex, direction)
      onSwipeEnd?.(displayIndex, direction)

      const advance = () => {
        isInternalChangeRef.current = true
        const newIndex = displayIndex + 1
        setCurrentIndex(newIndex)
        setDisplayIndex(newIndex)
        setExitDirection(null)
      }

      if (reduced) {
        advance()
        return
      }

      setExitDirection(direction)
      // Move to next card after animation
      pendingRef.current = advance
    },
    [displayIndex, childrenArray.length, exitDirection, onSwipe, onSwipeEnd, setCurrentIndex, reduced],
  )

  const handleExited = useCallback(() => {
    const pending = pendingRef.current
    pendingRef.current = null
    pending?.()
  }, [])

  const visibleCards = childrenArray.slice(displayIndex, displayIndex + stackSize)

  if (displayIndex >= childrenArray.length) {
    return null
  }

  const stackTransition = reduced ? { duration: 0 } : { type: 'spring' as const, ...spring }

  return (
    <div className={cn('relative z-10 size-full', className)} style={{ perspective, ...style }} {...props}>
      {visibleCards.map((child, index) => {
        const isTopCard = !index
        const zIndex = stackSize - index
        const scaleValue = 1 - index * scale
        const yOffset = index * 4
        const cardKey = `${displayIndex}-${child.key ?? index}`

        if (isTopCard) {
          return (
            <DeckCard
              exitDirection={exitDirection}
              key={cardKey}
              maxRotate={reduced ? 0 : maxRotate}
              onExited={handleExited}
              onSwipe={handleSwipe}
              previewOffset={previewOffset}
              radius={radius}
              reduced={reduced}
              showStamps={showStamps}
              spring={spring}
              style={{
                zIndex,
                scale: scaleValue,
                y: yOffset,
              }}
              threshold={threshold}
            >
              {child}
            </DeckCard>
          )
        }

        const nextCardScale = index === 1 && exitDirection ? 1 : scaleValue
        const nextCardY = index === 1 && exitDirection ? 0 : yOffset
        const castedChild = child as ReactElement<HTMLAttributes<HTMLDivElement>>

        return (
          <motion.div
            animate={{
              scale: nextCardScale,
              y: nextCardY,
            }}
            aria-hidden
            className="absolute inset-0"
            key={cardKey}
            style={{
              zIndex,
              scale: scaleValue,
              y: yOffset,
            }}
            transition={stackTransition}
          >
            {cloneElement(castedChild, {
              className: cn('h-full w-full select-none shadow-lg', castedChild.props.className),
              style: { borderRadius: radius, ...castedChild.props.style },
            })}
          </motion.div>
        )
      })}
    </div>
  )
}

type DeckCardProps = {
  children: ReactElement
  onSwipe: (direction: Direction) => void
  onExited: () => void
  threshold: number
  maxRotate: number
  radius: number
  showStamps: boolean
  spring: Spring
  reduced: boolean
  previewOffset?: number
  style?: object
  exitDirection: Direction | null
}

const DeckCard = ({ children, onSwipe, onExited, threshold, maxRotate, radius, showStamps, spring, reduced, previewOffset, style, exitDirection }: DeckCardProps) => {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-maxRotate, maxRotate])
  const opacity = useTransform(x, [-200, -threshold, 0, threshold, 200], [0, 1, 1, 1, 0])
  const likeOpacity = useTransform(x, [0, threshold * 0.6], [0, 1])
  const nopeOpacity = useTransform(x, [-threshold * 0.6, 0], [1, 0])

  useEffect(() => {
    if (previewOffset === undefined || exitDirection) return
    x.set(previewOffset)
  }, [previewOffset, exitDirection, x])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = threshold

    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction)
    }
  }

  let exitX = 0

  if (exitDirection === 'left') {
    exitX = -500
  } else if (exitDirection === 'right') {
    exitX = 500
  }

  const castedChildren = children as ReactElement<HTMLAttributes<HTMLDivElement>>

  return (
    <motion.div
      animate={exitDirection ? { x: exitX, opacity: 0 } : undefined}
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      drag={exitDirection ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onAnimationComplete={() => {
        if (exitDirection) onExited()
      }}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      transition={{ x: { type: 'spring', ...spring }, opacity: { duration: 0.3, ease: 'easeOut' } }}
      whileDrag={reduced ? undefined : { scale: 1.05 }}
    >
      {cloneElement(castedChildren, {
        className: cn('h-full w-full select-none shadow-lg', castedChildren.props.className),
        style: { borderRadius: radius, ...castedChildren.props.style },
      })}
      {showStamps ? (
        <>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-5 left-5 -rotate-12 rounded-md border-[3px] border-emerald-400 px-2 py-0.5 text-lg font-extrabold tracking-widest text-emerald-400 uppercase"
            style={{ opacity: likeOpacity }}
          >
            Like
          </motion.span>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-5 right-5 rotate-12 rounded-md border-[3px] border-rose-400 px-2 py-0.5 text-lg font-extrabold tracking-widest text-rose-400 uppercase"
            style={{ opacity: nopeOpacity }}
          >
            Nope
          </motion.span>
        </>
      ) : null}
    </motion.div>
  )
}

export type DeckItemProps = HTMLAttributes<HTMLDivElement>

export const DeckItem = ({ className, ...props }: DeckItemProps) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-lg border bg-card text-card-foreground shadow-lg', className)} {...props} />
)

export type DeckEmptyProps = HTMLAttributes<HTMLDivElement>

export const DeckEmpty = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('absolute inset-0 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground', className)} {...props}>
    {children ?? <p className="text-sm">No more cards</p>}
  </div>
)

export type SwipeDeckProps = Partial<typeof defaults> & {
  threshold?: number
  maxRotate?: number
  stackDepth?: number
  radius?: number
  showStamps?: boolean
  spring?: Spring
  cardAspect?: string
  children?: ReactNode
  /** 卡片用完后显示的内容。 */
  empty?: ReactNode
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onSwipe?: (index: number, direction: Direction) => void
  previewOffset?: number
  /** 外部改变 index 时卡片飞出的方向（演示自动播放用）。 */
  exitDirection?: Direction
  label?: string
  className?: string
  style?: CSSProperties
}

/** 拖拽滑动卡片堆：拖过阈值飞出，按钮和左右方向键同样可以选择。 */
export function SwipeDeck({ children, empty, index, defaultIndex = 0, onIndexChange, onSwipe, previewOffset, exitDirection, label = 'Card deck', className, style, ...props }: SwipeDeckProps) {
  const options = { ...defaults, ...props } as Required<Pick<SwipeDeckProps, 'threshold' | 'maxRotate' | 'stackDepth' | 'radius' | 'showStamps' | 'spring' | 'cardAspect'>>
  const count = Children.count(children)
  const [current, setCurrent] = useControllableState({ prop: index, defaultProp: defaultIndex, onChange: onIndexChange })
  const [direction, setDirection] = useState<Direction>('left')

  const decide = (dir: Direction) => {
    if (current >= count) return
    setDirection(dir)
    onSwipe?.(current, dir)
    setCurrent(current + 1)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      decide('left')
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      decide('right')
    }
  }

  const done = current >= count
  const button =
    'grid size-12 place-items-center rounded-full border bg-card shadow-md transition-[transform,background-color] duration-150 hover:bg-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40'

  return (
    <div className={cn('flex w-full flex-col items-center gap-5', className)} style={style}>
      <Deck
        aria-label={label}
        aria-roledescription="card deck"
        className="w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        onKeyDown={onKeyDown}
        role="group"
        style={{ aspectRatio: options.cardAspect, borderRadius: options.radius }}
        tabIndex={0}
      >
        <DeckCards
          currentIndex={current}
          indexChangeDirection={exitDirection ?? direction}
          maxRotate={options.maxRotate}
          onCurrentIndexChange={setCurrent}
          onSwipe={(i, dir) => {
            setDirection(dir)
            onSwipe?.(i, dir)
          }}
          previewOffset={previewOffset}
          radius={options.radius}
          showStamps={options.showStamps}
          spring={options.spring}
          stackSize={options.stackDepth}
          threshold={options.threshold}
        >
          {children}
        </DeckCards>
        {done ? <DeckEmpty style={{ borderRadius: options.radius }}>{empty}</DeckEmpty> : null}
        <p aria-live="polite" className="sr-only">
          {done ? 'No more cards' : `Card ${current + 1} of ${count}`}
        </p>
      </Deck>
      <div className="flex items-center gap-4">
        <button aria-label="Nope" className={cn(button, 'text-rose-400')} disabled={done} onClick={() => decide('left')} type="button">
          <svg aria-hidden fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <button aria-label="Like" className={cn(button, 'text-emerald-400')} disabled={done} onClick={() => decide('right')} type="button">
          <svg aria-hidden fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
            <path d="M12 20.5s-7.5-4.6-9.3-9.1C1.5 8.3 3.4 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.6 0 5.5 3.8 4.3 6.9-1.8 4.5-9.3 9.1-9.3 9.1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
