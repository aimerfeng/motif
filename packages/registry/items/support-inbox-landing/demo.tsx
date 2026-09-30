import { SupportInboxLanding, type SupportInboxLandingProps } from './support-inbox-landing'

export function Demo(props: SupportInboxLandingProps) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: props.dark ? '#0b0f12' : '#fbfcfc' }}>
      <SupportInboxLanding {...props} />
    </div>
  )
}
