import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { moveItems, type DropTarget, type TreeDragState, type TreeRenameState } from './tree'
import { FileTree, sampleExpandedItems, sampleItems, type FileTreeItem, type FileTreeProps } from './tree-file-explorer'

interface DemoState {
  items: Record<string, FileTreeItem>
  expanded: string[]
  selected: string[]
  filter: string
  forced: { drag?: TreeDragState | null; renaming?: TreeRenameState | null }
}

const MOVED = moveItems(sampleItems, ['components'], { parentId: 'app', index: sampleItems.app!.children!.length })
const RENAMED: Record<string, FileTreeItem> = { ...MOVED, 'components/card.tsx': { name: 'panel.tsx', fileExtension: 'tsx' } }
const ALL_FOLDERS = Object.keys(MOVED).filter((id) => id !== 'root' && MOVED[id]!.children !== undefined)
const AFTER_COLLAPSE = sampleExpandedItems.filter((id) => id !== 'app/(dashboard)')

/** 一轮 12 秒的脚本：选中、收起、拖动 components 进 app、筛选 “page”、展开、F2 重命名。 */
const LOOP = 12
const STEPS: { at: number; state: DemoState }[] = []
{
  let state: DemoState = { items: sampleItems, expanded: sampleExpandedItems, selected: ['components'], filter: '', forced: {} }
  const at = (time: number, patch: Partial<DemoState>) => {
    state = { ...state, forced: {}, ...patch }
    STEPS.push({ at: time, state })
  }
  const drag = (target: DropTarget | null): Partial<DemoState> => ({ forced: { drag: { draggedItems: ['components'], target } } })
  const renameTo = (value: string): Partial<DemoState> => ({ forced: { renaming: { itemId: 'components/card.tsx', value } } })

  at(0, {})
  at(0.7, { selected: ['app/page.tsx'] })
  at(1.4, { selected: ['app/(dashboard)'], expanded: AFTER_COLLAPSE })
  at(2.2, { selected: ['components'], ...drag(null) })
  at(2.5, drag({ itemId: 'app/api', position: 'after' }))
  at(2.85, drag({ itemId: 'app/api', position: 'inside' }))
  at(3.2, drag({ itemId: 'app/(dashboard)', position: 'inside' }))
  at(3.55, drag({ itemId: 'app/api', position: 'after' }))
  at(4.2, { items: MOVED })
  ;['p', 'pa', 'pag', 'page'].forEach((filter, i) => at(5 + i * 0.2, { filter, expanded: ALL_FOLDERS }))
  at(7.0, { filter: '', expanded: AFTER_COLLAPSE })
  at(7.6, { selected: ['components'], expanded: [...AFTER_COLLAPSE, 'components'] })
  at(8.2, { selected: ['components/card.tsx'] })
  at(8.7, renameTo('card.tsx'))
  'panel.tsx'.split('').forEach((_, i, chars) => at(9.1 + i * 0.11, renameTo(chars.slice(0, i + 1).join(''))))
  at(10.3, { items: RENAMED })
}

function stepAt(time: number) {
  const t = time % LOOP
  let index = 0
  for (let i = 0; i < STEPS.length; i++) if (STEPS[i]!.at <= t) index = i
  return index
}

export function Demo(props: FileTreeProps) {
  const host = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [manual, setManual] = useState<DemoState | null>(null)
  const manualRef = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manualRef.current) return
      const next = stepAt(time)
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  const auto = STEPS[step]!.state
  const state = manual ?? auto
  // 用户一碰就停止自动播放，从当前画面接手。
  const takeOver = () => {
    if (manualRef.current) return
    manualRef.current = true
    setManual({ ...auto, forced: {} })
  }
  const update = (patch: Partial<DemoState>) => {
    takeOver()
    setManual((prev) => ({ ...(prev ?? auto), forced: {}, ...patch }))
  }

  const fileCount = Object.values(state.items).filter((item) => item.children === undefined).length

  return (
    <div
      ref={host}
      className="grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(60%_55%_at_50%_0%,oklch(0.3_0.06_250/0.35),transparent)] bg-background px-4 py-5"
      onFocusCapture={takeOver}
      onKeyDownCapture={takeOver}
      onPointerDownCapture={takeOver}
    >
      <div className="w-full max-w-[330px] rounded-xl border bg-background p-3 shadow-2xl shadow-black/40">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Explorer</p>
            <p className="truncate text-sm font-medium">harbor-web</p>
          </div>
          <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground tabular-nums">{fileCount} files</span>
        </div>
        <FileTree
          {...props}
          label="harbor-web files"
          items={state.items}
          onItemsChange={(items) => update({ items })}
          expandedItems={state.expanded}
          onExpandedItemsChange={(expanded) => update({ expanded })}
          selectedItems={state.selected}
          onSelectedItemsChange={(selected) => update({ selected })}
          filter={state.filter}
          onFilterChange={(filter) => update({ filter })}
          forced={manual ? undefined : auto.forced}
        />
      </div>
    </div>
  )
}
