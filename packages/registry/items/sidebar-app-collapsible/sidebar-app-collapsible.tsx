// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/sidebar-07/components/app-sidebar.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type SVGProps,
} from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'sidebar',
  collapsed: false,
  width: 256,
  showProjects: true,
  brandName: 'Halcyon Inc',
  accent: '#6366f1',
  radius: 10,
  spring: {
    visualDuration: 0.25,
    bounce: 0,
  },
}
/* @motif:end */

const SIDEBAR_WIDTH_MOBILE = 288
const SIDEBAR_WIDTH_ICON = 48
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const MOBILE_BREAKPOINT = 768

/* ---------- 图标：手写的内联 SVG，代替 lucide ---------- */

type IconProps = SVGProps<SVGSVGElement>
function Icon({ children, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-4', className)}
      {...props}
    >
      {children}
    </svg>
  )
}
type IconComponent = (props: IconProps) => ReactNode

const TerminalIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m7 10 3 2-3 2M12 15h5" />
  </Icon>
)
const BotIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="4" y="8" width="16" height="12" rx="2" />
    <path d="M12 8V4H8M2 14h2M20 14h2M9 13v2M15 13v2" />
  </Icon>
)
const BookIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Icon>
)
const SlidersIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M20 7h-9M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </Icon>
)
const FrameIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M22 6H2M22 18H2M6 2v20M18 2v20" />
  </Icon>
)
const PieIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M21 12A9 9 0 1 1 12 3v9z" />
    <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
  </Icon>
)
const MapIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" />
  </Icon>
)
const ChevronRightIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)
const ChevronsUpDownIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </Icon>
)
const PlusIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M12 5v14" />
  </Icon>
)
const MoreIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </Icon>
)
const FolderIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
  </Icon>
)
const ForwardIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="m15 17 5-5-5-5M4 18v-2a4 4 0 0 1 4-4h12" />
  </Icon>
)
const TrashIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)
const SparkleIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 3 13.8 9.2 20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8zM19 3v4M21 5h-4" />
  </Icon>
)
const BadgeIcon: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
)
const CardIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Icon>
)
const BellIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  </Icon>
)
const LogOutIcon: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
)
const PanelLeftIcon: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </Icon>
)
/* 虚构团队的标志 */
const MarkRings: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="12" r="5" />
    <circle cx="15" cy="12" r="5" />
  </Icon>
)
const MarkWave: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M2 12h3l2-6 4 12 3-9 2 3h6" />
  </Icon>
)
const MarkOrbit: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M4 12a8 4 0 1 0 16 0 8 4 0 1 0-16 0" />
  </Icon>
)

/* ---------- 示例数据（上游 sample data，换成虚构品牌） ---------- */

export interface NavItem {
  title: string
  url: string
  icon?: IconComponent
  isActive?: boolean
  items?: { title: string; url: string; isActive?: boolean }[]
}

const navMain: NavItem[] = [
  {
    title: 'Playground',
    url: '#',
    icon: TerminalIcon,
    isActive: true,
    items: [
      { title: 'History', url: '#' },
      { title: 'Starred', url: '#' },
      { title: 'Settings', url: '#' },
    ],
  },
  {
    title: 'Models',
    url: '#',
    icon: BotIcon,
    items: [
      { title: 'Genesis', url: '#' },
      { title: 'Explorer', url: '#' },
      { title: 'Quantum', url: '#' },
    ],
  },
  {
    title: 'Documentation',
    url: '#',
    icon: BookIcon,
    items: [
      { title: 'Introduction', url: '#' },
      { title: 'Get Started', url: '#' },
      { title: 'Tutorials', url: '#' },
      { title: 'Changelog', url: '#' },
    ],
  },
  {
    title: 'Settings',
    url: '#',
    icon: SlidersIcon,
    items: [
      { title: 'General', url: '#' },
      { title: 'Team', url: '#' },
      { title: 'Billing', url: '#' },
      { title: 'Limits', url: '#' },
    ],
  },
]

const projects = [
  { name: 'Design Engineering', url: '#', icon: FrameIcon },
  { name: 'Sales & Marketing', url: '#', icon: PieIcon },
  { name: 'Travel', url: '#', icon: MapIcon },
]

const user = { name: 'Mara Lindqvist', email: 'mara@halcyon.test', initials: 'ML' }

