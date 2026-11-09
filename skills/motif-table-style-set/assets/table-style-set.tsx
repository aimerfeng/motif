// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/ui/table.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useState, type ComponentProps, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'card',
  density: 'default',
  showFooter: true,
  radius: 6,
  zebraOpacity: 50,
  maxHeight: 240,
}
/* @motif:end */

export type TableVariant = 'basic' | 'avatars' | 'borderless' | 'striped' | 'vertical-lines' | 'card' | 'selection' | 'sticky' | 'key-value'

export type TableRowData = {
  id: string
  name: string
  username: string
  email: string
  location: string
  status: string
  balance: string
}

export const sampleRows: TableRowData[] = [
  { id: '1', name: 'Alex Thompson', username: '@alexthompson', email: 'alex.t@company.com', location: 'San Francisco, US', status: 'Active', balance: '$1,250.00' },
  { id: '2', name: 'Sarah Chen', username: '@sarahchen', email: 'sarah.c@company.com', location: 'Singapore', status: 'Active', balance: '$600.00' },
  { id: '3', name: 'James Wilson', username: '@jameswilson', email: 'j.wilson@company.com', location: 'London, UK', status: 'Inactive', balance: '$650.00' },
  { id: '4', name: 'Maria Garcia', username: '@mariagarcia', email: 'm.garcia@company.com', location: 'Madrid, Spain', status: 'Active', balance: '$0.00' },
  { id: '5', name: 'David Kim', username: '@davidkim', email: 'd.kim@company.com', location: 'Seoul, KR', status: 'Active', balance: '-$1,000.00' },
]

/* ---------------- ui/table (upstream primitives) ---------------- */

function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} data-slot="table" {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn(className)} data-slot="table-header" {...props} />
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} data-slot="table-body" {...props} />
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return <tfoot className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} data-slot="table-footer" {...props} />
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b transition-colors hover:bg-muted/50 data-[highlight=true]:bg-muted/50 data-[state=selected]:bg-muted', className)}
      data-slot="table-row"
      {...props}
    />
  )
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-[var(--tss-head)] px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground has-[[type=checkbox]]:w-px has-[[type=checkbox]]:pr-0',
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  )
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('px-3 py-[var(--tss-pad)] align-middle whitespace-nowrap [&:has([type=checkbox])]:pr-0', className)}
      data-slot="table-cell"
      {...props}
    />
  )
}

/* ---------------- native checkbox (replaces radix Checkbox) ---------------- */

function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="relative inline-flex size-4 shrink-0 align-middle">
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate) && !checked
        }}
        onChange={(e) => onChange(e.target.checked)}
        className="peer size-4 cursor-pointer appearance-none rounded-[4px] border border-input bg-background shadow-xs outline-none transition-[background-color,border-color,box-shadow] checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute inset-0 hidden size-4 text-primary-foreground peer-checked:block">
        <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute inset-0 hidden size-4 text-primary-foreground peer-indeterminate:block">
        <path d="M4.5 8h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/* ---------------- gradient initials (replaces photo avatars) ---------------- */

const HUES = [262, 200, 25, 330, 150, 45]
function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  const h = HUES[index % HUES.length]
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
      style={{ background: `linear-gradient(135deg, oklch(0.58 0.17 ${h}), oklch(0.42 0.15 ${(h + 40) % 360}))` }}
    >
      {initials}
    </span>
  )
}

/* ---------------- styles ---------------- */

export type TableStylesProps = Partial<typeof defaults> & {
  rows?: TableRowData[]
  total?: string
  /** 演示用：高亮某一行，模拟悬停。 */
  highlightRow?: number
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  className?: string
  style?: CSSProperties
}

