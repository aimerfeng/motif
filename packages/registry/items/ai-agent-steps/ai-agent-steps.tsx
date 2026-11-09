// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Julien Thibeaut
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/chain-of-thought.tsx
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/tool.tsx
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/loader.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import React, { createContext, useContext, useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#a78bfa',
  iconStyle: 'status',
  connector: 'line',
  radius: 10,
  showToolPayload: true,
  collapseDone: true,
  stepInterval: 1.6,
}
/* @motif:end */

// ---- 图标（替代 lucide-react） ----

type IconProps = { className?: string; style?: CSSProperties }

function Svg({ className, style, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

const ChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)
const Circle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
  </Svg>
)
const Loader2 = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 1 1-9-9" />
  </Svg>
)
const CheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.5 2.5L16 9.5" />
  </Svg>
)
const XCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-6 6M9 9l6 6" />
  </Svg>
)
const Settings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </Svg>
)
const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)
const FileText = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
)
const Terminal = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 10 3 2.5L7 15M12.5 15H17" />
  </Svg>
)
const PenLine = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
)
const Lightbulb = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </Svg>
)

// ---- Collapsible（替代 @radix-ui/react-collapsible：aria-expanded + grid-rows 展开动画） ----

type CollapsibleContextType = { open: boolean; setOpen: (open: boolean) => void; contentId: string }

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined)

function useCollapsible() {
  const context = useContext(CollapsibleContext)
  if (!context) throw new Error('Collapsible parts must be used within <Collapsible>')
  return context
}

type CollapsibleProps = React.ComponentProps<'div'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Collapsible({ open, defaultOpen = false, onOpenChange, children, ...props }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const contentId = useId()
  const isOpen = open ?? internalOpen
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }
  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen, contentId }}>
      <div data-state={isOpen ? 'open' : 'closed'} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ className, onClick, children, ...props }: React.ComponentProps<'button'>) {
  const { open, setOpen, contentId } = useCollapsible()
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? 'open' : 'closed'}
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(!open)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function CollapsibleContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { open, contentId } = useCollapsible()
  return (
    <div
      id={contentId}
      data-state={open ? 'open' : 'closed'}
      aria-hidden={!open}
      inert={!open}
      className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className={cn('min-h-0 overflow-hidden', className)} {...props}>
        {children}
      </div>
    </div>
  )
}

// ---- TextShimmerLoader（loader.tsx） ----

export function TextShimmerLoader({ text = 'Thinking', className, size = 'md' }: { text?: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return <span className={cn('aas-shimmer font-medium', textSizes[size], className)}>{text}</span>
}

// ---- ChainOfThought（chain-of-thought.tsx） ----

export type ChainOfThoughtItemProps = React.ComponentProps<'div'>

export const ChainOfThoughtItem = ({ children, className, ...props }: ChainOfThoughtItemProps) => (
  <div className={cn('text-muted-foreground text-sm', className)} {...props}>
    {children}
  </div>
)

export type ChainOfThoughtTriggerProps = React.ComponentProps<typeof CollapsibleTrigger> & {
  leftIcon?: React.ReactNode
  swapIconOnHover?: boolean
  /** 没有 leftIcon 时那颗圆点的样式（用来标出进行中的步骤）。 */
  dotClassName?: string
  dotStyle?: CSSProperties
}

export const ChainOfThoughtTrigger = ({ children, className, leftIcon, swapIconOnHover = true, dotClassName, dotStyle, ...props }: ChainOfThoughtTriggerProps) => (
  <CollapsibleTrigger
    className={cn(
      'group text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-start gap-1 rounded-sm text-left text-sm transition-colors',
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      {leftIcon ? (
        <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
          <span className={cn('transition-opacity', swapIconOnHover && 'group-hover:opacity-0 group-focus-visible:opacity-0')}>{leftIcon}</span>
          {swapIconOnHover && (
            <ChevronDown className="absolute size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:rotate-180" />
          )}
        </span>
      ) : (
        <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
          <Circle className={cn('size-2 fill-current', dotClassName)} style={dotStyle} />
        </span>
      )}
      <span>{children}</span>
    </div>
    {!leftIcon && <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />}
  </CollapsibleTrigger>
)

export type ChainOfThoughtContentProps = React.ComponentProps<typeof CollapsibleContent>

export const ChainOfThoughtContent = ({ children, className, ...props }: ChainOfThoughtContentProps) => {
  return (
    <CollapsibleContent className={cn('text-popover-foreground overflow-hidden', className)} {...props}>
      <div className="grid grid-cols-[min-content_minmax(0,1fr)] gap-x-4">
        <div className="aas-line ml-1.75 h-full w-px group-data-[last=true]:hidden" />
        <div className="ml-1.75 h-full w-px bg-transparent group-data-[last=false]:hidden" />
        <div className="mt-2 min-w-0 space-y-2">{children}</div>
      </div>
    </CollapsibleContent>
  )
}

export type ChainOfThoughtProps = {
  children: React.ReactNode
  className?: string
}

export function ChainOfThought({ children, className }: ChainOfThoughtProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={cn('space-y-0', className)}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {React.isValidElement(child) &&
            React.cloneElement(child as React.ReactElement<ChainOfThoughtStepProps>, {
              isLast: index === childrenArray.length - 1,
            })}
        </React.Fragment>
      ))}
    </div>
  )
}

