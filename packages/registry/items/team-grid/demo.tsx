import { TeamGrid, type TeamGridProps } from './team-grid'

export function Demo(props: TeamGridProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <TeamGrid key={JSON.stringify(props)} {...props} />
    </div>
  )
}
