import { EdgeNetworkBlueprint, type EdgeNetworkBlueprintProps } from './edge-network-blueprint'

export function Demo(props: EdgeNetworkBlueprintProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto" style={{ background: props.paper }}>
      <EdgeNetworkBlueprint {...props} />
    </div>
  )
}
