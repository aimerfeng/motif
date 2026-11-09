// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/autocomplete/demos/grid/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  columns: 5,
  cellSize: 48,
  accent: '#262626',
  radius: 0,
  showCategories: false,
  recentRow: false,
  spring: {
    visualDuration: 0.15,
    bounce: 0,
  },
}
/* @motif:end */

export interface EmojiItem {
  emoji: string
  value: string
  name: string
}

export interface EmojiGroup {
  value: string
  label: string
  items: EmojiItem[]
}

export type EmojiPickerGridProps = Partial<typeof defaults> & {
  /** 消息输入框的值（受控）。 */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** 常用表情（recentRow 开启时显示在最前，取前 columns 个）。 */
  recent?: string[]
  /** 受控展开（演示自动播放用）。 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** 强制高亮的表情（演示自动播放用）。 */
  highlighted?: string | null
  /** 强制搜索词（演示自动播放用）。 */
  query?: string
  className?: string
  style?: CSSProperties
}

export const emojiCategories = [
  {
    label: 'Smileys & Emotion',
    emojis: [
      { emoji: '😀', name: 'grinning face' },
      { emoji: '😃', name: 'grinning face with big eyes' },
      { emoji: '😄', name: 'grinning face with smiling eyes' },
      { emoji: '😁', name: 'beaming face with smiling eyes' },
      { emoji: '😆', name: 'grinning squinting face' },
      { emoji: '😅', name: 'grinning face with sweat' },
      { emoji: '🤣', name: 'rolling on the floor laughing' },
      { emoji: '😂', name: 'face with tears of joy' },
      { emoji: '🙂', name: 'slightly smiling face' },
      { emoji: '🙃', name: 'upside-down face' },
      { emoji: '😉', name: 'winking face' },
      { emoji: '😊', name: 'smiling face with smiling eyes' },
      { emoji: '😇', name: 'smiling face with halo' },
      { emoji: '🥰', name: 'smiling face with hearts' },
      { emoji: '😍', name: 'smiling face with heart-eyes' },
      { emoji: '🤩', name: 'star-struck' },
      { emoji: '😘', name: 'face blowing a kiss' },
      { emoji: '😗', name: 'kissing face' },
      { emoji: '☺️', name: 'smiling face' },
      { emoji: '😚', name: 'kissing face with closed eyes' },
      { emoji: '😙', name: 'kissing face with smiling eyes' },
      { emoji: '🥲', name: 'smiling face with tear' },
      { emoji: '😋', name: 'face savoring food' },
      { emoji: '😛', name: 'face with tongue' },
      { emoji: '😜', name: 'winking face with tongue' },
      { emoji: '🤪', name: 'zany face' },
      { emoji: '😝', name: 'squinting face with tongue' },
      { emoji: '🤑', name: 'money-mouth face' },
      { emoji: '🤗', name: 'hugging face' },
      { emoji: '🤭', name: 'face with hand over mouth' },
    ],
  },
  {
    label: 'Animals & Nature',
    emojis: [
      { emoji: '🐶', name: 'dog face' },
      { emoji: '🐱', name: 'cat face' },
      { emoji: '🐭', name: 'mouse face' },
      { emoji: '🐹', name: 'hamster' },
      { emoji: '🐰', name: 'rabbit face' },
      { emoji: '🦊', name: 'fox' },
      { emoji: '🐻', name: 'bear' },
      { emoji: '🐼', name: 'panda' },
      { emoji: '🐨', name: 'koala' },
      { emoji: '🐯', name: 'tiger face' },
      { emoji: '🦁', name: 'lion' },
      { emoji: '🐮', name: 'cow face' },
      { emoji: '🐷', name: 'pig face' },
      { emoji: '🐽', name: 'pig nose' },
      { emoji: '🐸', name: 'frog' },
      { emoji: '🐵', name: 'monkey face' },
      { emoji: '🙈', name: 'see-no-evil monkey' },
      { emoji: '🙉', name: 'hear-no-evil monkey' },
      { emoji: '🙊', name: 'speak-no-evil monkey' },
      { emoji: '🐒', name: 'monkey' },
      { emoji: '🐔', name: 'chicken' },
      { emoji: '🐧', name: 'penguin' },
      { emoji: '🐦', name: 'bird' },
      { emoji: '🐤', name: 'baby chick' },
      { emoji: '🐣', name: 'hatching chick' },
      { emoji: '🐥', name: 'front-facing baby chick' },
      { emoji: '🦆', name: 'duck' },
      { emoji: '🦅', name: 'eagle' },
      { emoji: '🦉', name: 'owl' },
      { emoji: '🦇', name: 'bat' },
    ],
  },
  {
    label: 'Food & Drink',
    emojis: [
      { emoji: '🍎', name: 'red apple' },
      { emoji: '🍏', name: 'green apple' },
      { emoji: '🍊', name: 'tangerine' },
      { emoji: '🍋', name: 'lemon' },
      { emoji: '🍌', name: 'banana' },
      { emoji: '🍉', name: 'watermelon' },
      { emoji: '🍇', name: 'grapes' },
      { emoji: '🍓', name: 'strawberry' },
      { emoji: '🫐', name: 'blueberries' },
      { emoji: '🍈', name: 'melon' },
      { emoji: '🍒', name: 'cherries' },
      { emoji: '🍑', name: 'peach' },
      { emoji: '🥭', name: 'mango' },
      { emoji: '🍍', name: 'pineapple' },
      { emoji: '🥥', name: 'coconut' },
      { emoji: '🥝', name: 'kiwi fruit' },
      { emoji: '🍅', name: 'tomato' },
      { emoji: '🍆', name: 'eggplant' },
      { emoji: '🥑', name: 'avocado' },
      { emoji: '🥦', name: 'broccoli' },
      { emoji: '🥬', name: 'leafy greens' },
      { emoji: '🥒', name: 'cucumber' },
      { emoji: '🌶️', name: 'hot pepper' },
      { emoji: '🫑', name: 'bell pepper' },
      { emoji: '🌽', name: 'ear of corn' },
      { emoji: '🥕', name: 'carrot' },
      { emoji: '🫒', name: 'olive' },
      { emoji: '🧄', name: 'garlic' },
      { emoji: '🧅', name: 'onion' },
      { emoji: '🥔', name: 'potato' },
    ],
  },
]

