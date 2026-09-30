import { TestimonialsWall, type TestimonialsWallProps } from './testimonials-wall'

export function Demo(props: TestimonialsWallProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <TestimonialsWall {...props} />
    </div>
  )
}
