import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { RippleButton, type RippleButtonProps } from './ripple-button'

/** 自动播放：每 1.6 秒在按钮上的不同位置「点」一下，用户真正点过之后停止。 */
const SPOTS = [
  [0.28, 0.55],
  [0.72, 0.4],
  [0.5, 0.6],
  [0.85, 0.5],
  [0.15, 0.45],
] as const
const PERIOD = 1.6

export function Demo(props: RippleButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const last = useRef<number | null>(null)
  const manual = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      const prev = last.current
      last.current = time
      const el = button.current
      if (prev === null || manual.current || !el) return
      const beat = Math.floor((time + 0.6) / PERIOD)
      if (beat === Math.floor((prev + 0.6) / PERIOD)) return
      const [fx, fy] = SPOTS[beat % SPOTS.length]!
      const rect = el.getBoundingClientRect()
      el.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 1, clientX: rect.left + rect.width * fx, clientY: rect.top + rect.height * fy }),
      )
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[340px] rounded-2xl border bg-card p-5 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold text-card-foreground">Confirm transfer</p>
        <p className="mt-1 text-xs text-muted-foreground">Move 3 projects from Fernhill Studio to the Atlas workspace.</p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" className="rounded-md px-3 py-2 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
          <RippleButton
            {...props}
            ref={button}
            onPointerDown={(event) => {
              if (event.isTrusted) manual.current = true
            }}
          />
        </div>
      </div>
    </div>
  )
}
