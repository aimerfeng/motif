import { MetalButton, type MetalButtonProps } from './metal-button'

export function Demo(props: MetalButtonProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-5">
        <MetalButton {...props} />
        <p className="text-xs text-muted-foreground">Studio Monitor S2 · USB-C · firmware 3.1</p>
      </div>
    </div>
  )
}
