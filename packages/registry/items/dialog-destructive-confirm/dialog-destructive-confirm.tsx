// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/alert-dialog/c-alert-dialog-8.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  confirmMode: 'type',
  accent: '#ef4444',
  radius: 24,
  dim: 0.4,
  spring: {
    visualDuration: 0.22,
    bounce: 0.1,
  },
  resourceName: 'atlas-web',
  showConsequences: true,
}
/* @motif:end */

export type DialogDestructiveConfirmProps = Partial<typeof defaults> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called when the destructive action is confirmed. */
  onConfirm?: () => void
  title?: string
  description?: ReactNode
  consequences?: string[]
  cancelLabel?: string
  actionLabel?: string
  /** Controlled value of the type-to-confirm input. */
  value?: string
  onValueChange?: (value: string) => void
  /** true: overlay is limited to the nearest positioned ancestor (previews, embeds). */
  contained?: boolean
  className?: string
  style?: CSSProperties
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

function isLight(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return false
  const n = parseInt(m[1]!, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05)
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

/**
 * Alert dialog for irreversible actions (ReUI c-alert-dialog-8 layout). In "type" mode the action stays
 * disabled until the resource name is typed. Focus starts on Cancel; Esc and the backdrop cancel.
 */
export function DialogDestructiveConfirm({
  open,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
  title,
  description,
  consequences = ['All deployments and preview URLs', 'Environment variables and secrets', 'Build logs and analytics history'],
  cancelLabel = 'Cancel',
  actionLabel,
  value,
  onValueChange,
  contained = false,
  className,
  style,
  ...props
}: DialogDestructiveConfirmProps) {
  const { confirmMode, accent, radius, dim, spring, resourceName, showConsequences } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const popupRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [innerValue, setInnerValue] = useState('')
  const isOpen = open ?? innerOpen
  const typed = value ?? innerValue
  const needsTyping = confirmMode === 'type'
  const armed = !needsTyping || typed === resourceName
  const ink = isLight(accent) ? '#0a0a0a' : '#ffffff'

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (!next && value === undefined) setInnerValue('')
  }
  const setTyped = (next: string) => {
    if (value === undefined) setInnerValue(next)
    onValueChange?.(next)
  }

  // Focus: Cancel is the safe default; return focus to the trigger on close.
  useEffect(() => {
    if (!isOpen) return
    returnFocus.current = document.activeElement as HTMLElement | null
    cancelRef.current?.focus({ preventScroll: true })
    return () => returnFocus.current?.focus?.({ preventScroll: true })
  }, [isOpen])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return
    const nodes = Array.from(popupRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (nodes.length === 0) return
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const transition = reduced ? { duration: 0.12, ease: 'easeOut' as const } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const layer = contained ? 'absolute' : 'fixed'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn(layer, 'inset-0 isolate z-50 grid place-items-center p-4', className)} style={{ '--accent-c': accent, ...style } as CSSProperties}>
          <motion.div
            data-slot="alert-dialog-overlay"
            aria-hidden
            className="absolute inset-0 bg-black supports-backdrop-filter:backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: dim }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={popupRef}
            data-slot="alert-dialog-content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            aria-describedby={`${uid}-desc`}
            onKeyDown={onKeyDown}
            className="group/alert-dialog-content relative grid w-full max-w-md gap-6 bg-popover p-6 text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none"
            style={{ borderRadius: radius }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            transition={transition}
          >
            <div className="flex items-start gap-3 py-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}>
                <AlertIcon />
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <h2 id={`${uid}-title`} className="text-sm font-semibold">
                  {title ?? `Delete ${resourceName}?`}
                </h2>
                <div id={`${uid}-desc`} className="text-sm text-muted-foreground">
                  {description ?? 'This permanently deletes the project and everything in it. This cannot be undone.'}
                </div>
              </div>
            </div>

            {(showConsequences && consequences.length > 0) || needsTyping ? (
              <div className="grid gap-4">
                {showConsequences && consequences.length > 0 && (
                  <ul className="grid gap-2 rounded-xl border bg-muted/40 p-3.5 text-sm" aria-label="What will be deleted">
                    {consequences.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {needsTyping && (
                  <div className="grid gap-2">
                    <label htmlFor={`${uid}-input`} className="text-sm text-muted-foreground">
                      Type <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] break-all text-foreground">{resourceName}</span> to confirm.
                    </label>
                    <input
                      id={`${uid}-input`}
                      value={typed}
                      onChange={(event) => setTyped(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && armed) {
                          onConfirm?.()
                          setOpen(false)
                        }
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 font-mono text-sm transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/60 focus-visible:border-(--accent-c) focus-visible:ring-3 focus-visible:ring-(--accent-c)/25"
                      placeholder={resourceName}
                    />
                  </div>
                )}
              </div>
            ) : null}

            <div data-slot="alert-dialog-footer" className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-[background-color] duration-150 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={!armed}
                onClick={() => {
                  onConfirm?.()
                  setOpen(false)
                }}
                className="relative inline-flex h-9 items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-(--accent-c)/40 disabled:cursor-not-allowed"
                style={{ color: armed ? ink : accent, backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`, transition: 'color 200ms' }}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-0 origin-left"
                  style={{ backgroundColor: accent }}
                  initial={false}
                  animate={{ scaleX: armed ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.35, bounce: 0 }}
                />
                <span className="relative">{actionLabel ?? (needsTyping ? 'Delete project' : 'Delete')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