/* ---------- 颜色：主色上的文字按亮度取白或近黑 ---------- */

function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!
  const value = Number.parseInt(digits, 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.051 ? '#ffffff' : '#030304'
}

/* ---------- Sidebar 上下文（上游 SidebarProvider；cookie 和 use-mobile 换成本地状态 + ResizeObserver） ---------- */

type SidebarContextValue = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  showTooltip: (text: string, target: HTMLElement) => void
  hideTooltip: () => void
  transition: Transition
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within the AppSidebar.')
  return context
}

/* ---------- 基础件（上游 ui/sidebar.tsx，类名保持不变） ---------- */

const menuButtonBase =
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 motion-reduce:transition-none'
const menuButtonSize = {
  default: 'h-8 text-sm',
  lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
}

type MenuButtonProps = {
  size?: keyof typeof menuButtonSize
  isActive?: boolean
  tooltip?: string
  className?: string
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
  href?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

function SidebarMenuButton({ size = 'default', isActive = false, tooltip, className, children, ref, href, ...props }: MenuButtonProps) {
  const { state, isMobile, showTooltip, hideTooltip } = useSidebar()
  const tip = tooltip && state === 'collapsed' && !isMobile ? tooltip : null
  const shared = {
    'data-sidebar': 'menu-button',
    'data-size': size,
    'data-active': isActive,
    className: cn(menuButtonBase, menuButtonSize[size], className),
    onPointerEnter: tip ? (e: ReactPointerEvent<HTMLElement>) => showTooltip(tip, e.currentTarget) : undefined,
    onPointerLeave: tip ? hideTooltip : undefined,
    onFocus: tip ? (e: ReactFocusEvent<HTMLElement>) => showTooltip(tip, e.currentTarget) : undefined,
    onBlur: tip ? hideTooltip : undefined,
  }
  if (href !== undefined) {
    return (
      <a href={href} aria-label={tip ?? undefined} {...shared}>
        {children}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" aria-label={tip ?? undefined} {...props} {...shared}>
      {children}
    </button>
  )
}

function SidebarGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div
      data-sidebar="group-label"
      className="flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0"
    >
      {children}
    </div>
  )
}

/* ---------- 下拉菜单：代替 Radix DropdownMenu ---------- */

