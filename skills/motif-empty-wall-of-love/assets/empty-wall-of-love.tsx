// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/empty-testimonial.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  folderColor: '#EBEBEB',
  noteColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
  spring: {
    visualDuration: 0.5,
    bounce: 0.2,
  },
  title: 'Wall of',
  ctaLabel: 'Add Testimonial',
  autoplay: true,
}
/* @motif:end */

export type EmptyWallOfLoveProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled open state of the folder. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called when the call-to-action is pressed. */
  onAction?: () => void
}

function parseHex(hex: string): number[] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]!
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function luminance(hex: string) {
  const rgb = parseHex(hex)
  if (!rgb) return 1
  const ch = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

/** Mix a hex color toward black (amount > 0) or white (amount < 0). */
function shade(hex: string, amount: number) {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const target = amount > 0 ? 0 : 255
  const a = Math.abs(amount)
  return `#${rgb
    .map((v) =>
      Math.round(v + (target - v) * a)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

const PAGES = [
  {
    initial: { rotate: -3, x: -38, y: 2 },
    open: { rotate: -8, x: -70, y: -75 },
    durationScale: 1.1,
    bounceOffset: -0.05,
    className: 'z-10',
  },
  {
    initial: { rotate: 0, x: 0, y: 0 },
    open: { rotate: 1, x: 2, y: -95 },
    durationScale: 1.1,
    bounceOffset: -0.08,
    className: 'z-20',
  },
  {
    initial: { rotate: 3.5, x: 42, y: 1 },
    open: { rotate: 9, x: 75, y: -80 },
    durationScale: 1.16,
    bounceOffset: -0.03,
    className: 'z-10',
  },
]

export function EmptyWallOfLove({ className, style, open, onOpenChange, onAction, ...props }: EmptyWallOfLoveProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const [innerOpen, setInnerOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isOpen = open ?? innerOpen

  const toggle = () => {
    const next = !isOpen
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  const { visualDuration, bounce } = options.spring
  const spring = (scale = 1, bounceOffset = 0) =>
    reduce
      ? { duration: 0 }
      : {
          type: 'spring' as const,
          visualDuration: visualDuration * scale,
          bounce: Math.max(0, Math.min(1, bounce + bounceOffset)),
        }

  const folder = options.folderColor
  const folderLight = luminance(folder) > 0.18
  const folderFront = shade(folder, folderLight ? -0.3 : -0.08)
  const folderBorder = shade(folder, folderLight ? 0.12 : -0.2)
  const faceInk = folderLight ? 'rgba(82,82,82,0.4)' : 'rgba(255,255,255,0.45)'

  return (
    <div className={cn('flex w-full flex-col items-center justify-center px-4 py-24', className)} style={style}>
      <div className="mb-20 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {options.title}{' '}
          <motion.span
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative inline-flex cursor-default items-center gap-2 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-1 text-primary transition-colors duration-300 hover:border-primary/20 hover:bg-primary/10"
          >
            Love
            <motion.span
              animate={isHovered && !reduce ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.7, repeat: isHovered && !reduce ? Infinity : 0, ease: 'easeInOut' }}
              className="inline-block"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-[0.85em] w-[0.85em]" fill="#f43f5e">
                <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3 1.7-1.8 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
              </svg>
            </motion.span>
          </motion.span>
        </h2>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close testimonials folder' : 'Open testimonials folder'}
        className="group relative mb-12 h-52 w-80 max-w-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <div
          className="folder-back relative mx-auto flex h-full w-[87.5%] justify-center overflow-visible rounded-xl"
          style={{ background: folder, border: `1px solid ${folderBorder}` }}
        >
          {PAGES.map((page, i) => (
            <motion.div
              key={i}
              initial={page.initial}
              animate={isOpen ? page.open : page.initial}
              transition={spring(page.durationScale, page.bounceOffset)}
              className={`absolute top-2 h-fit w-32 rounded-xl shadow-lg ${page.className}`}
            >
              <Page color={options.noteColors[i % options.noteColors.length] ?? '#FFFFFF'} />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ rotateX: isOpen ? -35 : 0 }}
          transition={spring()}
          className="absolute inset-x-0 -bottom-px z-30 flex h-44 origin-bottom items-center justify-center overflow-visible rounded-3xl"
        >
          <div className="relative h-full w-full">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 235 121"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M104.615 0.350494L33.1297 0.838776C32.7542 0.841362 32.3825 0.881463 32.032 0.918854C31.6754 0.956907 31.3392 0.992086 31.0057 0.992096H31.0047C30.6871 0.99235 30.3673 0.962051 30.0272 0.929596C29.6927 0.897686 29.3384 0.863802 28.9803 0.866119L13.2693 0.967682H13.2527L13.2352 0.969635C13.1239 0.981406 13.0121 0.986674 12.9002 0.986237H9.91388C8.33299 0.958599 6.76052 1.22345 5.27423 1.76651H5.27325C4.33579 2.11246 3.48761 2.66213 2.7879 3.37393L2.49689 3.68839L2.492 3.69424C1.62667 4.73882 1.00023 5.96217 0.656067 7.27725C0.653324 7.28773 0.654065 7.29886 0.652161 7.30948C0.3098 8.62705 0.257231 10.0048 0.499817 11.3446L12.2147 114.399L12.2156 114.411L12.2176 114.423C12.6046 116.568 13.7287 118.508 15.3934 119.902C17.058 121.297 19.1572 122.056 21.3231 122.049V122.05H215.379C217.76 122.02 220.064 121.192 221.926 119.698V119.697C223.657 118.384 224.857 116.485 225.305 114.35L225.307 114.339L235.914 53.3798L235.968 53.1093L235.97 53.0985L235.971 53.0888C236.134 51.8978 236.044 50.685 235.705 49.5321C235.307 48.1669 234.63 46.9005 233.717 45.8144L233.383 45.4296C232.58 44.5553 231.614 43.8449 230.539 43.3398C229.311 42.7628 227.971 42.4685 226.616 42.4774H146.746C144.063 42.4705 141.423 41.8004 139.056 40.5263C136.691 39.2522 134.671 37.4127 133.175 35.1689L113.548 5.05948L113.544 5.05362L113.539 5.04776C112.545 3.65165 111.238 2.51062 109.722 1.72061C108.266 0.886502 106.627 0.422235 104.952 0.365143V0.364166L104.633 0.350494H104.615Z"
                fill={folderFront}
                stroke={folderBorder}
                strokeWidth="1.5"
              />
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
              <div className="mb-2.5 flex gap-11">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: faceInk }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: faceInk }} />
              </div>
              <div className="h-1 w-9 rounded-full" style={{ background: faceInk }} />
            </div>
          </div>
        </motion.div>
      </button>

      <div className="space-y-4 text-center">
        <p className="text-xl tracking-tight text-foreground">
          Oops..There are no testimonials <br />
          <span className="text-lg text-muted-foreground">Be the first one to add a testimonial</span>
        </p>
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onAction}
            className="group flex items-center gap-3 rounded-full border border-dashed border-muted-foreground/30 bg-background px-6 py-3 outline-none transition-[border-color,background-color] duration-300 hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-base font-medium text-foreground transition-colors group-hover:text-primary">{options.ctaLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const Page = ({ color }: { color: string }) => {
  const light = luminance(color) > 0.18
  const line = light ? shade(color, 0.06) : shade(color, -0.12)
  const border = light ? shade(color, 0.12) : shade(color, -0.2)
  return (
    <div
      className="h-full w-full rounded-xl border p-4"
      style={{ background: `linear-gradient(to bottom, ${color}, ${shade(color, 0.04)})`, borderColor: border }}
    >
      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full rounded-full" style={{ background: line }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-1.5 flex-1 rounded-full" style={{ background: line }} />
            <div className="h-1.5 flex-1 rounded-full" style={{ background: line }} />
          </div>
        ))}
      </div>
    </div>
  )
}
