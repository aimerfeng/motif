// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-364.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'profile',
  accent: '#e4e4e7',
  showMutuals: true,
  showFollow: true,
  cardWidth: 256,
  radius: 6,
  side: 'bottom',
  openDelay: 700,
  closeDelay: 300,
}
/* @motif:end */

export type Person = { name: string; handle: string; hue: number }

export type Profile = Person & {
  company: string
  bio: string
  mutuals: Person[]
}

export type Article = { title: string; excerpt: string; readTime: string; updated: string; hue: number }

export const sampleProfile: Profile = {
  name: 'Keith Kennedy',
  handle: '@k.kennedy',
  hue: 24,
  company: '@fieldnote',
  bio: 'Crafting web experiences with Tailwind CSS.',
  mutuals: [
    { name: 'Ana Ruiz', handle: '@ana', hue: 200 },
    { name: 'Theo Park', handle: '@theo', hue: 140 },
    { name: 'Mina Sato', handle: '@mina', hue: 300 },
  ],
}

export const sampleArticle: Article = {
  title: 'Building a Design System with Next.js and Tailwind CSS',
  excerpt: 'Learn how to build a comprehensive design system using Tailwind CSS, including component architecture, and theme customization.',
  readTime: '8 min read',
  updated: 'Updated 2 days ago',
  hue: 250,
}

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 1
  const n = parseInt(m[1], 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** 照片头像换成首字母 + 渐变。 */
export function GradientAvatar({ person, size = 40, className }: { person: Person; size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={person.name}
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-semibold text-white select-none', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, size * 0.36),
        background: `linear-gradient(135deg, hsl(${person.hue} 70% 48%), hsl(${(person.hue + 50) % 360} 65% 32%))`,
      }}
    >
      {size >= 24 ? initials(person.name) : null}
    </span>
  )
}

export type ProfileHoverCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  profile?: Profile
  article?: Article
  href?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onFollow?: (following: boolean) => void
  /** 自定义触发元素内容，默认是名字（profile）或缩略图（preview）。 */
  children?: ReactNode
}

export function ProfileHoverCard({
  className,
  style,
  profile = sampleProfile,
  article = sampleArticle,
  href = '#',
  open: openProp,
  onOpenChange,
  onFollow,
  children,
  ...props
}: ProfileHoverCardProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const timer = useRef<number | undefined>(undefined)
  const [openState, setOpenState] = useState(false)
  const [following, setFollowing] = useState(false)
  const open = openProp ?? openState
  const top = options.side === 'top'
  const preview = options.variant === 'preview'

  const setOpen = (next: boolean) => {
    window.clearTimeout(timer.current)
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }
  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current)
    if (delay <= 0) setOpen(next)
    else timer.current = window.setTimeout(() => setOpen(next), delay)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setOpenRef = useRef(setOpen)
  useEffect(() => {
    setOpenRef.current = setOpen
  })
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenRef.current(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const accentInk = luminance(options.accent) > 0.4 ? '#0a0a0a' : '#ffffff'
  // 对应上游的 fade-in-0 + zoom-in-95 + slide-in-from-top-2 / bottom-2
  const offset = reduced ? 0 : top ? 8 : -8
  const enter = { opacity: 0, scale: reduced ? 1 : 0.95, y: offset }

  const trigger =
    children ??
    (preview ? (
      <span
        className="flex size-16 overflow-hidden rounded-md"
        style={{ background: `linear-gradient(140deg, hsl(${article.hue} 60% 62%), hsl(${(article.hue + 60) % 360} 55% 30%))` }}
      >
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
          <rect x="10" y="14" width="30" height="5" rx="2.5" fill="white" opacity="0.85" />
          <rect x="10" y="24" width="44" height="3" rx="1.5" fill="white" opacity="0.5" />
          <rect x="10" y="31" width="38" height="3" rx="1.5" fill="white" opacity="0.5" />
          <rect x="10" y="42" width="18" height="8" rx="2" fill="white" opacity="0.7" />
        </svg>
      </span>
    ) : (
      profile.name
    ))

  return (
    <span
      className={cn('relative inline-flex', className)}
      style={style}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') schedule(true, options.openDelay)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') schedule(false, options.closeDelay)
      }}
      onFocus={() => schedule(true, options.openDelay)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schedule(false, options.closeDelay)
      }}
    >
      <a
        href={href}
        aria-describedby={open ? `${id}-card` : undefined}
        aria-label={preview && !children ? article.title : undefined}
        className={cn(
          'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          !preview && 'text-sm font-medium hover:underline',
        )}
      >
        {trigger}
      </a>
      <AnimatePresence>
        {open && (
          // 透明的内边距连接触发元素和卡片，指针移过去不会关闭。
          <span className={cn('absolute left-0 z-50 block', top ? 'bottom-full pb-1' : 'top-full pt-1')}>
            <motion.div
              id={`${id}-card`}
              role="tooltip"
              data-side={options.side}
              initial={enter}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ ...enter, transition: { duration: reduced ? 0 : 0.1 } }}
              transition={{ duration: reduced ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'relative max-w-[calc(100vw-32px)] border bg-popover p-4 text-left text-popover-foreground shadow-lg outline-hidden',
                top ? 'origin-bottom-left' : 'origin-top-left',
              )}
              style={{ width: options.cardWidth, borderRadius: options.radius }}
            >
              {preview ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="font-semibold">{article.title}</h2>
                    <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.readTime}</span>
                    <span>·</span>
                    <span>{article.updated}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <GradientAvatar person={profile} />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-sm font-medium">{profile.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile.handle}</p>
                    </div>
                    {options.showFollow && (
                      <button
                        type="button"
                        aria-pressed={following}
                        onClick={() => {
                          setFollowing(!following)
                          onFollow?.(!following)
                        }}
                        className="h-7 shrink-0 rounded-md px-2.5 text-xs font-medium outline-none transition-[opacity,background-color] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
                        style={following ? { boxShadow: 'inset 0 0 0 1px var(--color-border)' } : { backgroundColor: options.accent, color: accentInk }}
                      >
                        {following ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Designer at <strong className="font-medium text-foreground">{profile.company}</strong>. {profile.bio}
                  </p>
                  {options.showMutuals && profile.mutuals.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {profile.mutuals.slice(0, 3).map((p) => (
                          <GradientAvatar key={p.handle} person={p} size={20} className="ring-1 ring-background" />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {profile.mutuals.length} mutual friend{profile.mutuals.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {preview && (
                <svg
                  viewBox="0 0 10 5"
                  width="10"
                  height="5"
                  aria-hidden
                  className={cn(
                    'absolute left-6 fill-popover drop-shadow-[0_1px_0_var(--color-border)]',
                    top ? 'top-full -mt-px' : 'bottom-full -mb-px rotate-180',
                  )}
                >
                  <polygon points="0,0 10,0 5,5" />
                </svg>
              )}
            </motion.div>
          </span>
        )}
      </AnimatePresence>
    </span>
  )
}
