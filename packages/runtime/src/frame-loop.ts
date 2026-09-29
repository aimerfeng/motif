import { useEffect, useRef, type RefObject } from 'react'
import { usePrefersReducedMotion } from './reduced-motion.ts'
import { useIsActive } from './visibility.ts'

export interface FrameInfo {
  /** 累计的动画时间（秒），只在播放时前进，暂停再恢复不会跳帧。已乘以 speed。 */
  time: number
  /** 距上一帧的时间（秒），已乘以 speed，上限 0.1 秒。 */
  delta: number
}

export interface FrameLoopOptions {
  /** 时间流速倍率。 */
  speed?: number
  /**
   * 开启「减少动态效果」时的表现：
   * - static：只渲染一帧静态画面（time = staticTime），之后不再推进；
   * - slowed：继续播放，但速度降到 1/4。
   */
  reducedMotion?: 'static' | 'slowed'
  /** static 模式下渲染哪个时刻（秒），选一帧最好看的。 */
  staticTime?: number
}

/**
 * 统一的动画循环：离屏或页面隐藏时暂停，尊重「减少动态效果」，时间可以变速。
 * onFrame 每帧调用；它通过 ref 读取，不需要 useCallback。
 */
export function useFrameLoop(ref: RefObject<Element | null>, onFrame: (frame: FrameInfo) => void, options: FrameLoopOptions = {}): void {
  const { speed = 1, reducedMotion = 'static', staticTime = 0 } = options
  const active = useIsActive(ref)
  const reduced = usePrefersReducedMotion()
  const callback = useRef(onFrame)
  callback.current = onFrame
  const speedRef = useRef(speed)
  speedRef.current = reduced && reducedMotion === 'slowed' ? speed * 0.25 : speed
  const time = useRef(0)

  const frozen = reduced && reducedMotion === 'static'

  useEffect(() => {
    if (frozen) {
      time.current = staticTime
      callback.current({ time: staticTime, delta: 0 })
      return
    }
    if (!active) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, 0.1) * speedRef.current
      last = now
      time.current += delta
      callback.current({ time: time.current, delta })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, frozen, staticTime])
}
