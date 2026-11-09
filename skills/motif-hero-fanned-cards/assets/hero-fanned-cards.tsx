// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/hero/product-features.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { type HTMLMotionProps, motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  angle: 6,
  offset: 30,
  cardWidth: 192,
  spring: {
    visualDuration: 0.5,
    bounce: 0.25,
  },
  palette: ['#7dd3fc', '#d6a77a', '#f472b6'],
  headline: 'Pots of Joy: Ceramic Chic!',
  ctaLabel: 'Ready to clay',
}
/* @motif:end */

export type HeroFannedCardsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 让某张卡保持「悬停」状态（演示的自动播放用）；undefined 时只响应真实指针。 */
  activeIndex?: number | null
}

type Shape = 'vase' | 'jug' | 'bottle'

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

const BODY: Record<Shape, string> = {
  vase: 'M82 70c-4 18-22 30-22 62 0 34 18 54 40 54s40-20 40-54c0-32-18-44-22-62z',
  jug: 'M76 74h48l-4 18c18 10 26 26 26 46 0 30-20 48-46 48s-46-18-46-48c0-20 8-36 26-46z',
  bottle: 'M90 40h20v34c22 10 30 30 30 56v44c0 8-6 12-12 12H72c-6 0-12-4-12-12v-44c0-26 8-46 30-56z',
}

