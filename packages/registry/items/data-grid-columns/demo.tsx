// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/data-grid/c-data-grid-24.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import {
  COLUMNS_MENU,
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridScrollArea,
  DataGridTable,
  icons,
  useDataGridTable,
  type DataGridColumnDef,
  type DataGridProps,
  type DataGridState,
} from './data-grid-columns'

interface Member {
  id: string
  name: string
  email: string
  role: string
  team: string
  city: string
  country: string
  status: 'Active' | 'Pending' | 'Inactive' | 'Blocked'
  joined: string
  joinedAt: number
  seats: number
  balance: number
}

const members: Member[] = [
  { id: 'm1', name: 'Maya Okafor', email: 'maya@plinth.app', role: 'Product Lead', team: 'Growth', city: 'Lagos', country: 'NG', status: 'Active', joined: 'Mar 2022', joinedAt: 202203, seats: 12, balance: 5143.03 },
  { id: 'm2', name: 'Jonas Lindqvist', email: 'jonas@plinth.app', role: 'Staff Engineer', team: 'Platform', city: 'Stockholm', country: 'SE', status: 'Active', joined: 'Jan 2021', joinedAt: 202101, seats: 4, balance: 4321.87 },
  { id: 'm3', name: 'Priya Raman', email: 'priya@plinth.app', role: 'Brand Designer', team: 'Studio', city: 'Bengaluru', country: 'IN', status: 'Pending', joined: 'Aug 2024', joinedAt: 202408, seats: 2, balance: 1890.4 },
  { id: 'm4', name: 'Tomás Ferreira', email: 'tomas@plinth.app', role: 'Data Analyst', team: 'Insights', city: 'Lisbon', country: 'PT', status: 'Active', joined: 'May 2023', joinedAt: 202305, seats: 6, balance: 2750 },
  { id: 'm5', name: 'Aiko Tanaka', email: 'aiko@plinth.app', role: 'Eng. Manager', team: 'Core', city: 'Osaka', country: 'JP', status: 'Inactive', joined: 'Nov 2020', joinedAt: 202011, seats: 18, balance: 6820.15 },
  { id: 'm6', name: 'Lena Fischer', email: 'lena@plinth.app', role: 'Support Lead', team: 'Success', city: 'Berlin', country: 'DE', status: 'Active', joined: 'Feb 2022', joinedAt: 202202, seats: 9, balance: 3410.6 },
  { id: 'm7', name: 'Daniel Mensah', email: 'daniel@plinth.app', role: 'Account Exec', team: 'Sales', city: 'Accra', country: 'GH', status: 'Blocked', joined: 'Jul 2023', joinedAt: 202307, seats: 3, balance: 980.25 },
  { id: 'm8', name: 'Sofía Marín', email: 'sofia@plinth.app', role: 'UX Researcher', team: 'Insights', city: 'Valencia', country: 'ES', status: 'Active', joined: 'Sep 2021', joinedAt: 202109, seats: 5, balance: 3995.1 },
  { id: 'm9', name: 'Ethan Brooks', email: 'ethan@plinth.app', role: 'Security Eng.', team: 'Platform', city: 'Toronto', country: 'CA', status: 'Pending', joined: 'Apr 2024', joinedAt: 202404, seats: 2, balance: 1520 },
  { id: 'm10', name: 'Noor Haddad', email: 'noor@plinth.app', role: 'Finance Partner', team: 'Ops', city: 'Amman', country: 'JO', status: 'Active', joined: 'Dec 2022', joinedAt: 202212, seats: 7, balance: 4610.45 },
]

const money = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_TONE: Record<Member['status'], string> = {
  Active: 'text-emerald-600 dark:text-emerald-400',
  Pending: 'text-amber-600 dark:text-amber-400',
  Inactive: 'text-sky-600 dark:text-sky-400',
  Blocked: 'text-red-600 dark:text-red-400',
}

function Badge({ status }: { status: Member['status'] }) {
  return (
    <span className={`border-border bg-background inline-flex h-5 items-center gap-1 rounded-[min(var(--dg-radius),6px)] border px-1.5 text-xs font-medium ${STATUS_TONE[status]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold text-white"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 46%), hsl(${(hue + 40) % 360} 60% 34%))` }}
    >
      {name
        .split(' ')
        .map((part) => part[0])
        .join('')}
    </span>
  )
}

