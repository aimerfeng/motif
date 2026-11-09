import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TaskChecklist, type Task, type TaskChecklistProps } from './checkbox-task-list'

const TASKS: Task[] = [
  { id: 'notes', label: 'Write release notes' },
  { id: 'tests', label: 'Run the regression suite' },
  { id: 'tag', label: 'Tag version 2.4.0' },
  { id: 'docs', label: 'Publish the docs site' },
  { id: 'mail', label: 'Email the beta group' },
]
const START = ['notes']
/** 一轮 8 秒：依次勾上，最后一起清空回到 START，循环接得上。 */
const STEPS: [at: number, ids: string[]][] = [
  [1.0, ['notes', 'tests']],
  [2.2, ['notes', 'tests', 'tag']],
  [3.4, ['notes', 'tests', 'tag', 'docs']],
  [4.6, ['notes', 'tests', 'tag', 'docs', 'mail']],
  [6.6, START],
]
const LOOP = 8

function scripted(time: number): string[] {
  const t = time % LOOP
  let ids = START
  for (const [at, next] of STEPS) if (t >= at) ids = next
  return ids
}

export function Demo(props: Partial<TaskChecklistProps>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string[]>(START)
  const [manual, setManual] = useState<string[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.join() === next.join() ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.8 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-72 rounded-xl border bg-card p-5 shadow-lg">
        <TaskChecklist {...props} title="Release checklist" tasks={TASKS} value={manual ?? auto} onValueChange={setManual} />
      </div>
    </div>
  )
}
