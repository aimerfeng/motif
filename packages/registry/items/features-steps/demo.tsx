import { FeaturesSteps, type FeaturesStepsProps } from './features-steps'

export function Demo(props: FeaturesStepsProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full flex-col justify-center">
        <FeaturesSteps {...props} />
      </div>
    </div>
  )
}
