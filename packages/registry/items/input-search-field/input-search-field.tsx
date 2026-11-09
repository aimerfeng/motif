// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-27.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  shortcutKey: 'K',
  showShortcut: true,
  showClear: true,
  loadingDelay: 500,
  endAction: 'mic',
  size: 'md',
  width: 280,
  radius: 6,
}
/* @motif:end */

export type InputSearchFieldProps = Partial<typeof defaults> & {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onMic?: () => void
  /** 受控的加载状态；不传时输入后按 loadingDelay 自动转圈。 */
  loading?: boolean
  className?: string
  style?: CSSProperties
}

const SIZES = {
  sm: { h: 32, text: 'text-[13px]', icon: 14, slot: 32 },
  md: { h: 36, text: 'text-sm', icon: 16, slot: 36 },
  lg: { h: 42, text: 'text-[15px]', icon: 18, slot: 42 },
} as const

const buttonClass =
  'flex h-full items-center justify-center text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

function SearchIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function LoaderIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin motion-reduce:animate-none" role="status" aria-label="Loading...">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function ClearIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function ArrowIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

/** 搜索框：⌘K 聚焦、输入时转圈、清除按钮、可选麦克风 / 提交按钮。 */
export function InputSearchField({ label, placeholder = 'Search...', value, defaultValue, onChange, onSubmit, onMic, loading, className, style, ...props }: InputSearchFieldProps) {
  const { shortcutKey, showShortcut, showClear, loadingDelay, endAction, size, width, radius } = { ...defaults, ...props }
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inner, setInner] = useState(defaultValue ?? '')
  const inputValue = value ?? inner
  const [timerLoading, setTimerLoading] = useState(false)
  const [mac, setMac] = useState(true)
  const s = SIZES[size as keyof typeof SIZES] ?? SIZES.md
  const key = (shortcutKey || 'K').slice(0, 1).toUpperCase()

  useEffect(() => {
    if (typeof navigator !== 'undefined') setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
  }, [])

  // 上游 comp-27：输入后转圈 loadingDelay 毫秒。
  useEffect(() => {
    if (loading !== undefined) return
    if (inputValue && loadingDelay > 0) {
      setTimerLoading(true)
      const timer = setTimeout(() => setTimerLoading(false), loadingDelay)
      return () => clearTimeout(timer)
    }
    setTimerLoading(false)
  }, [inputValue, loadingDelay, loading])

  useEffect(() => {
    if (!showShortcut) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, showShortcut])

  const isLoading = loading ?? timerLoading
  const setValue = (next: string) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  const handleClearInput = () => {
    setValue('')
    inputRef.current?.focus()
  }

  const hasClear = showClear && inputValue.length > 0
  const hasKbd = showShortcut && !hasClear
  const hasEnd = endAction !== 'none'
  const padEnd = 8 + (hasEnd ? s.slot : 0) + (hasClear ? s.slot - 8 : 0) + (hasKbd ? 36 : 0)

  return (
    <form
      role="search"
      className={cn('max-w-full *:not-first:mt-2', className)}
      style={{ width, ...style }}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(inputValue)
      }}
    >
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="search"
          aria-label={label ? undefined : placeholder}
          aria-keyshortcuts={showShortcut ? `${mac ? 'Meta' : 'Control'}+${key}` : undefined}
          aria-busy={isLoading || undefined}
          value={inputValue}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'peer flex w-full min-w-0 border border-input bg-transparent py-1 text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
            s.text,
          )}
          style={{ height: s.h, borderRadius: radius, paddingInlineStart: s.icon + 20, paddingInlineEnd: padEnd }}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          {isLoading ? <LoaderIcon size={s.icon} /> : <SearchIcon size={s.icon} />}
        </div>
        <div className="absolute inset-y-0 end-0 flex items-center" style={{ paddingInlineEnd: hasEnd ? 0 : 6 }}>
          {hasClear ? (
            <button type="button" aria-label="Clear input" className={buttonClass} style={{ width: s.slot - 8, borderRadius: radius }} onClick={handleClearInput}>
              <ClearIcon size={s.icon} />
            </button>
          ) : null}
          {hasKbd ? (
            <kbd className="pointer-events-none me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
              {mac ? '⌘' : 'Ctrl '}
              {key}
            </kbd>
          ) : null}
          {endAction === 'submit' ? (
            <button type="submit" aria-label="Submit search" className={buttonClass} style={{ width: s.slot, borderStartEndRadius: radius, borderEndEndRadius: radius }}>
              <ArrowIcon size={s.icon} />
            </button>
          ) : null}
          {endAction === 'mic' ? (
            <button type="button" aria-label="Press to speak" className={buttonClass} style={{ width: s.slot, borderStartEndRadius: radius, borderEndEndRadius: radius }} onClick={onMic}>
              <MicIcon size={s.icon} />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  )
}
