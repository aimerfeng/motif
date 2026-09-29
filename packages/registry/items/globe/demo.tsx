import { Globe, type GlobeProps } from './globe'

export function Demo(props: GlobeProps) {
  return (
    <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_55%,#0d1233_0%,#05060f_62%)]">
      <Globe {...props} className="h-full w-full" />
    </div>
  )
}
