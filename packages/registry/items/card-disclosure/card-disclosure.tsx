// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/disclosure.tsx
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/app/docs/disclosure/disclosure-card.tsx
// Modified by Motif; see the item's provenance.
import * as React from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion, type Transition, type Variant, type Variants } from 'motion/react'
import { createContext, useContext, useEffect, useId, useState, type CSSProperties } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  trigger: 'click',
  spring: {
    visualDuration: 0.5,
    bounce: 0.12,
  },
  coverZoom: 1.1,
  coverBlur: 3,
  panelColor: '#18181b',
  radius: 12,
  lineClamp: 3,
}
/* @motif:end */

export type DisclosureContextType = {
  open: boolean
  toggle: () => void
  contentId: string
  variants?: { expanded: Variant; collapsed: Variant }
}

const DisclosureContext = createContext<DisclosureContextType | undefined>(undefined)

export type DisclosureProviderProps = {
  children: React.ReactNode
  open: boolean
  onOpenChange?: (open: boolean) => void
  variants?: { expanded: Variant; collapsed: Variant }
}

function DisclosureProvider({ children, open: openProp, onOpenChange, variants }: DisclosureProviderProps) {
  const [internalOpenValue, setInternalOpenValue] = useState<boolean>(openProp)
  const contentId = useId()

  useEffect(() => {
    setInternalOpenValue(openProp)
  }, [openProp])

  const toggle = () => {
    const newOpen = !internalOpenValue
    setInternalOpenValue(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  return (
    <DisclosureContext.Provider value={{ open: internalOpenValue, toggle, contentId, variants }}>
      {children}
    </DisclosureContext.Provider>
  )
}

function useDisclosure() {
  const context = useContext(DisclosureContext)
  if (!context) {
    throw new Error('useDisclosure must be used within a DisclosureProvider')
  }
  return context
}

export type DisclosureProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  variants?: { expanded: Variant; collapsed: Variant }
  transition?: Transition
}

export function Disclosure({ open: openProp = false, onOpenChange, children, className, style, transition, variants }: DisclosureProps) {
  return (
    <MotionConfig transition={transition}>
      <div className={className} style={style}>
        <DisclosureProvider open={openProp} onOpenChange={onOpenChange} variants={variants}>
          {React.Children.toArray(children)[0]}
          {React.Children.toArray(children)[1]}
        </DisclosureProvider>
      </div>
    </MotionConfig>
  )
}

type TriggerChildProps = { className?: string } & Record<string, unknown>

export function DisclosureTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { toggle, open, contentId } = useDisclosure()

  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<TriggerChildProps>(child)) return child
        return React.cloneElement(child, {
          onClick: toggle,
          role: 'button',
          'aria-expanded': open,
          'aria-controls': contentId,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggle()
            }
          },
          ...child.props,
          className: cn(className, child.props.className),
        })
      })}
    </>
  )
}

