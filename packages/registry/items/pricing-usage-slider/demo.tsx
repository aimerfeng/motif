import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PricingUsageSlider, type PricingUsageSliderProps } from './pricing-usage-slider'

export function Demo(props: PricingUsageSliderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0.52)
  const [manual, setManual] = useState(false)

  // 演示里的自动播放：滑块缓慢来回扫过整个用量范围；用户自己拖过之后不再干预。
  useFrameLoop(
    ref,
    ({ time }) => {
      if (manual) return
      setPosition(0.5 + 0.42 * Math.sin(time * 0.8 + 0.1))
    },
    { reducedMotion: 'static', staticTime: 0.6 },
  )

  return (
    <div ref={ref} className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f4f2ee' : '#07080d' }}>
      <PricingUsageSlider
        {...props}
        position={position}
        onPositionChange={(p) => {
          setManual(true)
          setPosition(p)
        }}
      />
    </div>
  )
}