export function TableStyles({ className, style, rows = sampleRows, total = '$2,500.00', highlightRow, selected: selectedProp, onSelectedChange, ...props }: TableStylesProps) {
  const options = { ...defaults, ...props }
  const variant = options.variant as TableVariant
  const dense = options.density === 'dense'
  const [inner, setInner] = useState<string[]>([])
  const selected = selectedProp ?? inner
  const setSelected = (ids: string[]) => {
    if (selectedProp === undefined) setInner(ids)
    onSelectedChange?.(ids)
  }

  const vars = {
    '--tss-head': dense ? '2.25rem' : '3rem',
    '--tss-pad': dense ? '0.5rem' : '0.75rem',
    '--tss-radius': `${options.radius}px`,
    '--tss-max': `${options.maxHeight}px`,
  } as CSSProperties

  const gapless = variant === 'borderless' || variant === 'striped'
  const rowsPadding = gapless ? (dense ? 'py-1.5' : 'py-2.5') : ''
  const rounded = '[&_td:first-child]:rounded-l-[var(--tss-radius)] [&_td:last-child]:rounded-r-[var(--tss-radius)]'
  const vLines = '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r'
  const card = variant === 'card' || variant === 'selection'

  if (variant === 'key-value') {
    const r = rows[rows.length - 1]
    const pairs: [string, string][] = [
      ['Name', r.name],
      ['Email', r.email],
      ['Location', r.location],
      ['Status', r.status],
      ['Balance', r.balance],
    ]
    return (
      <div className={cn('mx-auto w-full max-w-lg', className)} style={{ ...vars, ...style }}>
        <div className="overflow-hidden rounded-[var(--tss-radius)] border bg-background">
          <Table>
            <TableBody>
              {pairs.map(([k, v], i) => (
                <TableRow key={k} className={vLines} data-highlight={highlightRow === i}>
                  <TableCell className={cn('w-1/3 bg-muted/50 font-medium', dense ? 'py-1.5' : 'py-2')}>{k}</TableCell>
                  <TableCell className={dense ? 'py-1.5' : 'py-2'}>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const checkboxes = variant === 'selection'
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const someChecked = rows.some((r) => selected.includes(r.id))
  const cols = checkboxes ? 5 : 4
  const footer = options.showFooter && variant !== 'avatars' && variant !== 'vertical-lines'

  const headRow = cn('hover:bg-transparent', variant === 'vertical-lines' && vLines)
  const bodyRow = cn(
    gapless && 'border-none',
    variant === 'striped' && 'hover:bg-transparent data-[highlight=true]:bg-transparent',
    variant === 'vertical-lines' && vLines,
    checkboxes && 'has-checked:bg-muted/50',
  )
  const stripeStyle: CSSProperties | undefined =
    variant === 'striped' ? { background: `color-mix(in oklab, var(--color-muted) ${options.zebraOpacity}%, transparent)` } : undefined

  const table = (
    <Table
      className={cn(
        variant === 'sticky' &&
          'border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-border [&_th]:border-b [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none',
      )}
    >
      <TableHeader className={cn(variant === 'sticky' && 'sticky top-0 z-10 bg-background/90 backdrop-blur-xs')}>
        <TableRow className={headRow}>
          {checkboxes && (
            <TableHead>
              <Checkbox label="Select all rows" checked={allChecked} indeterminate={someChecked} onChange={(v) => setSelected(v ? rows.map((r) => r.id) : [])} />
            </TableHead>
          )}
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      {gapless && <tbody aria-hidden="true" className="table-row h-2" />}
      <TableBody className={cn((gapless || variant === 'vertical-lines') && rounded)}>
        {rows.map((item, i) => (
          <TableRow key={item.id} className={bodyRow} data-highlight={highlightRow === i} style={i % 2 === 0 ? stripeStyle : undefined}>
            {checkboxes && (
              <TableCell>
                <Checkbox
                  label={`Select ${item.name}`}
                  checked={selected.includes(item.id)}
                  onChange={(v) => setSelected(v ? [...selected, item.id] : selected.filter((s) => s !== item.id))}
                />
              </TableCell>
            )}
            <TableCell className={cn(rowsPadding, variant !== 'avatars' && 'font-medium')}>
              {variant === 'avatars' ? (
                <div className="flex items-center gap-3">
                  <Avatar name={item.name} index={i} />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <span className="mt-0.5 text-xs text-muted-foreground">{item.username}</span>
                  </div>
                </div>
              ) : (
                item.name
              )}
            </TableCell>
            <TableCell className={rowsPadding}>{item.email}</TableCell>
            <TableCell className={rowsPadding}>{item.location}</TableCell>
            <TableCell className={rowsPadding}>{item.status}</TableCell>
            <TableCell className={cn(rowsPadding, 'text-right tabular-nums')}>{item.balance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      {gapless && <tbody aria-hidden="true" className="table-row h-2" />}
      {footer && (
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={cols}>Total</TableCell>
            <TableCell className="text-right tabular-nums">{total}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )

  return (
    <div className={cn('w-full', className)} style={{ ...vars, ...style }}>
      {card ? (
        <div className="overflow-hidden rounded-[var(--tss-radius)] border bg-background">{table}</div>
      ) : variant === 'sticky' ? (
        <div className="[&>div]:max-h-[var(--tss-max)]">{table}</div>
      ) : (
        table
      )}
    </div>
  )
}
