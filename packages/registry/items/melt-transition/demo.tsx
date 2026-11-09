import { MeltTransition, type MeltTransitionProps } from './melt-transition'

export function Demo(props: MeltTransitionProps) {
  return <MeltTransition {...props} className="h-full w-full" />
}
