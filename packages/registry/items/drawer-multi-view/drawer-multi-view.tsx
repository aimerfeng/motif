// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/family-drawer.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import {
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  radius: 36,
  maxWidth: 361,
  backdrop: 0.3,
  duration: 0.27,
  ease: [0.25, 1, 0.5, 1],
  viewScale: 0.96,
  dragDismiss: true,
}
/* @motif:end */

type DrawerOptions = typeof defaults
type Bezier = [number, number, number, number]

// ============================================================================
// Types
// ============================================================================

type ViewComponent = ComponentType<Record<string, unknown>>

interface ViewsRegistry {
  [viewName: string]: ViewComponent
}

interface Bounds {
  height: number
}

// ============================================================================
// Context
// ============================================================================

interface FamilyDrawerContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  view: string
  setView: (view: string) => void
  opacityDuration: number
  elementRef: (element: HTMLDivElement | null) => void
  bounds: Bounds
  views: ViewsRegistry | undefined
  options: DrawerOptions
}

const FamilyDrawerContext = createContext<FamilyDrawerContextValue | undefined>(undefined)

function useFamilyDrawer() {
  const context = useContext(FamilyDrawerContext)
  if (!context) {
    throw new Error('FamilyDrawer components must be used within FamilyDrawerRoot')
  }
  return context
}

// vaul 的开合曲线与时长；松手时拖过 25% 高度或速度超过 0.4 px/ms 就关闭（与 vaul 相同）。
const DRAWER_TRANSITION = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as Bezier }
const CLOSE_THRESHOLD = 0.25
const VELOCITY_THRESHOLD = 400
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** react-use-measure 的替代：ResizeObserver 量出被测元素的高度。用 offsetHeight（含 padding，不受 transform 影响）。 */
function useMeasure(): [(element: HTMLDivElement | null) => void, Bounds] {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [bounds, setBounds] = useState<Bounds>({ height: 0 })

  useLayoutEffect(() => {
    if (!element) {
      // 抽屉关闭后被测元素卸载：清零，下次打开从实际高度开始，而不是从上次的视图高度。
      setBounds((prev) => (prev.height === 0 ? prev : { height: 0 }))
      return
    }
    const measure = () => setBounds((prev) => (prev.height === element.offsetHeight ? prev : { height: element.offsetHeight }))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return [setElement, bounds]
}

// ============================================================================
// Root Component
// ============================================================================

export type FamilyDrawerRootProps = Partial<DrawerOptions> & {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** 当前视图（受控）。不传时由内部状态管理，从 defaultView 开始。 */
  view?: string
  defaultView?: string
  onViewChange?: (view: string) => void
  views?: ViewsRegistry
}

const MIN_DURATION = 0.15
const MAX_DURATION = 0.27

export function FamilyDrawerRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  view: controlledView,
  defaultView = 'default',
  onViewChange,
  views: customViews,
  ...props
}: FamilyDrawerRootProps) {
  const options = { ...defaults, ...props }
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [internalView, setInternalView] = useState(defaultView)
  const [elementRef, bounds] = useMeasure()

  const isOpen = controlledOpen ?? internalOpen
  const view = controlledView ?? internalView

  const setIsOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // 视图交叉淡入的时长跟随高度变化量：变化越大，淡入越慢。上游在 useMemo 里改 ref，这里按派生状态在渲染中更新。
  const [heights, setHeights] = useState({ height: 0, duration: MIN_DURATION })
  if (heights.height !== bounds.height) {
    const previousHeight = heights.height
    const duration = previousHeight ? Math.min(Math.max(Math.abs(bounds.height - previousHeight) / 500, MIN_DURATION), MAX_DURATION) : MIN_DURATION
    setHeights({ height: bounds.height, duration })
  }

  const handleViewChange = (newView: string) => {
    if (controlledView === undefined) setInternalView(newView)
    onViewChange?.(newView)
  }

  // Use custom views if provided, otherwise pass undefined
  const views = customViews && Object.keys(customViews).length > 0 ? customViews : undefined

  const contextValue: FamilyDrawerContextValue = {
    isOpen,
    setIsOpen,
    view,
    setView: handleViewChange,
    opacityDuration: heights.duration,
    elementRef,
    bounds,
    views,
    options,
  }

  return <FamilyDrawerContext.Provider value={contextValue}>{children}</FamilyDrawerContext.Provider>
}

// ============================================================================
// Trigger Component
// ============================================================================

interface FamilyDrawerTriggerProps {
  children: ReactNode
  asChild?: boolean
  className?: string
}

