import { LoaderBars, type LoaderBarsProps } from './loader-bars'

export function Demo(props: LoaderBarsProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary/10">
            <LoaderBars {...props} size={Math.max(props.size ?? 32, 28)} label="Transcribing audio" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-card-foreground">Transcribing audio</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">standup-2026-09-12.m4a · 38 min</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
          <span>Speakers detected: 3</span>
          <span>About 40 s left</span>
        </div>
      </div>
    </div>
  )
}
