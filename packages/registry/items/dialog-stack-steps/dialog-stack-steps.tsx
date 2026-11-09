// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/dialog-stack/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react'
import { Children, cloneElement, createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  offset: 10,
  scaleStep: 0.02,
  maxVisible: 3,
  radius: 8,
  dim: 0.8,
  clickable: true,
  spring: {
    visualDuration: 0.3,
    bounce: 0.15,
  },
}
/* @motif:end */

type Options = typeof defaults

type DialogStackContextType = {
  activeIndex: number
  setActiveIndex: (index: number) => void
  totalDialogs: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  options: Options
  portal: boolean
  titleId: string
}

const DialogStackContext = createContext<DialogStackContextType>({
  activeIndex: 0,
  setActiveIndex: () => {},
  totalDialogs: 0,
  isOpen: false,
  setIsOpen: () => {},
  options: defaults,
  portal: true,
  titleId: '',
})

// 卡片序号，供标题生成 id，让 dialog 的 aria-labelledby 指向当前步骤的标题。
const StepIndexContext = createContext(0)

type DialogStackChildProps = {
  index?: number
}

export type DialogStackProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> &
  Partial<Options> & {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    /** 受控的当前步骤。 */
    activeIndex?: number
    onActiveIndexChange?: (index: number) => void
    /** false 时弹窗渲染在原地（容器需 relative），用于预览或嵌入。 */
    portal?: boolean
    style?: CSSProperties
  }

