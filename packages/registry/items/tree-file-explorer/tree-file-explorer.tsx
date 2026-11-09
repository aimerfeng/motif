// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-575.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import {
  moveItems,
  Tree,
  TreeDragLine,
  TreeItem,
  TreeItemLabel,
  useControllableState,
  useTree,
  type DropLocation,
  type TreeDragState,
  type TreeRenameState,
} from './tree'

/* @motif:defaults */
export const defaults = {
  indent: 20,
  density: 'compact',
  caretSide: 'start',
  guides: true,
  iconStyle: 'filetype',
  accent: '#60a5fa',
  dragReorder: true,
  rename: true,
  showFilter: true,
}
/* @motif:end */

export interface FileTreeItem {
  name: string
  children?: string[]
  fileExtension?: string
}

export const sampleItems: Record<string, FileTreeItem> = {
  app: {
    children: ['app/layout.tsx', 'app/page.tsx', 'app/(dashboard)', 'app/api'],
    name: 'app',
  },
  'app/(dashboard)': {
    children: ['app/(dashboard)/dashboard'],
    name: '(dashboard)',
  },
  'app/(dashboard)/dashboard': {
    children: ['app/(dashboard)/dashboard/page.tsx'],
    name: 'dashboard',
  },
  'app/(dashboard)/dashboard/page.tsx': {
    fileExtension: 'tsx',
    name: 'page.tsx',
  },
  'app/api': { children: ['app/api/hello'], name: 'api' },
  'app/api/hello': { children: ['app/api/hello/route.ts'], name: 'hello' },
  'app/api/hello/route.ts': { fileExtension: 'ts', name: 'route.ts' },
  'app/layout.tsx': { fileExtension: 'tsx', name: 'layout.tsx' },
  'app/page.tsx': { fileExtension: 'tsx', name: 'page.tsx' },
  components: {
    children: ['components/button.tsx', 'components/card.tsx'],
    name: 'components',
  },
  'components/button.tsx': { fileExtension: 'tsx', name: 'button.tsx' },
  'components/card.tsx': { fileExtension: 'tsx', name: 'card.tsx' },
  lib: { children: ['lib/utils.ts'], name: 'lib' },
  'lib/utils.ts': { fileExtension: 'ts', name: 'utils.ts' },
  'site.config.mjs': { fileExtension: 'mjs', name: 'site.config.mjs' },
  'package.json': { fileExtension: 'json', name: 'package.json' },
  public: {
    children: ['public/favicon.ico', 'public/logo.svg'],
    name: 'public',
  },
  'public/favicon.ico': { fileExtension: 'ico', name: 'favicon.ico' },
  'public/logo.svg': { fileExtension: 'svg', name: 'logo.svg' },
  'README.md': { fileExtension: 'md', name: 'README.md' },
  root: {
    children: ['app', 'components', 'lib', 'public', 'package.json', 'theme.config.ts', 'tsconfig.json', 'site.config.mjs', 'README.md'],
    name: 'Project Root',
  },
  'theme.config.ts': { fileExtension: 'ts', name: 'theme.config.ts' },
  'tsconfig.json': { fileExtension: 'json', name: 'tsconfig.json' },
}

export const sampleExpandedItems = ['app', 'app/(dashboard)', 'app/(dashboard)/dashboard']
const sampleSelectedItems = ['components']

export type FileTreeProps = Partial<typeof defaults> & {
  /** Flat item map keyed by id; folders have a children array. Controlled together with onItemsChange. */
  items?: Record<string, FileTreeItem>
  defaultItems?: Record<string, FileTreeItem>
  onItemsChange?: (items: Record<string, FileTreeItem>) => void
  rootItemId?: string
  expandedItems?: string[]
  defaultExpandedItems?: string[]
  onExpandedItemsChange?: (itemIds: string[]) => void
  selectedItems?: string[]
  defaultSelectedItems?: string[]
  onSelectedItemsChange?: (itemIds: string[]) => void
  /** Controlled filter text. */
  filter?: string
  onFilterChange?: (value: string) => void
  /** Click or Enter on an item. */
  onPrimaryAction?: (itemId: string, item: FileTreeItem) => void
  /** Accessible name of the tree. */
  label?: string
  /** Force a drag preview or an open rename box (used by the demo autoplay). */
  forced?: { drag?: TreeDragState | null; renaming?: TreeRenameState | null }
  className?: string
  style?: CSSProperties
}

/* ---- Inline icons (replace lucide-react and @remixicon/react) ---- */

function Icon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

const FolderIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v6.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Z" />
  </Icon>
)
const FolderOpenIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M4.5 19A1.5 1.5 0 0 1 3 17.5v-10A2.5 2.5 0 0 1 5.5 5H9l2 2.5h6a2 2 0 0 1 2 2V11" />
    <path d="M4.5 19 7 12.2a1.8 1.8 0 0 1 1.7-1.2H21l-2.6 6.8a1.8 1.8 0 0 1-1.7 1.2Z" />
  </Icon>
)
const FileIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
  </Icon>
)

