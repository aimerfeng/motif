import { LightRays, type LightRaysProps } from './light-rays'

export function Demo(props: LightRaysProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <LightRays {...props} className="absolute inset-0" />
    </div>
  )
}
