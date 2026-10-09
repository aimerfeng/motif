import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { CardSpread, type CardSpreadProps } from './card-spread'

function Check({ done }: { done?: boolean }) {
  return (
    <span className={`mt-px grid size-4 shrink-0 place-items-center rounded-full border ${done ? 'border-neutral-800 bg-neutral-800' : 'border-neutral-800/40'}`}>
      {done && (
        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m2.5 6.2 2.2 2.2 4.8-5" />
        </svg>
      )}
    </span>
  )
}

function Title({ children, meta }: { children: ReactNode; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <p className="text-[15px] font-semibold tracking-tight">{children}</p>
      {meta && <span className="text-xs text-neutral-800/55">{meta}</span>}
    </div>
  )
}

const CARDS = [
  <div key="notes" className="flex h-full flex-col gap-3 p-5">
    <Title meta="Mon">Kitchen remodel</Title>
    <ul className="flex flex-col gap-2 text-[13px] leading-snug text-neutral-800/80">
      <li>Farmhouse sink for a rustic touch</li>
      <li>Classic white subway tiles</li>
      <li>An island with room for stools</li>
      <li>Open shelving instead of uppers</li>
    </ul>
  </div>,
  <div key="shopping" className="flex h-full flex-col gap-3 p-5">
    <Title meta="3 of 5">Shopping</Title>
    <ul className="flex flex-col gap-2.5 text-[13px]">
      {[
        ['Oat milk', true],
        ['Sourdough', true],
        ['Lemons', true],
        ['Basil', false],
        ['Olive oil', false],
      ].map(([label, done]) => (
        <li key={label as string} className="flex items-start gap-2.5">
          <Check done={done as boolean} />
          <span className={done ? 'text-neutral-800/45 line-through' : ''}>{label as string}</span>
        </li>
      ))}
    </ul>
  </div>,
  <div key="reminders" className="flex h-full flex-col gap-3 p-5">
    <Title meta="Sat">Reminders</Title>
    <ul className="flex flex-col gap-3 text-[13px]">
      {[
        ['Museum tickets', '10:00'],
        ['Call mom', '14:30'],
        ['Water ferns', '18:00'],
      ].map(([label, time]) => (
        <li key={label} className="flex items-start justify-between gap-3">
          <span className="flex items-start gap-2.5">
            <Check />
            {label}
          </span>
          <span className="tabular-nums text-neutral-800/55">{time}</span>
        </li>
      ))}
    </ul>
  </div>,
  <div key="today" className="flex h-full flex-col justify-between p-5">
    <Title meta="Thursday">Today</Title>
    <div>
      <p className="text-6xl font-semibold tracking-tighter tabular-nums">24</p>
      <p className="mt-1 text-[13px] text-neutral-800/70">3 tasks left, next one at 15:00</p>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800/10" aria-hidden>
      <div className="h-full w-3/5 rounded-full bg-neutral-800" />
    </div>
  </div>,
]

export function Demo(props: CardSpreadProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [open, setOpen] = useState(false)

  // 自动播放：8 秒一轮，收起 1.2 秒后展开，展开 4.4 秒后收回，和循环视频等长。用户点按钮后停止。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const phase = time % 8
      const next = phase > 1.2 && phase < 5.6
      setOpen((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[#f2eee6] p-6">
      <CardSpread
        {...props}
        open={open}
        onOpenChange={(next) => {
          autoplay.current = false
          setOpen(next)
        }}
        className="w-full"
      >
        {CARDS}
      </CardSpread>
    </div>
  )
}
