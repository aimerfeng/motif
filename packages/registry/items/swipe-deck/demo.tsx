import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DeckItem, SwipeDeck, type SwipeDeckProps } from './swipe-deck'

const LISTINGS = [
  { id: 'harbor', title: 'Loft on Harbor Row', area: 'Old Docks · 2.1 km', price: '$1,840', meta: '1 bed · 58 m²', tags: ['Balcony', 'Pets ok'], from: '#f59e0b', to: '#be185d' },
  { id: 'linden', title: 'Linden Court Studio', area: 'Northside · 3.4 km', price: '$1,260', meta: 'Studio · 34 m²', tags: ['Furnished', 'Gym'], from: '#22d3ee', to: '#4338ca' },
  { id: 'quarry', title: 'Quarry Lane Duplex', area: 'Hillcrest · 5.0 km', price: '$2,390', meta: '2 bed · 81 m²', tags: ['Garden', 'Parking'], from: '#a3e635', to: '#0f766e' },
  { id: 'mercer', title: 'Mercer Street Flat', area: 'Midtown · 0.8 km', price: '$1,975', meta: '1 bed · 62 m²', tags: ['Doorman', 'Lift'], from: '#f472b6', to: '#7c3aed' },
] as const

const PERIOD = 2
const COMMIT = 1.25
const LOOP = LISTINGS.length * PERIOD + 2
const DIRS = ['right', 'left', 'right', 'left'] as const

type Auto = { index: number; offset: number; dir: 'left' | 'right' }

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/** 自动播放：每张卡先被慢慢拖向一侧（露出印章），然后飞出；翻完停在空状态，再从头开始。 */
function scripted(time: number, threshold: number): Auto {
  const t = time % LOOP
  const k = Math.floor(t / PERIOD)
  if (k >= LISTINGS.length) return { index: LISTINGS.length, offset: 0, dir: 'left' }
  const local = t - k * PERIOD
  const dir = DIRS[k % DIRS.length]
  if (local >= COMMIT) return { index: k + 1, offset: 0, dir }
  const p = Math.min(1, Math.max(0, (local - 0.25) / 0.85))
  return { index: k, offset: (dir === 'right' ? 1 : -1) * threshold * 0.85 * ease(p), dir }
}

export function Demo(props: SwipeDeckProps) {
  const host = useRef<HTMLDivElement>(null)
  const threshold = props.threshold ?? 150
  const [auto, setAuto] = useState<Auto>({ index: 0, offset: 0, dir: 'right' })
  const [manual, setManual] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time, threshold)
      setAuto((prev) => (prev.index === next.index && Math.abs(prev.offset - next.offset) < 0.5 && prev.dir === next.dir ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.1 },
  )

  const takeOver = () => {
    if (manual === null) setManual(auto.index >= LISTINGS.length ? 0 : auto.index)
  }

  const index = manual ?? auto.index

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background p-4" onKeyDownCapture={takeOver} onPointerDownCapture={takeOver}>
      <div className="flex w-full max-w-[280px] flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">Saved search · Rentals</div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {Math.min(index, LISTINGS.length)}/{LISTINGS.length}
          </div>
        </div>
        <SwipeDeck
          {...props}
          empty={
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <p className="text-sm font-medium text-foreground">You’re all caught up</p>
              <p className="text-xs">New listings arrive every morning.</p>
              <button className="rounded-full border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setManual(0)} type="button">
                Start over
              </button>
            </div>
          }
          exitDirection={manual === null ? auto.dir : undefined}
          index={index}
          label="Rental listings"
          onIndexChange={(i) => setManual(i)}
          previewOffset={manual === null ? auto.offset : undefined}
        >
          {LISTINGS.map((item) => (
            <DeckItem className="flex-col items-stretch justify-start overflow-hidden" key={item.id}>
              <div className="relative flex-1" style={{ background: `linear-gradient(140deg, ${item.from}, ${item.to})` }}>
                <svg aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 w-full text-black/25" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0 50V30h12V18h10v12h8V10h14v20h6V22h12v8h10V14h12v16h16v20z" fill="currentColor" />
                </svg>
                <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">{item.price}/mo</span>
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <div className="text-base font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground">
                  {item.area} · {item.meta}
                </div>
                <div className="mt-1 flex gap-1.5">
                  {item.tags.map((tag) => (
                    <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </DeckItem>
          ))}
        </SwipeDeck>
      </div>
    </div>
  )
}
