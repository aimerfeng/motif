import { ThreeDPhotoCarousel, type ThreeDPhotoCarouselProps } from './carousel-3d-cylinder'

export function Demo(props: ThreeDPhotoCarouselProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center overflow-hidden bg-background py-6">
      <div className="mx-auto w-full max-w-4xl px-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Collection · 14 frames</p>
        <h2 id="carousel-3d-title" className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">After Hours</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">Rooftops and windows after the last train. Drag to spin, click a frame to open it.</p>
      </div>
      <div className="mt-4 w-full min-w-0">
        <ThreeDPhotoCarousel {...props} height={420} labelledBy="carousel-3d-title" />
      </div>
    </div>
  )
}
