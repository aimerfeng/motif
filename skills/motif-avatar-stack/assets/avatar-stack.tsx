// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/avatar-stack/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  size: 48,
  overlap: 14,
  maxVisible: 5,
  shape: 'circle',
  spread: 10,
  spring: {
    visualDuration: 0.3,
    bounce: 0.3,
  },
  color: '#8b5cf6',
  showStatus: true,
}
/* @motif:end */

export type StackPerson = {
  name: string
  role?: string
  /** 渐变色相（0 到 360）；不写就按名字生成。 */
  hue?: number
  status?: 'online' | 'away' | 'offline'
}

export type AvatarStackProps = Partial<typeof defaults> & {
  people?: StackPerson[]
  /** 强制激活第几个头像（演示自动播放用）。 */
  activeIndex?: number | null
  /** 头像之间的描边色，应与背后的底色一致。 */
  ring?: string
  label?: string
  className?: string
  style?: CSSProperties
}

const SAMPLE: StackPerson[] = [
  { name: 'Mira Okafor', role: 'Owner', hue: 300, status: 'online' },
  { name: 'Jonas Weiss', role: 'Design', hue: 235, status: 'online' },
  { name: 'Priya Nair', role: 'Engineering', hue: 165, status: 'away' },
  { name: 'Tomas Lindqvist', role: 'Research', hue: 50, status: 'offline' },
  { name: 'Aiko Tanaka', role: 'Product', hue: 20, status: 'online' },
  { name: 'Leo Marchand', role: 'Ops', hue: 200 },
  { name: 'Sana Iyer', role: 'Legal', hue: 330 },
  { name: 'Ben Carter', role: 'Finance', hue: 110 },
]

const STATUS = { online: '#34d399', away: '#fbbf24', offline: '#71717a' } as const

const hueOf = (name: string) => Array.from(name).reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 7)
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** 头像堆叠：悬停或聚焦时头像抬起，左右邻居被推开，头顶弹出姓名；超出的人折叠成 +N。 */
export function AvatarStack({ people = SAMPLE, activeIndex, ring = 'var(--background)', label, className, style, ...props }: AvatarStackProps) {
  const { size, overlap, maxVisible, shape, spread, spring, color, showStatus } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [hover, setHover] = useState<number | null>(null)
  const shown = people.slice(0, maxVisible)
  const extra = people.length - shown.length
  const cells = extra > 0 ? shown.length + 1 : shown.length
  const active = activeIndex !== undefined ? activeIndex : hover
  const radius = shape === 'squircle' ? '32%' : '50%'
  const transition = reduced ? { duration: 0.1 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const fontSize = Math.round(size * 0.34)

  const offsetOf = (i: number) => {
    if (active === null || reduced) return 0
    const d = i - active
    if (d === 0) return 0
    return Math.sign(d) * spread * (Math.abs(d) === 1 ? 1 : Math.abs(d) === 2 ? 0.45 : 0.15)
  }

  return (
    <div
      role="group"
      aria-label={label ?? `${people.length} people`}
      className={cn('flex items-center', className)}
      style={{ '--c': color, paddingTop: 34, ...style } as CSSProperties}
      onPointerLeave={() => setHover(null)}
    >
      {Array.from({ length: cells }, (_, i) => {
        const isExtra = i === shown.length
        const person = isExtra ? null : shown[i]!
        const lifted = active === i
        const hue = person ? (person.hue ?? hueOf(person.name)) : 0
        return (
          <motion.div
            key={person?.name ?? 'extra'}
            className="relative shrink-0"
            style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -overlap, zIndex: lifted ? 50 : cells - i }}
            initial={false}
            animate={{ x: offsetOf(i), y: lifted && !reduced ? -7 : 0, scale: lifted && !reduced ? 1.12 : 1 }}
            transition={transition}
          >
            <div
              role="img"
              tabIndex={0}
              aria-label={person ? `${person.name}${person.role ? `, ${person.role}` : ''}${person.status && showStatus ? `, ${person.status}` : ''}` : `${extra} more ${extra === 1 ? 'person' : 'people'}`}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((current) => (current === i ? null : current))}
              className="grid size-full cursor-default place-items-center font-semibold text-white outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--c)"
              style={{
                borderRadius: radius,
                fontSize,
                boxShadow: `0 0 0 3px ${ring}${lifted ? ', 0 10px 20px -6px rgba(0,0,0,0.5)' : ''}`,
                background: person ? `linear-gradient(140deg, oklch(0.8 0.13 ${hue}), oklch(0.56 0.19 ${hue + 38}))` : 'color-mix(in oklab, var(--foreground) 12%, var(--card))',
                color: person ? 'white' : 'var(--foreground)',
                textShadow: person ? '0 1px 2px rgba(0,0,0,0.25)' : undefined,
              }}
            >
              {person ? initialsOf(person.name) : `+${extra}`}
            </div>
            {person?.status && showStatus && (
              <span aria-hidden className="absolute right-[2%] bottom-[2%] block rounded-full" style={{ width: size * 0.26, height: size * 0.26, backgroundColor: STATUS[person.status], boxShadow: `0 0 0 ${Math.max(2, size * 0.05)}px ${ring}` }} />
            )}
            <AnimatePresence>
              {lifted && person && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute bottom-full left-1/2 mb-3 rounded-lg border bg-popover/90 px-2.5 py-1.5 text-center whitespace-nowrap shadow-xl shadow-black/30 backdrop-blur-md"
                  initial={{ opacity: 0, y: reduced ? 0 : 6, x: '-50%', scale: reduced ? 1 : 0.9 }}
                  animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                  exit={{ opacity: 0, y: reduced ? 0 : 3, x: '-50%', transition: { duration: 0.1 } }}
                  transition={transition}
                >
                  <div className="text-xs leading-4 font-semibold text-popover-foreground">{person.name}</div>
                  {person.role && <div className="text-[11px] leading-4 text-muted-foreground">{person.role}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
