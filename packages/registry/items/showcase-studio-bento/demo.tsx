import { ShowcaseStudioBento, type ShowcaseStudioBentoProps } from './showcase-studio-bento'

export function Demo(props: ShowcaseStudioBentoProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <ShowcaseStudioBento {...props} />
    </div>
  )
}
