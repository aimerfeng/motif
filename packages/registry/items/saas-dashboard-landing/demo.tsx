import { SaasDashboardLanding, type SaasDashboardLandingProps } from './saas-dashboard-landing'

export function Demo(props: SaasDashboardLandingProps) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: props.dark === false ? '#ffffff' : '#09090c' }}>
      <SaasDashboardLanding {...props} />
    </div>
  )
}
