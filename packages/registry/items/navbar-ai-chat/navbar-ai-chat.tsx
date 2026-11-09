// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-591.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  model: 'orion-alpha-45',
  showDescriptions: true,
  showTemporaryChat: true,
  height: 64,
  radius: 8,
  accent: '#6366f1',
}
/* @motif:end */

export const MODELS = [
  { value: 'orion-alpha-45', label: 'Orion-Alpha 4.5', desc: 'Balanced performance and creativity' },
  { value: 'orion-code-4', label: 'Orion-Code 4', desc: 'Optimized for code generation and understanding' },
  { value: 'nova-chat-4', label: 'Nova-Chat 4', desc: 'Excels at natural, engaging conversations' },
  { value: 'galaxy-max-4', label: 'Galaxy-Max 4', desc: 'Most powerful model for complex tasks' },
]

export type NavbarAiChatProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：模型下拉是否打开 */
  selectOpen?: boolean
  /** 受控：下拉里高亮的选项序号 */
  activeIndex?: number
  /** 受控：账户菜单是否打开 */
  menuOpen?: boolean
  onModelChange?: (value: string) => void
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#ffffff'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0b0b0f' : '#ffffff'
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" className={cn('size-4 shrink-0', className)} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

const BotIcon = () => (
  <Icon className="text-muted-foreground/80">
    <path d="M12 6V2H8" />
    <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
    <path d="M2 12h2" />
    <path d="M9 11v2" />
    <path d="M15 11v2" />
    <path d="M20 12h2" />
  </Icon>
)

const ChevronIcon = () => (
  <Icon className="opacity-60">
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

const CheckIcon = () => (
  <Icon>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

const DashedChatIcon = () => (
  <Icon>
    <path d="M13.5 3.1c-.5 0-1-.1-1.5-.1s-1 .1-1.5.1" />
    <path d="M19.3 6.8a10.45 10.45 0 0 0-2.1-2.1" />
    <path d="M20.9 13.5c.1-.5.1-1 .1-1.5s-.1-1-.1-1.5" />
    <path d="M17.2 19.3a10.45 10.45 0 0 0 2.1-2.1" />
    <path d="M10.5 20.9c.5.1 1 .1 1.5.1s1-.1 1.5-.1" />
    <path d="M3.5 17.5 2 22l4.5-1.5" />
    <path d="M3.1 10.5c0 .5-.1 1-.1 1.5s.1 1 .1 1.5" />
    <path d="M6.8 4.7a10.45 10.45 0 0 0-2.1 2.1" />
  </Icon>
)

const MENU_ICONS: Record<string, ReactNode> = {
  bolt: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  layers: (
    <>
      <path d="M10 22v-6.57" />
      <path d="M12 11h.01" />
      <path d="M12 7h.01" />
      <path d="M14 15.43V22" />
      <path d="M15 16a5 5 0 0 0-6 0" />
      <path d="M16 11h.01" />
      <path d="M16 7h.01" />
      <path d="M8 11h.01" />
      <path d="M8 7h.01" />
      <rect x="4" y="2" width="16" height="20" rx="2" />
    </>
  ),
  book: (
    <>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </>
  ),
  user: (
    <>
      <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
      <circle cx="10" cy="7" r="4" />
    </>
  ),
  logout: (
    <>
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </>
  ),
}

const MENU_GROUPS = [
  [
    { icon: 'bolt', label: 'Settings' },
    { icon: 'layers', label: 'Workspaces' },
    { icon: 'book', label: 'Prompt library' },
  ],
  [
    { icon: 'pin', label: 'Pinned chats' },
    { icon: 'user', label: 'Edit profile' },
  ],
  [{ icon: 'logout', label: 'Log out' }],
]

function usePopoverDismiss(open: boolean, ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, ref, close])
}

const popIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } }

