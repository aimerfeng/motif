import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ScrollAreaFade, type ScrollAreaFadeProps } from './scroll-area-fade'

const NOTES = [
  { version: '2.8.0', date: 'Nov 4', text: 'Offline drafts now sync in the background. Edits made on a train reconcile the moment you reconnect, with conflicts shown side by side.' },
  { version: '2.7.2', date: 'Oct 21', text: 'Search results open 40% faster on large workspaces. We moved indexing off the main thread and cache the last 200 queries locally.' },
  { version: '2.7.0', date: 'Oct 9', text: 'Shared folders get per-member permissions. Owners can grant view, comment or edit access without creating a separate space.' },
  { version: '2.6.4', date: 'Sep 26', text: 'Fixed a bug where pasted tables lost their column widths. Exports to Markdown keep alignment markers again.' },
  { version: '2.6.0', date: 'Sep 12', text: 'Keyboard shortcuts are now customizable from Settings. Press ? anywhere to see the current map.' },
]

const BOARDS = ['Backlog', 'In review', 'Design QA', 'Ready', 'Shipping', 'Done', 'Archived', 'Ideas']

/** 自动播放：8 秒一个来回，正弦缓动地滚到底再回来；用户一动手就停。 */
export function Demo(props: ScrollAreaFadeProps) {
  const host = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const axis = props.axis ?? 'vertical'

  useFrameLoop(
    host,
    ({ time }) => {
      const el = viewport.current
      if (manual || !el) return
      const p = 0.5 - 0.5 * Math.cos((time / 8) * Math.PI * 2)
      if (axis !== 'horizontal') el.scrollTop = p * (el.scrollHeight - el.clientHeight)
      if (axis !== 'vertical') el.scrollLeft = p * (el.scrollWidth - el.clientWidth)
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const stop = () => setManual(true)

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4" onWheel={stop} onPointerDown={stop} onKeyDown={stop} onTouchStart={stop}>
      <div className="w-full max-w-[26rem] min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <div className="text-sm font-semibold text-foreground">{axis === 'vertical' ? 'Release notes' : axis === 'horizontal' ? 'Boards' : 'Seat map'}</div>
          <div className="text-xs text-muted-foreground">{axis === 'vertical' ? 'Northdesk 2.x' : axis === 'horizontal' ? '8 columns' : 'Hall B · 100 seats'}</div>
        </div>
        <ScrollAreaFade {...props} viewportRef={viewport} aria-label="Release notes" className={axis === 'vertical' ? 'h-60 w-full border' : axis === 'horizontal' ? 'h-40 w-full border' : 'h-72 w-full border'}>
          {axis === 'vertical' && (
            <div className="flex flex-col gap-4 py-3 pr-6 pl-4">
              {NOTES.map((n) => (
                <div key={n.version} className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-mono font-semibold text-foreground">v{n.version}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="m-0 text-sm leading-[1.375rem] text-foreground/85">{n.text}</p>
                </div>
              ))}
            </div>
          )}
          {axis === 'horizontal' && (
            <ul className="m-0 flex list-none gap-3 p-3 pb-6">
              {BOARDS.map((b, i) => (
                <li key={b} className="flex h-24 w-36 shrink-0 flex-col justify-between rounded-md bg-muted p-3">
                  <span className="text-sm font-medium text-foreground">{b}</span>
                  <span className="text-xs text-muted-foreground">{(i * 7 + 3) % 19} cards</span>
                </li>
              ))}
            </ul>
          )}
          {axis === 'both' && (
            <div className="pt-3 pr-6 pb-6 pl-3">
              <ul className="m-0 grid list-none grid-cols-[repeat(10,4.5rem)] grid-rows-[repeat(10,4.5rem)] gap-3 p-0">
                {Array.from({ length: 100 }, (_, i) => (
                  <li key={i} className="flex items-center justify-center rounded-sm bg-muted text-sm font-bold text-muted-foreground">
                    {String.fromCharCode(65 + Math.floor(i / 10))}
                    {(i % 10) + 1}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ScrollAreaFade>
      </div>
    </div>
  )
}
