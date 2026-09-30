// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Paco Coursey
// Source: https://github.com/pacocoursey/cmdk/blob/dd2250e/cmdk/src/command-score.ts
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#8b5cf6',
  radius: 16,
  size: 'md',
  spring: {
    visualDuration: 0.26,
    bounce: 0.1,
  },
  maxRows: 10,
  placeholder: 'Search or jump to…',
  showFooter: true,
}
/* @motif:end */

export type CommandItem = {
  id: string
  label: string
  icon?: ReactNode
  /** 右侧的快捷键，例如 ['⌘', 'N']。 */
  shortcut?: string[]
  /** 不显示但参与匹配的关键词。 */
  keywords?: string[]
  hint?: string
}
export type CommandGroup = { heading: string; items: CommandItem[] }

export type InputSearchCommandProps = Partial<typeof defaults> & {
  groups?: CommandGroup[]
  /** 搜索词（受控）。 */
  query?: string
  onQueryChange?: (query: string) => void
  /** 强制高亮某一项（演示自动播放用）。 */
  highlight?: string
  /** 强制显示某一项被选中的闪烁反馈。 */
  flash?: string
  onSelect?: (item: CommandItem) => void
  /** 强制显示聚焦外观。 */
  focused?: boolean
  emptyText?: string
  className?: string
  style?: CSSProperties
}

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

