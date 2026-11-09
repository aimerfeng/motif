// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-581.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brandName: 'Kestrel',
  layout: 'inline',
  showSearch: true,
  showLanguage: true,
  showNotifications: true,
  activeStyle: 'underline',
  height: 64,
  accent: '#8b5cf6',
}
/* @motif:end */

export type MenuId = 'mobile' | 'language' | 'info' | 'notifications' | 'user'

export type NavbarAppHeaderProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前打开的菜单 */
  openMenu?: MenuId | null
  /** 受控：当前页（导航链接序号） */
  active?: number
  /** 受控：通知是否已全部标为已读 */
  allRead?: boolean
  /** 主题切换按钮的初始状态 */
  defaultTheme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
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

const HouseIcon = (
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </>
)
const LayersIcon = (
  <>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </>
)
const FileTextIcon = (
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </>
)
const UsersIcon = (
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
)

// Navigation links array to be used in both desktop and mobile menus
export const navigationLinks = [
  { href: '#', icon: HouseIcon, label: 'Dashboard' },
  { href: '#', icon: LayersIcon, label: 'Projects' },
  { href: '#', icon: FileTextIcon, label: 'Docs' },
  { href: '#', icon: UsersIcon, label: 'Team' },
]

// Language options
const languages = [
  { label: 'En', value: 'en' },
  { label: 'Es', value: 'es' },
  { label: 'Fr', value: 'fr' },
  { label: 'De', value: 'de' },
  { label: 'Ja', value: 'ja' },
]

const initialNotifications = [
  { action: 'requested review on', id: 1, target: 'PR #42: Feature implementation', timestamp: '15 minutes ago', unread: true, user: 'Chris Tompson' },
  { action: 'shared', id: 2, target: 'New component library', timestamp: '45 minutes ago', unread: true, user: 'Emma Davis' },
  { action: 'assigned you to', id: 3, target: 'API integration task', timestamp: '4 hours ago', unread: false, user: 'James Wilson' },
  { action: 'replied to your comment in', id: 4, target: 'Authentication flow', timestamp: '12 hours ago', unread: false, user: 'Alex Morgan' },
  { action: 'commented on', id: 5, target: 'Dashboard redesign', timestamp: '2 days ago', unread: false, user: 'Sarah Chen' },
  { action: 'mentioned you in', id: 6, target: 'Launch page open graph image', timestamp: '2 weeks ago', unread: false, user: 'Miky Derya' },
]

/** 虚构品牌标志 */
function Logo() {
  return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 32 32" fill="currentColor" className="shrink-0">
      <path d="M16 3a13 13 0 1 0 13 13h-6a7 7 0 1 1-7-7z" />
      <circle cx="24.5" cy="7.5" r="4.5" />
    </svg>
  )
}

function Dot({ className, color }: { className?: string; color: string }) {
  return (
    <svg aria-hidden="true" className={className} fill={color} height="6" viewBox="0 0 6 6" width="6">
      <circle cx="3" cy="3" r="3" />
    </svg>
  )
}

const FOCUSABLE = '[role=menuitem],[role=option]'

/** 菜单内的方向键导航（Radix DropdownMenu / Select 的键盘行为的最小替代） */
function onRovingKeyDown(e: KeyboardEvent<HTMLElement>) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (!items.length) return
  e.preventDefault()
  const i = items.indexOf(document.activeElement as HTMLElement)
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
  items[next]?.focus()
}

function Popup({
  open,
  id,
  label,
  align = 'start',
  className,
  children,
}: {
  open: boolean
  id: string
  label: string
  align?: 'start' | 'end'
  className?: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    // 只在用户真的点开时移焦；自动播放时焦点不在触发按钮上，不抢焦点
    const trigger = document.activeElement
    if (trigger instanceof HTMLElement && trigger.getAttribute('aria-controls') === id) {
      const target = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? ref.current?.querySelector<HTMLElement>(`${FOCUSABLE},input,button`)
      target?.focus({ preventScroll: true })
    }
  }, [open, id])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id={id}
          role="dialog"
          aria-label={label}
          onKeyDown={onRovingKeyDown}
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'absolute top-full z-50 mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
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

function SearchField({ className, kbd }: { className?: string; kbd?: boolean }) {
  const id = useId()
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        placeholder="Search..."
        className={cn(
          'peer flex h-8 w-full min-w-0 rounded-md border border-input bg-transparent py-1 ps-8 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground/70',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
          kbd ? 'pe-10' : 'pe-2',
        )}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80">
        <Icon>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </Icon>
      </div>
      {kbd && (
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
          <kbd className="inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">⌘K</kbd>
        </div>
      )}
    </div>
  )
}

