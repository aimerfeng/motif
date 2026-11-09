import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChipFilterGroup, type Chip, type ChipFilterGroupProps } from './chip-filter-group'

const CHIPS: Chip[] = [
  { id: 'production', label: 'Production', tone: 'success', count: 24 },
  { id: 'preview', label: 'Preview', tone: 'warning', count: 12 },
  { id: 'failed', label: 'Failed', tone: 'danger', count: 3 },
  { id: 'canceled', label: 'Canceled', tone: 'neutral', count: 5 },
]

const ROWS = [
  { name: 'checkout-api', env: 'production', when: '2m ago', commit: 'a41f9c2' },
  { name: 'web-dashboard', env: 'preview', when: '9m ago', commit: '7be03d1' },
  { name: 'search-indexer', env: 'failed', when: '14m ago', commit: 'c90e5a8' },
  { name: 'docs-site', env: 'production', when: '31m ago', commit: '3fd27b6' },
  { name: 'billing-worker', env: 'canceled', when: '1h ago', commit: 'e1c88a0' },
]

/** 一轮 10 秒：依次点选或删除几个标签，再全部清除，最后回到初始状态。 */
function scripted(time: number, removable: boolean): string[] {
  const t = time % 10
  if (removable) {
    if (t < 1.5) return ['production', 'preview', 'failed', 'canceled']
    if (t < 3) return ['production', 'preview', 'failed']
    if (t < 4.5) return ['production', 'failed']
    if (t < 6.5) return ['failed']
    if (t < 8) return []
    return ['production', 'preview', 'failed', 'canceled']
  }
  if (t < 1.5) return ['production']
  if (t < 3) return ['production', 'preview']
  if (t < 4.5) return ['production', 'preview', 'failed']
  if (t < 6.5) return ['preview', 'failed']
  if (t < 8) return []
  return ['production']
}

export function Demo(props: ChipFilterGroupProps) {
  const host = useRef<HTMLDivElement>(null)
  const removable = props.chipType === 'removable'
  const [auto, setAuto] = useState<string[]>(() => scripted(0, removable))
  const [manual, setManual] = useState<string[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, removable)
      setAuto((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  const value = manual ?? auto
  const rows = value.length === 0 ? ROWS : ROWS.filter((r) => value.includes(r.env))

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[440px] rounded-xl border bg-card p-4 shadow-xl shadow-black/20">
        <div className="mb-1 text-sm font-semibold text-foreground">Deployments</div>
        <div className="mb-3 text-xs text-muted-foreground">{rows.length} of {ROWS.length} shown</div>
        <ChipFilterGroup {...props} chips={CHIPS} label="Filter deployments" value={value} onValueChange={setManual} />
        <ul className="mt-4 divide-y divide-border/70 text-sm">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate font-medium text-foreground">{r.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {r.commit} · {r.when}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
