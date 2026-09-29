import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ParticleButton, type ParticleButtonProps } from './particle-button'

export function Demo(props: ParticleButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  // 空闲时每 4 秒「按」一次；真实点击照常触发。减少动态效果时不自动播放。
  useFrameLoop(ref, ({ time }) => setKey(Math.floor((time + 3.5) / 4)), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <ParticleButton {...props} burstKey={key} />
        <p className="text-xs text-muted-foreground">Delivered to 3 people</p>
      </div>
    </div>
  )
}
