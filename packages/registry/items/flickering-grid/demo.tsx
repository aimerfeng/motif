import { FlickeringGrid, type FlickeringGridProps } from './flickering-grid'

export function Demo(props: FlickeringGridProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* 中间一层很淡的冷光，让网格有一点纵深。 */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_42%,oklch(0.3_0.05_240/0.5),transparent_75%)]" />
      <FlickeringGrid {...props} className="absolute inset-0" />
    </div>
  )
}
