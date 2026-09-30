import { MobileAppLanding, type MobileAppLandingProps } from './mobile-app-landing'

export function Demo(props: MobileAppLandingProps) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: props.dark === false ? '#faf7f2' : '#0c0b0a' }}>
      <MobileAppLanding {...props} />
    </div>
  )
}
