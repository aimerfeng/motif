import { DitheredImage, type DitheredImageProps } from './dithered-image'

export function Demo(props: DitheredImageProps) {
  return <DitheredImage {...props} className="h-full w-full" />
}
