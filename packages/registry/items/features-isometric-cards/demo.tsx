import { FeaturesIsometricCards, type FeaturesIsometricCardsProps } from './features-isometric-cards'

export function Demo(props: FeaturesIsometricCardsProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#020804]">
      <FeaturesIsometricCards {...props} className="min-h-full" />
    </div>
  )
}
