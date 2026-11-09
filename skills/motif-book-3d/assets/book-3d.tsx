// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/3d-book.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  title: 'Notebook',
  coverColor: '#bb013a',
  coverStyle: 'band',
  pageCount: 15,
  maxOpen: 165,
  perspective: 1500,
}
/* @motif:end */

export type InteractiveBookProps = Partial<typeof defaults> & {
  /** 受控：翻开程度 0–1（演示自动播放用）；不传时跟随指针。 */
  progress?: number
  className?: string
  style?: CSSProperties
}

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return 0
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const inkOn = (bg: string) => (luminance(bg) > 0.18 ? 'rgba(17,17,17,0.85)' : 'rgba(255,255,255,0.92)')

export function InteractiveBook({ progress: controlled, className, style, ...props }: InteractiveBookProps) {
  const options = { ...defaults, ...props }
  const bookRef = useRef<HTMLDivElement>(null)
  const [own, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const progress = controlled ?? own

  // Linear interpolation function
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!bookRef.current) return

    const rect = bookRef.current.getBoundingClientRect()
    const cursorX = e.clientX
    const bookCenterX = rect.left + rect.width / 2

    // Calculate how far cursor is from center (-1 to 1)
    const distanceFromCenter = (cursorX - bookCenterX) / (rect.width / 2)

    // Map cursor position to progress
    // Left side (negative) = open (1), Right side (positive) = closed (0)
    const targetProgress = lerp(1, 0, (distanceFromCenter + 1) / 2)

    // Clamp between 0 and 1
    setProgress(Math.max(0, Math.min(1, targetProgress)))
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handlePointerMove(e)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setProgress(0)
  }

  const handlePointerLeave = () => {
    // Close book when cursor leaves (only if not dragging on mobile)
    if (!isDragging) {
      setProgress(0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') setProgress((p) => Math.min(1, p + 0.1))
    else if (e.key === 'ArrowRight') setProgress((p) => Math.max(0, p - 0.1))
    else if (e.key === 'Escape') setProgress(0)
    else return
    e.preventDefault()
  }

  const full = options.coverStyle === 'full'
  const titleInk = full ? inkOn(options.coverColor) : undefined

  // Generate pages - all at same size and position
  const totalPages = Math.round(options.pageCount)
  const pages = []

  // All pages same size, different rotation angles
  for (let i = 1; i <= totalPages; i++) {
    const rotationAngle = (i + 1) * 10 // -20, -30, -40... -160

    pages.push(
      <div
        key={i}
        className="absolute h-48 w-32 rounded-lg border border-border bg-background md:h-72 md:w-52 md:rounded-2xl"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'left',
          transform: `rotateY(${progress * -rotationAngle}deg)`,
          zIndex: 50 + i,
          backfaceVisibility: 'visible',
        }}
      />,
    )
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center', className)} style={style}>
      <div
        ref={bookRef}
        role="img"
        aria-label={`${options.title}: use the left and right arrow keys to open and close the book`}
        tabIndex={0}
        className="h-48 w-32 translate-x-16 touch-none rounded-lg outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:h-72 md:w-52 md:translate-x-24"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onBlur={() => setProgress(0)}
        style={{
          perspective: `${options.perspective}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Back Cover (underneath all pages) */}
        <div
          className="absolute h-48 w-32 rounded-lg border-2 border-border md:h-72 md:w-52 md:rounded-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left',
            background: 'radial-gradient(var(--muted) 0 1px, var(--background) 1px 100%) 0 0 / 4px 4px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            zIndex: 1,
          }}
        />

        {/* Pages - all same size, different rotations */}
        {pages}

        {/* Front Cover */}
        <div
          className="absolute h-48 w-32 overflow-hidden bg-muted md:h-72 md:w-52"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            transform: `rotateY(${progress * -options.maxOpen}deg)`,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '0 8px 8px 0',
            zIndex: 200,
            backgroundColor: full ? options.coverColor : undefined,
          }}
        >
          {/* Cover shadow overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              borderRadius: '0 8px 8px 0',
              boxShadow:
                '0 0 0 0.85px rgba(0, 0, 0, 0.1) inset, 2px 0 1px 0 rgba(0, 0, 0, 0.1) inset, -1.5px 0 1px 0 rgba(0, 0, 0, 0.1) inset, 0 2px 2px 0 rgba(255, 255, 255, 0.1) inset, 0 8px 16px 0 rgba(0, 0, 0, 0.05)',
            }}
          />

          {/* Colored top section */}
          {!full && (
            <div
              className="absolute top-0 right-0 left-0 z-10 h-[40%] p-1.5 pl-2 md:p-3 md:pl-4"
              style={{
                backgroundColor: options.coverColor,
              }}
            />
          )}

          {/* Spine edge */}
          <div className="absolute top-0 bottom-0 left-0 z-30 flex w-2 flex-row justify-end md:w-3.5">
            <div className="h-full w-0.5 bg-background/25" />
            <div className="h-full w-0.5 bg-foreground/15" />
          </div>

          {/* Title */}
          <div
            className={cn(
              'pointer-events-none absolute right-1.5 bottom-1.5 left-3 z-20 truncate text-sm font-medium select-none md:left-6 md:text-2xl',
              !full && 'text-muted-foreground/60',
            )}
            style={{
              color: titleInk,
              textShadow: full ? undefined : '0 0 2px var(--background)',
              backfaceVisibility: 'hidden',
            }}
          >
            {options.title}
          </div>

          {/* Back label */}
          <div
            className="absolute top-1/2 right-1/2 text-center text-xs font-semibold text-primary md:text-base"
            style={{
              transform: 'translate(50%, -50%) rotateY(180deg) scaleX(-1)',
              backfaceVisibility: 'hidden',
            }}
          >
            Back Page
          </div>
        </div>
      </div>
    </div>
  )
}
