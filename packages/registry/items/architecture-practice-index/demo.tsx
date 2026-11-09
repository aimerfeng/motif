import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { ArchitecturePracticeIndex, defaults, type ArchitecturePracticeIndexProps } from './architecture-practice-index'
import { rowsFor, type Filter } from './sections'
import { themeStyle } from './theme'

// 自动播放：像有人在索引表上从上往下慢慢移动指针，每 3 秒换一行，平面图随之重画。
// 只走当前筛选下看得见的前六行，筛选掉的项目不会出现在面板里。
const STEP = 3
const tourOf = (filter: Filter) => rowsFor(filter).slice(0, 6).map((p) => p.id)

export function Demo(props: ArchitecturePracticeIndexProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const tour = useRef<string[]>(tourOf('all'))
  const [preview, setPreview] = useState<string | null>(tour.current[0] ?? null)

  // 用户真的动了指针就把控制权交还给他
  useEffect(() => {
    const element = host.current
    if (!element) return
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setPreview(null)
    }
    element.addEventListener('pointermove', stop)
    element.addEventListener('pointerdown', stop)
    return () => {
      element.removeEventListener('pointermove', stop)
      element.removeEventListener('pointerdown', stop)
    }
  }, [])

  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const ids = tour.current
      const next = ids[Math.floor(time / STEP) % ids.length] ?? null
      setPreview((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const options = { ...defaults, ...props }
  return (
    <div ref={host} className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: themeStyle(options).background }}>
      <ArchitecturePracticeIndex
        {...props}
        previewId={preview}
        onFilterChange={(filter) => {
          tour.current = tourOf(filter)
        }}
      />
    </div>
  )
}
