import { FluidSimulation, type FluidSimulationProps } from './fluid-simulation'

export function Demo(props: FluidSimulationProps) {
  return <FluidSimulation {...props} className="h-full w-full" />
}
