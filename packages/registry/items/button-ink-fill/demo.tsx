import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { ButtonInkFill, type ButtonInkFillProps } from './button-ink-fill'

/** 派发一个合成鼠标事件，模拟指针进出、移动。 */
function fire(target: Element, type: string, x: number, y: number, related: Element | null) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, relatedTarget: related }))
}

export function Demo(props: ButtonInkFillProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const inside = useRef(false)

  // 真实指针一动就停下自动播放；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (event.isTrusted) autoplay.current = false
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 虚拟指针每 4 秒从左下角进入、在按钮里慢慢划过、从右上角离开。时间取自帧循环，录屏时也对得上。
  useFrameLoop(
    host,
    ({ time }) => {
      const root = host.current
      const button = root?.querySelector('button')
      if (!autoplay.current || !root || !button) return
      const rect = button.getBoundingClientRect()
      const t = time % 4
      const active = t >= 0.6 && t < 2.8
      const p = Math.min(Math.max((t - 0.6) / 2.2, 0), 1)
      const x = rect.left + rect.width * (0.12 + 0.76 * p)
      const y = rect.top + rect.height * (0.85 - 0.7 * p)
      if (active && !inside.current) {
        inside.current = true
        // React 的 enter/leave 都从 mouseout 推导（from=target, to=relatedTarget）。
        fire(root, 'mouseout', x, y, button)
      } else if (!active && inside.current) {
        inside.current = false
        fire(button, 'mouseout', rect.right - 2, rect.top + 2, root)
      } else if (active) {
        fire(button, 'mousemove', x, y, null)
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Issue 14 · Autumn</p>
        <ButtonInkFill {...props} />
        <p className="text-xs text-muted-foreground">Delivered every other Sunday. Unsubscribe anytime.</p>
      </div>
    </div>
  )
}
