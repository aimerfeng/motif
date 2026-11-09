import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { GalleryGridBlock, type GalleryGridBlockProps } from './gallery-filter-lightbox'

// 自动播放脚本（秒）：切换分类、点开一张、翻一页、关闭，循环。
const SCRIPT: { at: number; filter: string; selected: number | null }[] = [
  { at: 0, filter: 'All', selected: null },
  { at: 1.4, filter: 'Architecture', selected: null },
  { at: 2.8, filter: 'Art', selected: null },
  { at: 4.0, filter: 'All', selected: null },
  { at: 4.8, filter: 'All', selected: 2 },
  { at: 6.2, filter: 'All', selected: 3 },
  { at: 7.4, filter: 'All', selected: null },
]
const PERIOD = 9

export function Demo(props: GalleryGridBlockProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [beat, setBeat] = useState(0)
  // 用户接手后由这里保存状态，从自动播放的当前画面继续。
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const t = time % PERIOD
      let next = 0
      SCRIPT.forEach((s, i) => {
        if (t >= s.at) next = i
      })
      setBeat((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const cue = SCRIPT[beat]!
  const takeOver = () => {
    if (manual) return
    setFilter(cue.filter)
    setSelected(cue.selected)
    setManual(true)
  }
  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background"
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <GalleryGridBlock
        {...props}
        filter={manual ? filter : cue.filter}
        selectedId={manual ? selected : cue.selected}
        onFilterChange={setFilter}
        onSelect={setSelected}
      />
    </div>
  )
}
