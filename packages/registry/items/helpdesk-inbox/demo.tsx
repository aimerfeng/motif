import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { HelpdeskInbox, type ComposerMode, type HelpdeskInboxProps, type StatusFilter } from './helpdesk-inbox'

// 自动播放：队列界面每 2.5 秒切换一次状态筛选；工单界面先打一段回复，再切到内部备注打一段。
// 节奏全部来自 useFrameLoop 的 time；用户一点击或按键就交还控制。
const FILTERS: StatusFilter[] = ['All', 'Open', 'Pending', 'Closed']
const STEP = 2.5
const HALF = 5
const SCRIPT: Record<ComposerMode, string> = {
  reply: 'Both seats show as active now. Could you refresh the Members page and confirm on your side?',
  note: 'Sync job timed out on accounts with 3+ pending invites. Filed SYNC-218 for the fix.',
}
const CPS = 26

export function Demo(props: HelpdeskInboxProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('All')
  const [mode, setMode] = useState<ComposerMode>('reply')
  const [draft, setDraft] = useState('')
  const ticketView = props.view === 'ticket'

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      if (!ticketView) {
        const nextFilter = FILTERS[Math.floor(time / STEP) % FILTERS.length]
        setFilter((f) => (f === nextFilter ? f : nextFilter))
        return
      }
      const local = time % (HALF * 2)
      const nextMode: ComposerMode = local < HALF ? 'reply' : 'note'
      setMode((m) => (m === nextMode ? m : nextMode))
      const typed = SCRIPT[nextMode].slice(0, Math.max(0, Math.floor(((local % HALF) - 0.6) * CPS)))
      setDraft((d) => (d === typed ? d : typed))
    },
    { reducedMotion: 'static', staticTime: ticketView ? 4 : 0 },
  )

  const stop = () => setAuto(false)

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDownCapture={stop} onKeyDownCapture={stop}>
      <HelpdeskInbox {...props} filter={filter} onFilterChange={setFilter} mode={mode} onModeChange={setMode} draft={draft} onDraftChange={setDraft} />
    </div>
  )
}
