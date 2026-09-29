import { defaults, Marquee, type MarqueeProps } from './marquee'

const REVIEWS = [
  { name: 'Mira Okafor', role: 'Product designer', quote: 'Dropped it into our landing page in ten minutes. The motion feels hand-tuned.' },
  { name: 'Jonas Lindqvist', role: 'Frontend lead', quote: 'Finally a set of effects I can read, tweak and ship without a build step.' },
  { name: 'Sana Iyer', role: 'Design engineer', quote: 'The presets are good enough that the defaults never needed touching.' },
  { name: 'Tomas Reyes', role: 'Founder, Loomly', quote: 'Our pricing page went from flat to considered with two components.' },
  { name: 'Ada Whitfield', role: 'Creative director', quote: 'Restrained where it counts. Nothing here shouts for attention.' },
  { name: 'Kenji Arai', role: 'Indie developer', quote: 'Copy, paste, adjust three sliders. Done before my coffee cooled.' },
  { name: 'Lea Moreau', role: 'UX engineer', quote: 'Reduced motion is handled properly, which almost nobody does.' },
  { name: 'Priya Nair', role: 'Design lead', quote: 'It reads like a designer wrote the code, and it runs smoothly.' },
]

function Review({ index }: { index: number }) {
  const review = REVIEWS[index % REVIEWS.length]!
  const initials = review.name
    .split(' ')
    .map((part) => part[0])
    .join('')
  return (
    <figure className="w-64 shrink-0 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: `hsl(${(index * 47 + 230) % 360} 45% 42%)` }}>
          {initials}
        </div>
        <div className="min-w-0">
          <figcaption className="truncate text-sm font-medium text-card-foreground">{review.name}</figcaption>
          <p className="truncate text-xs text-muted-foreground">{review.role}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm/relaxed text-muted-foreground">{review.quote}</blockquote>
    </figure>
  )
}

const ROWS = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
]
const COLUMNS = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [2, 6, 1, 5],
]

export function Demo(props: MarqueeProps) {
  const duration = props.duration ?? defaults.duration

  if (props.vertical) {
    return (
      <div className="flex h-full w-full items-stretch justify-center gap-3 overflow-hidden bg-background px-6">
        {COLUMNS.map((column, index) => (
          <Marquee key={index} {...props} duration={duration * (1 + index * 0.18)} reverse={index % 2 === 1 ? !props.reverse : props.reverse} className="h-full w-64">
            {column.map((review) => (
              <Review key={review} index={review} />
            ))}
          </Marquee>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden bg-background">
      <div className="text-center">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Wall of love</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Trusted by people who sweat the details</h2>
      </div>
      <div className="w-full">
        {ROWS.map((row, index) => (
          <Marquee key={index} {...props} duration={duration * (1 + index * 0.15)} reverse={index % 2 === 1 ? !props.reverse : props.reverse}>
            {row.map((review) => (
              <Review key={review} index={review} />
            ))}
          </Marquee>
        ))}
      </div>
    </div>
  )
}
