import { AuthGlowTiles, type AuthGlowTilesProps } from './auth-glow-tiles'

export function Demo(props: AuthGlowTilesProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <AuthGlowTiles {...props} className="min-h-full" />
    </div>
  )
}
