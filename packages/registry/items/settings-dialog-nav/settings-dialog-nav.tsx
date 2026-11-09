// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/sidebar-13/components/settings-dialog.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  width: 800,
  radius: 10,
  navStyle: 'muted',
  panelTransition: 'slide',
  dim: 0.5,
  spring: {
    visualDuration: 0.35,
    bounce: 0.1,
  },
}
/* @motif:end */

export type SettingsDialogProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 初始是否打开（上游默认打开）。 */
  defaultOpen?: boolean
  /** 受控的当前分区名。 */
  section?: string
  onSectionChange?: (name: string) => void
}

/* lucide 图标的内联版本（24 网格，stroke）。 */
const ICONS: Record<string, string> = {
  bell: 'M10.27 21a2 2 0 0 0 3.46 0M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33',
  menu: 'M4 12h16M4 6h16M4 18h16',
  home: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  brush: 'M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3ZM9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7M14.5 17.5 4.5 15',
  message: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20',
  keyboard: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM10 8h.01M12 12h.01M14 8h.01M16 12h.01M18 8h.01M6 8h.01M7 16h10M8 12h.01',
  check: 'M20 6 9 17l-5-5',
  video: 'm16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2ZM7 11V7a5 5 0 0 1 10 0v4',
  settings:
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  x: 'M18 6 6 18M6 6l12 12',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
}

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('size-4 shrink-0', className)}>
      <path d={ICONS[name]} />
    </svg>
  )
}

type Row = { label: string; description: string; on: boolean }

const data: { nav: { name: string; icon: string; rows: Row[] }[] } = {
  nav: [
    {
      name: 'Notifications',
      icon: 'bell',
      rows: [
        { label: 'Mentions', description: 'Notify me when someone @mentions me.', on: true },
        { label: 'Direct messages', description: 'Show a badge and play a sound.', on: true },
        { label: 'Weekly digest', description: 'A Monday summary of unread threads.', on: false },
      ],
    },
    {
      name: 'Navigation',
      icon: 'menu',
      rows: [
        { label: 'Collapse sidebar on small screens', description: 'Hide the sidebar below 1024px.', on: true },
        { label: 'Show recent pages', description: 'Pin the last five pages you opened.', on: false },
      ],
    },
    {
      name: 'Home',
      icon: 'home',
      rows: [
        { label: 'Open last workspace', description: 'Skip the picker when you sign in.', on: true },
        { label: 'Show getting-started card', description: 'Keep the onboarding checklist on Home.', on: false },
      ],
    },
    {
      name: 'Appearance',
      icon: 'brush',
      rows: [
        { label: 'Follow system theme', description: 'Switch between light and dark automatically.', on: true },
        { label: 'Compact density', description: 'Tighter rows in lists and tables.', on: false },
        { label: 'Show avatars in lists', description: 'Display member photos next to names.', on: true },
      ],
    },
    {
      name: 'Messages & media',
      icon: 'message',
      rows: [
        { label: 'Show link previews', description: 'Expand links into a title and summary.', on: true },
        { label: 'Autoplay GIFs', description: 'Play animated images when they scroll into view.', on: false },
        { label: 'Inline images', description: 'Show uploads larger than 2 MB inline.', on: true },
        { label: 'Convert emoticons', description: 'Turn :) into an emoji as you type.', on: true },
      ],
    },
    {
      name: 'Language & region',
      icon: 'globe',
      rows: [
        { label: 'Use 24-hour time', description: 'Shown as 14:30 instead of 2:30 PM.', on: false },
        { label: 'Spellcheck', description: 'Underline misspelled words while typing.', on: true },
      ],
    },
    {
      name: 'Accessibility',
      icon: 'keyboard',
      rows: [
        { label: 'Keyboard shortcuts', description: 'Press ? to see the full list.', on: true },
        { label: 'Reduce motion', description: 'Minimise animations across the app.', on: false },
        { label: 'Underline links', description: 'Make links easier to tell apart.', on: false },
      ],
    },
    {
      name: 'Mark as read',
      icon: 'check',
      rows: [
        { label: 'Mark as read when opened', description: 'Clear the unread dot as soon as you view a thread.', on: true },
        { label: 'Confirm mark all as read', description: 'Ask before clearing every channel.', on: true },
      ],
    },
    {
      name: 'Audio & video',
      icon: 'video',
      rows: [
        { label: 'Noise suppression', description: 'Filter background noise in calls.', on: true },
        { label: 'Join calls muted', description: 'Start every call with the mic off.', on: false },
        { label: 'Mirror my video', description: 'Flip your own preview horizontally.', on: true },
      ],
    },
    {
      name: 'Connected accounts',
      icon: 'link',
      rows: [
        { label: 'Calendar sync', description: 'Set your status from upcoming events.', on: true },
        { label: 'Code host', description: 'Unfurl pull requests and issues.', on: false },
      ],
    },
    {
      name: 'Privacy & visibility',
      icon: 'lock',
      rows: [
        { label: 'Show when I am online', description: 'Others see a green dot on your avatar.', on: true },
        { label: 'Read receipts', description: 'Let people know you have seen their message.', on: false },
        { label: 'Discoverable by email', description: 'Teammates can find you by address.', on: true },
      ],
    },
    {
      name: 'Advanced',
      icon: 'settings',
      rows: [
        { label: 'Developer mode', description: 'Show IDs in context menus.', on: false },
        { label: 'Hardware acceleration', description: 'Use the GPU when available.', on: true },
      ],
    },
  ],
}

