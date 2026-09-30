import { FerrantProductSite, type FerrantProductSiteProps } from './ferrant-product-site'

export function Demo(props: FerrantProductSiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <FerrantProductSite {...props} />
    </div>
  )
}
