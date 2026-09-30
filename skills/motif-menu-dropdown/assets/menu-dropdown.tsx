// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/smooth-dropdown.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#8b5cf6',
  radius: 14,
  width: 248,
  align: 'start',
  spring: {
    visualDuration: 0.34,
    bounce: 0.16,
  },
  showShortcuts: true,
  label: 'Project',
}
/* @motif:end */

export type MenuEntry =
  | { type?: 'item'; id: string; label: string; icon?: ReactNode; shortcut?: string[]; danger?: boolean; disabled?: boolean }
  | { type: 'checkbox'; id: string; label: string; icon?: ReactNode; checked?: boolean; shortcut?: string[] }
  | { type: 'separator' }
  | { type: 'label'; label: string }

export type MenuDropdownProps = Partial<typeof defaults> & {
  items?: MenuEntry[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (id: string, checked?: boolean) => void
  /** 强制勾选状态，键为复选项 id（演示自动播放用）。 */
  checked?: Record<string, boolean>
  /** 强制高亮某一项（演示自动播放用）。 */
  highlight?: string
  /** 触发按钮左侧的图标。 */
  triggerIcon?: ReactNode
  className?: string
  style?: CSSProperties
}

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

const SAMPLE: MenuEntry[] = [
  { type: 'label', label: 'Northwind Studio' },
  { id: 'rename', label: 'Rename', icon: icon(<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />), shortcut: ['⌘', 'R'] },
  { id: 'duplicate', label: 'Duplicate', icon: icon(<><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M15.5 8.5V6.5A2.5 2.5 0 0 0 13 4H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2" /></>), shortcut: ['⌘', 'D'] },
  { id: 'share', label: 'Share link', icon: icon(<><circle cx="6.5" cy="12" r="2.5" /><circle cx="17.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="m8.7 10.8 6.6-3.1M8.7 13.2l6.6 3.1" /></>) },
  { type: 'separator' },
  { type: 'checkbox', id: 'grid', label: 'Show layout grid', checked: false },
  { type: 'separator' },
  { id: 'archive', label: 'Archive', icon: icon(<><rect x="3.5" y="4.5" width="17" height="4" rx="1.5" /><path d="M5 8.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V8.5M10 13h4" /></>) },
  { id: 'delete', label: 'Delete project', danger: true, icon: icon(<path d="M5 7h14M10 4h4M8 7l.7 12h6.6L16 7" />), shortcut: ['⌫'] },
]

/** 下拉菜单：弹簧展开，高亮条在菜单项之间滑动；方向键 / Home / End / 首字母跳转，Esc 关闭并把焦点还给触发按钮。 */
export function MenuDropdown({ items = SAMPLE, open, defaultOpen = false, onOpenChange, onSelect, checked, highlight, triggerIcon, className, style, ...props }: MenuDropdownProps) {
  const { color, radius, width, align, spring, showShortcuts, label } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries(items.flatMap((entry) => (entry.type === 'checkbox' ? [[entry.id, Boolean(entry.checked)]] : []))))
  const isOpen = open ?? innerOpen
  const active = highlight ?? activeId
  const actionable = items.filter((entry): entry is Extract<MenuEntry, { id: string }> => 'id' in entry && !('disabled' in entry && entry.disabled))

  const setOpen = (next: boolean, focus?: 'first' | 'last' | 'menu') => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setActiveId(null)
    } else if (focus) {
      requestAnimationFrame(() => {
        if (focus === 'menu') menuRef.current?.focus()
        else focusItem(focus === 'first' ? actionable[0]?.id : actionable[actionable.length - 1]?.id)
      })
    }
  }

  const focusItem = (id?: string) => {
    if (!id) return
    setActiveId(id)
    menuRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true })
  }

  // 点击菜单外面关闭；焦点留在页面上原来的位置。
  useEffect(() => {
    if (!isOpen) return
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const choose = (entry: Extract<MenuEntry, { id: string }>) => {
    if (entry.type === 'checkbox') {
      const next = !(checked?.[entry.id] ?? checks[entry.id])
      setChecks((prev) => ({ ...prev, [entry.id]: next }))
      onSelect?.(entry.id, next)
      return
    }
    onSelect?.(entry.id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const at = actionable.findIndex((entry) => entry.id === activeId)
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(actionable[(at + 1) % actionable.length]?.id)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem(actionable[(at - 1 + actionable.length) % actionable.length]?.id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusItem(actionable[0]?.id)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusItem(actionable[actionable.length - 1]?.id)
    } else if ((event.key === 'Enter' || event.key === ' ') && at >= 0) {
      event.preventDefault()
      choose(actionable[at]!)
    } else if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey) {
      // 首字母跳转：500ms 内连续输入按前缀匹配。
      const now = Date.now()
      const buffer = now - typeahead.current.at > 500 ? event.key.toLowerCase() : typeahead.current.text + event.key.toLowerCase()
      typeahead.current = { text: buffer, at: now }
      const order = [...actionable.slice(at + 1), ...actionable.slice(0, at + 1)]
      focusItem(order.find((entry) => entry.label.toLowerCase().startsWith(buffer))?.id)
    }
  }

  const transition = reduced ? { duration: 0.12 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const inner = Math.max(radius - 5, 6)
  let row = 0

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)} style={{ '--c': color, ...style } as CSSProperties}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${uid}-menu` : undefined}
        onClick={() => setOpen(!isOpen, 'menu')}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true, 'first')
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true, 'last')
          }
        }}
        className={cn(
          'inline-flex h-10 items-center gap-2 border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-colors duration-150 outline-none',
          'hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c)',
          isOpen && 'bg-accent',
        )}
        style={{ borderRadius: radius - 2 }}
      >
        {triggerIcon && <span className="grid size-4 place-items-center text-muted-foreground [&>svg]:size-full">{triggerIcon}</span>}
        {label}
        <motion.svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden animate={{ rotate: isOpen ? 180 : 0 }} transition={transition}>
          <path d="m4 6 4 4 4-4" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id={`${uid}-menu`}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.93, y: reduced ? 0 : -8, filter: reduced ? 'blur(0px)' : 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : -4, transition: { duration: 0.14 } }}
            transition={transition}
            className={cn('absolute z-50 mt-2 isolate overflow-hidden border bg-popover/95 p-1.5 text-popover-foreground shadow-2xl shadow-black/45 backdrop-blur-xl outline-none', align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left')}
            style={{ width, borderRadius: radius }}
          >
            {items.map((entry, index) => {
              if (entry.type === 'separator') return <div key={index} role="separator" className="mx-1 my-1.5 h-px bg-border" />
              if (entry.type === 'label') return <div key={index} role="presentation" className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground">{entry.label}</div>
              const disabled = 'disabled' in entry && entry.disabled
              const danger = 'danger' in entry && entry.danger
              const isActive = active === entry.id
              const isCheckbox = entry.type === 'checkbox'
              const isChecked = isCheckbox && (checked?.[entry.id] ?? checks[entry.id])
              const order = row++
              return (
                <motion.div
                  key={entry.id}
                  data-id={entry.id}
                  role={isCheckbox ? 'menuitemcheckbox' : 'menuitem'}
                  aria-checked={isCheckbox ? Boolean(isChecked) : undefined}
                  aria-disabled={disabled || undefined}
                  tabIndex={-1}
                  onPointerMove={() => !disabled && activeId !== entry.id && focusItem(entry.id)}
                  onPointerLeave={() => setActiveId((prev) => (prev === entry.id ? null : prev))}
                  onClick={() => !disabled && choose(entry as Extract<MenuEntry, { id: string }>)}
                  initial={reduced ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: disabled ? 0.4 : 1, x: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.22, delay: 0.03 + order * 0.025 }}
                  className={cn('relative flex h-9 cursor-default items-center gap-2.5 px-2.5 text-sm outline-none select-none', danger ? 'text-rose-400' : 'text-foreground/90')}
                  style={{ borderRadius: inner }}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`${uid}-bar`}
                      aria-hidden
                      transition={transition}
                      className="absolute inset-0 -z-10"
                      style={{ borderRadius: inner, backgroundColor: danger ? 'color-mix(in oklab, #f43f5e 16%, transparent)' : 'color-mix(in oklab, var(--c) 15%, transparent)' }}
                    />
                  )}
                  <span className={cn('grid size-4 shrink-0 place-items-center [&>svg]:size-full', danger ? '' : isActive ? 'text-(--c)' : 'text-muted-foreground')}>
                    {isCheckbox ? (
                      <span className="grid size-4 place-items-center rounded-[5px] border transition-colors duration-150" style={{ borderColor: isChecked ? color : 'var(--border)', backgroundColor: isChecked ? color : 'transparent' }}>
                        <motion.svg viewBox="0 0 16 16" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ opacity: isChecked ? 1 : 0 }} transition={{ duration: 0.12 }}>
                          <motion.path d="m3.5 8.5 3 3 6-7" initial={false} animate={{ pathLength: isChecked ? 1 : 0 }} transition={{ duration: 0.2 }} />
                        </motion.svg>
                      </span>
                    ) : (
                      entry.icon
                    )}
                  </span>
                  <span className="flex-1 truncate">{entry.label}</span>
                  {showShortcuts && entry.shortcut && (
                    <span className="flex gap-0.5 text-[11px] text-muted-foreground">
                      {entry.shortcut.map((key, i) => (
                        <kbd key={i} className="font-sans">{key}</kbd>
                      ))}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
