// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Julien Thibeaut
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/blocks/prompt-input-suggestions.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn, cssVars } from '@/lib/motif-runtime'
import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#a5b4fc',
  highlightStyle: 'text',
  radius: 24,
  layout: 'wrap',
  maxItems: 4,
  showIcons: true,
  stagger: 0.04,
  placeholder: 'Ask anything...',
}
/* @motif:end */

export type SuggestionGroup = { label: string; highlight: string; items: string[] }

export const suggestionGroups: SuggestionGroup[] = [
  { label: 'Summary', highlight: 'Summarize', items: ['Summarize a document', 'Summarize a video', 'Summarize a podcast', 'Summarize a book'] },
  { label: 'Code', highlight: 'Help me', items: ['Help me write React components', 'Help me debug code', 'Help me learn Python', 'Help me learn SQL'] },
  { label: 'Design', highlight: 'Design', items: ['Design a small logo', 'Design a hero section', 'Design a landing page', 'Design a social media post'] },
  { label: 'Research', highlight: 'Research', items: ['Research the best practices for SEO', 'Research the best running shoes', 'Research the best restaurants in Lisbon', 'Research the best note-taking tools'] },
]

export type PromptSuggestionsProps = Partial<typeof defaults> & {
  groups?: SuggestionGroup[]
  /** 受控：输入框文字。 */
  value?: string
  onValueChange?: (value: string) => void
  /** 受控：当前展开的分类（label），'' 表示显示分类胶囊。 */
  category?: string
  onCategoryChange?: (category: string) => void
  /** 受控：键盘高亮的建议下标，-1 表示没有。 */
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  onSubmit?: (text: string) => void
  className?: string
  style?: CSSProperties
}

/** 按亮度挑选强调色上的文字颜色。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0b0b0f'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0b0b0f' : '#ffffff'
}

function BrainIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 shrink-0">
      <path d="M12 5a3 3 0 0 0-5.8-1A3 3 0 0 0 4 8a3 3 0 0 0 0 5 3.5 3.5 0 0 0 4 5 3 3 0 0 0 4 1z" />
      <path d="M12 5a3 3 0 0 1 5.8-1A3 3 0 0 1 20 8a3 3 0 0 1 0 5 3.5 3.5 0 0 1-4 5 3 3 0 0 1-4 1z" />
      <path d="M12 5v14" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}

/** 上游 PromptSuggestion 的高亮模式：只高亮第一次出现的位置。 */
function Highlighted({ content, highlight, variant }: { content: string; highlight: string; variant: string }) {
  const h = highlight.trim()
  const index = h ? content.toLowerCase().indexOf(h.toLowerCase()) : -1
  if (index === -1) return <span className="whitespace-pre-wrap text-muted-foreground">{content}</span>
  const before = content.substring(0, index)
  const match = content.substring(index, index + h.length)
  const after = content.substring(index + h.length)
  return (
    <>
      {before && <span className="whitespace-pre-wrap text-muted-foreground">{before}</span>}
      <span
        className={cn(
          'whitespace-pre-wrap font-medium',
          variant === 'text' && 'text-(--ps-hl)',
          variant === 'mark' && 'rounded-[4px] bg-(--ps-accent) px-0.5 text-(--ps-ink)',
          variant === 'underline' && 'text-foreground underline decoration-(--ps-accent) decoration-2 underline-offset-4',
        )}
      >
        {match}
      </span>
      {after && <span className="whitespace-pre-wrap text-muted-foreground">{after}</span>}
    </>
  )
}

