import { StatsMetricTiles, type StatsMetricTilesProps } from './stats-metric-tiles'

export function Demo(props: StatsMetricTilesProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <div className="my-auto w-full">
        <StatsMetricTiles {...props} />
      </div>
    </div>
  )
}
