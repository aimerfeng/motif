import { LoaderRadialBloom, type LoaderRadialBloomProps } from './loader-radial-bloom'

export function Demo(props: LoaderRadialBloomProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 text-center shadow-2xl shadow-black/40">
        <LoaderRadialBloom {...props} label="Generating answer" />
        <div>
          <p className="text-sm font-medium text-card-foreground">Thinking it through</p>
          <p className="mt-1 text-xs text-muted-foreground">Searching 12 sources for an answer</p>
        </div>
      </div>
    </div>
  )
}
