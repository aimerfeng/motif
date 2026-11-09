import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { ShapeMaskMorph, type ShapeMaskMorphProps } from './shape-mask-morph'

/** Abstract colour fields, drawn inline so the item ships no images. */
function Artwork({ wide = false }: { wide?: boolean }) {
  const id = wide ? 'smm-wide' : 'smm-sq'
  return (
    <svg aria-hidden="true" viewBox={wide ? '0 0 800 300' : '0 0 400 400'} preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6a43a" />
          <stop offset="0.55" stopColor="#d9467a" />
          <stop offset="1" stopColor="#4b2a9a" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9b8" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-bg)`} />
      <circle cx={wide ? 560 : 270} cy={wide ? 90 : 120} r={wide ? 160 : 150} fill={`url(#${id}-sun)`} opacity="0.8" />
      <path d={wide ? 'M0,220 C200,160 420,260 800,190 L800,300 L0,300 Z' : 'M0,290 C110,240 230,320 400,260 L400,400 L0,400 Z'} fill="#2a1760" opacity="0.75" />
      <path d={wide ? 'M0,260 C260,220 520,300 800,250 L800,300 L0,300 Z' : 'M0,340 C140,300 260,370 400,330 L400,400 L0,400 Z'} fill="#150b33" opacity="0.85" />
    </svg>
  )
}

export function Demo(props: ShapeMaskMorphProps) {
  const host = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const scrollMode = props.animate === 'scroll'
  const wide = props.shape === 'wave'

  useEffect(() => setManual(false), [scrollMode])

  // Autoplay for scroll mode: ping-pong the panel until the user scrolls.
  useFrameLoop(host, ({ time }) => {
    const el = scroller.current
    if (!scrollMode || manual || !el) return
    const max = el.scrollHeight - el.clientHeight
    const t = (1 - Math.cos((time / 7) * Math.PI * 2)) / 2
    el.scrollTop = t * max
  })

  const figure = (
    <figure className="flex w-full max-w-md flex-col items-center gap-4">
      <ShapeMaskMorph {...props} container={scrollMode ? scroller : undefined} className={wide ? 'w-full' : ''}>
        <div className={wide ? 'h-48 w-full' : 'size-64 sm:size-72'}>
          <Artwork wide={wide} />
        </div>
      </ShapeMaskMorph>
      <figcaption className="text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Field Notes · Issue 07</p>
        <p className="mt-1 text-base font-medium text-foreground">Dusk over the salt flats</p>
      </figcaption>
    </figure>
  )

  return (
    <div ref={host} className="h-full w-full bg-background">
      {scrollMode ? (
        <div
          ref={scroller}
          className="relative h-full w-full overflow-y-auto overscroll-contain"
          onWheel={() => setManual(true)}
          onTouchStart={() => setManual(true)}
        >
          <div className="flex h-[70%] items-end justify-center px-6 pb-6">
            <p className="max-w-xs text-center text-sm text-muted-foreground">Scroll the panel: the mask steps through its shapes.</p>
          </div>
          <div className="flex justify-center px-4">{figure}</div>
          <div className="h-[80%]" />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center px-4">{figure}</div>
      )}
    </div>
  )
}
