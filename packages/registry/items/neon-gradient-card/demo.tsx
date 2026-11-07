import { NeonGradientCard, defaults, type NeonGradientCardProps } from './neon-gradient-card'

export function Demo(props: NeonGradientCardProps) {
  const colors = props.colors ?? defaults.colors
  const live = colors[colors.length - 1] ?? '#00fff1'

  return (
    <div className="grid h-full w-full place-items-center bg-background p-12">
      <NeonGradientCard {...props} className="w-full max-w-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-2 font-medium text-card-foreground">
            <span className="size-1.5 rounded-full" style={{ background: live, boxShadow: `0 0 8px ${live}` }} />
            Live tonight
          </span>
          <span className="text-muted-foreground tabular-nums">Doors 22:00</span>
        </div>
        <h3 className="mt-7 text-[28px] leading-none font-bold tracking-tight text-balance" style={{ fontFamily: '"Syne Variable", sans-serif' }}>
          Afterglow Sessions
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">Mira Sato, Ondes and guests. Warehouse 9, Pier Street.</p>
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="text-lg font-semibold text-card-foreground tabular-nums">€28</span> / ticket
          </p>
          <button
            type="button"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Get tickets
          </button>
        </div>
      </NeonGradientCard>
    </div>
  )
}
