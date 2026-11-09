// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-595.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  docTitle: 'Basic UI',
  collaborators: 'Kelly King, Martha Johnson, Linda Green, Omar Diaz, Priya Nair, Tom Becker',
  maxVisible: 3,
  presenceColor: '#10b981',
  showActions: true,
  height: 64,
  accent: '#6366f1',
}
/* @motif:end */

export type NavbarCollabPresenceProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：每位协作者是否在线（按顺序）；不传时只有第一位在线，与上游一致 */
  online?: boolean[]
  /** 受控：额外加入的协作者人数（叠加到 +N 上） */
  extra?: number
}

type Opts = {
  docTitle: string
  collaborators: string
  maxVisible: number
  presenceColor: string
  showActions: boolean
  height: number
  accent: string
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const n = parseInt(m[1]!, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const css = (c: [number, number, number]) => `rgb(${c.map((v) => Math.round(v)).join(' ')})`

// 首字母头像：以强调色为基调、按序号偏移色相的渐变，墨色按亮度取黑或白。
function avatarStyle(accent: string, i: number): CSSProperties {
  const base = parseHex(accent) ?? [99, 102, 241]
  const shifts: [number, number, number][] = [
    [255, 255, 255],
    [236, 72, 153],
    [20, 184, 166],
    [245, 158, 11],
    [59, 130, 246],
  ]
  const other = shifts[i % shifts.length]!
  const from = mix(base, other, 0.15 + (i % 3) * 0.12)
  const to = mix(base, [0, 0, 0], 0.25)
  const lum = (luminance(from) + luminance(to)) / 2
  return {
    backgroundImage: `linear-gradient(135deg, ${css(from)}, ${css(to)})`,
    color: lum > 0.36 ? '#0b0b0f' : '#ffffff',
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? '') : ''
  return (first + last).toUpperCase()
}

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
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

const ChevronLeftIcon = () => (
  <Icon>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
const HistoryIcon = () => (
  <Icon>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Icon>
)
const MessageSquareTextIcon = () => (
  <Icon>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8H7" />
    <path d="M17 12H7" />
  </Icon>
)
const UserRoundPlusIcon = () => (
  <Icon>
    <path d="M2 21a8 8 0 0 1 13.292-6" />
    <circle cx="10" cy="8" r="5" />
    <path d="M19 16v6" />
    <path d="M22 19h-6" />
  </Icon>
)

const iconButton =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-[color,background-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function NavbarCollabPresence({ className, style, online, extra = 0, ...props }: NavbarCollabPresenceProps) {
  const o = { ...defaults, ...props } as Opts
  const reduce = useReducedMotion()
  const people = o.collaborators
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
  const max = Math.max(1, Math.min(5, Math.round(o.maxVisible)))
  const visible = people.slice(0, max)
  const overflow = Math.max(0, people.length - visible.length) + Math.max(0, Math.round(extra))
  const isOnline = (i: number) => (online ? Boolean(online[i]) : i === 0)

  return (
    <header className={cn('border-b px-4 md:px-6', className)} style={style}>
      <div className="flex items-center justify-between gap-4" style={{ height: o.height }}>
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-2">
          <a
            aria-label="Go back"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md outline-none transition-[color,background-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <ChevronLeftIcon />
          </a>
          <h1 className="truncate font-medium text-sm">{o.docTitle}</h1>
        </div>
        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {o.showActions && (
            <>
              {/* History button */}
              <button aria-label="History" className={cn(iconButton, 'max-sm:hidden')} type="button">
                <HistoryIcon />
              </button>
              {/* Comments button */}
              <button aria-label="Comments" className={cn(iconButton, 'max-sm:hidden')} type="button">
                <MessageSquareTextIcon />
              </button>
              {/* Add user */}
              <button aria-label="Add user" className={iconButton} type="button">
                <UserRoundPlusIcon />
              </button>
            </>
          )}
          {/* Online users */}
          <ul aria-label="Collaborators" className={cn('flex items-center gap-2', o.showActions && 'ml-2')}>
            {visible.map((name, i) => {
              const on = isOnline(i)
              return (
                <li key={`${name}-${i}`} className={cn('relative', i >= 2 && 'max-[400px]:hidden')}>
                  <span
                    aria-label={name}
                    className="flex size-8 items-center justify-center rounded-full font-medium text-xs select-none"
                    role="img"
                    style={avatarStyle(o.accent, i)}
                    title={name}
                  >
                    {initials(name)}
                  </span>
                  <span
                    className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background bg-muted-foreground"
                    style={{ backgroundColor: on ? o.presenceColor : undefined }}
                  >
                    <AnimatePresence>
                      {on && !reduce && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-[-2px] rounded-full"
                          style={{ backgroundColor: o.presenceColor }}
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="sr-only">{on ? 'Online' : 'Away'}</span>
                  </span>
                </li>
              )
            })}
            {overflow > 0 && (
              <li>
                <button
                  aria-label={`${overflow} more collaborators`}
                  className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  type="button"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={overflow}
                      initial={reduce ? false : { y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { y: -6, opacity: 0 }}
                      transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
                    >
                      +{overflow}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  )
}
