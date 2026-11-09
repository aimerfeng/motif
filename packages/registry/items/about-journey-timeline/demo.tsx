import { AboutJourneyTimeline, type AboutJourneyTimelineProps } from './about-journey-timeline'

export function Demo(props: AboutJourneyTimelineProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <AboutJourneyTimeline {...props} />
    </div>
  )
}
