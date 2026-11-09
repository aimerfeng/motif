// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/ui/bubble.tsx
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/ui/message.tsx
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/ui/marker.tsx
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/ui/message-scroller.tsx
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/ui/attachment.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import * as React from 'react'

/* @motif:defaults */
export const defaults = {
  bubbleStyle: 'default',
  accent: '#8b7cf6',
  radius: 16,
  density: 'comfortable',
  showReactions: true,
  showAvatars: true,
  spring: {
    visualDuration: 0.35,
    bounce: 0.2,
  },
  autoplay: true,
}
/* @motif:end */

/* ------------------------------------------------------------------ */
/* Bubble (ui/bubble.tsx)                                              */
/* ------------------------------------------------------------------ */

function BubbleGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="bubble-group" className={cn('flex min-w-0 flex-col gap-2', className)} {...props} />
}

const bubbleBase =
  'group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full'

const bubbleVariants = {
  default:
    '*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80',
  secondary:
    '*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
  muted:
    '*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]',
  tinted:
    '*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]',
  outline:
    '*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30',
  ghost:
    'border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50',
  destructive:
    '*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30',
} as const

export type BubbleVariant = keyof typeof bubbleVariants

function Bubble({
  variant = 'default',
  align = 'start',
  className,
  ...props
}: React.ComponentProps<'div'> & { variant?: BubbleVariant; align?: 'start' | 'end' }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleBase, bubbleVariants[variant], className)}
      {...props}
    />
  )
}

function BubbleContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="bubble-content"
      className={cn(
        'w-fit max-w-full min-w-0 overflow-hidden rounded-[var(--bubble-radius,1rem)] border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    />
  )
}

const reactionsSide = { top: 'top-0 -translate-y-3/4', bottom: 'bottom-0 translate-y-3/4' } as const
const reactionsAlign = { start: 'left-3', end: 'right-3' } as const

function BubbleReactions({
  side = 'bottom',
  align = 'end',
  className,
  ...props
}: React.ComponentProps<'div'> & { align?: 'start' | 'end'; side?: 'top' | 'bottom' }) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(
        'absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0',
        reactionsSide[side],
        reactionsAlign[align],
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Message (ui/message.tsx)                                            */
/* ------------------------------------------------------------------ */

function MessageGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="message-group" className={cn('flex min-w-0 flex-col gap-2', className)} {...props} />
}

function Message({ className, align = 'start', ...props }: React.ComponentProps<'div'> & { align?: 'start' | 'end' }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn('group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse', className)}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        'flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8',
        className,
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-content"
      className={cn('flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end', className)}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-header"
      className={cn('flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0', className)}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Marker (ui/marker.tsx)                                              */
/* ------------------------------------------------------------------ */

const markerBase =
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground"
const markerVariants = {
  default: '',
  separator:
    'before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border',
  border: 'border-b border-border pb-2',
} as const

function Marker({ className, variant = 'default', ...props }: React.ComponentProps<'div'> & { variant?: keyof typeof markerVariants }) {
  return <div data-slot="marker" data-variant={variant} className={cn(markerBase, markerVariants[variant], className)} {...props} />
}

function MarkerIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="marker-icon" aria-hidden="true" className={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        'min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Attachment (ui/attachment.tsx)                                      */
/* ------------------------------------------------------------------ */

function Attachment({ className, state = 'done', ...props }: React.ComponentProps<'div'> & { state?: 'idle' | 'uploading' | 'done' | 'error' }) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size="default"
      data-orientation="horizontal"
      className={cn(
        'group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 items-center gap-2 rounded-xl border bg-card p-2 pr-3 text-sm text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed',
        className,
      )}
      {...props}
    />
  )
}

function AttachmentMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-media"
      className={cn(
        "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function AttachmentContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="attachment-content" className={cn('max-w-full min-w-0 flex-1 leading-tight', className)} {...props} />
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="attachment-title" className={cn('block max-w-full min-w-0 truncate font-medium', className)} {...props} />
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="attachment-description"
      className={cn('mt-0.5 block min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80', className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* MessageScroller (ui/message-scroller.tsx)                           */
/* Hand-rolled stick-to-bottom in place of @shadcn/react.              */
/* ------------------------------------------------------------------ */

type ScrollerCtx = {
  viewportRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  atEnd: boolean
  scrollToEnd: (smooth?: boolean) => void
}
const ScrollerContext = React.createContext<ScrollerCtx | null>(null)

function useMessageScroller() {
  const ctx = React.useContext(ScrollerContext)
  if (!ctx) throw new Error('useMessageScroller must be used inside <MessageScroller>')
  return ctx
}

function MessageScroller({ className, children, ...props }: React.ComponentProps<'div'>) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const stick = React.useRef(true)
  const [atEnd, setAtEnd] = React.useState(true)
  const reduced = useReducedMotion()

  const scrollToEnd = React.useCallback(
    (smooth = true) => {
      const el = viewportRef.current
      if (!el) return
      stick.current = true
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduced ? 'smooth' : 'auto' })
    },
    [reduced],
  )

  React.useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const measure = () => {
      const end = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 8
      stick.current = end
      setAtEnd(end)
    }
    const ro = new ResizeObserver(() => {
      if (stick.current) viewport.scrollTop = viewport.scrollHeight
      measure()
    })
    ro.observe(content)
    ro.observe(viewport)
    viewport.addEventListener('scroll', measure, { passive: true })
    viewport.scrollTop = viewport.scrollHeight
    return () => {
      ro.disconnect()
      viewport.removeEventListener('scroll', measure)
    }
  }, [])

  const ctx = React.useMemo(() => ({ viewportRef, contentRef, atEnd, scrollToEnd }), [atEnd, scrollToEnd])
  return (
    <ScrollerContext.Provider value={ctx}>
      <div
        data-slot="message-scroller"
        className={cn('group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden', className)}
        {...props}
      >
        {children}
      </div>
    </ScrollerContext.Provider>
  )
}

