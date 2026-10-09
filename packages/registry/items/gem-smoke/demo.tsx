import { GemSmokeShape, type GemSmokeProps } from './gem-smoke'

export function Demo(props: GemSmokeProps) {
  return <GemSmokeShape {...props} className="h-full w-full" />
}
