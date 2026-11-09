import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DeleteButton, type DeleteButtonProps } from './delete-button'

export function Demo(props: DeleteButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<{ deleting: boolean; count: number }>({ deleting: false, count: 0 })
  const [manual, setManual] = useState(false)
  const countdown = props.countdown ?? 10

  // 一轮 8 秒：1.5 秒点删除，倒数 5 秒，6.5 秒点撤销。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % 8
      const deleting = t >= 1.5 && t < 6.5
      const count = deleting ? Math.max(0, countdown - Math.floor(t - 1.5)) : 0
      setAuto((s) => (s.deleting === deleting && s.count === count ? s : { deleting, count }))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  return (
    <div ref={host} onPointerDown={() => setManual(true)} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[440px] rounded-2xl border bg-card/70 p-6 shadow-2xl shadow-black/30">
        <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">Danger zone</div>
        <h2 className="text-lg font-semibold tracking-tight">Delete account</h2>
        <p className="mt-1 mb-6 text-[13px] leading-5 text-muted-foreground">Your projects, invoices and team seats are removed. You get a few seconds to change your mind.</p>
        <DeleteButton {...props} {...(manual ? {} : auto)} />
      </div>
    </div>
  )
}
