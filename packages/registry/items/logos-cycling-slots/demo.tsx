import { LogoCarousel, type LogoCarouselProps } from './logos-cycling-slots'

export function Demo(props: LogoCarouselProps) {
  const dark = props.tone !== 'light'
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: dark ? '#09090b' : '#f6f5f1', color: dark ? '#f2f2f4' : '#121317' }}>
      <div className="flex min-h-full flex-col items-center justify-center gap-10 px-4 py-24">
        <h2 className="max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance md:text-5xl" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
          Ship the release notes, not the spreadsheet
        </h2>
        <LogoCarousel {...props} />
      </div>
    </div>
  )
}
