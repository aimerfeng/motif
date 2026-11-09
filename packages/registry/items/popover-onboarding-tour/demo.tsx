import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PopoverOnboardingTour, type PopoverOnboardingTourProps } from './popover-onboarding-tour'

type Auto = { open: boolean; step: number }

/** 10 秒一轮：0.6s 开始导览 -> 每 1.8s 走一步 -> 9.2s 关闭。 */
function scripted(time: number, count: number): Auto {
  const t = time % 10
  if (t < 0.6 || t >= 9.2) return { open: false, step: 0 }
  return { open: true, step: Math.min(count - 1, Math.floor((t - 0.6) / 1.8)) }
}

export function Demo(props: PopoverOnboardingTourProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>({ open: false, step: 0 })
  // 指针一进来就交给用户，自动播放不再回来。
  const [manual, setManual] = useState(false)
  const count = Math.round(props.steps ?? 4)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, count)
      setAuto((cur) => (cur.open === next.open && cur.step === next.step ? cur : next))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const control = manual ? {} : { open: auto.open, step: auto.step }

  return (
    <div
      ref={host}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-background px-4"
      onPointerDown={() => setManual(true)}
      onPointerMove={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      <PopoverOnboardingTour key={manual ? 'manual' : 'auto'} {...props} {...control} />
    </div>
  )
}
