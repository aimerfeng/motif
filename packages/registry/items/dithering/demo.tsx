import { DitheringBackground, type DitheringBackgroundProps } from './dithering'

export function Demo(props: DitheringBackgroundProps) {
  return <DitheringBackground {...props} className="h-full w-full" />
}
