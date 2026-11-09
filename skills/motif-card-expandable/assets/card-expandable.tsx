// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/expandable.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Transition,
} from 'motion/react'
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  collapsedWidth: 320,
  expandedWidth: 420,
  direction: 'both',
  trigger: 'click',
  expandDelay: 200,
  collapseDelay: 500,
  stagger: 0.2,
  spring: {
    visualDuration: 0.37,
    bounce: 0.29,
  },
}
/* @motif:end */

type ExpandableOptions = typeof defaults
type ExpandDirection = 'vertical' | 'horizontal' | 'both'
type EaseType = 'easeInOut' | 'easeIn' | 'easeOut' | 'linear' | [number, number, number, number]

/** 代替 react-use-measure：ResizeObserver 读 offset 尺寸，不受 transform 影响。 */
function useMeasure<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    if (!element) return
    const update = () => {
      const width = element.offsetWidth
      const height = element.offsetHeight
      setBounds((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [setElement, bounds] as const
}

interface ExpandableContextType {
  isExpanded: boolean // Indicates whether the component is expanded
  toggleExpand: () => void // Function to toggle the expanded state
  expandDirection: ExpandDirection // Direction of expansion
  expandBehavior: 'replace' | 'push' // How the expansion affects surrounding content
  transitionDuration: number // Duration of the expansion/collapse animation
  easeType: EaseType // Easing function for the animation
  initialDelay: number // Delay before the animation starts
  onExpandEnd?: () => void // Callback function when expansion ends
  onCollapseEnd?: () => void // Callback function when collapse ends
  /** 调参面板的参数：卡片尺寸、悬停延迟、错开间隔和弹簧。 */
  options: ExpandableOptions
}

// Create a context with default values
const ExpandableContext = createContext<ExpandableContextType>({
  isExpanded: false,
  toggleExpand: () => {},
  expandDirection: 'both', // 'vertical' | 'horizontal' | 'both' // Direction of expansion
  expandBehavior: 'replace', // How the expansion affects surrounding content
  transitionDuration: 0.3, // Duration of the expansion/collapse animation
  easeType: 'easeInOut' as const, // Easing function for the animation
  initialDelay: 0,
  options: defaults,
})

// Custom hook to use the ExpandableContext
const useExpandable = () => useContext(ExpandableContext)

type ExpandablePropsBase = Omit<HTMLMotionProps<'div'>, 'children'>

export interface ExpandableProps extends ExpandablePropsBase, Partial<ExpandableOptions> {
  children: ReactNode | ((props: { isExpanded: boolean }) => ReactNode)
  expanded?: boolean
  onToggle?: () => void
  transitionDuration?: number
  easeType?: EaseType
  expandBehavior?: 'replace' | 'push'
  initialDelay?: number
  onExpandStart?: () => void
  onExpandEnd?: () => void
  onCollapseStart?: () => void
  onCollapseEnd?: () => void
}

// ROOT Expand component
const Expandable = React.forwardRef<HTMLDivElement, ExpandableProps>(
  (
    {
      children,
      expanded,
      onToggle,
      transitionDuration = 0.3,
      easeType = 'easeInOut' as const,
      expandBehavior = 'replace',
      initialDelay = 0,
      onExpandStart,
      onExpandEnd,
      onCollapseStart,
      onCollapseEnd,
      collapsedWidth = defaults.collapsedWidth,
      expandedWidth = defaults.expandedWidth,
      direction = defaults.direction,
      trigger = defaults.trigger,
      expandDelay = defaults.expandDelay,
      collapseDelay = defaults.collapseDelay,
      stagger = defaults.stagger,
      spring = defaults.spring,
      ...props
    },
    ref,
  ) => {
    // Internal state for expansion when the component is uncontrolled
    const [isExpandedInternal, setIsExpandedInternal] = useState(false)

    // Use the provided expanded prop if available, otherwise use internal state
    const isExpanded = expanded !== undefined ? expanded : isExpandedInternal

    // Use the provided onToggle function if available, otherwise use internal toggle function
    const toggleExpand = onToggle || (() => setIsExpandedInternal((prev) => !prev))

    // Effect to call onExpandStart or onCollapseStart when isExpanded changes
    useEffect(() => {
      if (isExpanded) {
        onExpandStart?.()
      } else {
        onCollapseStart?.()
      }
    }, [isExpanded, onExpandStart, onCollapseStart])

    const expandDirection: ExpandDirection = direction === 'vertical' || direction === 'horizontal' ? direction : 'both'

    // Create the context value to be provided to child components
    const contextValue: ExpandableContextType = {
      isExpanded,
      toggleExpand,
      expandDirection,
      expandBehavior,
      transitionDuration,
      easeType,
      initialDelay,
      onExpandEnd,
      onCollapseEnd,
      options: { collapsedWidth, expandedWidth, direction, trigger, expandDelay, collapseDelay, stagger, spring },
    }

    return (
      <ExpandableContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          initial={false}
          transition={{
            duration: transitionDuration,
            ease: easeType,
            delay: initialDelay,
          }}
          {...props}
        >
          {/* Render children as a function if provided, otherwise render as is */}
          {typeof children === 'function' ? children({ isExpanded }) : children}
        </motion.div>
      </ExpandableContext.Provider>
    )
  },
)
Expandable.displayName = 'Expandable'

type AnimationTarget = TargetAndTransition

// Simplify animation types
type AnimationPreset = {
  initial: AnimationTarget
  animate: AnimationTarget
  exit: AnimationTarget
}

// Update ANIMATION_PRESETS type
const ANIMATION_PRESETS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: -10 },
  },
  'blur-sm': {
    initial: { opacity: 0, filter: 'blur(4px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(4px)' },
  },
  'blur-md': {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(8px)' },
  },
  'blur-lg': {
    initial: { opacity: 0, filter: 'blur(16px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(16px)' },
  },
} satisfies Record<string, AnimationPreset>

