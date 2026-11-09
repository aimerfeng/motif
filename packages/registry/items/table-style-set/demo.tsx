import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { sampleRows, TableStyles, type TableStylesProps } from './table-style-set'

const LOOP = 8

/** 一轮 8 秒：模拟指针从上到下扫过各行；行选择样式下依次勾选两行。 */
function scripted(time: number) {
  const t = time % LOOP
  const row = Math.floor(t / 1.2)
  const highlight = row < sampleRows.length ? row : -1
  const selected: string[] = []
  if (t > 1.4) selected.push('2')
  if (t > 3.8) selected.push('4')
  return { highlight, selected: t > 7 ? [] : selected }
}

export function Demo(props: TableStylesProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState({ highlight: -1, selected: ['2'] as string[] })
  const [manual, setManual] = useState<string[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.highlight === next.highlight && prev.selected.join() === next.selected.join() ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.2 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-3xl min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Customer balances</h2>
          <span className="text-xs text-muted-foreground">Updated 2 min ago</span>
        </div>
        <TableStyles
          {...props}
          highlightRow={manual ? undefined : auto.highlight}
          selected={manual ?? auto.selected}
          onSelectedChange={setManual}
        />
      </div>
    </div>
  )
}
