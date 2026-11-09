// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry/bases/base/ui/pagination.tsx
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/pagination/c-pagination-12.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  variant: 'outline',
  siblings: 1,
  showJump: true,
  showPageSize: true,
  radius: 8,
  spring: {
    visualDuration: 0.3,
    bounce: 0.2,
  },
}
/* @motif:end */

export type PaginationPagesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 总条数 */
  total?: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  defaultPageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizes?: number[]
}

function luminance(color: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function readable(color: string) {
  const l = luminance(color)
  if (l === null) return '#ffffff'
  return (l + 0.05) / 0.0536 > 1.05 / (l + 0.05) ? '#0b0b12' : '#ffffff'
}

/** 页码列表：首末页固定，当前页两侧各 siblings 个，其余折叠成省略号。 */
export function getPageItems(page: number, count: number, siblings: number): (number | 'start-ellipsis' | 'end-ellipsis')[] {
  const slots = siblings * 2 + 5
  if (count <= slots) return Array.from({ length: count }, (_, i) => i + 1)
  const left = Math.max(page - siblings, 3)
  const right = Math.min(page + siblings, count - 2)
  const showLeft = left > 3
  const showRight = right < count - 2
  if (!showLeft) return [...Array.from({ length: slots - 2 }, (_, i) => i + 1), 'end-ellipsis', count]
  if (!showRight) return [1, 'start-ellipsis', ...Array.from({ length: slots - 2 }, (_, i) => count - (slots - 3) + i)]
  return [1, 'start-ellipsis', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'end-ellipsis', count]
}

const linkBase =
  'relative inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-(--r) px-2 text-sm font-medium whitespace-nowrap select-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/60 disabled:pointer-events-none disabled:opacity-40'

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
const ICONS = {
  first: 'M17 18l-6-6 6-6M7 6v12',
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  last: 'M7 18l6-6-6-6M17 6v12',
}

function IconLink({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={cn(linkBase, 'w-9 px-0 text-foreground hover:bg-muted')}>
      {children}
    </button>
  )
}

export function PaginationPages({
  className,
  style,
  total = 312,
  page: pageProp,
  defaultPage = 2,
  onPageChange,
  pageSize: pageSizeProp,
  defaultPageSize = 20,
  onPageSizeChange,
  pageSizes = [10, 20, 50, 100],
  ...props
}: PaginationPagesProps) {
  const { accent, variant, siblings, showJump, showPageSize, radius, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const layoutId = useId()
  const [innerPage, setInnerPage] = useState(defaultPage)
  const [innerSize, setInnerSize] = useState(defaultPageSize)
  const size = pageSizeProp ?? innerSize
  const count = Math.max(1, Math.ceil(total / size))
  const page = Math.min(Math.max(1, pageProp ?? innerPage), count)
  const [draft, setDraft] = useState<string | null>(null)

  const go = (p: number) => {
    const next = Math.min(Math.max(1, Math.round(p)), count)
    setInnerPage(next)
    onPageChange?.(next)
  }
  const setSize = (s: number) => {
    setInnerSize(s)
    onPageSizeChange?.(s)
    go(1)
  }
  const commitDraft = () => {
    if (draft !== null && draft.trim() !== '' && Number.isFinite(Number(draft))) go(Number(draft))
    setDraft(null)
  }

  const from = total === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, total)
  const items = getPageItems(page, count, Math.round(siblings))
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center text-foreground', className)}
      style={{ '--accent': accent, '--on-accent': readable(accent), '--r': `${radius}px`, ...style } as CSSProperties}
    >
      <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:justify-between">
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap text-muted-foreground">Rows per page</span>
            <div className="relative w-fit">
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="h-9 w-18 cursor-pointer appearance-none rounded-(--r) border border-input bg-transparent py-1 ps-3 pe-7 text-sm shadow-xs transition-colors outline-none focus-visible:border-(--accent) focus-visible:ring-2 focus-visible:ring-(--accent)/40 dark:bg-input/30"
              >
                {pageSizes.map((s) => (
                  <option key={s} value={s} className="bg-[Canvas] text-[CanvasText]">
                    {s}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums" aria-live="polite">
            {from}–{to} of {total}
          </span>
          <ul data-slot="pagination-content" className="flex items-center gap-0.5 sm:gap-1">
            <li className="hidden sm:block">
              <IconLink label="Go to first page" disabled={page === 1} onClick={() => go(1)}>
                <Chevron d={ICONS.first} />
              </IconLink>
            </li>
            <li>
              <IconLink label="Go to previous page" disabled={page === 1} onClick={() => go(page - 1)}>
                <Chevron d={ICONS.prev} />
              </IconLink>
            </li>
            {items.map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <button
                    type="button"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    data-active={item === page}
                    onClick={() => go(item)}
                    className={cn(
                      linkBase,
                      'tabular-nums',
                      item === page ? (variant === 'solid' ? 'text-(--on-accent)' : 'text-foreground') : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {item === page && (
                      <motion.span
                        layoutId={layoutId}
                        transition={transition}
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-0 rounded-(--r)',
                          variant === 'solid' ? 'bg-(--accent)' : 'border border-(--accent)/70 bg-(--accent)/10 shadow-xs',
                        )}
                      />
                    )}
                    <span className="relative">{item}</span>
                  </button>
                </li>
              ) : (
                <li key={item}>
                  <span aria-hidden="true" data-slot="pagination-ellipsis" className="flex size-9 items-center justify-center text-muted-foreground">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                      <circle cx="5" cy="12" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="19" cy="12" r="1.6" />
                    </svg>
                  </span>
                </li>
              ),
            )}
            <li>
              <IconLink label="Go to next page" disabled={page === count} onClick={() => go(page + 1)}>
                <Chevron d={ICONS.next} />
              </IconLink>
            </li>
            <li className="hidden sm:block">
              <IconLink label="Go to last page" disabled={page === count} onClick={() => go(count)}>
                <Chevron d={ICONS.last} />
              </IconLink>
            </li>
          </ul>
          {showJump && (
            <label className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap text-muted-foreground">Go to page</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={count}
                value={draft ?? String(page)}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitDraft()
                  if (e.key === 'Escape') setDraft(null)
                }}
                className="h-9 w-16 rounded-(--r) border border-input bg-transparent px-2 text-center text-sm tabular-nums shadow-xs transition-colors outline-none [appearance:textfield] focus-visible:border-(--accent) focus-visible:ring-2 focus-visible:ring-(--accent)/40 dark:bg-input/30 [&::-webkit-inner-spin-button]:appearance-none"
              />
            </label>
          )}
        </div>
      </div>
    </nav>
  )
}
