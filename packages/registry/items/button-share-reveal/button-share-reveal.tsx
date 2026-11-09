// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/social-button.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Share',
  targets: 4,
  tone: 'mono',
  radius: 6,
  iconSize: 16,
  duration: 0.3,
  stagger: 0.05,
}
/* @motif:end */

export interface ShareItem {
  icon: ReactNode
  label: string
}

export type ShareRevealButtonProps = Partial<typeof defaults> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
    className?: string
    style?: CSSProperties
    items?: ShareItem[]
    onShare?: (index: number, item: ShareItem) => void
    /** 从外部控制展开（演示的自动播放用）。 */
    open?: boolean
  }

function Icon({ d, size }: { d: string; size: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const PATHS = {
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 1 9 7 9-7',
  message: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12Z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3',
}

const TARGETS: { key: keyof typeof PATHS; label: string }[] = [
  { key: 'send', label: 'Send to a friend' },
  { key: 'mail', label: 'Share by email' },
  { key: 'message', label: 'Share in a message' },
  { key: 'qr', label: 'Show QR code' },
  { key: 'link', label: 'Copy link' },
]

export function ShareRevealButton({ className, style, items, onShare, open, ...rest }: ShareRevealButtonProps) {
  const { label, targets, stagger, duration, radius, tone, iconSize, ...props } = { ...defaults, ...rest }
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pulses, setPulses] = useState<Record<number, number>>({})
  const isVisible = open ?? (hovered || focused)

  const count = Math.min(TARGETS.length, Math.max(1, Math.round(targets)))
  const list: ShareItem[] =
    items ?? TARGETS.slice(TARGETS.length - count).map((t) => ({ icon: <Icon d={PATHS[t.key]} size={iconSize} />, label: t.label }))

  const handleShare = (index: number) => {
    setPulses((p) => ({ ...p, [index]: (p[index] ?? 0) + 1 }))
    onShare?.(index, list[index])
  }

  const ease = [0.23, 1, 0.32, 1] as const
  const dur = reduced ? 0 : duration
  const mono = tone !== 'primary'

  return (
    <div
      className="relative inline-block"
      style={{ ...style, ['--share-radius' as string]: `${radius}px` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <motion.div animate={{ opacity: isVisible ? 0 : 1 }} transition={{ duration: reduced ? 0 : 0.2, ease: 'easeInOut' }}>
        <button
          type="button"
          aria-expanded={isVisible}
          tabIndex={isVisible ? -1 : 0}
          className={cn(
            'relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium',
            'rounded-[var(--share-radius)]',
            'bg-background hover:bg-muted',
            'text-foreground',
            'border border-foreground/10',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-colors duration-200',
            className,
          )}
          style={{ minWidth: Math.max(160, list.length * 40) }}
          {...props}
        >
          <span className="flex items-center gap-2">
            <Icon d={PATHS.link} size={iconSize} />
            {label}
          </span>
        </button>
      </motion.div>

      <motion.div
        role="group"
        aria-label={label}
        initial={false}
        animate={{ width: isVisible ? 'auto' : 0 }}
        className="absolute top-0 left-0 flex h-10 overflow-hidden rounded-[var(--share-radius)]"
        transition={{ duration: dur, ease }}
      >
        {list.map((button, i) => (
          <motion.button
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible || reduced ? 0 : -20 }}
            aria-label={button.label}
            tabIndex={isVisible ? 0 : -1}
            className={cn(
              'h-10 w-10 shrink-0',
              'flex items-center justify-center',
              mono ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground',
              'border-r last:border-r-0',
              mono ? 'border-background/10' : 'border-primary-foreground/15',
              mono ? 'hover:bg-foreground/90' : 'hover:bg-primary/90',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              'relative overflow-hidden',
              'transition-colors duration-200',
            )}
            key={`share-${button.label}`}
            onClick={() => handleShare(i)}
            transition={{ duration: dur, ease, delay: isVisible && !reduced ? i * stagger : 0 }}
            type="button"
          >
            <motion.div
              key={pulses[i] ?? 0}
              initial={{ scale: pulses[i] && !reduced ? 0.85 : 1 }}
              animate={{ scale: 1 }}
              className="relative z-10"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {button.icon}
            </motion.div>
            <motion.div
              key={`flash-${pulses[i] ?? 0}`}
              initial={{ opacity: pulses[i] ? 0.15 : 0 }}
              animate={{ opacity: 0 }}
              className={cn('absolute inset-0', mono ? 'bg-background' : 'bg-primary-foreground')}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
