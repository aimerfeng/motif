import { BeamsBackground, type BeamsBackgroundProps } from './beams-background'

export function Demo(props: BeamsBackgroundProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <BeamsBackground {...props} className="absolute inset-0" />
    </div>
  )
}
