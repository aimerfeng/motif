// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/menubar/demos/hero/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ffffff',
  radius: 0,
  density: 'comfortable',
  showShortcuts: true,
  openOnHover: false,
}
/* @motif:end */

export type MenubarEntry =
  | { type?: 'item'; id: string; label: string; shortcut?: string; disabled?: boolean }
  | { type: 'checkbox'; id: string; label: string; shortcut?: string; defaultChecked?: boolean }
  | { type: 'radio'; id: string; group: string; label: string }
  | { type: 'separator' }
  | { type: 'submenu'; id: string; label: string; items: MenubarEntry[] }

export type MenubarMenu = { id: string; label: string; disabled?: boolean; items: MenubarEntry[] }

/** 菜单栏状态：打开的菜单、高亮项、展开的子菜单与子菜单高亮项。 */
export type MenubarState = { open?: string; active?: string; sub?: string; subActive?: string }

export type MenubarAppProps = Partial<typeof defaults> & {
  menus?: MenubarMenu[]
  /** 单选组的初始值：group -> 选中项 id。 */
  defaultRadio?: Record<string, string>
  onSelect?: (id: string) => void
  /** 受控状态（演示自动播放用）。 */
  state?: MenubarState
  onStateChange?: (state: MenubarState) => void
  className?: string
  style?: CSSProperties
}

const SAMPLE: MenubarMenu[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'new', label: 'New', shortcut: '⌘N' },
      { id: 'open', label: 'Open', shortcut: '⌘O' },
      { id: 'save', label: 'Save', shortcut: '⌘S' },
      {
        type: 'submenu',
        id: 'export',
        label: 'Export',
        items: [
          { id: 'pdf', label: 'PDF' },
          { id: 'png', label: 'PNG' },
          { id: 'svg', label: 'SVG' },
        ],
      },
      { type: 'separator' },
      { id: 'print', label: 'Print', shortcut: '⌘P' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'cut', label: 'Cut', shortcut: '⌘X' },
      { id: 'copy', label: 'Copy', shortcut: '⌘C' },
      { id: 'paste', label: 'Paste', shortcut: '⌘V' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { id: 'zoom-in', label: 'Zoom In', shortcut: '⌘+' },
      { id: 'zoom-out', label: 'Zoom Out', shortcut: '⌘−' },
      {
        type: 'submenu',
        id: 'layout',
        label: 'Layout',
        items: [
          { type: 'radio', group: 'layout', id: 'single', label: 'Single Page' },
          { type: 'radio', group: 'layout', id: 'two', label: 'Two Pages' },
          { type: 'radio', group: 'layout', id: 'continuous', label: 'Continuous' },
        ],
      },
      { type: 'separator' },
      { type: 'checkbox', id: 'minimap', label: 'Minimap', defaultChecked: true },
      { type: 'checkbox', id: 'search', label: 'Search', shortcut: '⇧⌘F', defaultChecked: true },
      { type: 'checkbox', id: 'sidebar', label: 'Sidebar', shortcut: '⌘B' },
      { type: 'separator' },
      { id: 'fullscreen', label: 'Full Screen', shortcut: '⌃⌘F' },
    ],
  },
  { id: 'help', label: 'Help', disabled: true, items: [] },
]

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? '#0a0a0a' : '#ffffff'
}

type Actionable = Exclude<MenubarEntry, { type: 'separator' }>
const actionable = (items: MenubarEntry[]) => items.filter((e): e is Actionable => e.type !== 'separator' && !('disabled' in e && e.disabled))
const isCheckable = (e: MenubarEntry) => e.type === 'checkbox' || e.type === 'radio'

function collectChecked(menus: MenubarMenu[]) {
  const out: Record<string, boolean> = {}
  const walk = (list: MenubarEntry[]) =>
    list.forEach((e) => {
      if (e.type === 'checkbox') out[e.id] = Boolean(e.defaultChecked)
      if (e.type === 'submenu') walk(e.items)
    })
  menus.forEach((m) => walk(m.items))
  return out
}

