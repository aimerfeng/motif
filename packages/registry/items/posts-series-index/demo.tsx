import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PostsSeriesIndex, SERIES, type PostsSeriesIndexProps, type SeriesPart } from './posts-series-index'

const CYCLE = 8
// 读者已经读完前三篇；之后每隔几秒读完一篇，进度条和「继续」按钮跟着往前走。
const STAGES = [3, 4, 5].map((n) => SERIES.slice(0, n).map((p) => p.id))
const stageAt = (time: number) => {
  const t = time % CYCLE
  return t < 2.6 ? 0 : t < 5.4 ? 1 : 2
}

/** 演示：按 useFrameLoop 的时间自动勾选下一篇；用户一按下指针或按键就交还控制。 */
export function Demo(props: PostsSeriesIndexProps) {
  const host = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState<string[]>(STAGES[0])
  const stage = useRef(0)
  const touched = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (touched.current) return
      const s = stageAt(time)
      if (s === stage.current) return
      stage.current = s
      setDone(STAGES[s])
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const take = (ids: string[]) => {
    touched.current = true
    setDone(ids)
  }
  const openPart = (part: SeriesPart) => take(done.includes(part.id) ? done : [...done, part.id])

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background"
      onPointerDown={() => (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <PostsSeriesIndex {...props} completed={done} onCompletedChange={take} onOpenPart={openPart} />
    </div>
  )
}
