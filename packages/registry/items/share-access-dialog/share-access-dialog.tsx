// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/input-group/c-input-group-40.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  radius: 12,
  presentation: 'dialog',
  showLinkAccess: true,
  members: 3,
  spring: {
    visualDuration: 0.35,
    bounce: 0.15,
  },
  width: 420,
}
/* @motif:end */

export type Member = { name: string; email: string; role: string }

export type ShareAccessDialogProps = Partial<typeof defaults> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  link?: string
  people?: Member[]
  defaultInvitees?: string[]
  /** true：弹窗限制在最近的定位容器里（预览、嵌入）；false：铺满视口。 */
  contained?: boolean
  className?: string
  style?: CSSProperties
}

const roles = ['Admin', 'Member', 'Viewer']
const visibilityOptions = ['Private', 'Team', 'Public']

const PEOPLE: Member[] = [
  { name: 'Lena Ruiz', email: 'lena@northwind.dev', role: 'Owner' },
  { name: 'Omar Haddad', email: 'omar@northwind.dev', role: 'Admin' },
  { name: 'Mei Tanaka', email: 'mei@northwind.dev', role: 'Member' },
  { name: 'Jonas Berg', email: 'jonas@northwind.dev', role: 'Viewer' },
  { name: 'Priya Nair', email: 'priya@northwind.dev', role: 'Viewer' },
]

const TONES = ['#f97316', '#0ea5e9', '#a855f7', '#22c55e', '#ec4899']
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

// 按相对亮度选深 / 浅字色，保证任何强调色上的文字都可读。
function inkFor(hex: string) {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0')
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return l > 0.2 ? '#0a0a0a' : '#ffffff'
}

const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

type IconProps = { className?: string }
const ChevronDown = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
)
const LinkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><path d="M8 12h8" /></svg>
)
const CopyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
)
const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
)
const ShareIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
)
const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
)