/** 上游用的是远程商品照片；这里换成按配色着色的 SVG 静物。 */
function ProductArt({ shape, color }: { shape: Shape; color: string }) {
  const id = `hfc-${shape}`
  const body = BODY[shape]
  return (
    <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 z-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="0.45" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="200" height="260" fill="#f5efe6" />
      <rect width="200" height="260" fill={`url(#${id}-bg)`} />
      <rect y="186" width="200" height="74" fill="#000" opacity="0.12" />
      <ellipse cx="100" cy="188" rx="52" ry="8" fill="#000" opacity="0.22" />
      {shape === 'jug' && <path d="M126 100c24 0 28 36 6 46" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />}
      <path d={body} fill={color} />
      <path d={body} fill={`url(#${id}-body)`} />
      {shape === 'vase' && <path d="M70 122c12 8 48 8 60 0M64 148c14 10 58 10 72 0" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" />}
      <ellipse cx="80" cy="128" rx="5" ry="22" fill="#fff" opacity="0.35" />
    </svg>
  )
}

interface FeatureCardProps extends HTMLMotionProps<'div'> {
  feature: {
    title: string
    category: string
    shape: Shape
    color: string
  }
  zIndexOffset?: number
  width: number
  active?: boolean
  reduced: boolean
}

function FeatureCard({ feature, className, zIndexOffset = 0, width, active, reduced, ...props }: FeatureCardProps) {
  const { title, category, shape, color } = feature
  const springValue = useSpring(0, {
    bounce: 0,
  })
  const zIndex = useTransform(springValue, (value) => Math.floor(value * 10) + 10 + zIndexOffset)
  const scale = useTransform(springValue, [0, 1], [1, 1.1])

  useEffect(() => {
    if (active === undefined) return
    springValue.set(active ? 1 : 0)
  }, [active, springValue])

  // 浅色商品配色时加深标题底，保证白字可读
  const light = luminance(color) > 0.35

  const content: ReactNode = (
    <>
      <ProductArt shape={shape} color={color} />
      <div className="z-10 flex h-full w-full flex-col gap-2 bg-linear-to-t from-zinc-800/40 from-15% to-transparent p-3">
        <small className="inline w-fit rounded-xl bg-orange-950/60 px-2 py-1 text-xs font-medium leading-none text-white">
          {category}
        </small>

        <div className="flex-1" />
        <h3 className={cn('rounded-xl p-3 text-base font-bold leading-tight text-white backdrop-blur-sm', light ? 'bg-blue-950/60' : 'bg-blue-950/40')}>
          {title}
        </h3>
      </div>
    </>
  )

  const containerClassName = cn(
    'relative flex flex-col overflow-hidden rounded-2xl shadow-none outline-none transition-shadow duration-300 ease-in-out hover:shadow-xl focus-visible:shadow-xl focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2',
    className,
  )
  const size = { width, height: Math.round((width * 4) / 3) }

  return (
    <>
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={`${category}: ${title}`}
        onMouseEnter={() => springValue.set(1)}
        onMouseLeave={() => springValue.set(0)}
        onFocus={() => springValue.set(1)}
        onBlur={() => springValue.set(0)}
        style={{
          zIndex,
          scale,
          ...size,
        }}
        className={cn(containerClassName, 'hidden sm:flex')}
        {...props}
      >
        {content}
      </motion.div>
      <motion.div
        initial={reduced ? false : { y: 100 }}
        animate={{ y: 0, transition: { duration: 0.5 } }}
        style={size}
        className={cn(containerClassName, 'flex sm:hidden')}
        role="group"
        aria-label={`${category}: ${title}`}
      >
        {content}
      </motion.div>
    </>
  )
}

export function HeroFannedCards({ className, style, activeIndex, ...props }: HeroFannedCardsProps) {
  const o = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const cardWidth = o.cardWidth
  const angle = o.angle
  const yOffset = o.offset
  const enter = (delay: number) => ({ type: 'spring' as const, visualDuration: o.spring.visualDuration, bounce: o.spring.bounce, delay })
  const fade = reduced ? false : { y: 100, opacity: 0 }
  const lift = (i: number) => (activeIndex === undefined ? undefined : activeIndex === i)

  return (
    <section className={cn('flex w-full flex-col items-center gap-4 overflow-hidden bg-orange-50 py-10', className)} style={style}>
      <motion.header
        initial={fade}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.5,
          },
        }}
        className="flex max-w-md flex-col items-center gap-2 px-4 text-center"
      >
        <h1 className="text-balance text-3xl font-black text-orange-600">{o.headline}</h1>
        <div className="block text-balance text-lg text-neutral-500">
          Quirky ceramics for happy spaces. From sleek vases to funky mugs, we&apos;ve got your shelves covered.
        </div>
      </motion.header>

      <motion.div
        initial={fade}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.5,
          },
        }}
      >
        <button
          type="button"
          className="relative isolate box-border inline-block h-11 cursor-pointer touch-manipulation whitespace-nowrap rounded-full border-b-4 border-solid border-transparent bg-orange-600 px-4 py-3 text-center text-sm font-bold uppercase leading-5 tracking-wider text-white shadow-2xl outline-hidden transition-[filter] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 active:border-b-0 active:border-t-4 active:bg-none disabled:cursor-auto"
        >
          {o.ctaLabel} &rarr;
          <span className="absolute inset-0 -z-10 rounded-full border-b-4 border-solid border-transparent bg-orange-500" />
        </button>
      </motion.div>

      <div className="relative flex w-full flex-wrap justify-center gap-8 px-4 py-12 sm:flex-row sm:gap-0">
        <FeatureCard
          width={cardWidth}
          reduced={reduced}
          active={lift(0)}
          feature={{ category: 'Vases', shape: 'vase', color: o.palette[0] ?? '#7dd3fc', title: 'Elegant Swirling Glass Vase' }}
          initial={reduced ? false : { x: cardWidth, y: yOffset, opacity: 0, rotate: 0, scale: 0.9 }}
          animate={{ x: yOffset, y: 10, opacity: 1, scale: 0.95, rotate: -angle, transition: enter(0.8) }}
        />

        <FeatureCard
          width={cardWidth}
          reduced={reduced}
          active={lift(1)}
          feature={{ category: 'Jugs', shape: 'jug', color: o.palette[1] ?? '#d6a77a', title: 'Artisanal Ceramic Jug' }}
          initial={reduced ? false : { y: yOffset, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: enter(0.4) }}
          zIndexOffset={1}
        />

        <FeatureCard
          width={cardWidth}
          reduced={reduced}
          active={lift(2)}
          feature={{ category: 'Bottles', shape: 'bottle', color: o.palette[2] ?? '#f472b6', title: 'Colorful Gradient Glass Bottle' }}
          initial={reduced ? false : { x: -cardWidth, y: yOffset, opacity: 0, rotate: 0, scale: 0.9 }}
          animate={{ x: -yOffset, y: 10, opacity: 1, rotate: angle, scale: 0.95, transition: enter(0.6) }}
        />
      </div>
    </section>
  )
}
