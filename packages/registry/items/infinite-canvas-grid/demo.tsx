import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { InfiniteGrid, type InfiniteGridHandle, type InfiniteGridProps } from './infinite-canvas-grid'

// 自动播放：画布沿一条缓慢弯曲的路线漂移，每 6 秒被「甩」一下，展示惯性滑行和速度倾斜。
// 用户一旦拖动、滚动或按键就交还控制权。
const FLICK_PERIOD = 6
const FLICK_AT = 2.5

export function Demo(props: InfiniteGridProps) {
  const host = useRef<HTMLDivElement>(null)
  const grid = useRef<InfiniteGridHandle>(null)
  const manual = useRef(false)

  useFrameLoop(
    host,
    ({ time, delta }) => {
      const control = grid.current
      if (manual.current || !control || delta <= 0) return
      const vx = -46 - 22 * Math.cos(time * 0.5)
      const vy = -18 + 28 * Math.sin(time * 0.37)
      control.panBy(vx * delta, vy * delta)
      const before = Math.floor((time - delta - FLICK_AT) / FLICK_PERIOD)
      const after = Math.floor((time - FLICK_AT) / FLICK_PERIOD)
      if (after !== before && after >= 0) control.fling(-26, after % 2 === 0 ? -12 : 10)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const takeOver = () => {
    manual.current = true
  }

  return (
    <div ref={host} className="relative h-full w-full" onPointerDownCapture={takeOver} onWheelCapture={takeOver} onKeyDownCapture={takeOver}>
      <InfiniteGrid {...props} controlRef={grid} className="min-h-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4">
        <p className="rounded-full bg-neutral-950/85 px-4 py-2 text-center text-xs font-medium tracking-tight text-white shadow-lg shadow-black/10">
          Drag, scroll or flick to browse the collection
        </p>
      </div>
    </div>
  )
}
