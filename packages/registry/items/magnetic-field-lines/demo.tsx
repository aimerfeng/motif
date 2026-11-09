import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type RefObject } from 'react'
import { CYCLE, defaults, MagneticFieldLines, orbitPosition, type MagneticFieldLinesProps } from './magnetic-field-lines'

/** 每个周期里虚拟指针「拿着」一个磁极的时间段（秒）：之前和之后磁极都在自己的轨道上。 */
const GRAB_START = 1.6
const GRAB_END = 8.2
/** 被拿起的是第二个磁极（S 极）。 */
const HELD = 1

const clamp = (value: number) => Math.min(0.96, Math.max(0.04, value))

/**
 * 拖动的路线（画面宽高的比例，三次贝塞尔）：在 S 极此刻所在的位置拿起，往下绕过画面边上的空地再上行，
 * 松开的地方正好是它那时在轨道上的位置，回弹很轻。磁极在画面左半边时左右镜像。
 */
function pathFor(count: number) {
  const start = orbitPosition(HELD, count, GRAB_START)
  const end = orbitPosition(HELD, count, GRAB_END)
  const side = start[0] >= 0.5 ? 1 : -1
  return [start, [clamp(start[0] - 0.24 * side), clamp(start[1] + 0.35)], [clamp(end[0] + 0.2 * side), clamp(end[1] + 0.6)], end] as const
}

function bezier(path: ReturnType<typeof pathFor>, t: number, axis: 0 | 1): number {
  const u = 1 - t
  return u * u * u * path[0][axis] + 3 * u * u * t * path[1][axis] + 3 * u * t * t * path[2][axis] + t * t * t * path[3][axis]
}

/**
 * 演示用的「自动播放」：虚拟指针每个周期走到 S 极上把它拿起，沿一段弧线拖过画面再松开。
 * 真实指针一动就让位，离开页面后恢复。
 */
function useGhostPointer(hostRef: RefObject<HTMLDivElement | null>, poles: number) {
  const real = useRef(false)
  const inside = useRef(false)
  const count = Math.min(5, Math.max(2, Math.round(poles)))

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
    }
    const onLeave = () => {
      real.current = false
    }
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const target = hostRef.current?.firstElementChild
      if (!target || real.current) return
      const t = time % CYCLE
      if (t < GRAB_START || t > GRAB_END) {
        if (inside.current) target.dispatchEvent(new PointerEvent('pointerleave'))
        inside.current = false
        return
      }
      const rect = target.getBoundingClientRect()
      const u = (t - GRAB_START) / (GRAB_END - GRAB_START)
      const eased = u * u * (3 - 2 * u)
      const path = pathFor(count)
      const x = rect.left + rect.width * bezier(path, eased, 0)
      const y = rect.top + rect.height * bezier(path, eased, 1)
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }))
      inside.current = true
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
}

export function Demo(props: MagneticFieldLinesProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, props.poles ?? defaults.poles)
  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden">
      <MagneticFieldLines {...props} className="absolute inset-0" />
    </div>
  )
}