function ModelSelect({
  value,
  onChange,
  showDescriptions,
  radius,
  accent,
  open: openProp,
  activeIndex: activeProp,
}: {
  value: string
  onChange: (v: string) => void
  showDescriptions: boolean
  radius: number
  accent: string
  open?: boolean
  activeIndex?: number
}) {
  const reduce = useReducedMotion()
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [openState, setOpen] = useState(false)
  const [activeState, setActive] = useState(0)
  const open = openProp ?? openState
  const active = activeProp ?? activeState
  const selected = MODELS.find((m) => m.value === value) ?? MODELS[0]!

  const close = () => setOpen(false)
  usePopoverDismiss(openState, root, close)

  useEffect(() => {
    if (openState) list.current?.focus()
  }, [openState])

  const openList = () => {
    setActive(Math.max(0, MODELS.findIndex((m) => m.value === value)))
    setOpen(true)
  }
  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
    trigger.current?.focus()
  }
  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % MODELS.length)
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + MODELS.length) % MODELS.length)
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(MODELS.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') pick(MODELS[active]!.value)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
      if (e.key === 'Escape') trigger.current?.focus()
      return
    } else return
    e.preventDefault()
  }

  return (
    <div ref={root} className="relative min-w-0">
      <button
        ref={trigger}
        type="button"
        aria-label="Select AI model"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            openList()
          }
        }}
        className="flex h-9 max-w-full min-w-0 items-center gap-2 border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        style={{ borderRadius: radius }}
      >
        <BotIcon />
        <span className="truncate">{selected.label}</span>
        <ChevronIcon />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label="Models"
            aria-activedescendant={`${id}-opt-${active}`}
            onKeyDown={onListKey}
            {...(reduce ? {} : popIn)}
            transition={{ duration: 0.15 }}
            className="absolute start-0 top-full z-50 mt-1 w-[min(18rem,calc(100vw-2rem))] origin-top-left border bg-popover p-1 text-popover-foreground shadow-lg outline-none"
            style={{ borderRadius: radius }}
          >
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Models</div>
            {MODELS.map((m, i) => (
              <div
                key={m.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={m.value === value}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(m.value)}
                className={cn('relative cursor-default py-1.5 ps-2 pe-8 text-sm select-none', i === active && 'bg-accent text-accent-foreground')}
                style={{ borderRadius: Math.max(0, radius - 4) }}
              >
                {m.label}
                {showDescriptions && <span className="mt-1 block text-xs text-muted-foreground">{m.desc}</span>}
                {m.value === value && (
                  <span className="absolute end-2 top-2 flex size-3.5 items-center justify-center" style={{ color: accent }}>
                    <CheckIcon />
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserMenu({ accent, radius, open: openProp }: { accent: string; radius: number; open?: boolean }) {
  const reduce = useReducedMotion()
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const [openState, setOpen] = useState(false)
  const open = openProp ?? openState
  const close = () => setOpen(false)
  usePopoverDismiss(openState, root, close)

  useEffect(() => {
    if (openState) items.current[0]?.focus()
  }, [openState])

  const onKey = (e: KeyboardEvent) => {
    const list = items.current.filter(Boolean) as HTMLButtonElement[]
    const i = list.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') list[(i + 1) % list.length]?.focus()
    else if (e.key === 'ArrowUp') list[(i - 1 + list.length) % list.length]?.focus()
    else if (e.key === 'Escape') {
      setOpen(false)
      trigger.current?.focus()
    } else if (e.key === 'Tab') setOpen(false)
    else return
    if (e.key !== 'Tab') e.preventDefault()
  }

  let n = 0
  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((o) => !o)}
        className="flex rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          className="flex size-8 items-center justify-center rounded-full text-xs font-medium"
          style={{ background: accent, color: inkFor(accent) }}
        >
          KK
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            role="menu"
            aria-label="Account"
            onKeyDown={onKey}
            {...(reduce ? {} : popIn)}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-full z-50 mt-1 w-56 max-w-64 origin-top-right border bg-popover p-1 text-popover-foreground shadow-lg"
            style={{ borderRadius: radius }}
          >
            <div className="flex min-w-0 flex-col px-2 py-1.5">
              <span className="truncate text-sm font-medium text-foreground">Keith Kennedy</span>
              <span className="truncate text-xs font-normal text-muted-foreground">k.kennedy@example.com</span>
            </div>
            {MENU_GROUPS.map((group, g) => (
              <div key={g} role="group">
                <div role="separator" className="-mx-1 my-1 h-px bg-border" />
                {group.map((item) => {
                  const idx = n++
                  return (
                    <button
                      key={item.label}
                      ref={(el) => {
                        items.current[idx] = el
                      }}
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={close}
                      className="flex w-full cursor-default items-center gap-2 px-2 py-1.5 text-start text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                      style={{ borderRadius: Math.max(0, radius - 4) }}
                    >
                      <Icon className="opacity-60">{MENU_ICONS[item.icon]}</Icon>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function NavbarAiChat({ className, style, selectOpen, activeIndex, menuOpen, onModelChange, ...props }: NavbarAiChatProps) {
  const o = { ...defaults, ...props }
  const [value, setValue] = useState(o.model)
  useEffect(() => setValue(o.model), [o.model])

  return (
    <header className={cn('border-b px-4 md:px-6', className)} style={style}>
      <div className="flex items-center justify-between gap-4" style={{ height: o.height }}>
        {/* Left side */}
        <div className="min-w-0">
          <ModelSelect
            value={value}
            onChange={(v) => {
              setValue(v)
              onModelChange?.(v)
            }}
            showDescriptions={o.showDescriptions}
            radius={o.radius}
            accent={o.accent}
            open={selectOpen}
            activeIndex={activeIndex}
          />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center justify-end gap-2">
          {o.showTemporaryChat && (
            <button
              type="button"
              aria-label="Temporary chat"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <DashedChatIcon />
            </button>
          )}
          <UserMenu accent={o.accent} radius={o.radius} open={menuOpen} />
        </div>
      </div>
    </header>
  )
}
