import { ChromaticLens, type ChromaticLensProps } from './chromatic-lens'

export function Demo(props: ChromaticLensProps) {
  return <ChromaticLens {...props} className="h-full w-full" />
}
