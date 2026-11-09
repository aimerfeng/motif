import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PricingCreditPacks, type Estimate, type JobId, type PricingCreditPacksProps } from './pricing-credit-packs'

/** 自动播放的剧本：每 3 秒换一种任务，停一下再把用量从 from 拖到 to，推荐的包随之移动。 */
const SCRIPT: { job: JobId; from: number; to: number }[] = [
  { job: 'image', from: 200, to: 900 },
  { job: 'video', from: 50, to: 220 },
  { job: 'voice', from: 300, to: 1150 },
  { job: 'upscale', from: 3000, to: 350 },
]
const PHASE = 3

function nice(value: number) {
  const step = value < 20 ? 1 : value < 100 ? 5 : value < 1000 ? 10 : value < 5000 ? 50 : 100
  return Math.round(value / step) * step
}

function scripted(time: number): Estimate {
  const index = Math.floor(time / PHASE) % SCRIPT.length
  const step = SCRIPT[index]!
  const local = time % PHASE
  // 换任务后先停 0.5 秒，再用 1.6 秒拖到目标（对数插值，和对数刻度的滑块一致），最后停住。
  const p = Math.min(1, Math.max(0, (local - 0.5) / 1.6))
  const eased = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2
  const volume = Math.exp(Math.log(step.from) + (Math.log(step.to) - Math.log(step.from)) * eased)
  return { job: step.job, volume: nice(volume) }
}

/**
 * 演示：没人操作时按剧本切换任务类型、拖动用量，海报和循环视频里能看到推荐框在卡片间移动。
 * 只要焦点进入演示、或者指针在里面按下（以及组件回调 onEstimateChange），自动播放就停在当前这一帧，交还控制：
 * 否则键盘用户 Tab 进单选组后，选中项和漫游 tabIndex 会每 3 秒从焦点底下跳走。
 */
export function Demo(props: PricingCreditPacksProps) {
  const host = useRef<HTMLDivElement>(null)
  const manual = useRef(false)
  const [estimate, setEstimate] = useState<Estimate>(() => scripted(0))

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual.current) return
      const next = scripted(time)
      setEstimate((current) => (current.job === next.job && current.volume === next.volume ? current : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div
      ref={host}
      onFocus={stop}
      onPointerDown={stop}
      className="h-full w-full overflow-y-auto"
      style={{ background: props.tone === 'light' ? '#f4f2ed' : '#0b0b0d' }}
    >
      <PricingCreditPacks
        {...props}
        className="min-h-full"
        job={estimate.job}
        volume={estimate.volume}
        onEstimateChange={(next) => {
          manual.current = true
          setEstimate(next)
        }}
      />
    </div>
  )
}
