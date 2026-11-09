import { PatternBackdrop, type PatternBackdropProps } from './pattern-backdrop'

export function Demo(props: PatternBackdropProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <PatternBackdrop {...props} className="absolute inset-0" />
    </div>
  )
}
