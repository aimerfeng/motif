// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-576.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brandName: 'Lumen Docs',
  showFilter: true,
  activeStyle: 'soft',
  guides: false,
  accent: '#6366f1',
  indent: 20,
  width: 272,
}
/* @motif:end */

export interface Item {
  name: string
  href?: string
  children?: string[]
  current?: boolean
}

export const items: Record<string, Item> = {
  advanced: { href: '#', name: 'Advanced Usage' },
  api: { children: ['endpoints', 'models'], name: 'API Reference' },
  endpoints: { href: '#', name: 'Endpoints' },
  examples: { href: '#', name: 'Code Examples' },
  faq: { href: '#', name: 'FAQ' },
  'getting-started': {
    children: ['installation', 'setup'],
    name: 'Getting Started',
  },
  guides: { children: ['getting-started', 'advanced'], name: 'User Guides' },
  installation: { current: true, href: '#', name: 'Installation' },
  main: { children: ['guides', 'api', 'resources'], name: 'Documentation' },
  models: { href: '#', name: 'Data Models' },
  resources: { children: ['examples', 'faq'], name: 'Resources' },
  setup: { href: '#', name: 'Configuration' },
}

// Find the path from root to the current item
function findPathTo(items: Record<string, Item>, rootId: string, isTarget: (id: string, item: Item) => boolean): string[] {
  const path: string[] = []

  function findPath(itemId: string): boolean {
    const item = items[itemId]
    if (!item) return false

    // If this is the current item, we found the path
    if (isTarget(itemId, item)) {
      path.unshift(itemId)
      return true
    }

    // If this item has children, search them
    if (item.children?.length) {
      for (const childId of item.children) {
        if (findPath(childId)) {
          // If we found the path in this branch, add this item to the path
          path.unshift(itemId)
          return true
        }
      }
    }

    return false
  }

  findPath(rootId)
  return path
}

function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!
  const value = Number.parseInt(digits, 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.051 ? '#ffffff' : '#030304'
}

type Row = { id: string; item: Item; level: number; folder: boolean; expanded: boolean; parent: string | null; match: boolean }

export type DocsTreeSidebarProps = Partial<typeof defaults> & {
  items?: Record<string, Item>
  rootId?: string
  /** Controlled current page id; defaults to the item marked `current`. */
  current?: string
  onNavigate?: (id: string) => void
  className?: string
  style?: CSSProperties
}

/**
 * Docs sidebar: comp-576 (menu navigation tree) with the headless-tree store replaced by a small
 * flat tree. The branch that holds the current page is expanded on load and whenever it changes.
 */
