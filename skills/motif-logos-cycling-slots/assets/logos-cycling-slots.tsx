// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/logo-carousel.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import React, { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Used by release teams at 900+ companies',
  columns: 3,
  logoStyle: 'wordmark',
  tone: 'dark',
  logoSize: 24,
  interval: 2,
  stagger: 0.2,
  blur: 8,
}
/* @motif:end */

export type LogoCarouselProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// Define the structure for our logo objects
interface Logo {
  name: string
  id: number
  font: string
  weight: number
  tracking: string
  italic?: boolean
  upper?: boolean
  glyph: ReactNode
}

// 虚构品牌：几何图形 + 一种 OFL 字体的字标，不对应任何真实公司。
const ALL_LOGOS: Logo[] = [
  { id: 1, name: 'Northlight', font: "'Syne Variable', sans-serif", weight: 700, tracking: '-0.02em', glyph: <path d="M3 17a9 9 0 0 1 18 0zM12 3v4M4.5 7.5l2.6 2.6M19.5 7.5l-2.6 2.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 2, name: 'Kestrel', font: "'Archivo Black', sans-serif", weight: 400, tracking: '0.1em', upper: true, glyph: <path d="m3 15 9-9 9 9M3 20l9-9 9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 3, name: 'Brightwell', font: "'DM Serif Display', serif", weight: 400, tracking: '-0.01em', italic: true, glyph: <><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.2" fill="currentColor" /></> },
  { id: 4, name: 'orchard', font: "'Fraunces Variable', serif", weight: 600, tracking: '-0.03em', glyph: <path d="M12 21c-5 0-8-3.4-8-8 5 0 8 3 8 8Zm0 0c5 0 8-3.4 8-8-5 0-8 3-8 8ZM12 3v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 5, name: 'plum_st', font: "'JetBrains Mono Variable', monospace", weight: 700, tracking: '-0.04em', glyph: <path d="M4 4h16v16H4zM4 12h16M12 4v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { id: 6, name: 'Foxglove', font: "'Bricolage Grotesque Variable', sans-serif", weight: 800, tracking: '-0.04em', glyph: <path d="M6 20V9M12 20V4M18 20v-8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /> },
  { id: 7, name: 'Lumen', font: "'Space Grotesk Variable', sans-serif", weight: 600, tracking: '-0.02em', glyph: <path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { id: 8, name: 'Saltmarsh', font: "'Instrument Serif', serif", weight: 400, tracking: '-0.01em', glyph: <path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 16c3-3 6 3 9 0s6 3 9 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> },
  { id: 9, name: 'Halcyon', font: "'Geist Variable', sans-serif", weight: 700, tracking: '-0.03em', glyph: <path d="M12 3a9 9 0 1 0 9 9h-9z" fill="currentColor" /> },
  { id: 10, name: 'Tern', font: "'Syne Variable', sans-serif", weight: 800, tracking: '0.02em', upper: true, glyph: <path d="M3 13 12 4l9 9-9 7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { id: 11, name: 'Mossbank', font: "'Fraunces Variable', serif", weight: 500, tracking: '-0.02em', italic: true, glyph: <><circle cx="8" cy="12" r="5" fill="currentColor" /><circle cx="16" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" /></> },
  { id: 12, name: 'Quill&Co', font: "'Space Grotesk Variable', sans-serif", weight: 500, tracking: '-0.03em', glyph: <path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 13, name: 'Ardent', font: "'Archivo Black', sans-serif", weight: 400, tracking: '-0.02em', glyph: <path d="M12 3 21 20H3z" fill="currentColor" /> },
  { id: 14, name: 'Wren', font: "'DM Serif Display', serif", weight: 400, tracking: '0em', glyph: <path d="M4 6h16M4 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /> },
]

// 上游用 Math.random 洗牌；这里用固定种子，保证服务端渲染、海报和视频一致。
const shuffleArray = <T,>(array: T[], seed = 7): T[] => {
  const shuffled = [...array]
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = tmp
  }
  return shuffled
}

// Utility function to distribute logos across multiple columns
// This ensures each column has a balanced number of logos
const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])

  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  // Ensure all columns have the same number of logos by filling shorter columns
  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col, c) => {
    let k = c
    while (col.length < maxLength) {
      col.push(shuffled[k % shuffled.length])
      k += 3
    }
  })

  return columns
}

