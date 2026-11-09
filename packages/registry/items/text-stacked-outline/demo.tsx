import { useFrameLoop } from '@motif/runtime'
import { frame, useMotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { StackedOutlineText, type StackedOutlineTextProps } from './stacked-outline-text'

// 自动播放：文字在几个点之间快速甩动，再停一会儿，让叠影弹回字形。
const WAYPOINTS: [number, number][] = [
  [0, 0],
  [-0.1, -0.08],
  [0.1, 0.06],
  [-0.02, 0.1],
  [0.08, -0.08],
  [0, 0],
]
const MOVE = 0.45
const HOLD = 0.75

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function scripted(time: number): [number, number] {
  const segment = MOVE + HOLD
  const count = WAYPOINTS.length - 1
  const t = time % (segment * count)
  const index = Math.min(Math.floor(t / segment), count - 1)
  const local = Math.min((t - index * segment) / MOVE, 1)
  const [ax, ay] = WAYPOINTS[index]!
  const [bx, by] = WAYPOINTS[index + 1]!
  const k = ease(local)
  return [ax + (bx - ax) * k, ay + (by - ay) * k]
}

export function Demo(props: StackedOutlineTextProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual || !host.current) return
      const { width, height } = host.current.getBoundingClientRect()
      const [fx, fy] = scripted(time)
      // 在 motion 自己的帧批次里写入：useVelocity 只认 30ms 内的更新，30fps 录屏时在外部写会读到 0。
      frame.update(() => {
        x.set(fx * width)
        y.set(fy * height)
      })
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full min-w-0 overflow-hidden" onPointerDown={() => setManual(true)}>
      <StackedOutlineText {...props} motionX={x} motionY={y} active={!manual} />
    </div>
  )
}
