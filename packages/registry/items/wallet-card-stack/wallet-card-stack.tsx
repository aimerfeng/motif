// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/wallet-card/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  palette: ['#1f4d3a', '#1d2a44', '#b4532a'],
  radius: 16,
  grain: 0.14,
  stackOffset: 14,
  tilt: 7,
  spring: {
    visualDuration: 0.3,
    bounce: 0.1,
  },
}
/* @motif:end */

export interface WalletAccount {
  id: string
  label: string
  balance: number
  currency?: string
  last4?: string
  holder?: string
  expiry?: string
}

export type WalletCardStackProps = Partial<typeof defaults> & {
  accounts?: WalletAccount[]
  activeId?: string
  onActiveChange?: (id: string) => void
  hidden?: boolean
  onHiddenChange?: (hidden: boolean) => void
  className?: string
  style?: CSSProperties
}

const SAMPLE: WalletAccount[] = [
  { id: 'daily', label: 'Daily spending', balance: 4280.5, currency: 'USD', last4: '4417', holder: 'Mira Chen', expiry: '08/29' },
  { id: 'savings', label: 'Rainy day', balance: 18940.12, currency: 'USD', last4: '9082', holder: 'Mira Chen', expiry: '03/28' },
  { id: 'travel', label: 'Travel fund', balance: 2315, currency: 'USD', last4: '6150', holder: 'Mira Chen', expiry: '11/27' },
]

const MAX_DEPTH = 3
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")"

const surface = (c: string) => `linear-gradient(145deg, color-mix(in oklab, ${c} 78%, white), ${c} 48%, color-mix(in oklab, ${c} 66%, black))`

function Chip() {
  return (
    <svg aria-hidden className="h-[26px] w-[34px] shrink-0" viewBox="0 0 34 26" fill="none">
      <rect x="0.5" y="0.5" width="33" height="25" rx="4.5" fill="#d9bb62" stroke="rgba(0,0,0,0.22)" />
      <g stroke="rgba(0,0,0,0.3)">
        <path d="M0 8.5H11M0 17.5H11M23 8.5H34M23 17.5H34M11 3.5V22.5M23 3.5V22.5M11 13H23" />
      </g>
    </svg>
  )
}

function Balance({ account, hidden, reduced }: { account: WalletAccount; hidden: boolean; reduced: boolean }) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency ?? 'USD' })
  const symbol = fmt.formatToParts(account.balance).find((p) => p.type === 'currency')?.value ?? ''
  const text = fmt.format(account.balance)
  const chars = hidden ? [...symbol, ...'••••••'] : [...text]
  const blur = reduced ? {} : { filter: 'blur(6px)' }
  return (
    <span aria-label={hidden ? 'Balance hidden' : text} className="flex text-[26px] leading-none font-semibold tabular-nums text-white">
      <AnimatePresence initial={false} mode="popLayout">
        {chars.map((ch, i) => (
          <motion.span
            key={`${hidden}-${i}-${ch}`}
            aria-hidden
            initial={{ opacity: 0, ...blur }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, ...blur }}
            transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.25, bounce: 0.1, delay: i * 0.018 }}
          >
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

function Card({ account, color, rank, active, hidden, onSelect, tilt, stackOffset, radius, grain, zIndex, transition, reduced }: { account: WalletAccount; color: string; rank: number; active: boolean; hidden: boolean; onSelect: () => void; tilt: number; stackOffset: number; radius: number; grain: number; zIndex: number; transition: object; reduced: boolean }) {
  const px = useMotionValue(28)
  const py = useMotionValue(18)
  const sx = useSpring(px, { damping: 26, mass: 0.4, stiffness: 140 })
  const sy = useSpring(py, { damping: 26, mass: 0.4, stiffness: 140 })
  const sheen = useMotionTemplate`radial-gradient(120% 90% at ${sx}% ${sy}%, rgba(255,255,255,0.30), rgba(255,255,255,0.06) 45%, transparent 72%)`

  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set(((event.clientX - rect.left) / rect.width) * 100)
    py.set(((event.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <motion.div
      role="presentation"
      className="col-start-1 row-start-1"
      initial={false}
      animate={reduced ? { rotateX: 0, scale: 1, y: 0, z: 0 } : { rotateX: active ? 0 : tilt, scale: 1 - rank * 0.05, y: rank * stackOffset * 2.2, z: active ? 36 : 0 }}
      transition={transition}
      style={{ transformStyle: 'preserve-3d', zIndex }}
    >
      <button
        type="button"
        role="option"
        aria-selected={active}
        tabIndex={active ? 0 : -1}
        data-wallet-id={account.id}
        onClick={onSelect}
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(28)
          py.set(18)
        }}
        className={cn(
          'relative block aspect-[1.586] w-full cursor-pointer overflow-hidden text-left outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
          active ? 'shadow-[0_2px_4px_rgba(0,0,0,0.10),0_14px_28px_-10px_rgba(0,0,0,0.34),0_34px_60px_-24px_rgba(0,0,0,0.40)]' : 'shadow-[0_1px_2px_rgba(0,0,0,0.10),0_10px_20px_-10px_rgba(0,0,0,0.28)]',
        )}
        style={{ borderRadius: radius, background: surface(color) }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: NOISE, opacity: grain }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: sheen }} />
        <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-white/15 ring-inset" style={{ borderRadius: radius }} />
        <span className="relative flex h-full w-full flex-col justify-between p-5">
          <span className="flex items-start justify-between gap-3">
            <Chip />
            <span className="text-[11px] font-medium tracking-[0.02em] text-white/75">{account.label}</span>
          </span>
          <Balance account={account} hidden={hidden} reduced={reduced} />
          <span className="text-[15px] font-medium tracking-[0.14em] text-white/85 tabular-nums">•••• •••• •••• {account.last4 ?? '••••'}</span>
          <span className="flex items-end gap-6">
            <span className="min-w-0">
              <span className="block text-[8px] tracking-[0.14em] text-white/50 uppercase">Card holder</span>
              <span className="block truncate text-[12px] font-medium tracking-[0.05em] text-white/90 uppercase">{account.holder ?? '—'}</span>
            </span>
            <span>
              <span className="block text-[8px] tracking-[0.14em] text-white/50 uppercase">Valid thru</span>
              <span className="block text-[12px] font-medium tabular-nums text-white/90">{account.expiry ?? '--/--'}</span>
            </span>
          </span>
        </span>
      </button>
    </motion.div>
  )
}

