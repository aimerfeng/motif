// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/choice-poll.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { animate, motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  barStyle: 'fill',
  indicator: 'radio',
  radius: 12,
  revealDuration: 0.5,
  showVotes: true,
}
/* @motif:end */

type Options = typeof defaults

/* -----------------------------------------------------------------------------
 * Small replacements for upstream dependencies
 * -------------------------------------------------------------------------- */

/** lucide-react Check, inlined. */
function Check({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Minimal replacement for @radix-ui/react-use-controllable-state. */
function useControllableState<T>({ prop, defaultProp, onChange }: { prop?: T; defaultProp: T; onChange?: (value: T) => void }) {
  const [uncontrolled, setUncontrolled] = useState(defaultProp)
  const isControlled = prop !== undefined
  const value = isControlled ? prop : uncontrolled
  const valueRef = useRef(value)
  valueRef.current = value
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next
      if (Object.is(resolved, valueRef.current)) return
      if (!isControlled) setUncontrolled(resolved)
      onChangeRef.current?.(resolved)
    },
    [isControlled],
  )
  return [value, setValue] as const
}

/** Dark or light ink for text on top of a hex color. */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = Number.parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0a0a0a' : '#ffffff'
}

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export interface ChoicePollRootProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  /** Currently selected option(s) - controlled */
  value?: string | string[]
  /** Default selected option(s) - uncontrolled */
  defaultValue?: string | string[]
  /** Callback when selection changes */
  onValueChange?: (value: string | string[]) => void
  /** Whether multiple selections are allowed */
  multiple?: boolean
  /** Whether the poll is disabled */
  disabled?: boolean
  /** Whether poll results should be visible after voting */
  showResults?: boolean
  /** Vote counts per option (for showing results) */
  votes?: Record<string, number>
  /** Whether user has submitted their vote */
  hasVoted?: boolean
  /** Accent color (replaces the theme primary). */
  accent?: string
  /** Corner radius of each option, px. */
  radius?: number
  /** How long the bars and numbers take to reach their value, seconds. */
  revealDuration?: number
}

export interface ChoicePollOptionProps extends ComponentProps<'button'> {
  /** Unique identifier for this option */
  value: string
  /** Whether this specific option is disabled */
  disabled?: boolean
  /** Whether to paint the fill bar behind the option (upstream default). */
  fill?: boolean
}

export interface ChoicePollFooterProps extends ComponentProps<'div'> {
  /** Total number of votes */
  totalVotes?: number
}

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface ChoicePollContextValue {
  selected: string[]
  multiple: boolean
  disabled: boolean
  showResults: boolean
  votes: Record<string, number>
  totalVotes: number
  hasVoted: boolean
  revealDuration: number
  select: (optionId: string) => void
  isSelected: (optionId: string) => boolean
  getPercentage: (optionId: string) => number
}

const ChoicePollContext = createContext<ChoicePollContextValue | null>(null)

function useChoicePollContext() {
  const context = useContext(ChoicePollContext)
  if (!context) throw new Error('ChoicePoll components must be used within ChoicePoll.Root')
  return context
}

interface ChoicePollOptionContextValue {
  optionId: string
  disabled: boolean
  isSelected: boolean
  percentage: number
}

const ChoicePollOptionContext = createContext<ChoicePollOptionContextValue | null>(null)

function useChoicePollOptionContext() {
  const context = useContext(ChoicePollOptionContext)
  if (!context) throw new Error('ChoicePoll.Option sub-components must be used within ChoicePoll.Option')
  return context
}

/** Counts from 0 up to the percentage once results show (motion-driven). */
function useAnimatedPercentage(percentage: number, shouldShowResults: boolean, duration: number) {
  const reduced = useReducedMotion()
  const [animatedPercentage, setAnimatedPercentage] = useState(shouldShowResults ? percentage : 0)
  const current = useRef(animatedPercentage)

  useEffect(() => {
    const target = shouldShowResults ? percentage : 0
    if (reduced || !shouldShowResults || duration <= 0) {
      current.current = target
      setAnimatedPercentage(target)
      return
    }
    const controls = animate(current.current, target, {
      duration,
      ease: [0, 0, 0.58, 1],
      onUpdate: (v) => {
        current.current = v
        setAnimatedPercentage(v)
      },
    })
    return () => controls.stop()
  }, [percentage, shouldShowResults, duration, reduced])

  return animatedPercentage
}

/* -----------------------------------------------------------------------------
 * Variants (class-variance-authority replaced by plain maps)
 * -------------------------------------------------------------------------- */

