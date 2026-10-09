import { HeatmapMark, type HeatmapMarkProps } from './heatmap'

export function Demo(props: HeatmapMarkProps) {
  return <HeatmapMark {...props} className="h-full w-full" />
}
