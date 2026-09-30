import { TidepoolStartupLanding, type TidepoolStartupLandingProps } from './tidepool-startup-landing'

export function Demo(props: TidepoolStartupLandingProps) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: props.dark ? '#0d1020' : '#ffffff' }}>
      <TidepoolStartupLanding {...props} />
    </div>
  )
}
