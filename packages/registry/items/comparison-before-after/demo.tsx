import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ComparisonBeforeAfter, type CompareSide, type ComparisonBeforeAfterProps } from './comparison-before-after'

/** 一轮 8 秒：先看旧做法，1.2 秒时切到新做法（节省时间开始累加），5.6 秒时切回去。 */
function scripted(time: number): CompareSide {
  const t = time % 8
  return t >= 1.2 && t < 5.6 ? 'after' : 'before'
}

export function Demo(props: ComparisonBeforeAfterProps) {
  const host = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<CompareSide>('before')
  // 用户一按下指针或键盘就停止自动播放，之后完全由用户操作。
  const manual = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual.current) return
      const next = scripted(time)
      setFocus((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div ref={host} className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f3f2ed' : '#0b0c0f' }} onPointerDownCapture={stop} onKeyDownCapture={stop}>
      <ComparisonBeforeAfter {...props} focus={focus} onFocusChange={setFocus} className="flex min-h-full flex-col justify-center" />
    </div>
  )
}
