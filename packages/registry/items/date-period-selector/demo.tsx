import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DatePeriodSelector, formatDateValue, type DatePeriodSelectorProps, type DateSelectorValue } from './date-period-selector'

/* 自动播放脚本：一轮 10 秒，依次切换比较方式、粒度并点选区间，最后应用并关闭。 */
const STEPS: { at: number; open: boolean; draft: DateSelectorValue; applied?: DateSelectorValue }[] = [
  { at: 0, open: true, draft: { period: 'month', operator: 'is' } },
  { at: 1.0, open: true, draft: { period: 'month', operator: 'is', year: 2025, month: 2 } },
  { at: 2.2, open: true, draft: { period: 'month', operator: 'between' } },
  { at: 3.0, open: true, draft: { period: 'month', operator: 'between', year: 2025, month: 3, rangeStart: { year: 2025, value: 3 } } },
  { at: 3.8, open: true, draft: { period: 'month', operator: 'between', year: 2025, month: 3, rangeStart: { year: 2025, value: 3 }, rangeEnd: { year: 2025, value: 8 } } },
  { at: 5.0, open: true, draft: { period: 'quarter', operator: 'between' } },
  { at: 5.9, open: true, draft: { period: 'quarter', operator: 'between', year: 2025, quarter: 0, rangeStart: { year: 2025, value: 0 } } },
  { at: 6.7, open: true, draft: { period: 'quarter', operator: 'between', year: 2025, quarter: 0, rangeStart: { year: 2025, value: 0 }, rangeEnd: { year: 2025, value: 2 } } },
]
const CLOSED_AT = 8.0
const APPLIED: DateSelectorValue = STEPS[STEPS.length - 1].draft

function stepAt(time: number) {
  const t = time % 10
  if (t >= CLOSED_AT) return -1
  let index = 0
  STEPS.forEach((s, i) => {
    if (t >= s.at) index = i
  })
  return index
}

const ROWS = [
  { id: 'INV-2041', client: 'Northwind Atelier', period: 'Q1 2025', amount: '$12,480.00' },
  { id: 'INV-2057', client: 'Halden & Rowe', period: 'Q2 2025', amount: '$8,215.50' },
  { id: 'INV-2063', client: 'Fernhill Studio', period: 'Q3 2025', amount: '$21,900.00' },
]

export function Demo(props: DatePeriodSelectorProps) {
  const host = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [manual, setManual] = useState(false)
  const [applied, setApplied] = useState<DateSelectorValue | undefined>(APPLIED)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = stepAt(time)
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.2 },
  )

  const auto = !manual
  const current = step >= 0 ? STEPS[step] : null

  return (
    <div ref={host} className="flex h-full w-full justify-center overflow-hidden bg-background px-4 pt-10 sm:pt-14" onPointerDown={() => setManual(true)}>
      <div className="w-full max-w-[560px]">
        <div className="mb-1 text-sm font-semibold">Invoices</div>
        <div className="mb-4 text-xs text-muted-foreground">Filter by billing period before exporting.</div>
        <div className="flex flex-wrap items-center gap-3">
          <DatePeriodSelector
            {...props}
            label="Billing period"
            open={auto ? Boolean(current) : undefined}
            draft={auto ? current?.draft : undefined}
            applied={auto ? APPLIED : applied}
            onApply={setApplied}
          />
          <span className="text-xs text-muted-foreground">{applied ? `Showing ${formatDateValue(auto ? APPLIED : applied)}` : 'All periods'}</span>
        </div>
        <div className="mt-5 divide-y divide-border/70 rounded-xl border bg-card/60 text-sm">
          {ROWS.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{row.client}</div>
                <div className="text-xs text-muted-foreground">
                  {row.id} · {row.period}
                </div>
              </div>
              <div className="tabular-nums">{row.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
