import { EmptyStateGhostChart, type EmptyStateGhostChartProps } from './empty-state-ghost-chart'

export function Demo(props: EmptyStateGhostChartProps) {
  return (
    <div className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <EmptyStateGhostChart {...props} />
      </div>
    </div>
  )
}
