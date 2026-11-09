import { LoaderDepthParticles, type LoaderDepthParticlesProps } from './loader-depth-particles'

export function Demo(props: LoaderDepthParticlesProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-9 shadow-2xl shadow-black/40">
        <div className="grid h-28 w-28 place-items-center">
          <LoaderDepthParticles {...props} label="Aligning sequences" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-card-foreground">Aligning sequences</p>
          <p className="mt-1 text-xs text-muted-foreground">Sample 14 of 32 · chromosome 7</p>
        </div>
      </div>
    </div>
  )
}
