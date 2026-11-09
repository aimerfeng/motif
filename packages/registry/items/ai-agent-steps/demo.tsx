import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AgentRunSteps, defaults, type AgentRunStepsProps, type AgentStep, type ToolPart } from './ai-agent-steps'

const QUESTION = 'How did Q3 churn compare with last year? Draft a short note for the growth team.'

const ANSWER =
  'Q3 churn was 4.1%, down from 5.2% a year ago. Most of the drop came from annual plans, launched Aug 12. Draft for the growth team is ready to review.'

type Entry = { at: number; item?: string; tool?: { part: Omit<ToolPart, 'state'>; error?: boolean } }
type Script = { id: string; title: string; icon: AgentStep['icon']; weight: number; entries: Entry[] }

/** 每一步按 weight 分到时间；entries 的 at 是这一步内部的进度（0–1）。 */
const SCRIPT: Script[] = [
  {
    id: 'search',
    title: 'Searching the workspace for churn reports',
    icon: 'search',
    weight: 1,
    entries: [
      { at: 0.15, item: 'Retention dashboard, updated 2 days ago' },
      { at: 0.45, item: 'Q3 board memo, page 4' },
      { at: 0.7, item: 'Pricing change log, Aug 12' },
    ],
  },
  {
    id: 'read',
    title: 'Reading 3 sources',
    icon: 'read',
    weight: 1.5,
    entries: [
      { at: 0.1, item: 'Annual plans launched Aug 12 at 20% off' },
      { at: 0.3, item: 'Memo flags a support backlog in July' },
      {
        at: 0.45,
        tool: {
          part: { type: 'docs.open', input: { path: 'finance/forecast-2025.xlsx' }, errorText: 'Permission denied for this folder. Skipped.' },
          error: true,
        },
      },
    ],
  },
  {
    id: 'query',
    title: 'Querying the warehouse',
    icon: 'tool',
    weight: 2,
    entries: [
      {
        at: 0.05,
        tool: {
          part: {
            type: 'warehouse.query',
            toolCallId: 'call_7f3a91',
            input: { table: 'subscriptions', quarter: 'Q3', years: [2024, 2025] },
            output: { churn_q3_2025: 0.041, churn_q3_2024: 0.052, accounts: 1284 },
          },
        },
      },
    ],
  },
  {
    id: 'draft',
    title: 'Drafting the note',
    icon: 'draft',
    weight: 1,
    entries: [
      { at: 0.15, item: 'Lead with the 1.1 pt drop' },
      { at: 0.5, item: 'Credit annual plans, mention the July backlog' },
    ],
  },
]

const LEAD = 0.6
const HOLD = 2.6
const TOTAL_WEIGHT = SCRIPT.reduce((sum, step) => sum + step.weight, 0)

/** 工具调用：出现后先 Processing，再 Ready，最后 Completed / Error。 */
function toolState(progress: number, error?: boolean): ToolPart['state'] {
  if (progress < 0.22) return 'input-streaming'
  if (progress < 0.42) return 'input-available'
  return error ? 'output-error' : 'output-available'
}

function frameAt(time: number, interval: number): { steps: AgentStep[]; answer: boolean } {
  const total = LEAD + TOTAL_WEIGHT * interval + HOLD
  const t = time % total
  const steps: AgentStep[] = []
  let start = LEAD
  for (const step of SCRIPT) {
    const duration = step.weight * interval
    if (t < start) break
    const progress = Math.min(1, (t - start) / duration)
    const running = t < start + duration
    const visible = step.entries.filter((entry) => progress >= entry.at)
    steps.push({
      id: step.id,
      title: step.title,
      icon: step.icon,
      status: running ? 'running' : 'done',
      items: visible.flatMap((entry) => (entry.item ? [entry.item] : [])),
      tools: visible.flatMap((entry) =>
        entry.tool ? [{ ...entry.tool.part, state: running ? toolState((progress - entry.at) / (1 - entry.at), entry.tool.error) : entry.tool.error ? 'output-error' : 'output-available' }] : [],
      ),
    })
    start += duration
  }
  return { steps, answer: t >= start && steps.length === SCRIPT.length }
}

/** 只比较会改变画面的部分，避免每帧都重新渲染。 */
function signature(frame: { steps: AgentStep[]; answer: boolean }): string {
  return frame.steps.map((s) => `${s.status}:${s.items?.length}:${s.tools?.map((tool) => tool.state).join(',')}`).join('|') + (frame.answer ? '|answer' : '')
}

export function Demo(props: AgentRunStepsProps) {
  const host = useRef<HTMLDivElement>(null)
  const interval = props.stepInterval ?? defaults.stepInterval
  const [frame, setFrame] = useState(() => frameAt(0, interval))
  const key = useRef('')

  useFrameLoop(
    host,
    ({ time }) => {
      const next = frameAt(time, interval)
      const sig = signature(next)
      if (sig === key.current) return
      key.current = sig
      setFrame(next)
    },
    { reducedMotion: 'static', staticTime: LEAD + 4 * interval },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-[540px] flex-col gap-5">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm text-foreground">{QUESTION}</div>
        <div className="flex min-h-[400px] flex-col gap-4">
          <AgentRunSteps {...props} steps={frame.steps} label="Agent run" />
          {frame.answer && <p className="text-sm leading-relaxed text-foreground">{ANSWER}</p>}
        </div>
      </div>
    </div>
  )
}