const FOCUS_RING = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

export function FamilyDrawerTrigger({ children, asChild = false, className }: FamilyDrawerTriggerProps) {
  const { isOpen, setIsOpen } = useFamilyDrawer()

  if (asChild && isValidElement<HTMLAttributes<HTMLElement>>(children)) {
    const child = children
    return cloneElement(child, {
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      onClick: (event: MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) setIsOpen(true)
      },
    })
  }

  return (
    <button
      className={cn(
        'bg-background text-foreground hover:bg-accent fixed top-1/2 left-1/2 h-[44px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border px-4 py-2 font-medium antialiased transition-colors md:font-medium',
        FOCUS_RING,
        className,
      )}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={() => setIsOpen(true)}
    >
      {children}
    </button>
  )
}

// ============================================================================
// Portal Component
// ============================================================================

export function FamilyDrawerPortal({ children }: { children: ReactNode }) {
  const { isOpen } = useFamilyDrawer()
  if (typeof document === 'undefined') return null
  // 遮罩和抽屉一起进出场：AnimatePresence 等它们的 exit 动画都结束才卸载。
  return createPortal(<AnimatePresence>{isOpen && <Fragment key="family-drawer">{children}</Fragment>}</AnimatePresence>, document.body)
}

// ============================================================================
// Overlay Component
// ============================================================================

interface FamilyDrawerOverlayProps {
  className?: string
  onClick?: () => void
}

export function FamilyDrawerOverlay({ className, onClick }: FamilyDrawerOverlayProps) {
  const { setView, setIsOpen, options } = useFamilyDrawer()
  const reduced = useReducedMotion()

  return (
    <motion.div
      aria-hidden
      className={cn('fixed inset-0 z-10 bg-black', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: options.backdrop }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0.15 } : DRAWER_TRANSITION}
      onClick={() => {
        setIsOpen(false)
        ;(onClick || (() => setView('default')))()
      }}
    />
  )
}

// ============================================================================
// Content Component
// ============================================================================

interface FamilyDrawerContentProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** 对话框的无障碍名称。 */
  label?: string
}

