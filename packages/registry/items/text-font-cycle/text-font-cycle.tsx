// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/pixel-heading-character.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Pixel Fonts',
  fontSet: 'mixed',
  mode: 'multi',
  cycleInterval: 150,
  staggerDelay: 50,
  autoPlay: true,
  showLabel: true,
  size: 96,
}
/* @motif:end */

/* ─── Constants ─── */

interface Face {
  label: string
  family: string
  /** Size multiplier so wide and narrow faces sit at a similar height. */
  scale: number
}

const FONT_SETS: Record<string, Face[]> = {
  mixed: [
    { label: 'VT323', family: "'VT323', monospace", scale: 1.2 },
    { label: 'Press Start', family: "'Press Start 2P', monospace", scale: 0.62 },
    { label: 'Geist Mono', family: "'Geist Mono Variable', ui-monospace, monospace", scale: 1 },
    { label: 'Instrument', family: "'Instrument Serif', ui-serif, serif", scale: 1.08 },
    { label: 'Syne', family: "'Syne Variable', ui-sans-serif, sans-serif", scale: 0.94 },
  ],
  terminal: [
    { label: 'VT323', family: "'VT323', monospace", scale: 1.2 },
    { label: 'Press Start', family: "'Press Start 2P', monospace", scale: 0.62 },
    { label: 'Geist Mono', family: "'Geist Mono Variable', ui-monospace, monospace", scale: 1 },
    { label: 'JetBrains', family: "'JetBrains Mono Variable', ui-monospace, monospace", scale: 1 },
    { label: 'Plex Mono', family: "'IBM Plex Mono', ui-monospace, monospace", scale: 1 },
  ],
  editorial: [
    { label: 'Instrument', family: "'Instrument Serif', ui-serif, serif", scale: 1.08 },
    { label: 'DM Serif', family: "'DM Serif Display', ui-serif, serif", scale: 1 },
    { label: 'Playfair', family: "'Playfair Display Variable', ui-serif, serif", scale: 1 },
    { label: 'Fraunces', family: "'Fraunces Variable', ui-serif, serif", scale: 1 },
    { label: 'Newsreader', family: "'Newsreader Variable', ui-serif, serif", scale: 1.04 },
  ],
}

const FONT_COUNT = 5

/** Golden ratio — maximises spacing between identical values in a sequence. */
const PHI = (1 + Math.sqrt(5)) / 2

/** Internal tick rate in ms — drives the stagger resolution. */
const TICK_MS = 50

/* ─── Distribution algorithms ─── */

/**
 * Golden-ratio–based index.
 * Maps a sequential position to a font index such that
 * adjacent positions almost never share the same font.
 */
function goldenBase(index: number): number {
  return Math.floor((index * PHI * FONT_COUNT) % FONT_COUNT)
}

/**
 * Deterministic pseudo-random via Knuth multiplicative hash.
 * Produces a uniform-ish distribution across FONT_COUNT for any (tick, index) pair.
 */
function pseudoRandom(tick: number, index: number): number {
  return ((tick * 2654435761 + index * 340573321) >>> 0) % FONT_COUNT
}

function faceStyle(face: Face | undefined): CSSProperties | undefined {
  return face ? { fontFamily: face.family, fontSize: `${face.scale}em` } : undefined
}

/* ─── Types ─── */

/**
 * Animation mode for per-character font distribution.
 *
 * | Mode       | At rest                         | Active                                             |
 * |------------|---------------------------------|----------------------------------------------------|
 * | `uniform`  | Single font                     | Cycles one font for all characters                 |
 * | `multi`    | Golden-ratio distribution       | Staggered cascade — each char cycles independently |
 * | `wave`     | Position-based gradient         | Fonts flow left→right in a continuous wave         |
 * | `random`   | Golden-ratio distribution       | Each character scrambles independently             |
 */
export type PixelHeadingMode = 'uniform' | 'multi' | 'wave' | 'random'

/* ─── Props ─── */

export type PixelHeadingProps = Partial<typeof defaults> &
  Omit<ComponentProps<'h1'>, 'prefix' | 'children'> & {
    /** The heading level to render. */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    /** Initial font index (0–4). Only meaningful in `uniform` mode. */
    defaultFontIndex?: number
    /** Static text rendered before the animated characters. */
    prefix?: string
    /** Font index (0–4) of the active set for the prefix; `none` inherits. */
    prefixFont?: number | 'none'
    /** Characters to exclude from the animation, mapped to a CSS font-family. */
    isolate?: Record<string, string>
  }

/* ─── Component ─── */

/**
 * Heading where **each character** can display a different typeface.
 * On hover / focus (or automatically with `autoPlay`) the fonts animate — the
 * distribution algorithm and cascade timing come from `mode` and `staggerDelay`.
 */
