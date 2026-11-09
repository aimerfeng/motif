import { AnalyticsDataInk, PAPERS, defaults, type AnalyticsDataInkProps, type PaperTone } from './analytics-data-ink'

export function Demo(props: AnalyticsDataInkProps) {
  const paper = (PAPERS[(props.paperTone ?? defaults.paperTone) as PaperTone] ?? PAPERS.ivory).paper
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: paper }}>
      <AnalyticsDataInk {...props} />
    </div>
  )
}
