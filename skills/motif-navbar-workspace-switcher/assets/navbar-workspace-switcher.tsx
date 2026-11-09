// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-589.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brandName: 'Northwind',
  separator: 'slash',
  levels: 2,
  showTabs: true,
  showPlanBadge: true,
  height: 64,
  accent: '#18181b',
}
/* @motif:end */

export type MenuId = 'account' | 'project' | 'settings' | 'user' | 'mobile'

export type NavbarWorkspaceSwitcherProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前打开的菜单 */
  openMenu?: MenuId | null
  /** 受控：切换器搜索框内容 */
  query?: string
  /** 受控：选中的账户序号 */
  account?: number
  /** 受控：选中的项目序号 */
  project?: number
}

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: '#', label: 'Dashboard' },
  { href: '#', label: 'Docs' },
  { href: '#', label: 'API reference' },
]

const accounts = [
  { label: 'Personal', plan: 'Free' },
  { label: 'Team', plan: 'Pro' },
  { label: 'Business', plan: 'Scale' },
]
const projects = [{ label: 'Main project' }, { label: 'Staging project' }, { label: 'Billing service' }, { label: 'Docs site' }]

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

function Icon({ children, size = 16, className }: { children: ReactNode; size?: number; className?: string }) {
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

const ChevronsUpDown = () => (
  <Icon size={14} className="text-muted-foreground/80">
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </Icon>
)
const CheckIcon = () => (
  <Icon size={14}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
const SearchIcon = () => (
  <Icon size={14} className="opacity-60">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
)
const PlusIcon = () => (
  <Icon size={14} className="opacity-60">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
)
const SettingsIcon = () => (
  <Icon className="text-muted-foreground">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)
const LogOutIcon = () => (
  <Icon className="opacity-60">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
)
const BookIcon = () => (
  <Icon className="opacity-60">
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Icon>
)
const BoltIcon = () => (
  <Icon className="opacity-60">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <circle cx="12" cy="12" r="4" />
  </Icon>
)

/** 虚构品牌标志 */
function Logo() {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 32 32" fill="currentColor" className="shrink-0">
      <path d="M6 26V6l10 10V6h4v20L10 16v10z" />
      <circle cx="25" cy="23" r="3" />
    </svg>
  )
}

function Separator({ kind, className }: { kind: string; className?: string }) {
  return (
    <li role="presentation" aria-hidden="true" className={cn('flex items-center text-muted-foreground/60 select-none', className)}>
      {kind === 'chevron' ? (
        <Icon size={14}>
          <path d="m9 18 6-6-6-6" />
        </Icon>
      ) : kind === 'dot' ? (
        <span className="px-0.5">·</span>
      ) : (
        <span className="px-0.5 text-lg font-light">/</span>
      )}
    </li>
  )
}

function Popup({ open, id, className, align = 'start', children, label }: { open: boolean; id: string; className?: string; align?: 'start' | 'end'; children: ReactNode; label: string }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          role="dialog"
          aria-label={label}
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute top-full z-50 mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            align === 'start' ? 'start-0 origin-top-left' : 'end-0 origin-top-right',
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type SwitcherProps = {
  menu: MenuId
  label: string
  items: { label: string; plan?: string }[]
  value: number
  open: boolean
  query: string
  accent: string
  ink: string
  showPlan?: boolean
  createLabel: string
  className?: string
  onOpen: (open: boolean) => void
  onQuery: (q: string) => void
  onSelect: (i: number) => void
}

function Switcher({ menu, label, items, value, open, query, accent, ink, showPlan, createLabel, className, onOpen, onQuery, onSelect }: SwitcherProps) {
  const id = useId()
  const [hl, setHl] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const q = query.trim().toLowerCase()
  const filtered = items.map((it, i) => ({ ...it, i })).filter((it) => it.label.toLowerCase().includes(q))
  const current = items[value] ?? items[0]!
  const highlighted = filtered.length ? Math.min(hl, filtered.length - 1) : -1

  useEffect(() => {
    if (open) {
      setHl(0)
      // 仅在真实交互时聚焦
      if (document.activeElement?.closest('[data-switcher]')) input.current?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <li className={cn('flex items-center sm:relative', className)} data-switcher={menu}>
      <button
        type="button"
        aria-label={`Select ${label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-pop`}
        onClick={() => onOpen(!open)}
        className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md p-1.5 text-sm font-medium text-foreground transition-colors outline-none hover:bg-accent focus-visible:bg-accent aria-expanded:bg-accent"
      >
        <span className="truncate max-sm:max-w-[7.5rem]">{current.label}</span>
        {showPlan && current.plan && (
          <span className="rounded-full px-1.5 py-px text-[10px] leading-4 font-medium max-sm:hidden" style={{ background: accent, color: ink }}>
            {current.plan}
          </span>
        )}
        <ChevronsUpDown />
      </button>
      <Popup open={open} id={`${id}-pop`} label={`Switch ${label}`} className="max-sm:inset-x-4 sm:w-60">
        <div className="flex items-center gap-2 border-b px-2 pb-1">
          <SearchIcon />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={highlighted >= 0 ? `${id}-opt-${filtered[highlighted]!.i}` : undefined}
            aria-label={`Search ${label}`}
            placeholder={`Find ${label}…`}
            value={query}
            onChange={(e) => {
              onQuery(e.target.value)
              setHl(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setHl((h) => Math.min(h + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setHl((h) => Math.max(h - 1, 0))
              } else if (e.key === 'Enter' && highlighted >= 0) {
                e.preventDefault()
                onSelect(filtered[highlighted]!.i)
              } else if (e.key === 'Escape') {
                onOpen(false)
              }
            }}
            className="h-8 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="px-2 pt-2 pb-1 text-xs text-muted-foreground">{label[0]!.toUpperCase() + label.slice(1)}s</div>
        <ul id={`${id}-list`} role="listbox" aria-label={label}>
          {filtered.map((it, k) => (
            <li
              key={it.label}
              id={`${id}-opt-${it.i}`}
              role="option"
              aria-selected={it.i === value}
              data-highlighted={k === highlighted ? '' : undefined}
              onPointerEnter={() => setHl(k)}
              onClick={() => onSelect(it.i)}
              className="relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm select-none data-[highlighted]:bg-accent"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: accent, color: ink }}>
                {it.label.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{it.label}</span>
              {showPlan && it.plan && <span className="ms-auto text-xs text-muted-foreground">{it.plan}</span>}
              {it.i === value && (
                <span className="absolute end-2 flex items-center">
                  <CheckIcon />
                </span>
              )}
            </li>
          ))}
          {filtered.length === 0 && <li className="px-2 py-1.5 text-sm text-muted-foreground">No {label} found.</li>}
        </ul>
        <div className="-mx-1 my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => onOpen(false)}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent"
        >
          <PlusIcon />
          {createLabel}
        </button>
      </Popup>
    </li>
  )
}

function MenuItem({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-start text-sm outline-none hover:bg-accent focus-visible:bg-accent"
    >
      {children}
    </button>
  )
}

export function NavbarWorkspaceSwitcher({ className, style, openMenu, query, account, project, ...props }: NavbarWorkspaceSwitcherProps) {
  const o = { ...defaults, ...props }
  const id = useId()
  const [openState, setOpenState] = useState<MenuId | null>(null)
  const [queryState, setQuery] = useState('')
  const [accountState, setAccount] = useState(0)
  const [projectState, setProject] = useState(0)
  const open = openMenu !== undefined ? openMenu : openState
  const q = query ?? queryState
  const acc = account ?? accountState
  const proj = project ?? projectState
  const root = useRef<HTMLElement>(null)
  const ink = inkFor(o.accent)
  const levels = Math.max(1, Math.min(2, Math.round(o.levels)))

  const setOpen = (m: MenuId | null) => {
    setOpenState(m)
    setQuery('')
  }

  useEffect(() => {
    if (!openState) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpenState(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenState(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openState])

  const toggle = (m: MenuId) => (next: boolean) => setOpen(next ? m : null)

  return (
    <header ref={root} className={cn('relative border-b px-4 md:px-6', className)} style={style}>
      <div className="flex items-center justify-between gap-4" style={{ height: o.height }}>
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile menu trigger */}
          {o.showTabs && (
            <div className="relative md:hidden">
              <button
                type="button"
                aria-label="Menu"
                aria-haspopup="true"
                aria-expanded={open === 'mobile'}
                aria-controls={`${id}-mobile`}
                onClick={() => setOpen(open === 'mobile' ? null : 'mobile')}
                className="group flex size-8 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <svg className="pointer-events-none" fill="none" height={16} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={16} aria-hidden="true">
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
              <Popup open={open === 'mobile'} id={`${id}-mobile`} label="Main" className="w-36">
                <nav aria-label="Main">
                  <ul className="flex flex-col items-start gap-0">
                    {navigationLinks.map((link) => (
                      <li className="w-full" key={link.label}>
                        <a href={link.href} onClick={(e) => e.preventDefault()} className="block rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Popup>
            </div>
          )}
          {/* Breadcrumb */}
          <nav aria-label="Workspace" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              <li className="flex items-center">
                <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-md text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Logo />
                  <span className="text-sm font-semibold max-sm:sr-only">{o.brandName}</span>
                </a>
              </li>
              {levels >= 2 && <Separator kind={o.separator} className="max-[400px]:hidden" />}
              {levels >= 2 && (
                <Switcher
                  menu="account"
                  label="account"
                  items={accounts}
                  value={acc}
                  open={open === 'account'}
                  query={q}
                  accent={o.accent}
                  ink={ink}
                  showPlan={o.showPlanBadge}
                  createLabel="Create team"
                  className="max-[400px]:hidden"
                  onOpen={toggle('account')}
                  onQuery={setQuery}
                  onSelect={(i) => {
                    setAccount(i)
                    setOpen(null)
                  }}
                />
              )}
              <Separator kind={o.separator} />
              <Switcher
                menu="project"
                label="project"
                items={projects}
                value={proj}
                open={open === 'project'}
                query={q}
                accent={o.accent}
                ink={ink}
                showPlan={levels < 2 && o.showPlanBadge}
                createLabel="Create project"
                onOpen={toggle('project')}
                onQuery={setQuery}
                onSelect={(i) => {
                  setProject(i)
                  setOpen(null)
                }}
              />
            </ol>
          </nav>
        </div>
        {/* Right side */}
        <div className="flex shrink-0 items-center gap-4 max-sm:gap-2">
          <div className="flex items-center gap-2">
            {/* Nav menu */}
            {o.showTabs && (
              <nav aria-label="Main" className="max-md:hidden">
                <ul className="flex gap-2">
                  {navigationLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => e.preventDefault()}
                        className="block rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {/* Settings */}
            <div className="relative max-sm:hidden">
              <button
                type="button"
                aria-label="Open edit menu"
                aria-haspopup="menu"
                aria-expanded={open === 'settings'}
                onClick={() => setOpen(open === 'settings' ? null : 'settings')}
                className="flex size-9 items-center justify-center rounded-full outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-accent"
              >
                <SettingsIcon />
              </button>
              <Popup open={open === 'settings'} id={`${id}-settings`} label="Settings" align="end" className="w-44">
                <div role="menu">
                  {['Appearance', 'Preferences', 'API Settings'].map((l) => (
                    <MenuItem key={l} onClick={() => setOpen(null)}>
                      {l}
                    </MenuItem>
                  ))}
                </div>
              </Popup>
            </div>
          </div>
          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={open === 'user'}
              onClick={() => setOpen(open === 'user' ? null : 'user')}
              className="flex size-8 items-center justify-center rounded-full text-xs font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              style={{ background: o.accent, color: ink }}
            >
              KK
            </button>
            <Popup open={open === 'user'} id={`${id}-user`} label="Account" align="end" className="w-56">
              <div className="flex min-w-0 flex-col px-2 py-1.5">
                <span className="truncate text-sm font-medium text-foreground">Kira Kowalski</span>
                <span className="truncate text-xs text-muted-foreground">kira@northwind.example</span>
              </div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div role="menu">
                <MenuItem onClick={() => setOpen(null)}>
                  <BoltIcon />
                  <span>Usage</span>
                </MenuItem>
                <MenuItem onClick={() => setOpen(null)}>
                  <BookIcon />
                  <span>Docs</span>
                </MenuItem>
                <div className="-mx-1 my-1 h-px bg-border" />
                <MenuItem onClick={() => setOpen(null)}>
                  <LogOutIcon />
                  <span>Logout</span>
                </MenuItem>
              </div>
            </Popup>
          </div>
        </div>
      </div>
    </header>
  )
}