// Helper function to get icon based on file extension
function getFileIcon(extension: string | undefined, className: string) {
  switch (extension) {
    case 'tsx':
    case 'jsx':
      // 组件文件：四个小菱形（不用真实框架的标志）。
      return (
        <Icon className={className}>
          <path d="m12 3 3 3-3 3-3-3Z" />
          <path d="m6 9 3 3-3 3-3-3Z" />
          <path d="m18 9 3 3-3 3-3-3Z" />
          <path d="m12 15 3 3-3 3-3-3Z" />
        </Icon>
      )
    case 'ts':
    case 'js':
    case 'mjs':
      return (
        <Icon className={className}>
          <path d="m8 8-4 4 4 4" />
          <path d="m16 8 4 4-4 4" />
          <path d="m13.5 5-3 14" />
        </Icon>
      )
    case 'json':
      return (
        <Icon className={className}>
          <path d="M8 4H7a2 2 0 0 0-2 2v3.5A2.5 2.5 0 0 1 2.5 12 2.5 2.5 0 0 1 5 14.5V18a2 2 0 0 0 2 2h1" />
          <path d="M16 4h1a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0-2.5 2.5V18a2 2 0 0 1-2 2h-1" />
        </Icon>
      )
    case 'svg':
    case 'ico':
    case 'png':
    case 'jpg':
      return (
        <Icon className={className}>
          <rect height="16" rx="2.5" width="18" x="3" y="4" />
          <circle cx="9" cy="9.5" r="1.5" />
          <path d="m21 15-4.5-4.5L7 20" />
        </Icon>
      )
    case 'md':
      return (
        <Icon className={className}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </Icon>
      )
    default:
      return <FileIcon className={className} />
  }
}

function extensionOf(item: FileTreeItem) {
  if (item.fileExtension) return item.fileExtension
  const dot = item.name.lastIndexOf('.')
  return dot > 0 ? item.name.slice(dot + 1).toLowerCase() : undefined
}

const isFolderItem = (item: FileTreeItem) => item.children !== undefined

/* ---- Origin UI Input / Button classes (ui/input.tsx, ui/button.tsx) ---- */

const inputClass =
  'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
const searchClass =
  '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
