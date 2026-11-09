import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PixelHoverCard, type PixelHoverCardProps } from './pixel-hover-card'

const CARDS = [
  { artwork: 'can', name: 'Solstice Soda', meta: 'Blood orange / yuzu', price: '$3.50' },
  { artwork: 'peaks', name: 'Ridgeline Print', meta: 'Day / night edition', price: '$48' },
  { artwork: 'poster', name: 'Series 07', meta: 'Two-colour screenprint', price: '$120' },
]

const PERIOD = 3.6

/** 每张卡在时刻 t 是否切到另一面，拼成 '010' 这样的字符串，只在变化时触发重渲染。 */
function flagsAt(t: number) {
  return CARDS.map((_, i) => {
    const phase = (((t - i * 0.5) % PERIOD) + PERIOD) % PERIOD
    return phase >= 0.3 && phase < 2.1 ? '1' : '0'
  }).join('')
}

export function Demo(props: PixelHoverCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [flags, setFlags] = useState(() => flagsAt(1.2))

  // 自动播放：三张卡依次切到另一面再切回；用户指针进来后交给真实悬停。
  useFrameLoop(
    rootRef,
    ({ time: t }) => {
      if (!manual) setFlags(flagsAt(t))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  return (
    <div ref={rootRef} className="h-full w-full overflow-y-auto bg-background text-foreground" onPointerEnter={() => setManual(true)} onPointerLeave={() => setManual(false)}>
      <div className="mx-auto grid min-h-full max-w-4xl grid-cols-1 content-center gap-5 px-4 py-6 sm:grid-cols-3">
        {CARDS.map((card, i) => {
          const active = manual ? undefined : flags[i] === '1'
          return (
            <figure key={card.artwork} className="min-w-0">
              <PixelHoverCard {...props} artwork={props.artwork === 'can' || !props.artwork ? card.artwork : props.artwork} active={active} label={`${card.name}, ${card.meta}`} className="w-full" />
              <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{card.name}</span>
                  <span className="block truncate text-muted-foreground">{card.meta}</span>
                </span>
                <span className="shrink-0 tabular-nums">{card.price}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