// Props for defining custom animations
interface AnimationProps {
  initial?: TargetAndTransition
  animate?: TargetAndTransition
  exit?: TargetAndTransition
  transition?: Transition
}

// Inside ExpandableContent component
const getAnimationProps = (preset: keyof typeof ANIMATION_PRESETS | undefined, _animateIn?: AnimationProps, animateOut?: AnimationProps) => {
  const defaultAnimation: AnimationPreset = {
    initial: {},
    animate: {},
    exit: {},
  }

  const presetAnimation: AnimationPreset = preset ? ANIMATION_PRESETS[preset] : defaultAnimation

  return {
    initial: presetAnimation.initial,
    animate: presetAnimation.animate,
    exit: animateOut?.exit || presetAnimation.exit,
  }
}

// Wrap this around items in the card that you want to be hidden then animated in on expansion
const ExpandableContent = React.forwardRef<
  HTMLDivElement,
  Omit<HTMLMotionProps<'div'>, 'ref'> & {
    preset?: keyof typeof ANIMATION_PRESETS
    animateIn?: AnimationProps
    animateOut?: AnimationProps
    stagger?: boolean
    staggerChildren?: number
    keepMounted?: boolean
  }
>(({ children, preset, animateIn, animateOut, stagger = false, staggerChildren, keepMounted = false, ...props }, ref) => {
  const { isExpanded, transitionDuration, easeType, options } = useExpandable()
  const reduced = useReducedMotion() ?? false
  const staggerInterval = staggerChildren ?? options.stagger
  // useMeasure is used to measure the height of the content
  const [measureRef, { height: measuredHeight }] = useMeasure<HTMLDivElement>()
  // useMotionValue creates a value that can be animated smoothly
  const animatedHeight = useMotionValue(0)
  // useSpring applies a spring animation to the height value
  const smoothHeight = useSpring(animatedHeight, options.spring)

  useEffect(() => {
    // Animate the height based on whether the content is expanded or collapsed
    if (isExpanded) {
      animatedHeight.set(measuredHeight)
    } else {
      animatedHeight.set(0)
    }
  }, [isExpanded, measuredHeight, animatedHeight])

  const animationProps = getAnimationProps(preset, animateIn, animateOut)
  const transition: Transition = reduced ? { duration: 0 } : { duration: transitionDuration, ease: easeType }

  return (
    // This motion.div animates the height of the content
    <motion.div
      ref={ref}
      style={{
        height: reduced ? animatedHeight : smoothHeight,
        overflow: 'hidden',
      }}
      transition={transition}
      {...props}
    >
      {/* AnimatePresence handles the entering and exiting of components */}
      <AnimatePresence initial={false}>
        {(isExpanded || keepMounted) && (
          // This motion.div handles the animation of the content itself
          <motion.div
            ref={measureRef}
            initial={reduced ? false : animationProps.initial}
            animate={animationProps.animate}
            exit={animationProps.exit}
            transition={transition}
          >
            {stagger && !reduced ? (
              // If stagger is true, we apply a staggered animation to the children
              <motion.div
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: staggerInterval,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {React.Children.map(children as React.ReactNode, (child, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              children
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
ExpandableContent.displayName = 'ExpandableContent'

export interface ExpandableCardProps {
  children: ReactNode
  className?: string
  collapsedSize?: { width?: number; height?: number } // Size when collapsed
  expandedSize?: { width?: number; height?: number } // Size when expanded
  hoverToExpand?: boolean // Whether to expand on hover
  expandDelay?: number // Delay before expanding
  collapseDelay?: number // Delay before collapsing
}

const ExpandableCard = React.forwardRef<HTMLDivElement, ExpandableCardProps>(
  ({ children, className = '', collapsedSize, expandedSize, hoverToExpand, expandDelay, collapseDelay, ...props }, ref) => {
    // Get the expansion state and toggle function from the ExpandableContext
    const { isExpanded, toggleExpand, expandDirection, options } = useExpandable()
    const reduced = useReducedMotion() ?? false
    const collapsedWidth = collapsedSize?.width ?? options.collapsedWidth
    const collapsedHeight = collapsedSize?.height
    const expandedWidth = expandedSize?.width ?? options.expandedWidth
    const expandedHeight = expandedSize?.height
    const hover = hoverToExpand ?? options.trigger === 'hover'
    const openDelay = expandDelay ?? options.expandDelay
    const closeDelay = collapseDelay ?? options.collapseDelay

    // 量整张卡片的外框（上游量的是内层内容，不含外框内边距），这样占位高度和看到的卡片一致。
    const [measureRef, { width, height }] = useMeasure<HTMLDivElement>()

    // Create motion values for width and height
    const animatedWidth = useMotionValue(collapsedWidth || 0)
    const animatedHeight = useMotionValue(collapsedHeight || 0)

    // Apply spring animation to the motion values
    const smoothWidth = useSpring(animatedWidth, options.spring)
    const smoothHeight = useSpring(animatedHeight, options.spring)

    // Effect to update the animated dimensions when expansion state changes
    const measuredOnce = useRef(false)
    useEffect(() => {
      const nextWidth = isExpanded ? expandedWidth || width : collapsedWidth || width
      const nextHeight = isExpanded ? expandedHeight || height : collapsedHeight || height
      // 第一次量到尺寸时直接到位，不让卡片在挂载时从 0 弹出来。
      if (!measuredOnce.current && width > 0 && height > 0) {
        measuredOnce.current = true
        animatedWidth.jump(nextWidth)
        smoothWidth.jump(nextWidth)
        animatedHeight.jump(nextHeight)
        smoothHeight.jump(nextHeight)
        return
      }
      animatedWidth.set(nextWidth)
      animatedHeight.set(nextHeight)
    }, [isExpanded, collapsedWidth, collapsedHeight, expandedWidth, expandedHeight, width, height, animatedWidth, animatedHeight, smoothWidth, smoothHeight])

    // 悬停延迟：上游每次悬停都排一个 toggle，快速进出时状态会反过来；这里只保留最后一次意图。
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const latest = useRef({ isExpanded, toggleExpand })
    useEffect(() => {
      latest.current = { isExpanded, toggleExpand }
    })
    useEffect(() => () => clearTimeout(timer.current), [])
    const schedule = (next: boolean, delay: number) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (latest.current.isExpanded !== next) latest.current.toggleExpand()
      }, delay)
    }

    // Handler for hover start event
    const handleHover = () => {
      if (hover) schedule(true, openDelay)
    }

    // Handler for hover end event
    const handleHoverEnd = () => {
      if (hover) schedule(false, closeDelay)
    }

    const liveWidth = reduced ? animatedWidth : smoothWidth
    const liveHeight = reduced ? animatedHeight : smoothHeight

    return (
      <motion.div
        ref={ref}
        className={cn('max-w-full cursor-pointer', className)}
        style={{
          // Set width and height based on expansion direction
          width: expandDirection === 'vertical' ? collapsedWidth : liveWidth,
          height: expandDirection === 'horizontal' ? collapsedHeight : liveHeight,
        }}
        onHoverStart={handleHover}
        onHoverEnd={handleHoverEnd}
        {...props}
      >
        <div
          ref={measureRef}
          className={cn(
            'grid grid-cols-1 rounded-lg sm:rounded-xl md:rounded-[2rem]',
            'shadow-[inset_0_0_1px_1px_color-mix(in_oklch,var(--border)_30%,transparent)] dark:shadow-[inset_0_0_1px_1px_color-mix(in_oklch,var(--border)_50%,transparent)]',
            'sm:shadow-[inset_0_0_2px_1px_color-mix(in_oklch,var(--border)_30%,transparent)] dark:sm:shadow-[inset_0_0_2px_1px_color-mix(in_oklch,var(--border)_50%,transparent)]',
            'ring-border/50 ring-1 group-focus-visible/expandable:ring-ring group-focus-visible/expandable:ring-2',
            'max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] md:max-w-[calc(100%-4rem)]',
            'mx-auto w-full',
            'transition-[box-shadow] duration-300 ease-in-out',
          )}
        >
          {/* Nested divs purely for styling and layout (the shadow ring around the card) */}
          <div className="grid grid-cols-1 rounded-lg p-1 shadow-md sm:rounded-xl sm:p-1.5 md:rounded-[2rem] md:p-2">
            <div className="dark:bg-muted ring-border/50 rounded-md bg-white p-2 shadow-xl ring-1 sm:rounded-lg sm:p-3 md:rounded-3xl md:p-4">
              <div className="h-full w-full overflow-hidden">
                <div className="flex h-full flex-col">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  },
)

ExpandableCard.displayName = 'ExpandableCard'

// I'm telling you we just have to expand
const ExpandableTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => {
  const { isExpanded, toggleExpand } = useExpandable()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 只响应触发器自己：卡片里的按钮按回车时不应该折叠卡片。
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleExpand()
    }
  }

  return (
    <div
      ref={ref}
      onClick={toggleExpand}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Toggle expand"
      aria-expanded={isExpanded}
      className={cn('group/expandable cursor-pointer outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
})

ExpandableTrigger.displayName = 'ExpandableTrigger'

const ExpandableCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const reduced = useReducedMotion() ?? false
  return (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      <motion.div layout={!reduced} className="flex items-start justify-between">
        {children}
      </motion.div>
    </div>
  )
})

ExpandableCardHeader.displayName = 'ExpandableCardHeader'

const ExpandableCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const reduced = useReducedMotion() ?? false
  return (
    <div ref={ref} className={cn('flex-grow overflow-hidden p-6 px-4 pt-0', className)} {...props}>
      <motion.div layout={!reduced}>{children}</motion.div>
    </div>
  )
})
ExpandableCardContent.displayName = 'ExpandableCardContent'

const ExpandableCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-4 pt-0', className)} {...props} />
))
ExpandableCardFooter.displayName = 'ExpandableCardFooter'

export {
  Expandable,
  useExpandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableContext,
  ExpandableTrigger,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableCardFooter,
}
