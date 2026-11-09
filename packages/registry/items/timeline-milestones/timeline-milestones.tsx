// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/ui/timeline.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { createContext, useCallback, useContext, useState, type CSSProperties, type HTMLAttributes } from 'react'

/* @motif:defaults */
export const defaults = {
  orientation: 'vertical',
  currentStep: 3,
  indicator: 'check',
  datePosition: 'above',
  showDescriptions: true,
  accent: '#e4e4e7',
}
/* @motif:end */

// Types
type TimelineContextValue = {
  activeStep: number
  setActiveStep: (step: number) => void
}

// Context
const TimelineContext = createContext<TimelineContextValue | undefined>(undefined)

const useTimeline = () => {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error('useTimeline must be used within a Timeline')
  }
  return context
}

// Components
interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  orientation?: 'horizontal' | 'vertical'
}

function Timeline({ defaultValue = 1, value, onValueChange, orientation = 'vertical', className, ...props }: TimelineProps) {
  const [activeStep, setInternalStep] = useState(defaultValue)

  const setActiveStep = useCallback(
    (step: number) => {
      if (value === undefined) {
        setInternalStep(step)
      }
      onValueChange?.(step)
    },
    [value, onValueChange],
  )

  const currentStep = value ?? activeStep

  return (
    <TimelineContext.Provider value={{ activeStep: currentStep, setActiveStep }}>
      <div
        role="list"
        className={cn(
          'group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
          className,
        )}
        data-orientation={orientation}
        data-slot="timeline"
        {...props}
      />
    </TimelineContext.Provider>
  )
}

// TimelineContent
function TimelineContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-muted-foreground text-sm', className)} data-slot="timeline-content" {...props} />
}

// TimelineDate
function TimelineDate({ className, ...props }: HTMLAttributes<HTMLTimeElement> & { dateTime?: string }) {
  return (
    <time
      className={cn('mb-1 block font-medium text-muted-foreground text-xs group-data-[orientation=vertical]/timeline:max-sm:h-4', className)}
      data-slot="timeline-date"
      {...props}
    />
  )
}

// TimelineHeader
function TimelineHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} data-slot="timeline-header" {...props} />
}

// TimelineIndicator
function TimelineIndicator({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute size-4 rounded-full border-2 border-[var(--tl-accent-20)] transition-[background-color,border-color,color] duration-300 motion-reduce:transition-none group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=vertical]/timeline:top-0 group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-completed/timeline-item:border-[var(--tl-accent)]',
        className,
      )}
      data-slot="timeline-indicator"
      {...props}
    >
      {children}
    </div>
  )
}

// TimelineItem
interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  step: number
}

function TimelineItem({ step, className, ...props }: TimelineItemProps) {
  const { activeStep } = useTimeline()

  return (
    <div
      role="listitem"
      aria-current={step === activeStep ? 'step' : undefined}
      className={cn(
        'group/timeline-item relative flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere] group-data-[orientation=vertical]/timeline:ms-8 group-data-[orientation=horizontal]/timeline:mt-8 group-data-[orientation=horizontal]/timeline:not-last:pe-8 group-data-[orientation=vertical]/timeline:not-last:pb-12 has-[+[data-completed]]:[&_[data-slot=timeline-separator]]:bg-[var(--tl-accent)]',
        className,
      )}
      data-completed={step <= activeStep || undefined}
      data-slot="timeline-item"
      {...props}
    />
  )
}

// TimelineSeparator
function TimelineSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute self-start bg-[var(--tl-accent-10)] transition-[background-color] duration-300 motion-reduce:transition-none group-last/timeline-item:hidden group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=horizontal]/timeline:w-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=horizontal]/timeline:translate-x-4.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:translate-y-4.5',
        className,
      )}
      data-slot="timeline-separator"
      {...props}
    />
  )
}

// TimelineTitle
function TimelineTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-medium text-sm text-foreground', className)} data-slot="timeline-title" {...props} />
}

export { Timeline, TimelineContent, TimelineDate, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator, TimelineTitle }

