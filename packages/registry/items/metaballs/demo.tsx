import { MetaballsBackground, type MetaballsBackgroundProps } from './metaballs'

export function Demo(props: MetaballsBackgroundProps) {
  return <MetaballsBackground {...props} className="h-full w-full" />
}