export function PromptSuggestions({
  className,
  style,
  groups = suggestionGroups,
  value: valueProp,
  onValueChange,
  category: categoryProp,
  onCategoryChange,
  activeIndex: activeProp,
  onActiveIndexChange,
  onSubmit,
  ...props
}: PromptSuggestionsProps) {
  const { accent, highlightStyle, radius, layout, maxItems, showIcons, stagger, placeholder } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const [valueState, setValueState] = useState('')
  const [categoryState, setCategoryState] = useState('')
  const [activeState, setActiveState] = useState(-1)
  const inputValue = valueProp ?? valueState
  const activeCategory = categoryProp ?? categoryState
  const active = activeProp ?? activeState

  const setInputValue = (v: string) => {
    setValueState(v)
    onValueChange?.(v)
  }
  const setActiveCategory = (c: string) => {
    setCategoryState(c)
    onCategoryChange?.(c)
  }
  const setActive = (i: number) => {
    setActiveState(i)
    onActiveIndexChange?.(i)
  }

  const activeCategoryData = groups.find((group) => group.label === activeCategory)
  const pool = activeCategoryData ? activeCategoryData.items : groups.flatMap((g) => g.items)
  const query = inputValue.trim()
  const exactPick = pool.some((p) => p === inputValue)
  // 有输入时按输入筛选（autocomplete-highlight 块）；没有输入但选了分类时列出分类提示词（input-suggestions 块）。
  const suggestions = exactPick ? [] : query ? pool.filter((p) => p.toLowerCase().includes(query.toLowerCase())).slice(0, maxItems) : activeCategoryData ? pool.slice(0, maxItems) : []
  const highlight = query || activeCategoryData?.highlight || ''
  const showList = suggestions.length > 0
  const showPills = !activeCategoryData && !query
  const listId = `${id}-list`

  const handleSend = () => {
    if (inputValue.trim()) {
      onSubmit?.(inputValue)
      setInputValue('')
      setActiveCategory('')
      setActive(-1)
    }
  }

  const pick = (s: string) => {
    setInputValue(s)
    setActive(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (showList && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      const n = suggestions.length
      setActive(e.key === 'ArrowDown' ? (active + 1 + n) % n : (active - 1 + n) % n)
      return
    }
    if (e.key === 'Escape') {
      if (active >= 0) setActive(-1)
      else if (activeCategory) setActiveCategory('')
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const chosen = active >= 0 ? suggestions[active] : undefined
      if (chosen) pick(chosen)
      else handleSend()
    }
  }

  const handleChange = (v: string) => {
    setInputValue(v)
    setActive(-1)
    // Clear active category when typing something different
    if (v.trim() === '') setActiveCategory('')
  }

  const enter = reduced ? { opacity: 0 } : { opacity: 0, y: 6 }
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0 }
  const timing = (i: number) => (reduced ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const, delay: i * stagger })
  const sendInk = inkFor(accent)
  const canSend = inputValue.trim() !== ''

  return (
    <div
      className={cn('flex w-full flex-col items-center justify-center gap-4 text-foreground', className)}
      style={cssVars(
        {
          '--ps-accent': accent,
          '--ps-ink': sendInk,
          '--ps-hl': `color-mix(in oklab, ${accent} 72%, var(--foreground))`,
          '--ps-r': `${radius}px`,
        },
        style,
      )}
    >
      <div className="relative z-10 w-full rounded-(--ps-r) border border-input bg-popover p-0 pt-1 shadow-xs focus-within:border-[color-mix(in_oklab,var(--ps-accent)_45%,var(--border))]">
        <textarea
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && showList ? `${listId}-${active}` : undefined}
          aria-label={placeholder}
          rows={1}
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block max-h-40 min-h-[44px] w-full resize-none bg-transparent pt-3 pr-4 pl-4 text-base leading-[1.3] text-foreground outline-none [field-sizing:content] placeholder:text-muted-foreground"
        />
        <div className="mt-5 flex w-full items-end justify-end gap-2 px-3 pb-3">
          <button
            type="button"
            aria-label="Send"
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--ps-accent) text-(--ps-ink) transition-[opacity,transform] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ps-accent) active:scale-95 disabled:opacity-40"
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>

      <div className="relative w-full min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {showPills ? (
            <motion.div key="pills" className={cn('relative flex w-full items-stretch justify-start gap-2', layout === 'row' ? 'no-scrollbar overflow-x-auto pb-1' : 'flex-wrap')} exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}>
              {groups.map((group, i) => (
                <motion.button
                  key={group.label}
                  type="button"
                  initial={enter}
                  animate={shown}
                  transition={timing(i)}
                  onClick={() => {
                    setActiveCategory(group.label)
                    setInputValue('') // Clear input when selecting a category
                    setActive(-1)
                  }}
                  className="inline-flex h-10 shrink-0 items-center rounded-full border border-input bg-background px-5 text-sm font-medium text-foreground capitalize transition-[background-color,border-color] duration-150 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ps-accent)"
                >
                  {showIcons && <BrainIcon />}
                  {group.label}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key={`list-${activeCategory}`} exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}>
              {activeCategoryData && !query && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('')}
                  className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--ps-accent)"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  {activeCategoryData.label}
                </button>
              )}
              <ul id={listId} role="listbox" aria-label="Suggestions" className="flex w-full flex-col space-y-1">
                {suggestions.map((suggestion, i) => (
                  <motion.li
                    key={suggestion}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    initial={enter}
                    animate={shown}
                    transition={timing(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(suggestion)}
                    className={cn(
                      'flex h-auto w-full cursor-pointer flex-wrap justify-start gap-0 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent',
                      i === active && 'bg-accent',
                    )}
                  >
                    <Highlighted content={suggestion} highlight={highlight} variant={highlightStyle} />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

