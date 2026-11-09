import { LoaderCometSweep, type LoaderCometSweepProps } from './loader-comet-sweep'

export function Demo(props: LoaderCometSweepProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border bg-card p-8 shadow-2xl shadow-black/40">
        <LoaderCometSweep {...props} />
        <div className="text-center">
          <p className="text-sm font-medium text-card-foreground">Buffering episode 12</p>
          <p className="mt-1 text-xs text-muted-foreground">Night Shift Radio · 48 min</p>
        </div>
        <div className="flex w-full items-center gap-3 rounded-lg border px-3 py-2">
          <LoaderCometSweep {...props} size={18} thickness={Math.min(props.thickness ?? 6, 3)} glow={0} label="Uploading" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Uploading cover-art-final.png</span>
        </div>
      </div>
    </div>
  )
}