const columns: DataGridColumnDef<Member>[] = [
  {
    id: 'name',
    header: ({ column }) => <DataGridColumnHeader title="Member" visibility column={column} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} />
        <div className="min-w-0 space-y-px">
          <div className="text-foreground truncate font-medium">{row.original.name}</div>
          <div className="text-muted-foreground truncate">{row.original.email}</div>
        </div>
      </div>
    ),
    footer: ({ rows }) => <span className="text-muted-foreground">Total · {rows.length} members</span>,
    size: 220,
    minSize: 180,
    enableHiding: false,
    meta: { headerTitle: 'Member' },
  },
  {
    id: 'role',
    header: ({ column }) => <DataGridColumnHeader title="Role" visibility column={column} />,
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="text-foreground truncate font-medium">{row.original.role}</div>
        <div className="text-muted-foreground truncate">{row.original.team}</div>
      </div>
    ),
    size: 170,
    minSize: 120,
    meta: { headerTitle: 'Role' },
  },
  {
    id: 'location',
    accessorFn: (row) => row.city,
    header: ({ column }) => <DataGridColumnHeader title="Location" visibility column={column} />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="bg-muted text-muted-foreground rounded px-1 py-px text-[0.625rem] font-semibold tracking-wide">{row.original.country}</span>
        <span className="text-foreground truncate font-medium">{row.original.city}</span>
      </div>
    ),
    size: 160,
    minSize: 110,
    meta: { headerTitle: 'Location' },
  },
  {
    id: 'status',
    header: ({ column }) => <DataGridColumnHeader title="Status" visibility column={column} />,
    cell: ({ row }) => <Badge status={row.original.status} />,
    size: 116,
    minSize: 100,
    meta: { headerTitle: 'Status' },
  },
  {
    id: 'joined',
    accessorFn: (row) => row.joinedAt,
    header: ({ column }) => <DataGridColumnHeader title="Joined" visibility column={column} />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.joined}</span>,
    size: 112,
    minSize: 90,
    meta: { headerTitle: 'Joined' },
  },
  {
    id: 'seats',
    header: ({ column }) => <DataGridColumnHeader title="Seats" visibility column={column} />,
    cell: ({ row }) => <span className="text-foreground tabular-nums">{row.original.seats}</span>,
    footer: ({ rows }) => <span className="text-foreground tabular-nums">{rows.reduce((sum, row) => sum + row.seats, 0)}</span>,
    size: 112,
    minSize: 80,
    meta: { headerTitle: 'Seats' },
  },
  {
    id: 'balance',
    header: ({ column }) => <DataGridColumnHeader title="Balance" visibility column={column} />,
    cell: ({ row }) => <span className="text-foreground font-medium tabular-nums">{money(row.original.balance)}</span>,
    footer: ({ rows }) => <span className="text-foreground font-bold tabular-nums">{money(rows.reduce((sum, row) => sum + row.balance, 0))}</span>,
    size: 136,
    minSize: 110,
    meta: { headerTitle: 'Balance' },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <button
        type="button"
        aria-label={`Actions for ${row.original.name}`}
        className="hover:bg-secondary text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-[min(var(--dg-radius),6px)] transition-[color,background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-[var(--dg-accent)]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
    ),
    size: 56,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableColumnOrdering: false,
    meta: { headerTitle: 'Actions' },
  },
]

const BASE_ORDER = columns.map((column) => column.id)
const MOVED_ORDER = ['name', 'role', 'status', 'location', 'joined', 'seats', 'balance', 'actions']
const INITIAL: Partial<DataGridState> = {
  sorting: [{ id: 'name', desc: false }],
  columnPinning: { start: ['name'], end: ['actions'] },
}

const LOOP = 12

function ramp(t: number, from: number, to: number) {
  const x = Math.min(1, Math.max(0, (t - from) / (to - from)))
  return x * x * (3 - 2 * x)
}

