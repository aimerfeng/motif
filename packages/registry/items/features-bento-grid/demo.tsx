import { FeaturesBentoGrid, type FeaturesBentoGridProps } from './features-bento-grid'

export function Demo(props: FeaturesBentoGridProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <FeaturesBentoGrid {...props} />
    </div>
  )
}
