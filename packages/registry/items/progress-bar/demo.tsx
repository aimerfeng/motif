import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ProgressBar, type ProgressBarProps } from './progress-bar'

const TOTAL_MB = 48.2
const UPLOAD = 7 // 上传用时（秒）
const CYCLE = 10.5

/** 分块上传的进度：每 0.5 秒推进一块，速度先快后慢再收尾。 */
function progressAt(time: number): number {
  const t = time % CYCLE
  if (t >= UPLOAD) return 100
  const step = Math.floor(t / 0.5) * 0.5
  const x = step / UPLOAD
  return Math.min(100, Math.round(100 * (1 - (1 - x) ** 1.7)))
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  )
}

export function Demo(props: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)
  // 减少动态效果时停在 64% 这一帧
  useFrameLoop(ref, ({ time }) => setValue(progressAt(time)), { reducedMotion: 'static', staticTime: 3.6 })
  const done = value >= 100
  const sent = (TOTAL_MB * value) / 100
  const left = Math.max(1, Math.round(((100 - value) / 100) * 11))

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <FileIcon />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-card-foreground">brand-assets-v3.zip</p>
            <p className="text-xs text-muted-foreground">{TOTAL_MB} MB</p>
          </div>
        </div>
        <ProgressBar {...props} value={value} label={done ? 'Upload complete' : 'Uploading'} />
        <p className="mt-3 text-xs tabular-nums text-muted-foreground">
          {done ? 'Saved to Brand / Assets' : `${sent.toFixed(1)} MB of ${TOTAL_MB} MB · about ${left} s left`}
        </p>
      </div>
    </div>
  )
}
