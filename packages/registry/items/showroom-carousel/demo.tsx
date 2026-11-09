import { ShowroomCarousel, type ShowroomCarouselProps } from './showroom-carousel'

export function Demo(props: ShowroomCarouselProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-3xl min-w-0">
        <p className="mb-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">Autumn collection</p>
        <ShowroomCarousel {...props} />
      </div>
    </div>
  )
}
