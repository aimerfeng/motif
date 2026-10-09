import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { FlipGrid, type FlipGridProps, type GridState } from './flip-grid'

/** 自动播放的步骤：view 为 true 时切到和参数相反的视图。 */
const SCRIPT: { filter: string; sort: GridState['sort']; flipView: boolean }[] = [
  { filter: 'All', sort: 'newest', flipView: false },
  { filter: 'Brand', sort: 'newest', flipView: false },
  { filter: 'Product', sort: 'newest', flipView: false },
  { filter: 'All', sort: 'newest', flipView: false },
  { filter: 'All', sort: 'newest', flipView: true },
  { filter: 'All', sort: 'az', flipView: true },
  { filter: 'All', sort: 'az', flipView: false },
]
const DWELL = 1.6

export function Demo(props: FlipGridProps) {
  const host = useRef<HTMLDivElement>(null)
  const base = (props.view ?? 'grid') as GridState['view']
  const [step, setStep] = useState(0)
  // 用户自己点过之后就停掉自动播放，交给组件自己管理。
  const [manual, setManual] = useState<GridState | null>(null)

  useFrameLoop(host, ({ time }) => {
    if (manual) return
    const next = Math.floor(time / DWELL) % SCRIPT.length
    if (next !== step) setStep(next)
  })

  const scripted = SCRIPT[step]!
  const state: GridState = manual ?? { filter: scripted.filter, sort: scripted.sort, view: scripted.flipView ? (base === 'grid' ? 'list' : 'grid') : base }
  return (
    <div ref={host} className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'dark' ? '#121315' : '#efebe4' }}>
      <FlipGrid {...props} state={state} onStateChange={setManual} className="min-h-full" />
    </div>
  )
}
