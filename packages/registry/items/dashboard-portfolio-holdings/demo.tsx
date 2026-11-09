import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DashboardPortfolioHoldings, type DashboardPortfolioHoldingsProps } from './dashboard-portfolio-holdings'

/** 自动播放：十字线缓慢扫过图表，并轮流高亮一只基金；用户一动指针就停。 */
const SWEEP = 8

export function Demo(props: DashboardPortfolioHoldingsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [frame, setFrame] = useState<{ index: number; fund: number | null }>({ index: 40, fund: null })
  const points = props.range === '30d' ? 30 : 57

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const phase = (time % SWEEP) / SWEEP
      const index = Math.round((0.5 - 0.5 * Math.cos(phase * Math.PI * 2)) * (points - 1) * 0.9 + (points - 1) * 0.05)
      const slot = Math.floor(time / SWEEP) % 4
      const fund = slot === 0 ? null : slot - 1
      setFrame((f) => (f.index === index && f.fund === fund ? f : { index, fund }))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerMove={() => auto && setAuto(false)}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">Investments</h1>
          <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">Updated 09:30</span>
        </div>
        <DashboardPortfolioHoldings {...props} hoverIndex={auto ? frame.index : null} highlight={auto ? frame.fund : null} />
      </div>
    </div>
  )
}
