// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/data-grid/data-grid.tsx
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/data-grid/data-grid-table.tsx
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/data-grid/data-grid-column-header.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  density: 'default',
  striped: false,
  cellBorder: false,
  headerSticky: true,
  pinShadow: true,
  showFooter: true,
  radius: 12,
}
/* @motif:end */

/* ------------------------------------------------------------------------------------------------
 * 列模型：替代 @tanstack/react-table。只实现网格真正用到的那部分 API（排序、显隐、顺序、固定、宽度），
 * 方法名沿用 TanStack，这样 reui 的表头 / 单元格代码可以几乎原样保留。
 * ---------------------------------------------------------------------------------------------- */

export type DataGridPinPosition = 'start' | 'end'

export interface DataGridRow<TData> {
  id: string
  index: number
  original: TData
}

export interface DataGridColumnMeta {
  /** 列显隐菜单和表头里显示的名字。 */
  headerTitle?: string
  headerClassName?: string
  cellClassName?: string
  footerClassName?: string
}

export interface DataGridColumnDef<TData> {
  id: string
  header?: string | ((ctx: { column: DataGridColumn<TData> }) => ReactNode)
  cell?(ctx: { row: DataGridRow<TData>; column: DataGridColumn<TData> }): ReactNode
  /** 合计行内容；tableLayout.footer 打开时渲染，随列一起移动、固定和隐藏。 */
  footer?(ctx: { rows: TData[]; column: DataGridColumn<TData> }): ReactNode
  /** 排序取值；省略时读 row[id]。 */
  accessorFn?(row: TData): string | number
  size?: number
  minSize?: number
  maxSize?: number
  enableSorting?: boolean
  enableHiding?: boolean
  enableResizing?: boolean
  enablePinning?: boolean
  enableColumnOrdering?: boolean
  meta?: DataGridColumnMeta
}

export interface DataGridState {
  sorting: { id: string; desc: boolean }[]
  columnOrder: string[]
  columnVisibility: Record<string, boolean>
  columnPinning: { start: string[]; end: string[] }
  columnSizing: Record<string, number>
  /** 正在拖动宽度的列。 */
  columnResizing: string | null
  /** 正在拖动表头换位的列和水平位移。 */
  columnDragging: { id: string; dx: number } | null
  /** 当前打开的菜单：列 id 是该列的表头菜单，COLUMNS_MENU 是列显隐菜单。 */
  openMenu: string | null
}

export const COLUMNS_MENU = '__columns'

export interface DataGridColumn<TData> {
  id: string
  columnDef: DataGridColumnDef<TData>
  getSize(): number
  /** 在全部可见列（start + center + end）中的下标。 */
  getIndex(): number
  getIsVisible(): boolean
  getCanSort(): boolean
  getCanHide(): boolean
  getCanPin(): boolean
  getCanResize(): boolean
  getCanOrder(): boolean
  getIsSorted(): false | 'asc' | 'desc'
  getIsPinned(): false | DataGridPinPosition
  getIsResizing(): boolean
  getStart(position: DataGridPinPosition): number
  getAfter(position: DataGridPinPosition): number
  getIsFirstColumn(position: DataGridPinPosition | 'center'): boolean
  getIsLastColumn(position: DataGridPinPosition | 'center'): boolean
  toggleSorting(desc: boolean): void
  clearSorting(): void
  pin(position: false | DataGridPinPosition): void
  toggleVisibility(value: boolean): void
  resetSize(): void
}

export interface DataGridTableInstance<TData> {
  state: DataGridState
  options: { data: TData[]; columns: DataGridColumnDef<TData>[] }
  setState(update: Partial<DataGridState> | ((old: DataGridState) => Partial<DataGridState>)): void
  /** 回到 useDataGridTable 的 initialState。 */
  resetState(): void
  getAllColumns(): DataGridColumn<TData>[]
  getColumn(id: string): DataGridColumn<TData> | undefined
  getVisibleLeafColumns(): DataGridColumn<TData>[]
  getStartVisibleLeafColumns(): DataGridColumn<TData>[]
  getCenterVisibleLeafColumns(): DataGridColumn<TData>[]
  getEndVisibleLeafColumns(): DataGridColumn<TData>[]
  getRowModel(): { rows: DataGridRow<TData>[] }
  getTotalSize(): number
  setColumnSize(id: string, size: number): void
  /** 在可见的非固定列之间左右移动一格。 */
  moveColumn(id: string, direction: -1 | 1): void
  /** 按当前拖动位移落位并结束拖动。 */
  commitColumnDrag(): void
}

const DEFAULT_SIZE = 150
const DEFAULT_MIN_SIZE = 48
const DEFAULT_MAX_SIZE = 800

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createInitialState<TData>(columns: DataGridColumnDef<TData>[], initial?: Partial<DataGridState>): DataGridState {
  return {
    sorting: [],
    columnVisibility: {},
    columnPinning: { start: [], end: [] },
    columnSizing: {},
    columnResizing: null,
    columnDragging: null,
    openMenu: null,
    ...initial,
    columnOrder: initial?.columnOrder?.length ? initial.columnOrder : columns.map((column) => column.id),
  }
}

function compareValues(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' })
}

function buildTable<TData extends object>(
  state: DataGridState,
  setState: DataGridTableInstance<TData>['setState'],
  resetState: () => void,
  data: TData[],
  columnDefs: DataGridColumnDef<TData>[],
  getRowId?: (row: TData, index: number) => string,
): DataGridTableInstance<TData> {
  const defs = new Map(columnDefs.map((def) => [def.id, def]))
  // 状态里可能缺列（列定义后来新增）或多出已删的列：补齐 / 剔除，保证顺序完整。
  const order = [...state.columnOrder.filter((id) => defs.has(id)), ...columnDefs.map((def) => def.id).filter((id) => !state.columnOrder.includes(id))]
  const visible = (id: string) => state.columnVisibility[id] !== false
  const startIds = state.columnPinning.start.filter((id) => defs.has(id))
  const endIds = state.columnPinning.end.filter((id) => defs.has(id) && !startIds.includes(id))
  const pinned = new Set([...startIds, ...endIds])
  const visibleStart = startIds.filter(visible)
  const visibleCenter = order.filter((id) => !pinned.has(id) && visible(id))
  const visibleEnd = endIds.filter(visible)
  const visibleIds = [...visibleStart, ...visibleCenter, ...visibleEnd]

  const sizeOf = (id: string) => {
    const def = defs.get(id)!
    return clamp(state.columnSizing[id] ?? def.size ?? DEFAULT_SIZE, def.minSize ?? DEFAULT_MIN_SIZE, def.maxSize ?? DEFAULT_MAX_SIZE)
  }
  const sum = (ids: string[]) => ids.reduce((total, id) => total + sizeOf(id), 0)

  const reorder = (id: string, targetId: string, direction: -1 | 1) => {
    if (id === targetId) return
    const next = order.filter((other) => other !== id)
    const at = next.indexOf(targetId)
    next.splice(direction < 0 ? at : at + 1, 0, id)
    setState({ columnOrder: next })
  }

  const columns = new Map<string, DataGridColumn<TData>>()
  for (const def of columnDefs) {
    const id = def.id
    const groupOf = (): DataGridPinPosition | 'center' => (startIds.includes(id) ? 'start' : endIds.includes(id) ? 'end' : 'center')
    const groupIds = (position: DataGridPinPosition | 'center') => (position === 'start' ? visibleStart : position === 'end' ? visibleEnd : visibleCenter)
    columns.set(id, {
      id,
      columnDef: def,
      getSize: () => sizeOf(id),
      getIndex: () => visibleIds.indexOf(id),
      getIsVisible: () => visible(id),
      getCanSort: () => def.enableSorting !== false,
      getCanHide: () => def.enableHiding !== false,
      getCanPin: () => def.enablePinning !== false,
      getCanResize: () => def.enableResizing !== false,
      getCanOrder: () => def.enableColumnOrdering !== false,
      getIsSorted: () => {
        const sort = state.sorting.find((entry) => entry.id === id)
        return sort ? (sort.desc ? 'desc' : 'asc') : false
      },
      getIsPinned: () => (startIds.includes(id) ? 'start' : endIds.includes(id) ? 'end' : false),
      getIsResizing: () => state.columnResizing === id,
      getStart: (position) => {
        const ids = groupIds(position)
        return sum(ids.slice(0, Math.max(0, ids.indexOf(id))))
      },
      getAfter: (position) => {
        const ids = groupIds(position)
        const at = ids.indexOf(id)
        return at < 0 ? 0 : sum(ids.slice(at + 1))
      },
      getIsFirstColumn: (position) => groupOf() === position && groupIds(position)[0] === id,
      getIsLastColumn: (position) => {
        const ids = groupIds(position)
        return groupOf() === position && ids[ids.length - 1] === id
      },
      toggleSorting: (desc) => setState({ sorting: [{ id, desc }] }),
      clearSorting: () => setState((old) => ({ sorting: old.sorting.filter((entry) => entry.id !== id) })),
      pin: (position) =>
        setState((old) => {
          const start = old.columnPinning.start.filter((other) => other !== id)
          const end = old.columnPinning.end.filter((other) => other !== id)
          if (position === 'start') start.push(id)
          if (position === 'end') end.push(id)
          return { columnPinning: { start, end } }
        }),
      toggleVisibility: (value) => setState((old) => ({ columnVisibility: { ...old.columnVisibility, [id]: value } })),
      resetSize: () =>
        setState((old) => {
          const next = { ...old.columnSizing }
          delete next[id]
          return { columnSizing: next }
        }),
    })
  }

  const pick = (ids: string[]) => ids.map((id) => columns.get(id)!)

  const rows: DataGridRow<TData>[] = data.map((original, index) => ({ id: getRowId ? getRowId(original, index) : String(index), index, original }))
  const sort = state.sorting.find((entry) => defs.has(entry.id))
  if (sort) {
    const def = defs.get(sort.id)!
    const read = (row: TData): unknown => (def.accessorFn ? def.accessorFn(row) : (row as Record<string, unknown>)[def.id])
    rows.sort((a, b) => compareValues(read(a.original), read(b.original)) * (sort.desc ? -1 : 1) || a.index - b.index)
  }

  return {
    state: { ...state, columnOrder: order },
    options: { data, columns: columnDefs },
    setState,
    resetState,
    getAllColumns: () => pick(order),
    getColumn: (id) => columns.get(id),
    getVisibleLeafColumns: () => pick(visibleIds),
    getStartVisibleLeafColumns: () => pick(visibleStart),
    getCenterVisibleLeafColumns: () => pick(visibleCenter),
    getEndVisibleLeafColumns: () => pick(visibleEnd),
    getRowModel: () => ({ rows }),
    getTotalSize: () => sum(visibleIds),
    setColumnSize: (id, size) => {
      const def = defs.get(id)
      if (!def) return
      const next = Math.round(clamp(size, def.minSize ?? DEFAULT_MIN_SIZE, def.maxSize ?? DEFAULT_MAX_SIZE))
      setState((old) => ({ columnSizing: { ...old.columnSizing, [id]: next } }))
    },
    moveColumn: (id, direction) => {
      const at = visibleCenter.indexOf(id)
      const target = visibleCenter[at + direction]
      if (at < 0 || !target) return
      reorder(id, target, direction)
    },
    commitColumnDrag: () => {
      const drag = state.columnDragging
      if (drag) {
        const center = pick(visibleCenter)
        const from = visibleCenter.indexOf(drag.id)
        const to = from < 0 ? from : getDropIndex(center, from, drag.dx)
        if (from >= 0 && to !== from) reorder(drag.id, visibleCenter[to]!, to < from ? -1 : 1)
      }
      setState({ columnDragging: null })
    },
  }
}

/** 拖动列的中点落在哪一列上（dnd-kit horizontalListSortingStrategy 的同一判定）。 */
function getDropIndex<TData>(center: DataGridColumn<TData>[], from: number, dx: number) {
  let x = 0
  const starts = center.map((column) => {
    const start = x
    x += column.getSize()
    return start
  })
  const middle = starts[from]! + center[from]!.getSize() / 2 + dx
  for (let i = 0; i < center.length; i++) if (middle < starts[i]! + center[i]!.getSize()) return i
  return center.length - 1
}

/** 拖动时各列的位移：被拖的列跟手，经过的列让出被拖列的宽度。 */
function getColumnShifts<TData>(table: DataGridTableInstance<TData>) {
  const shifts = new Map<string, number>()
  const drag = table.state.columnDragging
  if (!drag) return shifts
  const center = table.getCenterVisibleLeafColumns()
  const from = center.findIndex((column) => column.id === drag.id)
  if (from < 0) return shifts
  const to = getDropIndex(center, from, drag.dx)
  const width = center[from]!.getSize()
  shifts.set(drag.id, drag.dx)
  if (to < from) for (let i = to; i < from; i++) shifts.set(center[i]!.id, width)
  else for (let i = from + 1; i <= to; i++) shifts.set(center[i]!.id, -width)
  return shifts
}

export function useDataGridTable<TData extends object>({
  data,
  columns,
  getRowId,
  initialState,
}: {
  data: TData[]
  columns: DataGridColumnDef<TData>[]
  getRowId?: (row: TData, index: number) => string
  initialState?: Partial<DataGridState>
}): DataGridTableInstance<TData> {
  const [initial] = useState(() => createInitialState(columns, initialState))
  const [state, setRaw] = useState<DataGridState>(initial)
  const setState = useCallback<DataGridTableInstance<TData>['setState']>(
    (update) => setRaw((old) => ({ ...old, ...(typeof update === 'function' ? update(old) : update) })),
    [],
  )
  const resetState = useCallback(() => setRaw(initial), [initial])
  return useMemo(() => buildTable(state, setState, resetState, data, columns, getRowId), [state, setState, resetState, data, columns, getRowId])
}

/** 表头 / 显隐菜单里的列名：meta.headerTitle，字符串 header，最后是 id。 */
export function getColumnHeaderLabel<TData>(column: DataGridColumn<TData>): string {
  if (typeof column.columnDef.meta?.headerTitle === 'string') return column.columnDef.meta.headerTitle
  if (typeof column.columnDef.header === 'string') return column.columnDef.header
  return column.id
}

/* ------------------------------------------------------------------------------------------------
 * DataGrid：上下文 + 外观参数
 * ---------------------------------------------------------------------------------------------- */

export interface DataGridTableLayout {
  dense: boolean
  cellBorder: boolean
  rowBorder: boolean
  stripped: boolean
  headerBackground: boolean
  footerBackground: boolean
  headerBorder: boolean
  headerSticky: boolean
  columnsVisibility: boolean
  columnsResizable: boolean
  columnsPinnable: boolean
  columnsMovable: boolean
  columnsDraggable: boolean
  /** 固定列在内容滚到它下面时投下柔和阴影。 */
  pinShadow: boolean
  /** 渲染列定义里的 footer（合计行）。 */
  footer: boolean
}

export interface DataGridTableClassNames {
  base: string
  header: string
  headerRow: string
  headerSticky: string
  body: string
  bodyRow: string
  footer: string
}

const DEFAULT_LAYOUT: DataGridTableLayout = {
  dense: false,
  cellBorder: false,
  rowBorder: true,
  stripped: false,
  headerBackground: false,
  footerBackground: false,
  headerBorder: true,
  headerSticky: false,
  columnsVisibility: false,
  columnsResizable: false,
  columnsPinnable: false,
  columnsMovable: false,
  columnsDraggable: false,
  pinShadow: false,
  footer: false,
}

const DEFAULT_CLASS_NAMES: DataGridTableClassNames = {
  base: '',
  header: '',
  headerRow: '',
  // z-40 让粘性表头压在固定列（z 30）之上。
  headerSticky: 'sticky top-0 z-40 bg-background/90 backdrop-blur-xs',
  body: '',
  bodyRow: '',
  footer: '',
}

const LABELS = {
  sortAscending: 'Asc',
  sortDescending: 'Desc',
  pinColumnStart: 'Pin to left',
  pinColumnEnd: 'Pin to right',
  moveColumnStart: 'Move to left',
  moveColumnEnd: 'Move to right',
  columnsMenu: 'Columns',
  toggleColumns: 'Toggle columns',
  noData: 'No data available',
  dragToReorder: (title: string) => `Drag to reorder ${title} column`,
  resizeColumn: (title: string) => `Resize ${title} column`,
  unpinColumn: (title: string) => `Unpin ${title} column`,
}

export type DataGridLabels = typeof LABELS

interface DataGridContextValue {
  table: DataGridTableInstance<object>
  props: { tableLayout: DataGridTableLayout; tableClassNames: DataGridTableClassNames; recordCount: number }
  i18n: DataGridLabels
  /** 主题变量：菜单渲染在 body 的 portal 里，继承不到网格根节点上的变量。 */
  vars: CSSProperties
  reduced: boolean
}

const DataGridContext = createContext<DataGridContextValue | null>(null)

export function useDataGrid() {
  const context = useContext(DataGridContext)
  if (!context) throw new Error('useDataGrid must be used within a DataGrid')
  return context
}

/** 按亮度选深 / 浅字色，保证强调色上的勾选标记可读。 */
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

export type DataGridProps<TData extends object> = Partial<typeof defaults> & {
  table: DataGridTableInstance<TData>
  recordCount?: number
  tableLayout?: Partial<DataGridTableLayout>
  tableClassNames?: Partial<DataGridTableClassNames>
  i18n?: Partial<DataGridLabels>
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function DataGrid<TData extends object>({ table, recordCount, tableLayout, tableClassNames, i18n, className, style, children, ...params }: DataGridProps<TData>) {
  const options = { ...defaults, ...params }
  const reduced = Boolean(useReducedMotion())
  const vars = cssVars({ '--dg-accent': options.accent, '--dg-ink': inkFor(options.accent), '--dg-radius': `${options.radius}px` })
  const value: DataGridContextValue = {
    table,
    props: {
      tableLayout: {
        ...DEFAULT_LAYOUT,
        dense: options.density === 'dense',
        stripped: options.striped,
        cellBorder: options.cellBorder,
        headerSticky: options.headerSticky,
        pinShadow: options.pinShadow,
        footer: options.showFooter,
        ...tableLayout,
      },
      tableClassNames: { ...DEFAULT_CLASS_NAMES, ...tableClassNames },
      recordCount: recordCount ?? table.options.data.length,
    },
    i18n: { ...LABELS, ...i18n },
    vars,
    reduced,
  }
  return (
    <DataGridContext.Provider value={value}>
      <div data-slot="data-grid-root" className={cn('w-full', className)} style={{ ...vars, ...style }}>
        {children}
      </div>
    </DataGridContext.Provider>
  )
}

export function DataGridContainer({ children, className, border = false }: { children: ReactNode; className?: string; border?: boolean }) {
  return (
    <div data-slot="data-grid" className={cn('relative w-full overflow-hidden', border && 'rounded-[var(--dg-radius)] border', className)}>
      {children}
    </div>
  )
}

/** 原生滚动区域（替代 base-ui ScrollArea）；左右是否还有内容写在 data-scroll-start / data-scroll-end 上，固定列阴影据此显隐。 */
export function DataGridScrollArea({
  children,
  className,
  style,
  maxHeight,
  viewportRef,
  'aria-label': ariaLabel = 'Table',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  maxHeight?: number | string
  viewportRef?: Ref<HTMLDivElement>
  'aria-label'?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      el.toggleAttribute('data-scroll-start', el.scrollLeft > 1)
      el.toggleAttribute('data-scroll-end', el.scrollLeft < max - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])
  return (
    <div
      ref={(node) => {
        ref.current = node
        if (typeof viewportRef === 'function') viewportRef(node)
        else if (viewportRef) viewportRef.current = node
      }}
      data-slot="data-grid-scroll-area"
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        'relative w-full overflow-auto overscroll-x-contain [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]',
        'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--dg-accent)]',
        className,
      )}
      style={{ maxHeight, ...style }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 图标（内联 SVG，替代 IconPlaceholder）
 * ---------------------------------------------------------------------------------------------- */

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-4 shrink-0', className)}>
      {children}
    </svg>
  )
}

export const icons = {
  arrowUp: (className?: string) => (
    <Icon className={className}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Icon>
  ),
  arrowDown: (className?: string) => (
    <Icon className={className}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </Icon>
  ),
  arrowLeft: (className?: string) => (
    <Icon className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
  ),
  arrowRight: (className?: string) => (
    <Icon className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </Icon>
  ),
  chevronsUpDown: (className?: string) => (
    <Icon className={className}>
      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
    </Icon>
  ),
  chevronRight: (className?: string) => (
    <Icon className={className}>
      <path d="M9 18l6-6-6-6" />
    </Icon>
  ),
  check: (className?: string) => (
    <Icon className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  toLeft: (className?: string) => (
    <Icon className={className}>
      <path d="M3 5v14M13 6l-6 6 6 6M7 12h14" />
    </Icon>
  ),
  toRight: (className?: string) => (
    <Icon className={className}>
      <path d="M21 5v14M11 6l6 6-6 6M17 12H3" />
    </Icon>
  ),
  sliders: (className?: string) => (
    <Icon className={className}>
      <path d="M20 7h-9M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </Icon>
  ),
  pinOff: (className?: string) => (
    <Icon className={className}>
      <path d="M12 17v5M9 4h6M10 4v5.5L7 13v2h10v-2l-3-3.5V4M3 3l18 18" />
    </Icon>
  ),
  grip: (className?: string) => (
    <Icon className={className}>
      <circle cx="9" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" />
      <circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="18" r="1" fill="currentColor" />
    </Icon>
  ),
}

/* ------------------------------------------------------------------------------------------------
 * 下拉菜单（替代 base-ui DropdownMenu）：portal 到 body、方向键导航、Esc 关闭、点外部关闭、子菜单
 * ---------------------------------------------------------------------------------------------- */

const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--dg-accent)]'

const menuItemClassName = cn(
  'relative flex w-full cursor-default items-center gap-2 rounded-[calc(min(var(--dg-radius),12px)-6px)] px-2 py-1.5 text-start text-sm outline-none select-none',
  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground aria-expanded:bg-accent',
  'aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:opacity-70',
)

type MenuTriggerProps = {
  ref: (node: HTMLButtonElement | null) => void
  id: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string | undefined
  'data-state': 'open' | 'closed'
  onClick: () => void
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void
}

interface MenuContextValue {
  close: (refocus?: boolean) => void
  menuId: string
  sub: string | null
  setSub: (id: string | null) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenu() {
  const context = useContext(MenuContext)
  if (!context) throw new Error('Menu items must be rendered inside DropdownMenu')
  return context
}

function focusItems(container: HTMLElement | null, menuId: string) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(`[data-menu-item="${menuId}"]:not([aria-disabled="true"])`))
}

function handleMenuKeys(event: ReactKeyboardEvent<HTMLElement>, container: HTMLElement | null, menuId: string) {
  const items = focusItems(container, menuId)
  if (!items.length) return false
  const at = items.indexOf(document.activeElement as HTMLElement)
  let next = -1
  if (event.key === 'ArrowDown') next = at < 0 ? 0 : (at + 1) % items.length
  else if (event.key === 'ArrowUp') next = at < 0 ? items.length - 1 : (at - 1 + items.length) % items.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = items.length - 1
  if (next < 0) return false
  event.preventDefault()
  items[next]!.focus()
  return true
}

export function DropdownMenu({
  open: controlledOpen,
  onOpenChange,
  trigger,
  align = 'start',
  className,
  label,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: (props: MenuTriggerProps) => ReactNode
  align?: 'start' | 'end'
  className?: string
  label?: string
  children: ReactNode
}) {
  const { vars, reduced } = useDataGrid()
  const [innerOpen, setInnerOpen] = useState(false)
  const open = controlledOpen ?? innerOpen
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInnerOpen(next)
      onOpenChange?.(next)
    },
    [controlledOpen, onOpenChange],
  )
  const id = useId()
  const menuId = `${id}menu`
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const focusOnOpen = useRef(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [sub, setSub] = useState<string | null>(null)

  const close = useCallback(
    (refocus = false) => {
      setOpen(false)
      setSub(null)
      if (refocus) triggerRef.current?.focus()
    },
    [setOpen],
  )

  // 菜单在 body 的 portal 里，用 fixed 定位贴着触发按钮；滚动或窗口变化时重新对齐。
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const trigger = triggerRef.current
      const content = contentRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = content?.offsetWidth ?? 160
      const height = content?.offsetHeight ?? 0
      const left = align === 'end' ? rect.right - width : rect.left
      const below = rect.bottom + 4
      const top = below + height > window.innerHeight - 8 && rect.top - height - 4 > 8 ? rect.top - height - 4 : below
      setPosition({ top, left: clamp(left, 8, Math.max(8, window.innerWidth - width - 8)) })
    }
    place()
    const frame = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return
    if (focusOnOpen.current) {
      focusOnOpen.current = false
      focusItems(contentRef.current, menuId)[0]?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, close, menuId])

  const triggerProps: MenuTriggerProps = {
    ref: (node) => {
      triggerRef.current = node
    },
    id: `${id}trigger`,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    'data-state': open ? 'open' : 'closed',
    onClick: () => {
      focusOnOpen.current = !open
      if (open) close()
      else setOpen(true)
    },
    onKeyDown: (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        focusOnOpen.current = true
        setOpen(true)
      }
    },
  }

  return (
    <MenuContext.Provider value={{ close, menuId, sub, setSub }}>
      {trigger(triggerProps)}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="menu"
                ref={contentRef}
                id={menuId}
                role="menu"
                aria-label={label}
                aria-labelledby={label ? undefined : `${id}trigger`}
                tabIndex={-1}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: reduced ? 0.08 : 0.14, ease: [0.2, 0, 0, 1] }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    close(true)
                  } else if (event.key === 'Tab') close()
                  else handleMenuKeys(event, contentRef.current, menuId)
                }}
                style={{ ...vars, position: 'fixed', top: position?.top ?? -9999, left: position?.left ?? -9999, transformOrigin: align === 'end' ? 'top right' : 'top left' }}
                className={cn(
                  'bg-popover text-popover-foreground z-[1000] min-w-32 rounded-[min(var(--dg-radius),12px)] border p-1 text-sm shadow-lg shadow-black/10 outline-none',
                  className,
                )}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </MenuContext.Provider>
  )
}

export function DropdownMenuItem({ onClick, disabled = false, children }: { onClick?: () => void; disabled?: boolean; children: ReactNode }) {
  const { close, menuId, setSub } = useMenu()
  return (
    <button
      type="button"
      role="menuitem"
      data-menu-item={menuId}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onPointerEnter={() => setSub(null)}
      onClick={() => {
        if (disabled) return
        onClick?.()
        close(true)
      }}
      className={menuItemClassName}
    >
      {children}
    </button>
  )
}

export function DropdownMenuCheckboxItem({ checked, onCheckedChange, children, className }: { checked: boolean; onCheckedChange: (checked: boolean) => void; children: ReactNode; className?: string }) {
  const { menuId } = useMenu()
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      data-menu-item={menuId}
      tabIndex={-1}
      onClick={() => onCheckedChange(!checked)}
      className={cn(menuItemClassName, className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-[background-color,border-color] duration-150 motion-reduce:transition-none',
          checked ? 'border-transparent bg-[var(--dg-accent)] text-[var(--dg-ink)]' : 'border-input bg-background',
        )}
      >
        {checked && icons.check('size-3 opacity-100! [stroke-width:3]')}
      </span>
      <span className="grow truncate">{children}</span>
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div role="separator" className="bg-border -mx-1 my-1 h-px" />
}

export function DropdownMenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-muted-foreground px-2 py-1.5 text-xs font-medium', className)}>{children}</div>
}

export function DropdownMenuSub({ id, label, icon, children }: { id: string; label: ReactNode; icon?: ReactNode; children: ReactNode }) {
  const { menuId, sub, setSub } = useMenu()
  const open = sub === id
  const subMenuId = `${menuId}-${id}`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [side, setSide] = useState<'right' | 'left'>('right')
  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const width = contentRef.current?.offsetWidth ?? 160
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setSide(rect.right + width + 12 > window.innerWidth && rect.left - width - 12 > 0 ? 'left' : 'right')
  }, [open])
  const closeSub = () => {
    setSub(null)
    triggerRef.current?.focus()
  }
  return (
    <div className="relative" onPointerEnter={() => setSub(id)}>
      <button
        ref={triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? subMenuId : undefined}
        data-menu-item={menuId}
        tabIndex={-1}
        onClick={() => setSub(open ? null : id)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.stopPropagation()
            setSub(id)
            requestAnimationFrame(() => focusItems(contentRef.current, subMenuId)[0]?.focus())
          }
        }}
        className={menuItemClassName}
      >
        {icon}
        <span className="grow">{label}</span>
        {icons.chevronRight('size-3.5')}
      </button>
      {open && (
        <div
          ref={contentRef}
          id={subMenuId}
          role="menu"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              closeSub()
            } else if (handleMenuKeys(event, contentRef.current, subMenuId)) event.stopPropagation()
          }}
          className={cn(
            'bg-popover text-popover-foreground absolute -top-[5px] min-w-36 rounded-[min(var(--dg-radius),12px)] border p-1 shadow-lg shadow-black/10',
            side === 'right' ? 'start-full ms-1.5' : 'end-full me-1.5',
          )}
        >
          <MenuContext.Provider value={{ close: closeSub, menuId: subMenuId, sub: null, setSub: () => undefined }}>{children}</MenuContext.Provider>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 列显隐菜单（DataGridColumnVisibility）
 * ---------------------------------------------------------------------------------------------- */

