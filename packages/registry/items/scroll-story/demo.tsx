import { ScrollStory, type ScrollStoryProps } from './scroll-story'

export function Demo(props: ScrollStoryProps) {
  const light = props.tone === 'light'
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: light ? '#f4f0e8' : '#0e0f12' }}>
      <ScrollStory {...props} />
      <div className="grid h-[55svh] place-items-center px-6 text-center text-[15px]" style={{ color: light ? '#18171c' : '#f2efe8', fontFamily: "'Inter Tight Variable', sans-serif" }}>
        <p className="max-w-[30ch] opacity-60">The section un-pins here and the page scrolls on as usual.</p>
      </div>
    </div>
  )
}
