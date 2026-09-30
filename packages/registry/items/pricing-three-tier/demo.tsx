import { PricingThreeTier, type PricingThreeTierProps } from './pricing-three-tier'

export function Demo(props: PricingThreeTierProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <PricingThreeTier {...props} />
    </div>
  )
}
