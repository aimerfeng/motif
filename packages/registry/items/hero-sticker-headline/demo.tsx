import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { HeroStickerHeadline, type HeroStickerHeadlineProps } from './hero-sticker-headline'

type DemoProps = HeroStickerHeadlineProps & { autoplay?: boolean }

const TRIPS = [
  { place: 'Lofoten, by sea kayak', meta: '9 days · from $2,140', from: '#0ea5e9', to: '#1e3a8a' },
  { place: 'Oaxaca market crawl', meta: '6 days · from $1,380', from: '#f97316', to: '#be123c' },
  { place: 'Atlas mountain treks', meta: '8 days · from $1,760', from: '#facc15', to: '#c2410c' },
]

/** 一轮 6 秒：第一个短语弹出 → 收回 → 第二个短语弹出 → 收回。 */
function scripted(time: number): number | null {
  const t = time % 6
  if (t >= 0.5 && t < 2.6) return 0
  if (t >= 3.4 && t < 5.5) return 1
  return null
}

export function Demo({ autoplay = true, ...props }: DemoProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<number | null>(null)
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay || manual) return
      const next = scripted(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.6 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#0ea5e9" />
            <path d="M5 15q7-9 14 0" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Farway
        </div>
        <nav aria-label="Main" className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <span>Trips</span>
          <span>Guides</span>
          <span>Journal</span>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <div onPointerEnter={() => setManual(true)}>
          <HeroStickerHeadline {...props} active={autoplay && !manual ? auto : undefined} />
        </div>
        <section aria-label="Departing soon" className="mt-8 grid gap-4 sm:grid-cols-3">
          {TRIPS.map((trip) => (
            <article key={trip.place} className="overflow-hidden rounded-xl border border-border">
              <div className="h-24" style={{ background: `linear-gradient(135deg, ${trip.from}, ${trip.to})` }} />
              <div className="p-3">
                <div className="text-sm font-semibold">{trip.place}</div>
                <div className="text-xs text-muted-foreground">{trip.meta}</div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
