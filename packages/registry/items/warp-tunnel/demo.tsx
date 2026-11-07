import { WarpTunnel, type WarpTunnelProps } from './warp-tunnel'

export function Demo(props: WarpTunnelProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <WarpTunnel {...props} className="absolute inset-0" />
    </div>
  )
}
