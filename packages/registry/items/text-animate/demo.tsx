import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TextAnimate, type TextAnimateProps } from './text-animate'

/** 演示每隔一个周期重播一次入场，循环视频的长度与它一致。 */
const PERIOD = 5

export function Demo(props: TextAnimateProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(
    host,
    ({ time }) => {
      const n = Math.floor(time / PERIOD)
      setCycle(n)
      if (stage.current) stage.current.style.opacity = String(Math.min(1, (PERIOD - (time - n * PERIOD)) / 0.4))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )

  const { delay = 0 } = props

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div ref={stage} key={`${cycle}:${JSON.stringify(props)}`} className="flex max-w-2xl flex-col items-center text-center">
        <p className="mb-5 text-xs font-medium tracking-widest text-primary uppercase">Typography</p>
        <TextAnimate {...props} as="h1" className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl" />
        <TextAnimate
          as="p"
          animation="blurIn"
          by="word"
          duration={0.5}
          spread={0.7}
          delay={delay + 0.9}
          text="Set your headlines in motion without giving up legibility, rhythm or restraint."
          className="mt-5 max-w-md text-base text-pretty text-muted-foreground"
        />
      </div>
    </div>
  )
}
