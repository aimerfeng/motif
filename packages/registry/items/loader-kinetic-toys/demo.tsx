import { LoaderKineticToys, type LoaderKineticToysProps } from './loader-kinetic-toys'

export function Demo(props: LoaderKineticToysProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 rounded-2xl border bg-card px-6 py-9 shadow-2xl shadow-black/40">
        <div className="grid h-24 place-items-center">
          <LoaderKineticToys {...props} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-card-foreground">Setting up your workspace</p>
          <p className="mt-1 text-xs text-muted-foreground">Importing 3 boards and 41 cards</p>
        </div>
      </div>
    </div>
  )
}
