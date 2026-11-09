import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { initialTicket, TicketWizardDrawer, type TicketFormData, type TicketWizardDrawerProps } from './drawer-ticket-wizard'

type DemoProps = Omit<TicketWizardDrawerProps, 'open' | 'onOpenChange'>

const CREATED = '2026-03-12T09:41:00'
const NOTE = 'Rear-ended at a stop light on Maple Ave. No injuries, bumper and tail light damaged. Caller has photos.'

type Auto = { open: boolean; step: number; data: TicketFormData }

const base: TicketFormData = { ...initialTicket(), created: CREATED, duration: '12' }

/** 一轮 12 秒：打开抽屉，选类型 → 继续 → 选优先级、输入描述 → 核对 → 关闭。 */
function scripted(time: number): Auto {
  const t = time % 12
  if (t < 0.6) return { open: false, step: 1, data: base }
  const type = t < 1.9 ? 'fnol' : 'claims'
  const category = t < 2.9 ? base.category : 'claim-status'
  if (t < 3.9) return { open: true, step: 1, data: { ...base, type, category } }
  const priority = t < 4.7 ? 'emergency' : 'high'
  const chars = Math.max(0, Math.min(NOTE.length, Math.floor((t - 5) * 40)))
  const step1 = { ...base, type, category, priority, description: NOTE.slice(0, chars) }
  if (t < 8) return { open: true, step: 2, data: step1 }
  if (t < 11) return { open: true, step: 3, data: step1 }
  return { open: false, step: 3, data: step1 }
}

const queue = [
  { id: 'TK-2081', title: 'Windshield chip after hailstorm', who: 'R. Okafor', p: 'Medium', age: '12m' },
  { id: 'TK-2079', title: 'Update beneficiary on life policy', who: 'L. Brandt', p: 'Low', age: '38m' },
  { id: 'TK-2074', title: 'Water leak in kitchen ceiling', who: 'M. Iwasaki', p: 'High', age: '1h' },
  { id: 'TK-2070', title: 'Duplicate charge on March invoice', who: 'S. Varga', p: 'Medium', age: '2h' },
]

export function Demo(props: DemoProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>(() => scripted(0))
  const [manual, setManual] = useState(false)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<TicketFormData>(base)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) =>
        prev.open === next.open && prev.step === next.step && JSON.stringify(prev.data) === JSON.stringify(next.data) ? prev : next,
      )
    },
    { reducedMotion: 'static', staticTime: 2.8 },
  )

  const takeOver = () => {
    if (manual) return
    setOpen(auto.open)
    setStep(auto.step)
    setData(auto.data)
    setManual(true)
  }

  const state = manual ? { open, step, data } : auto

  return (
    <div ref={host} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="relative h-full w-full overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full max-w-3xl flex-col p-4 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold">Support queue</h1>
            <p className="text-sm text-muted-foreground">Harbor Mutual · Claims desk</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setData({ ...initialTicket() })
              setOpen(true)
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            New ticket
          </button>
        </div>
        <ul className="mt-6 divide-y divide-border rounded-md border border-border">
          {queue.map((q) => (
            <li key={q.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{q.id}</span>
              <span className="min-w-0 flex-1 truncate">{q.title}</span>
              <span className="hidden text-muted-foreground sm:inline">{q.who}</span>
              <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">{q.p}</span>
              <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{q.age}</span>
            </li>
          ))}
        </ul>
      </div>
      <TicketWizardDrawer
        {...props}
        contained
        open={state.open}
        onOpenChange={setOpen}
        step={state.step}
        onStepChange={setStep}
        formData={state.data}
        onFormDataChange={setData}
      />
    </div>
  )
}