/** 代替 base-ui DropdownMenu 的小菜单：menu / menuitemradio，方向键切换，Esc 关闭。 */
function DropdownMenu({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])
    const current = items.find((el) => el.getAttribute('aria-checked') === 'true') ?? items[0]
    current?.focus()
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!listRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (item: string) => {
    onChange(item)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`${label}: ${value}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center gap-1.5 rounded-[calc(var(--r)-4px)] px-2 text-xs font-medium text-foreground/90 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        {value}
        <ChevronDown className="size-3.5 opacity-60" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={id}
            role="menu"
            aria-label={label}
            onKeyDown={onKey}
            initial={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full right-0 z-50 mt-1 min-w-32 origin-top-right rounded-[calc(var(--r)-2px)] border bg-popover p-1 text-popover-foreground shadow-lg"
          >
            {options.map((item) => (
              <div
                key={item}
                role="menuitemradio"
                aria-checked={item === value}
                tabIndex={-1}
                onClick={() => choose(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    choose(item)
                  }
                }}
                className="flex cursor-default items-center justify-between gap-3 rounded-[calc(var(--r)-5px)] px-2 py-1.5 text-xs outline-none select-none hover:bg-muted focus:bg-muted"
              >
                {item}
                {item === value && <CheckIcon className="size-3.5 text-(--accent)" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Avatar({ name, tone }: { name: string; tone: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ backgroundColor: tone, color: inkFor(tone) }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/**
 * 共享面板：邮箱输入成标签 + 角色菜单，成员列表与各自权限，
 * 链接可见范围菜单和带反馈的复制按钮。presentation=dialog 时带 Share 触发按钮和模态外壳。
 */
export function ShareAccessDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title = 'Share “Q2 review”',
  link = 'northwind.dev/runbooks/q2-review',
  people = PEOPLE,
  defaultInvitees = [],
  contained = false,
  className,
  style,
  ...props
}: ShareAccessDialogProps) {
  const { accent, radius, presentation, showLinkAccess, members, spring, width } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const titleId = useId()
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const isOpen = open ?? innerOpen
  const setOpen = (v: boolean) => {
    if (open === undefined) setInnerOpen(v)
    onOpenChange?.(v)
  }
  const [invitees, setInvitees] = useState<string[]>(defaultInvitees)
  const [draft, setDraft] = useState('')
  const [role, setRole] = useState('Member')
  const [visibility, setVisibility] = useState('Private')
  const [added, setAdded] = useState<Member[]>([])
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const copyAnim = useRef<ReturnType<typeof animate> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const ink = inkFor(accent)
  const isDialog = presentation === 'dialog'

  useEffect(() => () => copyAnim.current?.stop(), [])

  // 打开时记下焦点来源，关闭后还回去。
  useEffect(() => {
    if (!isDialog || !isOpen) return
    const prev = document.activeElement as HTMLElement | null
    return () => {
      if (prev && prev !== document.body) prev.focus({ preventScroll: true })
    }
  }, [isDialog, isOpen])

  const addDraft = () => {
    const value = draft.trim().replace(/,$/, '')
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !invitees.includes(value)) setInvitees((v) => [...v, value])
    if (value) setDraft('')
  }

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => undefined)
    setCopied(true)
    copyAnim.current?.stop()
    // 用 motion 的 rAF 计时代替 setTimeout，截图时也能看到反馈恢复。
    copyAnim.current = animate(0, 1, { duration: 1.6, onComplete: () => setCopied(false) })
  }

  const invite = () => {
    if (!invitees.length) return
    setAdded((l) => [...l, ...invitees.map((email) => ({ name: email, email, role }))])
    setInvitees([])
  }

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isDialog) return
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const vars = { '--accent': accent, '--r': `${radius}px` } as CSSProperties
  const shown = [...people.slice(0, Math.max(1, Math.round(members))), ...added]

  const panel = (
    <div
      ref={panelRef}
      role={isDialog ? 'dialog' : 'region'}
      aria-modal={isDialog || undefined}
      aria-labelledby={titleId}
      onKeyDown={onPanelKey}
      className="w-full rounded-(--r) border bg-card pb-5 text-card-foreground shadow-2xl"
      style={{ maxWidth: width }}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0 text-left">
          <h2 id={titleId} className="truncate text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Invite people and choose what they can do.</p>
        </div>
        {isDialog && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-[calc(var(--r)-4px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--accent)"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 px-5 pt-4">
        {/* InputGroup + 角色菜单（c-input-group-32） */}
        <div
          role="group"
          aria-label="Invite people"
          className="group/input-group relative flex min-h-9 w-full min-w-0 flex-wrap items-center gap-1 rounded-[calc(var(--r)-2px)] border bg-background px-1.5 py-1 outline-none transition-[border-color,box-shadow] focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/25"
        >
          {invitees.map((email) => (
            <span key={email} className="flex max-w-full min-w-0 items-center gap-1 rounded-[calc(var(--r)-5px)] bg-muted py-0.5 pr-0.5 pl-2 text-xs">
              <span className="truncate">{email}</span>
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={() => setInvitees((v) => v.filter((x) => x !== email))}
                className="grid size-4 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addDraft()
              } else if (e.key === 'Backspace' && !draft && invitees.length) {
                setInvitees((v) => v.slice(0, -1))
              }
            }}
            onBlur={addDraft}
            placeholder={invitees.length ? 'Add more…' : 'Add emails…'}
            aria-label="Invite by email"
            className="h-7 w-16 min-w-0 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="ml-auto">
            <DropdownMenu label="Role" value={role} options={roles} onChange={setRole} />
          </div>
        </div>
        <button
          type="button"
          onClick={invite}
          disabled={!invitees.length}
          className="h-9 shrink-0 self-start rounded-[calc(var(--r)-2px)] px-3.5 text-sm font-medium outline-none transition-[filter,opacity] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
          style={{ backgroundColor: accent, color: ink }}
        >
          Invite
        </button>
      </div>

      <div className="px-5 pt-5 text-left">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">People with access</div>
        <ul className="mt-2 space-y-1">
          {shown.map((m, i) => {
            const memberRole = roleOverrides[m.email] ?? m.role
            return (
              <li key={m.email} className="flex items-center gap-3 py-1">
                <Avatar name={m.name} tone={TONES[i % TONES.length] ?? '#64748b'} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
                {memberRole === 'Owner' ? (
                  <span className="px-2 text-xs text-muted-foreground">Owner</span>
                ) : (
                  <DropdownMenu label={`Access for ${m.name}`} value={memberRole} options={roles} onChange={(r) => setRoleOverrides((o) => ({ ...o, [m.email]: r }))} />
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {showLinkAccess && (
        <div className="mt-4 border-t px-5 pt-4 text-left">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">General access</div>
          {/* InputGroup + 可见范围菜单 + 复制（c-input-group-40） */}
          <div
            role="group"
            aria-label="Share link"
            className="group/input-group relative mt-2 flex h-9 w-full min-w-0 items-center rounded-[calc(var(--r)-2px)] border bg-background outline-none transition-[border-color,box-shadow] focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/25"
          >
            <div className="order-first flex items-center justify-center pl-2.5 select-none">
              <LinkIcon className="size-4 opacity-60" />
            </div>
            <input
              readOnly
              value={link}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground/90 outline-none"
            />
            <div className="order-last flex items-center gap-1 pr-1">
              <DropdownMenu label="Select visibility" value={visibility} options={visibilityOptions} onChange={setVisibility} />
              <button
                type="button"
                aria-label={copied ? 'Link copied' : 'Copy link'}
                onClick={copy}
                className="relative grid size-7 place-items-center rounded-[calc(var(--r)-4px)] text-foreground/80 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-(--accent)"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? 'check' : 'copy'}
                    initial={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
                    transition={{ duration: 0.15 }}
                    className="grid place-items-center"
                  >
                    {copied ? <CheckIcon className="size-4 text-(--accent)" /> : <CopyIcon className="size-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {copied
              ? 'Link copied to clipboard.'
              : visibility === 'Private'
                ? 'Only people added above can open this link.'
                : visibility === 'Team'
                  ? 'Anyone at Northwind with the link can view.'
                  : 'Anyone on the internet with the link can view.'}
          </p>
        </div>
      )}
    </div>
  )

  if (!isDialog) {
    return (
      <div className={cn('w-full', className)} style={{ ...vars, ...style }}>
        {panel}
      </div>
    )
  }

  return (
    <div className={cn('inline-block', className)} style={{ ...vars, ...style }}>
      {/* Share 触发按钮（c-dropdown-menu-13） */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setOpen(true)}
        className="flex h-9 w-fit items-center gap-2 rounded-[calc(var(--r)-2px)] border bg-background px-3.5 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-(--accent)"
      >
        <ShareIcon className="size-4" />
        Share
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className={cn('z-50 flex items-center justify-center p-4', contained ? 'absolute inset-0' : 'fixed inset-0')} style={vars}>
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="relative flex w-full justify-center"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              transition={reduced ? { duration: 0.15 } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }}
              onAnimationComplete={() => {
                if (isOpen && !panelRef.current?.contains(document.activeElement)) panelRef.current?.querySelector<HTMLElement>('input')?.focus({ preventScroll: true })
              }}
            >
              {panel}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
