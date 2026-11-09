import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type RefObject } from 'react'
import { LifeAutomaton, type LifeAutomatonProps } from './life-automaton'

// 和循环视频一样长：每 10 秒里，虚拟指针在 4.4–7.6 秒之间划过画面撒一笔，海报（第 3 秒）里没有它。
const CYCLE = 10
const STROKE_START = 4.4
const STROKE_END = 7.6

/** 演示用的「自动播放」：没有真实指针时派发合成的 pointermove；真实指针一动就让位。 */
function useGhostStroke(layerRef: RefObject<HTMLDivElement | null>, cursorRef: RefObject<HTMLDivElement | null>) {
  const real = useRef(false)
  const painting = useRef(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!event.isTrusted) return
      real.current = true
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [cursorRef])

  useFrameLoop(
    layerRef,
    ({ time }) => {
      const layer = layerRef.current
      const cursor = cursorRef.current
      if (!layer || !cursor || real.current) return
      const local = time % CYCLE
      const p = (local - STROKE_START) / (STROKE_END - STROKE_START)
      // 指针只在弧线中段落笔，两头淡入淡出。
      const down = p > 0.08 && p < 0.92
      if (painting.current && !down) {
        // 一笔结束就告诉组件指针离开了，下一笔从新起点落笔，不和这一笔的终点连成一条线。
        // pointerleave 本身不冒泡，这里让它冒泡到组件的根元素上。
        layer.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
      }
      painting.current = down
      if (p < 0 || p > 1) {
        cursor.style.opacity = '0'
        return
      }
      const rect = layer.getBoundingClientRect()
      const eased = p * p * (3 - 2 * p)
      // 一道从左下到右上的缓弧。
      const x = rect.width * (0.22 + 0.56 * eased)
      const y = rect.height * (0.68 - 0.36 * eased + 0.12 * Math.sin(eased * Math.PI * 2))
      cursor.style.opacity = String(Math.min(1, p / 0.12, (1 - p) / 0.12))
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (down) layer.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }))
    },
    { reducedMotion: 'static' },
  )
}

export function Demo(props: LifeAutomatonProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostStroke(layerRef, cursorRef)

  return (
    <LifeAutomaton {...props} className="h-full w-full">
      <div ref={layerRef} className="absolute inset-0" aria-hidden>
        {/* 虚拟光标：循环视频里看得出是指针在撒细胞。够大、描深边加投影，叠在刚亮起的白色细胞上也认得出。 */}
        <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0">
          <svg
            viewBox="0 0 20 24"
            className="h-[36px] w-[30px] -translate-x-[3px] -translate-y-[3px]"
            style={{ filter: 'drop-shadow(0 2px 2px rgb(0 0 0 / 0.75)) drop-shadow(0 0 5px rgb(0 0 0 / 0.5))' }}
            fill="#fff"
            stroke="#0b0b10"
            strokeWidth="1.7"
            strokeLinejoin="round"
          >
            <path d="M2.2 2.2v16.6l4.3-3.9 3 6.4 3-1.4-3-6.3h6z" />
          </svg>
        </div>
      </div>
    </LifeAutomaton>
  )
}
