'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface TabSpec {
  id: string
  label: string
  content: ReactNode
}

/** 无障碍的选项卡：内容由服务端渲染好传进来，客户端只负责切换；左右方向键、Home/End 在选项卡之间移动。 */
export function ItemTabs({ tabs }: { tabs: TabSpec[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  const base = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active)
    const moves: Partial<Record<string, number>> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    const wrapped = (next + tabs.length) % tabs.length
    setActive(tabs[wrapped]!.id)
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
            onClick={() => setActive(tab.id)}
            className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink aria-selected:border-ink aria-selected:text-ink"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={tab.id !== active} className="pt-6">
          {tab.content}
        </div>
      ))}
    </div>
  )
}
