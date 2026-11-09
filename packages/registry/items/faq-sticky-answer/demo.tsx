import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { FaqStickyAnswer, faqCount, type FaqStickyAnswerProps } from './faq-sticky-answer'

/** 每个问题停留的秒数。 */
const HOLD = 2.4
/**
 * 自动播放的顺序：像读者一样往下跳着看，先把带图表的几题和三个分组都走一遍，再补上其余的。
 * 循环视频边播边往下滚，往下走的顺序让高亮的那一行始终留在画面里。
 */
const TOUR = [0, 2, 4, 8, 9, 11, 1, 3, 5, 6, 7, 10]
/** 和组件的分栏阈值一致：更窄时是手风琴，自动展开收起会让正在滚动的页面跳动，所以不播。 */
const SPLIT = 860

export function Demo(props: FaqStickyAnswerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(0)
  const manual = useRef(false)

  // 演示里的自动播放：按帧循环的时间逐个切换问题。用户一动指针、滚动、触摸或聚焦就停，答案留给用户读。
  useFrameLoop(
    ref,
    ({ time }) => {
      const el = ref.current
      if (manual.current || !el) return
      const next = el.clientWidth < SPLIT ? 0 : (TOUR[Math.floor(time / HOLD) % TOUR.length] ?? 0) % faqCount
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-y-auto"
      style={{ background: props.tone === 'light' ? '#f5f4f0' : '#0b0d10' }}
      onPointerMove={stop}
      onPointerDown={stop}
      onWheel={stop}
      onTouchStart={stop}
      onFocus={stop}
    >
      <FaqStickyAnswer
        {...props}
        active={active}
        onActiveChange={(next) => {
          manual.current = true
          setActive(next)
        }}
      />
    </div>
  )
}