const iconButton =
  'relative flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-accent aria-expanded:text-foreground'
const menuItem =
  'relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-start text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
const Separator = () => <div role="separator" aria-orientation="horizontal" className="-mx-1 my-1 h-px bg-border" />

export function NavbarAppHeader({ className, style, openMenu, active, allRead, defaultTheme = 'light', onThemeChange, ...props }: NavbarAppHeaderProps) {
  const o = { ...defaults, ...props }
  const id = useId()
  const reduce = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const [openState, setOpenState] = useState<MenuId | null>(null)
  const [activeState, setActive] = useState(0)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [theme, setTheme] = useState(defaultTheme)
  const [language, setLanguage] = useState('en')

  const open = openMenu !== undefined ? openMenu : openState
  const current = active ?? activeState
  const list = allRead === undefined ? notifications : initialNotifications.map((n) => (allRead ? { ...n, unread: false } : n))
  const unreadCount = list.filter((n) => n.unread).length
  const ink = inkFor(o.accent)
  const layout = o.layout
  const pid = (m: MenuId) => `${id}-${m}`

  const setOpen = (m: MenuId | null) => setOpenState(m)
  const toggle = (m: MenuId) => setOpenState(open === m ? null : m)

  useEffect(() => {
    if (!openState) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpenState(null)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      root.current?.querySelector<HTMLElement>(`[aria-controls="${id}-${openState}"]`)?.focus()
      setOpenState(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openState, id])

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, unread: false })))
  }
  const handleNotificationClick = (nid: number) => {
    setNotifications(notifications.map((notification) => (notification.id === nid ? { ...notification, unread: false } : notification)))
  }

  const underline = o.activeStyle === 'underline'
  const indicator = { type: 'spring', visualDuration: reduce ? 0 : 0.3, bounce: 0.15 } as const

  const navList = (where: 'bar' | 'bottom', withIcons: boolean) => (
    <nav aria-label="Main" className={cn('h-full', where === 'bar' && 'max-md:hidden')}>
      <ul className="flex h-full items-center gap-2">
        {navigationLinks.map((link, i) => {
          const isActive = i === current
          return (
            <li key={link.label} className={cn('relative', underline && 'h-full')}>
              <a
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? '' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  setActive(i)
                }}
                className={cn(
                  'relative flex items-center gap-2 rounded-sm px-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:text-foreground',
                  underline ? 'h-full' : 'py-1.5',
                )}
              >
                {isActive && underline && (
                  <motion.span
                    layoutId={`${id}-${where}-active`}
                    transition={indicator}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                    style={{ background: o.accent }}
                  />
                )}
                {isActive && o.activeStyle === 'pill' && (
                  <motion.span layoutId={`${id}-${where}-active`} transition={indicator} aria-hidden="true" className="absolute inset-0 rounded-sm bg-accent" />
                )}
                {withIcons && (
                  <Icon size={16} className="relative text-muted-foreground/80">
                    {link.icon}
                  </Icon>
                )}
                <span className="relative">{link.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <header
      ref={root}
      className={cn('relative border-b bg-background px-4 text-foreground md:px-6', className)}
      style={style}
      onBlur={(e) => {
        if (openState && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpenState(null)
      }}
    >
      <div className="flex items-center justify-between gap-4" style={{ height: o.height }}>
        {/* Left side */}
        <div className={cn('flex h-full items-center gap-2', layout !== 'inline' && 'flex-1')}>
          {/* Mobile menu trigger */}
          <div className="relative md:hidden">
            <button
              type="button"
              aria-label="Menu"
              aria-haspopup="true"
              aria-expanded={open === 'mobile'}
              aria-controls={pid('mobile')}
              onClick={() => toggle('mobile')}
              className="group flex size-8 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <svg className="pointer-events-none" fill="none" height={16} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={16} aria-hidden="true">
                <path
                  className="origin-center -translate-y-[7px] transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315 motion-reduce:transition-none"
                  d="M4 12L20 12"
                />
                <path className="origin-center transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45 motion-reduce:transition-none" d="M4 12H20" />
                <path
                  className="origin-center translate-y-[7px] transition-transform duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135 motion-reduce:transition-none"
                  d="M4 12H20"
                />
              </svg>
            </button>
            <Popup open={open === 'mobile'} id={pid('mobile')} label="Navigation" className={o.showSearch ? 'w-56' : 'w-44'}>
              {o.showSearch && <SearchField className="p-1 pb-2 sm:hidden" />}
              <nav aria-label="Main">
                <ul className="flex flex-col items-start gap-0">
                  {navigationLinks.map((link, i) => (
                    <li className="w-full" key={link.label}>
                      <a
                        href={link.href}
                        aria-current={i === current ? 'page' : undefined}
                        data-active={i === current ? '' : undefined}
                        onClick={(e) => {
                          e.preventDefault()
                          setActive(i)
                          setOpen(null)
                        }}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent data-[active]:bg-accent data-[active]:text-accent-foreground"
                      >
                        <Icon className="text-muted-foreground">{link.icon}</Icon>
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Popup>
          </div>
          {/* Main nav */}
          <div className="flex h-full items-center gap-6">
            <a
              href="#"
              aria-label={`${o.brandName} home`}
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-md text-foreground outline-none hover:text-foreground/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Logo />
              <span className="truncate text-sm font-semibold max-sm:sr-only">{o.brandName}</span>
            </a>
            {/* Navigation menu */}
            {layout === 'inline' && navList('bar', false)}
          </div>
        </div>
        {/* Middle area */}
        {layout === 'centered' && navList('bar', true)}
        {layout === 'stacked' && o.showSearch && (
          <div className="grow max-sm:hidden">
            <SearchField className="mx-auto w-full max-w-xs" kbd />
          </div>
        )}
        {/* Right side */}
        <div className={cn('flex items-center justify-end gap-4', layout !== 'inline' && 'flex-1')}>
          {o.showSearch && layout !== 'stacked' && <SearchField className="w-44 max-lg:hidden xl:w-56" />}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              data-state={theme === 'dark' ? 'on' : 'off'}
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark'
                setTheme(next)
                onThemeChange?.(next)
              }}
              className={cn('group', iconButton)}
            >
              <Icon className="scale-0 opacity-0 transition-[scale,opacity] group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 motion-reduce:transition-none">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </Icon>
              <Icon className="absolute scale-100 opacity-100 transition-[scale,opacity] group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0 motion-reduce:transition-none">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </Icon>
            </button>
            {/* Language selector */}
            {o.showLanguage && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Select language"
                  aria-haspopup="listbox"
                  aria-expanded={open === 'language'}
                  aria-controls={pid('language')}
                  onClick={() => toggle('language')}
                  className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-accent"
                >
                  <Icon className="text-muted-foreground/80">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </Icon>
                  <span className="hidden sm:inline-flex">{languages.find((l) => l.value === language)?.label}</span>
                  <Icon className="text-muted-foreground/80">
                    <path d="m6 9 6 6 6-6" />
                  </Icon>
                </button>
                <Popup open={open === 'language'} id={pid('language')} label="Language" align="end" className="min-w-32">
                  <div role="listbox" aria-label="Language">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        role="option"
                        aria-selected={lang.value === language}
                        onClick={() => {
                          setLanguage(lang.value)
                          setOpen(null)
                        }}
                        className={cn(menuItem, 'ps-2 pe-8')}
                      >
                        <span className="truncate">{lang.label}</span>
                        {lang.value === language && (
                          <span className="absolute end-2 flex items-center">
                            <Icon>
                              <path d="M20 6 9 17l-5-5" />
                            </Icon>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </Popup>
              </div>
            )}
            {/* Info menu */}
            <div className="relative max-sm:hidden">
              <button
                type="button"
                aria-label="Open help menu"
                aria-haspopup="menu"
                aria-expanded={open === 'info'}
                aria-controls={pid('info')}
                onClick={() => toggle('info')}
                className={iconButton}
              >
                <Icon>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </Icon>
              </button>
              <Popup open={open === 'info'} id={pid('info')} label="Help" align="end" className="min-w-40 pb-2">
                <div className="px-2 py-1.5 text-sm font-medium">Need help?</div>
                <div role="menu" aria-label="Help">
                  {(
                    [
                      [
                        'Documentation',
                        <path key="b" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />,
                      ],
                      [
                        'Support',
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.93 4.93 4.24 4.24" />
                          <path d="m14.83 9.17 4.24-4.24" />
                          <path d="m14.83 14.83 4.24 4.24" />
                          <path d="m9.17 14.83-4.24 4.24" />
                          <circle cx="12" cy="12" r="4" />
                        </>,
                      ],
                      [
                        'Contact us',
                        <>
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          <path d="M8 12h.01" />
                          <path d="M12 12h.01" />
                          <path d="M16 12h.01" />
                        </>,
                      ],
                    ] as const
                  ).map(([label, icon]) => (
                    <a
                      key={label}
                      href="#"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault()
                        setOpen(null)
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm outline-none hover:underline focus:underline"
                    >
                      <Icon className="opacity-60">{icon}</Icon>
                      {label}
                    </a>
                  ))}
                </div>
              </Popup>
            </div>
            {/* Notification */}
            {o.showNotifications && (
              <div className="sm:relative">
                <button
                  type="button"
                  aria-label={unreadCount > 0 ? `Open notifications (${unreadCount} unread)` : 'Open notifications'}
                  aria-haspopup="dialog"
                  aria-expanded={open === 'notifications'}
                  aria-controls={pid('notifications')}
                  onClick={() => toggle('notifications')}
                  className={iconButton}
                >
                  <Icon>
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                  </Icon>
                  {unreadCount > 0 && <div aria-hidden="true" className="absolute top-0.5 right-0.5 size-1.5 rounded-full" style={{ background: o.accent }} />}
                </button>
                <Popup open={open === 'notifications'} id={pid('notifications')} label="Notifications" align="end" className="max-sm:inset-x-4 sm:w-80">
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2">
                    <div className="text-sm font-semibold">Notifications</div>
                    {unreadCount > 0 && (
                      <button type="button" onClick={handleMarkAllAsRead} className="rounded-sm text-xs font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <Separator />
                  {list.map((notification) => (
                    <div key={notification.id} className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent has-[button:focus-visible]:bg-accent">
                      <div className="relative flex items-start pe-3">
                        <div className="flex-1 space-y-1">
                          <button type="button" onClick={() => handleNotificationClick(notification.id)} className="text-left text-foreground/80 outline-none after:absolute after:inset-0">
                            <span className="font-medium text-foreground hover:underline">{notification.user}</span> {notification.action}{' '}
                            <span className="font-medium text-foreground hover:underline">{notification.target}</span>.
                          </button>
                          <div className="text-xs text-muted-foreground">{notification.timestamp}</div>
                        </div>
                        {notification.unread && (
                          <div className="absolute end-0 self-center">
                            <span className="sr-only">Unread</span>
                            <Dot color={o.accent} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Popup>
              </div>
            )}
          </div>
          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={open === 'user'}
              aria-controls={pid('user')}
              onClick={() => toggle('user')}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              style={{ background: o.accent, color: ink }}
            >
              KK
            </button>
            <Popup open={open === 'user'} id={pid('user')} label="Account" align="end" className="w-56 max-w-64">
              <div className="flex min-w-0 flex-col px-2 py-1.5">
                <span className="truncate text-sm font-medium text-foreground">Keith Kennedy</span>
                <span className="truncate text-xs font-normal text-muted-foreground">k.kennedy@example.com</span>
              </div>
              <Separator />
              <div role="menu" aria-label="Account">
                {(
                  [
                    [
                      'Usage',
                      <>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <circle cx="12" cy="12" r="4" />
                      </>,
                    ],
                    [
                      'Workspaces',
                      <>
                        <path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" />
                        <path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" />
                      </>,
                    ],
                    [
                      'Guides',
                      <>
                        <path d="M12 7v14" />
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                      </>,
                    ],
                    null,
                    [
                      'Pinned',
                      <>
                        <path d="M12 17v5" />
                        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                      </>,
                    ],
                    [
                      'Edit profile',
                      <>
                        <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
                        <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                        <circle cx="10" cy="7" r="4" />
                      </>,
                    ],
                    null,
                    [
                      'Logout',
                      <>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5" />
                        <path d="M21 12H9" />
                      </>,
                    ],
                  ] as const
                ).map((entry, i) =>
                  entry ? (
                    <button key={entry[0]} type="button" role="menuitem" onClick={() => setOpen(null)} className={menuItem}>
                      <Icon className="opacity-60">{entry[1]}</Icon>
                      <span>{entry[0]}</span>
                    </button>
                  ) : (
                    <Separator key={`sep-${i}`} />
                  ),
                )}
              </div>
            </Popup>
          </div>
        </div>
      </div>
      {/* Bottom navigation */}
      {layout === 'stacked' && <div className="h-12 border-t max-md:hidden">{navList('bottom', false)}</div>}
    </header>
  )
}