type State = 'idle' | 'selected' | 'voted'

const optionBase = [
  'group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--poll-radius)] border p-4 text-left',
  'transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out',
  'focus-visible:ring-2 focus-visible:ring-[var(--poll-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

const optionState: Record<State, string> = {
  idle: 'border-border bg-background hover:border-[var(--poll-accent)]/50 hover:bg-accent/50',
  selected: 'border-[var(--poll-accent)] bg-[var(--poll-accent)]/5 shadow-sm hover:border-[var(--poll-accent)] hover:bg-[var(--poll-accent)]/10',
  // 投完票后选项仍需清晰可读，因此不沿用 disabled 的半透明。
  voted: 'border-border bg-muted/30 cursor-default disabled:cursor-default disabled:opacity-100',
}

const indicatorBase = 'flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-[background-color,border-color,color] duration-200 ease-out'

const indicatorState: Record<State, string> = {
  idle: 'border-muted-foreground/30 bg-background',
  selected: 'border-[var(--poll-accent)] bg-[var(--poll-accent)] text-[var(--poll-ink)]',
  voted: 'border-muted-foreground/30 bg-muted',
}

const progressState: Record<'selected' | 'voted', string> = {
  selected: 'bg-[var(--poll-accent)]/15',
  voted: 'bg-[var(--poll-accent)]/10',
}

/* -----------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------- */

const normalizeValue = (val: string | string[] | undefined): string[] => {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

function ChoicePollRoot({
  value: controlledValue,
  defaultValue,
  onValueChange,
  multiple = false,
  disabled = false,
  showResults = false,
  votes = {},
  hasVoted = false,
  accent = '#6366f1',
  radius = 12,
  revealDuration = 0.5,
  children,
  className,
  style,
  ...props
}: ChoicePollRootProps) {
  const [selectedArray, setSelectedArray] = useControllableState<string[]>({
    prop: controlledValue !== undefined ? normalizeValue(controlledValue) : undefined,
    defaultProp: normalizeValue(defaultValue),
    onChange: (arr) => onValueChange?.(multiple ? arr : (arr[0] ?? '')),
  })

  const selected = selectedArray ?? []
  const totalVotes = useMemo(() => Object.values(votes).reduce((sum, count) => sum + count, 0), [votes])

  const select = useCallback(
    (optionId: string) => {
      if (disabled || hasVoted) return
      setSelectedArray((prev) => {
        const current = prev ?? []
        const isCurrentlySelected = current.includes(optionId)
        if (multiple) return isCurrentlySelected ? current.filter((id) => id !== optionId) : [...current, optionId]
        return isCurrentlySelected ? [] : [optionId]
      })
    },
    [disabled, hasVoted, multiple, setSelectedArray],
  )

  const selectedKey = selected.join('\u0000')
  const isSelected = useCallback((optionId: string) => selectedKey.split('\u0000').includes(optionId), [selectedKey])

  const getPercentage = useCallback(
    (optionId: string) => (totalVotes === 0 ? 0 : Math.round(((votes[optionId] ?? 0) / totalVotes) * 100)),
    [votes, totalVotes],
  )

  const contextValue = useMemo(
    () => ({
      selected,
      multiple,
      disabled,
      showResults: showResults && hasVoted,
      votes,
      totalVotes,
      hasVoted,
      revealDuration,
      select,
      isSelected,
      getPercentage,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedKey, multiple, disabled, showResults, hasVoted, votes, totalVotes, revealDuration, select, isSelected, getPercentage],
  )

  return (
    <ChoicePollContext.Provider value={contextValue}>
      <div
        className={cn('flex flex-col gap-4', className)}
        data-disabled={disabled ? true : undefined}
        data-has-voted={hasVoted ? true : undefined}
        data-multiple={multiple ? true : undefined}
        data-slot="choice-poll"
        style={{ '--poll-accent': accent, '--poll-ink': inkFor(accent), '--poll-radius': `${radius}px`, ...style } as CSSProperties}
        {...props}
      >
        {children}
      </div>
    </ChoicePollContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Header / Title / Description
 * -------------------------------------------------------------------------- */

function ChoicePollHeader({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1', className)} data-slot="choice-poll-header" {...props}>
      {children}
    </div>
  )
}

function ChoicePollTitle({ children, className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('text-lg font-semibold tracking-tight', className)} data-slot="choice-poll-title" {...props}>
      {children}
    </h3>
  )
}

function ChoicePollDescription({ children, className, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} data-slot="choice-poll-description" {...props}>
      {children}
    </p>
  )
}

/* -----------------------------------------------------------------------------
 * Options Container
 * -------------------------------------------------------------------------- */

function ChoicePollOptions({ children, className, ...props }: ComponentProps<'div'>) {
  const { multiple } = useChoicePollContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return
    const options = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-slot="choice-poll-option"]:not([disabled])'))
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex = currentIndex
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = options.length - 1
        break
      default:
        break
    }
    options[nextIndex]?.focus()
  }, [])

  return (
    <div
      aria-multiselectable={multiple || undefined}
      className={cn('flex flex-col gap-2', className)}
      data-slot="choice-poll-options"
      onKeyDown={handleKeyDown}
      ref={containerRef}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * Option
 * -------------------------------------------------------------------------- */

function ChoicePollOption({ value, disabled: optionDisabled = false, fill = true, children, className, onClick, ...props }: ChoicePollOptionProps) {
  const { disabled: rootDisabled, hasVoted, showResults, isSelected, select, getPercentage, revealDuration } = useChoicePollContext()
  const reduced = useReducedMotion()

  const disabled = rootDisabled || optionDisabled
  const selected = isSelected(value)
  const percentage = getPercentage(value)
  const state: State = hasVoted ? 'voted' : selected ? 'selected' : 'idle'

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!(event.defaultPrevented || disabled)) select(value)
    },
    [onClick, disabled, select, value],
  )

  const optionContextValue = useMemo(() => ({ optionId: value, disabled, isSelected: selected, percentage }), [value, disabled, selected, percentage])

  return (
    <ChoicePollOptionContext.Provider value={optionContextValue}>
      <button
        aria-disabled={disabled || hasVoted}
        aria-selected={selected}
        className={cn(optionBase, optionState[state], className)}
        data-disabled={disabled ? true : undefined}
        data-percentage={percentage}
        data-selected={selected ? true : undefined}
        data-slot="choice-poll-option"
        data-state={state}
        data-value={value}
        disabled={disabled || hasVoted}
        onClick={handleClick}
        role="option"
        type="button"
        {...props}
      >
        {/* Progress bar background (scaleX instead of animating width) */}
        {showResults && fill && (
          <motion.span
            aria-hidden="true"
            className={cn('absolute inset-y-0 left-0 w-full origin-left', progressState[selected ? 'selected' : 'voted'])}
            initial={{ scaleX: reduced ? percentage / 100 : 0 }}
            animate={{ scaleX: percentage / 100 }}
            transition={{ duration: reduced ? 0 : revealDuration, ease: [0, 0, 0.58, 1] }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex w-full min-w-0 items-center gap-3">{children}</span>
      </button>
    </ChoicePollOptionContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Indicator (checkbox/radio visual)
 * -------------------------------------------------------------------------- */

function ChoicePollIndicator({ children, className, ...props }: ComponentProps<'span'>) {
  const { multiple, hasVoted } = useChoicePollContext()
  const { isSelected } = useChoicePollOptionContext()
  const state: State = hasVoted ? 'voted' : isSelected ? 'selected' : 'idle'

  return (
    <span
      aria-hidden="true"
      className={cn(indicatorBase, multiple ? 'rounded-md' : 'rounded-full', indicatorState[state], hasVoted && isSelected && 'text-[var(--poll-accent)]', className)}
      data-slot="choice-poll-indicator"
      data-state={state}
      {...props}
    >
      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
      {children}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Label
 * -------------------------------------------------------------------------- */

function ChoicePollLabel({ children, className, ...props }: ComponentProps<'span'>) {
  return (
    <span className={cn('min-w-0 flex-1 font-medium', className)} data-slot="choice-poll-label" {...props}>
      {children}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Progress (inline progress bar)
 * -------------------------------------------------------------------------- */

function ChoicePollProgress({ className, ...props }: ComponentProps<'span'>) {
  const { showResults, revealDuration } = useChoicePollContext()
  const { percentage, isSelected } = useChoicePollOptionContext()
  const reduced = useReducedMotion()
  if (!showResults) return null

  return (
    <span aria-hidden="true" className={cn('h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted', className)} data-slot="choice-poll-progress" {...props}>
      <motion.span
        className={cn('block h-full w-full origin-left rounded-full', isSelected ? 'bg-[var(--poll-accent)]' : 'bg-muted-foreground/30')}
        initial={{ scaleX: reduced ? percentage / 100 : 0 }}
        animate={{ scaleX: percentage / 100 }}
        transition={{ duration: reduced ? 0 : revealDuration, ease: [0, 0, 0.58, 1] }}
      />
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Percentage
 * -------------------------------------------------------------------------- */

function ChoicePollPercentage({ children, className, ...props }: ComponentProps<'span'>) {
  const { showResults, revealDuration } = useChoicePollContext()
  const { percentage } = useChoicePollOptionContext()
  const animatedPercentage = useAnimatedPercentage(percentage, showResults, revealDuration)
  if (!showResults) return null

  return (
    <span className={cn('min-w-[4ch] shrink-0 text-right text-sm font-medium text-muted-foreground tabular-nums', className)} data-slot="choice-poll-percentage" {...props}>
      {children ?? `${Math.round(animatedPercentage)}%`}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Footer
 * -------------------------------------------------------------------------- */

function ChoicePollFooter({ children, className, totalVotes, ...props }: ChoicePollFooterProps) {
  const { totalVotes: contextTotalVotes, hasVoted, showResults } = useChoicePollContext()
  const votes = totalVotes ?? contextTotalVotes
  if (!showResults && !children) return null

  return (
    <div className={cn('flex items-center justify-between gap-3 text-sm text-muted-foreground', className)} data-slot="choice-poll-footer" {...props}>
      {children ?? (
        <>
          <span className="tabular-nums">
            {votes.toLocaleString('en-US')} {votes === 1 ? 'vote' : 'votes'}
          </span>
          {hasVoted && (
            <span className="flex items-center gap-1.5 text-foreground">
              <Check className="h-3.5 w-3.5 text-[var(--poll-accent)]" />
              <span>You voted</span>
            </span>
          )}
        </>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * Hook / compound export
 * -------------------------------------------------------------------------- */

export function useChoicePoll() {
  return useChoicePollContext()
}

export const ChoicePoll = {
  Root: ChoicePollRoot,
  Header: ChoicePollHeader,
  Title: ChoicePollTitle,
  Description: ChoicePollDescription,
  Options: ChoicePollOptions,
  Option: ChoicePollOption,
  Indicator: ChoicePollIndicator,
  Label: ChoicePollLabel,
  Progress: ChoicePollProgress,
  Percentage: ChoicePollPercentage,
  Footer: ChoicePollFooter,
}

/* -----------------------------------------------------------------------------
 * PollResults: the compound parts assembled with Motif params
 * -------------------------------------------------------------------------- */

export interface PollOption {
  id: string
  label: ReactNode
  icon?: ReactNode
}

export type PollResultsProps = Partial<Options> & {
  title?: ReactNode
  description?: ReactNode
  options: PollOption[]
  votes?: Record<string, number>
  multiple?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  hasVoted?: boolean
  /** Rendered under the options before the vote (e.g. a submit button). */
  action?: ReactNode
  className?: string
  style?: CSSProperties
}

/** A ready-made ChoicePoll: question, options, and results that fill in once hasVoted is true. */
export function PollResults({ title, description, options: items, votes, multiple, value, defaultValue, onValueChange, hasVoted, action, className, style, ...props }: PollResultsProps) {
  const { accent, barStyle, radius, revealDuration, showVotes, indicator } = { ...defaults, ...props }
  const multi = multiple ?? indicator === 'checkbox'

  return (
    <ChoicePoll.Root
      accent={accent}
      className={className}
      hasVoted={hasVoted}
      multiple={multi}
      onValueChange={onValueChange}
      radius={radius}
      revealDuration={revealDuration}
      showResults
      style={style}
      value={value}
      defaultValue={defaultValue}
      votes={votes}
    >
      {(title || description) && (
        <ChoicePoll.Header>
          {title && <ChoicePoll.Title>{title}</ChoicePoll.Title>}
          {description && <ChoicePoll.Description>{description}</ChoicePoll.Description>}
        </ChoicePoll.Header>
      )}
      <ChoicePoll.Options aria-label={typeof title === 'string' ? title : undefined}>
        {items.map((item) => (
          <ChoicePoll.Option fill={barStyle === 'fill'} key={item.id} value={item.id}>
            {indicator !== 'none' && <ChoicePoll.Indicator />}
            {item.icon}
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <ChoicePoll.Label>{item.label}</ChoicePoll.Label>
              {barStyle === 'track' && <ChoicePoll.Progress />}
              <ChoicePoll.Percentage />
            </span>
          </ChoicePoll.Option>
        ))}
      </ChoicePoll.Options>
      {!hasVoted && action}
      {showVotes && <ChoicePoll.Footer />}
    </ChoicePoll.Root>
  )
}
