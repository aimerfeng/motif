import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { AiSparkleButton, type AiSparkleButtonProps } from './button-ai-sparkle'

export function Demo(props: AiSparkleButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [active, setActive] = useState(true)

  // 自动播放：每 6 秒里悬停 4 秒；用户的指针进入后交还给真实悬停。
  useFrameLoop(ref, ({ time }) => setActive(time % 6 < 4), { reducedMotion: 'static', staticTime: 2 })

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-6" onPointerEnter={() => setAuto(false)}>
      <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center">
        <div>
          <p className="text-sm font-medium text-foreground">Episode 42 · Night shift</p>
          <p className="mt-1 text-xs text-muted-foreground">No thumbnails yet. We will draft four from the key frames.</p>
        </div>
        <AiSparkleButton {...props} active={auto ? active : undefined} />
      </div>
    </div>
  )
}
