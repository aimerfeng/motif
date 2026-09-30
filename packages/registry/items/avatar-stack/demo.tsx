import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AvatarStack, type AvatarStackProps } from './avatar-stack'

/** 一轮 9 秒：指针从左到右逐个经过头像，最后经过 +N。 */
function scripted(time: number, cells: number): number | null {
  const t = time % 9
  if (t < 0.8 || t >= 8.0) return null
  return Math.min(cells - 1, Math.floor((t - 0.8) / 1.2))
}

export function Demo(props: AvatarStackProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<number | null>(null)
  const [manual, setManual] = useState(false)
  const cells = Math.min(props.maxVisible ?? 5, 8) + 1

  useFrameLoop(
    host,
    ({ time }) => {
      if (!manual) setAuto(scripted(time, cells))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  return (
    <div ref={host} onPointerMove={(event) => event.isTrusted && !manual && setManual(true)} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.09_300/0.42),transparent)] bg-background p-6">
      <div className="w-full max-w-[520px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 pt-1">
            <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Roadmap · Draft</div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Q4 planning</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Edited 2 minutes ago · 8 viewing</p>
          </div>
          <div className="shrink-0">
            <AvatarStack {...props} ring="var(--card)" activeIndex={manual ? undefined : auto} label="People viewing this document" />
          </div>
        </div>
        <div aria-hidden className="mt-4 space-y-2.5">
          <div className="h-2.5 w-2/3 rounded-full bg-muted-foreground/25" />
          <div className="h-2 w-full rounded-full bg-muted-foreground/15" />
          <div className="h-2 w-5/6 rounded-full bg-muted-foreground/15" />
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg border bg-background/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