/** 一轮 12 秒的自动演示：横纵滚动露出固定列阴影 → 打开 Balance 菜单并降序 → 拖宽 Role → 把 Status 拖到 Location 前 → 在列菜单里隐藏 Joined → 复位。 */
function script(time: number) {
  const t = time % LOOP
  const changed = t >= 3.5 && t < 11.4
  const roleSize = t >= 4.9 && t < 11.4 ? Math.round(170 + 70 * ramp(t, 5, 6)) : 170
  const state: Partial<DataGridState> = {
    sorting: changed ? [{ id: 'balance', desc: true }] : [{ id: 'name', desc: false }],
    columnPinning: { start: ['name'], end: ['actions'] },
    columnSizing: roleSize === 170 ? {} : { role: roleSize },
    columnResizing: t >= 4.9 && t < 6.2 ? 'role' : null,
    columnDragging: t >= 6.5 && t < 7.7 ? { id: 'status', dx: Math.round(-160 * ramp(t, 6.6, 7.5)) } : null,
    columnOrder: t >= 7.7 && t < 11.4 ? MOVED_ORDER : BASE_ORDER,
    columnVisibility: t >= 9 && t < 11.4 ? { joined: false } : {},
    openMenu: t >= 2.5 && t < 3.5 ? 'balance' : t >= 8.3 && t < 9.7 ? COLUMNS_MENU : null,
  }
  return { state, scrollX: ramp(t, 1, 2.2) - ramp(t, 3.9, 4.7), scrollY: ramp(t, 1, 2.2) - ramp(t, 10, 11) }
}

export function Demo(props: Omit<DataGridProps<Member>, 'table'>) {
  const host = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement | null>(null)
  const lastKey = useRef('')
  const [manual, setManual] = useState(false)
  const table = useDataGridTable({ data: members, columns, getRowId: (row) => row.id, initialState: INITIAL })

  // 自动演示：按时间算出整份表格状态，有变化才写回；真实指针或键盘一动就停下，把控制权交给用户。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const { state, scrollX, scrollY } = script(time)
      const key = JSON.stringify(state)
      if (key !== lastKey.current) {
        lastKey.current = key
        table.setState(state)
      }
      const el = viewport.current
      if (!el) return
      const left = scrollX * (el.scrollWidth - el.clientWidth)
      const top = scrollY * (el.scrollHeight - el.clientHeight)
      if (Math.abs(el.scrollLeft - left) > 0.5) el.scrollLeft = left
      if (Math.abs(el.scrollTop - top) > 0.5) el.scrollTop = top
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )

  const takeOver = () => {
    if (manual) return
    setManual(true)
    table.setState({ columnDragging: null, columnResizing: null })
  }

  return (
    <div
      ref={host}
      onPointerDownCapture={takeOver}
      onWheelCapture={takeOver}
      onKeyDownCapture={takeOver}
      onTouchStartCapture={takeOver}
      className="bg-background h-full w-full overflow-y-auto p-4 sm:p-8"
    >
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center">
        <DataGrid
          table={table}
          {...props}
          tableLayout={{ columnsPinnable: true, columnsResizable: true, columnsMovable: true, columnsVisibility: true, columnsDraggable: true }}
        >
          <div className="bg-background text-foreground w-full overflow-hidden rounded-[var(--dg-radius)] border">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="text-muted-foreground size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 10h18M9 10v10" />
                </svg>
                <span className="truncate text-sm font-medium">Team balances</span>
                <span className="text-muted-foreground text-xs tabular-nums">{members.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <DataGridColumnVisibility
                  trigger={
                    <>
                      {icons.sliders()}
                      Columns
                    </>
                  }
                />
                <button
                  type="button"
                  className="border-input bg-background hover:bg-muted/60 inline-flex h-8 items-center gap-1.5 rounded-[min(var(--dg-radius),8px)] border px-2.5 text-[0.8125rem] font-medium transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-[var(--dg-accent)]"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
            <div className="border-t">
              <DataGridScrollArea viewportRef={viewport} maxHeight={440} aria-label="Team balances">
                <DataGridTable />
              </DataGridScrollArea>
            </div>
          </div>
        </DataGrid>
      </div>
    </div>
  )
}
