// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/select/demos/hero/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ffffff',
  radius: 0,
  alignToItem: true,
  width: 160,
  maxHeight: 288,
  grouped: true,
  spring: {
    visualDuration: 0.12,
    bounce: 0,
  },
}
/* @motif:end */

export type SelectOption = { label: string; value: string }
export type SelectGroup = { label?: string; items: SelectOption[] }

export const APPLES: SelectGroup[] = [
  {
    items: [
      { label: 'Gala', value: 'gala' },
      { label: 'Fuji', value: 'fuji' },
      { label: 'Honeycrisp', value: 'honeycrisp' },
      { label: 'Granny Smith', value: 'granny-smith' },
      { label: 'Pink Lady', value: 'pink-lady' },
    ],
  },
]

export const PRODUCE: SelectGroup[] = [
  {
    label: 'Fruits',
    items: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'mango', label: 'Mango' },
      { value: 'kiwi', label: 'Kiwi' },
      { value: 'grape', label: 'Grape' },
      { value: 'orange', label: 'Orange' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'watermelon', label: 'Watermelon' },
    ],
  },
  {
    label: 'Vegetables',
    items: [
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'carrot', label: 'Carrot' },
      { value: 'cauliflower', label: 'Cauliflower' },
      { value: 'cucumber', label: 'Cucumber' },
      { value: 'kale', label: 'Kale' },
      { value: 'pepper', label: 'Bell pepper' },
      { value: 'spinach', label: 'Spinach' },
      { value: 'zucchini', label: 'Zucchini' },
    ],
  },
]

export type SelectAlignedListboxProps = Partial<typeof defaults> & {
  /** 自定义选项；不传时按 grouped 用上游的两组示例数据。 */
  groups?: SelectGroup[]
  label?: string
  placeholder?: string
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** 受控展开（演示自动播放用）。 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** 强制高亮项（演示自动播放用）。 */
  highlighted?: string
  className?: string
  style?: CSSProperties
}

// 按亮度取深浅文字，保证任意高亮色上都读得清。
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0a0a0a' : '#ffffff'
}

// 上游 .Item 的左内边距 + 勾选列 + 间距，减去触发按钮的左内边距：对齐时弹层左移这么多，让文字对齐。
const TEXT_SHIFT = 10 + 16 + 8 - 8

