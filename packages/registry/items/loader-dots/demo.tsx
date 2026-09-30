import { LoaderDots, type LoaderDotsProps } from './loader-dots'

export function Demo(props: LoaderDotsProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2.5 border-b pb-3">
          <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">A</div>
          <div>
            <p className="text-sm font-medium leading-none text-card-foreground">Ava</p>
            <p className="mt-1 text-[11px] leading-none text-muted-foreground">Research assistant</p>
          </div>
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          Can you summarise the Q3 report?
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm text-foreground">
          Sure. Pulling the key numbers now.
        </div>
        <div className="flex h-9 w-fit items-center rounded-2xl rounded-bl-md bg-muted px-4">
          <LoaderDots {...props} size={Math.min(props.size ?? 12, 14)} label="Ava is typing" />
        </div>
      </div>
    </div>
  )
}
