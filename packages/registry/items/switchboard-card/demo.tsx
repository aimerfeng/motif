import { SwitchboardCard, type SwitchboardCardProps } from './switchboard-card'

export function Demo(props: SwitchboardCardProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_100%,oklch(0.3_0.06_70/0.5),transparent)] bg-background p-6">
      <SwitchboardCard {...props} className="max-w-[440px]" />
    </div>
  )
}
