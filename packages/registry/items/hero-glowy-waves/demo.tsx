import { HeroGlowyWaves, type HeroGlowyWavesProps } from './hero-glowy-waves'

export function Demo(props: HeroGlowyWavesProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: '#05060a' }}>
      <HeroGlowyWaves {...props} />
    </div>
  )
}