/** 卡片钱包：选中的卡片朝你抬起，其余向后叠成一摞；光泽跟着指针走，余额隐藏时数字逐个模糊成圆点。 */
export function WalletCardStack({ accounts = SAMPLE, activeId, onActiveChange, hidden, onHiddenChange, className, style, ...props }: WalletCardStackProps) {
  const { palette, stackOffset, tilt, grain, radius, spring } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const [innerActive, setInnerActive] = useState(accounts[0]?.id)
  const [innerHidden, setInnerHidden] = useState(false)
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  const active = activeId ?? innerActive
  const isHidden = hidden ?? innerHidden
  const select = (id: string) => (onActiveChange ? onActiveChange(id) : setInnerActive(id))
  const activeIndex = accounts.findIndex((a) => a.id === active)
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step || accounts.length === 0) return
    event.preventDefault()
    const next = accounts[(activeIndex + step + accounts.length) % accounts.length]
    select(next.id)
    refs.current[next.id]?.focus()
  }

  let rankCounter = 0
  return (
    <div className={cn('flex flex-col gap-5', className)} style={style}>
      <div
        role="listbox"
        aria-label="Cards"
        onKeyDown={onKeyDown}
        ref={(node) => {
          node?.querySelectorAll<HTMLButtonElement>('[data-wallet-id]').forEach((b) => (refs.current[b.dataset.walletId ?? ''] = b))
        }}
        className="relative grid"
        style={{ marginBottom: MAX_DEPTH * stackOffset * 2.2, perspective: reduced ? undefined : 1400, transformStyle: 'preserve-3d' }}
      >
        {accounts.map((account, index) => {
          const isActive = account.id === active
          const rank = isActive ? 0 : ++rankCounter
          return (
            <Card
              key={account.id}
              account={account}
              color={palette[index % palette.length]}
              rank={Math.min(rank, MAX_DEPTH)}
              active={isActive}
              hidden={isHidden}
              onSelect={() => select(account.id)}
              tilt={tilt}
              stackOffset={stackOffset}
              radius={radius}
              grain={grain}
              zIndex={accounts.length - rank}
              transition={transition}
              reduced={reduced}
            />
          )
        })}
      </div>
      <button
        type="button"
        aria-pressed={isHidden}
        onClick={() => (onHiddenChange ? onHiddenChange(!isHidden) : setInnerHidden(!isHidden))}
        className="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.8" />
          {isHidden && <path d="M4 4l16 16" />}
        </svg>
        {isHidden ? 'Show balance' : 'Hide balance'}
      </button>
    </div>
  )
}
