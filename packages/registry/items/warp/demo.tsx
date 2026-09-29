import { WarpBackground, type WarpBackgroundProps } from './warp'

export function Demo(props: WarpBackgroundProps) {
  return <WarpBackground {...props} className="h-full w-full" />
}
