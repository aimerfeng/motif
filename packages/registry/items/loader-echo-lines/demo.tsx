import { LoaderEchoLines, type LoaderEchoLinesProps } from './loader-echo-lines'

export function Demo(props: LoaderEchoLinesProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-xl border bg-card px-6 py-8 text-center">
        <LoaderEchoLines {...props} />
        <div>
          <p className="text-sm font-medium text-card-foreground">Building preview</p>
          <p className="mt-1 text-xs text-muted-foreground">Compiling 42 modules for staging</p>
        </div>
      </div>
    </div>
  )
}
