import { StudioAgencySite, type StudioAgencySiteProps } from './studio-agency-site'

export function Demo(props: StudioAgencySiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <StudioAgencySite {...props} />
    </div>
  )
}
