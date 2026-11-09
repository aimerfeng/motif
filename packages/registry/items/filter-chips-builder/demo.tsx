// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/filters/c-filters-3.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { Filters, type FilterField, type FilterOpen, type FilterOption, type FilterRule, type FiltersProps } from './filter-chips-builder'

/* ---------- 色调（c-filters-3 的 Tones）：每个状态一个色相，徽章和色点各用一份完整类名 ---------- */

interface Tone {
  value: string
  label: string
  dot: string
  badge: string
}

const STATUSES: Tone[] = [
  { value: 'backlog', label: 'Backlog', dot: 'bg-zinc-400', badge: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/25 dark:bg-zinc-400/15 dark:text-zinc-300' },
  { value: 'in-progress', label: 'In progress', dot: 'bg-amber-500', badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/15 dark:text-amber-300' },
  { value: 'review', label: 'In review', dot: 'bg-sky-500', badge: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/15 dark:text-sky-300' },
  { value: 'done', label: 'Done', dot: 'bg-emerald-500', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-300' },
  { value: 'shipped', label: 'Shipped', dot: 'bg-violet-500', badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/25 dark:bg-violet-400/15 dark:text-violet-300' },
  { value: 'cancelled', label: 'Cancelled', dot: 'bg-rose-500', badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/15 dark:text-rose-300' },
]

const PRIORITIES: Tone[] = [
  { value: 'low', label: 'Low', dot: 'bg-emerald-500', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-300' },
  { value: 'medium', label: 'Medium', dot: 'bg-yellow-500', badge: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/25 dark:bg-yellow-400/15 dark:text-yellow-300' },
  { value: 'high', label: 'High', dot: 'bg-violet-500', badge: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/25 dark:bg-violet-400/15 dark:text-violet-300' },
  { value: 'urgent', label: 'Urgent', dot: 'bg-orange-500', badge: 'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:border-orange-400/25 dark:bg-orange-400/15 dark:text-orange-300' },
  { value: 'critical', label: 'Critical', dot: 'bg-rose-500', badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/15 dark:text-rose-300' },
]

const toOptions = (tones: Tone[]): FilterOption[] =>
  tones.map((tone) => ({ ...tone, icon: <span className={cn('size-2.5 shrink-0 rounded-full', tone.dot)} /> }))

function Glyph({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const fields: FilterField[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    defaultOperator: 'is_any_of',
    options: toOptions(STATUSES),
    searchable: false,
    emptyLabel: 'any status',
    icon: <Glyph d="M8 2.25a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5ZM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />,
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'multiselect',
    options: toOptions(PRIORITIES),
    searchable: false,
    emptyLabel: 'any priority',
    icon: <Glyph d="M3.5 14V2.75h8.25l-1.5 3 1.5 3H3.5" />,
  },
  { id: 'title', label: 'Title', type: 'text', icon: <Glyph d="M3 4V3h10v1M8 3v10m-2 0h4" /> },
  { id: 'estimate', label: 'Estimate', type: 'number', placeholder: 'Points', icon: <Glyph d="M6 2.5 5 13.5M11 2.5l-1 11M2.75 6h11M2.25 10.5h11" /> },
  { id: 'due', label: 'Due date', type: 'date', icon: <Glyph d="M3.75 3.5h8.5c.69 0 1.25.56 1.25 1.25v7.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-7.5c0-.69.56-1.25 1.25-1.25ZM2.5 7h11M5.5 2v3M10.5 2v3" /> },
]

/* ---------- 一个虚构团队的任务 ---------- */

interface Issue {
  id: string
  title: string
  status: string
  priority: string
  estimate: number
  due: string
}

const ISSUES: Issue[] = [
  { id: 'PLT-482', title: 'Retry failed webhook deliveries with backoff', status: 'in-progress', priority: 'urgent', estimate: 5, due: '2025-03-18' },
  { id: 'PLT-479', title: 'Rotate webhook signing secrets without downtime', status: 'review', priority: 'critical', estimate: 3, due: '2025-03-14' },
  { id: 'PLT-476', title: 'Paginate the audit log export', status: 'backlog', priority: 'high', estimate: 8, due: '2025-04-02' },
  { id: 'PLT-471', title: 'Flaky test in billing reconciliation', status: 'in-progress', priority: 'critical', estimate: 2, due: '2025-03-12' },
  { id: 'PLT-468', title: 'Invoice PDF loses contrast in dark mode', status: 'done', priority: 'medium', estimate: 1, due: '2025-03-07' },
  { id: 'PLT-466', title: 'Rate-limit the webhook replay endpoint', status: 'backlog', priority: 'urgent', estimate: 3, due: '2025-03-21' },
  { id: 'PLT-463', title: 'Move nightly cron jobs onto queue workers', status: 'review', priority: 'high', estimate: 13, due: '2025-03-28' },
  { id: 'PLT-458', title: 'Digest email drops mentions in threads', status: 'backlog', priority: 'low', estimate: 2, due: '2025-04-11' },
]

const empty = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

/** 演示用的过滤：未写完的规则（没有条件或没有值）不参与。 */
function matches(issue: Issue, rule: FilterRule): boolean {
  if (!rule.operator) return true
  const raw = issue[rule.field as keyof Issue]
  const value = rule.value
  const text = String(raw).toLowerCase()
  const needle = String(value ?? '').toLowerCase()
  const list = Array.isArray(value) ? value.map(String) : []
  const pair = Array.isArray(value) ? value.map(Number) : []
  let ok = true
  switch (rule.operator) {
    case 'empty':
      ok = raw === ''
      break
    case 'not_empty':
      ok = raw !== ''
      break
    default:
      if (empty(value)) return true
      switch (rule.operator) {
        case 'is_any_of':
        case 'has_any_of':
          ok = list.includes(String(raw))
          break
        case 'is_none_of':
        case 'has_none_of':
          ok = !list.includes(String(raw))
          break
        case 'has_all_of':
          ok = list.every((entry) => entry === String(raw))
          break
        case 'is':
        case 'eq':
          ok = text === needle
          break
        case 'is_not':
        case 'neq':
          ok = text !== needle
          break
        case 'contains':
          ok = text.includes(needle)
          break
        case 'not_contains':
          ok = !text.includes(needle)
          break
        case 'starts_with':
          ok = text.startsWith(needle)
          break
        case 'ends_with':
          ok = text.endsWith(needle)
          break
        case 'gt':
          ok = Number(raw) > Number(value)
          break
        case 'gte':
          ok = Number(raw) >= Number(value)
          break
        case 'lt':
          ok = Number(raw) < Number(value)
          break
        case 'lte':
          ok = Number(raw) <= Number(value)
          break
        case 'between':
          ok = Number(raw) >= (pair[0] ?? -Infinity) && Number(raw) <= (pair[1] ?? Infinity)
          break
        case 'not_between':
          ok = Number(raw) < (pair[0] ?? -Infinity) || Number(raw) > (pair[1] ?? Infinity)
          break
        case 'is_before':
          ok = text < needle
          break
        case 'is_after':
          ok = text > needle
          break
        case 'is_on_or_before':
          ok = text <= needle
          break
        case 'is_on_or_after':
          ok = text >= needle
          break
      }
  }
  return rule.negated ? !ok : ok
}

/* ---------- 自动播放：一轮 12 秒，结尾回到起点 ---------- */

const STATUS_RULE: FilterRule = { id: 'seed-1', field: 'status', operator: 'is_any_of', value: ['backlog', 'in-progress', 'review'] }
const PRIORITY_RULE: FilterRule = { id: 'seed-2', field: 'priority', operator: 'has_any_of', value: ['urgent', 'critical'] }
const PRIORITY_PLUS: FilterRule = { ...PRIORITY_RULE, value: ['urgent', 'critical', 'high'] }
const SEED = [STATUS_RULE, PRIORITY_RULE]
const TITLE_ID = 'auto-title'
const title = (operator: string | null, value?: string): FilterRule => ({ id: TITLE_ID, field: 'title', operator, value })
const TYPED = 'webhook'
const PERIOD = 12

interface Frame {
  rules: FilterRule[]
  open: FilterOpen | null
  highlight?: string | null
  draft?: string
}

function scripted(time: number): Frame {
  const t = time % PERIOD
  const titled = title('contains', TYPED)
  const priorityValue: FilterOpen = { kind: 'value', ruleId: PRIORITY_RULE.id }
  // 添加：字段列表里一格一格往下走到 Title。
  if (t < 0.8) return { rules: SEED, open: null }
  if (t < 2.0) return { rules: SEED, open: { kind: 'add' }, highlight: ['status', 'priority', 'title'][Math.min(2, Math.floor((t - 0.8) / 0.35))] }
  // 新胶囊先打开条件菜单，再交给文本编辑器，逐字输入。
  if (t < 2.9) return { rules: [...SEED, title(null)], open: { kind: 'operator', ruleId: TITLE_ID }, highlight: 'contains' }
  if (t < 4.5) {
    const count = t < 3.1 ? 0 : Math.min(TYPED.length, Math.floor((t - 3.1) / 0.13) + 1)
    return { rules: [...SEED, title('contains')], open: { kind: 'value', ruleId: TITLE_ID }, draft: TYPED.slice(0, count) }
  }
  if (t < 5.3) return { rules: [STATUS_RULE, PRIORITY_RULE, titled], open: null }
  // 优先级再勾一项：两枚徽章折叠成一叠色点。
  if (t < 6.1) return { rules: [STATUS_RULE, PRIORITY_RULE, titled], open: priorityValue, highlight: t < 5.7 ? 'urgent' : 'high' }
  if (t < 7.0) return { rules: [STATUS_RULE, PRIORITY_PLUS, titled], open: priorityValue, highlight: 'high' }
  if (t < 7.6) return { rules: [STATUS_RULE, PRIORITY_PLUS, titled], open: null }
  // ⋮ 菜单里删除 Title。
  if (t < 8.8) return { rules: [STATUS_RULE, PRIORITY_PLUS, titled], open: { kind: 'menu', ruleId: TITLE_ID }, highlight: t < 8.0 ? 'duplicate' : t < 8.4 ? 'negate' : 'remove' }
  if (t < 9.6) return { rules: [STATUS_RULE, PRIORITY_PLUS], open: null }
  // 取消刚才勾的那项，回到起点。
  if (t < 10.4) return { rules: [STATUS_RULE, PRIORITY_PLUS], open: priorityValue, highlight: 'high' }
  if (t < 11.0) return { rules: SEED, open: priorityValue, highlight: 'high' }
  return { rules: SEED, open: null }
}

const signature = (frame: Frame) => JSON.stringify(frame)

export function Demo(props: Partial<FiltersProps>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Frame>(() => scripted(0))
  const [manual, setManual] = useState<FilterRule[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (signature(prev) === signature(next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 6.5 },
  )

  const stop = () => {
    if (!manual) setManual(auto.rules)
  }

  const rules = manual ?? auto.rules
  const shown = ISSUES.filter((issue) => rules.every((rule) => matches(issue, rule)))
  const statusOf = (value: string) => STATUSES.find((tone) => tone.value === value)
  const priorityOf = (value: string) => PRIORITIES.find((tone) => tone.value === value)

  return (
    <div ref={host} onPointerDown={stop} onKeyDown={stop} className="h-full w-full overflow-hidden bg-background px-4 pt-[7vh] sm:px-8">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-foreground">Issues</h2>
            <span className="text-xs text-muted-foreground">Platform team</span>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {shown.length} of {ISSUES.length}
          </span>
        </div>

        <Filters
          {...props}
          fields={fields}
          rules={rules}
          onRulesChange={setManual}
          open={manual ? undefined : auto.open}
          highlight={manual ? undefined : auto.highlight}
          draft={manual ? undefined : auto.draft}
        />

        <ul className="mt-4 overflow-hidden rounded-xl border bg-card text-card-foreground">
          {shown.length === 0 ? <li className="px-4 py-8 text-center text-sm text-muted-foreground">No issues match these filters.</li> : null}
          {shown.map((issue) => {
            const status = statusOf(issue.status)
            const priority = priorityOf(issue.priority)
            return (
              <li key={issue.id} className="flex items-center gap-3 border-b px-3 py-2.5 text-sm last:border-b-0">
                <span aria-label={status?.label} className={cn('size-2.5 shrink-0 rounded-full', status?.dot)} />
                <span className="hidden w-16 shrink-0 font-mono text-xs text-muted-foreground sm:block">{issue.id}</span>
                <span className="min-w-0 flex-1 truncate">{issue.title}</span>
                {priority ? (
                  <span className={cn('hidden h-5 shrink-0 items-center rounded-4xl border px-2 text-xs font-medium sm:inline-flex', priority.badge)}>{priority.label}</span>
                ) : null}
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{issue.estimate}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
