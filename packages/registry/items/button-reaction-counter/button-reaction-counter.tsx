// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-102.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  kind: 'vote',
  layout: 'horizontal',
  initialCount: 235,
  activeColor: '#f97316',
  rollDuration: 0.35,
  size: 'md',
  radius: 6,
}
/* @motif:end */

type Vote = -1 | 0 | 1

export type ReactionCounterProps = Partial<typeof defaults> & {
  /** -1 = 踩，0 = 未选，1 = 赞 / 喜欢 / 收藏。 */
  value?: Vote
  defaultValue?: Vote
  onValueChange?: (value: Vote) => void
  /** 按钮上的文字（like / star 与 vote 的 split 布局）。 */
  label?: string
  className?: string
  style?: CSSProperties
}

// 上游 ui/button 的 cva 基础类与 outline 变体（去掉 radix Slot 与 cva）。
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-none transition-[color,background-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
const outline = 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground'
const HEIGHT: Record<string, number> = { sm: 32, md: 36, lg: 40 }

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  )
}

function ThumbsUp({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  )
}

/** 数字滚动：变大从下往上滚入，变小从上往下；减少动态效果时只淡入淡出。 */
function RollingCount({ count, duration }: { count: number; duration: number }) {
  const reduced = useReducedMotion()
  const prev = useRef(count)
  const [dir, setDir] = useState(1)
  if (prev.current !== count) {
    setDir(count > prev.current ? 1 : -1)
    prev.current = count
  }
  const offset = reduced ? 0 : dir * 100
  return (
    <span className="relative inline-grid overflow-hidden tabular-nums">
      <AnimatePresence initial={false} mode="popLayout" custom={offset}>
        <motion.span
          key={count}
          custom={offset}
          className="col-start-1 row-start-1"
          variants={{
            enter: (o: number) => ({ y: `${o}%`, opacity: 0 }),
            center: { y: '0%', opacity: 1 },
            exit: (o: number) => ({ y: `${-o}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduced ? 0.12 : duration, ease: [0.22, 1, 0.36, 1] }}
        >
          {count.toLocaleString('en-US')}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Segment({ children }: { children: ReactNode }) {
  // comp-117 的计数段：左侧一条 1px 分隔线
  return (
    <span className="relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 font-medium text-muted-foreground text-xs before:absolute before:inset-0 before:left-0 before:w-px before:bg-input">
      {children}
    </span>
  )
}

/** 投票 / 点赞 / 收藏计数按钮：按下切换状态（aria-pressed），图标填色，数字上下滚动。 */
export function ReactionCounter({ value, defaultValue = 0, onValueChange, label, className, style, ...props }: ReactionCounterProps) {
  const { kind, layout, initialCount, activeColor, rollDuration, size, radius } = { ...defaults, ...props }
  const [inner, setInner] = useState<Vote>(defaultValue)
  const current = value ?? inner
  const set = (next: Vote) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const count = Math.max(0, initialCount + current)
  const h = HEIGHT[size] ?? 36
  const r = Math.min(radius, h / 2)
  const vertical = layout === 'vertical'
  // 激活时只给图标上色、底色轻染，文字仍用 foreground，保证任何颜色下都可读。
  const accent: CSSProperties = { color: activeColor, backgroundColor: `color-mix(in oklab, ${activeColor} 16%, var(--background))` }
  const roll = <RollingCount count={count} duration={rollDuration} />
  const live = (
    <span className="sr-only" aria-live="polite">
      {count}
    </span>
  )

  // 分段圆角：上游用 first:rounded-s-md / last:rounded-e-md，这里按参数和方向计算。
  const seg = (pos: 'first' | 'mid' | 'last' | 'only'): CSSProperties => {
    if (pos === 'only') return { borderRadius: r }
    if (pos === 'mid') return { borderRadius: 0 }
    const first = pos === 'first'
    if (vertical) return first ? { borderRadius: `${r}px ${r}px 0 0` } : { borderRadius: `0 0 ${r}px ${r}px` }
    return first ? { borderStartStartRadius: r, borderEndStartRadius: r } : { borderStartEndRadius: r, borderEndEndRadius: r }
  }

  if (kind === 'vote') {
    if (layout === 'split') {
      const text = label ?? 'Upvote'
      return (
        <button
          type="button"
          aria-pressed={current === 1}
          aria-label={`${text}, ${count}`}
          onClick={() => set(current === 1 ? 0 : 1)}
          className={cn(base, outline, 'py-0 pe-0 ps-3', className)}
          style={{ height: h, ...seg('only'), ...style }}
        >
          <span className="inline-flex transition-[color]" style={current === 1 ? { color: activeColor } : undefined}>
            <Chevron up />
          </span>
          {text}
          <Segment>{roll}</Segment>
          {live}
        </button>
      )
    }
    return (
      <div
        role="group"
        aria-label="Vote"
        className={cn('inline-flex shadow-xs', vertical ? 'flex-col -space-y-px' : '-space-x-px rtl:space-x-reverse', className)}
        style={{ borderRadius: r, ...style }}
      >
        <button
          type="button"
          aria-label="Upvote"
          aria-pressed={current === 1}
          onClick={() => set(current === 1 ? 0 : 1)}
          className={cn(base, outline, 'relative shadow-none focus-visible:z-10')}
          style={{ width: h, height: h, ...seg('first'), ...(current === 1 ? accent : null) }}
        >
          <Chevron up />
        </button>
        <span
          className={cn('flex items-center justify-center border border-input bg-background font-medium text-sm', vertical ? 'py-1.5' : 'px-3')}
          style={{ minWidth: h, ...seg('mid') }}
        >
          {roll}
          {live}
        </span>
        <button
          type="button"
          aria-label="Downvote"
          aria-pressed={current === -1}
          onClick={() => set(current === -1 ? 0 : -1)}
          className={cn(base, outline, 'relative shadow-none focus-visible:z-10', current === -1 && 'bg-accent text-accent-foreground')}
          style={{ width: h, height: h, ...seg('last') }}
        >
          <Chevron />
        </button>
      </div>
    )
  }

  const on = current === 1
  const text = label ?? (kind === 'star' ? 'Star' : 'Like')
  const icon = (
    <motion.span
      className="inline-flex"
      initial={false}
      animate={{ scale: on ? [1, 1.3, 1] : 1, opacity: on ? 1 : 0.6 }}
      transition={{ duration: 0.35 }}
      style={on ? { color: activeColor } : undefined}
    >
      {kind === 'star' ? <Star filled={on} /> : <ThumbsUp filled={on} />}
    </motion.span>
  )
  const common = {
    type: 'button' as const,
    'aria-pressed': on,
    'aria-label': `${text}, ${count}`,
    onClick: () => set(on ? 0 : 1),
  }

  if (layout === 'split') {
    // comp-117：按钮 | 计数
    return (
      <button {...common} className={cn(base, outline, 'py-0 pe-0 ps-4', className)} style={{ height: h, ...seg('only'), ...style }}>
        {icon}
        {text}
        <Segment>{roll}</Segment>
        {live}
      </button>
    )
  }
  if (vertical) {
    return (
      <button {...common} className={cn(base, outline, 'flex-col gap-0.5 px-3 py-2', className)} style={{ minWidth: h + 12, ...seg('only'), ...style }}>
        {icon}
        <span className="text-xs">{roll}</span>
        {live}
      </button>
    )
  }
  // comp-118：图标 + 文字 + 小号计数
  return (
    <button {...common} className={cn(base, outline, 'px-4', className)} style={{ height: h, ...seg('only'), ...style }}>
      <span className="-ms-1 inline-flex">{icon}</span>
      <span className="flex items-baseline gap-2">
        {text}
        <span className="text-muted-foreground text-xs">{roll}</span>
      </span>
      {live}
    </button>
  )
}
