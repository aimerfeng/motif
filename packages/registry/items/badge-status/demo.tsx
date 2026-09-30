import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { BadgeStatus, type BadgeStatusProps, type StatusKind } from './badge-status'

type Timeline = [number, StatusKind][]

const SERVICES: { name: string; note: string; timeline: Timeline }[] = [
  { name: 'API gateway', note: 'eu-west-1 · 42 ms', timeline: [[0, 'online']] },
  { name: 'Primary database', note: 'Failover replica', timeline: [[0, 'online'], [2.5, 'syncing'], [5.5, 'online']] },
  { name: 'Realtime channel', note: 'Keynote stream', timeline: [[0, 'live']] },
  { name: 'Image CDN', note: 'Purging cache', timeline: [[0, 'away'], [4.5, 'online']] },
  { name: 'Webhook worker', note: 'Queue paused', timeline: [[0, 'busy'], [6.8, 'offline'], [9.6, 'online']] },
]

const at = (timeline: Timeline, t: number) => timeline.reduce<StatusKind>((current, [from, status]) => (t >= from ? status : current), timeline[0]![1])

export function Demo(props: BadgeStatusProps) {
  const host = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(3.6)

  useFrameLoop(host, ({ time }) => setT(Math.round((time % 12) * 20) / 20), { reducedMotion: 'static', staticTime: 3.6 })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.08_180/0.35),transparent)] bg-background p-6">
      <div className="w-full max-w-[460px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">System status</h2>
            <p className="text-xs text-muted-foreground">Updated a few seconds ago</p>
          </div>
          <BadgeStatus {...props} />
        </div>
        <ul className="divide-y divide-border/70">
          {SERVICES.map((service) => (
            <li key={service.name} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{service.name}</div>
                <div className="truncate text-xs text-muted-foreground">{service.note}</div>
              </div>
              <BadgeStatus {...props} status={at(service.timeline, t)} label="" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
