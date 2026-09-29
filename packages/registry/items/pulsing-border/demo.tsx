import { PulsingBorderCard, type PulsingBorderCardProps } from './pulsing-border'

export function Demo(props: PulsingBorderCardProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background">
      <PulsingBorderCard {...props} className="h-[248px] w-[320px]">
        <div className="flex h-full flex-col justify-between p-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Ask anything</p>
            <p className="mt-3 text-lg font-medium leading-snug text-foreground">Summarize this week’s changes across the repo.</p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>12 files · 3 authors</span>
            <span className="rounded-full border px-2.5 py-1 text-foreground">Run</span>
          </div>
        </div>
      </PulsingBorderCard>
    </div>
  )
}
