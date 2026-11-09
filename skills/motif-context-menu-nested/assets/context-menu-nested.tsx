// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/context-menu/demos/submenu/tailwind/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ffffff',
  radius: 0,
  submenuDelay: 100,
  label: 'Right click here',
}
/* @motif:end */

export type ContextMenuEntry =
  | { type?: 'item'; id: string; label: string; disabled?: boolean; destructive?: boolean }
  | { type: 'separator' }
  | { type: 'submenu'; id: string; label: string; items: ContextMenuEntry[] }

/** 菜单状态：打开位置（相对组件左上角）、高亮项、展开的子菜单与子菜单高亮项。 */
export type ContextMenuState = { point: { x: number; y: number } | null; active?: string; sub?: string; subActive?: string }

export type ContextMenuNestedProps = Partial<typeof defaults> & {
  items?: ContextMenuEntry[]
  onSelect?: (id: string) => void
  /** 受控状态（演示自动播放用）。 */
  state?: ContextMenuState
  onStateChange?: (state: ContextMenuState) => void
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const SAMPLE: ContextMenuEntry[] = [
  { id: 'library', label: 'Add to Library' },
  {
    type: 'submenu',
    id: 'playlist',
    label: 'Add to Playlist',
    items: [
      { id: 'get-up', label: 'Get Up!' },
      { id: 'inside-out', label: 'Inside Out' },
      { id: 'night-beats', label: 'Night Beats' },
      { type: 'separator' },
      { id: 'new-playlist', label: 'New playlist…' },
    ],
  },
  { type: 'separator' },
  { id: 'play-next', label: 'Play Next' },
  { id: 'play-last', label: 'Play Last' },
  { type: 'separator' },
  { id: 'favorite', label: 'Favorite' },
  { id: 'share', label: 'Share' },
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

const actionable = (items: ContextMenuEntry[]) => items.filter((e): e is Exclude<ContextMenuEntry, { type: 'separator' }> => e.type !== 'separator' && !('disabled' in e && e.disabled))

const popupClass = 'absolute z-50 border border-[var(--cm-accent)] bg-neutral-950 py-1 text-white shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-hidden'
const itemClass =
  "relative z-0 flex w-full cursor-default py-2 pr-6 pl-4 text-left text-sm leading-4 whitespace-nowrap outline-hidden select-none data-highlighted:text-[var(--cm-ink)] data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-[var(--cm-radius)] data-highlighted:before:bg-[var(--cm-accent)] data-highlighted:before:content-[''] data-disabled:text-neutral-400"
const submenuTriggerClass =
  "relative z-0 flex w-full cursor-default items-center justify-between gap-4 py-2 pr-2 pl-4 text-left text-sm leading-4 whitespace-nowrap outline-hidden select-none data-popup-open:before:absolute data-popup-open:before:inset-x-1 data-popup-open:before:inset-y-0 data-popup-open:before:z-[-1] data-popup-open:before:rounded-[var(--cm-radius)] data-popup-open:before:bg-neutral-800 data-popup-open:before:content-[''] data-highlighted:text-[var(--cm-ink)] data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-[var(--cm-radius)] data-highlighted:before:bg-[var(--cm-accent)] data-highlighted:before:content-['']"
const separatorClass = 'mx-1 my-1 h-px bg-[var(--cm-accent)]'

function CaretRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M6 12V4l4.5 4z" />
    </svg>
  )
}

