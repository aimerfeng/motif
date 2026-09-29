import { Laser, type LaserProps } from './laser'

export function Demo(props: LaserProps) {
  return <Laser {...props} className="h-full w-full" />
}
