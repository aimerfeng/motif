import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ShareRevealButton, type ShareRevealButtonProps } from './button-share-reveal'

export function Demo(props: ShareRevealButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  const [manual, setManual] = useState(false)

  // 一轮 4 秒：1 秒展开，3.2 秒收起。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % 4
      setAuto(t >= 1 && t < 3.2)
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  return (
    <div ref={host} onPointerEnter={() => setManual(true)} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[360px] rounded-2xl border bg-card/70 p-6">
        <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">Field notes · 6 min read</div>
        <h2 className="text-lg font-semibold tracking-tight">Mapping tide pools at dawn</h2>
        <p className="mt-1 mb-6 text-[13px] leading-5 text-muted-foreground">
          Low tide on the north shelf exposed forty new anemone colonies. Pass it on to the survey crew.
        </p>
        <ShareRevealButton {...props} open={manual ? undefined : auto} />
      </div>
    </div>
  )
}
