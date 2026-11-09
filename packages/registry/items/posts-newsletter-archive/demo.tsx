import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NewsletterArchive, type NewsletterArchiveProps } from './posts-newsletter-archive'

type Scene = { selected: number | null; query: string; year: string }

const CYCLE = 12
const WORD = 'pricing'

/**
 * 一轮 12 秒（与截图的循环视频等长）：依次点开几期，输入「pricing」并在结果里挑两期，清空后切到 2025 年，再回到全部往下看。
 * 节奏全部按 useFrameLoop 的时间算，截图时的手动时钟也能复现。
 */
function scene(time: number): Scene {
  const t = time % CYCLE
  if (t < 1.9) return { selected: 64, query: '', year: 'all' }
  if (t < 3.1) return { selected: 63, query: '', year: 'all' }
  if (t < 4.0) return { selected: 62, query: '', year: 'all' }
  if (t < 6.7) {
    const typed = Math.min(WORD.length, Math.floor((t - 4.0) / 0.09) + 1)
    return { selected: t < 5.1 ? 62 : t < 5.9 ? 57 : 55, query: WORD.slice(0, typed), year: 'all' }
  }
  if (t < 7.1) {
    const left = Math.max(0, WORD.length - Math.floor((t - 6.7) / 0.05) - 1)
    return { selected: 64, query: WORD.slice(0, left), year: 'all' }
  }
  if (t < 7.9) return { selected: 54, query: '', year: '2025' }
  if (t < 8.7) return { selected: 53, query: '', year: '2025' }
  if (t < 10.2) return { selected: 60, query: '', year: 'all' }
  return { selected: 59, query: '', year: 'all' }
}

const same = (a: Scene, b: Scene) => a.selected === b.selected && a.query === b.query && a.year === b.year

/** 演示：自动播放一段真实的浏览过程；用户一按下指针或按键就交还控制。 */
export function Demo(props: NewsletterArchiveProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Scene>(() => scene(0))
  const [manual, setManual] = useState<Scene | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scene(time)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const state = manual ?? auto
  const takeOver = () => setManual((prev) => prev ?? auto)

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
      <NewsletterArchive
        {...props}
        selected={state.selected}
        onSelectedChange={(selected) => setManual((prev) => ({ ...(prev ?? auto), selected }))}
        query={state.query}
        onQueryChange={(query) => setManual((prev) => ({ ...(prev ?? auto), query }))}
        year={state.year}
        onYearChange={(year) => setManual((prev) => ({ ...(prev ?? auto), year }))}
      />
    </div>
  )
}
