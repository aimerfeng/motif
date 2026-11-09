import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TooltipRichContent, defaults, type TooltipRichContentProps } from './tooltip-rich-content'

const LABELS: Record<string, string> = { text: 'W/ arrow', title: 'W/ title', icon: 'W/ icon', image: 'W/ image', stats: 'Stats', chart: 'Chart' }

/** 一轮 5 秒：0.6 秒打开，4.4 秒收起。 */
const scripted = (time: number) => {
  const t = time % 5
  return t >= 0.6 && t < 4.4
}

export function Demo(props: Omit<TooltipRichContentProps, 'children'>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [manual, setManual] = useState(false)
  const content = props.content ?? defaults.content

  useFrameLoop(
    host,
    ({ time }) => {
      if (!manual) setAuto(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4" onPointerEnter={() => setManual(true)}>
      <div className="flex flex-col items-center gap-3 pt-[min(30vh,260px)]">
        <TooltipRichContent {...props} open={manual ? undefined : auto}>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-xs font-medium text-foreground shadow-xs transition-colors duration-150 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {LABELS[content] ?? 'Details'}
          </button>
        </TooltipRichContent>
        <p className="text-[11px] text-muted-foreground">Hover or focus the button</p>
      </div>
    </div>
  )
}