export function SelectAlignedListbox({
  groups: groupsProp,
  label = 'Produce',
  placeholder = 'Select produce',
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  onOpenChange,
  highlighted: highlightedProp,
  className,
  style,
  ...props
}: SelectAlignedListboxProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const groups = groupsProp ?? (options.grouped ? PRODUCE : APPLES)
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  const [innerValue, setInnerValue] = useState<string | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : innerValue
  const [innerOpen, setInnerOpen] = useState(false)
  const open = openProp ?? innerOpen
  const [innerHighlight, setInnerHighlight] = useState<string | null>(null)
  const highlight = highlightedProp ?? innerHighlight
  const [scroll, setScroll] = useState({ up: false, down: false })

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const scrollFrame = useRef(0)

  const selected = flat.find((o) => o.value === value)
  const ink = inkFor(options.accent)
  const optionId = (v: string) => `${id}-opt-${v}`

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (next) setInnerHighlight(value ?? flat[0]?.value ?? null)
  }
  const commit = (v: string) => {
    if (valueProp === undefined) setInnerValue(v)
    onValueChange?.(v)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const updateArrows = () => {
    const list = listRef.current
    if (!list) return
    const up = list.scrollTop > 1
    const down = list.scrollTop + list.clientHeight < list.scrollHeight - 1
    setScroll((s) => (s.up === up && s.down === down ? s : { up, down }))
  }

  // 打开时先滚动列表、再摆放弹层：对齐模式下让选中项正好压在触发按钮上（上游 alignItemWithTrigger）。
  useLayoutEffect(() => {
    if (!open) return
    const popup = popupRef.current
    const list = listRef.current
    const trigger = triggerRef.current
    if (!popup || !list || !trigger) return
    const anchor = list.querySelector<HTMLElement>(`[data-value="${CSS.escape(value ?? flat[0]?.value ?? '')}"]`)
    if (options.alignToItem && anchor) {
      const itemH = anchor.offsetHeight
      const maxScroll = list.scrollHeight - list.clientHeight
      list.scrollTop = Math.max(0, Math.min(maxScroll, anchor.offsetTop - (list.clientHeight - itemH) / 2))
      const itemTop = list.offsetTop + anchor.offsetTop - list.scrollTop
      popup.style.top = `${trigger.offsetTop + (trigger.offsetHeight - itemH) / 2 - itemTop - 1}px`
      popup.style.left = `${-TEXT_SHIFT}px`
    } else {
      if (anchor && anchor.offsetTop + anchor.offsetHeight > list.clientHeight) list.scrollTop = anchor.offsetTop - list.clientHeight / 2
      else list.scrollTop = 0
      popup.style.top = `${trigger.offsetTop + trigger.offsetHeight + 4}px`
      popup.style.left = '0px'
    }
    updateArrows()
    // 只在展开或对齐方式变化时重新摆放，不随高亮移动。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options.alignToItem, options.maxHeight, groups])

  // 高亮项变化时只做最小滚动，保持可见。
  useEffect(() => {
    const list = listRef.current
    if (!open || !list || !highlight) return
    const el = list.querySelector<HTMLElement>(`[data-value="${CSS.escape(highlight)}"]`)
    if (!el) return
    const pad = 16
    if (el.offsetTop - pad < list.scrollTop) list.scrollTop = el.offsetTop - pad
    else if (el.offsetTop + el.offsetHeight + pad > list.scrollTop + list.clientHeight)
      list.scrollTop = el.offsetTop + el.offsetHeight + pad - list.clientHeight
    updateArrows()
  }, [highlight, open])

  // 用户打开时把焦点移进列表；演示自动播放时触发按钮没有焦点，不抢焦点。
  useEffect(() => {
    if (open && document.activeElement === triggerRef.current) listRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  })

  useEffect(() => () => cancelAnimationFrame(scrollFrame.current), [])

  const startScroll = (dir: 1 | -1) => {
    cancelAnimationFrame(scrollFrame.current)
    const step = () => {
      const list = listRef.current
      if (!list) return
      list.scrollTop += dir * 6
      updateArrows()
      scrollFrame.current = requestAnimationFrame(step)
    }
    scrollFrame.current = requestAnimationFrame(step)
  }
  const stopScroll = () => cancelAnimationFrame(scrollFrame.current)

  const move = (delta: number | 'start' | 'end') => {
    const i = flat.findIndex((o) => o.value === highlight)
    let next: number
    if (delta === 'start') next = 0
    else if (delta === 'end') next = flat.length - 1
    else next = i < 0 ? 0 : Math.max(0, Math.min(flat.length - 1, i + delta))
    setInnerHighlight(flat[next]?.value ?? null)
  }

  const onTriggerKey = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onListKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        move(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        move(-1)
        return
      case 'Home':
        e.preventDefault()
        move('start')
        return
      case 'End':
        e.preventDefault()
        move('end')
        return
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (highlight) commit(highlight)
        return
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        return
      case 'Tab':
        setOpen(false)
        return
    }
    // 键入跳转：0.5 秒内连续输入的字符拼成前缀；用事件时间戳而不是定时器。
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typeahead.current
      t.text = e.timeStamp - t.at > 500 ? e.key.toLowerCase() : t.text + e.key.toLowerCase()
      t.at = e.timeStamp
      const start = flat.findIndex((o) => o.value === highlight)
      const ordered = [...flat.slice(start + 1), ...flat.slice(0, start + 1)]
      const hit = (t.text.length === 1 ? ordered : flat).find((o) => o.label.toLowerCase().startsWith(t.text))
      if (hit) setInnerHighlight(hit.value)
    }
  }

  const radius = options.radius
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: options.spring.visualDuration, bounce: options.spring.bounce }
  const hidden = options.alignToItem ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
  const labelId = `${id}-label`
  const listId = `${id}-list`

  return (
    <div ref={rootRef} className={cn('relative flex flex-col items-start gap-1', className)} style={style}>
      <div id={labelId} className="cursor-default text-sm leading-5 font-bold text-foreground">
        {label}
      </div>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${id}-value`}
        data-pressed={open ? '' : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onTriggerKey}
        className={cn(
          'box-border flex h-8 items-center justify-between gap-3 border border-foreground bg-background pr-1 pl-2 text-sm leading-none whitespace-nowrap text-foreground select-none',
          'outline-none transition-[background-color] duration-100 hover:bg-muted data-[pressed]:bg-muted active:bg-accent',
          'focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-foreground',
        )}
        style={{ minWidth: options.width, borderRadius: radius }}
      >
        <span id={`${id}-value`} className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected?.label ?? placeholder}
        </span>
        <CaretUpDownIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            key="popup"
            initial={hidden}
            animate={{ opacity: 1, scale: 1 }}
            exit={hidden}
            transition={transition}
            className="absolute z-10 box-border overflow-hidden border border-foreground bg-background bg-clip-padding text-foreground shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)] outline-none select-none"
            style={{
              minWidth: options.alignToItem ? options.width + 28 : options.width,
              borderRadius: radius,
              transformOrigin: options.alignToItem ? 'center' : 'top center',
            }}
          >
            {scroll.up && (
              <ScrollArrow dir="up" onEnter={() => startScroll(-1)} onLeave={stopScroll}>
                <CaretUpIcon />
              </ScrollArrow>
            )}
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={labelId}
              aria-activedescendant={highlight ? optionId(highlight) : undefined}
              onKeyDown={onListKey}
              onScroll={updateArrows}
              className="relative box-border overflow-y-auto py-1 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ maxHeight: options.maxHeight, scrollPaddingBlock: '1.5rem' }}
            >
              {groups.map((group, gi) => (
                <Fragment key={group.label ?? gi}>
                  <div role="group" aria-labelledby={group.label ? `${id}-g${gi}` : undefined} className="block pb-0.5 last:pb-0">
                    {group.label && (
                      <div id={`${id}-g${gi}`} className="box-border cursor-default py-1.5 pr-4 pl-[2.125rem] text-sm leading-5 text-muted-foreground select-none">
                        {group.label}
                      </div>
                    )}
                    {group.items.map((item) => {
                      const isSelected = item.value === value
                      const isHighlighted = item.value === highlight
                      return (
                        <div
                          key={item.value}
                          id={optionId(item.value)}
                          role="option"
                          aria-selected={isSelected}
                          data-value={item.value}
                          data-highlighted={isHighlighted ? '' : undefined}
                          onPointerMove={() => highlightedProp === undefined && setInnerHighlight(item.value)}
                          onClick={() => commit(item.value)}
                          className="box-border grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 text-sm leading-5 outline-none select-none"
                          style={isHighlighted ? { backgroundColor: options.accent, color: ink, borderRadius: Math.max(0, radius - 4) } : { borderRadius: Math.max(0, radius - 4) }}
                        >
                          <span className="col-start-1">{isSelected && <CheckIcon />}</span>
                          <span className="col-start-2">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  {gi < groups.length - 1 && <div role="separator" className="mx-4 my-1 h-px bg-foreground" />}
                </Fragment>
              ))}
            </div>
            {scroll.down && (
              <ScrollArrow dir="down" onEnter={() => startScroll(1)} onLeave={stopScroll}>
                <CaretDownIcon />
              </ScrollArrow>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScrollArrow({ dir, onEnter, onLeave, children }: { dir: 'up' | 'down'; onEnter: () => void; onLeave: () => void; children: ReactNode }) {
  return (
    <div
      aria-hidden
      data-direction={dir}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={cn(
        'absolute right-0 left-0 z-[1] flex h-4 w-full cursor-default items-center justify-center bg-background text-center text-xs',
        dir === 'up' ? 'top-0' : 'bottom-0',
      )}
    >
      {children}
    </div>
  )
}

function CaretUpDownIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props} style={{ display: 'block', ...props.style }}>
      <path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
    </svg>
  )
}

function CheckIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden {...props} style={{ display: 'block', ...props.style }}>
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  )
}

function CaretUpIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props} style={{ display: 'block', ...props.style }}>
      <path d="M12 10H4l4-4.5z" />
    </svg>
  )
}

function CaretDownIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props} style={{ display: 'block', ...props.style }}>
      <path d="M12 6H4l4 4.5z" />
    </svg>
  )
}
