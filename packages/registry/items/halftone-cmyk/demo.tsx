import { HalftoneCmykPrint, type HalftoneCmykPrintProps } from './halftone-cmyk'

export function Demo(props: HalftoneCmykPrintProps) {
  return <HalftoneCmykPrint {...props} className="h-full w-full" />
}
