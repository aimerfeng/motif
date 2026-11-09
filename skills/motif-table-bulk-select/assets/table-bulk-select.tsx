// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/table-actions/table-action-06.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  barStyle: 'command',
  density: 'default',
  zebra: false,
  radius: 6,
}
/* @motif:end */

export type Workspace = {
  workspace: string
  owner: string
  status: string
  costs: string
  region: string
  capacity: string
  lastEdited: string
}

export const workspaces: Workspace[] = [
  { workspace: 'sales_by_day_api', owner: 'John Doe', status: 'live', costs: '$3,509.00', region: 'US-West 1', capacity: '99%', lastEdited: '23/09/2023 13:00' },
  { workspace: 'marketing_campaign', owner: 'Jane Smith', status: 'live', costs: '$5,720.00', region: 'US-East 2', capacity: '80%', lastEdited: '22/09/2023 10:45' },
  { workspace: 'sales_campaign', owner: 'Jane Smith', status: 'live', costs: '$5,720.00', region: 'US-East 2', capacity: '80%', lastEdited: '22/09/2023 10:45' },
  { workspace: 'development_env', owner: 'Mike Johnson', status: 'live', costs: '$4,200.00', region: 'EU-West 1', capacity: '60%', lastEdited: '21/09/2023 14:30' },
  { workspace: 'new_workspace_1', owner: 'Alice Brown', status: 'live', costs: '$2,100.00', region: 'US-West 2', capacity: '75%', lastEdited: '24/09/2023 09:15' },
  { workspace: 'test_environment', owner: 'David Clark', status: 'inactive', costs: '$800.00', region: 'EU-Central 1', capacity: '40%', lastEdited: '25/09/2023 16:20' },
  { workspace: 'analytics_dashboard', owner: 'Sarah Wilson', status: 'live', costs: '$6,500.00', region: 'US-West 1', capacity: '90%', lastEdited: '26/09/2023 11:30' },
  { workspace: 'research_project', owner: 'Michael Adams', status: 'live', costs: '$3,900.00', region: 'US-East 1', capacity: '70%', lastEdited: '27/09/2023 08:45' },
  { workspace: 'training_environment', owner: 'Laura White', status: 'live', costs: '$2,500.00', region: 'EU-North 1', capacity: '55%', lastEdited: '28/09/2023 12:15' },
]

const COLUMNS: { key: keyof Workspace; header: string; align: 'text-left' | 'text-right' }[] = [
  { key: 'workspace', header: 'Workspace', align: 'text-left' },
  { key: 'owner', header: 'Owner', align: 'text-left' },
  { key: 'status', header: 'Status', align: 'text-left' },
  { key: 'region', header: 'Region', align: 'text-left' },
  { key: 'capacity', header: 'Capacity', align: 'text-left' },
  { key: 'costs', header: 'Costs', align: 'text-right' },
  { key: 'lastEdited', header: 'Last edited', align: 'text-right' },
]

export type TableBulkSelectProps = Partial<typeof defaults> & {
  rows?: Workspace[]
  /** 受控选择：行下标集合。 */
  selected?: number[]
  defaultSelected?: number[]
  onSelectedChange?: (selected: number[]) => void
  onBulkEdit?: (selected: number[]) => void
  onDelete?: (selected: number[]) => void
  className?: string
  style?: CSSProperties
}

/** 按亮度选深 / 浅字色，保证强调色上的文字可读。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#ffffff'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return L > 0.32 ? '#0a0a0b' : '#ffffff'
}

const focusRing = 'outline-0 outline-offset-2 outline-[var(--tbs-accent)] focus-visible:outline-2 focus-visible:outline-solid'

/** Tremor Checkbox：三态（true / false / indeterminate），role="checkbox"，Space 切换。 */
function Checkbox({ checked, onCheckedChange, className, ...rest }: { checked: boolean | 'indeterminate'; onCheckedChange: () => void; className?: string; 'aria-label': string }) {
  const on = checked !== false
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
      aria-label={rest['aria-label']}
      onClick={(e) => {
        e.stopPropagation()
        onCheckedChange()
      }}
      className={cn(
        'relative inline-flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded shadow-sm ring-1 ring-inset transition-[background-color,box-shadow] duration-100',
        on ? 'bg-[var(--tbs-accent)] text-[var(--tbs-ink)] ring-transparent' : 'bg-background ring-border',
        focusRing,
        className,
      )}
    >
      {checked === 'indeterminate' ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="4" x2="12" y1="8" y2="8" />
        </svg>
      ) : checked ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11.2 5.59998L6.79999 9.99998L4.79999 7.99998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ) : null}
    </button>
  )
}

