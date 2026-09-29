import { EnergyOrb, type EnergyOrbProps } from './energy-orb'

export function Demo(props: EnergyOrbProps) {
  return <EnergyOrb {...props} className="h-full w-full" />
}
