import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { ExplodingInput, type ExplodingInputProps } from './input-exploding'

const SCRIPT = 'ada@lumen.studio'
const CYCLE = 8
const START = 0.5
const STEP = 0.16

/** 自动播放：按帧循环时间逐字「打字」，派发真实的 input 事件；用户一聚焦就停。 */
export function Demo(props: ExplodingInputProps) {
  const host = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const manual = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      const el = input.current
      if (!el || manual.current) return
      const t = time % CYCLE
      const typed = Math.max(0, Math.min(SCRIPT.length, Math.floor((t - START) / STEP) + 1))
      const next = t > CYCLE - 0.6 ? '' : SCRIPT.slice(0, typed)
      if (el.value === next) return
      const added = next.length > el.value.length ? next.slice(el.value.length) : null
      el.value = next
      if (added) el.dispatchEvent(new InputEvent('input', { data: added, inputType: 'insertText', bubbles: true }))
    },
    { reducedMotion: 'static', staticTime: START + STEP * SCRIPT.length },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background p-6">
      <div className="w-full max-w-[300px]">
        <div className="mb-1 text-sm font-semibold text-foreground">Join the waitlist</div>
        <div className="mb-5 text-xs text-muted-foreground">We send one email when your seat opens.</div>
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            ref={input}
            type="email"
            placeholder="you@domain.com"
            autoComplete="off"
            onFocus={() => {
              manual.current = true
            }}
            className="h-10 w-full rounded-none border-b border-border bg-transparent p-0 text-base font-medium text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground focus-visible:border-foreground"
          />
          <ExplodingInput {...props} className="z-50" />
        </label>
      </div>
    </div>
  )
}