export const DialogStack = ({
  children,
  className,
  style,
  open,
  defaultOpen = false,
  onOpenChange,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  portal = true,
  ...props
}: DialogStackProps) => {
  const optionKeys = Object.keys(defaults) as (keyof Options)[]
  const options = { ...defaults } as Options
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if ((optionKeys as string[]).includes(key)) {
      if (value !== undefined) (options as Record<string, unknown>)[key] = value
    } else rest[key] = value
  }

  const [innerIndex, setInnerIndex] = useState(0)
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const activeIndex = activeIndexProp ?? innerIndex
  const titleId = useId()

  const setIsOpen = useCallback(
    (value: boolean) => {
      if (open === undefined) setInnerOpen(value)
      onOpenChange?.(value)
      if (!value && activeIndexProp === undefined) setInnerIndex(0)
    },
    [open, onOpenChange, activeIndexProp],
  )
  const setActiveIndex = useCallback(
    (index: number) => {
      if (activeIndexProp === undefined) setInnerIndex(index)
      onActiveIndexChange?.(index)
    },
    [activeIndexProp, onActiveIndexChange],
  )

  return (
    <DialogStackContext.Provider
      value={{ activeIndex, setActiveIndex, totalDialogs: 0, isOpen, setIsOpen, options, portal, titleId }}
    >
      <div className={className} style={style} {...(rest as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    </DialogStackContext.Provider>
  )
}

const buttonBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export type DialogStackTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export const DialogStackTrigger = ({ children, className, onClick, asChild, ...props }: DialogStackTriggerProps) => {
  const context = useContext(DialogStackContext)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    context.setIsOpen(true)
    onClick?.(e)
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        handleClick(e)
        child.props.onClick?.(e)
      },
      className: cn(className, child.props.className),
      ...props,
    })
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.isOpen}
      className={cn(buttonBase, 'bg-primary text-primary-foreground hover:bg-primary/90', 'h-10 px-4 py-2', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Layer({ children }: { children: ReactNode }) {
  const { portal } = useContext(DialogStackContext)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!portal) return <>{children}</>
  if (!mounted) return null
  return createPortal(children, document.body)
}

export type DialogStackOverlayProps = HTMLAttributes<HTMLDivElement>

export const DialogStackOverlay = ({ className, style, ...props }: DialogStackOverlayProps) => {
  const context = useContext(DialogStackContext)
  const reduced = useReducedMotion()

  const handleClick = useCallback(() => {
    context.setIsOpen(false)
  }, [context])

  if (!context.isOpen) {
    return null
  }

  return (
    <Layer>
      <motion.div
        aria-hidden="true"
        className={cn(context.portal ? 'fixed' : 'absolute', 'inset-0 z-50 bg-black', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: context.options.dim }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={handleClick}
        style={style}
        {...(props as object)}
      />
    </Layer>
  )
}

export type DialogStackBodyProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactElement<DialogStackChildProps>[] | ReactElement<DialogStackChildProps>
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const DialogStackBody = ({ children, className, onKeyDown, ...props }: DialogStackBodyProps) => {
  const context = useContext(DialogStackContext)
  const totalDialogs = Children.count(children)
  const bodyRef = useRef<HTMLDivElement>(null)
  const { isOpen, activeIndex } = context

  // 打开或换步时，把焦点移到当前卡片里的第一个可聚焦元素。
  useEffect(() => {
    if (!isOpen) return
    const root = bodyRef.current
    if (!root) return
    const active = root.querySelector<HTMLElement>('[data-active="true"]')
    const target = active?.querySelector<HTMLElement>(FOCUSABLE) ?? active
    if (target && !root.contains(document.activeElement)) target.focus({ preventScroll: true })
  }, [isOpen, activeIndex])

  useEffect(() => {
    if (!isOpen || !context.portal) return
    const previous = document.activeElement as HTMLElement | null
    return () => previous?.focus?.({ preventScroll: true })
  }, [isOpen, context.portal])

  if (!isOpen) {
    return null
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === 'Escape') {
      e.preventDefault()
      context.setIsOpen(false)
      return
    }
    if (e.key !== 'Tab' || !bodyRef.current) return
    const items = Array.from(bodyRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.closest('[inert]'),
    )
    if (items.length === 0) return
    const first = items[0]!
    const last = items[items.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <DialogStackContext.Provider value={{ ...context, totalDialogs }}>
      <Layer>
        <div
          ref={bodyRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${context.titleId}-${activeIndex}`}
          className={cn(
            context.portal ? 'fixed' : 'absolute',
            'pointer-events-none inset-0 z-50 mx-auto flex w-full max-w-lg flex-col items-center justify-center px-4',
            className,
          )}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <div className="pointer-events-auto relative flex w-full flex-col items-center justify-center">
            {Children.map(children, (child, index) => {
              const childElement = child as ReactElement<{ index: number }>
              return cloneElement(childElement, { ...childElement.props, index })
            })}
          </div>
        </div>
      </Layer>
    </DialogStackContext.Provider>
  )
}

export type DialogStackContentProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
> & {
  index?: number
  offset?: number
}

export const DialogStackContent = ({ children, className, index = 0, offset, style, ...props }: DialogStackContentProps) => {
  const context = useContext(DialogStackContext)
  const reduced = useReducedMotion()
  const { options } = context

  if (!context.isOpen) {
    return null
  }

  const isActive = context.activeIndex === index
  const canJump = options.clickable && context.activeIndex > index
  const handleClick = () => {
    if (canJump) context.setActiveIndex(index)
  }

  const step = offset ?? options.offset
  const distanceFromActive = index - context.activeIndex
  const depth = Math.abs(distanceFromActive)
  const hidden = distanceFromActive > 0 || depth > options.maxVisible

  return (
    <motion.div
      role={canJump ? 'button' : undefined}
      tabIndex={canJump ? 0 : undefined}
      aria-label={canJump ? `Back to step ${index + 1}` : undefined}
      aria-hidden={isActive || canJump ? undefined : true}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'h-auto w-full origin-top border bg-background p-6 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (canJump && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      initial={false}
      animate={{
        y: distanceFromActive < 0 ? -depth * step : depth * step,
        scale: 1 - depth * options.scaleStep,
        opacity: hidden ? 0 : 1,
      }}
      transition={reduced ? { duration: 0 } : { type: 'spring', ...options.spring }}
      style={{
        top: 0,
        borderRadius: options.radius,
        zIndex: 50 - depth,
        position: distanceFromActive ? 'absolute' : 'relative',
        pointerEvents: hidden ? 'none' : undefined,
        cursor: canJump ? 'pointer' : 'default',
        ...style,
      }}
      {...(props as object)}
    >
      <div
        inert={!isActive}
        className={cn(
          'h-full w-full transition-opacity duration-300 motion-reduce:transition-none',
          !isActive && 'pointer-events-none select-none opacity-0',
        )}
      >
        <StepIndexContext.Provider value={index}>{children}</StepIndexContext.Provider>
      </div>
    </motion.div>
  )
}

export type DialogStackTitleProps = HTMLAttributes<HTMLHeadingElement>

export const DialogStackTitle = ({ children, className, ...props }: DialogStackTitleProps) => {
  const { titleId } = useContext(DialogStackContext)
  const index = useContext(StepIndexContext)
  return (
    <h2 id={`${titleId}-${index}`} className={cn('font-semibold text-lg leading-none tracking-tight', className)} {...props}>
      {children}
    </h2>
  )
}

export type DialogStackDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const DialogStackDescription = ({ children, className, ...props }: DialogStackDescriptionProps) => (
  <p className={cn('text-muted-foreground text-sm', className)} {...props}>
    {children}
  </p>
)

export type DialogStackHeaderProps = HTMLAttributes<HTMLDivElement>

export const DialogStackHeader = ({ className, ...props }: DialogStackHeaderProps) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)

export type DialogStackFooterProps = HTMLAttributes<HTMLDivElement>

export const DialogStackFooter = ({ children, className, ...props }: DialogStackFooterProps) => (
  <div className={cn('flex items-center justify-end space-x-2 pt-4', className)} {...props}>
    {children}
  </div>
)

export type DialogStackNextProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export const DialogStackNext = ({ children, className, asChild, ...props }: DialogStackNextProps) => {
  const context = useContext(DialogStackContext)

  const handleNext = () => {
    if (context.activeIndex < context.totalDialogs - 1) {
      context.setActiveIndex(context.activeIndex + 1)
    }
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        handleNext()
        child.props.onClick?.(e)
      },
      className: cn(className, child.props.className),
      ...props,
    })
  }

  return (
    <button
      className={cn(buttonBase, className)}
      disabled={context.activeIndex >= context.totalDialogs - 1}
      onClick={handleNext}
      type="button"
      {...props}
    >
      {children || 'Next'}
    </button>
  )
}

export type DialogStackPreviousProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export const DialogStackPrevious = ({ children, className, asChild, ...props }: DialogStackPreviousProps) => {
  const context = useContext(DialogStackContext)

  const handlePrevious = () => {
    if (context.activeIndex > 0) {
      context.setActiveIndex(context.activeIndex - 1)
    }
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        handlePrevious()
        child.props.onClick?.(e)
      },
      className: cn(className, child.props.className),
      ...props,
    })
  }

  return (
    <button
      className={cn(buttonBase, className)}
      disabled={context.activeIndex <= 0}
      onClick={handlePrevious}
      type="button"
      {...props}
    >
      {children || 'Previous'}
    </button>
  )
}
