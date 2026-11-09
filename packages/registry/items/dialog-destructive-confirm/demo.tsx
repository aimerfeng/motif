import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DialogDestructiveConfirm, defaults, type DialogDestructiveConfirmProps } from './dialog-destructive-confirm'

/** 8 秒一轮：0.6s 打开 -> 逐字输入资源名 -> 停留 -> 关闭。 */
function scripted(time: number, name: string) {
  const t = time % 8
  if (t < 0.6 || t > 7.4) return { open: false, chars: 0 }
  const chars = Math.max(0, Math.min(name.length, Math.floor((t - 1.6) / 0.16)))
  return { open: true, chars }
}

export function Demo(props: DialogDestructiveConfirmProps) {
  const host = useRef<HTMLDivElement>(null)
  const name = props.resourceName ?? defaults.resourceName
  const [auto, setAuto] = useState({ open: false, chars: 0 })
  const [manual, setManual] = useState<{ open: boolean; value: string } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, name)
      setAuto((prev) => (prev.open === next.open && prev.chars === next.chars ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.2 },
  )

  const open = manual ? manual.open : auto.open
  const value = manual ? manual.value : name.slice(0, auto.chars)

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-4 px-6">
        <div>
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Settings · Danger zone</div>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">Delete this project</h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Removes <span className="font-mono text-foreground">{name}</span> and its 14 deployments for everyone on the team.
          </p>
          <button
            type="button"
            onClick={() => setManual({ open: true, value: '' })}
            className="h-9 rounded-lg px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{ color: props.accent ?? defaults.accent, backgroundColor: `color-mix(in oklab, ${props.accent ?? defaults.accent} 14%, transparent)` }}
          >
            Delete project
          </button>
        </div>
      </div>
      <DialogDestructiveConfirm
        {...props}
        contained
        open={open}
        value={value}
        onValueChange={(v) => setManual({ open: true, value: v })}
        onOpenChange={(o) => setManual({ open: o, value: '' })}
      />
    </div>
  )
}
