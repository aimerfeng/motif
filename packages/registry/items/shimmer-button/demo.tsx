import { ShimmerButton, type ShimmerButtonProps } from './shimmer-button'

export function Demo(props: ShimmerButtonProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <ShimmerButton {...props} className="px-8 py-3.5 text-base shadow-2xl shadow-black/60" />
        <p className="text-xs text-muted-foreground">Join 2,400 teams already on the waitlist</p>
      </div>
    </div>
  )
}
