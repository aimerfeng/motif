import { HeroDitheringOrb, type HeroDitheringOrbProps } from './hero-dithering-orb'

export function Demo(props: HeroDitheringOrbProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f6f5f0' : '#06070a' }}>
      <HeroDitheringOrb {...props} />
    </div>
  )
}