/** 右键菜单：在指针处打开，贴边时翻转；子菜单悬停延时展开；方向键、Enter、Esc、Shift+F10 与触屏长按都可用。 */
export function ContextMenuNested({ items = SAMPLE, onSelect, state, onStateChange, children, className, style, ...props }: ContextMenuNestedProps) {
  const { accent, radius, submenuDelay, label } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<number | undefined>(undefined)
  const pressTimer = useRef<number | undefined>(undefined)
  const [inner, setInner] = useState<ContextMenuState>({ point: null })
  const [flip, setFlip] = useState({ dx: 0, dy: 0, subLeft: false, subDy: 0 })
  const current = state ?? inner
  const set = (next: ContextMenuState) => {
    setInner(next)
    onStateChange?.(next)
  }

  const subEntry = items.find((e): e is Extract<ContextMenuEntry, { type: 'submenu' }> => e.type === 'submenu' && e.id === current.sub)

  // 贴边翻转：主菜单越过容器右/下边时向左/上翻；子菜单越过右边时开到左侧。
  useLayoutEffect(() => {
    const root = rootRef.current
    const popup = popupRef.current
    if (!root || !popup || !current.point) return
    const rect = root.getBoundingClientRect()
    const scale = rect.width / (root.offsetWidth || 1)
    // 视口边界换算到组件自身坐标系（capture 的 zoom 会缩放）
    const bx = -rect.left / scale
    const bw = (window.innerWidth - rect.left) / scale
    const bh = (window.innerHeight - rect.top) / scale
    const w = popup.offsetWidth
    const h = popup.offsetHeight
    const dx = current.point.x + w > bw ? -w : 0
    const dy = current.point.y + h > bh ? Math.max(-h, -current.point.y) : 0
    let subLeft = false
    let subDy = 0
    const sub = subRef.current
    if (sub) {
      const left = current.point.x + dx
      subLeft = left + w - 4 + sub.offsetWidth > bw && left - sub.offsetWidth + 4 >= bx
      const parent = sub.parentElement
      const top = current.point.y + dy + (parent?.offsetTop ?? 0) - 4
      subDy = top + sub.offsetHeight > bh ? Math.max(bh - top - sub.offsetHeight, -top - rect.top / scale) : 0
    }
    setFlip((prev) => (prev.dx === dx && prev.dy === dy && prev.subLeft === subLeft && prev.subDy === subDy ? prev : { dx, dy, subLeft, subDy }))
  }, [current.point, current.sub, items])

  useEffect(() => {
    if (!current.point || state) return
    const close = (event: globalThis.PointerEvent) => {
      if (popupRef.current?.contains(event.target as Node)) return
      setInner({ point: null })
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [current.point, state])

  useEffect(() => {
    if (current.point && !state) popupRef.current?.focus()
  }, [current.point, state])

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current)
      window.clearTimeout(pressTimer.current)
    },
    [],
  )

  const openAt = (clientX: number, clientY: number) => {
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const scale = rect.width / (root.offsetWidth || 1)
    set({ point: { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale } })
  }

  const close = (focusTrigger = true) => {
    set({ point: null })
    if (focusTrigger) triggerRef.current?.focus()
  }

  const choose = (id: string) => {
    onSelect?.(id)
    close()
  }

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    openAt(event.clientX, event.clientY)
  }

  const onTriggerPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return
    const { clientX, clientY } = event
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => openAt(clientX, clientY), 500)
  }
  const cancelPress = () => window.clearTimeout(pressTimer.current)

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      event.preventDefault()
      const rect = triggerRef.current!.getBoundingClientRect()
      openAt(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
  }

  const move = (list: ContextMenuEntry[], from: string | undefined, step: number | 'first' | 'last') => {
    const ids = actionable(list).map((e) => e.id)
    if (!ids.length) return undefined
    if (step === 'first') return ids[0]
    if (step === 'last') return ids[ids.length - 1]
    const i = from ? ids.indexOf(from) : -1
    return ids[(i + step + ids.length) % ids.length]
  }

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const inSub = Boolean(subEntry && current.subActive)
    const list = inSub ? subEntry!.items : items
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
        const entry = items.find((e) => e.type === 'submenu' && e.id === current.active)
        if (!inSub && entry && entry.type === 'submenu') {
          event.preventDefault()
          set({ ...current, sub: entry.id, subActive: move(entry.items, undefined, 'first') })
        }
        break
      }
      case 'ArrowLeft':
        if (inSub) {
          event.preventDefault()
          set({ ...current, sub: undefined, subActive: undefined })
        }
        break
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (inSub && at) choose(at)
        else {
          const entry = items.find((e) => e.type !== 'separator' && e.id === at)
          if (entry?.type === 'submenu') set({ ...current, sub: entry.id, subActive: move(entry.items, undefined, 'first') })
          else if (at) choose(at)
        }
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

  const hoverSub = (id: string | undefined) => {
    window.clearTimeout(hoverTimer.current)
    if (id === current.sub) return
    hoverTimer.current = window.setTimeout(() => set({ ...current, active: id ?? current.active, sub: id, subActive: undefined }), submenuDelay)
  }

  const transition = { duration: reduced ? 0.08 : 0.1, ease: 'easeOut' as const }
  const from = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
  const to = reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }

  const renderList = (list: ContextMenuEntry[], level: 0 | 1) =>
    list.map((entry, i) => {
      if (entry.type === 'separator') return <div key={`sep-${i}`} role="separator" className={separatorClass} />
      const highlighted = level === 0 ? current.active === entry.id && !(current.sub && current.subActive) : current.subActive === entry.id
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
              className={submenuTriggerClass}
              onPointerEnter={() => {
                set({ ...current, active: entry.id, subActive: undefined })
                hoverSub(entry.id)
              }}
              onClick={() => set({ ...current, active: entry.id, sub: entry.id })}
            >
              {entry.label} <CaretRightIcon />
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={subRef}
                  role="menu"
                  aria-label={entry.label}
                  className={cn(popupClass, 'top-[-5px]', flip.subLeft ? 'right-[calc(100%-4px)] origin-top-right' : 'left-[calc(100%-4px)] origin-top-left')}
                  style={{ marginTop: flip.subDy, borderRadius: `calc(var(--cm-radius) + min(var(--cm-radius), 4px))` }}
                  initial={from}
                  animate={to}
                  exit={from}
                  transition={transition}
                  onPointerEnter={() => window.clearTimeout(hoverTimer.current)}
                >
                  {renderList(entry.items, 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }
      return (
        <div
          key={entry.id}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={entry.disabled || undefined}
          data-highlighted={highlighted ? '' : undefined}
          data-disabled={entry.disabled ? '' : undefined}
          className={cn(itemClass, entry.destructive && 'text-red-400')}
          onPointerEnter={() => {
            if (level === 0) {
              set({ ...current, active: entry.id, subActive: undefined })
              hoverSub(undefined)
            } else set({ ...current, subActive: entry.id })
          }}
          onClick={() => !entry.disabled && choose(entry.id)}
        >
          {entry.label}
        </div>
      )
    })

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      style={{ '--cm-accent': accent, '--cm-ink': inkFor(accent), '--cm-radius': `${radius}px`, ...style } as CSSProperties}
    >
      <div
        ref={triggerRef}
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={Boolean(current.point)}
        aria-label={`${label}. Press Shift+F10 for actions.`}
        className="flex aspect-5/3 w-full max-w-64 items-center justify-center border border-[var(--cm-accent)] bg-neutral-950 text-sm text-white outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cm-accent)]"
        style={{ borderRadius: `calc(var(--cm-radius) * 2)`, WebkitTouchCallout: 'none' }}
        onContextMenu={onContextMenu}
        onKeyDown={onTriggerKeyDown}
        onPointerDown={onTriggerPointerDown}
        onPointerUp={cancelPress}
        onPointerMove={cancelPress}
        onPointerCancel={cancelPress}
      >
        {children ?? label}
      </div>
      <AnimatePresence>
        {current.point && (
          <motion.div
            ref={popupRef}
            role="menu"
            aria-label="Actions"
            tabIndex={-1}
            className={cn(popupClass, flip.dx ? 'origin-top-right' : 'origin-top-left')}
            style={{ left: current.point.x + flip.dx, top: current.point.y + flip.dy, borderRadius: `calc(var(--cm-radius) + min(var(--cm-radius), 4px))` }}
            initial={from}
            animate={to}
            exit={from}
            transition={transition}
            onKeyDown={onMenuKeyDown}
            onContextMenu={(event) => event.preventDefault()}
          >
            {renderList(items, 0)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
