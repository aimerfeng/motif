import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { WorkflowNodeCanvas, type WorkflowNodeCanvasProps } from './workflow-node-canvas'

export function Demo(props: WorkflowNodeCanvasProps) {
  const host = useRef<HTMLDivElement>(null)
  const [nudge, setNudge] = useState<{ index: number; x: number; y: number } | null>({ index: 1, x: 0, y: 0 })
  const stopped = useRef(false)

  // 自动播放：中间的节点缓慢上下漂移，连线跟着弯；用户一按下就停止
  useFrameLoop(
    host,
    ({ time }) => {
      if (stopped.current) return
      const x = Math.round(Math.sin(time * 0.7) * 24)
      const y = Math.round(Math.sin(time * 0.9) * 70 + 40)
      setNudge((prev) => (prev && prev.x === x && prev.y === y ? prev : { index: 1, x, y }))
    },
    { reducedMotion: 'static', staticTime: 1.6 },
  )

  const stop = () => {
    if (stopped.current) return
    stopped.current = true
    setNudge(null)
  }

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDown={stop} onKeyDown={stop}>
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Automations</p>
        <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Wire up a webhook, a query and a branch without writing glue code
        </h2>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Drag steps around, add new ones from the toolbar, and every run is logged against the version you shipped.
        </p>
        <div className="mt-8">
          <WorkflowNodeCanvas {...props} nudge={nudge} />
        </div>
      </section>
    </div>
  )
}
