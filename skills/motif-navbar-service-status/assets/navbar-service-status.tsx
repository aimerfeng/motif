// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-596.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  tabs: 'Overview, Graphs, Backups',
  uptime: '99.9%',
  latency: '45ms',
  showPower: true,
  onlineColor: '#10b981',
  pillStyle: 'outline',
  height: 64,
  accent: '#18181b',
}
/* @motif:end */

export type NavbarServiceStatusProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：电源开关 */
  powered?: boolean
  /** 受控：当前激活的标签序号 */
  activeTab?: number
  /** 受控：移动端菜单是否打开 */
  menuOpen?: boolean
  onPowerChange?: (on: boolean) => void
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

function Icon({ children, size = 12, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('shrink-0', className)}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  )
}

const ZapIcon = () => (
  <Icon className="-ms-0.5 opacity-60">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </Icon>
)
const ClockIcon = () => (
  <Icon className="-ms-0.5 opacity-60">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
)
const PowerIcon = () => (
  <Icon>
    <path d="M12 2v10" />
    <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
  </Icon>
)
const PowerOffIcon = () => (
  <Icon>
    <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
    <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
    <path d="M12 2v4" />
    <path d="m2 2 20 20" />
  </Icon>
)

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

function Badge({ children, pillStyle, className }: { children: ReactNode; pillStyle: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-medium whitespace-nowrap text-foreground',
        pillStyle === 'soft' ? 'border-transparent bg-muted' : 'border-border',
        pillStyle === 'pill' && 'rounded-full',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function NavbarServiceStatus({ className, style, powered, activeTab, menuOpen, onPowerChange, ...props }: NavbarServiceStatusProps) {
  const o = { ...defaults, ...props }
  const id = useId()
  const reduce = useReducedMotion()
  const links = o.tabs
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
  const [checkedState, setChecked] = useState<boolean>(true)
  const [activeState, setActive] = useState(0)
  const [openState, setOpen] = useState(false)
  const checked = powered ?? checkedState
  const active = activeTab ?? activeState
  const open = menuOpen ?? openState
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openState) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [openState])

  const accentInk = inkFor(o.accent)
  const toggle = () => {
    setChecked(!checked)
    onPowerChange?.(!checked)
  }

  return (
    <header className={cn('border-b px-4 md:px-6', className)} style={{ ...style, ['--nav-accent' as string]: o.accent }}>
      <div className="flex justify-between gap-4" style={{ height: o.height }}>
        {/* Left side */}
        <div className="flex gap-2">
          <div ref={root} className="relative flex items-center md:hidden">
            {/* Mobile menu trigger */}
            <button
              type="button"
              aria-label="Menu"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={`${id}-menu`}
              onClick={() => setOpen(!open)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
              }}
              className="group flex size-8 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <svg
                className="pointer-events-none"
                fill="none"
                height={16}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width={16}
                aria-hidden="true"
              >
                <path
                  className="origin-center -translate-y-[7px] transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                  d="M4 12L20 12"
                />
                <path className="origin-center transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" d="M4 12H20" />
                <path
                  className="origin-center translate-y-[7px] transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                  d="M4 12H20"
                />
              </svg>
            </button>
            <AnimatePresence>
              {open && (
                <motion.nav
                  id={`${id}-menu`}
                  aria-label="Main"
                  initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute start-0 top-full z-50 mt-1 w-36 origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                >
                  <ul className="flex flex-col items-start gap-0">
                    {links.map((label, i) => (
                      <li className="w-full" key={label}>
                        <a
                          href="#"
                          aria-current={i === active ? 'page' : undefined}
                          onClick={(e) => {
                            e.preventDefault()
                            setActive(i)
                            setOpen(false)
                          }}
                          className={cn('block rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent', i === active && 'font-medium')}
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <nav aria-label="Main" className="h-full max-md:hidden">
              <ul className="flex h-full gap-2">
                {links.map((label, i) => (
                  <li className="h-full" key={label}>
                    <a
                      href="#"
                      aria-current={i === active ? 'page' : undefined}
                      data-active={i === active ? '' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        setActive(i)
                      }}
                      className="flex h-full items-center justify-center rounded-none border-y-2 border-transparent px-2 py-1.5 text-sm font-medium text-muted-foreground transition-[color,border-color] outline-none hover:border-b-[var(--nav-accent)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:border-b-[var(--nav-accent)] data-[active]:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        {/* Right side */}
        <div className="flex min-w-0 items-center gap-4 max-sm:gap-2">
          <div className={cn('flex min-w-0 items-center gap-2 transition-opacity duration-300', !checked && 'opacity-50')} aria-live="polite">
            <Badge pillStyle={o.pillStyle}>
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full transition-colors duration-300"
                style={{ background: checked ? o.onlineColor : 'var(--muted-foreground)' }}
              />
              {checked ? 'Online' : 'Offline'}
            </Badge>
            <Badge pillStyle={o.pillStyle} className="max-[400px]:hidden">
              <ZapIcon />
              {o.uptime}
            </Badge>
            <Badge pillStyle={o.pillStyle} className="max-[520px]:hidden">
              <ClockIcon />
              {o.latency}
            </Badge>
          </div>
          {/* Switch */}
          {o.showPower && (
            <div className="shrink-0">
              <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
                <button
                  type="button"
                  role="switch"
                  id={id}
                  aria-checked={checked}
                  aria-label="Power"
                  data-state={checked ? 'checked' : 'unchecked'}
                  onClick={toggle}
                  className="peer absolute inset-0 inline-flex h-[inherit] w-auto cursor-pointer items-center rounded-full p-0.5 transition-[background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=unchecked]:bg-input/50"
                  style={checked ? { background: o.accent } : undefined}
                >
                  <span
                    className={cn(
                      'pointer-events-none z-10 block h-full w-1/2 rounded-full bg-background shadow-xs transition-transform duration-300',
                      EASE,
                      checked && 'translate-x-full rtl:-translate-x-full',
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'pointer-events-none relative ms-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300',
                    EASE,
                    'peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full',
                  )}
                >
                  <PowerOffIcon />
                </span>
                <span
                  className={cn(
                    'pointer-events-none relative me-0.5 flex w-6 items-center justify-center text-center transition-transform duration-300',
                    EASE,
                    'peer-data-[state=unchecked]:invisible peer-data-[state=checked]:-translate-x-full peer-data-[state=checked]:rtl:translate-x-full',
                  )}
                  style={{ color: checked ? accentInk : undefined }}
                >
                  <PowerIcon />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
