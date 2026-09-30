import { DevfolioSite, type DevfolioSiteProps } from './devfolio-site'

export function Demo(props: DevfolioSiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <DevfolioSite {...props} />
    </div>
  )
}