function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!
  const value = Number.parseInt(digits, 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

/** 实心指示器里的对勾取白色或近黑色里对比度高的那个。 */
function inkOn(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return '#ffffff'
  return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.051 ? '#ffffff' : '#030304'
}

export type Milestone = { id: number; title: string; date?: string; description?: string }

const ITEMS: Milestone[] = [
  {
    date: 'Mar 15, 2024',
    description: 'Initial team meeting and project scope definition. Established key milestones and resource allocation.',
    id: 1,
    title: 'Project Kickoff',
  },
  {
    date: 'Mar 22, 2024',
    description: 'Completed wireframes and user interface mockups. Stakeholder review and feedback incorporated.',
    id: 2,
    title: 'Design Phase',
  },
  {
    date: 'Apr 5, 2024',
    description: 'Backend API implementation and frontend component development in progress.',
    id: 3,
    title: 'Development Sprint',
  },
  {
    date: 'Apr 19, 2024',
    description: 'Quality assurance testing, performance optimization, and production deployment preparation.',
    id: 4,
    title: 'Testing & Deployment',
  },
]

export type MilestoneTimelineProps = Partial<typeof defaults> & {
  items?: Milestone[]
  className?: string
  style?: CSSProperties
}

/**
 * 里程碑时间线：上游 Origin UI 的 Timeline 原语（去掉 Radix Slot）加上 comp-530 ~ 541 的几种排法：
 * 日期在标题上方 / 描述下方 / 左侧一栏，圆点或对勾指示器，竖排或横排。到 currentStep 为止的项目算完成。
 */
export function MilestoneTimeline({ items = ITEMS, className, style, ...props }: MilestoneTimelineProps) {
  const options = { ...defaults, ...props }
  const { orientation, currentStep, indicator, showDescriptions, accent } = options
  const horizontal = orientation === 'horizontal'
  const datePosition = horizontal && options.datePosition === 'side' ? 'above' : options.datePosition
  const check = indicator === 'check'
  const side = datePosition === 'side'

  return (
    <Timeline
      value={currentStep}
      orientation={horizontal ? 'horizontal' : 'vertical'}
      className={className}
      style={cssVars(
        {
          '--tl-accent': accent,
          '--tl-accent-20': `color-mix(in oklab, ${accent} 20%, transparent)`,
          '--tl-accent-10': `color-mix(in oklab, ${accent} 14%, transparent)`,
          '--tl-ink': inkOn(accent),
        },
        style,
      )}
    >
      {items.map((item) => {
        const date = item.date ? <TimelineDate className={cn(datePosition === 'below' && 'mt-2 mb-0', side && 'sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right')}>{item.date}</TimelineDate> : null
        return (
          <TimelineItem
            key={item.id}
            step={item.id}
            className={cn(
              horizontal && 'group-data-[orientation=horizontal]/timeline:not-last:pe-4 sm:group-data-[orientation=horizontal]/timeline:not-last:pe-8',
              check && 'group-data-[orientation=vertical]/timeline:ms-10',
              side && (check ? 'sm:group-data-[orientation=vertical]/timeline:ms-34' : 'sm:group-data-[orientation=vertical]/timeline:ms-32'),
            )}
          >
            <TimelineHeader>
              <TimelineSeparator
                className={cn(
                  check &&
                    'group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/timeline:translate-x-6.5',
                )}
              />
              {datePosition !== 'below' && date}
              <TimelineTitle className={cn(!check && datePosition === 'below' && '-mt-0.5', side && !check && 'sm:-mt-0.5', check && datePosition === 'below' && 'mt-0.5')}>
                {item.title}
              </TimelineTitle>
              <TimelineIndicator
                className={cn(
                  check &&
                    'flex size-6 items-center justify-center group-data-[orientation=vertical]/timeline:-left-7 group-data-completed/timeline-item:border-transparent group-data-completed/timeline-item:bg-[var(--tl-accent)] group-data-completed/timeline-item:text-[var(--tl-ink)]',
                )}
              >
                {check && (
                  <svg className="group-not-data-completed/timeline-item:hidden" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </TimelineIndicator>
            </TimelineHeader>
            {(showDescriptions && item.description) || datePosition === 'below' ? (
              <TimelineContent>
                {showDescriptions && item.description}
                {datePosition === 'below' && date}
              </TimelineContent>
            ) : null}
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
