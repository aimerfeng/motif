import { EmptyStateIllustrated, type EmptyStateIllustratedProps } from './empty-state-illustrated'

export function Demo(props: EmptyStateIllustratedProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-card-foreground">Projects</span>
            <span className="hidden text-muted-foreground sm:inline">Archived</span>
            <span className="hidden text-muted-foreground sm:inline">Shared with me</span>
          </div>
          <div className="flex h-8 w-44 items-center gap-2 rounded-lg border bg-background/60 px-2.5 text-xs text-muted-foreground">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.500-3.500" />
            </svg>
            brand sprint
          </div>
        </div>
        <EmptyStateIllustrated {...props} className="py-6" />
      </div>
    </div>
  )
}
