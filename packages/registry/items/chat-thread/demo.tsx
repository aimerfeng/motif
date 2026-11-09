import { useFrameLoop } from '@motif/runtime'
import { useMemo, useRef, useState } from 'react'
import { ChatThread, type ChatItem, type ChatThreadProps } from './chat-thread'

const THREAD: ChatItem[] = [
  { type: 'day', id: 'd1', text: 'Yesterday' },
  { type: 'message', id: 'm1', author: 'Mira Okafor', hue: 330, text: 'Pushed the new onboarding copy to the staging branch.', time: '6:42 PM' },
  { type: 'message', id: 'm2', author: 'Mira Okafor', hue: 330, text: 'Can someone sanity-check the empty states before tomorrow?' , reactions: ['👀'] },
  { type: 'message', id: 'm3', author: 'You', align: 'end', text: 'On it first thing.', time: '6:51 PM' },
  { type: 'day', id: 'd2', text: 'Today' },
  { type: 'system', id: 's1', text: 'Jonas Reyes joined #launch-week' },
  { type: 'message', id: 'm4', author: 'Jonas Reyes', hue: 190, attachments: [{ name: 'empty-states-v3.fig', meta: '2.4 MB · Figma file', kind: 'image' }] },
  { type: 'message', id: 'm5', author: 'Jonas Reyes', hue: 190, text: 'Here are the empty states with the new illustrations.', time: '9:14 AM' },
  { type: 'message', id: 'm6', author: 'You', align: 'end', text: 'These read much better. The inbox one is perfect.', reactions: ['❤️', '🔥'] },
  { type: 'message', id: 'm7', author: 'You', align: 'end', text: 'Shipping them with the 2.8 release.', time: '9:16 AM' },
  { type: 'message', id: 'm8', author: 'Mira Okafor', hue: 330, attachments: [{ name: 'release-notes-2.8.pdf', meta: '184 KB · PDF', kind: 'doc' }] },
  { type: 'message', id: 'm9', author: 'Mira Okafor', hue: 330, text: 'Release notes are ready too. Ship it 🚀', time: '9:18 AM', reactions: ['🙌'] },
]

const LOOP = 12
/** 消息出现的时间点（秒），之前的条目一开始就在。 */
const BEATS: [index: number, at: number, typing?: string][] = [
  [6, 0.7, 'Jonas Reyes'],
  [7, 2.0, 'Jonas Reyes'],
  [8, 3.2],
  [9, 4.1],
  [10, 5.5, 'Mira Okafor'],
  [11, 6.9, 'Mira Okafor'],
]
const START = 6

function phase(t: number) {
  let count = START
  let typing: string | null = null
  for (const [index, at, who] of BEATS) {
    if (t >= at) count = index + 1
    else {
      if (who && t >= at - 1) typing = who
      break
    }
  }
  return { count, typing }
}

export function Demo({ autoplay = true, ...props }: ChatThreadProps) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<{ count: number; typing: string | null }>({ count: autoplay ? START : THREAD.length, typing: null })
  const [manual, setManual] = useState(false)
  const scrolled = useRef<'none' | 'up' | 'back'>('none')

  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay || manual) return
      const t = time % LOOP
      const next = phase(t)
      setState((prev) => (prev.count === next.count && prev.typing === next.typing ? prev : next))
      // 演示「回到最新」：滚上去再点胶囊按钮
      const viewport = host.current?.querySelector<HTMLElement>('[data-slot=message-scroller-viewport]')
      if (!viewport) return
      if (t < 8.4) scrolled.current = 'none'
      else if (t < 10.4 && scrolled.current === 'none') {
        scrolled.current = 'up'
        viewport.scrollTop = Math.max(0, viewport.scrollTop - 220)
      } else if (t >= 10.4 && scrolled.current === 'up') {
        scrolled.current = 'back'
        host.current?.querySelector<HTMLButtonElement>('[data-slot=message-scroller-button]')?.click()
      }
    },
    { reducedMotion: 'static', staticTime: 7.6 },
  )

  const items = useMemo(() => THREAD.slice(0, manual || !autoplay ? THREAD.length : state.count), [state.count, manual, autoplay])

  return (
    <div
      ref={host}
      className="grid h-full w-full place-items-center bg-background p-3 sm:p-6"
      onWheel={() => setManual(true)}
      onPointerDown={() => setManual(true)}
      onTouchStart={() => setManual(true)}
    >
      <div className="flex h-full max-h-[560px] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-muted text-sm font-semibold" aria-hidden>
            #
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">launch-week</div>
            <div className="truncate text-xs text-muted-foreground">3 members · Release 2.8</div>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ChatThread {...props} items={items} typing={manual || !autoplay ? null : state.typing} />
        </div>
      </div>
    </div>
  )
}
