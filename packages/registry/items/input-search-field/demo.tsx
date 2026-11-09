import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputSearchField, type InputSearchFieldProps } from './input-search-field'

const QUERY = 'invoice'
const ROWS = [
  { name: 'Invoice #1042 · Halden Studio', meta: 'Paid · Oct 28' },
  { name: 'Invoice #1041 · Corvo Labs', meta: 'Due in 6 days' },
  { name: 'Invoice template', meta: 'Doc · 2h ago' },
  { name: 'Quarterly report Q3', meta: 'Doc · Sep 30' },
  { name: 'Vendor onboarding', meta: '4 of 7 done' },
]

/** 一轮 8 秒：停顿 -> 逐字输入 -> 转圈 -> 结果 -> 清空。 */
function scripted(time: number) {
  const t = time % 8
  const typed = t < 0.8 ? 0 : Math.min(QUERY.length, Math.floor((t - 0.8) / 0.14) + 1)
  const text = t >= 6.8 ? '' : QUERY.slice(0, typed)
  const doneTyping = 0.8 + QUERY.length * 0.14
  const loading = text.length > 0 && t < doneTyping + 0.6
  return { text, loading }
}

export function Demo(props: InputSearchFieldProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(scripted(0))
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev.text === next.text && prev.loading === next.loading ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const query = manual ?? auto.text
  const rows = ROWS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border bg-card/60">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <span className="shrink-0 text-sm font-semibold tracking-tight text-foreground">Files</span>
          <InputSearchField
            {...props}
            placeholder="Search files..."
            value={query}
            loading={manual === null ? auto.loading : undefined}
            onChange={(v) => setManual(v)}
            className="min-w-0"
          />
        </div>
        <ul className="divide-y text-sm">
          {rows.length ? (
            rows.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="truncate text-foreground">{r.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{r.meta}</span>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-muted-foreground">No files match this search.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
