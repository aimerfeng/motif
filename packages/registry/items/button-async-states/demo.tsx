import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SaveButton, type SaveButtonProps, type SaveStatus } from './button-async-states'

export function Demo(props: SaveButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<SaveStatus>('idle')
  const [manual, setManual] = useState(false)

  // 一轮 7 秒：1 秒时点击，加载 2.5 秒，成功 2 秒，然后复位。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const t = time % 7
      const next: SaveStatus = t < 1 ? 'idle' : t < 3.5 ? 'loading' : t < 5.5 ? 'success' : 'idle'
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  return (
    <div ref={host} onPointerDown={() => setManual(true)} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[380px] rounded-2xl border bg-card/70 p-6 shadow-2xl shadow-black/30">
        <div className="text-sm font-semibold">Profile</div>
        <p className="mt-1 mb-5 text-xs text-muted-foreground">This is how teammates see you in the workspace.</p>
        <div className="mb-1.5 text-xs text-muted-foreground">Display name</div>
        <div className="mb-6 rounded-lg border bg-background/60 px-3 py-2 text-sm">Mara Okafor</div>
        <div className="flex justify-end">
          <SaveButton {...props} status={manual ? undefined : auto} />
        </div>
      </div>
    </div>
  )
}
