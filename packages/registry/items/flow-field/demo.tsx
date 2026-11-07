import { FlowField, type FlowFieldProps } from './flow-field'

export function Demo(props: FlowFieldProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FlowField {...props} className="absolute inset-0" />
    </div>
  )
}
