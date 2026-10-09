import { PoolWater, type PoolWaterProps } from './pool-water'

export function Demo(props: PoolWaterProps) {
  return <PoolWater {...props} className="h-full w-full" />
}