export function DocsTreeSidebar({
  items: data = items,
  rootId = 'main',
  current: currentProp,
  onNavigate,
  brandName = defaults.brandName,
  showFilter = defaults.showFilter,
  activeStyle = defaults.activeStyle,
  guides = defaults.guides,
  accent = defaults.accent,
  indent = defaults.indent,
  width = defaults.width,
  className,
  style,
}: DocsTreeSidebarProps) {
  const filterId = useId()
  const initialCurrent = useMemo(() => Object.keys(data).find((id) => data[id]?.current), [data])
  const [ownCurrent, setOwnCurrent] = useState(initialCurrent)
  const current = currentProp ?? ownCurrent

  // Get all parent IDs that need to be expanded
  const pathToCurrent = useMemo(
    () => (current ? findPathTo(data, rootId, (id) => id === current) : []),
    [data, rootId, current],
  )
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(pathToCurrent.filter((id) => data[id]?.children?.length)),
  )
  useEffect(() => {
    setExpanded((prev) => {
      const missing = pathToCurrent.filter((id) => data[id]?.children?.length && !prev.has(id))
      return missing.length ? new Set([...prev, ...missing]) : prev
    })
  }, [pathToCurrent, data])

  const [query, setQuery] = useState('')
  const needle = showFilter ? query.trim().toLowerCase() : ''

  const rows = useMemo(() => {
    const out: Row[] = []
    const visible = (id: string): boolean => {
      const item = data[id]
      if (!item) return false
      if (!needle || item.name.toLowerCase().includes(needle)) return true
      return item.children?.some(visible) ?? false
    }
    const walk = (ids: string[], level: number, parent: string | null) => {
      for (const id of ids) {
        const item = data[id]
        if (!item || !visible(id)) continue
        const folder = (item.children?.length ?? 0) > 0
        const open = folder && (needle ? true : expanded.has(id))
        out.push({ id, item, level, folder, expanded: open, parent, match: Boolean(needle) && item.name.toLowerCase().includes(needle) })
        if (open) walk(item.children ?? [], level + 1, id)
      }
    }
    walk(data[rootId]?.children ?? [], 0, null)
    return out
  }, [data, rootId, expanded, needle])

  const [focused, setFocused] = useState<string | null>(null)
  const focusId = rows.some((r) => r.id === focused) ? focused : (rows.find((r) => r.id === current)?.id ?? rows[0]?.id)
  const refs = useRef(new Map<string, HTMLElement>())
  const moveFocus = (id: string | undefined) => {
    if (!id) return
    setFocused(id)
    refs.current.get(id)?.focus()
  }

  const toggle = (id: string, open?: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (open ?? !next.has(id)) next.add(id)
      else next.delete(id)
      return next
    })

  const navigate = (id: string) => {
    setOwnCurrent(id)
    onNavigate?.(id)
  }

  const onKeyDown = (event: KeyboardEvent, row: Row, index: number) => {
    const key = event.key
    if (key === 'ArrowDown') moveFocus(rows[index + 1]?.id)
    else if (key === 'ArrowUp') moveFocus(rows[index - 1]?.id)
    else if (key === 'Home') moveFocus(rows[0]?.id)
    else if (key === 'End') moveFocus(rows[rows.length - 1]?.id)
    else if (key === 'ArrowRight') {
      if (row.folder && !row.expanded) toggle(row.id, true)
      else if (row.folder) moveFocus(rows[index + 1]?.id)
      else return
    } else if (key === 'ArrowLeft') {
      if (row.folder && row.expanded && !needle) toggle(row.id, false)
      else if (row.parent) moveFocus(row.parent)
      else return
    } else return
    event.preventDefault()
  }

  const ink = inkOn(accent)

  return (
    <aside
      aria-label={`${brandName} navigation`}
      className={cn('flex w-full flex-col gap-3 bg-background text-foreground md:w-(--sb-width) md:shrink-0', className)}
      style={cssVars({ '--sb-width': `${width}px`, '--sb-accent': accent, '--sb-ink': ink }, style)}
    >
      <div className="flex items-center gap-2 px-2 pt-1">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 text-(--sb-accent)">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity="0.18" />
          <path d="M8 7v10h8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="8.5" r="1.8" fill="currentColor" />
        </svg>
        <span className="truncate font-semibold text-sm tracking-tight">{brandName}</span>
        <span className="ms-auto rounded-md border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">v2.4</span>
      </div>

      {showFilter && (
        <div className="relative px-0.5">
          <label htmlFor={filterId} className="sr-only">
            Filter pages
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id={filterId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter pages"
            className="h-9 w-full rounded-md border bg-background ps-8 pe-3 text-sm text-foreground outline-hidden transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
          />
        </div>
      )}

      <div
        role="tree"
        aria-label={data[rootId]?.name ?? 'Documentation'}
        data-slot="tree"
        className="flex flex-col"
        style={cssVars({ '--tree-indent': `${indent}px` })}
      >
        {rows.map((row, index) => {
          const isCurrent = !row.folder && row.id === current
          const common = {
            role: 'treeitem',
            'aria-level': row.level + 1,
            'aria-expanded': row.folder ? row.expanded : undefined,
            'aria-current': isCurrent ? ('page' as const) : undefined,
            tabIndex: row.id === focusId ? 0 : -1,
            'data-slot': 'tree-item',
            'data-folder': row.folder,
            'data-current': isCurrent,
            'data-search-match': row.match,
            'data-active-style': activeStyle,
            onFocus: () => setFocused(row.id),
            onKeyDown: (e: KeyboardEvent) => onKeyDown(e, row, index),
            ref: (el: HTMLElement | null) => {
              if (el) refs.current.set(row.id, el)
              else refs.current.delete(row.id)
            },
            className:
              'group relative z-10 select-none ps-(--tree-padding) text-start not-last:pb-0.5 outline-hidden focus:z-20',
            style: cssVars({ '--tree-padding': `${row.level * indent}px` }),
          }
          const label = (
            <TreeItemLabel folder={row.folder} level={row.level} guides={guides}>
              {row.item.name}
            </TreeItemLabel>
          )
          return row.folder ? (
            <button key={row.id} type="button" {...common} onClick={() => toggle(row.id)}>
              {label}
            </button>
          ) : (
            <a
              key={row.id}
              href={row.item.href ?? '#'}
              {...common}
              onClick={(e) => {
                if (!row.item.href || row.item.href === '#') e.preventDefault()
                navigate(row.id)
              }}
            >
              {label}
            </a>
          )
        })}
        {rows.length === 0 && <p className="px-2 py-1.5 text-muted-foreground text-sm">No pages match “{query.trim()}”.</p>}
      </div>

      <p aria-live="polite" className="mt-2 px-2 text-muted-foreground text-xs" role="region">
        Menu navigation tree ∙ {rows.filter((r) => !r.folder).length} pages shown
      </p>
    </aside>
  )
}

function TreeItemLabel({
  folder,
  level,
  guides,
  children,
}: {
  folder: boolean
  level: number
  guides: boolean
  children: ReactNode
}) {
  return (
    <>
      {guides && level > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-[15.5px] bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px)] bg-size-[var(--tree-indent)_100%] bg-repeat-x"
          style={{ inlineSize: `calc(var(--tree-indent) * ${level})` }}
        />
      )}
      <span
        data-slot="tree-item-label"
        className={cn(
          'relative flex items-center gap-1 rounded-sm bg-background px-2 py-1.5 text-sm transition-colors hover:bg-accent motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
          'in-data-[folder=false]:ps-7 in-data-[folder=true]:font-medium',
          'in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50',
          'in-data-[search-match=true]:bg-[color-mix(in_oklab,var(--sb-accent)_22%,transparent)]!',
          'in-data-[current=true]:in-data-[active-style=soft]:bg-accent in-data-[current=true]:in-data-[active-style=soft]:text-accent-foreground',
          'in-data-[current=true]:in-data-[active-style=solid]:bg-(--sb-accent)! in-data-[current=true]:in-data-[active-style=solid]:text-(--sb-ink)',
          'in-data-[current=true]:in-data-[active-style=bar]:bg-accent/60 in-data-[current=true]:in-data-[active-style=bar]:font-medium in-data-[current=true]:in-data-[active-style=bar]:shadow-[inset_2px_0_0_var(--sb-accent)]',
        )}
      >
        {folder && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 text-muted-foreground transition-transform in-aria-[expanded=false]:-rotate-90 motion-reduce:transition-none"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
        <span className="truncate">{children}</span>
      </span>
    </>
  )
}
