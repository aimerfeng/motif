import { FeaturesTabbedShowcase, type FeaturesTabbedShowcaseProps } from './features-tabbed-showcase'

export function Demo(props: FeaturesTabbedShowcaseProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <FeaturesTabbedShowcase {...props} />
    </div>
  )
}
