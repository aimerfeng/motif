import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { TableCohortRetention, type TableCohortRetentionProps } from './table-cohort-retention'

/** 自动播放：12 秒一个来回，慢慢横向滚动表格，展示固定的同期群列；用户自己滚动后停止。 */
export function Demo(props: TableCohortRetentionProps) {
  const host = useRef<HTMLDivElement>(null)
  const manual = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual.current) return
      const scroller = host.current?.querySelector<HTMLElement>('[data-cohort-scroll]')
      if (!scroller) return
      const max = scroller.scrollWidth - scroller.clientWidth
      const phase = 0.5 - 0.5 * Math.cos((time / 12) * Math.PI * 2)
      scroller.scrollLeft = max * phase
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div
      ref={host}
      onWheel={stop}
      onPointerDown={stop}
      onKeyDown={stop}
      className="h-full w-full overflow-y-auto bg-background p-4 sm:p-8"
    >
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <TableCohortRetention
          {...props}
          title="Weekly retention"
          description="Share of each signup week that came back to Lumen in the weeks that followed."
        />
      </div>
    </div>
  )
}