type DropdownProps = {
  trigger: (props: {
    ref: Ref<HTMLButtonElement>
    'aria-haspopup': 'menu'
    'aria-expanded': boolean
    'aria-controls': string
    'data-state': 'open' | 'closed'
    onClick: () => void
    onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void
  }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'start' | 'end'
  label: string
  matchTriggerWidth?: boolean
  className?: string
}

function DropdownMenu({ trigger, children, align = 'start', label, matchTriggerWidth = false, className }: DropdownProps) {
  const { isMobile, transition } = useSidebar()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<CSSProperties>({ left: 0, top: 0, visibility: 'hidden' })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const focusFirst = useRef(true)

  const close = useCallback((restore = true) => {
    setOpen(false)
    if (restore) triggerRef.current?.focus()
  }, [])

  // 打开后按触发器位置放到右侧（手机放到下方），再按菜单实际尺寸夹回视口内
  useLayoutEffect(() => {
    if (!open) return
    const t = triggerRef.current
    const m = menuRef.current
    if (!t || !m) return
    const r = t.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mw = m.offsetWidth
    const mh = m.offsetHeight
    let left: number
    let top: number
    if (isMobile) {
      top = r.bottom + 4
      left = align === 'end' ? r.right - mw : r.left
      if (top + mh > vh - 8) top = r.top - 4 - mh
    } else {
      left = r.right + 4
      top = align === 'end' ? r.bottom - mh : r.top
    }
    left = Math.max(8, Math.min(left, vw - mw - 8))
    top = Math.max(8, Math.min(top, vh - mh - 8))
    setPos({ left, top, width: matchTriggerWidth && isMobile ? Math.max(r.width, 224) : undefined })
    if (focusFirst.current) m.querySelector<HTMLElement>('[role=menuitem]')?.focus()
  }, [open, isMobile, align, matchTriggerWidth])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close(false)
    }
    const onDismiss = () => close(false)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('resize', onDismiss)
    window.addEventListener('scroll', onDismiss, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', onDismiss)
      window.removeEventListener('scroll', onDismiss, true)
    }
  }, [open, close])

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      close(false)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      items[(index + step + items.length) % items.length]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus()
    }
  }

  return (
    <>
      {trigger({
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': id,
        'data-state': open ? 'open' : 'closed',
        onClick: () => {
          focusFirst.current = false
          setPos((p) => ({ ...p, visibility: 'hidden' }))
          setOpen((o) => !o)
        },
        onKeyDown: (e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            focusFirst.current = true
            setPos((p) => ({ ...p, visibility: 'hidden' }))
            setOpen(true)
          }
        },
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ...transition, visualDuration: 0.15 }}
            style={{ position: 'fixed', ...pos }}
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-hidden',
              className,
            )}
          >
            {children(() => close())}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function DropdownMenuItem({ className, children, onSelect }: { className?: string; children: ReactNode; onSelect?: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onSelect}
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator() {
  return <div role="separator" className="-mx-1 my-1 h-px bg-border" />
}

/* ---------- 区块组件（上游 sidebar-07/components） ---------- */

type Team = { name: string; logo: IconComponent; plan: string }

function TeamSwitcher({ teams }: { teams: Team[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeTeam = teams[activeIndex] ?? teams[0]
  if (!activeTeam) return null
  const Logo = activeTeam.logo

  return (
    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
      <li data-sidebar="menu-item" className="group/menu-item relative">
        <DropdownMenu
          label="Teams"
          matchTriggerWidth
          className="min-w-56 rounded-lg"
          trigger={(t) => (
            <SidebarMenuButton
              {...t}
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          )}
        >
          {(close) => (
            <>
              <div className="px-2 py-1.5 text-muted-foreground text-xs">Teams</div>
              {teams.map((team, index) => {
                const TeamLogo = team.logo
                return (
                  <DropdownMenuItem
                    key={team.name}
                    onSelect={() => {
                      setActiveIndex(index)
                      close()
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <TeamLogo className="size-3.5 shrink-0" />
                    </div>
                    {team.name}
                    <span className="ml-auto text-muted-foreground text-xs tracking-widest">⌘{index + 1}</span>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onSelect={close}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <PlusIcon className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add team</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>
      </li>
    </ul>
  )
}

function NavMain({ items }: { items: NavItem[] }) {
  return (
    <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </ul>
    </div>
  )
}

/* 代替 Radix Collapsible：aria-expanded + 高度动画 */
function NavMainItem({ item }: { item: NavItem }) {
  const { transition } = useSidebar()
  const [open, setOpen] = useState(Boolean(item.isActive))
  const contentId = useId()
  const ItemIcon = item.icon
  return (
    <li data-sidebar="menu-item" data-state={open ? 'open' : 'closed'} className="group/collapsible group/menu-item relative">
      <SidebarMenuButton tooltip={item.title} aria-expanded={open} aria-controls={contentId} onClick={() => setOpen((o) => !o)}>
        {ItemIcon && <ItemIcon />}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none" />
      </SidebarMenuButton>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <ul
              data-sidebar="menu-sub"
              className="mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-sidebar-border border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden"
            >
              {item.items?.map((subItem) => (
                <li key={subItem.title} data-sidebar="menu-sub-item" className="group/menu-sub-item relative">
                  <a
                    href={subItem.url}
                    data-sidebar="menu-sub-button"
                    data-active={Boolean(subItem.isActive)}
                    aria-current={subItem.isActive ? 'page' : undefined}
                    className="flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground text-sm ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden [&>span:last-child]:truncate"
                  >
                    <span>{subItem.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function NavProjects({ projects }: { projects: { name: string; url: string; icon: IconComponent }[] }) {
  const { isMobile } = useSidebar()
  return (
    <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
        {projects.map((item) => {
          const ProjectIcon = item.icon
          return (
            <li key={item.name} data-sidebar="menu-item" className="group/menu-item relative">
              <SidebarMenuButton href={item.url}>
                <ProjectIcon />
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu
                label={`${item.name} actions`}
                align={isMobile ? 'end' : 'start'}
                className="w-48 rounded-lg"
                trigger={(t) => (
                  <button
                    {...t}
                    type="button"
                    data-sidebar="menu-action"
                    className={cn(
                      'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                      'group-data-[collapsible=icon]:hidden',
                      'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100',
                      !isMobile && 'opacity-0',
                    )}
                  >
                    <MoreIcon />
                    <span className="sr-only">More</span>
                  </button>
                )}
              >
                {(close) => (
                  <>
                    <DropdownMenuItem onSelect={close}>
                      <FolderIcon className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={close}>
                      <ForwardIcon className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={close}>
                      <TrashIcon className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenu>
            </li>
          )
        })}
        <li data-sidebar="menu-item" className="group/menu-item relative">
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </li>
      </ul>
    </div>
  )
}

function UserAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#f59e0b,#ec4899)] font-semibold text-[#160a10] text-xs"
    >
      {user.initials}
    </span>
  )
}

function NavUser() {
  return (
    <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
      <li data-sidebar="menu-item" className="group/menu-item relative">
        <DropdownMenu
          label="Account"
          align="end"
          matchTriggerWidth
          className="min-w-56 rounded-lg"
          trigger={(t) => (
            <SidebarMenuButton
              {...t}
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          )}
        >
          {(close) => (
            <>
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={close}>
                <SparkleIcon />
                Upgrade to Pro
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={close}>
                <BadgeIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={close}>
                <CardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={close}>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={close}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>
      </li>
    </ul>
  )
}

function SidebarBody({ teams, showProjects }: { teams: Team[]; showProjects: boolean }) {
  return (
    <>
      <div data-sidebar="header" className="flex flex-col gap-2 p-2">
        <TeamSwitcher teams={teams} />
      </div>
      <div
        data-sidebar="content"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"
      >
        <NavMain items={navMain} />
        {showProjects && <NavProjects projects={projects} />}
      </div>
      <div data-sidebar="footer" className="flex flex-col gap-2 p-2">
        <NavUser />
      </div>
    </>
  )
}

/* ---------- 外壳：Provider + Sidebar + SidebarInset + 上游 page.tsx 的页头 ---------- */

export type AppSidebarProps = Omit<Partial<typeof defaults>, 'variant'> & {
  variant?: 'sidebar' | 'floating' | 'inset' | string
  /** 页头面包屑 */
  breadcrumb?: { parent: string; page: string }
  /** 收起状态变化时回调（用户点触发器、侧轨或按 ⌘/Ctrl+B） */
  onCollapsedChange?: (collapsed: boolean) => void
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function AppSidebar({ className, style, children, breadcrumb, onCollapsedChange, ...props }: AppSidebarProps) {
  const options = { ...defaults, ...props }
  const variant = options.variant === 'floating' || options.variant === 'inset' ? options.variant : 'sidebar'
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [open, setOpenState] = useState(!options.collapsed)
  useEffect(() => setOpenState(!options.collapsed), [options.collapsed])
  const [openMobile, setOpenMobile] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [tooltip, setTooltip] = useState<{ text: string; left: number; top: number } | null>(null)

  // 上游用 use-mobile 读视口宽度；这里量容器宽度，预览里切换设备宽度也能跟上
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setIsMobile(entry.contentRect.width < MOBILE_BREAKPOINT)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onChangeRef = useRef(onCollapsedChange)
  onChangeRef.current = onCollapsedChange
  const setOpen = useCallback((value: boolean) => {
    setOpenState(value)
    onChangeRef.current?.(!value)
  }, [])

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((o) => !o)
    else setOpen(!open)
  }, [isMobile, open, setOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'
  useEffect(() => {
    if (state === 'expanded') setTooltip(null)
  }, [state])

  const transition = useMemo<Transition>(
    () => (reduced ? { duration: 0 } : { type: 'spring', visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }),
    [reduced, options.spring.visualDuration, options.spring.bounce],
  )

  const context = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      showTooltip: (text, target) => {
        const r = target.getBoundingClientRect()
        setTooltip({ text, left: r.right + 8, top: r.top + r.height / 2 })
      },
      hideTooltip: () => setTooltip(null),
      transition,
    }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar, transition],
  )

  const teams: Team[] = [
    { name: options.brandName || 'Halcyon Inc', logo: MarkRings, plan: 'Enterprise' },
    { name: 'Fieldnote Co.', logo: MarkWave, plan: 'Startup' },
    { name: 'Orbit Works', logo: MarkOrbit, plan: 'Free' },
  ]

  const padded = variant === 'floating' || variant === 'inset'
  const sidebarWidth = open ? options.width : padded ? SIDEBAR_WIDTH_ICON + 16 + 2 : SIDEBAR_WIDTH_ICON
  const crumbs = breadcrumb ?? { parent: 'Build Your Application', page: 'Data Fetching' }

  // Escape 关闭手机抽屉
  useEffect(() => {
    if (!openMobile) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMobile(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openMobile])
  useEffect(() => {
    if (!isMobile) setOpenMobile(false)
  }, [isMobile])

  return (
    <SidebarContext.Provider value={context}>
      <div
        ref={wrapperRef}
        data-slot="sidebar-wrapper"
        className={cn(
          'group/sidebar-wrapper flex min-h-full w-full text-foreground',
          variant === 'inset' && !isMobile ? 'bg-sidebar' : 'bg-background',
          className,
        )}
        style={cssVars(
          {
            '--radius': `${options.radius}px`,
            '--sidebar-width': `${options.width}px`,
            '--sidebar-width-icon': `${SIDEBAR_WIDTH_ICON}px`,
            '--sidebar-primary': options.accent,
            '--sidebar-primary-foreground': inkOn(options.accent),
          },
          style,
        )}
      >
        {!isMobile && (
          <div
            className="group peer text-sidebar-foreground"
            data-state={state}
            data-collapsible={state === 'collapsed' ? 'icon' : ''}
            data-variant={variant}
            data-side="left"
          >
            <motion.div
              initial={false}
              animate={{ width: sidebarWidth }}
              transition={transition}
              className={cn(
                'sticky top-0 z-10 flex h-svh shrink-0',
                padded ? 'p-2' : 'border-r',
              )}
            >
              <div
                data-sidebar="sidebar"
                className="flex h-full w-full flex-col overflow-hidden bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
              >
                <SidebarBody teams={teams} showProjects={options.showProjects} />
              </div>
              <button
                type="button"
                data-sidebar="rail"
                aria-label="Toggle Sidebar"
                tabIndex={-1}
                onClick={toggleSidebar}
                title="Toggle Sidebar"
                className={cn(
                  'absolute inset-y-0 z-20 flex w-4 -translate-x-1/2 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4',
                  'in-data-[side=left]:cursor-w-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize',
                )}
              />
            </motion.div>
          </div>
        )}

        <main
          className={cn(
            'relative flex w-full min-w-0 flex-1 flex-col bg-background',
            variant === 'inset' && !isMobile && 'm-2 ml-0 rounded-xl shadow-sm',
            variant === 'inset' && !isMobile && state === 'collapsed' && 'ml-2',
          )}
        >
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 motion-reduce:transition-none">
            <div className="flex min-w-0 items-center gap-2 px-4">
              <button
                type="button"
                data-sidebar="trigger"
                aria-expanded={isMobile ? openMobile : open}
                onClick={toggleSidebar}
                className="-ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md outline-hidden ring-ring transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
              >
                <PanelLeftIcon />
                <span className="sr-only">Toggle Sidebar</span>
              </button>
              <div role="separator" aria-orientation="vertical" className="mr-2 h-4 w-px shrink-0 bg-border" />
              <nav aria-label="breadcrumb" className="min-w-0">
                <ol className="flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5">
                  {!isMobile && (
                    <>
                      <li className="inline-flex items-center gap-1.5">
                        <a href="#" className="transition-colors hover:text-foreground">
                          {crumbs.parent}
                        </a>
                      </li>
                      <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
                        <ChevronRightIcon />
                      </li>
                    </>
                  )}
                  <li className="inline-flex items-center gap-1.5">
                    <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground">
                      {crumbs.page}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </main>

        {/* 手机：上游的 Sheet，这里是一个从左侧滑入的对话框 */}
        <AnimatePresence>
          {isMobile && openMobile && (
            <>
              <motion.div
                key="overlay"
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                onClick={() => setOpenMobile(false)}
              />
              <motion.div
                key="sheet"
                role="dialog"
                aria-modal="true"
                aria-label="Sidebar"
                data-sidebar="sidebar"
                data-mobile="true"
                className="fixed inset-y-0 left-0 z-50 flex max-w-[85vw] flex-col border-r bg-sidebar text-sidebar-foreground shadow-lg"
                style={{ width: SIDEBAR_WIDTH_MOBILE }}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={transition}
              >
                <SidebarBody teams={teams} showProjects={options.showProjects} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {tooltip && (
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-background text-xs"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </SidebarContext.Provider>
  )
}
