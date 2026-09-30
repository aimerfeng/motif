import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { TabsAnimated, type TabItem, type TabsAnimatedProps } from './tabs-animated'

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-lg border bg-background/50 px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-emerald-400">{delta}</div>
    </div>
  )
}

function Row({ title, meta, tone }: { title: string; meta: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-1 py-1.5">
      <span className={`size-2 rounded-full ${tone}`} />
      <span className="flex-1 truncate text-[13px]">{title}</span>
      <span className="text-[11px] text-muted-foreground">{meta}</span>
    </div>
  )
}

const ITEMS: TabItem[] = [
  {
    value: 'overview',
    label: 'Overview',
    icon: icon(<path d="M4 19V9m6 10V5m6 14v-7m4 7H3" />),
    content: (
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Requests" value="1.24M" delta="+8.2%" />
        <Stat label="p95 latency" value="84 ms" delta="-11 ms" />
        <Stat label="Error rate" value="0.02%" delta="-0.01%" />
      </div>
    ),
  },
  {
    value: 'activity',
    label: 'Activity',
    icon: icon(<path d="M3 12h4l3-8 4 16 3-8h4" />),
    badge: 3,
    content: (
      <div className="space-y-0.5">
        <Row title="Deploy #482 promoted to production" meta="2m" tone="bg-emerald-400" />
        <Row title="Mira commented on api/routes.ts" meta="14m" tone="bg-sky-400" />
        <Row title="Build cache purged for main" meta="1h" tone="bg-amber-400" />
      </div>
    ),
  },
  {
    value: 'members',
    label: 'Members',
    icon: icon(<><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 11.2a3 3 0 0 0 0-6M17.5 14.7c1.8.5 3 1.9 3.5 4.3" /></>),
    content: (
      <div className="space-y-0.5">
        <Row title="Mira Okafor" meta="Owner" tone="bg-violet-400" />
        <Row title="Jonas Weiß" meta="Maintainer" tone="bg-sky-400" />
        <Row title="Priya Nair" meta="Viewer" tone="bg-zinc-400" />
      </div>
    ),
  },
  {
    value: 'billing',
    label: 'Billing',
    icon: icon(<><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="M3.5 10.5h17" /></>),
    content: (
      <div className="flex items-center justify-between rounded-lg border bg-background/50 px-4 py-3.5">
        <div>
          <div className="text-[13px] font-medium">Team plan</div>
          <div className="text-[11px] text-muted-foreground">Renews Nov 3 · 12 seats</div>
        </div>
        <div className="text-lg font-semibold tabular-nums">$96<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
      </div>
    ),
  },
]

export function Demo(props: TabsAnimatedProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState('overview')
  const [manual, setManual] = useState<string | null>(null)

  // 自动播放：按时间轮流切换；用户一操作就交还控制权。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      setAuto(ITEMS[Math.floor(time / 2.4) % ITEMS.length]!.value)
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.09_285/0.45),transparent)] bg-background p-6">
      <div className="w-full max-w-[500px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-violet-400 to-indigo-600 text-sm font-bold text-white">N</div>
          <div>
            <div className="text-sm font-semibold">northwind-api</div>
            <div className="text-[11px] text-muted-foreground">Production · Frankfurt</div>
          </div>
        </div>
        <TabsAnimated {...props} items={ITEMS} value={manual ?? auto} onValueChange={setManual} label="Project sections" />
      </div>
    </div>
  )
}