const iconButtonClass =
  'inline-flex size-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background font-medium text-sm shadow-xs outline-none transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export function FileTree({
  items: itemsProp,
  defaultItems = sampleItems,
  onItemsChange,
  rootItemId = 'root',
  expandedItems: expandedProp,
  defaultExpandedItems = sampleExpandedItems,
  onExpandedItemsChange,
  selectedItems: selectedProp,
  defaultSelectedItems = sampleSelectedItems,
  onSelectedItemsChange,
  filter,
  onFilterChange,
  onPrimaryAction,
  label = 'Files',
  forced,
  className,
  style,
  ...props
}: FileTreeProps) {
  const options = { ...defaults, ...props }
  const { indent, guides, caretSide, iconStyle, density, dragReorder, rename, showFilter, accent } = options
  const compact = density === 'compact'
  const caretEnd = caretSide === 'end'

  const [items, setItems] = useControllableState(itemsProp, defaultItems, onItemsChange)
  const [expandedItems, setExpandedItems] = useControllableState(expandedProp, defaultExpandedItems, onExpandedItemsChange)
  const [selectedItems, setSelectedItems] = useControllableState(selectedProp, defaultSelectedItems, onSelectedItemsChange)
  const [searchValue, setSearchValue] = useControllableState(filter, '', onFilterChange)
  // Store the expanded items to restore when search is cleared
  const expandedBeforeSearch = useRef<string[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtering (comp-572): direct matches, their parents, and everything inside matching folders.
  let filteredItems: Set<string> | undefined
  let directMatches: Set<string> | undefined
  if (searchValue) {
    const query = searchValue.toLowerCase()
    const parentOf = new Map<string, string>()
    const all: string[] = []
    const walk = (id: string) => {
      for (const child of items[id]?.children ?? []) {
        if (parentOf.has(child)) continue
        parentOf.set(child, id)
        all.push(child)
        walk(child)
      }
    }
    walk(rootItemId)
    directMatches = new Set(all.filter((id) => items[id]?.name.toLowerCase().includes(query)))
    filteredItems = new Set(directMatches)
    for (const matchId of directMatches) {
      for (let parent = parentOf.get(matchId); parent !== undefined && parent !== rootItemId; parent = parentOf.get(parent)) filteredItems.add(parent)
      const addDescendants = (itemId: string) => {
        for (const childId of items[itemId]?.children ?? []) {
          filteredItems!.add(childId)
          addDescendants(childId)
        }
      }
      addDescendants(matchId)
    }
  }

  const tree = useTree<FileTreeItem>({
    rootItemId,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    getItemName: (item) => item.name,
    isItemFolder: isFolderItem,
    indent,
    label,
    expandedItems,
    setExpandedItems,
    selectedItems,
    setSelectedItems,
    visibleItems: filteredItems,
    searchMatches: directMatches,
    canDrag: dragReorder,
    onDrop: (itemIds: string[], location: DropLocation) => setItems(moveItems(items, itemIds, location)),
    canRename: rename,
    onRename: (itemId, name) => {
      const item = items[itemId]!
      setItems({ ...items, [itemId]: { ...item, name, fileExtension: isFolderItem(item) ? item.fileExtension : extensionOf({ name }) } })
    },
    onPrimaryAction: (itemId) => onPrimaryAction?.(itemId, items[itemId]!),
    forced,
  })

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (value.length > 0) {
      // If input has at least one character, expand all items
      if (expandedBeforeSearch.current === null) expandedBeforeSearch.current = expandedItems
      tree.expandAll()
    } else {
      // If input is cleared, reset to the expanded state from before the search
      setExpandedItems(expandedBeforeSearch.current ?? defaultExpandedItems)
      expandedBeforeSearch.current = null
    }
  }

  // Handle clearing the search
  const handleClearSearch = () => {
    handleSearchChange('')
    inputRef.current?.focus()
  }

  const iconClass = 'text-muted-foreground pointer-events-none size-4'
  const iconFor = (item: FileTreeItem, expanded: boolean) => {
    if (iconStyle === 'none') return null
    if (isFolderItem(item)) {
      if (iconStyle !== 'folders') return null
      return expanded ? <FolderOpenIcon className={iconClass} /> : <FolderIcon className={iconClass} />
    }
    return iconStyle === 'folders' ? <FileIcon className={iconClass} /> : getFileIcon(extensionOf(item), iconClass)
  }

  const rows = tree.getItems()
  const preview = tree.getDragPreview()
  const previewItem = preview ? items[preview.itemIds[0] ?? ''] : undefined

  return (
    <div className={cn('flex h-full min-w-0 flex-col gap-2', showFilter ? '*:nth-2:grow' : '*:first:grow', className)} style={cssVars({ '--tree-accent': accent }, style)}>
      {showFilter && (
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              aria-label="Filter items"
              className={cn(inputClass, searchClass, 'peer ps-9', searchValue && 'pe-9')}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchValue) {
                  e.preventDefault()
                  handleClearSearch()
                }
              }}
              placeholder="Filter items..."
              ref={inputRef}
              type="search"
              value={searchValue}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Icon className="size-4">
                <path d="M3.5 5h17l-6.5 7.5V19l-4 2v-8.5Z" />
              </Icon>
            </div>
            {searchValue && (
              <button
                aria-label="Clear search"
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleClearSearch}
                type="button"
              >
                <Icon className="size-4">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </Icon>
              </button>
            )}
          </div>
          <button aria-label="Expand all" className={iconButtonClass} onClick={() => tree.expandAll()} title="Expand all" type="button">
            <Icon className="size-4 opacity-60">
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </Icon>
          </button>
          <button aria-label="Collapse all" className={iconButtonClass} onClick={() => tree.collapseAll()} title="Collapse all" type="button">
            <Icon className="size-4 opacity-60">
              <path d="m7 20 5-5 5 5" />
              <path d="m7 4 5 5 5-5" />
            </Icon>
          </button>
        </div>
      )}

      <div>
        <Tree
          className={cn(
            'relative',
            guides &&
              'before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]',
          )}
          indent={indent}
          tree={tree}
        >
          {searchValue && rows.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm">No items found for &quot;{searchValue}&quot;</p>
          ) : (
            rows.map((item) => {
              const data = item.getItemData()
              return (
                <TreeItem className={cn(compact && 'pb-0!')} item={item} key={item.getId()}>
                  <TreeItemLabel
                    className={cn(
                      guides && 'relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background',
                      guides && compact && 'before:inset-y-0',
                      compact && 'rounded-none py-1',
                      caretEnd && 'not-in-data-[folder=true]:ps-2',
                    )}
                  >
                    <span className={cn('flex min-w-0 items-center gap-2', caretEnd && '-order-1 flex-1')}>
                      {iconFor(data, item.isExpanded())}
                      {item.isRenaming() ? (
                        <input {...item.getRenameInputProps()} className={cn(inputClass, '-my-0.5 h-6 px-1')} />
                      ) : (
                        <span className="truncate">{item.getItemName()}</span>
                      )}
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              )
            })
          )}
          <TreeDragLine className="bg-(--tree-accent) before:border-(--tree-accent)" />
          {preview && previewItem && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-40 flex items-center gap-1.5 rounded-md border bg-popover px-2 py-1 text-popover-foreground text-xs shadow-black/20 shadow-lg"
              style={{ transform: `translate(${preview.x}px, ${preview.y}px)` }}
            >
              {iconFor(previewItem, false) ?? (isFolderItem(previewItem) ? <FolderIcon className={iconClass} /> : <FileIcon className={iconClass} />)}
              <span className="max-w-32 truncate font-medium">{previewItem.name}</span>
              {preview.itemIds.length > 1 && <span className="rounded bg-muted px-1 text-muted-foreground tabular-nums">+{preview.itemIds.length - 1}</span>}
            </div>
          )}
        </Tree>
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        {tree.getAnnouncement()}
      </p>
    </div>
  )
}
