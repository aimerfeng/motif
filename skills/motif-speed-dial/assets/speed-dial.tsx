// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/fabs/speed-dial.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  direction: 'up',
  size: 56,
  radius: 28,
  color: '#f2542d',
  surface: '#ffffff',
  ink: '#1f2430',
  showLabels: true,
  spring: {
    visualDuration: 0.38,
    bounce: 0.3,
  },
}
/* @motif:end */

export type SpeedDialAction = {
  key: string
  label: string
  icon: ReactNode
  onSelect?: () => void
}

export type SpeedDialProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 不传则使用四个示例动作。 */
  actions?: SpeedDialAction[]
  /** 受控：是否展开。 */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** 主按钮的无障碍名称。 */
  label?: string
}

type IconProps = { children: ReactNode }
function Icon({ children }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="size-[46%]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

const DEFAULT_ACTIONS: SpeedDialAction[] = [
  { key: 'note', label: 'New note', icon: <Icon><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m14 7 3 3" /></Icon> },
  { key: 'photo', label: 'Add photo', icon: <Icon><rect x="3.5" y="5" width="17" height="14" rx="3" /><circle cx="9" cy="10.5" r="1.6" /><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" /></Icon> },
  { key: 'link', label: 'Save link', icon: <Icon><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Icon> },
  { key: 'voice', label: 'Voice memo', icon: <Icon><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" /></Icon> },
]

const VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const

/** 点一下主按钮，一排圆形动作按钮带着弹性依次弹出。支持键盘（方向键、Home / End、Esc）、点外面收起。纵向展开时每个动作旁有文字标签。 */
export function SpeedDial({ className, style, actions = DEFAULT_ACTIONS, open, defaultOpen = false, onOpenChange, label = 'Quick actions', ...props }: SpeedDialProps) {
  const { direction, size, radius, color, surface, ink, showLabels, spring } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focusOnOpen = useRef(false)
  const [inner, setInner] = useState(defaultOpen)
  const expanded = open ?? inner

  const vertical = direction === 'up' || direction === 'down'
  const [vx, vy] = VECTORS[direction as keyof typeof VECTORS] ?? VECTORS.up
  const itemSize = Math.round(size * 0.8)
  const gap = Math.max(8, Math.round(size * 0.18))
  const first = size / 2 + gap + itemSize / 2
  const itemRadius = Math.min(radius, itemSize / 2)

  const setOpen = (next: boolean) => {
    if (open === undefined) setInner(next)
    onOpenChange?.(next)
  }

  // 点外面收起。
  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  })

  // 用户亲手打开时把焦点交给第一个动作；自动播放或受控打开不抢焦点。
  useEffect(() => {
    if (expanded && focusOnOpen.current) itemRefs.current[0]?.focus()
    focusOnOpen.current = false
  }, [expanded])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!expanded) return
    const count = actions.length
    const active = itemRefs.current.findIndex((node) => node === document.activeElement)
    const move = (index: number) => itemRefs.current[(index + count) % count]?.focus()
    // 动作沿展开方向排列：朝展开方向的方向键走向更远的一个。
    const forward = vertical ? (direction === 'up' ? 'ArrowUp' : 'ArrowDown') : direction === 'left' ? 'ArrowLeft' : 'ArrowRight'
    const backward = vertical ? (direction === 'up' ? 'ArrowDown' : 'ArrowUp') : direction === 'left' ? 'ArrowRight' : 'ArrowLeft'
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === forward) {
      event.preventDefault()
      move(active < 0 ? 0 : active + 1)
    } else if (event.key === backward) {
      event.preventDefault()
      if (active <= 0) triggerRef.current?.focus()
      else move(active - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      move(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      move(count - 1)
    }
  }

  const transition = (index: number) =>
    reduced
      ? { duration: 0 }
      : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce, delay: expanded ? index * 0.045 : (actions.length - 1 - index) * 0.03 }

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)} style={{ width: size, height: size, ...style }} onKeyDown={onKeyDown}>
      <div id={menuId} role="menu" aria-label={label} aria-orientation={vertical ? 'vertical' : 'horizontal'}>
        {actions.map((action, index) => {
          const distance = first + index * (itemSize + gap)
          return (
            <motion.div
              key={action.key}
              className="absolute"
              style={{ left: (size - itemSize) / 2, top: (size - itemSize) / 2, width: itemSize, height: itemSize, pointerEvents: expanded ? 'auto' : 'none' }}
              initial={false}
              animate={expanded ? { x: vx * distance, y: vy * distance, opacity: 1, scale: 1 } : { x: 0, y: 0, opacity: 0, scale: 0.4 }}
              transition={transition(index)}
              aria-hidden={!expanded}
            >
              <button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role="menuitem"
                tabIndex={expanded ? 0 : -1}
                title={action.label}
                aria-label={action.label}
                onClick={() => {
                  action.onSelect?.()
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className="grid size-full place-items-center outline-offset-2 focus-visible:outline-2 focus-visible:outline-current active:scale-95"
                style={{ backgroundColor: surface, color: ink, borderRadius: itemRadius, boxShadow: '0 1px 2px rgb(20 20 40 / 0.08), 0 8px 20px -6px rgb(20 20 40 / 0.25)' }}
              >
                {action.icon}
              </button>
              {showLabels && vertical && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
                  style={{ backgroundColor: ink, color: surface }}
                >
                  {action.label}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={expanded}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => {
          if (!expanded) focusOnOpen.current = true
          setOpen(!expanded)
        }}
        className="absolute inset-0 grid place-items-center outline-offset-3 focus-visible:outline-2 focus-visible:outline-current"
        style={{ backgroundColor: color, color: '#ffffff', borderRadius: radius, boxShadow: `0 10px 24px -8px ${color}99, 0 2px 4px rgb(20 20 40 / 0.12)` }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="size-[44%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          animate={{ rotate: expanded ? 135 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.3, bounce: 0.25 }}
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </motion.svg>
      </motion.button>
    </div>
  )
}
