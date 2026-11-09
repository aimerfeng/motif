import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { RecordPlayToggle, type RecordPlayToggleProps } from './record-play-toggle'

const LOOP = 8

/** 自动播放：进度随时间前进，每轮在 5.2–6.4 秒暂停一下，展示播放 / 暂停图标的切换。 */
export function Demo(props: RecordPlayToggleProps) {
  const host = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)
  const [manual, setManual] = useState<{ playing: boolean; progress: number } | null>(null)
  const base = props.progress ?? 0.35

  useFrameLoop(
    host,
    ({ time: t }) => {
      if (manual) return
      const next = Math.round(t * 20) / 20
      setTime((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  const t = time % LOOP
  const autoPaused = t >= 5.2 && t < 6.4
  const playing = manual ? manual.playing : (props.playing ?? true) && !autoPaused
  const progress = manual ? manual.progress : (base + Math.min(t, 5.2) * 0.012) % 1

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_100%,oklch(0.32_0.08_340/0.35),transparent)] bg-background p-4">
      <div className="w-full max-w-[340px] rounded-2xl border bg-card/70 p-4 shadow-2xl shadow-black/30">
        <div className="mb-3 flex items-center justify-between text-[11px] tracking-wide text-muted-foreground uppercase">
          <span>Now playing</span>
          <span className="tabular-nums">Side A · 03</span>
        </div>
        <RecordPlayToggle
          {...props}
          title="Midnight Drive"
          artist="Lowlight Radio"
          playing={playing}
          progress={progress}
          onPlayingChange={(p) => setManual({ playing: p, progress })}
          onSeek={(p) => setManual({ playing, progress: p })}
          className="w-full"
        />
      </div>
    </div>
  )
}
