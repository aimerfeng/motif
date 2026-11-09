import { useRef } from 'react'
import { ScrollSplitCards, type ScrollSplitCardsProps } from './scroll-split-panels'

export function Demo(props: ScrollSplitCardsProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    // `relative` makes the scroller an offsetParent so Motion measures the track against it.
    <div ref={scroller} className="relative h-full w-full overflow-y-auto overscroll-contain bg-neutral-950">
      <ScrollSplitCards {...props} containerRef={scroller} />
    </div>
  )
}