export function DisclosureContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, variants, contentId } = useDisclosure()

  const BASE_VARIANTS: Variants = {
    expanded: { height: 'auto', opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  }

  const combinedVariants = {
    expanded: { ...BASE_VARIANTS.expanded, ...variants?.expanded },
    collapsed: { ...BASE_VARIANTS.collapsed, ...variants?.collapsed },
  }

  return (
    <div className={cn('overflow-hidden', className)}>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={contentId} initial="collapsed" animate="expanded" exit="collapsed" variants={combinedVariants}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LIGHT_INK = { strong: '#ffffff', soft: '#d4d4d8', line: 'rgba(255,255,255,0.22)', hover: 'rgba(255,255,255,0.08)' }
const DARK_INK = { strong: '#18181b', soft: '#3f3f46', line: 'rgba(0,0,0,0.2)', hover: 'rgba(0,0,0,0.06)' }

/** 按面板亮度挑深浅墨色。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return LIGHT_INK
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? DARK_INK : LIGHT_INK
}

/** 代替上游照片的山景插画。 */
function Artwork() {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 290 350" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c9a6" />
          <stop offset="0.45" stopColor="#e6a3a0" />
          <stop offset="1" stopColor="#7d6b9e" />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f7fb0" />
          <stop offset="1" stopColor="#5f5689" />
        </linearGradient>
        <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3566" />
          <stop offset="1" stopColor="#1e1b3a" />
        </linearGradient>
      </defs>
      <rect width="290" height="350" fill={`url(#${id}-sky)`} />
      <circle cx="198" cy="96" r="30" fill="#fde7c8" opacity="0.9" />
      <path d="M0 210 L52 150 L84 176 L138 98 L172 140 L204 118 L290 196 L290 350 L0 350 Z" fill={`url(#${id}-far)`} />
      <path d="M138 98 L124 118 L134 116 L142 126 L150 112 L158 120 Z" fill="#f4eef8" opacity="0.85" />
      <path d="M0 262 L46 220 L96 248 L150 190 L206 240 L252 214 L290 236 L290 350 L0 350 Z" fill={`url(#${id}-near)`} />
      <path d="M0 300 C70 280 140 312 200 292 S270 300 290 296 L290 350 L0 350 Z" fill="#141228" />
    </svg>
  )
}

export type DisclosureCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  title?: string
  subtitle?: string
  body?: string
  ctaLabel?: string
  /** 替换默认插画的封面内容。 */
  cover?: React.ReactNode
  /** 受控用法：是否展开。 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DisclosureCard({
  className,
  style,
  title = 'northline.studio',
  subtitle = 'Ridge light, 2,000 m above the valley',
  body = 'A field series shot over three dawns on the eastern ridge. We carried one camera, two lenses and a thermos, and waited for the minute the snow turns pink before the sun clears the peaks. Twelve prints, each on cotton rag paper.',
  ctaLabel = 'Learn More',
  cover,
  open,
  onOpenChange,
  ...props
}: DisclosureCardProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setIsOpen = (next: boolean) => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const imageVariants = {
    collapsed: { scale: 1, filter: 'blur(0px)' },
    expanded: { scale: options.coverZoom, filter: `blur(${options.coverBlur}px)` },
  }

  const contentVariants = {
    collapsed: { opacity: 0, y: 0 },
    expanded: { opacity: 1, y: 0 },
  }

  const transition: Transition = reduced
    ? { duration: 0 }
    : { type: 'spring', visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }

  const ink = inkFor(options.panelColor)
  const hover = options.trigger === 'hover'

  return (
    <div
      className={cn('relative h-[350px] w-[290px] max-w-full overflow-hidden', className)}
      style={{ borderRadius: options.radius, ...style }}
      onPointerEnter={hover ? (e) => e.pointerType === 'mouse' && setIsOpen(true) : undefined}
      onPointerLeave={hover ? (e) => e.pointerType === 'mouse' && setIsOpen(false) : undefined}
    >
      <div className="h-full w-full" onClick={() => setIsOpen(!isOpen)}>
        <motion.div
          className="pointer-events-none h-full w-full select-none"
          animate={isOpen ? 'expanded' : 'collapsed'}
          variants={imageVariants}
          transition={transition}
        >
          {cover ?? <Artwork />}
        </motion.div>
      </div>
      <Disclosure
        onOpenChange={setIsOpen}
        open={isOpen}
        className="absolute bottom-0 left-0 right-0 px-4 pt-2"
        style={{ backgroundColor: options.panelColor, borderRadius: options.radius }}
        variants={contentVariants}
        transition={transition}
      >
        <DisclosureTrigger>
          <button
            className="w-full rounded-[4px] pb-2 text-left text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-current"
            style={{ color: ink.strong }}
            type="button"
          >
            {title}
          </button>
        </DisclosureTrigger>
        <DisclosureContent>
          <div className="flex flex-col pb-4 text-[13px]" style={{ color: ink.soft }}>
            <p>{subtitle}</p>
            <p className="overflow-hidden" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: options.lineClamp }}>
              {body}
            </p>
            <button
              className="mt-3 w-full rounded-[4px] border px-4 py-1 transition-[background-color] duration-300 outline-none hover:bg-[var(--cd-hover)] focus-visible:ring-2 focus-visible:ring-current"
              style={{ borderColor: ink.line, color: ink.strong, ['--cd-hover' as string]: ink.hover }}
              type="button"
            >
              {ctaLabel}
            </button>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  )
}
