import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ToastStack, type ToastData, type ToastStackProps } from './toast-stack'

const CYCLE = 14

type Step = { at: number; apply: (list: ToastData[]) => ToastData[] }

const upsert = (list: ToastData[], toast: ToastData) => (list.some((t) => t.id === toast.id) ? list.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)) : [...list, toast])

const STEPS: Step[] = [
  { at: 0.8, apply: (l) => upsert(l, { id: 'deploy', type: 'loading', title: 'Publishing site…', description: 'Building 42 pages' }) },
  { at: 2.6, apply: (l) => upsert(l, { id: 'deploy', type: 'success', title: 'Site published', description: 'acme.dev is live on all regions' }) },
  { at: 3.4, apply: (l) => upsert(l, { id: 'comment', type: 'info', title: 'Mira left a comment', description: 'On “Pricing page redesign”', action: { label: 'Reply' } }) },
  { at: 4.6, apply: (l) => upsert(l, { id: 'card', type: 'error', title: 'Payment failed', description: 'The card ending 4242 was declined.' }) },
  { at: 9.6, apply: (l) => upsert(l, { id: 'backup', type: 'success', title: 'Backup complete', description: '2.4 GB stored' }) },
]

const ROWS = [
  ['main', 'a3f9c21', 'Add annual pricing toggle', '2m ago'],
  ['main', '81be0d4', 'Fix navbar focus ring', '1h ago'],
  ['preview', 'c07a5e9', 'Update hero copy', '3h ago'],
  ['main', '5d2f7b0', 'Bump dependencies', 'Yesterday'],
]

function Backdrop() {
  return (
    <div className="absolute inset-0 flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-primary/25" />
          <div className="text-sm font-medium text-foreground">Acme · Deployments</div>
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-lg bg-muted" />
          <div className="h-7 w-24 rounded-lg bg-primary/70" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Uptime', '99.98%'],
          ['Builds today', '14'],
          ['Avg. build', '48 s'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-3.5">
            <p className="text-[11px] text-muted-foreground">{k}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-card-foreground">{v}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {ROWS.map(([branch, sha, message, when]) => (
          <div key={sha} className="flex items-center gap-3 border-b px-4 py-2.5 text-xs last:border-b-0">
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{branch}</span>
            <span className="font-mono text-muted-foreground">{sha}</span>
            <span className="flex-1 truncate text-card-foreground">{message}</span>
            <span className="text-muted-foreground">{when}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Demo(props: ToastStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [expanded, setExpanded] = useState(false)
  const last = useRef(-1)

  // 演示的时间线跟着 useFrameLoop 走：截图时钟下也能按时出现。循环回到开头时清空。
  useFrameLoop(
    ref,
    ({ time }) => {
      const t = time % CYCLE
      if (t < last.current) {
        last.current = -1
        setToasts([])
      }
      setExpanded(t >= 5.8 && t < 9.2)
      const due = STEPS.filter((step) => step.at > last.current && step.at <= t)
      last.current = t
      if (due.length) setToasts((list) => due.reduce((acc, step) => step.apply(acc), list))
    },
    { reducedMotion: 'static', staticTime: 5.2 },
  )

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-60"><Backdrop /></div>
      <ToastStack {...props} expanded={expanded || undefined} toasts={toasts} onDismiss={(id) => setToasts((list) => list.filter((t) => t.id !== id))} />
    </div>
  )
}
