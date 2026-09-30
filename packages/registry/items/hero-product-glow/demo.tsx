import { HeroProductGlow, type HeroProductGlowProps } from './hero-product-glow'

export function Demo(props: HeroProductGlowProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#07080b' }}>
      <HeroProductGlow {...props} />
    </div>
  )
}