const triggerClass =
  'box-border h-8 cursor-default border-0 bg-transparent px-3 text-sm leading-5 font-normal text-white select-none outline-none [border-radius:var(--mb-radius)] data-disabled:text-neutral-400 hover:[&:not([data-disabled])]:bg-neutral-800 active:[&:not([data-disabled])]:bg-neutral-700 data-pressed:bg-neutral-800 focus-visible:relative focus-visible:bg-neutral-800 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-[var(--mb-accent)]'
const popupClass = 'absolute z-50 box-border border border-[var(--mb-accent)] bg-neutral-950 py-1 text-white outline-hidden'
const highlight =
  "data-highlighted:text-[var(--mb-ink)] data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-[var(--mb-radius)] data-highlighted:before:bg-[var(--mb-accent)] data-highlighted:before:content-['']"
const itemBase = 'group relative z-0 flex w-full cursor-default items-center justify-between gap-4 text-left text-sm leading-4 font-normal whitespace-nowrap outline-hidden select-none'
const openClass =
  "data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:rounded-[var(--mb-radius)] data-popup-open:before:bg-neutral-800 data-popup-open:before:content-['']"
const separatorClass = 'm-1 h-px bg-[var(--mb-accent)]'

function CaretRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M6 12V4l4.5 4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  )
}

