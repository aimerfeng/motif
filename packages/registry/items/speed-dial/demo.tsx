import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SpeedDial, type SpeedDialProps } from './speed-dial'

const NOTES = [
  ['Sprint retro', 'Thursday, 16:00 in the long room', 'w-4/5'],
  ['Order lenses', 'Compare the two 35 mm quotes', 'w-2/3'],
  ['Studio moodboard', 'Linen, oak, a single green wall', 'w-3/4'],
  ['Invoice 0147', 'Send by Friday, net 30', 'w-1/2'],
] as const

export function Demo(props: SpeedDialProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [open, setOpen] = useState(false)

  // 自动播放：6 秒一轮，1 秒后展开，4.4 秒收起，和循环视频等长。用户点击后停止。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const phase = time % 6
      const next = phase > 1 && phase < 4.4
      setOpen((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const direction = props.direction ?? 'up'
  const corner = direction === 'down' ? 'top-5 right-5' : direction === 'left' ? 'bottom-5 right-5' : direction === 'right' ? 'bottom-5 left-5' : 'right-5 bottom-5'

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[#f4f2ee] p-4">
      <div className="relative h-full max-h-[340px] w-full max-w-[320px] overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_24px_60px_-30px_rgb(30_20_10/0.35)]">
        <div className="flex items-baseline justify-between px-5 pt-5">
          <p className="text-[17px] font-semibold tracking-tight text-neutral-900">Inbox</p>
          <p className="text-xs text-neutral-400">4 notes</p>
        </div>
        <ul className="mt-3 flex flex-col px-5">
          {NOTES.map(([title, detail, width]) => (
            <li key={title} className="border-t border-neutral-100 py-3">
              <p className="text-[13px] font-medium text-neutral-800">{title}</p>
              <p className="mt-0.5 truncate text-xs text-neutral-400">{detail}</p>
              <div className={`mt-2 h-1 rounded-full bg-neutral-100 ${width}`} aria-hidden />
            </li>
          ))}
        </ul>
        <div aria-hidden className={`pointer-events-none absolute inset-0 bg-white/80 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
        <SpeedDial
          {...props}
          open={open}
          onOpenChange={(next) => {
            autoplay.current = false
            setOpen(next)
          }}
          className={`absolute ${corner}`}
        />
      </div>
    </div>
  )
}
