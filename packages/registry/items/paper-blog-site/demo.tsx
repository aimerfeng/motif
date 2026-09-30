import { PaperBlogSite, type PaperBlogSiteProps } from './paper-blog-site'

export function Demo(props: PaperBlogSiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <PaperBlogSite {...props} />
    </div>
  )
}