/** 按主色亮度选文字颜色，保证任何主色上都可读。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  return l > 0.18 ? '#0b0b0f' : '#ffffff'
}

function Switch({ defaultChecked, label }: { defaultChecked: boolean; label: string }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => setChecked((c) => !c)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-[background-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-[var(--sd-accent)]' : 'bg-input dark:bg-input/80',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block size-4 rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-4 bg-[var(--sd-ink)]' : 'translate-x-0.5 bg-background dark:bg-foreground',
        )}
      />
    </button>
  )
}

export function SettingsDialog({ className, style, defaultOpen = true, section, onSectionChange, ...props }: SettingsDialogProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(defaultOpen)
  const [innerActive, setInnerActive] = useState('Messages & media')
  const active = section ?? innerActive
  const index = Math.max(0, data.nav.findIndex((n) => n.name === active))
  const current = data.nav[index]
  // 记住上一个分区的序号，用来决定面板往哪边滑。
  const prevIndex = useRef(index)
  const direction = index >= prevIndex.current ? 1 : -1
  useEffect(() => {
    prevIndex.current = index
  }, [index])
  // 手机上的两级返回栈：'nav' 是列表页，'pane' 是某个分区。
  const [mobileView, setMobileView] = useState<'nav' | 'pane'>('nav')
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)
  const titleId = useId()
  const descId = useId()

  const select = (name: string) => {
    setInnerActive(name)
    onSectionChange?.(name)
    setMobileView('pane')
  }

  // 打开时把焦点移进弹窗，关闭时还给触发按钮。
  useEffect(() => {
    if (open) {
      dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
    } else if (wasOpen.current) {
      triggerRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      return
    }
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const spring = { type: 'spring' as const, ...options.spring }
  const mode = reduced ? 'none' : options.panelTransition
  const offset = mode === 'slide' ? 24 : 0
  const ink = inkFor(options.accent)

  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      style={{ '--sd-accent': options.accent, '--sd-ink': ink, ...style } as CSSProperties}
    >
      <div inert={open}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex h-8 items-center rounded-md bg-[var(--sd-accent)] px-3 text-sm font-medium text-[var(--sd-ink)] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open Dialog
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: options.dim }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            key="content"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={onKeyDown}
            initial={reduced ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduced ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            transition={reduced ? { duration: 0 } : spring}
            className="fixed top-1/2 left-1/2 z-50 w-full overflow-hidden border bg-background p-0 text-foreground shadow-lg md:max-h-[500px]"
            style={{ borderRadius: options.radius, maxWidth: `min(calc(100% - 2rem), ${options.width}px)` }}
          >
            <h2 id={titleId} className="sr-only">
              Settings
            </h2>
            <p id={descId} className="sr-only">
              Customize your settings here.
            </p>
            <div className="flex items-start">
              <nav
                aria-label="Settings sections"
                className={cn(
                  'h-[480px] w-full shrink-0 flex-col overflow-y-auto bg-muted/40 md:flex md:w-[14rem] md:border-r',
                  mobileView === 'pane' ? 'hidden' : 'flex',
                )}
              >
                <ul className="flex flex-col gap-1 p-2 pt-12 md:pt-2">
                  {data.nav.map((item) => {
                    const isActive = item.name === active
                    return (
                      <li key={item.name} className="relative">
                        <button
                          type="button"
                          aria-current={isActive ? 'page' : undefined}
                          data-autofocus={isActive ? '' : undefined}
                          onClick={() => select(item.name)}
                          className={cn(
                            'relative flex h-8 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none transition-[background-color,color] duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)]',
                            isActive && options.navStyle === 'muted' && 'bg-accent font-medium text-accent-foreground',
                            isActive && options.navStyle === 'accent' && 'bg-[var(--sd-accent)] font-medium text-[var(--sd-ink)] hover:bg-[var(--sd-accent)] hover:text-[var(--sd-ink)]',
                            isActive && options.navStyle === 'bar' && 'pl-3 font-medium text-foreground',
                          )}
                        >
                          {isActive && options.navStyle === 'bar' && (
                            <motion.span
                              layoutId={reduced ? undefined : 'sd-bar'}
                              transition={spring}
                              className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-[var(--sd-accent)]"
                            />
                          )}
                          <Icon name={item.icon} />
                          <span className="truncate">{item.name}</span>
                          <Icon name="chevronRight" className="ml-auto opacity-60 md:hidden" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>
              <main className={cn('h-[480px] min-w-0 flex-1 flex-col overflow-hidden', mobileView === 'nav' ? 'hidden md:flex' : 'flex')}>
                <header className="flex h-16 shrink-0 items-center gap-2 pr-12">
                  <div className="flex min-w-0 items-center gap-2 px-4">
                    <button
                      type="button"
                      aria-label="Back to settings"
                      onClick={() => setMobileView('nav')}
                      className="-ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] md:hidden"
                    >
                      <Icon name="chevronLeft" />
                    </button>
                    <nav aria-label="Breadcrumb" className="min-w-0">
                      <ol className="flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5">
                        <li className="hidden items-center gap-1.5 md:inline-flex">
                          <span className="transition-colors hover:text-foreground">Settings</span>
                        </li>
                        <li role="presentation" aria-hidden="true" className="hidden md:block">
                          <Icon name="chevronRight" className="size-3.5" />
                        </li>
                        <li className="inline-flex min-w-0 items-center gap-1.5">
                          <span aria-current="page" className="truncate font-normal text-foreground">
                            {current.name}
                          </span>
                        </li>
                      </ol>
                    </nav>
                  </div>
                </header>
                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                    <motion.div
                      key={current.name}
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({ opacity: mode === 'none' ? 1 : 0, x: d * offset }),
                        center: { opacity: 1, x: 0 },
                        exit: (d: number) => ({ opacity: mode === 'none' ? 1 : 0, x: -d * offset }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={mode === 'none' ? { duration: 0 } : spring}
                      className="absolute inset-0 flex flex-col gap-4 overflow-y-auto p-4 pt-0"
                    >
                      <div className="max-w-3xl divide-y rounded-xl border bg-muted/30">
                        {current.rows.map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-4 p-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{row.label}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{row.description}</p>
                            </div>
                            <Switch defaultChecked={row.on} label={row.label} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 inline-flex size-6 items-center justify-center rounded-xs opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)]"
            >
              <Icon name="x" />
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
