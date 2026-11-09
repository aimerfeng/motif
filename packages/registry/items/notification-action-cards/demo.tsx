import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NotificationActionCard, type NotificationActionCardProps, type NotificationType } from './notification-action-cards'

const TYPES: NotificationType[] = ['update', 'message', 'invite', 'reminder', 'action']
const GAP = 0.9

/** 按帧时钟轮播各类通知：每张停留 duration 秒，进度条走完后换下一张。 */
export function Demo(props: NotificationActionCardProps & { type?: NotificationType; duration?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const duration = props.duration ?? 5
  const first = Math.max(0, TYPES.indexOf(props.type ?? 'update'))
  const [slot, setSlot] = useState({ index: 0, remaining: duration, open: true })

  useFrameLoop(
    host,
    ({ time }) => {
      const cycle = duration + GAP
      const t = time + 0.6
      const index = Math.floor(t / cycle)
      const local = t - index * cycle
      const open = local < duration
      const remaining = Math.max(0, duration - local)
      setSlot((s) => (s.index === index && s.open === open && Math.abs(s.remaining - remaining) < 0.001 ? s : { index, remaining, open }))
    },
    { reducedMotion: 'static', staticTime: 1.6 },
  )

  const type = TYPES[(first + slot.index) % TYPES.length]

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="absolute inset-0 p-6 opacity-60">
        <div className="mb-6 flex items-center gap-3">
          <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="ms-auto h-7 w-20 rounded-md border" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg border bg-card/60 p-4">
              <div className="mb-3 h-2.5 w-16 rounded bg-muted" />
              <div className="h-5 w-24 rounded bg-muted/70" />
            </div>
          ))}
        </div>
        <div className="mt-3 h-48 rounded-lg border bg-card/40" />
      </div>
      <NotificationActionCard {...props} type={type} open={slot.open} remaining={slot.remaining} />
    </div>
  )
}
