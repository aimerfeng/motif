import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { CommentPin, type CommentPinProps } from './comment-pin'

const OTHERS = [
  { id: 'b', author: 'Theo Lind', timestamp: '2h', message: 'Can the legend wrap under the title on mobile?', accent: '#0ea5e9', at: { left: '62%', top: '30%' } },
  { id: 'c', author: 'Sana Iyer', timestamp: 'Yesterday', message: 'Approved. Ship it after the copy pass.', accent: '#f97316', at: { left: '58%', top: '88%' } },
]

/** 一轮 8 秒：先展开主评论，再换到右上角那条。 */
function scripted(time: number): string | null {
  const t = time % 8
  if (t >= 0.8 && t < 4.2) return 'a'
  if (t >= 5 && t < 7.4) return 'b'
  return null
}

export function Demo(props: CommentPinProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string | null>(null)
  const [manual, setManual] = useState<string | null | undefined>(undefined)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== undefined) return
      const next = scripted(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  const active = manual === undefined ? auto : manual
  const change = (id: string) => (isOpen: boolean) => {
    if (isOpen) setManual(id)
    else setManual((prev) => (prev === id || prev === undefined ? null : prev))
  }

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-muted p-4">
      <div className="relative aspect-[4/3] w-full max-w-[440px] rounded-xl border bg-background p-5 shadow-sm">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Revenue · Q3</div>
        <div className="mb-4 text-xl font-semibold text-foreground">$48,210</div>
        <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="h-[45%] w-full text-primary" aria-hidden="true">
          <path d="M0 58 C30 52 40 40 70 42 S110 22 140 26 S180 8 200 10 L200 70 L0 70 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M0 58 C30 52 40 40 70 42 S110 22 140 26 S180 8 200 10" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-3 flex gap-2">
          <span className="h-2 w-16 rounded-full bg-muted" />
          <span className="h-2 w-10 rounded-full bg-muted" />
        </div>

        <CommentPin {...props} className="absolute" style={{ left: '10%', top: '62%' }} open={active === 'a'} onOpenChange={change('a')} />
        {OTHERS.map((c) => (
          <CommentPin
            key={c.id}
            {...props}
            author={c.author}
            timestamp={c.timestamp}
            message={c.message}
            accent={c.accent}
            className="absolute"
            style={c.at}
            open={active === c.id}
            onOpenChange={change(c.id)}
          />
        ))}
      </div>
    </div>
  )
}