export function FamilyDrawerContent({ children, className, style, label = 'Drawer' }: FamilyDrawerContentProps) {
  const { isOpen, setIsOpen, view, bounds, options } = useFamilyDrawer()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const lastView = useRef(view)
  const controls = useDragControls()

  // 打开时焦点进入抽屉并锁住页面滚动；关闭时（退场动画开始前）焦点回到触发它的元素。
  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ref.current?.focus({ preventScroll: true })
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus({ preventScroll: true })
    }
  }, [isOpen])

  // 切换视图时，带着焦点的按钮会随旧视图离开：把焦点交给对话框本身，键盘用户不会掉到 body 上。
  useEffect(() => {
    if (lastView.current === view) return
    lastView.current = view
    const node = ref.current
    if (node && node.contains(document.activeElement)) node.focus({ preventScroll: true })
  }, [view])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setIsOpen(false)
      return
    }
    if (event.key !== 'Tab') return
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (nodes.length === 0) {
      event.preventDefault()
      return
    }
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // 下拉关闭：按钮和输入框不起拖（对应上游的 data-vaul-no-drag）。
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!options.dragDismiss) return
    const target = event.target as HTMLElement
    if (target.closest('[data-no-drag],input,textarea,select,[contenteditable="true"]')) return
    controls.start(event)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const height = ref.current?.offsetHeight ?? bounds.height
    if (info.offset.y > height * CLOSE_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD) setIsOpen(false)
  }

  const hidden = (bounds.height || 480) + 32

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      drag={options.dragDismiss ? 'y' : false}
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.04, bottom: 1 }}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-background fixed inset-x-4 bottom-4 z-10 mx-auto overflow-hidden outline-none md:mx-auto md:w-full',
        options.dragDismiss && 'touch-none',
        className,
      )}
      style={{ borderRadius: options.radius, maxWidth: options.maxWidth, ...style }}
      initial={reduced ? { opacity: 0 } : { y: '110%' }}
      animate={{
        height: bounds.height || 'auto',
        y: 0,
        opacity: 1,
      }}
      exit={reduced ? { opacity: 0 } : { y: hidden }}
      transition={{
        height: reduced ? { duration: 0 } : { duration: options.duration, ease: options.ease as Bezier },
        y: DRAWER_TRANSITION,
        opacity: { duration: 0.15 },
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// Animated Wrapper Component
// ============================================================================

interface FamilyDrawerAnimatedWrapperProps {
  children: ReactNode
  className?: string
}

export function FamilyDrawerAnimatedWrapper({ children, className }: FamilyDrawerAnimatedWrapperProps) {
  const { elementRef } = useFamilyDrawer()

  return (
    <div ref={elementRef} className={cn('px-6 pt-2.5 pb-6 antialiased', className)}>
      {children}
    </div>
  )
}

// ============================================================================
// Animated Content Component
// ============================================================================

interface FamilyDrawerAnimatedContentProps {
  children: ReactNode
}

export function FamilyDrawerAnimatedContent({ children }: FamilyDrawerAnimatedContentProps) {
  const { view, opacityDuration, options } = useFamilyDrawer()
  const reduced = useReducedMotion()
  const scale = reduced ? 1 : options.viewScale

  return (
    <AnimatePresence initial={false} mode="popLayout" custom={view}>
      <motion.div
        initial={{ opacity: 0, scale }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale }}
        key={view}
        transition={{
          duration: opacityDuration,
          ease: [0.26, 0.08, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// Close Component
// ============================================================================

interface FamilyDrawerCloseProps {
  children?: ReactNode
  className?: string
}

export function FamilyDrawerClose({ children, className }: FamilyDrawerCloseProps) {
  const { setIsOpen } = useFamilyDrawer()

  return (
    <button
      data-no-drag=""
      aria-label={children ? undefined : 'Close'}
      className={cn(
        'bg-muted text-muted-foreground absolute top-7 right-8 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-transform focus:scale-95 active:scale-75',
        FOCUS_RING,
        className,
      )}
      type="button"
      onClick={() => setIsOpen(false)}
    >
      {children || <CloseIcon />}
    </button>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

interface FamilyDrawerHeaderProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export function FamilyDrawerHeader({ icon, title, description, className }: FamilyDrawerHeaderProps) {
  return (
    <header className={cn('mt-[21px]', className)}>
      {icon}
      <h2 className="text-foreground mt-2.5 text-[22px] font-semibold md:font-medium">{title}</h2>
      <p className="text-muted-foreground mt-3 text-[17px] leading-[24px] font-medium md:font-normal">{description}</p>
    </header>
  )
}

interface FamilyDrawerButtonProps {
  children: ReactNode
  onClick: () => void
  className?: string
}

export function FamilyDrawerButton({ children, onClick, className }: FamilyDrawerButtonProps) {
  return (
    <button
      data-no-drag=""
      className={cn(
        'bg-muted text-foreground flex h-12 w-full cursor-pointer items-center gap-[15px] rounded-[16px] px-4 text-[17px] font-semibold transition-transform focus:scale-95 active:scale-95 md:font-medium',
        FOCUS_RING,
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

interface FamilyDrawerSecondaryButtonProps {
  children: ReactNode
  onClick: () => void
  className?: string
  /** 不可用时仍可聚焦，只是点击无效（aria-disabled）。 */
  disabled?: boolean
}

export function FamilyDrawerSecondaryButton({ children, onClick, className, disabled = false }: FamilyDrawerSecondaryButtonProps) {
  return (
    <button
      data-no-drag=""
      type="button"
      aria-disabled={disabled || undefined}
      className={cn(
        'flex h-12 w-full cursor-pointer items-center justify-center gap-[15px] rounded-full text-center text-[19px] font-semibold transition-transform focus:scale-95 active:scale-95 md:font-medium',
        FOCUS_RING,
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={() => {
        if (!disabled) onClick()
      }}
    >
      {children}
    </button>
  )
}

// ============================================================================
// View Content Renderer
// ============================================================================

interface FamilyDrawerViewContentProps {
  views?: ViewsRegistry
}

export function FamilyDrawerViewContent({ views: propViews }: FamilyDrawerViewContentProps = {}) {
  const { view, views: contextViews } = useFamilyDrawer()

  // Use prop views first, then context views
  const views = propViews || contextViews

  if (!views) {
    throw new Error('FamilyDrawerViewContent requires views to be provided via props or FamilyDrawerRoot')
  }

  const ViewComponent = views[view]

  if (!ViewComponent) {
    // Fallback to default view if view not found
    const DefaultComponent = views.default
    return DefaultComponent ? <DefaultComponent /> : null
  }

  return <ViewComponent />
}

// ============================================================================
// Icons
// ============================================================================

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M10.4854 1.99998L2.00007 10.4853" stroke="#999999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.4854 10.4844L2.00007 1.99908" stroke="#999999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { useFamilyDrawer, type ViewsRegistry, type ViewComponent }