const emojiGroups: EmojiGroup[] = emojiCategories.map((category) => ({
  value: category.label,
  label: category.label,
  items: category.emojis.map((emoji) => ({
    ...emoji,
    value: emoji.name.toLowerCase(),
  })),
}))

const ALL = emojiGroups.flatMap((g) => g.items)
const DEFAULT_RECENT = ['😂', '🥰', '😅', '🐶', '🍓', '😉', '🤩', '🦊']

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// 按亮度取深浅前景，高亮格上的勾线与焦点环在任意强调色上都可见。
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0a0a0a' : '#ffffff'
}

export function EmojiPickerGrid({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  placeholder = 'iMessage',
  recent = DEFAULT_RECENT,
  open: openProp,
  onOpenChange,
  highlighted: highlightedProp,
  query: queryProp,
  className,
  style,
  ...props
}: EmojiPickerGridProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const cols = Math.max(1, Math.round(options.columns))

  const [innerOpen, setInnerOpen] = useState(false)
  const pickerOpen = openProp ?? innerOpen
  const [innerText, setInnerText] = useState(defaultValue)
  const textValue = valueProp ?? innerText
  const [innerSearch, setInnerSearch] = useState('')
  const searchValue = queryProp ?? innerSearch
  const [innerHighlight, setInnerHighlight] = useState<string | null>(null)
  const highlight = highlightedProp !== undefined ? highlightedProp : innerHighlight
  const [activeGroup, setActiveGroup] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLInputElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const groups = useMemo(() => {
    const base: EmojiGroup[] = options.recentRow
      ? [
          {
            value: 'recent',
            label: 'Frequently used',
            items: recent
              .slice(0, cols)
              .map((e) => ALL.find((i) => i.emoji === e))
              .filter((i): i is EmojiItem => i !== undefined)
              .map((i) => ({ ...i, value: `recent:${i.value}` })),
          },
          ...emojiGroups,
        ]
      : emojiGroups
    const q = searchValue.trim().toLowerCase()
    if (!q) return base
    // 搜索时不显示常用组，免得同一个表情出现两次。
    return base
      .filter((g) => g.value !== 'recent')
      .map((g) => ({ ...g, items: g.items.filter((i) => i.value.includes(q)) }))
      .filter((g) => g.items.length > 0)
  }, [options.recentRow, recent, cols, searchValue])

  // 二维导航用的行表：每组按列数切行，行与行跨组相连。
  const rows = useMemo(() => groups.flatMap((g) => chunkArray(g.items, cols)), [groups, cols])
  const flat = useMemo(() => rows.flat(), [rows])

  const setPickerOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setInnerSearch('')
      setInnerHighlight(null)
    }
  }

  const setTextValue = (next: string) => {
    if (valueProp === undefined) setInnerText(next)
    onValueChange?.(next)
  }

  function handleInsertEmoji(value: string | null) {
    if (!value || !textInputRef.current) {
      return
    }

    const emoji = value
    const start = textInputRef.current.selectionStart ?? textInputRef.current.value.length ?? 0
    const end = textInputRef.current.selectionEnd ?? textInputRef.current.value.length ?? 0

    setTextValue(textValue.slice(0, start) + emoji + textValue.slice(end))
    setPickerOpen(false)

    const input = textInputRef.current
    if (input) {
      input.focus()
      const caretPos = start + emoji.length
      requestAnimationFrame(() => input.setSelectionRange(caretPos, caretPos))
    }
  }

  // 用户打开时焦点进入搜索框；演示自动播放时不抢焦点。
  useEffect(() => {
    if (pickerOpen && document.activeElement === triggerRef.current) searchRef.current?.focus({ preventScroll: true })
  }, [pickerOpen])

  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  })

  // 高亮项变化时做最小滚动，保持可见。
  useEffect(() => {
    const list = listRef.current
    if (!pickerOpen || !list || !highlight) return
    const el = list.querySelector<HTMLElement>(`[data-value="${CSS.escape(highlight)}"]`)
    if (!el) return
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    if (top - 28 < list.scrollTop) list.scrollTop = top - 28
    else if (bottom + 6 > list.scrollTop + list.clientHeight) list.scrollTop = bottom + 6 - list.clientHeight
  }, [highlight, pickerOpen])

  const updateActiveGroup = () => {
    const list = listRef.current
    if (!list) return
    const labels = Array.from(list.querySelectorAll<HTMLElement>('[data-group-index]'))
    let current = 0
    for (const el of labels) if (el.offsetTop - list.scrollTop <= 8) current = Number(el.dataset.groupIndex)
    setActiveGroup((prev) => (prev === current ? prev : current))
  }

  useEffect(() => {
    if (pickerOpen) updateActiveGroup()
  })

  const jumpTo = (gi: number) => {
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>(`[data-group-index="${gi}"]`)
    if (!list || !el) return
    list.scrollTop = el.offsetTop - 8
    updateActiveGroup()
  }

  const move = (key: string) => {
    if (flat.length === 0) return
    const r = rows.findIndex((row) => row.some((i) => i.value === highlight))
    if (r < 0) {
      setInnerHighlight(flat[0]!.value)
      return
    }
    const c = rows[r]!.findIndex((i) => i.value === highlight)
    const fi = flat.findIndex((i) => i.value === highlight)
    let next: EmojiItem | undefined
    if (key === 'ArrowRight') next = flat[Math.min(flat.length - 1, fi + 1)]
    else if (key === 'ArrowLeft') next = flat[Math.max(0, fi - 1)]
    else if (key === 'ArrowDown') {
      const row = rows[Math.min(rows.length - 1, r + 1)]!
      next = row[Math.min(c, row.length - 1)]
    } else if (key === 'ArrowUp') {
      const row = rows[Math.max(0, r - 1)]!
      next = row[Math.min(c, row.length - 1)]
    } else if (key === 'Home') next = rows[r]![0]
    else if (key === 'End') next = rows[r]![rows[r]!.length - 1]
    if (next) setInnerHighlight(next.value)
  }

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault()
        move(e.key)
        return
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        // 有高亮时左右键在网格里移动，否则留给输入框移动光标。
        if (highlight) {
          e.preventDefault()
          move(e.key)
        }
        return
      case 'Enter': {
        e.preventDefault()
        const item = flat.find((i) => i.value === highlight)
        if (item) handleInsertEmoji(item.emoji)
        return
      }
      case 'Escape':
        e.preventDefault()
        setPickerOpen(false)
        triggerRef.current?.focus()
        return
    }
  }

  const cellHeight = Math.round(options.cellSize * (5 / 6))
  const popupWidth = cols * options.cellSize + 18
  const radius = options.radius
  const inner = Math.max(0, radius - 4)
  const ink = inkFor(options.accent)
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }
  const listId = `${id}-grid`
  const cellId = (v: string) => `${id}-cell-${v.replace(/[^a-z0-9]+/gi, '-')}`
  const tabsHeight = options.showCategories ? 36 : 0

  return (
    <div ref={rootRef} className={cn('mx-auto w-64', className)} style={style}>
      <div className="relative flex w-full">
        <input
          ref={textInputRef}
          type="text"
          aria-label="Message"
          className={cn(
            'm-0 -mr-px box-border h-8 min-w-0 flex-1 border border-r-0 border-foreground bg-background px-2 text-sm leading-5 font-normal text-foreground outline-none',
            'placeholder:text-muted-foreground focus:relative focus:outline-2 focus:-outline-offset-1 focus:outline-foreground',
          )}
          style={{ borderRadius: `${radius}px 0 0 ${radius}px` }}
          placeholder={placeholder}
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
        />

        <button
          ref={triggerRef}
          type="button"
          aria-label="Choose emoji"
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          data-pressed={pickerOpen ? '' : undefined}
          onClick={() => setPickerOpen(!pickerOpen)}
          className={cn(
            'box-border flex size-8 shrink-0 items-center justify-center border border-foreground bg-transparent text-xl leading-none text-foreground outline-none',
            'transition-[background-color] duration-100 hover:bg-muted active:bg-accent data-[pressed]:bg-muted',
            'focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-foreground',
          )}
          style={{ borderRadius: `0 ${radius}px ${radius}px 0` }}
        >
          😀
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              key="popup"
              role="dialog"
              aria-label="Select emoji"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={transition}
              className="absolute top-full right-0 z-10 mt-1 box-border max-w-full bg-background text-foreground shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] outline-0"
              style={{ width: popupWidth, transformOrigin: 'top right', borderRadius: radius }}
            >
              <input
                ref={searchRef}
                role="combobox"
                aria-label="Search emojis"
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={highlight ? cellId(highlight) : undefined}
                placeholder="Search emojis…"
                value={searchValue}
                onChange={(e) => {
                  setInnerSearch(e.target.value)
                  setInnerHighlight(null)
                  if (listRef.current) listRef.current.scrollTop = 0
                }}
                onKeyDown={onSearchKey}
                className={cn(
                  'm-0 box-border h-8 w-full max-w-full border border-foreground bg-background px-2 text-sm leading-5 text-foreground outline-none',
                  'placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-foreground',
                )}
                style={{ borderRadius: `${radius}px ${radius}px 0 0` }}
              />
              <div className="border border-t-0 border-foreground" style={{ borderRadius: `0 0 ${radius}px ${radius}px` }}>
                {options.showCategories && searchValue.trim() === '' && (
                  <div className="flex h-9 items-stretch gap-0.5 border-b border-foreground/20 px-2 py-1" aria-label="Categories">
                    {groups.map((g, gi) => {
                      const active = gi === activeGroup
                      return (
                        <button
                          key={g.value}
                          type="button"
                          aria-label={g.label}
                          aria-current={active ? 'true' : undefined}
                          onClick={() => jumpTo(gi)}
                          className={cn(
                            'relative flex flex-1 items-center justify-center text-base leading-none outline-none',
                            'transition-[opacity] duration-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground',
                            active ? 'opacity-100' : 'opacity-55 hover:opacity-90',
                          )}
                          style={{ borderRadius: inner }}
                        >
                          {active && (
                            <motion.span
                              layoutId={`${id}-tab`}
                              transition={transition}
                              className="absolute inset-0 -z-0"
                              style={{ backgroundColor: options.accent, borderRadius: inner }}
                            />
                          )}
                          <span className="relative">{g.value === 'recent' ? <ClockIcon color={active ? ink : 'currentColor'} /> : g.items[0]?.emoji}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {groups.length === 0 && <div className="box-border px-2 py-3 text-sm leading-4 text-muted-foreground">No emojis found</div>}
                <div
                  ref={listRef}
                  id={listId}
                  role="grid"
                  aria-label="Emoji results"
                  onScroll={updateActiveGroup}
                  className="relative overflow-auto overscroll-contain py-2 empty:p-0"
                  style={{ maxHeight: `calc(20.5rem - 2rem - 2px - ${tabsHeight}px)`, scrollPaddingTop: '0.25rem', scrollPaddingBottom: '0.35rem' }}
                >
                  {groups.map((group, gi) => (
                    <div key={group.value} role="rowgroup" aria-label={group.label} className="block">
                      <div
                        data-group-index={gi}
                        aria-hidden
                        className="box-border p-2 text-sm leading-4 text-muted-foreground select-none"
                      >
                        {group.label}
                      </div>
                      <div className="px-2 pb-1" role="presentation">
                        {chunkArray(group.items, cols).map((row, rowIdx) => (
                          <div key={rowIdx} role="row" className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                            {row.map((rowItem) => {
                              const isHighlighted = rowItem.value === highlight
                              return (
                                <div
                                  key={rowItem.value}
                                  id={cellId(rowItem.value)}
                                  role="gridcell"
                                  aria-label={rowItem.name}
                                  aria-selected={isHighlighted}
                                  data-value={rowItem.value}
                                  data-highlighted={isHighlighted ? '' : undefined}
                                  onPointerMove={() => highlightedProp === undefined && setInnerHighlight(rowItem.value)}
                                  onPointerDown={(e) => e.preventDefault()}
                                  onClick={() => handleInsertEmoji(rowItem.emoji)}
                                  className="relative z-0 box-border flex cursor-default flex-col items-center justify-center px-0.5 py-2 outline-0 select-none"
                                  style={{ height: cellHeight }}
                                >
                                  {isHighlighted && (
                                    <span aria-hidden className="absolute inset-0 -z-10" style={{ backgroundColor: options.accent, borderRadius: inner }} />
                                  )}
                                  <span className="text-2xl leading-none">{rowItem.emoji}</span>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.25 1.5" />
    </svg>
  )
}
