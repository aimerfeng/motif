// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/dialog.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import React, { createContext, useContext, useEffect, useId, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  entrance: 'rise',
  spring: {
    visualDuration: 0.4,
    bounce: 0,
  },
  backdropBlur: 4,
  backdropOpacity: 0.5,
  width: 448,
  radius: 8,
  closeButton: true,
  dismissOnBackdrop: true,
}
/* @motif:end */

type DialogOptions = typeof defaults

const ENTRANCES: Record<string, Variants> = {
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  rise: {
    initial: { scale: 0.9, filter: 'blur(10px)', y: '100%' },
    animate: { scale: 1, filter: 'blur(0px)', y: 0 },
  },
  blur: {
    initial: { opacity: 0, scale: 1.06, filter: 'blur(12px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  },
  tilt: {
    initial: { opacity: 0, rotateX: 24, y: 40, transformPerspective: 900 },
    animate: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 900 },
  },
}

const REDUCED: Variants = { initial: { opacity: 0 }, animate: { opacity: 1 } }

/** Small hand-written scroll lock (replaces the upstream react-aria usePreventScroll). */
function usePreventScroll({ isDisabled }: { isDisabled: boolean }) {
  useEffect(() => {
    if (isDisabled) return
    const html = document.documentElement
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight }
    const gap = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    if (gap > 0) html.style.paddingRight = `${gap}px`
    return () => {
      html.style.overflow = prev.overflow
      html.style.paddingRight = prev.paddingRight
    }
  }, [isDisabled])
}

const DialogContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  dialogRef: React.RefObject<HTMLDialogElement | null>
  variants: Variants
  transition?: Transition
  options: DialogOptions
  ids: {
    dialog: string
    title: string
    description: string
  }
  onAnimationComplete: (definition: string) => void
  handleTrigger: () => void
} | null>(null)

export type DialogProps = Partial<DialogOptions> & {
  children: React.ReactNode
  /** Custom variants override the entrance preset. */
  variants?: Variants
  transition?: Transition
  className?: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

function Dialog({ children, variants, transition, defaultOpen, onOpenChange, open, ...props }: DialogProps) {
  const options = { ...defaults, ...props } as DialogOptions
  const reduced = useReducedMotion()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen || false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const isOpen = open !== undefined ? open : uncontrolledOpen

  // prevent scroll when dialog is open
  usePreventScroll({ isDisabled: !isOpen })

  const setIsOpen = React.useCallback(
    (value: boolean) => {
      setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [onOpenChange],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      if (isOpen) setIsOpen(false)
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [dialogRef, isOpen, setIsOpen])

  useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      const active = document.activeElement
      returnFocus.current = active instanceof HTMLElement ? active : null
      dialogRef.current.showModal()
    }
    if (!isOpen && returnFocus.current) {
      const target = returnFocus.current
      returnFocus.current = null
      if (target.isConnected) target.focus({ preventScroll: true })
    }
  }, [isOpen])

  const handleTrigger = () => setIsOpen(true)

  const onAnimationComplete = (definition: string) => {
    if (definition === 'exit' && !isOpen) dialogRef.current?.close()
  }

  const base = reduced ? REDUCED : (variants ?? ENTRANCES[options.entrance] ?? ENTRANCES.scale)
  const resolvedVariants: Variants = { exit: base.initial, ...base }
  const resolvedTransition: Transition = reduced
    ? { ease: 'easeOut', duration: 0.15 }
    : (transition ?? { type: 'spring', visualDuration: options.spring.visualDuration, bounce: options.spring.bounce })

  const baseId = useId()
  const ids = {
    dialog: `motion-ui-dialog-${baseId}`,
    title: `motion-ui-dialog-title-${baseId}`,
    description: `motion-ui-dialog-description-${baseId}`,
  }

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        dialogRef,
        variants: resolvedVariants,
        transition: resolvedTransition,
        options,
        ids,
        onAnimationComplete,
        handleTrigger,
      }}
    >
      {children}
    </DialogContext.Provider>
  )
}

export type DialogTriggerProps = {
  children: React.ReactNode
  className?: string
}

function DialogTrigger({ children, className }: DialogTriggerProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogTrigger must be used within Dialog')

  return (
    <button
      type="button"
      onClick={context.handleTrigger}
      aria-haspopup="dialog"
      aria-expanded={context.isOpen}
      aria-controls={context.ids.dialog}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        'transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}

export type DialogPortalProps = {
  children: React.ReactNode
  container?: HTMLElement | null
}

function DialogPortal({ children, container }: DialogPortalProps) {
  const [mounted, setMounted] = React.useState(false)
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setPortalContainer(container || document.body)
    return () => setMounted(false)
  }, [container])

  if (!mounted || !portalContainer) return null

  return createPortal(children, portalContainer)
}

export type DialogContentProps = {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  container?: HTMLElement
}

function DialogContent({ children, className, style, container }: DialogContentProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogContent must be used within Dialog')
  const { isOpen, setIsOpen, dialogRef, variants, transition, options, ids, onAnimationComplete } = context

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.dialog
          key={ids.dialog}
          ref={dialogRef as React.RefObject<HTMLDialogElement>}
          id={ids.dialog}
          aria-labelledby={ids.title}
          aria-describedby={ids.description}
          aria-modal="true"
          onClick={(e) => {
            if (options.dismissOnBackdrop && e.target === dialogRef.current) setIsOpen(false)
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
          onAnimationComplete={onAnimationComplete}
          style={
            {
              '--dlg-dim': options.backdropOpacity,
              '--dlg-blur': `${options.backdropBlur}px`,
              width: `min(${options.width}px, calc(100vw - 2rem))`,
              maxWidth: 'none',
              borderRadius: options.radius,
              ...style,
            } as CSSProperties
          }
          className={cn(
            'fixed top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 transform border bg-background p-0 text-foreground shadow-lg',
            'backdrop:bg-[rgb(0_0_0/var(--dlg-dim))] backdrop:backdrop-blur-(--dlg-blur)',
            'open:flex open:flex-col',
            className,
          )}
        >
          <div className="w-full">{children}</div>
          {options.closeButton && <DialogClose />}
        </motion.dialog>
      )}
    </AnimatePresence>
  )

  return <DialogPortal container={container}>{content}</DialogPortal>
}

export type DialogHeaderProps = {
  children: React.ReactNode
  className?: string
}

function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5', className)}>{children}</div>
}

export type DialogTitleProps = {
  children: React.ReactNode
  className?: string
}

function DialogTitle({ children, className }: DialogTitleProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogTitle must be used within Dialog')

  return (
    <h2 id={context.ids.title} className={cn('text-base font-medium', className)}>
      {children}
    </h2>
  )
}

export type DialogDescriptionProps = {
  children: React.ReactNode
  className?: string
}

function DialogDescription({ children, className }: DialogDescriptionProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogDescription must be used within Dialog')

  return (
    <p id={context.ids.description} className={cn('text-base text-muted-foreground', className)}>
      {children}
    </p>
  )
}

export type DialogCloseProps = {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

function DialogClose({ className, children, disabled }: DialogCloseProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogClose must be used within Dialog')

  return (
    <button
      onClick={() => context.setIsOpen(false)}
      type="button"
      aria-label="Close dialog"
      className={cn(
        'absolute top-4 right-4 rounded-xs opacity-70 transition-opacity',
        'hover:opacity-100 focus-visible:ring-2 focus-visible:outline-hidden',
        'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none',
        className,
      )}
      disabled={disabled}
    >
      {children || (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )}
    </button>
  )
}

/** Entry alias: the root component. */
const DialogModal = Dialog

export { Dialog, DialogModal, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose }
