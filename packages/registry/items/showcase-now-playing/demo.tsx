import { ShowcaseNowPlaying, type ShowcaseNowPlayingProps } from './showcase-now-playing'

export function Demo(props: ShowcaseNowPlayingProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <ShowcaseNowPlaying {...props} />
    </div>
  )
}
