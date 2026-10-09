import { ShootingStars, type ShootingStarsProps } from './shooting-stars'

export function Demo(props: ShootingStarsProps) {
  return <ShootingStars {...props} className="h-full w-full" />
}
