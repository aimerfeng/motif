import { LoaderGooeyBlobs, type LoaderGooeyBlobsProps } from './loader-gooey-blobs'

export function Demo(props: LoaderGooeyBlobsProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-2xl border bg-card px-6 py-8 text-center shadow-2xl shadow-black/40">
        <LoaderGooeyBlobs {...props} label="Rendering your scene" />
        <div>
          <p className="text-sm font-medium text-card-foreground">Rendering your scene</p>
          <p className="mt-1 text-xs text-muted-foreground">Blending 12 layers, about 20 seconds</p>
        </div>
      </div>
    </div>
  )
}
