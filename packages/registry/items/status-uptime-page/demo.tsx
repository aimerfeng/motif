import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { StatusUptimePage, autoplayDays, defaults, type StatusUptimePageProps } from './status-uptime-page'

// 自动播放：悬浮卡每 1.8 秒跳到下一个有事件的日子（时间取自 useFrameLoop，截图时也能看到）；指针进入后交还给用户
const STEP = 1.8

export function Demo(props: StatusUptimePageProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [step, setStep] = useState(0)
  const targets = autoplayDays(props.variant ?? defaults.variant, props.services ?? defaults.services)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const next = Math.floor(time / STEP)
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const highlight = auto && targets.length > 0 ? (targets[step % targets.length] ?? null) : null

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto"
      style={{ background: (props.tone ?? defaults.tone) === 'light' ? '#f9fafb' : '#030712' }}
      onPointerEnter={() => setAuto(false)}
    >
      <StatusUptimePage {...props} highlight={highlight} />
    </div>
  )
}
