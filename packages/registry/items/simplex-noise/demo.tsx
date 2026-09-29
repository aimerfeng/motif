import { SimplexNoiseBackground, type SimplexNoiseBackgroundProps } from './simplex-noise'

export function Demo(props: SimplexNoiseBackgroundProps) {
  return <SimplexNoiseBackground {...props} className="h-full w-full" />
}
