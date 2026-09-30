import { DockfolioSite, type DockfolioSiteProps } from './dockfolio-site'

export function Demo(props: DockfolioSiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <DockfolioSite {...props} />
    </div>
  )
}
