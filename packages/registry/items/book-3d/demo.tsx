import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InteractiveBook, type InteractiveBookProps } from './book-3d'

const ease = (x: number) => x * x * (3 - 2 * x)

/** 一轮 6 秒：虚拟指针从书右侧慢慢移到左侧（翻开），停一下，再移开（合上）。 */
function scripted(time: number) {
  const t = time % 6
  if (t < 0.6) return 0
  if (t < 2.4) return ease((t - 0.6) / 1.8)
  if (t < 3.6) return 1
  if (t < 5.2) return 1 - ease((t - 3.6) / 1.6)
  return 0
}

export function Demo(props: InteractiveBookProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(0)
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setAuto(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="flex h-full w-full flex-col items-center justify-center gap-10 bg-background p-6" onPointerEnter={() => setManual(true)}>
      <InteractiveBook {...props} progress={manual ? undefined : auto} className="h-auto w-auto" />
      <div className="text-center">
        <div className="text-sm font-semibold text-foreground">Spring Field Notes</div>
        <div className="mt-1 text-xs text-muted-foreground">Hover the book to leaf through it</div>
      </div>
    </div>
  )
}
