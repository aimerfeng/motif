import { LoaderOrbits, type LoaderOrbitsProps } from './loader-orbits'

export function Demo(props: LoaderOrbitsProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border bg-card p-8 shadow-2xl shadow-black/40">
        <LoaderOrbits {...props} size={Math.max(props.size ?? 44, 52)} />
        <div className="text-center">
          <p className="text-sm font-medium text-card-foreground">Syncing your library</p>
          <p className="mt-1 text-xs text-muted-foreground">Fetching 248 items from Drive</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/15 px-4 py-2.5 text-sm font-medium text-primary"
        >
          <LoaderOrbits {...props} size={16} thickness={Math.min(props.thickness ?? 4, 3)} label="Publishing" />
          Publishing…
        </button>
      </div>
    </div>
  )
}