function Button({ variant = 'primary', className, children, onClick, radius }: { variant?: 'primary' | 'secondary'; className?: string; children: ReactNode; onClick?: () => void; radius: number }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      style={{ borderRadius: radius }}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap border px-3 py-2 text-center text-sm font-medium shadow-sm transition-[background-color,color,filter] duration-100 ease-in-out',
        variant === 'primary' ? 'border-transparent bg-[var(--tbs-accent)] text-[var(--tbs-ink)] hover:brightness-110' : 'border-border bg-background text-foreground hover:bg-muted/60',
        focusRing,
        className,
      )}
    >
      {children}
    </button>
  )
}

function Keycap({ children }: { children: ReactNode }) {
  return <span className="flex size-6 select-none items-center justify-center rounded-md bg-zinc-800 text-zinc-400 ring-1 ring-inset ring-zinc-700">{children}</span>
}

/** 带勾选和批量操作栏的表格：行可点击切换，表头复选框支持半选，选中后弹出操作栏（E 编辑，⌘/Ctrl+D 删除）。 */
export function TableBulkSelect({ rows = workspaces, selected: controlled, defaultSelected = [2], onSelectedChange, onBulkEdit, onDelete, className, style, ...props }: TableBulkSelectProps) {
  const { accent, barStyle, density, zebra, radius } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [inner, setInner] = useState<number[]>(defaultSelected)
  const selection = new Set(controlled ?? inner)
  const count = rows.reduce((n, _, i) => n + (selection.has(i) ? 1 : 0), 0)
  const allSelected = rows.length > 0 && count === rows.length
  const headerState: boolean | 'indeterminate' = allSelected ? true : count > 0 ? 'indeterminate' : false
  const ids = rows.map((_, i) => i).filter((i) => selection.has(i))

  const commit = (next: number[]) => {
    if (controlled === undefined) setInner(next)
    onSelectedChange?.(next)
  }
  const toggleRow = (i: number) => commit(selection.has(i) ? ids.filter((x) => x !== i) : [...ids, i].sort((a, b) => a - b))
  const toggleAll = () => commit(allSelected ? [] : rows.map((_, i) => i))

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return
    const key = e.key.toLowerCase()
    if (key === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      onBulkEdit?.(ids)
    } else if (key === 'd' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onDelete?.(ids)
    } else if (key === 'escape') {
      commit([])
    }
  }

  const dense = density === 'dense'
  const cellPad = dense ? 'px-4 py-2.5' : 'p-4'
  const headPad = dense ? 'px-4 py-2.5' : 'px-4 py-3.5'
  const vars = { '--tbs-accent': accent, '--tbs-ink': inkFor(accent), ...style } as CSSProperties

  const bar =
    barStyle === 'command' ? (
      <div className="flex w-fit items-center space-x-3 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium shadow-md ring-1 ring-zinc-800">
        <p className="select-none tabular-nums text-zinc-400">{count} selected</p>
        <span className="h-4 w-px bg-zinc-600" aria-hidden={true} />
        <span className="flex items-center space-x-2">
          <button type="button" onClick={() => onBulkEdit?.(ids)} aria-keyshortcuts="E" className={cn('inline-flex items-center gap-2 rounded-md text-sm text-zinc-300 transition-colors hover:text-zinc-50', focusRing)}>
            Edit
            <Keycap>E</Keycap>
          </button>
        </span>
        <span className="h-4 w-px bg-zinc-600" aria-hidden={true} />
        <span className="flex items-center space-x-2">
          <button type="button" onClick={() => onDelete?.(ids)} aria-keyshortcuts="Meta+D Control+D" className={cn('inline-flex items-center gap-2 rounded-md text-sm text-zinc-300 transition-colors hover:text-zinc-50', focusRing)}>
            Delete
            <span className="flex items-center space-x-1">
              <Keycap>⌘</Keycap>
              <Keycap>D</Keycap>
            </span>
          </button>
        </span>
      </div>
    ) : (
      <div className="flex w-fit items-center space-x-10 border bg-background p-2 shadow-md" style={{ borderRadius: radius + 2 }}>
        <p className="select-none text-sm">
          <span className="bg-[var(--tbs-accent)] px-2 py-1.5 font-medium tabular-nums text-[var(--tbs-ink)]" style={{ borderRadius: Math.max(2, radius - 2) }}>
            {count}
          </span>
          <span className="ml-2 font-medium text-foreground">selected</span>
        </p>
        <div className="flex items-center space-x-2">
          <Button className="px-2 py-1.5" radius={radius} onClick={() => onBulkEdit?.(ids)}>
            Bulk edit
          </Button>
          <Button variant="secondary" className="px-2 py-1.5" radius={radius} onClick={() => onDelete?.(ids)}>
            Delete all
          </Button>
        </div>
      </div>
    )

  return (
    <div className={cn('relative', barStyle === 'header' ? '' : 'mb-20', className)} style={vars} onKeyDown={onKeyDown}>
      <div>
        <div className="w-full overflow-auto whitespace-nowrap">
          <table className="w-full caption-bottom border-b border-border" aria-multiselectable="true">
            <thead>
              <tr className="[&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                <th className={cn('w-0 border-b border-border text-left text-sm font-semibold text-foreground', headPad)}>
                  <Checkbox checked={headerState} onCheckedChange={toggleAll} className="translate-y-0.5" aria-label="Select all" />
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key} scope="col" className={cn('relative border-b border-border text-sm font-semibold text-foreground', headPad, col.align)}>
                    {col.key === 'workspace' && barStyle === 'header' && count > 0 ? (
                      <>
                        <span className="invisible">{col.header}</span>
                        <div className="absolute inset-y-0 left-0 flex items-center space-x-2 bg-background pl-4">
                          <Button className="rounded px-2 py-1" radius={Math.max(2, radius - 2)} onClick={() => onBulkEdit?.(ids)}>
                            Bulk edit
                          </Button>
                          <Button variant="secondary" className="rounded px-2 py-1" radius={Math.max(2, radius - 2)} onClick={() => onDelete?.(ids)}>
                            Delete all
                          </Button>
                        </div>
                      </>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => {
                const isSelected = selection.has(i)
                return (
                  <tr
                    key={row.workspace + i}
                    aria-selected={isSelected}
                    onClick={() => toggleRow(i)}
                    className={cn(
                      'cursor-default select-none transition-colors hover:bg-muted/50 [&_td:first-child]:pl-4 [&_td:last-child]:pr-4',
                      zebra && i % 2 === 1 && !isSelected ? 'bg-muted/25' : '',
                    )}
                  >
                    <td className={cn('relative w-0 text-left text-sm text-muted-foreground', cellPad, isSelected ? 'bg-muted/60' : '')}>
                      {isSelected && <div className="absolute inset-y-0 left-0 w-0.5 bg-[var(--tbs-accent)]" />}
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(i)} className="translate-y-0.5" aria-label={`Select ${row.workspace}`} />
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className={cn('relative text-sm text-muted-foreground', cellPad, col.align, isSelected ? 'bg-muted/60' : '', col.key === 'workspace' ? 'font-medium text-foreground' : '')}>
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-border text-left font-medium text-foreground">
              <tr className="[&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                <th colSpan={1} className={cn('w-0 border-b border-transparent text-left text-sm font-semibold', headPad)}>
                  <Checkbox checked={headerState} onCheckedChange={toggleAll} className="translate-y-0.5" aria-label="Select all" />
                </th>
                <th colSpan={7} className={cn('border-b border-transparent text-left text-sm font-normal tabular-nums', headPad)} aria-live="polite">
                  {count} of {rows.length} Page Row(s) selected
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {barStyle !== 'header' && (
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              key="bar"
              role="toolbar"
              aria-label="Bulk actions"
              className="absolute inset-x-0 -bottom-14 mx-auto flex w-fit justify-center"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              transition={reduced ? { duration: 0.15 } : { type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
            >
              {bar}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
