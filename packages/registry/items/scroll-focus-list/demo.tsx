import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { ScrollFocusList, type ScrollFocusListProps } from './scroll-focus-list'

const DWELL = 1.6 // seconds per item, including the glide

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function Demo(props: ScrollFocusListProps) {
  const host = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const manual = useRef(false)

  // Autoplay: glide from item to item and back, until the viewer scrolls themselves.
  useFrameLoop(
    host,
    ({ time }) => {
      const c = scroller.current
      if (!c || manual.current) return
      const items = Array.from(c.querySelectorAll<HTMLElement>('[role="listitem"]'))
      if (items.length < 2) return
      const centres = items.map((el) => el.offsetTop + el.offsetHeight / 2 - c.clientHeight / 2)
      const n = items.length
      const cycle = (n - 1) * 2
      const step = (time / DWELL) % cycle
      const i = Math.floor(step)
      const frac = Math.min(1, Math.max(0, (step - i - 0.45) / 0.55))
      const index = (k: number) => (k < n ? k : cycle - k)
      const from = centres[index(i)] ?? 0
      const to = centres[index((i + 1) % cycle)] ?? 0
      c.scrollTop = from + (to - from) * ease(frac)
    },
    { reducedMotion: 'static', staticTime: 2 * DWELL + 0.2 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div
      ref={host}
      className="flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 py-8 text-foreground"
      onWheel={stop}
      onTouchStart={stop}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div className="w-full max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">What we do</p>
      </div>
      <div className="relative w-full max-w-3xl [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]">
        <ScrollFocusList {...props} scrollerRef={scroller} />
      </div>
      <p className="max-w-sm text-center text-sm text-muted-foreground">Ten disciplines, one studio. Scroll the list to browse.</p>
    </div>
  )
}
