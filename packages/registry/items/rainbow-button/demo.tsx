import { RainbowButton, type RainbowButtonProps } from './rainbow-button'

export function Demo(props: RainbowButtonProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-5">
        <RainbowButton {...props} />
        <p className="text-xs text-muted-foreground">$12 a month · cancel anytime</p>
      </div>
    </div>
  )
}