export function PixelHeading({
  as: Tag = 'h1',
  className,
  style,
  defaultFontIndex = 0,
  prefix,
  prefixFont = 'none',
  isolate,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  text = defaults.text,
  fontSet = defaults.fontSet,
  mode: modeProp = defaults.mode,
  cycleInterval: cycleIntervalProp = defaults.cycleInterval,
  staggerDelay = defaults.staggerDelay,
  autoPlay = defaults.autoPlay,
  showLabel = defaults.showLabel,
  size = defaults.size,
  ...props
}: PixelHeadingProps) {
  const mode = modeProp as PixelHeadingMode
  const cycleInterval = Math.max(cycleIntervalProp, 1)
  const fonts = FONT_SETS[fontSet] ?? FONT_SETS.mixed!

  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [msElapsed, setMsElapsed] = useState(0)
  const [hovered, setHovered] = useState(false)
  const isActive = (hovered || autoPlay) && !reduced
  /** Frame time at which the current run started; null restarts on the next frame. */
  const startRef = useRef<number | null>(null)
  /** Extra ms added by keyboard steps. */
  const offsetRef = useRef(0)

  /* ── Tick from frame time (replaces the upstream setInterval) ── */
  useFrameLoop(
    rootRef,
    ({ time }) => {
      if (!isActive) return
      if (startRef.current === null) startRef.current = time
      const ms = Math.floor(((time - startRef.current) * 1000) / TICK_MS) * TICK_MS + offsetRef.current
      setMsElapsed((prev) => (prev === ms ? prev : ms))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  /* ── Compute per-character font indices ── */
  const charFonts = useMemo(() => {
    const out: number[] = []
    let vi = 0 // visible-character index (skips spaces)

    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        out.push(-1)
        continue
      }

      switch (mode) {
        case 'uniform': {
          const cycles = Math.floor(msElapsed / cycleInterval)
          out.push((defaultFontIndex + cycles) % FONT_COUNT)
          break
        }
        case 'wave': {
          const charMs = Math.max(0, msElapsed - vi * staggerDelay)
          const cycles = Math.floor(charMs / cycleInterval)
          out.push((vi + cycles) % FONT_COUNT)
          break
        }
        case 'random': {
          const charMs = Math.max(0, msElapsed - vi * staggerDelay)
          const cycles = Math.floor(charMs / cycleInterval)
          out.push(cycles > 0 ? pseudoRandom(cycles, vi) : goldenBase(vi))
          break
        }
        default: {
          const base = goldenBase(vi)
          const charMs = Math.max(0, msElapsed - vi * staggerDelay)
          const cycles = Math.floor(charMs / cycleInterval)
          out.push((base + cycles) % FONT_COUNT)
        }
      }
      vi++
    }
    return out
  }, [text, mode, msElapsed, cycleInterval, staggerDelay, defaultFontIndex])

  /* ── Label text ── */
  const activeLabel = useMemo(() => {
    if (mode === 'uniform') {
      const idx = charFonts.find((f) => f !== -1) ?? 0
      return fonts[idx]?.label ?? ''
    }
    const modeLabels: Record<PixelHeadingMode, string> = { uniform: '', multi: 'Multi', wave: 'Wave', random: 'Random' }
    return modeLabels[mode] ?? ''
  }, [mode, charFonts, fonts])

  /* ── Start / stop cycling ── */
  const startCycling = useCallback(() => {
    startRef.current = null
    offsetRef.current = 0
    setMsElapsed(0)
    setHovered(true)
  }, [])

  const stopCycling = useCallback(() => {
    // Auto-play keeps running — just restart the cascade
    if (autoPlay) startRef.current = null
    setHovered(false)
  }, [autoPlay])

  /* ── Event handlers ── */
  const handleMouseEnter = (e: MouseEvent<HTMLHeadingElement>) => {
    startCycling()
    onMouseEnter?.(e)
  }
  const handleMouseLeave = (e: MouseEvent<HTMLHeadingElement>) => {
    stopCycling()
    onMouseLeave?.(e)
  }
  const handleFocus = (e: FocusEvent<HTMLHeadingElement>) => {
    startCycling()
    onFocus?.(e)
  }
  const handleBlur = (e: FocusEvent<HTMLHeadingElement>) => {
    stopCycling()
    onBlur?.(e)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      offsetRef.current += cycleInterval
      setMsElapsed((prev) => prev + cycleInterval)
    }
    onKeyDown?.(e)
  }

  /* ── Uniform font index ── */
  const uniformIdx = mode === 'uniform' ? (charFonts.find((f) => f !== -1) ?? defaultFontIndex) : 0
  const prefixFace = prefixFont !== 'none' ? fonts[prefixFont] : undefined

  return (
    <div ref={rootRef} data-slot="pixel-heading" className="inline-flex max-w-full flex-col items-start gap-2">
      <Tag
        data-state={isActive ? 'active' : 'idle'}
        data-mode={mode}
        aria-label={prefix ? `${prefix} ${text}` : text}
        tabIndex={0}
        className={cn(
          'cursor-default leading-none select-none',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          className,
        )}
        style={{ fontSize: `${size}px`, ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* ── Static prefix ── */}
        {prefix && (
          <>
            {isolate ? (
              prefix.split('').map((char, i) => (
                <span key={`p${i}`} style={isolate[char] ? { fontFamily: isolate[char] } : faceStyle(prefixFace)} aria-hidden>
                  {char}
                </span>
              ))
            ) : (
              <span style={faceStyle(prefixFace)} aria-hidden>
                {prefix}
              </span>
            )}
            <span> </span>
          </>
        )}

        {/* ── Animated characters ── */}
        {mode === 'uniform' ? (
          <span style={faceStyle(fonts[uniformIdx])} aria-hidden>
            {text}
          </span>
        ) : (
          text.split('').map((char, i) =>
            char === ' ' ? (
              <span key={i}> </span>
            ) : isolate?.[char] ? (
              <span key={i} style={{ fontFamily: isolate[char] }} aria-hidden>
                {char}
              </span>
            ) : (
              <span key={i} style={faceStyle(fonts[charFonts[i]!])} aria-hidden>
                {char}
              </span>
            ),
          )
        )}
      </Tag>
      {showLabel && (
        <output
          data-slot="pixel-heading-label"
          aria-live="polite"
          className={cn(
            'text-muted-foreground text-xs tracking-widest uppercase transition-opacity duration-200',
            isActive || autoPlay ? 'opacity-100' : 'opacity-0',
          )}
        >
          {activeLabel}
        </output>
      )}
    </div>
  )
}
