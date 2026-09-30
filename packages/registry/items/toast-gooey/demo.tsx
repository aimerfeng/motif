import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ToastGooey, type GooeyToastData, type ToastGooeyProps } from './toast-gooey'

/** 每条 toast 占一个时间槽：前 SHOW 秒显示，之后退场，留一点空档再出下一条。 */
const SLOT = 5.2
const SHOW = 4.7

const TOASTS: GooeyToastData[] = [
  { id: 'paid', type: 'success', title: 'Payment received', description: '$48.00 from Ava Chen for Invoice #2041.', action: { label: 'View receipt' } },
  { id: 'failed', type: 'error', title: 'Upload failed', description: 'brand-assets.zip is over the 25 MB limit.', action: { label: 'Retry' } },
  { id: 'update', type: 'info', title: 'New version available', description: 'Version 2.4 adds tab groups and much faster search.', action: { label: 'Update now' } },
]

function Backdrop() {
  return (
    <div className="absolute inset-0 flex flex-col gap-4 px-8 pb-6 pt-40 opacity-50" aria-hidden>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Invoices</p>
          <p className="text-[11px] text-muted-foreground">September 2026</p>
        </div>
        <div className="h-7 w-24 rounded-lg bg-primary/70" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {[
          ['#2041', 'Ava Chen', '$48.00', 'Paid'],
          ['#2040', 'Northwind Ltd.', '$1,240.00', 'Open'],
          ['#2039', 'Kenji Arai', '$320.00', 'Paid'],
        ].map(([id, name, amount, status]) => (
          <div key={id} className="flex items-center gap-3 border-b px-4 py-2.5 text-xs last:border-b-0">
            <span className="font-mono text-muted-foreground">{id}</span>
            <span className="flex-1 truncate text-card-foreground">{name}</span>
            <span className="tabular-nums text-card-foreground">{amount}</span>
            <span className="w-10 text-right text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Demo(props: ToastGooeyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<GooeyToastData | null>(null)
  const current = useRef<string | null>(null)

  // 时间线跟着 useFrameLoop：截图时钟下也能按时出现。
  useFrameLoop(
    ref,
    ({ time }) => {
      const slot = Math.floor(time / SLOT)
      const inSlot = time - slot * SLOT
      const next = inSlot < SHOW ? TOASTS[slot % TOASTS.length]! : null
      const key = next ? `${slot}:${next.id}` : null
      if (key !== current.current) {
        current.current = key
        setToast(next ? { ...next, id: `${slot}:${next.id}` } : null)
      }
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )

  const align = props.align ?? 'center'
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-background">
      <Backdrop />
      <div className="absolute inset-x-0 top-12 px-6">
        <ToastGooey {...props} align={align} toast={toast} />
      </div>
    </div>
  )
}
