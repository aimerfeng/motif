import { RidgelineTerrain, type RidgelineTerrainProps } from './ridgeline-terrain'

export function Demo(props: RidgelineTerrainProps) {
  return <RidgelineTerrain {...props} className="h-full w-full" />
}
