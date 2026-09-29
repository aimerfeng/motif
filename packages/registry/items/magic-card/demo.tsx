import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { MagicCard, type MagicCardProps } from './magic-card'

const BARS = [38, 52, 44, 66, 58, 74, 62, 84, 70, 92, 78, 100]

export function Demo(props: MagicCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const entered = useRef(false)

  const card = () => box.current?.firstElementChild ?? null

  // 真实指针一动，自动播放停下并把光收回；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      card()?.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: null }))
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // 幽灵指针在卡片里画一个横向的 8 字，周期 6 秒，和循环视频等长。
  useFrameLoop(
    host,
    ({ time }) => {
      const element = card()
      if (!autoplay.current || !element) return
      const bounds = element.getBoundingClientRect()
      const phase = (time * Math.PI) / 3
      const clientX = bounds.left + bounds.width * (0.5 + 0.36 * Math.cos(phase))
      const clientY = bounds.top + bounds.height * (0.5 + 0.3 * Math.sin(phase * 2))
      if (!entered.current) {
        entered.current = true
        element.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, relatedTarget: null, clientX, clientY }))
      }
      element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div ref={box} className="w-full max-w-sm">
        <MagicCard {...props} className="rounded-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M5 20h14" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-card-foreground">Deployments</p>
              </div>
              <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">This week</span>
            </div>
            <p className="mt-6 text-4xl font-semibold tracking-tight text-card-foreground tabular-nums">
              1,284 <span className="text-sm font-normal text-emerald-400">+12.4%</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Successful releases across all projects</p>
            <div className="mt-6 flex h-20 items-end gap-1.5" aria-hidden>
              {BARS.map((height, index) => (
                <div key={index} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${height}%`, opacity: 0.35 + height / 160 }} />
              ))}
            </div>
          </div>
        </MagicCard>
      </div>
    </div>
  )
}
