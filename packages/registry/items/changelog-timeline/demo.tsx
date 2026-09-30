import { ChangelogTimeline, type ChangelogTimelineProps } from './changelog-timeline'

export function Demo(props: ChangelogTimelineProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <ChangelogTimeline key={JSON.stringify(props)} {...props} />
    </div>
  )
}
