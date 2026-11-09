// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/dialog/c-dialog-9.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  layout: 'columns',
  keycapStyle: 'flat',
  accent: '#6366f1',
  radius: 14,
  showSearch: true,
  platform: 'mac',
  spring: {
    visualDuration: 0.22,
    bounce: 0.1,
  },
}
/* @motif:end */

/** Key tokens: "mod" (Cmd / Ctrl), "shift", "alt", "enter", or any literal key label. */
export type Shortcut = { keys: string[]; action: string }
export type ShortcutGroup = { title: string; shortcuts: Shortcut[] }

export const DEFAULT_GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['mod', 'K'], action: 'Search' },
      { keys: ['mod', 'N'], action: 'New File' },
      { keys: ['mod', 'P'], action: 'Quick Open' },
      { keys: ['mod', 'S'], action: 'Save' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['mod', 'B'], action: 'Bold' },
      { keys: ['mod', 'I'], action: 'Italic' },
      { keys: ['mod', 'Z'], action: 'Undo' },
      { keys: ['mod', 'shift', 'Z'], action: 'Redo' },
    ],
  },
  {
    title: 'Code',
    shortcuts: [
      { keys: ['mod', '/'], action: 'Toggle Comment' },
      { keys: ['mod', 'D'], action: 'Duplicate Line' },
    ],
  },
]

const SYMBOLS: Record<string, { mac: string; windows: string; name: string }> = {
  mod: { mac: '⌘', windows: 'Ctrl', name: 'Command' },
  shift: { mac: '⇧', windows: 'Shift', name: 'Shift' },
  alt: { mac: '⌥', windows: 'Alt', name: 'Option' },
  enter: { mac: '↵', windows: 'Enter', name: 'Enter' },
}

function keyLabel(key: string, platform: string) {
  const sym = SYMBOLS[key.toLowerCase()]
  if (!sym) return key
  return platform === 'windows' ? sym.windows : sym.mac
}

function keyName(key: string, platform: string) {
  const sym = SYMBOLS[key.toLowerCase()]
  if (!sym) return key
  return platform === 'windows' ? sym.windows : sym.name
}

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

const KBD_STYLES: Record<string, string> = {
  flat: 'bg-muted text-muted-foreground',
  raised: 'border border-b-2 border-border bg-background text-foreground shadow-[0_1px_0_0_var(--color-border)]',
  outline: 'border border-border text-foreground',
}

/** ReUI Kbd: a styled key cap. */
export function Kbd({ className, keycapStyle = 'flat', ...props }: ComponentProps<'kbd'> & { keycapStyle?: string }) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5.5 w-fit min-w-5.5 items-center justify-center gap-1 rounded-md px-1.5 font-sans text-xs font-medium select-none',
        KBD_STYLES[keycapStyle] ?? KBD_STYLES.flat,
        className,
      )}
      {...props}
    />
  )
}

/** ReUI KbdGroup. */
export function KbdGroup({ className, ...props }: ComponentProps<'kbd'>) {
  return <kbd data-slot="kbd-group" className={cn('inline-flex items-center gap-1', className)} {...props} />
}

function Highlight({ text, query, accent }: { text: string; query: string; accent: string }) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-transparent text-foreground" style={{ boxShadow: `inset 0 -0.5em 0 color-mix(in oklab, ${accent} 35%, transparent)` }}>
        {text.slice(at, at + q.length)}
      </mark>
      {text.slice(at + q.length)}
    </>
  )
}

export type DialogShortcutsCheatsheetProps = Partial<typeof defaults> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  groups?: ShortcutGroup[]
  title?: string
  description?: ReactNode
  /** Controlled filter text. */
  query?: string
  onQueryChange?: (query: string) => void
  /** Open on "?" pressed anywhere outside a text field. */
  hotkey?: boolean
  /** true: overlay is limited to the nearest positioned ancestor (previews, embeds). */
  contained?: boolean
  className?: string
  style?: CSSProperties
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Keyboard shortcuts dialog (ReUI c-dialog-9 + c-kbd-6): grouped shortcuts with key caps, a filter box,
 * and platform-aware modifier symbols. Esc, the backdrop and Close dismiss it; "?" opens it.
 */
