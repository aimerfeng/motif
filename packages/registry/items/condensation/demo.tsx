import { Condensation, type CondensationProps } from './condensation'

export function Demo(props: CondensationProps) {
  return (
    <div className="h-full w-full" style={{ background: 'linear-gradient(160deg, #eef3f8 0%, #dfe8f1 55%, #cfdbe8 100%)' }}>
      <Condensation {...props} className="h-full w-full" />
    </div>
  )
}
