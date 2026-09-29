import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TextEffect, type TextEffectProps } from './text-effect'

// 每 8 秒一轮：显示 5.6 秒后收起，再重新入场，海报和循环视频里都能看到入场与退场。
const CYCLE = 8
const VISIBLE = 5.6

export function Demo(props: TextEffectProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const next = time % CYCLE < VISIBLE
      setShown((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-10">
      <div className="w-full max-w-2xl">
        <p className="mb-5 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Journal · No. 14
        </p>
        <div className="min-h-[7.5rem]">
          <TextEffect {...props} as="h2" trigger={shown} className="text-4xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-5xl" />
        </div>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Notes from the studio on motion, typography and the small decisions that add up to a product that feels finished.
        </p>
      </div>
    </div>
  )
}
