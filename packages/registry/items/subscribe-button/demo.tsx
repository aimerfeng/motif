import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SubscribeButton, type SubscribeButtonProps } from './subscribe-button'

const READERS = 12480

export function Demo(props: SubscribeButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const manual = useRef(false)
  const [subscribed, setSubscribed] = useState(false)

  // 一轮 4.5 秒：1 秒时订阅，3.2 秒时退订。用户点过之后交给用户自己点。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual.current) return
      const t = time % 4.5
      setSubscribed(t >= 1 && t < 3.2)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-[420px] items-center gap-4 rounded-2xl border bg-card p-4 shadow-2xl shadow-black/30">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-sm font-semibold text-white" aria-hidden>
          WD
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">The Weekly Diff</p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">{(READERS + (subscribed ? 1 : 0)).toLocaleString('en-US')} readers · Fridays</p>
        </div>
        <SubscribeButton
          {...props}
          subscribed={subscribed}
          onSubscribedChange={(next) => {
            manual.current = true
            setSubscribed(next)
          }}
        />
      </div>
    </div>
  )
}
