import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PaginationPages, type PaginationPagesProps } from './pagination-pages'

/* 自动播放：每 0.9 秒换一页，走一圈 2 → 3 → 4 → 5 → 9 → 16 → 15 → 3 */
const SCRIPT = [2, 3, 4, 5, 9, 16, 15, 3]
const STEP = 0.9

const NAMES = ['Aster Vale', 'Brook Imani', 'Cato Reyes', 'Dara Holm', 'Eli Sato', 'Fen Okafor']
const STATUS = ['Paid', 'Pending', 'Paid', 'Refunded', 'Paid', 'Pending']

export function Demo(props: PaginationPagesProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [page, setPage] = useState(2)
  const [size, setSize] = useState(20)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = SCRIPT[Math.floor(time / STEP) % SCRIPT.length]
      setPage((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const rows = Array.from({ length: 4 }, (_, i) => {
    const n = (page - 1) * size + i + 1
    return { id: `ORD-${(4800 + n).toString()}`, name: NAMES[n % NAMES.length], status: STATUS[n % STATUS.length], amount: `$${((n * 37) % 900) + 40}.00` }
  })

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center overflow-hidden bg-background px-4" onPointerDown={() => setManual(true)}>
      <div className="w-full max-w-[760px]">
        <div className="mb-3 text-sm font-semibold">Orders</div>
        <div className="mb-4 overflow-hidden rounded-lg border text-sm">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0">
              <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{r.id}</span>
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              <span className="hidden text-muted-foreground sm:block">{r.status}</span>
              <span className="tabular-nums">{r.amount}</span>
            </div>
          ))}
        </div>
        <PaginationPages
          {...props}
          total={312}
          page={page}
          onPageChange={(p) => {
            setManual(true)
            setPage(p)
          }}
          pageSize={size}
          onPageSizeChange={(s) => {
            setManual(true)
            setSize(s)
          }}
        />
      </div>
    </div>
  )
}
