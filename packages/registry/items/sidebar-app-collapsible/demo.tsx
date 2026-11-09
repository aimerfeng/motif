// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/sidebar-07/page.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AppSidebar, defaults, type AppSidebarProps } from './sidebar-app-collapsible'

/** 自动播放：每 4 秒在展开和图标栏之间切换一次；用户自己点了触发器就停下。 */
const STEP = 4

const STATS = [
  { label: 'Requests today', value: '184,209', delta: '+12.4%' },
  { label: 'p95 latency', value: '212 ms', delta: '-8 ms' },
  { label: 'Cache hit rate', value: '91.3%', delta: '+1.1%' },
]

const BARS = [38, 52, 47, 61, 58, 72, 66, 81, 77, 69, 88, 92, 84, 96]

const QUERIES = [
  { route: 'GET /v2/projects/:id', calls: '41,882', ms: '96 ms' },
  { route: 'POST /v2/runs', calls: '18,305', ms: '248 ms' },
  { route: 'GET /v2/models', calls: '12,770', ms: '41 ms' },
  { route: 'GET /v2/runs/:id/logs', calls: '9,214', ms: '318 ms' },
]

export function Demo(props: AppSidebarProps) {
  const host = useRef<HTMLDivElement>(null)
  const base = props.collapsed ?? defaults.collapsed
  const [auto, setAuto] = useState(base)
  const [manual, setManual] = useState<boolean | null>(null)
  const accent = props.accent ?? defaults.accent

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = Math.floor(time / STEP) % 2 === 1 ? !base : base
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <AppSidebar {...props} collapsed={manual ?? auto} onCollapsedChange={setManual}>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="flex aspect-video flex-col justify-between rounded-xl border bg-muted/50 p-4">
              <span className="text-muted-foreground text-sm">{s.label}</span>
              <div className="flex items-end justify-between gap-2">
                <span className="font-semibold text-2xl tabular-nums tracking-tight">{s.value}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{s.delta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex min-h-[100vh] flex-1 flex-col gap-6 rounded-xl border bg-muted/50 p-4 md:min-h-min md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-base">Data fetching, last 14 days</h2>
            <span className="text-muted-foreground text-xs">Updated 2 min ago</span>
          </div>
          <div className="flex h-40 items-end gap-1.5" aria-hidden="true">
            {BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ height: `${h}%`, background: accent, opacity: i === BARS.length - 1 ? 1 : 0.55 }}
              />
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr className="border-b">
                  <th className="py-2 font-medium">Route</th>
                  <th className="py-2 text-right font-medium">Calls</th>
                  <th className="py-2 text-right font-medium">p95</th>
                </tr>
              </thead>
              <tbody>
                {QUERIES.map((q) => (
                  <tr key={q.route} className="border-b last:border-0">
                    <td className="py-2.5 font-mono text-xs">{q.route}</td>
                    <td className="py-2.5 text-right tabular-nums">{q.calls}</td>
                    <td className="py-2.5 text-right text-muted-foreground tabular-nums">{q.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppSidebar>
    </div>
  )
}
