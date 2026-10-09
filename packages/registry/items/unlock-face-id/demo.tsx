import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { UnlockFaceId, type UnlockFaceIdProps, type UnlockStatus } from './unlock-face-id'

/** 一轮 11 秒：待机 -> 扫描 -> 认不出来（抖动）-> 再扫描 -> 解锁。 */
function scripted(time: number, scan: number): UnlockStatus {
  const t = time % 11
  if (t < 1.4) return 'idle'
  if (t < 1.4 + scan) return 'scanning'
  if (t < 1.4 + scan + 1.4) return 'error'
  if (t < 4.8 + scan) return 'idle'
  if (t < 4.8 + scan * 2) return 'scanning'
  if (t < 10.6) return 'success'
  return 'idle'
}

function Vault() {
  return (
    <div className="rounded-2xl border bg-card p-4 text-left shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Savings vault</span>
        <span>Updated just now</span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">$24,860.12</div>
      <div className="mt-3 flex gap-1.5">
        {[62, 80, 54, 92, 70, 100].map((h, i) => (
          <span key={i} className="flex-1 rounded-sm bg-emerald-500/70" style={{ height: h * 0.32 }} />
        ))}
      </div>
    </div>
  )
}

export function Demo(props: UnlockFaceIdProps) {
  const host = useRef<HTMLDivElement>(null)
  const scan = Math.min(props.scanDuration ?? 1.8, 3)
  const [auto, setAuto] = useState<UnlockStatus>('idle')
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setAuto(scripted(time, scan))
    },
    { reducedMotion: 'static', staticTime: 8.4 },
  )

  return (
    <div ref={host} onPointerDown={() => setManual(true)} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.94_0.06_175/0.7),transparent)] bg-background p-6">
      <div className="w-full max-w-[340px] text-center">
        <UnlockFaceId {...props} status={manual ? undefined : auto} errorMessage="Face not recognized. Try again.">
          <Vault />
        </UnlockFaceId>
      </div>
    </div>
  )
}
