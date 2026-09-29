import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TextScramble, type TextScrambleProps } from './text-scramble'

// 每 4 秒解码一次，两轮共 8 秒，与循环视频等长。
const CYCLE = 4

export function Demo(props: TextScrambleProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)

  // 用帧循环的时间切换 trigger：每个周期开头 trigger 由 false 变 true，触发一次解码。
  useFrameLoop(
    hostRef,
    ({ time }) => {
      const next = Math.floor(time / CYCLE)
      setRun((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b pb-4" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">node-07 — session</span>
        </div>
        <div className="pt-6 font-mono">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Status</p>
          {/* key 随周期变化，每个周期重新挂载并播放；悬停时也可以手动重播。 */}
          <TextScramble key={run} {...props} as="h2" className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground" />
          <p className="mt-5 text-sm text-muted-foreground">
            <span className="text-emerald-400">$</span> handshake ok · 3 peers · latency 41ms
          </p>
        </div>
      </div>
    </div>
  )
}
