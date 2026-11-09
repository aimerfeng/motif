import { useFrameLoop } from '@motif/runtime'
import { useMemo, useRef, useState } from 'react'
import { ContributionHeatmap, sampleActivity, type ContributionHeatmapProps } from './contribution-heatmap'

const PERIOD = 10

export function Demo(props: ContributionHeatmapProps) {
  const host = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const levels = Math.round(props.levels ?? 4)
  const data = useMemo(() => sampleActivity(props.seed ?? 7, levels), [props.seed, levels])
  // 自动播放的虚拟指针只停在有活动的日子上，沿着时间轴往右走。
  const busy = useMemo(() => data.filter((d) => d.level >= Math.max(1, levels - 1)), [data, levels])

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const nextCycle = Math.floor(time / PERIOD)
      setCycle((c) => (c === nextCycle ? c : nextCycle))
      const t = time % PERIOD
      const stop = Math.floor(((t - 2.2) / (PERIOD - 2.8)) * 9)
      const next = t < 2.2 || stop >= 9 ? null : (busy[Math.floor((stop * busy.length) / 9)]?.date ?? null)
      setActive((a) => (a === next ? a : next))
    },
    { reducedMotion: 'static', staticTime: 5.4 },
  )

  return (
    <div
      ref={host}
      onPointerEnter={() => setManual(true)}
      className="flex h-full w-full items-center justify-center bg-background p-4"
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}
    >
      <section className="w-max max-w-full rounded-xl border bg-card p-4 text-card-foreground shadow-lg shadow-black/20 sm:p-5">
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-sm font-semibold">Contributions</h2>
          <span className="text-xs text-muted-foreground">mira-okafor · 2025</span>
        </header>
        <ContributionHeatmap key={manual ? 'manual' : cycle} {...props} data={data} activeDate={manual ? null : active} />
      </section>
    </div>
  )
}