const SAMPLE: CommandGroup[] = [
  {
    heading: 'Jump to',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: icon(<><rect x="4" y="4" width="7" height="8" rx="1.5" /><rect x="13" y="4" width="7" height="5" rx="1.5" /><rect x="13" y="11" width="7" height="9" rx="1.5" /><rect x="4" y="14" width="7" height="6" rx="1.5" /></>), shortcut: ['G', 'D'] },
      { id: 'projects', label: 'Projects', icon: icon(<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2.5h6.5A1.5 1.5 0 0 1 20 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />), shortcut: ['G', 'P'] },
      { id: 'inbox', label: 'Inbox', icon: icon(<><path d="M4 13.5 6.5 6h11l2.5 7.5" /><path d="M4 13.5V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5h-4.5a2.5 2.5 0 0 1-5 0z" /></>), shortcut: ['G', 'I'], keywords: ['messages', 'mail'] },
    ],
  },
  {
    heading: 'Actions',
    items: [
      { id: 'new-project', label: 'Create new project', icon: icon(<path d="M12 5v14M5 12h14" />), shortcut: ['⌘', 'N'], keywords: ['add', 'start'] },
      { id: 'invite', label: 'Invite a teammate', icon: icon(<><circle cx="10" cy="8.5" r="3.2" /><path d="M4 19c.7-3.2 3-4.8 6-4.8s5.3 1.6 6 4.8M18.5 8v5M16 10.5h5" /></>), keywords: ['share', 'people'] },
      { id: 'theme', label: 'Toggle dark mode', icon: icon(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />), shortcut: ['⌘', '⇧', 'L'], keywords: ['theme', 'appearance', 'light'] },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { id: 'profile', label: 'Edit profile', icon: icon(<><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>), keywords: ['account'] },
      { id: 'billing', label: 'Billing and plans', icon: icon(<><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="M3.5 10.5h17" /></>), keywords: ['invoice', 'payment'] },
      { id: 'shortcuts', label: 'Keyboard shortcuts', icon: icon(<><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 11h.01M11 11h.01M15 11h.01M8 14h8" /></>), shortcut: ['⌘', '/'] },
    ],
  },
]

/** 模糊匹配：先看子串（词首更高分），再看子序列（连续、词首加分）；返回分数和命中的字符下标。 */
export function match(query: string, text: string): { score: number; indices: number[] } {
  if (!query) return { score: 1, indices: [] }
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  const at = t.indexOf(q)
  if (at >= 0) {
    const atWord = at === 0 || /[\s\-_/]/.test(t[at - 1]!)
    return { score: (atWord ? 0.95 : 0.7) - at * 0.004, indices: Array.from({ length: q.length }, (_, i) => at + i) }
  }
  const indices: number[] = []
  let score = 0
  let from = 0
  let previous = -2
  for (const ch of q) {
    const found = t.indexOf(ch, from)
    if (found < 0) return { score: 0, indices: [] }
    const atWord = found === 0 || /[\s\-_/]/.test(t[found - 1]!)
    score += (found === previous + 1 ? 0.08 : 0.03) + (atWord ? 0.05 : 0)
    indices.push(found)
    previous = found
    from = found + 1
  }
  return { score: Math.min(0.6, score / q.length + 0.05), indices }
}

function Highlighted({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>
  const hit = new Set(indices)
  return (
    <>
      {Array.from(text).map((ch, i) => (hit.has(i) ? <mark key={i} className="bg-transparent font-semibold text-(--c)">{ch}</mark> : <span key={i}>{ch}</span>))}
    </>
  )
}

/** 命令面板：模糊搜索、分组、方向键 / Home / End / Enter 导航，高亮条在选项之间滑动（combobox + listbox 模式）。 */
export function InputSearchCommand({ groups = SAMPLE, query, onQueryChange, highlight, flash, onSelect, focused, emptyText = 'No results found.', className, style, ...props }: InputSearchCommandProps) {
  const { color, radius, size, spring, maxRows, placeholder, showFooter } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const [innerQuery, setInnerQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [flashed, setFlashed] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const text = query ?? innerQuery
  const rowHeight = size === 'sm' ? 36 : size === 'lg' ? 48 : 42

  const visible = useMemo(() => {
    const scored = groups
      .map((group) => {
        const items = group.items
          .map((item) => {
            const label = match(text, item.label)
            const keyword = Math.max(0, ...(item.keywords ?? []).map((k) => match(text, k).score * 0.8))
            return { item, score: Math.max(label.score, keyword), indices: label.score >= keyword ? label.indices : [] }
          })
          .filter((entry) => entry.score > 0)
        if (text) items.sort((a, b) => b.score - a.score)
        return { heading: group.heading, items, best: Math.max(0, ...items.map((entry) => entry.score)) }
      })
      .filter((group) => group.items.length > 0)
    if (text) scored.sort((a, b) => b.best - a.best)
    return scored
  }, [groups, text])

  const flat = visible.flatMap((group) => group.items.map((entry) => entry.item.id))
  const active = highlight ?? (activeId && flat.includes(activeId) ? activeId : flat[0])

  useEffect(() => {
    const list = listRef.current
    const el = active ? list?.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`) : null
    if (!list || !el) return
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    if (top - 30 < list.scrollTop) list.scrollTop = Math.max(0, top - 30)
    else if (bottom + 8 > list.scrollTop + list.clientHeight) list.scrollTop = bottom + 8 - list.clientHeight
  }, [active])

  const setQuery = (next: string) => {
    if (query === undefined) setInnerQuery(next)
    onQueryChange?.(next)
    setActiveId(null)
  }

  const choose = (id: string) => {
    const item = groups.flatMap((group) => group.items).find((candidate) => candidate.id === id)
    if (!item) return
    setFlashed(id)
    window.setTimeout(() => setFlashed(null), 320)
    onSelect?.(item)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (flat.length === 0) return
    const at = Math.max(0, flat.indexOf(active ?? ''))
    let next: number | null = null
    if (event.key === 'ArrowDown') next = (at + 1) % flat.length
    else if (event.key === 'ArrowUp') next = (at - 1 + flat.length) % flat.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = flat.length - 1
    else if (event.key === 'Enter' && active) {
      event.preventDefault()
      choose(active)
      return
    }
    if (next === null) return
    event.preventDefault()
    setActiveId(flat[next]!)
  }

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const flashing = flash ?? flashed
  const [inputFocus, setInputFocus] = useState(false)
  const isFocused = focused ?? inputFocus

  return (
    <div
      className={cn('w-full overflow-hidden border bg-popover text-popover-foreground shadow-2xl shadow-black/40', className)}
      style={{ '--c': color, borderRadius: radius, ...style } as CSSProperties}
    >
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <svg viewBox="0 0 24 24" className={cn('size-[18px] shrink-0 transition-colors duration-150', isFocused ? 'text-(--c)' : 'text-muted-foreground')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active ? `${uid}-${active}` : undefined}
          aria-label="Search commands"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && text) {
              event.preventDefault()
              setQuery('')
            } else onKeyDown(event)
          }}
          onFocus={() => setInputFocus(true)}
          onBlur={() => setInputFocus(false)}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
          style={{ caretColor: color }}
        />
        {text ? (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="grid size-6 place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--c)">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="m4 4 8 8M12 4l-8 8" /></svg>
          </button>
        ) : (
          <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">Esc</kbd>
        )}
      </div>

      <div ref={listRef} id={`${uid}-list`} role="listbox" aria-label="Results" className="relative isolate overflow-y-auto overscroll-contain p-2" style={{ maxHeight: rowHeight * maxRows + 56 }}>
        {visible.length === 0 && (
          <div className="grid place-items-center gap-1 py-10 text-center">
            <div className="text-sm font-medium">{emptyText}</div>
            <div className="max-w-56 truncate text-xs text-muted-foreground">Nothing matches “{text}”.</div>
          </div>
        )}
        {visible.map((group) => (
          <div key={group.heading} role="group" aria-label={group.heading} className="mb-1 last:mb-0">
            <div aria-hidden className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground">{group.heading}</div>
            {group.items.map(({ item, indices }) => {
              const isActive = item.id === active
              return (
                <div
                  key={item.id}
                  id={`${uid}-${item.id}`}
                  data-id={item.id}
                  role="option"
                  aria-selected={isActive}
                  onPointerMove={() => item.id !== activeId && setActiveId(item.id)}
                  onClick={() => choose(item.id)}
                  className={cn('relative flex cursor-default items-center gap-3 px-3 select-none', isActive ? 'text-foreground' : 'text-foreground/75')}
                  style={{ height: rowHeight, borderRadius: Math.max(radius - 6, 6) }}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`${uid}-active`}
                      aria-hidden
                      transition={transition}
                      className="absolute inset-0 -z-10 bg-accent"
                      style={{ borderRadius: Math.max(radius - 6, 6), backgroundColor: flashing === item.id ? 'color-mix(in oklab, var(--c) 32%, transparent)' : undefined }}
                    />
                  )}
                  {isActive && <motion.span layoutId={`${uid}-bar`} aria-hidden transition={transition} className="absolute top-2.5 bottom-2.5 left-0 -z-10 w-0.5 rounded-full bg-(--c)" />}
                  <span className={cn('relative grid size-[18px] shrink-0 place-items-center transition-colors duration-150 [&>svg]:size-full', isActive ? 'text-(--c)' : 'text-muted-foreground')}>{item.icon}</span>
                  <span className="relative min-w-0 flex-1 truncate text-sm">
                    <Highlighted text={item.label} indices={indices} />
                  </span>
                  {item.shortcut && (
                    <span className="relative flex gap-1">
                      {item.shortcut.map((key, i) => (
                        <kbd key={i} className="grid h-5 min-w-5 place-items-center rounded border bg-background/60 px-1 font-sans text-[10px] text-muted-foreground">{key}</kbd>
                      ))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {showFooter && (
        <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><kbd className="rounded border bg-background/60 px-1 font-sans">↑</kbd><kbd className="rounded border bg-background/60 px-1 font-sans">↓</kbd>navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="rounded border bg-background/60 px-1 font-sans">↵</kbd>select</span>
          <span className="ml-auto tabular-nums" aria-live="polite">{flat.length} {flat.length === 1 ? 'result' : 'results'}</span>
        </div>
      )}
    </div>
  )
}
