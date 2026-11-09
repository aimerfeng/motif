import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ReactionCounter, type ReactionCounterProps } from './button-reaction-counter'

const POSTS = [
  { title: 'Dark mode for the embed widget', meta: 'Feature request · 14 comments', offset: 0 },
  { title: 'Export boards as CSV', meta: 'Planned · 6 comments', offset: -187 },
  { title: 'Keyboard shortcut to archive', meta: 'Under review · 3 comments', offset: -204 },
]

type V = -1 | 0 | 1

/** 一轮 8 秒：依次给几条帖子投票，最后撤回。 */
function scripted(time: number): V[] {
  const t = time % 8
  return [t >= 1 && t < 6.5 ? 1 : 0, t >= 2.2 && t < 7 ? 1 : 0, t >= 3.4 && t < 5 ? -1 : t >= 5 && t < 7.4 ? 1 : 0]
}

export function Demo(props: ReactionCounterProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<V[]>([0, 0, 0])
  const [manual, setManual] = useState<V[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.every((v, i) => v === next[i]) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const values = manual ?? auto
  const base = props.initialCount ?? 235
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[460px] rounded-xl border bg-card p-4 shadow-xl shadow-black/20">
        <div className="mb-2 text-sm font-semibold">Feedback board</div>
        <ul className="divide-y divide-border">
          {POSTS.map((post, i) => (
            <li key={post.title} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{post.title}</div>
                <div className="truncate text-xs text-muted-foreground">{post.meta}</div>
              </div>
              <ReactionCounter
                {...props}
                initialCount={Math.max(1, base + post.offset)}
                value={values[i]}
                onValueChange={(v) => {
                  const next = [...values]
                  next[i] = v
                  setManual(next)
                }}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
