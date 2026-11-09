import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TableBulkSelect, workspaces, type TableBulkSelectProps } from './table-bulk-select'

/** 一轮 10 秒的勾选脚本：逐行勾选、全选、取消一行变半选，最后清空。 */
const SCRIPT: [number, number[]][] = [
  [0, [2]],
  [1.2, [2, 4]],
  [2.2, [2, 4, 5]],
  [3.6, workspaces.map((_, i) => i)],
  [5.2, workspaces.map((_, i) => i).filter((i) => i !== 0)],
  [6.6, [1, 3]],
  [8.2, []],
]

function scripted(time: number) {
  const t = time % 10
  let current: number[] = []
  for (const [at, sel] of SCRIPT) if (t >= at) current = sel
  return current
}

export function Demo(props: TableBulkSelectProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<number[]>([2])
  const [manual, setManual] = useState<number[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background p-4 sm:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Workspaces</h2>
          <p className="text-sm text-muted-foreground">Select workspaces to edit or remove them in bulk.</p>
        </div>
        <TableBulkSelect {...props} selected={manual ?? auto} onSelectedChange={setManual} onDelete={() => setManual([])} />
      </div>
    </div>
  )
}
