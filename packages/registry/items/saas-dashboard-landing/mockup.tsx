// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/ui/mockup.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { Icon } from './parts'

/** 平滑折线：把一组 0-1 的值变成 SVG 的三次贝塞尔路径。 */
function smoothPath(values: number[], width: number, height: number, pad = 12) {
  const step = width / (values.length - 1)
  const points = values.map((v, i) => [i * step, pad + (1 - v) * (height - pad * 2)] as const)
  let d = `M${points[0]![0]},${points[0]![1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!
    const [x1, y1] = points[i]!
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

const CURRENT = [0.62, 0.66, 0.64, 0.7, 0.68, 0.74, 0.72, 0.78, 0.8, 0.79, 0.84, 0.83, 0.87, 0.9, 0.89, 0.92]
const PREVIOUS = [0.6, 0.58, 0.63, 0.55, 0.5, 0.57, 0.52, 0.48, 0.5, 0.44, 0.47, 0.42, 0.46, 0.4, 0.43, 0.41]

const RELEASES = [
  { version: '2.41.0', channel: 'production', ramp: '100%', crash: '99.94%', status: 'Healthy', tone: 'ok' },
  { version: '2.41.1-rc2', channel: 'canary', ramp: '25%', crash: '99.91%', status: 'Ramping', tone: 'info' },
  { version: '2.40.3', channel: 'production', ramp: '0%', crash: '99.62%', status: 'Rolled back', tone: 'bad' },
  { version: '2.40.2', channel: 'production', ramp: '100%', crash: '99.93%', status: 'Healthy', tone: 'ok' },
]

const TONES: Record<string, string> = {
  ok: 'bg-emerald-500/15 text-emerald-500',
  info: 'bg-sky-500/15 text-sky-500',
  bad: 'bg-rose-500/15 text-rose-500',
}

const KPIS = [
  { label: 'Crash-free sessions', value: '99.94%', delta: '+0.31', good: true },
  { label: 'p95 latency', value: '212 ms', delta: '-18 ms', good: true },
  { label: 'Error budget left', value: '82%', delta: '6.1 d', good: true },
  { label: 'Adoption', value: '64%', delta: '+9.4', good: true },
]

/** 发布健康仪表盘：整个「产品截图」都是 JSX + SVG，没有位图。 */
export function DashboardMock({ brand, className }: { brand: string; className?: string }) {
  const W = 640
  const H = 190
  const current = smoothPath(CURRENT, W, H)
  const previous = smoothPath(PREVIOUS, W, H)
  return (
    <div className={cn('@container/mock overflow-hidden rounded-[calc(var(--radius)*1.4)] border border-border bg-card text-left shadow-[0_40px_120px_-30px_rgb(0_0_0/0.55)]', className)}>
      {/* 窗口栏 */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="mx-auto flex h-6 w-full max-w-[280px] items-center justify-center gap-1.5 rounded-md bg-foreground/[0.05] text-[11px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          <Icon name="shield" className="size-3" />
          app.{brand.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'kestrel'}.dev/releases
        </span>
        <span className="w-10 @lg/mock:w-14" aria-hidden />
      </div>
      <div className="flex min-h-0">
        {/* 侧栏 */}
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-border p-3 text-[12px] text-muted-foreground @2xl/mock:flex" aria-hidden>
          <div className="mb-3 flex items-center gap-2 px-2 py-1 text-foreground">
            <span className="grid size-5 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">{brand.slice(0, 1).toUpperCase()}</span>
            <span className="font-medium">{brand}</span>
          </div>
          {[
            ['pulse', 'Releases', true],
            ['trace', 'Sessions', false],
            ['bell', 'Alerts', false],
            ['flag', 'Flags', false],
            ['layers', 'Projects', false],
            ['gear', 'Settings', false],
          ].map(([icon, label, active]) => (
            <span key={label as string} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5', active && 'bg-foreground/[0.07] text-foreground')}>
              <Icon name={icon as string} className="size-3.5" />
              {label as string}
            </span>
          ))}
          <div className="mt-auto rounded-lg border border-border bg-foreground/[0.03] p-2.5 text-[11px] leading-snug">
            <span className="text-foreground">Ramp paused</span>
            <br />
            2.40.3 burned 4x budget at 5%.
          </div>
        </aside>
        {/* 主区 */}
        <div className="min-w-0 flex-1 p-4 @2xl/mock:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground @2xl/mock:text-sm">Release 2.41.0</p>
              <p className="truncate text-[11px] text-muted-foreground">production · deployed 3h ago by ci-main</p>
            </div>
            <span className="hidden shrink-0 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground @lg/mock:block">Last 24 hours</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 @2xl/mock:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-border bg-foreground/[0.025] p-3">
                <p className="truncate text-[10.5px] text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-foreground @2xl/mock:text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  {kpi.value}
                </p>
                <p className="text-[10.5px] text-emerald-500">{kpi.delta}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-border bg-foreground/[0.025] p-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-foreground">Crash-free sessions</span>
              <span className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <i className="h-0.5 w-3 rounded bg-primary" /> 2.41.0
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-0.5 w-3 rounded bg-foreground/35" /> 2.40.3
                </span>
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-28 w-full @2xl/mock:h-36" aria-hidden>
              <defs>
                <linearGradient id="kestrel-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--primary)" stopOpacity="0.32" />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((y) => (
                <line key={y} x1="0" x2={W} y1={y * H} y2={y * H} stroke="currentColor" strokeOpacity="0.09" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={`${current} L${W},${H} L0,${H} Z`} fill="url(#kestrel-area)" />
              <path d={previous} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <path d={current} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="mt-3 hidden overflow-hidden rounded-lg border border-border text-[11px] @lg/mock:block">
            <div className="grid grid-cols-[1.3fr_1fr_.6fr_.8fr_.9fr] gap-2 border-b border-border bg-foreground/[0.03] px-3 py-1.5 text-muted-foreground">
              <span>Release</span>
              <span>Channel</span>
              <span>Ramp</span>
              <span>Crash-free</span>
              <span>Status</span>
            </div>
            {RELEASES.map((r) => (
              <div key={r.version} className="grid grid-cols-[1.3fr_1fr_.6fr_.8fr_.9fr] items-center gap-2 border-b border-border px-3 py-1.5 last:border-0">
                <span className="truncate text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                  {r.version}
                </span>
                <span className="text-muted-foreground">{r.channel}</span>
                <span className="text-muted-foreground">{r.ramp}</span>
                <span className="text-foreground">{r.crash}</span>
                <span className={cn('w-fit rounded-full px-2 py-0.5 text-[10px] font-medium', TONES[r.tone])}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 三步流程里用的小图：每张一个极简的界面片段。 */
export function StepArt({ step, brand }: { step: 1 | 2 | 3; brand: string }) {
  if (step === 1) {
    return (
      <div className="rounded-lg border border-border bg-foreground/[0.03] p-3 text-[11px] leading-relaxed text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }} aria-hidden>
        <span className="text-foreground/50">$</span> <span className="text-foreground">npx {brand.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'kestrel'} init</span>
        <br />
        <span className="text-emerald-500">✓</span> found ios, android, web
        <br />
        <span className="text-emerald-500">✓</span> wrote kestrel.config.ts
        <br />
        <span className="text-primary">→</span> first data in about 4 min
      </div>
    )
  }
  if (step === 2) {
    return (
      <div className="flex flex-col justify-center gap-3 rounded-lg border border-border bg-foreground/[0.03] p-3 text-[11px] text-muted-foreground" aria-hidden>
        {[
          ['Crash-free target', 99.9, 'w-[92%]'],
          ['p95 latency', 250, 'w-[64%]'],
        ].map(([label, value, width]) => (
          <div key={label as string}>
            <div className="mb-1 flex justify-between">
              <span>{label as string}</span>
              <span className="text-foreground">{label === 'p95 latency' ? `${value} ms` : `${value}%`}</span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/10">
              <div className={cn('h-full rounded-full bg-primary', width as string)} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2 rounded-lg border border-border bg-foreground/[0.03] p-3 text-[10.5px] text-muted-foreground" aria-hidden>
      {[
        ['5%', 'h-6', true],
        ['25%', 'h-10', true],
        ['50%', 'h-14', false],
        ['100%', 'h-[4.5rem]', false],
      ].map(([label, height, done]) => (
        <div key={label as string} className="flex flex-1 flex-col items-center gap-1.5">
          <div className={cn('w-full rounded-md', height as string, done ? 'bg-primary' : 'border border-dashed border-border bg-foreground/[0.04]')} />
          {label as string}
        </div>
      ))}
    </div>
  )
}