function MessageScrollerViewport({ className, ...props }: React.ComponentProps<'div'>) {
  const { viewportRef } = useMessageScroller()
  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      role="log"
      aria-live="polite"
      tabIndex={0}
      className={cn(
        'size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain outline-none [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
        className,
      )}
      {...props}
    />
  )
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { contentRef } = useMessageScroller()
  return <div ref={contentRef} data-slot="message-scroller-content" className={cn('flex h-max min-h-full flex-col gap-8', className)} {...props} />
}

function MessageScrollerItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="message-scroller-item" className={cn('min-w-0 shrink-0', className)} {...props} />
}

function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

function MessageScrollerButton({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { atEnd, scrollToEnd } = useMessageScroller()
  return (
    <button
      type="button"
      data-slot="message-scroller-button"
      data-direction="end"
      data-active={!atEnd}
      aria-hidden={atEnd}
      tabIndex={atEnd ? -1 : 0}
      onClick={() => scrollToEnd(true)}
      className={cn(
        'absolute bottom-4 left-1/2 inline-flex h-8 -translate-x-1/2 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm outline-none transition-[translate,scale,opacity,background-color] duration-200 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[active=false]:pointer-events-none data-[active=false]:translate-y-full data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">Scroll to end</span>
        </>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* ChatThread: composes the primitives above                          */
/* ------------------------------------------------------------------ */

export type ChatAttachment = { name: string; meta: string; kind?: 'doc' | 'image' | 'sheet' }
export type ChatMessage = {
  type: 'message'
  id: string
  author: string
  /** 'end' is the current user. */
  align?: 'start' | 'end'
  text?: string
  time?: string
  reactions?: string[]
  attachments?: ChatAttachment[]
  /** Avatar gradient hue (0–360). */
  hue?: number
}
export type ChatMarker = { type: 'day' | 'system'; id: string; text: string }
export type ChatItem = ChatMessage | ChatMarker

export type ChatThreadProps = Partial<typeof defaults> & {
  className?: string
  style?: React.CSSProperties
  items?: ChatItem[]
  /** Name shown in the typing indicator; leave empty to hide it. */
  typing?: string | null
}

function hexInk(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b10' : '#ffffff'
}

function FileIcon({ kind }: { kind: ChatAttachment['kind'] }) {
  if (kind === 'image')
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      {kind === 'sheet' ? <path d="M8 13h8M8 17h8M12 11v8" /> : <path d="M16 13H8M16 17H8M10 9H8" />}
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function Avatar({ name, hue = 260 }: { name: string; hue?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <MessageAvatar
      aria-hidden
      className="size-8 text-[11px] font-semibold text-white"
      style={{ background: `linear-gradient(135deg, oklch(0.62 0.15 ${hue}), oklch(0.45 0.15 ${hue + 40}))` }}
    >
      {initials}
    </MessageAvatar>
  )
}

function TypingDots({ reduced }: { reduced: boolean }) {
  return (
    <span className="flex items-center gap-1 py-1.5" aria-hidden>
      {[0, 1, 2].map((i) =>
        reduced ? (
          <span key={i} className="size-1.5 rounded-full bg-current opacity-60" />
        ) : (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-current"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.16 }}
          />
        ),
      )}
    </span>
  )
}

type Run = { kind: 'run'; id: string; author: string; align: 'start' | 'end'; hue?: number; messages: ChatMessage[] }

function groupRuns(items: ChatItem[]): (Run | ChatMarker)[] {
  const out: (Run | ChatMarker)[] = []
  for (const item of items) {
    if (item.type !== 'message') {
      out.push(item)
      continue
    }
    const last = out[out.length - 1]
    if (last && 'kind' in last && last.author === item.author) last.messages.push(item)
    else out.push({ kind: 'run', id: item.id, author: item.author, align: item.align ?? 'start', hue: item.hue, messages: [item] })
  }
  return out
}

export function ChatThread({ className, style, items = [], typing = null, ...props }: ChatThreadProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion() ?? false
  const runs = React.useMemo(() => groupRuns(items), [items])
  const variant = (options.bubbleStyle in bubbleVariants ? options.bubbleStyle : 'default') as BubbleVariant
  const compact = options.density === 'compact'
  const transition = reduced ? { duration: 0.15 } : { type: 'spring' as const, ...options.spring }
  const enter = reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }

  const vars = {
    '--primary': options.accent,
    '--primary-foreground': hexInk(options.accent),
    '--bubble-radius': `${options.radius}px`,
    '--tail-radius': `${Math.max(3, Math.round(options.radius / 4))}px`,
    ...style,
  } as React.CSSProperties

  return (
    <MessageScroller className={cn('bg-card text-card-foreground', className)} style={vars}>
      <MessageScrollerViewport aria-label="Conversation">
        <MessageScrollerContent className={cn('px-3 py-4 sm:px-4', compact ? 'gap-3' : 'gap-5')}>
          {runs.map((run) => {
            if (!('kind' in run)) {
              return (
                <MessageScrollerItem key={run.id}>
                  {run.type === 'day' ? (
                    <Marker variant="separator" className="text-xs font-medium" role="separator">
                      <MarkerContent>{run.text}</MarkerContent>
                    </Marker>
                  ) : (
                    <motion.div initial={enter} animate={{ opacity: 1, y: 0, scale: 1 }} transition={transition}>
                      <Marker className="justify-center text-xs">
                        <MarkerIcon>
                          <InfoIcon />
                        </MarkerIcon>
                        <MarkerContent>{run.text}</MarkerContent>
                      </Marker>
                    </motion.div>
                  )}
                </MessageScrollerItem>
              )
            }
            const mine = run.align === 'end'
            const lastTime = run.messages[run.messages.length - 1]?.time
            return (
              <MessageScrollerItem key={run.id}>
                <Message align={run.align}>
                  {options.showAvatars && !mine ? <Avatar name={run.author} hue={run.hue} /> : null}
                  <MessageContent className={compact ? 'gap-1.5' : undefined}>
                    {!mine ? <MessageHeader>{run.author}</MessageHeader> : null}
                    <BubbleGroup className={compact ? 'gap-1' : 'gap-1.5'}>
                      {run.messages.map((m, i) => {
                        const tail = i === run.messages.length - 1
                        const reactions = options.showReactions && m.reactions?.length ? m.reactions : null
                        return (
                          <motion.div
                            key={m.id}
                            initial={enter}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={transition}
                            className={cn('flex min-w-0 flex-col gap-1.5', mine ? 'items-end' : 'items-start', mine ? 'origin-bottom-right' : 'origin-bottom-left')}
                          >
                            {m.attachments?.map((a) => (
                              <Attachment key={a.name} className="max-w-[80%]">
                                <AttachmentMedia>
                                  <FileIcon kind={a.kind} />
                                </AttachmentMedia>
                                <AttachmentContent>
                                  <AttachmentTitle>{a.name}</AttachmentTitle>
                                  <AttachmentDescription>{a.meta}</AttachmentDescription>
                                </AttachmentContent>
                              </Attachment>
                            ))}
                            {m.text ? (
                              <Bubble variant={mine ? variant : 'muted'} align={run.align} className={cn(reactions && 'mb-3')}>
                                <BubbleContent
                                  className={cn(
                                    compact && 'py-1.5',
                                    tail && (mine ? 'rounded-br-[var(--tail-radius)]' : 'rounded-bl-[var(--tail-radius)]'),
                                  )}
                                >
                                  {m.text}
                                </BubbleContent>
                                {reactions ? (
                                  <BubbleReactions align={mine ? 'start' : 'end'} aria-label={`Reactions: ${reactions.join(' ')}`}>
                                    {reactions.map((r) => (
                                      <span key={r} className="text-xs leading-5">
                                        {r}
                                      </span>
                                    ))}
                                  </BubbleReactions>
                                ) : null}
                              </Bubble>
                            ) : null}
                          </motion.div>
                        )
                      })}
                    </BubbleGroup>
                    {lastTime ? <MessageFooter className="font-normal">{lastTime}</MessageFooter> : null}
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            )
          })}
          {typing ? (
            <MessageScrollerItem>
              <motion.div initial={enter} animate={{ opacity: 1, y: 0, scale: 1 }} transition={transition}>
                <Message align="start" aria-label={`${typing} is typing`} role="status">
                  {options.showAvatars ? <Avatar name={typing} hue={items.find((m): m is ChatMessage => m.type === 'message' && m.author === typing)?.hue} /> : null}
                  <MessageContent>
                    <Bubble variant="muted">
                      <BubbleContent className="text-muted-foreground">
                        <TypingDots reduced={reduced} />
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </motion.div>
            </MessageScrollerItem>
          ) : null}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton>
        <ArrowDownIcon />
        Jump to latest
      </MessageScrollerButton>
    </MessageScroller>
  )
}

export {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
  Marker,
  MarkerIcon,
  MarkerContent,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
}
