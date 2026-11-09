import { useRef } from 'react'
import { KineticTypeScroll, type KineticTypeScrollProps } from './scroll-kinetic-type'

export function Demo(props: KineticTypeScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    // `relative` makes the scroller an offsetParent so Motion measures the target against it.
    <div ref={containerRef} className="relative h-full w-full overflow-y-auto overscroll-contain bg-background text-foreground">
      <div className="flex h-[52svh] items-center justify-center px-6">
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          Each word owns a slice of this panel&rsquo;s scroll range. Keep scrolling and the wave travels through the phrase.
        </p>
      </div>
      <div className="flex min-h-[46svh] items-center justify-center px-6">
        <KineticTypeScroll
          {...props}
          container={containerRef}
          className="max-w-2xl text-[2.5rem] font-semibold leading-[1.15] tracking-tight sm:text-6xl"
        />
      </div>
      <div className="flex h-[70svh] items-start justify-center px-6 pt-14">
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          Scroll back up and the wave runs in reverse: the effect is bound to position, not to a one-shot trigger.
        </p>
      </div>
    </div>
  )
}
