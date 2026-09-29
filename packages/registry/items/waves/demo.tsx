import { WavesBackground, type WavesBackgroundProps } from './waves'

export function Demo(props: WavesBackgroundProps) {
  return <WavesBackground {...props} className="h-full w-full" />
}
