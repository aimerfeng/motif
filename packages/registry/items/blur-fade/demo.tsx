import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { BlurFade, type BlurFadeProps } from './blur-fade'

/** 演示每隔一个周期重播一次入场，循环视频的长度与它一致。 */
const PERIOD = 5
const STAGGER = 0.14

export function Demo(props: BlurFadeProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(
    host,
    ({ time }) => {
      const n = Math.floor(time / PERIOD)
      setCycle(n)
      // 周期末尾淡出，下一轮重新入场时不会突兀地跳变。
      if (stage.current) stage.current.style.opacity = String(Math.min(1, (PERIOD - (time - n * PERIOD)) / 0.4))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )

  const { text, delay = 0, ...rest } = props
  const at = (index: number) => ({ ...rest, delay: delay + index * STAGGER })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div ref={stage} key={`${cycle}:${JSON.stringify(props)}`} className="flex max-w-xl flex-col items-center text-center">
        <BlurFade {...at(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Changelog / v2.4
          </span>
        </BlurFade>
        <BlurFade {...at(1)} className="mt-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">{text}</h1>
        </BlurFade>
        <BlurFade {...at(2)} className="mt-4">
          <p className="max-w-md text-base text-pretty text-muted-foreground">Transitions, springs and small reveals that make an interface feel considered rather than assembled.</p>
        </BlurFade>
        <BlurFade {...at(3)} className="mt-8">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Read the notes
            </button>
            <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground">
              Browse effects
            </button>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