/** 应用菜单栏：点开一个菜单后悬停切换，左右键跨菜单、上下键在菜单内移动；支持快捷键提示、勾选项、单选组和子菜单。 */
export function MenubarApp({ menus = SAMPLE, defaultRadio = { layout: 'single' }, onSelect, state, onStateChange, className, style, ...props }: MenubarAppProps) {
  const { accent, radius, density, showShortcuts, openOnHover } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [inner, setInner] = useState<MenubarState>({})
  const [focusId, setFocusId] = useState(menus[0]?.id)
  const [checked, setChecked] = useState(() => collectChecked(menus))
  const [radio, setRadio] = useState(defaultRadio)
  const [place, setPlace] = useState({ dx: 0, subLeft: false })
  const current = state ?? inner
  const set = (next: MenubarState) => {
    setInner(next)
    onStateChange?.(next)
  }

  const menu = menus.find((m) => m.id === current.open)
  const subEntry = menu?.items.find((e): e is Extract<MenubarEntry, { type: 'submenu' }> => e.type === 'submenu' && e.id === current.sub)
  const py = density === 'compact' ? 'py-1.5' : 'py-2'

  // 贴边：弹层越过视口右边时向左挪；子菜单放不下就开到左侧。
  useLayoutEffect(() => {
    const root = rootRef.current
    const popup = popupRef.current
    if (!root || !popup || !current.open) return
    const rect = root.getBoundingClientRect()
    const scale = rect.width / (root.offsetWidth || 1)
    const bw = (window.innerWidth - rect.left) / scale - 4
    const left = triggerRefs.current[current.open]?.parentElement?.offsetLeft ?? 0
    const w = popup.offsetWidth
    const dx = Math.min(0, bw - (left + w))
    let subLeft = false
    const sub = subRef.current
    if (sub) subLeft = left + dx + w - 4 + sub.offsetWidth > bw && left + dx - sub.offsetWidth + 4 >= -rect.left / scale
    setPlace((prev) => (prev.dx === dx && prev.subLeft === subLeft ? prev : { dx, subLeft }))
  }, [current.open, current.sub, menus, density, showShortcuts])

  useEffect(() => {
    if (!current.open || state) return
    const close = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setInner({})
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [current.open, state])

  useEffect(() => {
    if (current.open && !state) popupRef.current?.focus()
  }, [current.open, state])

  const enabledMenus = menus.filter((m) => !m.disabled)
  const first = (list: MenubarEntry[]) => actionable(list)[0]?.id

  const openMenu = (id: string, highlightFirst = false) => {
    const m = menus.find((x) => x.id === id)
    if (!m || m.disabled) return
    setFocusId(id)
    set({ open: id, active: highlightFirst ? first(m.items) : undefined })
  }

  const close = (focusTrigger = true) => {
    const id = current.open
    set({})
    if (focusTrigger && id) triggerRefs.current[id]?.focus()
  }

  const shiftMenu = (step: number) => {
    const i = enabledMenus.findIndex((m) => m.id === current.open)
    const next = enabledMenus[(i + step + enabledMenus.length) % enabledMenus.length]
    if (next) openMenu(next.id, true)
  }

  const choose = (entry: Actionable) => {
    if (entry.type === 'checkbox') {
      setChecked((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))
      onSelect?.(entry.id)
      return
    }
    if (entry.type === 'radio') {
      setRadio((prev) => ({ ...prev, [entry.group]: entry.id }))
      onSelect?.(entry.id)
      return
    }
    if (entry.type === 'submenu') {
      set({ ...current, active: entry.id, sub: entry.id, subActive: first(entry.items) })
      return
    }
    onSelect?.(entry.id)
    close()
  }

  const move = (list: MenubarEntry[], from: string | undefined, step: number | 'first' | 'last') => {
    const ids = actionable(list).map((e) => e.id)
    if (!ids.length) return undefined
    if (step === 'first') return ids[0]
    if (step === 'last') return ids[ids.length - 1]
    const i = from ? ids.indexOf(from) : -1
    if (i < 0) return step > 0 ? ids[0] : ids[ids.length - 1]
    return ids[(i + step + ids.length) % ids.length]
  }

  const onTriggerKeyDown = (event: KeyboardEvent, id: string) => {
    const i = menus.findIndex((m) => m.id === id)
    const focusAt = (j: number) => {
      const m = menus[(j + menus.length) % menus.length]!
      setFocusId(m.id)
      triggerRefs.current[m.id]?.focus()
    }
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        focusAt(i + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        focusAt(i - 1)
        break
      case 'Home':
        event.preventDefault()
        focusAt(0)
        break
      case 'End':
        event.preventDefault()
        focusAt(menus.length - 1)
        break
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault()
        openMenu(id, true)
        break
    }
  }

  const onMenuKeyDown = (event: KeyboardEvent) => {
    if (!menu) return
    const inSub = Boolean(subEntry && current.subActive)
    const list = inSub ? subEntry!.items : menu.items
    const at = inSub ? current.subActive : current.active
    const go = (next: string | undefined) => set(inSub ? { ...current, subActive: next } : { ...current, active: next, sub: undefined, subActive: undefined })
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        go(move(list, at, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        go(move(list, at, -1))
        break
      case 'Home':
        event.preventDefault()
        go(move(list, at, 'first'))
        break
      case 'End':
        event.preventDefault()
        go(move(list, at, 'last'))
        break
      case 'ArrowRight': {
        event.preventDefault()
        const entry = menu.items.find((e) => e.type === 'submenu' && e.id === current.active)
        if (!inSub && entry && entry.type === 'submenu') set({ ...current, sub: entry.id, subActive: first(entry.items) })
        else shiftMenu(1)
        break
      }
      case 'ArrowLeft':
        event.preventDefault()
        if (inSub) set({ ...current, sub: undefined, subActive: undefined })
        else shiftMenu(-1)
        break
      case 'Enter':
      case ' ': {
        event.preventDefault()
        const entry = actionable(list).find((e) => e.id === at)
        if (entry) choose(entry)
        break
      }
      case 'Escape':
        event.preventDefault()
        if (inSub) set({ ...current, sub: undefined, subActive: undefined })
        else close()
        break
      case 'Tab':
        close(false)
        break
    }
  }

  const transition = { duration: reduced ? 0.08 : 0.1, ease: 'easeOut' as const }
  const from = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
  const to = reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }
  const popupRadius = `calc(var(--mb-radius) + min(var(--mb-radius), 4px))`

  const shortcut = (text?: string) =>
    showShortcuts && text ? <span className="text-xs tracking-wide text-neutral-400 group-data-highlighted:text-current group-data-highlighted:opacity-70">{text}</span> : null

  const renderList = (list: MenubarEntry[], level: 0 | 1) => {
    const inset = list.some(isCheckable)
    const pad = inset ? 'pl-2.5' : 'pl-4'
    return list.map((entry, i) => {
      if (entry.type === 'separator') return <div key={`sep-${i}`} role="separator" className={separatorClass} />
      const highlighted = level === 0 ? current.active === entry.id && !(current.sub && current.subActive) : current.subActive === entry.id
      const hover = () => {
        if (level === 0) set({ ...current, active: entry.id, sub: entry.type === 'submenu' ? entry.id : undefined, subActive: undefined })
        else set({ ...current, subActive: entry.id })
      }
      // 勾选/单选项的指示列：和上游一样是 1rem + 0.5rem 间距；普通项在同一菜单里也留出这一列以对齐。
      const lead = inset ? (
        <span className="grid w-4 shrink-0 place-items-center">
          {(entry.type === 'checkbox' && checked[entry.id]) || (entry.type === 'radio' && radio[entry.group] === entry.id) ? <CheckIcon /> : null}
        </span>
      ) : null
      if (entry.type === 'submenu') {
        const open = current.sub === entry.id
        return (
          <div key={entry.id} className="relative">
            <div
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open}
              tabIndex={-1}
              data-highlighted={current.active === entry.id && !current.subActive ? '' : undefined}
              data-popup-open={open ? '' : undefined}
              className={cn(itemBase, py, pad, 'pr-2', openClass, highlight)}
              onPointerEnter={hover}
              onClick={() => choose(entry)}
            >
              <span className="flex items-center gap-2">
                {lead}
                {entry.label}
              </span>
              <CaretRightIcon />
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={subRef}
                  role="menu"
                  aria-label={entry.label}
                  className={cn(popupClass, 'top-[-5px]', place.subLeft ? 'right-[calc(100%-4px)] origin-top-right' : 'left-[calc(100%-4px)] origin-top-left')}
                  style={{ borderRadius: popupRadius }}
                  initial={from}
                  animate={to}
                  exit={from}
                  transition={transition}
                >
                  {renderList(entry.items, 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }
      const disabled = entry.type !== 'checkbox' && entry.type !== 'radio' && entry.disabled
      const role = entry.type === 'checkbox' ? 'menuitemcheckbox' : entry.type === 'radio' ? 'menuitemradio' : 'menuitem'
      const isChecked = entry.type === 'checkbox' ? Boolean(checked[entry.id]) : entry.type === 'radio' ? radio[entry.group] === entry.id : undefined
      return (
        <div
          key={entry.id}
          role={role}
          aria-checked={isChecked}
          tabIndex={-1}
          aria-disabled={disabled || undefined}
          data-highlighted={highlighted ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          className={cn(itemBase, py, pad, inset ? 'pr-8' : 'pr-4', highlight, 'data-disabled:text-neutral-400')}
          onPointerEnter={hover}
          onClick={() => !disabled && choose(entry)}
        >
          <span className="flex items-center gap-2">
            {lead}
            {entry.label}
          </span>
          {'shortcut' in entry ? shortcut(entry.shortcut) : null}
        </div>
      )
    })
  }

  return (
    <div
      ref={rootRef}
      role="menubar"
      aria-label="Application"
      className={cn('relative flex items-center', className)}
      style={{ '--mb-accent': accent, '--mb-ink': inkFor(accent), '--mb-radius': `${radius}px`, ...style } as CSSProperties}
    >
      {menus.map((m) => {
        const open = current.open === m.id
        return (
          <div key={m.id} className="relative">
            <button
              ref={(el) => {
                triggerRefs.current[m.id] = el
              }}
              type="button"
              role="menuitem"
              aria-haspopup={m.disabled ? undefined : 'menu'}
              aria-expanded={m.disabled ? undefined : open}
              aria-disabled={m.disabled || undefined}
              data-disabled={m.disabled ? '' : undefined}
              data-pressed={open ? '' : undefined}
              tabIndex={(focusId ?? menus[0]?.id) === m.id ? 0 : -1}
              className={triggerClass}
              onClick={() => (open ? close() : openMenu(m.id))}
              onPointerEnter={() => {
                if (m.disabled || open) return
                if (current.open || openOnHover) openMenu(m.id)
              }}
              onKeyDown={(event) => onTriggerKeyDown(event, m.id)}
              onFocus={() => setFocusId(m.id)}
            >
              {m.label}
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={popupRef}
                  role="menu"
                  aria-label={m.label}
                  tabIndex={-1}
                  className={cn(popupClass, 'top-[calc(100%+4px)] left-0 origin-top-left')}
                  style={{ x: place.dx, borderRadius: popupRadius }}
                  initial={from}
                  animate={to}
                  exit={{ ...from, transition: { duration: 0 } }}
                  transition={transition}
                  onKeyDown={onMenuKeyDown}
                >
                  {renderList(m.items, 0)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
