'use client'

import { useId, useState, type ReactNode } from 'react'

export interface TabSpec {
  id: string
  label: string
  content: ReactNode
}

/** 无障碍的选项卡：内容由服务端渲染好传进来，客户端只负责切换。 */
export function ItemTabs({ tabs }: { tabs: TabSpec[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  const base = useId()

  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${base}-panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className="-mb-px border-b-2 border-transparent pb-3 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink aria-selected:border-ink aria-selected:text-ink"
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