function LogoMark({ logo, logoStyle }: { logo: Logo; logoStyle: string }) {
  const glyphOnly = logoStyle === 'glyph'
  return (
    <span className="flex items-center gap-[0.4em] whitespace-nowrap" role="img" aria-label={logo.name}>
      <svg viewBox="0 0 24 24" className={glyphOnly ? 'size-[2.2em]' : 'size-[1.15em]'} aria-hidden>
        {logo.glyph}
      </svg>
      {!glyphOnly && (
        <span
          aria-hidden
          style={{ fontFamily: logo.font, fontWeight: logo.weight, letterSpacing: logo.tracking, fontStyle: logo.italic ? 'italic' : undefined, textTransform: logo.upper ? 'uppercase' : undefined, lineHeight: 1 }}
        >
          {logo.name}
        </span>
      )}
    </span>
  )
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
  interval: number
  stagger: number
  blur: number
  logoStyle: string
  reduced: boolean
}

// LogoColumn component: Displays a single column of animated logos
const LogoColumn: React.FC<LogoColumnProps> = React.memo(({ logos, index, currentTime, interval, stagger, blur, logoStyle, reduced }) => {
  const cycleInterval = interval * 1000 // Time each logo is displayed (in milliseconds)
  const columnDelay = index * stagger * 1000 // Stagger each column's swap
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
  const currentIndex = Math.floor(adjustedTime / cycleInterval)
  const logo = logos[currentIndex]
  const b = reduced ? 0 : blur

  return (
    <motion.div
      className="relative h-14 w-24 overflow-hidden md:h-24 md:w-48"
      initial={reduced ? false : { opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${logo.id}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-center"
          initial={reduced ? { opacity: 0 } : { y: '10%', opacity: 0, filter: `blur(${b}px)` }}
          animate={{
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
            transition: reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 300, damping: 20, mass: 1, bounce: 0.2, duration: 0.5 },
          }}
          exit={{
            y: reduced ? '0%' : '-20%',
            opacity: 0,
            filter: `blur(${b * 0.75}px)`,
            transition: { type: 'tween', ease: 'easeIn', duration: reduced ? 0.2 : 0.3 },
          }}
        >
          <LogoMark logo={logo} logoStyle={logoStyle} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
})
LogoColumn.displayName = 'LogoColumn'

// Main LogoCarousel component
export function LogoCarousel({ className, style, ...props }: LogoCarouselProps) {
  const o = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = Boolean(useReducedMotion())
  const [currentTime, setCurrentTime] = useState(0)
  const columnCount = Math.max(1, Math.round(o.columns))

  const logoSets = useMemo(() => distributeLogos(ALL_LOGOS, columnCount), [columnCount])

  // 上游用 100ms 的 setInterval 计时；这里把帧循环时间量化到同样的 100ms 步长。
  useFrameLoop(
    hostRef,
    ({ time }) => {
      const t = Math.floor(time * 10) * 100
      setCurrentTime((prev) => (prev === t ? prev : t))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const dark = o.tone !== 'light'

  return (
    <div
      ref={hostRef}
      className={cn('flex flex-col items-center gap-6', className)}
      style={{ color: dark ? '#f2f2f4' : '#121317', ['--ls' as string]: `${o.logoSize}px`, ...style }}
    >
      {o.heading && (
        <p className="max-w-md px-4 text-center text-sm leading-relaxed text-balance" style={{ color: dark ? 'rgba(242,242,244,0.62)' : 'rgba(18,19,23,0.64)' }}>
          {o.heading}
        </p>
      )}
      <div className="flex max-w-full flex-wrap justify-center gap-4 [font-size:calc(var(--ls)*0.55)] md:[font-size:var(--ls)]" role="list" aria-label="Customer logos">
        {logoSets.map((logos, index) => (
          <div role="listitem" key={index}>
            <LogoColumn
              logos={logos}
              index={index}
              currentTime={currentTime}
              interval={o.interval}
              stagger={o.stagger}
              blur={o.blur}
              logoStyle={o.logoStyle}
              reduced={reduced}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogoCarousel
