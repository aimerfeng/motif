// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/ui/tree.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type Ref,
} from 'react'

/* ------------------------------------------------------------------------------------------------
 * 手写的扁平树模型，替代上游的 @headless-tree/core + @headless-tree/react：
 * 只实现这里用到的部分（展开、选择、漫游焦点、方向键 / Home / End / 类型跳转、F2 重命名、指针拖拽排序）。
 * 对外的形状沿用 headless-tree 的 item.getProps() / tree.getItems() 写法，下面的 Tree 组件因此几乎原样保留。
 * ---------------------------------------------------------------------------------------------- */

export type DropPosition = 'before' | 'after' | 'inside'
export interface DropTarget {
  itemId: string
  position: DropPosition
}
/** Where dropped items end up: a parent folder and an index among its children. */
export interface DropLocation {
  parentId: string
  index: number
}
export interface TreeDragState {
  draggedItems: string[]
  target: DropTarget | null
  /** Pointer position relative to the tree; omitted when a parent forces the preview. */
  pointer?: { x: number; y: number }
}
export interface TreeRenameState {
  itemId: string
  value: string
}

export interface ItemMeta {
  itemId: string
  parentId: string
  level: number
  /** Index among all children of the parent (filtering does not change it). */
  index: number
  setSize: number
  posInSet: number
}

type ItemProps = HTMLAttributes<HTMLDivElement> & { ref: Ref<HTMLDivElement> }

export interface ItemInstance<T> {
  getId(): string
  getItemData(): T
  getItemName(): string
  getItemMeta(): ItemMeta
  getParent(): ItemInstance<T> | undefined
  isFolder(): boolean
  isExpanded(): boolean
  isSelected(): boolean
  isFocused(): boolean
  isMatchingSearch(): boolean
  isDragTarget(): boolean
  isDragging(): boolean
  isRenaming(): boolean
  getProps(): ItemProps
  getRenameInputProps(): InputHTMLAttributes<HTMLInputElement> & { ref: Ref<HTMLInputElement> }
}

export interface TreeInstance<T> {
  getContainerProps(): ItemProps
  getItems(): ItemInstance<T>[]
  expandAll(): void
  collapseAll(): void
  getDragLineStyle(): CSSProperties | null
  getDragPreview(): { itemIds: string[]; x: number; y: number } | null
  getAnnouncement(): string
}

export interface TreeConfig<T> {
  rootItemId: string
  dataLoader: { getItem(itemId: string): T | undefined; getChildren(itemId: string): string[] }
  getItemName(data: T): string
  isItemFolder(data: T): boolean
  indent: number
  label?: string
  expandedItems: string[]
  setExpandedItems(itemIds: string[]): void
  selectedItems: string[]
  setSelectedItems(itemIds: string[]): void
  /** Only these items are listed (filtering); undefined lists everything. */
  visibleItems?: ReadonlySet<string>
  /** Items that match the current search, marked with data-search-match. */
  searchMatches?: ReadonlySet<string>
  canDrag?: boolean
  onDrop?(itemIds: string[], location: DropLocation): void
  canRename?: boolean
  onRename?(itemId: string, name: string): void
  onPrimaryAction?(itemId: string): void
  /** Force a drag preview or an open rename box (used by the demo autoplay). */
  forced?: { drag?: TreeDragState | null; renaming?: TreeRenameState | null }
}

interface Measured {
  line: { top: number; left: number; width: number } | null
  ghost: { x: number; y: number } | null
  width: number
}
const EMPTY: Measured = { line: null, ghost: null, width: 0 }

function sameMeasured(a: Measured, b: Measured) {
  return (
    a.width === b.width &&
    a.line?.top === b.line?.top &&
    a.line?.left === b.line?.left &&
    a.line?.width === b.line?.width &&
    a.ghost?.x === b.ghost?.x &&
    a.ghost?.y === b.ghost?.y
  )
}

/** Controlled when value is defined, otherwise keeps its own state. */
export function useControllableState<V>(value: V | undefined, initial: V, onChange?: (next: V) => void): [V, (next: V) => void] {
  const [inner, setInner] = useState(initial)
  const current = value === undefined ? inner : value
  const set = (next: V) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set]
}

/** Replaces headless-tree's createOnDropHandler: removes the items from their parents and inserts them at the location. */
export function moveItems<T extends { children?: string[] }>(items: Record<string, T>, itemIds: string[], location: DropLocation): Record<string, T> {
  const target = items[location.parentId]
  if (!target) return items
  const before = (target.children ?? []).slice(0, location.index).filter((id) => itemIds.includes(id)).length
  const next: Record<string, T> = { ...items }
  for (const [id, item] of Object.entries(items)) {
    if (item.children?.some((child) => itemIds.includes(child))) next[id] = { ...item, children: item.children.filter((child) => !itemIds.includes(child)) }
  }
  const children = [...(next[location.parentId]?.children ?? [])]
  children.splice(location.index - before, 0, ...itemIds)
  next[location.parentId] = { ...next[location.parentId]!, children }
  return next
}

export function useTree<T>(config: TreeConfig<T>): TreeInstance<T> {
  const { rootItemId, dataLoader, getItemName, isItemFolder, indent, expandedItems, setExpandedItems, selectedItems, setSelectedItems, visibleItems, searchMatches, forced } = config
  const canDrag = config.canDrag ?? false
  const canRename = config.canRename ?? false

  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<TreeRenameState | null>(null)
  const [drag, setDrag] = useState<TreeDragState | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [measured, setMeasured] = useState<Measured>(EMPTY)

  const container = useRef<HTMLDivElement | null>(null)
  const elements = useRef(new Map<string, HTMLDivElement>())
  const pendingFocus = useRef<string | null>(null)
  const renameRef = useRef<TreeRenameState | null>(null)
  const anchor = useRef<string | null>(null)
  const suppressClick = useRef(false)
  const typeahead = useRef({ text: '', time: -Infinity })
  const pointer = useRef<{ id: string; pointerId: number; x: number; y: number; active: boolean; items: string[]; target: DropTarget | null } | null>(null)

  const activeDrag = forced ? (forced.drag ?? null) : drag
  const activeRename = forced ? (forced.renaming ?? null) : renaming
  const expandedSet = new Set(expandedItems)
  const selectedSet = new Set(selectedItems)

  const isFolderId = (id: string) => {
    const data = dataLoader.getItem(id)
    return data !== undefined && isItemFolder(data)
  }
  const nameOf = (id: string) => {
    const data = dataLoader.getItem(id)
    return data === undefined ? id : getItemName(data)
  }

  // 父节点表与可见行：每次渲染重算，条目数量很小。
  const parentOf = new Map<string, string>()
  const allIds: string[] = []
  const walkAll = (id: string) => {
    for (const child of dataLoader.getChildren(id)) {
      if (parentOf.has(child)) continue
      parentOf.set(child, id)
      allIds.push(child)
      walkAll(child)
    }
  }
  walkAll(rootItemId)
  const isDescendant = (id: string, ancestor: string) => {
    for (let parent = parentOf.get(id); parent !== undefined; parent = parentOf.get(parent)) if (parent === ancestor) return true
    return false
  }

  const rows: ItemMeta[] = []
  const walkVisible = (parentId: string, level: number) => {
    const all = dataLoader.getChildren(parentId)
    const shown = visibleItems ? all.filter((id) => visibleItems.has(id)) : all
    shown.forEach((itemId, i) => {
      if (dataLoader.getItem(itemId) === undefined) return
      rows.push({ itemId, parentId, level, index: all.indexOf(itemId), setSize: shown.length, posInSet: i + 1 })
      if (isFolderId(itemId) && expandedSet.has(itemId)) walkVisible(itemId, level + 1)
    })
  }
  walkVisible(rootItemId, 0)
  const rowIndex = new Map(rows.map((row, i) => [row.itemId, i]))

  const tabStop = (focusedItem !== null && rowIndex.has(focusedItem) ? focusedItem : rows.find((row) => selectedSet.has(row.itemId))?.itemId) ?? rows[0]?.itemId

  const focusItem = (id: string) => {
    setFocusedItem(id)
    pendingFocus.current = id
  }
  const toggleExpanded = (id: string) => setExpandedItems(expandedSet.has(id) ? expandedItems.filter((x) => x !== id) : [...expandedItems, id])

  const resolveDrop = (target: DropTarget, dragged: string[]): DropLocation | null => {
    const row = rows[rowIndex.get(target.itemId) ?? -1]
    if (!row) return null
    let location: DropLocation
    if (target.position === 'inside') {
      if (!isFolderId(target.itemId)) return null
      location = { parentId: target.itemId, index: dataLoader.getChildren(target.itemId).length }
    } else if (target.position === 'after' && isFolderId(target.itemId) && expandedSet.has(target.itemId) && rows[rowIndex.get(target.itemId)! + 1]?.parentId === target.itemId) {
      // 展开的文件夹下方：放进它的第一个位置（与 headless-tree 相同）。
      location = { parentId: target.itemId, index: 0 }
    } else {
      if (dragged.includes(target.itemId)) return null
      location = { parentId: row.parentId, index: row.index + (target.position === 'after' ? 1 : 0) }
    }
    if (dragged.some((id) => id === location.parentId || isDescendant(location.parentId, id))) return null
    return location
  }

  const hitTest = (clientY: number, dragged: string[]): DropTarget | null => {
    let found: DropTarget | null = null
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!
      const el = elements.current.get(row.itemId)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const last = i === rows.length - 1
      if (clientY < rect.top && i === 0) {
        found = { itemId: row.itemId, position: 'before' }
        break
      }
      if (clientY <= rect.bottom || last) {
        const rel = (clientY - rect.top) / Math.max(rect.height, 1)
        const position: DropPosition = isFolderId(row.itemId) ? (rel < 0.3 ? 'before' : rel > 0.7 ? 'after' : 'inside') : rel < 0.5 ? 'before' : 'after'
        found = { itemId: row.itemId, position }
        break
      }
    }
    return found && resolveDrop(found, dragged) ? found : null
  }

  const dropAnnouncement = (itemIds: string[], location: DropLocation) => {
    const names = itemIds.map(nameOf).join(', ')
    return location.parentId === rootItemId ? `Moved ${names} to the top level.` : `Moved ${names} into ${nameOf(location.parentId)}.`
  }

  const commitDrop = (itemIds: string[], target: DropTarget | null) => {
    const location = target && resolveDrop(target, itemIds)
    if (!location) {
      setAnnouncement('Move cancelled.')
      return
    }
    config.onDrop?.(itemIds, location)
    setAnnouncement(dropAnnouncement(itemIds, location))
  }

  const cancelDrag = () => {
    if (!pointer.current?.active) return
    pointer.current = null
    suppressClick.current = true
    setDrag(null)
    setAnnouncement('Move cancelled.')
  }

  const startRenaming = (id: string) => {
    if (!canRename) return
    const next = { itemId: id, value: nameOf(id) }
    renameRef.current = next
    setRenaming(next)
  }
  const finishRenaming = (commit: boolean) => {
    const current = renameRef.current
    if (!current) return
    renameRef.current = null
    setRenaming(null)
    const name = current.value.trim()
    if (commit && name && name !== nameOf(current.itemId)) config.onRename?.(current.itemId, name)
    focusItem(current.itemId)
  }

  const selectRange = (to: string, additive: boolean) => {
    const from = rowIndex.get(anchor.current ?? focusedItem ?? to) ?? rowIndex.get(to)!
    const end = rowIndex.get(to)!
    const range = rows.slice(Math.min(from, end), Math.max(from, end) + 1).map((row) => row.itemId)
    setSelectedItems(additive ? [...new Set([...selectedItems, ...range])] : range)
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>, id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (activeRename?.itemId === id) return
    const additive = event.ctrlKey || event.metaKey
    if (event.shiftKey) {
      selectRange(id, additive)
    } else if (additive) {
      setSelectedItems(selectedSet.has(id) ? selectedItems.filter((x) => x !== id) : [...selectedItems, id])
      anchor.current = id
    } else {
      setSelectedItems([id])
      anchor.current = id
      if (isFolderId(id)) toggleExpanded(id)
      config.onPrimaryAction?.(id)
    }
    setFocusedItem(id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || rows.length === 0) return
    const current = rowIndex.get(tabStop ?? '') ?? 0
    const row = rows[current]!
    const id = row.itemId
    const mod = event.ctrlKey || event.metaKey
    const moveTo = (index: number) => {
      const next = rows[Math.max(0, Math.min(rows.length - 1, index))]!
      if (event.shiftKey) setSelectedItems([...new Set([...selectedItems, id, next.itemId])])
      focusItem(next.itemId)
    }
    const reorder = (delta: -1 | 1) => {
      const siblings = dataLoader.getChildren(row.parentId)
      const index = row.index + delta
      if (index < 0 || index >= siblings.length) return
      const location = { parentId: row.parentId, index: delta < 0 ? index : index + 1 }
      config.onDrop?.([id], location)
      setAnnouncement(`Moved ${nameOf(id)} ${delta < 0 ? 'up' : 'down'}.`)
      pendingFocus.current = id
    }
    let handled = true
    switch (event.key) {
      case 'ArrowDown':
        if (event.altKey && canDrag) reorder(1)
        else moveTo(current + 1)
        break
      case 'ArrowUp':
        if (event.altKey && canDrag) reorder(-1)
        else moveTo(current - 1)
        break
      case 'Home':
        moveTo(0)
        break
      case 'End':
        moveTo(rows.length - 1)
        break
      case 'ArrowRight':
        if (isFolderId(id)) {
          if (!expandedSet.has(id)) toggleExpanded(id)
          else if (rows[current + 1]?.parentId === id) focusItem(rows[current + 1]!.itemId)
        }
        break
      case 'ArrowLeft':
        if (isFolderId(id) && expandedSet.has(id)) toggleExpanded(id)
        else if (row.parentId !== rootItemId) focusItem(row.parentId)
        break
      case 'Enter':
        setSelectedItems([id])
        anchor.current = id
        if (isFolderId(id)) toggleExpanded(id)
        config.onPrimaryAction?.(id)
        break
      case ' ':
        setSelectedItems(selectedSet.has(id) ? selectedItems.filter((x) => x !== id) : [...selectedItems, id])
        anchor.current = id
        break
      case 'F2':
        if (canRename) startRenaming(id)
        else handled = false
        break
      case 'Escape':
        if (pointer.current?.active) cancelDrag()
        else handled = false
        break
      default:
        if (mod && event.key.toLowerCase() === 'a') {
          setSelectedItems(rows.map((r) => r.itemId))
        } else if (event.key.length === 1 && !mod && !event.altKey && event.key.trim()) {
          // 类型跳转：600 ms 内连续输入的字符拼成前缀。
          const fresh = event.timeStamp - typeahead.current.time > 600
          const text = (fresh ? '' : typeahead.current.text) + event.key.toLowerCase()
          typeahead.current = { text, time: event.timeStamp }
          const start = text.length === 1 ? current + 1 : current
          for (let step = 0; step < rows.length; step++) {
            const candidate = rows[(start + step) % rows.length]!
            if (nameOf(candidate.itemId).toLowerCase().startsWith(text)) {
              focusItem(candidate.itemId)
              break
            }
          }
        } else {
          handled = false
        }
    }
    if (handled) event.preventDefault()
  }

  const pointerHandlers = (id: string): Partial<ItemProps> => ({
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      suppressClick.current = false
      if (!canDrag || event.button !== 0 || activeRename?.itemId === id) return
      pointer.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, active: false, items: [], target: null }
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const state = pointer.current
      const box = container.current?.getBoundingClientRect()
      if (!state || state.pointerId !== event.pointerId || !box) return
      if (!state.active) {
        if (Math.hypot(event.clientX - state.x, event.clientY - state.y) < 5) return
        state.active = true
        // 拖动已选中的条目时整组一起移动（去掉已被父级包含的）；否则只拖这一个并选中它。
        const group = selectedSet.has(state.id) ? rows.map((row) => row.itemId).filter((x) => selectedSet.has(x)) : [state.id]
        state.items = group.filter((x) => !group.some((other) => other !== x && isDescendant(x, other)))
        if (!selectedSet.has(state.id)) setSelectedItems([state.id])
        event.currentTarget.setPointerCapture(event.pointerId)
        setAnnouncement(`Dragging ${state.items.map(nameOf).join(', ')}. Release to drop, Escape to cancel.`)
      }
      state.target = hitTest(event.clientY, state.items)
      setDrag({ draggedItems: state.items, target: state.target, pointer: { x: event.clientX - box.left, y: event.clientY - box.top } })
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      const state = pointer.current
      if (!state || state.pointerId !== event.pointerId) return
      pointer.current = null
      if (!state.active) return
      suppressClick.current = true
      setDrag(null)
      commitDrop(state.items, state.target)
    },
    onPointerCancel: () => {
      if (pointer.current?.active) setDrag(null)
      pointer.current = null
    },
  })

  // 键盘移动焦点后把 DOM 焦点跟过去。
  useLayoutEffect(() => {
    const focusId = pendingFocus.current
    if (focusId === null) return
    pendingFocus.current = null
    elements.current.get(focusId)?.focus()
  })

  // 拖动时量出放置线和预览的位置：读的是这一帧的 DOM，函数放进 ref，依赖只写决定位置的那几项。
  const measure = useRef<() => Measured>(() => EMPTY)
  measure.current = () => {
    const box = container.current?.getBoundingClientRect()
    if (!box || !activeDrag) return EMPTY
    const next: Measured = { ...EMPTY, width: Math.round(box.width) }
    const target = activeDrag.target
    const el = target ? elements.current.get(target.itemId) : undefined
    const row = target ? rows[rowIndex.get(target.itemId) ?? -1] : undefined
    const location = target && resolveDrop(target, activeDrag.draggedItems)
    if (!target || !el || !row || !location) return next
    const rect = el.getBoundingClientRect()
    if (target.position === 'inside') {
      next.ghost = { x: (row.level + 1) * indent + 40, y: Math.round(rect.top - box.top + rect.height / 2) }
    } else {
      const top = Math.round((target.position === 'before' ? rect.top : rect.bottom) - box.top)
      const level = location.parentId === target.itemId ? row.level + 1 : row.level
      next.line = { top, left: level * indent, width: Math.round(box.width) - level * indent }
      next.ghost = { x: level * indent + 40, y: top }
    }
    return next
  }
  const dragKey = activeDrag ? `${activeDrag.draggedItems.join(',')}>${activeDrag.target?.itemId ?? ''}:${activeDrag.target?.position ?? ''}` : ''
  const rowsKey = rows.map((row) => `${row.itemId}:${row.level}`).join('|')
  useLayoutEffect(() => {
    const next = measure.current()
    setMeasured((prev) => (sameMeasured(prev, next) ? prev : next))
  }, [dragKey, rowsKey, indent])

  const instanceFor = (meta: ItemMeta): ItemInstance<T> => {
    const id = meta.itemId
    return {
      getId: () => id,
      getItemData: () => dataLoader.getItem(id)!,
      getItemName: () => nameOf(id),
      getItemMeta: () => meta,
      getParent: () => {
        const parent = rows[rowIndex.get(meta.parentId) ?? -1]
        return parent ? instanceFor(parent) : undefined
      },
      isFolder: () => isFolderId(id),
      isExpanded: () => expandedSet.has(id),
      isSelected: () => selectedSet.has(id),
      isFocused: () => focusedItem === id,
      isMatchingSearch: () => searchMatches?.has(id) ?? false,
      isDragTarget: () => activeDrag?.target?.itemId === id && activeDrag.target.position === 'inside',
      isDragging: () => activeDrag?.draggedItems.includes(id) ?? false,
      isRenaming: () => activeRename?.itemId === id,
      getProps: () => ({
        ref: (el: HTMLDivElement | null) => {
          if (el) elements.current.set(id, el)
          else elements.current.delete(id)
        },
        role: 'treeitem',
        'aria-level': meta.level + 1,
        'aria-posinset': meta.posInSet,
        'aria-setsize': meta.setSize,
        'aria-selected': selectedSet.has(id),
        tabIndex: id === tabStop ? 0 : -1,
        onFocus: (event) => {
          if (event.target === event.currentTarget && focusedItem !== id) setFocusedItem(id)
        },
        onClick: (event) => handleClick(event, id),
        ...pointerHandlers(id),
      }),
      getRenameInputProps: () => ({
        ref: (el: HTMLInputElement | null) => {
          // 只在第一次挂载时聚焦并全选；之后每次输入都会重新调用 ref。
          if (el && !forced && el !== document.activeElement) {
            el.focus()
            el.select()
          }
        },
        'aria-label': `Rename ${nameOf(id)}`,
        value: activeRename?.itemId === id ? activeRename.value : nameOf(id),
        onChange: (event) => {
          if (!renameRef.current) return
          renameRef.current = { itemId: id, value: event.target.value }
          setRenaming(renameRef.current)
        },
        onBlur: () => finishRenaming(true),
        onKeyDown: (event) => {
          event.stopPropagation()
          if (event.key === 'Enter') finishRenaming(true)
          else if (event.key === 'Escape') finishRenaming(false)
        },
        onPointerDown: (event) => event.stopPropagation(),
        onClick: (event) => event.stopPropagation(),
      }),
    }
  }

  const allFolders = () => allIds.filter(isFolderId)

  return {
    getContainerProps: () => ({
      ref: container,
      role: 'tree',
      'aria-label': config.label,
      'aria-multiselectable': true,
      onKeyDown: handleKeyDown,
    }),
    getItems: () => rows.map(instanceFor),
    expandAll: () => setExpandedItems(allFolders()),
    collapseAll: () => setExpandedItems([]),
    getDragLineStyle: () => (activeDrag && measured.line ? { top: measured.line.top, left: measured.line.left, width: measured.line.width, pointerEvents: 'none' } : null),
    getDragPreview: () => {
      if (!activeDrag) return null
      const at = activeDrag.pointer ?? measured.ghost
      if (!at) return null
      const maxX = Math.max(0, measured.width - 150)
      return { itemIds: activeDrag.draggedItems, x: Math.min(at.x + 12, maxX), y: at.y + 10 }
    },
    getAnnouncement: () => announcement,
  }
}

/* ------------------------------------------------------------------------------------------------
 * 以下是上游 ui/tree.tsx 的组件，类名保持原样。
 * ---------------------------------------------------------------------------------------------- */

interface TreeContextValue<T = unknown> {
  indent: number
  currentItem?: ItemInstance<T>
  tree?: TreeInstance<T>
}

const TreeContext = createContext<TreeContextValue>({
  currentItem: undefined,
  indent: 20,
  tree: undefined,
})

function useTreeContext<T = unknown>() {
  return useContext(TreeContext) as TreeContextValue<T>
}

interface TreeProps<T> extends HTMLAttributes<HTMLDivElement> {
  indent?: number
  tree?: TreeInstance<T>
}

function Tree<T>({ indent = 20, tree, className, ...props }: TreeProps<T>) {
  const containerProps = tree ? tree.getContainerProps() : {}
  const mergedProps = { ...props, ...containerProps }

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps

  // Merge styles
  const mergedStyle = cssVars({ '--tree-indent': `${indent}px` }, propStyle)

  return (
    <TreeContext.Provider value={{ indent, tree: tree as TreeInstance<unknown> | undefined }}>
      <div className={cn('flex flex-col', className)} data-slot="tree" style={mergedStyle} {...otherProps} />
    </TreeContext.Provider>
  )
}

interface TreeItemProps<T> extends HTMLAttributes<HTMLDivElement> {
  item: ItemInstance<T>
}

/** Upstream renders a <button>; a div with role="treeitem" keeps the F2 rename input valid HTML. */
function TreeItem<T>({ item, className, children, ...props }: TreeItemProps<T>) {
  const { indent } = useTreeContext<T>()

  const itemProps = item.getProps()
  const mergedProps = { ...props, ...itemProps }

  // Extract style from mergedProps to merge with our custom styles
  const { style: propStyle, ...otherProps } = mergedProps

  // Merge styles
  const mergedStyle = cssVars({ '--tree-padding': `${item.getItemMeta().level * indent}px` }, propStyle)

  return (
    <TreeContext.Provider value={{ currentItem: item as ItemInstance<unknown>, indent }}>
      <div
        aria-expanded={item.isFolder() ? item.isExpanded() : undefined}
        className={cn(
          'z-10 select-none ps-(--tree-padding) not-last:pb-0.5 outline-hidden focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        data-drag-target={item.isDragTarget()}
        data-dragging={item.isDragging()}
        data-focus={item.isFocused()}
        data-folder={item.isFolder()}
        data-search-match={item.isMatchingSearch()}
        data-selected={item.isSelected()}
        data-slot="tree-item"
        style={mergedStyle}
        {...otherProps}
      >
        {children}
      </div>
    </TreeContext.Provider>
  )
}

interface TreeItemLabelProps<T> extends HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function TreeItemLabel<T>({ item: propItem, children, className, ...props }: TreeItemLabelProps<T>) {
  const { currentItem } = useTreeContext<T>()
  const item = propItem || currentItem

  if (!item) return null

  return (
    <span
      className={cn(
        'flex items-center gap-1 rounded-sm bg-background in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-(--tree-accent)/20! in-data-[selected=true]:bg-accent px-2 py-1.5 not-in-data-[folder=true]:ps-7 in-data-[selected=true]:text-accent-foreground text-sm in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 transition-colors hover:bg-accent in-data-[dragging=true]:*:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      data-slot="tree-item-label"
      {...props}
    >
      {item.isFolder() && <ChevronDownIcon className="size-4 in-aria-[expanded=false]:-rotate-90 text-muted-foreground" />}
      {children || item.getItemName()}
    </span>
  )
}

function TreeDragLine({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { tree } = useTreeContext()
  const dragLine = tree?.getDragLineStyle()
  if (!dragLine) return null

  return (
    <div
      className={cn(
        'absolute z-30 -mt-px h-0.5 w-[unset] bg-primary before:absolute before:-top-[3px] before:left-0 before:size-2 before:rounded-full before:border-2 before:border-primary before:bg-background',
        className,
      )}
      style={dragLine}
      {...props}
    />
  )
}

export { Tree, TreeItem, TreeItemLabel, TreeDragLine }
