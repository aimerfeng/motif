import { HeroGlobeHorizon, type HeroGlobeHorizonProps } from './hero-globe-horizon'

export function Demo(props: HeroGlobeHorizonProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <HeroGlobeHorizon {...props} />
    </div>
  )
}
