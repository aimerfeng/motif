import { HeroVideoPreview, type HeroVideoPreviewProps } from './hero-video-preview'

export function Demo(props: HeroVideoPreviewProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <HeroVideoPreview {...props} className="min-h-full" />
    </div>
  )
}