export function DataGridColumnVisibility({ trigger, className }: { trigger: ReactNode; className?: string }) {
  const { table, i18n } = useDataGrid()
  return (
    <DropdownMenu
      open={table.state.openMenu === COLUMNS_MENU}
      onOpenChange={(open) => table.setState((old) => ({ openMenu: open ? COLUMNS_MENU : old.openMenu === COLUMNS_MENU ? null : old.openMenu }))}
      align="end"
      label={i18n.toggleColumns}
      className="min-w-[150px]"
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className={cn(
            'border-input bg-background text-foreground hover:bg-muted/60 aria-expanded:bg-muted/60 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[min(var(--dg-radius),8px)] border px-2.5 text-[0.8125rem] font-medium whitespace-nowrap transition-[background-color] duration-150 [&_svg]:size-3.5',
            focusRing,
            className,
          )}
        >
          {trigger}
        </button>
      )}
    >
      <DropdownMenuLabel>{i18n.toggleColumns}</DropdownMenuLabel>
      {table
        .getAllColumns()
        .filter((column) => column.getCanHide())
        .map((column) => (
          <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(value)}>
            {getColumnHeaderLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 表头（DataGridColumnHeader）
 * ---------------------------------------------------------------------------------------------- */

export interface DataGridColumnHeaderProps<TData> extends HTMLAttributes<HTMLDivElement> {
  column: DataGridColumn<TData>
  /** 省略时用 meta.headerTitle，再退到字符串 header，最后是列 id。 */
  title?: string
  icon?: ReactNode
  filter?: ReactNode
  visibility?: boolean
}

export function DataGridColumnHeader<TData>({ column, title, icon, className, filter, visibility = false }: DataGridColumnHeaderProps<TData>) {
  const { i18n, table, props } = useDataGrid()
  const layout = props.tableLayout
  const resolvedTitle = title ?? getColumnHeaderLabel(column)

  const isSorted = column.getIsSorted()
  const isPinned = column.getIsPinned()
  const canSort = column.getCanSort()
  const canPin = column.getCanPin()
  const canResize = column.getCanResize()

  // 只在可见的非固定列之间移动：和固定列或隐藏列交换位置在界面上看不出变化。
  const center = table.getCenterVisibleLeafColumns()
  const columnIndex = center.findIndex((other) => other.id === column.id)
  const canMoveLeft = columnIndex > 0
  const canMoveRight = columnIndex >= 0 && columnIndex < center.length - 1

  const handleSort = () => {
    if (isSorted === 'asc') column.toggleSorting(true)
    else if (isSorted === 'desc') column.clearSorting()
    else column.toggleSorting(false)
  }

  const headerLabelClassName = cn(
    'text-secondary-foreground/80 inline-flex h-full items-center gap-1.5 font-normal [&_svg]:opacity-60 text-[0.8125rem] leading-[calc(1.125/0.8125)] [&_svg]:size-3.5',
    className,
  )

  const headerButtonClassName = cn(
    'text-secondary-foreground/80 hover:bg-secondary aria-expanded:bg-secondary hover:text-foreground aria-expanded:text-foreground inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-[min(var(--dg-radius),6px)] px-2 text-[0.8125rem] font-normal whitespace-nowrap transition-[color,background-color] duration-150 disabled:opacity-50 [&_svg]:opacity-60',
    focusRing,
    className,
  )

  const sortIcon =
    canSort && (isSorted === 'desc' ? icons.arrowDown('size-3.25') : isSorted === 'asc' ? icons.arrowUp('size-3.25') : icons.chevronsUpDown('mt-px size-3.25'))

  const hasControls = layout.columnsMovable || (layout.columnsVisibility && visibility) || (layout.columnsPinnable && canPin) || filter

  const menuItems: ReactNode[] = []
  let hasPreviousSection = false

  if (filter) {
    menuItems.push(<DropdownMenuLabel key="filter">{filter}</DropdownMenuLabel>)
    hasPreviousSection = true
  }

  if (canSort) {
    if (hasPreviousSection) menuItems.push(<DropdownMenuSeparator key="sep-sort" />)
    menuItems.push(
      <DropdownMenuItem key="sort-asc" onClick={() => (isSorted === 'asc' ? column.clearSorting() : column.toggleSorting(false))}>
        {icons.arrowUp('size-3.5')}
        <span className="grow">{i18n.sortAscending}</span>
        {isSorted === 'asc' && icons.check('text-foreground size-4 opacity-100!')}
      </DropdownMenuItem>,
      <DropdownMenuItem key="sort-desc" onClick={() => (isSorted === 'desc' ? column.clearSorting() : column.toggleSorting(true))}>
        {icons.arrowDown('size-3.5')}
        <span className="grow">{i18n.sortDescending}</span>
        {isSorted === 'desc' && icons.check('text-foreground size-4 opacity-100!')}
      </DropdownMenuItem>,
    )
    hasPreviousSection = true
  }

  if (layout.columnsPinnable && canPin) {
    if (hasPreviousSection) menuItems.push(<DropdownMenuSeparator key="sep-pin" />)
    menuItems.push(
      <DropdownMenuItem key="pin-left" onClick={() => column.pin(isPinned === 'start' ? false : 'start')}>
        {icons.toLeft('size-3.5')}
        <span className="grow">{i18n.pinColumnStart}</span>
        {isPinned === 'start' && icons.check('text-foreground size-4 opacity-100!')}
      </DropdownMenuItem>,
      <DropdownMenuItem key="pin-right" onClick={() => column.pin(isPinned === 'end' ? false : 'end')}>
        {icons.toRight('size-3.5')}
        <span className="grow">{i18n.pinColumnEnd}</span>
        {isPinned === 'end' && icons.check('text-foreground size-4 opacity-100!')}
      </DropdownMenuItem>,
    )
    hasPreviousSection = true
  }

  if (layout.columnsMovable) {
    if (hasPreviousSection) menuItems.push(<DropdownMenuSeparator key="sep-move" />)
    menuItems.push(
      <DropdownMenuItem key="move-left" onClick={() => table.moveColumn(column.id, -1)} disabled={!canMoveLeft || isPinned !== false}>
        {icons.arrowLeft('size-3.5')}
        <span>{i18n.moveColumnStart}</span>
      </DropdownMenuItem>,
      <DropdownMenuItem key="move-right" onClick={() => table.moveColumn(column.id, 1)} disabled={!canMoveRight || isPinned !== false}>
        {icons.arrowRight('size-3.5')}
        <span>{i18n.moveColumnEnd}</span>
      </DropdownMenuItem>,
    )
    hasPreviousSection = true
  }

  if (layout.columnsVisibility && visibility) {
    if (hasPreviousSection) menuItems.push(<DropdownMenuSeparator key="sep-visibility" />)
    menuItems.push(
      <DropdownMenuSub key="visibility" id="visibility" label={i18n.columnsMenu} icon={icons.sliders('size-3.5')}>
        {table
          .getAllColumns()
          .filter((col) => col.getCanHide())
          .map((col) => (
            <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(value) => col.toggleVisibility(value)}>
              {getColumnHeaderLabel(col)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuSub>,
    )
  }

  if (hasControls) {
    return (
      <div className="-ms-2 flex h-full min-w-0 items-center justify-between gap-1.5">
        <DropdownMenu
          open={table.state.openMenu === column.id}
          onOpenChange={(open) => table.setState((old) => ({ openMenu: open ? column.id : old.openMenu === column.id ? null : old.openMenu }))}
          label={resolvedTitle}
          className="w-40"
          trigger={(triggerProps) => (
            <button type="button" {...triggerProps} className={headerButtonClassName}>
              {icon}
              <span className="truncate">{resolvedTitle}</span>
              {sortIcon}
            </button>
          )}
        >
          {menuItems}
        </DropdownMenu>
        {layout.columnsPinnable && canPin && isPinned && (
          <button
            type="button"
            className={cn('hover:bg-secondary -me-1 inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--dg-radius),6px)] transition-[background-color] duration-150', focusRing)}
            onClick={() => column.pin(false)}
            aria-label={i18n.unpinColumn(resolvedTitle)}
            title={i18n.unpinColumn(resolvedTitle)}
          >
            {icons.pinOff('size-3.5 opacity-50')}
          </button>
        )}
      </div>
    )
  }

  if (canSort || (layout.columnsResizable && canResize)) {
    return (
      <div className="-ms-2 flex h-full items-center">
        <button type="button" className={headerButtonClassName} onClick={handleSort}>
          {icon}
          <span className="truncate">{resolvedTitle}</span>
          {sortIcon}
        </button>
      </div>
    )
  }

  return (
    <div className={headerLabelClassName}>
      {icon}
      {resolvedTitle}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 表格本体（DataGridTable）
 * ---------------------------------------------------------------------------------------------- */

const headerCellSpacing = (dense: boolean) => (dense ? 'px-2 h-8' : 'px-3')
const bodyCellSpacing = (dense: boolean) => (dense ? 'px-2 py-1.5' : 'px-3 py-2')
const footerCellSpacing = (dense: boolean) => (dense ? 'px-2 py-1.5' : 'px-3 py-2')

function getPinningStyles<TData>(column: DataGridColumn<TData>, pinShadow: boolean): CSSProperties {
  const isPinned = column.getIsPinned()
  return {
    insetInlineStart: isPinned === 'start' ? `${column.getStart('start')}px` : undefined,
    insetInlineEnd: isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    position: isPinned ? 'sticky' : undefined,
    transform: isPinned ? 'translateZ(0)' : undefined,
    // 阴影画在单元格外，paint containment 会把它裁掉。
    contain: isPinned && !pinShadow ? 'paint' : undefined,
    width: column.getSize(),
    zIndex: isPinned ? 30 : undefined,
    backgroundClip: isPinned ? 'padding-box' : undefined,
  }
}

/** 固定列边缘的阴影：只在有内容滚到它下面时出现。 */
const pinShadowClassNames = {
  start: cn(
    'after:pointer-events-none after:absolute after:inset-y-0 after:start-full after:w-3 after:bg-linear-to-r after:from-black/10 after:to-transparent dark:after:from-black/40',
    'after:opacity-0 after:transition-opacity after:duration-200 motion-reduce:after:transition-none in-data-[scroll-start]:after:opacity-100',
  ),
  end: cn(
    'after:pointer-events-none after:absolute after:inset-y-0 after:end-full after:w-3 after:bg-linear-to-l after:from-black/10 after:to-transparent dark:after:from-black/40',
    'after:opacity-0 after:transition-opacity after:duration-200 motion-reduce:after:transition-none in-data-[scroll-end]:after:opacity-100',
  ),
}

function pinEdge<TData>(column: DataGridColumn<TData>): DataGridPinPosition | undefined {
  const isPinned = column.getIsPinned()
  if (isPinned === 'start' && column.getIsLastColumn('start')) return 'start'
  if (isPinned === 'end' && column.getIsFirstColumn('end')) return 'end'
  return undefined
}

function dragStyle(id: string, shifts: Map<string, number>, dragging: string | undefined, reduced: boolean): CSSProperties | undefined {
  if (!dragging) return undefined
  const shift = shifts.get(id) ?? 0
  if (id === dragging) return { position: 'relative', transform: `translateX(${shift}px)`, opacity: 0.8, zIndex: 1, cursor: 'grabbing' }
  // 只在拖动进行中才过渡：落位那一刻 DOM 换序、位移归零，必须瞬间完成，否则会反向弹一下。
  return { transform: shift ? `translateX(${shift}px)` : undefined, transition: reduced ? undefined : 'transform 200ms ease' }
}

function DataGridTableHeadRowCellResize<TData>({ column, title }: { column: DataGridColumn<TData>; title: string }) {
  const { table, props, i18n } = useDataGrid()
  const layout = props.tableLayout
  const start = useRef<{ x: number; size: number } | null>(null)
  const isPinned = column.getIsPinned()
  const isLastVisibleColumn = column.getIndex() === table.getVisibleLeafColumns().length - 1
  // 固定在右侧的列从左边缘长宽，方向反过来。
  const direction = isPinned === 'end' ? -1 : 1
  const size = column.getSize()

  const stop = () => {
    start.current = null
    table.setState({ columnResizing: null })
  }

  return (
    <span
      data-slot="data-grid-table-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={i18n.resizeColumn(title)}
      aria-valuenow={size}
      aria-valuemin={column.columnDef.minSize ?? DEFAULT_MIN_SIZE}
      aria-valuemax={column.columnDef.maxSize ?? DEFAULT_MAX_SIZE}
      tabIndex={0}
      onDoubleClick={() => column.resetSize()}
      onPointerDown={(event: ReactPointerEvent<HTMLSpanElement>) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        event.currentTarget.setPointerCapture(event.pointerId)
        start.current = { x: event.clientX, size }
        table.setState({ columnResizing: column.id })
      }}
      onPointerMove={(event) => {
        if (!start.current) return
        table.setColumnSize(column.id, start.current.size + (event.clientX - start.current.x) * direction)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 40 : 10
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          table.setColumnSize(column.id, size + (event.key === 'ArrowRight' ? step : -step) * direction)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          column.resetSize()
        }
      }}
      className={cn(
        'absolute top-0 z-10 flex h-full cursor-col-resize touch-none outline-none select-none',
        isPinned === 'end'
          ? cn('start-0 w-5 justify-start', layout.columnsPinnable ? 'before:hidden' : 'before:bg-border before:absolute before:inset-y-0 before:start-0 before:w-px')
          : isLastVisibleColumn
            ? 'end-0 w-5 justify-end before:hidden'
            : isPinned
              ? cn('end-0 w-5 justify-end', layout.columnsPinnable ? 'before:hidden' : 'before:bg-border before:absolute before:inset-y-0 before:end-0 before:w-px')
              : cn('-end-2 w-5 justify-center', layout.cellBorder ? 'before:hidden' : 'before:bg-border before:absolute before:inset-y-0 before:w-px before:-translate-x-px'),
        'focus-visible:before:absolute focus-visible:before:inset-y-0 focus-visible:before:block focus-visible:before:w-0.5 focus-visible:before:bg-[var(--dg-accent)]',
        column.getIsResizing() && 'before:absolute before:inset-y-0 before:block before:w-0.5 before:bg-[var(--dg-accent)] opacity-100',
      )}
    />
  )
}

function DataGridColumnDragHandle<TData>({ column, title }: { column: DataGridColumn<TData>; title: string }) {
  const { table, i18n } = useDataGrid()
  const start = useRef<number | null>(null)
  const isDragging = table.state.columnDragging?.id === column.id
  return (
    <button
      type="button"
      aria-label={i18n.dragToReorder(title)}
      aria-pressed={isDragging}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        start.current = event.clientX
        table.setState({ columnDragging: { id: column.id, dx: 0 }, openMenu: null })
      }}
      onPointerMove={(event) => {
        if (start.current === null) return
        table.setState({ columnDragging: { id: column.id, dx: event.clientX - start.current } })
      }}
      onPointerUp={() => {
        if (start.current === null) return
        start.current = null
        table.commitColumnDrag()
      }}
      onPointerCancel={() => {
        start.current = null
        table.setState({ columnDragging: null })
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          table.moveColumn(column.id, event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
      className={cn(
        '-ms-2 inline-flex size-6 shrink-0 touch-none items-center justify-center rounded-[min(var(--dg-radius),6px)] hover:bg-secondary [&_svg]:opacity-60 hover:[&_svg]:opacity-100',
        isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing',
        focusRing,
      )}
    >
      {icons.grip('size-4')}
    </button>
  )
}

function DataGridTableHeadRowCell<TData>({ column, shifts, dragging }: { column: DataGridColumn<TData>; shifts: Map<string, number>; dragging?: string }) {
  const { props, table, reduced } = useDataGrid()
  const layout = props.tableLayout
  const isPinned = column.getIsPinned()
  const edge = pinEdge(column)
  const isLastVisibleColumn = column.getIndex() === table.getVisibleLeafColumns().length - 1
  const sortDirection = column.getIsSorted()
  const title = getColumnHeaderLabel(column)
  const header = column.columnDef.header
  const content = typeof header === 'function' ? header({ column }) : header
  const canDrag = layout.columnsDraggable && column.getCanOrder() && !isPinned

  return (
    <th
      scope="col"
      aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : column.getCanSort() ? 'none' : undefined}
      data-col-id={column.id}
      data-pinned={isPinned || undefined}
      data-last-col={edge}
      data-dragging={dragging === column.id || undefined}
      style={{
        width: column.getSize(),
        ...(layout.columnsPinnable && column.getCanPin() && getPinningStyles(column, layout.pinShadow)),
        // 粘性表头下，固定单元格自己的 sticky 会让它脱离 thead 的纵向粘性，所以两个方向都钉在单元格上。
        ...(layout.headerSticky && isPinned && { top: 0 }),
        ...dragStyle(column.id, shifts, dragging, reduced),
      }}
      className={cn(
        'text-foreground relative h-10 text-left align-middle font-medium rtl:text-right',
        headerCellSpacing(layout.dense),
        layout.headerBackground && 'bg-muted',
        layout.cellBorder && 'border-e',
        layout.cellBorder && !isPinned && column.getIsLastColumn('center') && 'border-e-0',
        layout.columnsResizable && column.getCanResize() && (isPinned && !layout.pinShadow ? 'overflow-hidden' : 'overflow-visible'),
        layout.columnsResizable && column.getCanResize() && isLastVisibleColumn && 'pe-8',
        layout.columnsPinnable &&
          column.getCanPin() &&
          cn(
            'data-pinned:bg-muted data-pinned:isolate',
            '[&[data-pinned=end][data-last-col=end]]:shadow-[inset_1px_0_0_0_var(--border)] [&[data-pinned=start][data-last-col=start]]:shadow-[inset_-1px_0_0_0_var(--border)]',
            '[&:not([data-pinned]):has(+[data-pinned])_[data-slot=data-grid-table-resize-handle]]:opacity-0 [&[data-last-col=start]_[data-slot=data-grid-table-resize-handle]]:before:hidden',
          ),
        layout.pinShadow && edge && pinShadowClassNames[edge],
        'data-dragging:bg-background',
        column.columnDef.meta?.headerClassName,
      )}
    >
      {canDrag ? (
        <div className="flex items-center justify-start gap-0.5">
          <DataGridColumnDragHandle column={column} title={title} />
          <div className="min-w-0 grow">{content}</div>
        </div>
      ) : (
        content
      )}
      {layout.columnsResizable && column.getCanResize() && <DataGridTableHeadRowCellResize column={column} title={title} />}
    </th>
  )
}

function DataGridTableBodyRowCell<TData>({ column, row, shifts, dragging }: { column: DataGridColumn<TData>; row: DataGridRow<TData>; shifts: Map<string, number>; dragging?: string }) {
  const { props, reduced } = useDataGrid()
  const layout = props.tableLayout
  const isPinned = column.getIsPinned()
  const edge = pinEdge(column)
  const def = column.columnDef
  const content = def.cell ? def.cell({ row, column }) : String((def.accessorFn ? def.accessorFn(row.original) : (row.original as Record<string, unknown>)[def.id]) ?? '')

  return (
    <td
      style={{
        ...(layout.columnsPinnable && column.getCanPin() && getPinningStyles(column, layout.pinShadow)),
        ...(layout.columnsResizable && { width: column.getSize() }),
        ...dragStyle(column.id, shifts, dragging, reduced),
      }}
      data-pinned={isPinned || undefined}
      data-last-col={edge}
      data-dragging={dragging === column.id || undefined}
      className={cn(
        'align-middle',
        bodyCellSpacing(layout.dense),
        layout.cellBorder && 'border-e',
        layout.cellBorder && !isPinned && column.getIsLastColumn('center') && 'border-e-0',
        layout.columnsResizable && column.getCanResize() && 'truncate',
        def.meta?.cellClassName,
        layout.columnsPinnable &&
          column.getCanPin() &&
          cn(
            'data-pinned:bg-background data-pinned:isolate',
            '[&[data-pinned=start][data-last-col=start]]:shadow-[inset_-1px_0_0_0_var(--border)]',
            '[&[data-pinned=end][data-last-col=end]]:shadow-[inset_1px_0_0_0_var(--border)]',
          ),
        layout.pinShadow && edge && pinShadowClassNames[edge],
        'data-dragging:bg-background',
      )}
    >
      {content}
    </td>
  )
}

function DataGridTableFootRowCell<TData>({ column, rows }: { column: DataGridColumn<TData>; rows: TData[] }) {
  const { props } = useDataGrid()
  const layout = props.tableLayout
  const isPinned = column.getIsPinned()
  const edge = pinEdge(column)
  return (
    <td
      style={layout.columnsPinnable && column.getCanPin() ? getPinningStyles(column, layout.pinShadow) : undefined}
      data-pinned={isPinned || undefined}
      data-last-col={edge}
      className={cn(
        'text-secondary-foreground/80 truncate align-middle font-medium',
        footerCellSpacing(layout.dense),
        layout.footerBackground && 'bg-muted/40 dark:bg-background',
        layout.cellBorder && 'border-e',
        layout.cellBorder && !isPinned && column.getIsLastColumn('center') && 'border-e-0',
        layout.columnsPinnable &&
          column.getCanPin() &&
          cn(
            'data-pinned:bg-background data-pinned:isolate',
            '[&[data-pinned=start][data-last-col=start]]:shadow-[inset_-1px_0_0_0_var(--border)]',
            '[&[data-pinned=end][data-last-col=end]]:shadow-[inset_1px_0_0_0_var(--border)]',
          ),
        layout.pinShadow && edge && pinShadowClassNames[edge],
        column.columnDef.meta?.footerClassName,
      )}
    >
      {column.columnDef.footer?.({ rows, column })}
    </td>
  )
}

/** 填充列：列宽总和小于容器时吸收剩余宽度，放在中间列和右侧固定列之间。 */
function FillCell({ as: Tag, className }: { as: 'th' | 'td'; className?: string }) {
  return <Tag aria-hidden="true" data-slot="data-grid-table-fill-cell" className={cn('p-0', className)} />
}

export function DataGridTable({ renderHeader = true }: { renderHeader?: boolean }) {
  const { table, props, i18n } = useDataGrid()
  const layout = props.tableLayout
  const classNames = props.tableClassNames
  const startColumns = table.getStartVisibleLeafColumns()
  const centerColumns = table.getCenterVisibleLeafColumns()
  const endColumns = table.getEndVisibleLeafColumns()
  const leading = [...startColumns, ...centerColumns]
  const visibleColumns = [...leading, ...endColumns]
  const rows = table.getRowModel().rows
  const shifts = getColumnShifts(table)
  const dragging = table.state.columnDragging?.id
  const showFooter = layout.footer && visibleColumns.some((column) => column.columnDef.footer)
  const bodyRowBottomBorderClasses = '[&:not(:last-child)>td]:border-b [tbody:has(+tfoot)_&:last-child>td]:border-b'

  return (
    <table
      data-slot="data-grid-table"
      className={cn(
        'text-foreground caption-bottom border-separate border-spacing-0 text-left align-middle text-sm font-normal rtl:text-right',
        'table-fixed',
        classNames.base,
      )}
      style={{ width: table.getTotalSize(), minWidth: '100%' }}
    >
      <colgroup>
        {leading.map((column) => (
          <col key={column.id} style={{ width: column.getSize() }} />
        ))}
        <col data-slot="data-grid-table-fill-col" />
        {endColumns.map((column) => (
          <col key={column.id} style={{ width: column.getSize() }} />
        ))}
      </colgroup>

      {renderHeader && (
        <thead className={cn(classNames.header, layout.headerSticky && classNames.headerSticky)}>
          <tr
            className={cn(
              layout.headerBorder && '[&>th]:border-b',
              layout.cellBorder && '*:last:border-e-0',
              layout.stripped && 'bg-transparent',
              classNames.headerRow,
            )}
          >
            {leading.map((column) => (
              <DataGridTableHeadRowCell key={column.id} column={column} shifts={shifts} dragging={dragging} />
            ))}
            <FillCell as="th" className={cn(layout.headerBackground && 'bg-muted')} />
            {endColumns.map((column) => (
              <DataGridTableHeadRowCell key={column.id} column={column} shifts={shifts} dragging={dragging} />
            ))}
          </tr>
        </thead>
      )}

      {renderHeader && (layout.stripped || !layout.rowBorder) && <tbody aria-hidden="true" className="h-2" />}

      <tbody data-slot="data-grid-table-body" className={classNames.body}>
        {rows.length ? (
          rows.map((row) => (
            <tr
              key={row.id}
              data-row-id={row.id}
              className={cn(
                'hover:bg-muted/40',
                // 固定单元格必须不透明（挡住滚到下面的内容），所以悬停和斑马纹的底色预先混进背景色。
                'hover:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--muted)_40%,var(--background))]',
                !layout.stripped && layout.rowBorder && bodyRowBottomBorderClasses,
                layout.cellBorder && `*:last:border-e-0 ${bodyRowBottomBorderClasses}`,
                layout.stripped &&
                  'odd:bg-muted/90 odd:hover:bg-muted hover:bg-transparent odd:[&>td[data-pinned]]:bg-[color-mix(in_oklab,var(--muted)_90%,var(--background))] odd:hover:[&>td[data-pinned]]:bg-muted',
                classNames.bodyRow,
              )}
            >
              {leading.map((column) => (
                <DataGridTableBodyRowCell key={column.id} column={column} row={row} shifts={shifts} dragging={dragging} />
              ))}
              <FillCell as="td" />
              {endColumns.map((column) => (
                <DataGridTableBodyRowCell key={column.id} column={column} row={row} shifts={shifts} dragging={dragging} />
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={visibleColumns.length + 1} className="text-muted-foreground py-6 text-center text-sm">
              {i18n.noData}
            </td>
          </tr>
        )}
      </tbody>

      {showFooter && (
        <tfoot data-slot="data-grid-table-foot" className={classNames.footer}>
          <tr className={cn(layout.footerBackground && 'bg-muted/40 dark:bg-background', layout.cellBorder && '*:last:border-e-0', (layout.stripped || !layout.rowBorder) && '[&>td]:border-t')}>
            {leading.map((column) => (
              <DataGridTableFootRowCell key={column.id} column={column} rows={table.options.data} />
            ))}
            <FillCell as="td" className={cn(layout.footerBackground && 'bg-muted/40 dark:bg-background')} />
            {endColumns.map((column) => (
              <DataGridTableFootRowCell key={column.id} column={column} rows={table.options.data} />
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )
}