export function DialogShortcutsCheatsheet({
  open,
  defaultOpen = false,
  onOpenChange,
  groups = DEFAULT_GROUPS,
  title = 'Keyboard Shortcuts',
  description = 'Quick reference for commonly used keyboard shortcuts.',
  query,
  onQueryChange,
  hotkey = true,
  contained = false,
  className,
  style,
  ...props
}: DialogShortcutsCheatsheetProps) {
  const { layout, keycapStyle, accent, radius, showSearch, platform, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const popupRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLElement | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [innerQuery, setInnerQuery] = useState('')
  const isOpen = open ?? innerOpen
  const filter = query ?? innerQuery
  const ink = isLight(accent) ? '#0a0a0a' : '#ffffff'

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (!next && query === undefined) setInnerQuery('')
  }
  const setFilter = (next: string) => {
    if (query === undefined) setInnerQuery(next)
    onQueryChange?.(next)
  }
  const setOpenRef = useRef(setOpen)
  setOpenRef.current = setOpen

  // "?" opens the sheet when typing is not happening elsewhere.
  useEffect(() => {
    if (!hotkey) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '?' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      event.preventDefault()
      setOpenRef.current(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkey])

  useEffect(() => {
    if (!isOpen) return
    returnFocus.current = document.activeElement as HTMLElement | null
    firstRef.current?.focus({ preventScroll: true })
    return () => returnFocus.current?.focus?.({ preventScroll: true })
  }, [isOpen])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      if (filter && showSearch) setFilter('')
      else setOpen(false)
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

  const q = showSearch ? filter.trim().toLowerCase() : ''
  const visible = groups
    .map((group) => ({
      ...group,
      shortcuts: q && !group.title.toLowerCase().includes(q) ? group.shortcuts.filter((s) => s.action.toLowerCase().includes(q)) : group.shortcuts,
    }))
    .filter((group) => group.shortcuts.length > 0)
  const count = visible.reduce((n, g) => n + g.shortcuts.length, 0)

  const transition = reduced ? { duration: 0.12, ease: 'easeOut' as const } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const layer = contained ? 'absolute' : 'fixed'

  const row = (shortcut: Shortcut) => (
    <li
      key={shortcut.action}
      className={cn('flex items-center justify-between gap-3', layout === 'list' && 'border-b py-2.5 last:border-b-0')}
      aria-label={`${shortcut.action}: ${shortcut.keys.map((k) => keyName(k, platform)).join(' + ')}`}
    >
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        <Highlight text={shortcut.action} query={q} accent={accent} />
      </span>
      <KbdGroup aria-hidden>
        {shortcut.keys.map((key, index) => (
          <Kbd key={index} keycapStyle={keycapStyle}>
            {keyLabel(key, platform)}
          </Kbd>
        ))}
      </KbdGroup>
    </li>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn(layer, 'inset-0 isolate z-50 grid place-items-center p-4', className)} style={{ '--accent-c': accent, ...style } as CSSProperties}>
          <motion.div
            data-slot="dialog-overlay"
            aria-hidden
            className="absolute inset-0 bg-black/40 supports-backdrop-filter:backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.15 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={popupRef}
            data-slot="dialog-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            aria-describedby={`${uid}-desc`}
            onKeyDown={onKeyDown}
            className="relative grid max-h-full w-full max-w-lg grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 bg-popover p-6 text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none"
            style={{ borderRadius: radius }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            transition={transition}
          >
            <div data-slot="dialog-header" className="flex flex-col gap-1.5">
              <h2 id={`${uid}-title`} className="text-base leading-none font-medium">
                {title}
              </h2>
              <div id={`${uid}-desc`} className="text-sm text-muted-foreground">
                {description}
              </div>
            </div>

            {showSearch ? (
              <div className="relative">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={(el) => {
                    firstRef.current = el
                  }}
                  type="search"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Filter shortcuts"
                  aria-label="Filter shortcuts"
                  aria-controls={`${uid}-list`}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-9 w-full min-w-0 rounded-lg border bg-background pr-3 pl-9 text-sm transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/70 focus-visible:border-(--accent-c) focus-visible:ring-3 focus-visible:ring-(--accent-c)/25 [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
            ) : (
              <span className="hidden" />
            )}

            <div id={`${uid}-list`} className="-mx-1 min-h-0 overflow-y-auto px-1" aria-live="polite">
              {count === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No shortcuts match “{filter.trim()}”.</p>
              ) : layout === 'list' ? (
                <div className="flex flex-col gap-4">
                  {visible.map((group) => (
                    <section key={group.title} aria-labelledby={`${uid}-${group.title}`}>
                      <p id={`${uid}-${group.title}`} className="mb-1 border-b pb-2 text-sm font-medium">
                        {group.title}
                      </p>
                      <ul className="flex flex-col">{group.shortcuts.map(row)}</ul>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {visible.map((group) => (
                    <section key={group.title} aria-labelledby={`${uid}-${group.title}`} className="space-y-3">
                      <p id={`${uid}-${group.title}`} className="text-xs font-medium tracking-wide text-foreground/80 uppercase">
                        {group.title}
                      </p>
                      <ul className="space-y-3">{group.shortcuts.map(row)}</ul>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div data-slot="dialog-footer" className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                Press <Kbd keycapStyle={keycapStyle}>?</Kbd> anytime
              </span>
              <button
                ref={(el) => {
                  if (!showSearch) firstRef.current = el
                }}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-[filter] duration-150 outline-none hover:brightness-110 focus-visible:ring-3 focus-visible:ring-(--accent-c)/40"
                style={{ backgroundColor: accent, color: ink }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