export type ChainOfThoughtStepProps = {
  children: React.ReactNode
  className?: string
  isLast?: boolean
}

export const ChainOfThoughtStep = ({ children, className, isLast = false, ...props }: ChainOfThoughtStepProps & CollapsibleProps) => {
  return (
    <Collapsible className={cn('group', className)} data-last={isLast} {...props}>
      {children}
      <div className="flex justify-start group-data-[last=true]:hidden">
        <div className="aas-line ml-1.75 h-4 w-px" />
      </div>
    </Collapsible>
  )
}

// ---- Tool（tool.tsx） ----

export type ToolPart = {
  type: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

export type ToolProps = {
  toolPart: ToolPart
  defaultOpen?: boolean
  className?: string
  style?: CSSProperties
}

/** 给 JSON 文本上色（替代上游示例里的 shiki）：键、字符串、数字 / 布尔各一种颜色。 */
function highlightJson(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index
    if (index > last) nodes.push(text.slice(last, index))
    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(
        <span key={index} className="text-sky-700 dark:text-sky-300">
          {match[1]}
        </span>,
        match[2],
      )
    } else if (match[1] !== undefined) {
      nodes.push(
        <span key={index} className="text-emerald-700 dark:text-emerald-300">
          {match[1]}
        </span>,
      )
    } else {
      nodes.push(
        <span key={index} className="text-amber-700 dark:text-amber-300">
          {match[0]}
        </span>,
      )
    }
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export const Tool = ({ toolPart, defaultOpen = false, className, style }: ToolProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const { state, input, output, toolCallId } = toolPart

  const getStateIcon = () => {
    switch (state) {
      case 'input-streaming':
        return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500 motion-reduce:animate-none" />
      case 'input-available':
        return <Settings className="h-4 w-4 shrink-0 text-orange-500" />
      case 'output-available':
        return <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
      case 'output-error':
        return <XCircle className="h-4 w-4 shrink-0 text-red-500" />
      default:
        return <Settings className="text-muted-foreground h-4 w-4 shrink-0" />
    }
  }

  const getStateBadge = () => {
    const baseClasses = 'shrink-0 px-2 py-1 rounded-full text-xs font-medium'
    switch (state) {
      case 'input-streaming':
        return <span className={cn(baseClasses, 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>Processing</span>
      case 'input-available':
        return <span className={cn(baseClasses, 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400')}>Ready</span>
      case 'output-available':
        return <span className={cn(baseClasses, 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}>Completed</span>
      case 'output-error':
        return <span className={cn(baseClasses, 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>Error</span>
      default:
        return <span className={cn(baseClasses, 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400')}>Pending</span>
    }
  }

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <div className={cn('border-border mt-3 overflow-hidden rounded-lg border', className)} style={style}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="bg-background hover:bg-accent hover:text-accent-foreground flex h-auto w-full items-center justify-between gap-2 px-3 py-2 text-sm font-normal transition-colors focus-visible:ring-inset">
          <div className="flex min-w-0 items-center gap-2">
            {getStateIcon()}
            <span className="truncate font-mono text-sm font-medium">{toolPart.type}</span>
            {getStateBadge()}
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0', isOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border bg-background space-y-3 border-t p-3">
            {input && Object.keys(input).length > 0 && (
              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Input</h4>
                <div className="bg-background rounded border p-2 font-mono text-sm break-words">
                  {Object.entries(input).map(([key, value]) => (
                    <div key={key} className="mb-1 last:mb-0">
                      <span className="text-muted-foreground">{key}:</span>{' '}
                      <span className={typeof value === 'string' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {output && (
              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Output</h4>
                <div className="bg-background max-h-60 overflow-auto rounded border p-2 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-words">{highlightJson(formatValue(output))}</pre>
                </div>
              </div>
            )}

            {state === 'output-error' && toolPart.errorText && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-500">Error</h4>
                <div className="bg-background rounded border border-red-200 p-2 text-sm dark:border-red-950 dark:bg-red-900/20">{toolPart.errorText}</div>
              </div>
            )}

            {state === 'input-streaming' && <div className="text-muted-foreground text-sm">Processing tool call...</div>}

            {toolCallId && (
              <div className="text-muted-foreground border-t pt-2 text-xs">
                <span className="font-mono">Call ID: {toolCallId}</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ---- AgentRunSteps：把上面几块组合成一条随 agent 推进而生长的时间线 ----

export type AgentStepStatus = 'pending' | 'running' | 'done' | 'error'
export type AgentStepIcon = 'search' | 'read' | 'tool' | 'draft' | 'think'

export type AgentStep = {
  id: string
  title: string
  status: AgentStepStatus
  /** iconStyle 为 topic 时完成后显示的图标。 */
  icon?: AgentStepIcon
  /** 子步骤（每条一行）。 */
  items?: React.ReactNode[]
  /** 这一步里的工具调用，渲染成带状态徽章的卡片。 */
  tools?: ToolPart[]
}

export type AgentRunStepsProps = Partial<typeof defaults> & {
  steps: AgentStep[]
  className?: string
  style?: CSSProperties
  /** 时间线区域的 aria-label。 */
  label?: string
}

const TOPIC_ICONS: Record<AgentStepIcon, (p: IconProps) => React.ReactElement> = {
  search: Search,
  read: FileText,
  tool: Terminal,
  draft: PenLine,
  think: Lightbulb,
}

function StepIcon({ step, iconStyle }: { step: AgentStep; iconStyle: string }) {
  const accent = { color: 'var(--aas-accent)' }
  if (step.status === 'running') return <Loader2 className="size-4 animate-spin motion-reduce:animate-none" style={accent} />
  if (step.status === 'error') return <XCircle className="size-4 text-red-500" />
  if (iconStyle === 'topic') {
    const Icon = TOPIC_ICONS[step.icon ?? 'think']
    return <Icon className={cn('size-4', step.status === 'pending' && 'opacity-50')} />
  }
  if (step.status === 'pending') return <Circle className="size-4 opacity-50" />
  return <CheckCircle className="size-4" style={accent} />
}

export function AgentRunSteps({ steps, className, style, label = 'Agent steps', ...props }: AgentRunStepsProps) {
  const { accent, iconStyle, connector, radius, showToolPayload, collapseDone } = { ...defaults, ...props }
  // 用户手动展开 / 折叠只对当时的状态有效：步骤状态一变，回到自动展开规则
  const [overrides, setOverrides] = useState<Record<string, { open: boolean; status: AgentStepStatus }>>({})
  const busy = steps.some((step) => step.status === 'running')

  return (
    <div
      role="log"
      aria-label={label}
      aria-busy={busy}
      data-connector={connector}
      className={cn('w-full', className)}
      style={cssVars({ '--aas-accent': accent, '--aas-line': `color-mix(in oklab, ${accent} 40%, transparent)` }, style)}
    >
      <ChainOfThought>
        {steps.map((step) => {
          const auto = !collapseDone || step.status === 'running' || step.status === 'error'
          const override = overrides[step.id]
          const open = override && override.status === step.status ? override.open : auto
          const running = step.status === 'running'
          return (
            <ChainOfThoughtStep
              key={step.id}
              open={open}
              onOpenChange={(next) => setOverrides((prev) => ({ ...prev, [step.id]: { open: next, status: step.status } }))}
            >
              <ChainOfThoughtTrigger
                leftIcon={iconStyle === 'dot' ? undefined : <StepIcon step={step} iconStyle={iconStyle} />}
                swapIconOnHover={!running}
                dotClassName={cn(running && 'animate-pulse motion-reduce:animate-none', step.status === 'error' && 'text-red-500', step.status === 'pending' && 'opacity-50')}
                dotStyle={running ? { color: 'var(--aas-accent)' } : undefined}
                className={cn(step.status === 'pending' && 'opacity-60')}
              >
                {running ? <TextShimmerLoader text={step.title} /> : step.title}
              </ChainOfThoughtTrigger>
              <ChainOfThoughtContent>
                {(step.items ?? []).map((item, i) => (
                  <ChainOfThoughtItem key={i}>{item}</ChainOfThoughtItem>
                ))}
                {(step.tools ?? []).map((tool, i) => (
                  <Tool
                    key={`${tool.toolCallId ?? i}-${showToolPayload ? 'open' : 'closed'}`}
                    toolPart={tool}
                    defaultOpen={showToolPayload}
                    className="first:mt-0"
                    style={{ borderRadius: radius }}
                  />
                ))}
              </ChainOfThoughtContent>
            </ChainOfThoughtStep>
          )
        })}
      </ChainOfThought>
    </div>
  )
}
