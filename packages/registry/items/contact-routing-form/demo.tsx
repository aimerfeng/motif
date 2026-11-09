import { useFrameLoop } from '@motif/runtime'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { ContactRoutingForm, routingBackground, type ContactRoutingFormProps, type TopicId } from './contact-routing-form'

/** 每个话题停留的秒数：够看清字段换了哪些，又能在 8 秒的循环视频里走过三个话题。 */
const HOLD = 3.2
const TOUR: TopicId[] = ['sales', 'support', 'press', 'partners']

export function Demo(props: ContactRoutingFormProps) {
  const host = useRef<HTMLDivElement>(null)
  const manual = useRef(false)
  const [topic, setTopic] = useState<TopicId>('sales')

  // 自动播放：按帧循环的时间轮流切换话题，像访客在比较该找哪个团队。用户一动指针、按键或聚焦就停下，交还给用户。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual.current) return
      const next = TOUR[Math.floor(time / HOLD) % TOUR.length] ?? 'sales'
      setTopic((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <motion.div
      ref={host}
      layoutScroll
      className="h-full w-full overflow-y-auto"
      style={{ background: routingBackground(props.tone ?? 'dark') }}
      onPointerMove={stop}
      onPointerDown={stop}
      onWheel={stop}
      onTouchStart={stop}
      onKeyDown={stop}
      onFocus={stop}
    >
      {/* 顶对齐，和放进真实页面时一样：卡片随话题变高变矮，只有卡片下沿在动。 */}
      <ContactRoutingForm
        {...props}
        topic={topic}
        onTopicChange={(next) => {
          manual.current = true
          setTopic(next)
        }}
      />

    </motion.div>
  )
}
