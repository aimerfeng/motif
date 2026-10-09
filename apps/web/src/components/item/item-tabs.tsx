'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface TabSpec {
  id: string
  label: string
  content: ReactNode
}

/**
 * 无障碍的选项卡：内容由调用方传进来，客户端只负责切换；左右方向键、Home/End 在选项卡之间移动。
 * 没打开过的选项卡不挂载（安装、Skill 面板在挂载时就要生成导出内容），打开过的保留状态。
 */
export function ItemTabs({ tabs }: { tabs: TabSpec[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  const [visited, setVisited] = useState(() => new Set(tabs.slice(0, 1).map((tab) => tab.id)))
  const base = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const select = (id: string) => {
    setActive(id)
    setVisited((current) => (current.has(id) ? current : new Set(current).add(id)))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active)
    const moves: Partial<Record<string, number>> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    const wrapped = (next + tabs.length) % tabs.length
    select(tabs[wrapped]!.id)
    buttons.current[wrapped]?.focus()
  }

  return (
    <div>
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => select(tab.id)}
            className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink aria-selected:border-ink aria-selected:text-ink"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={tab.id !== active} className="pt-6">
          {visited.has(tab.id) ? tab.content : null}
        </div>
      ))}
    </div>
  )
}
