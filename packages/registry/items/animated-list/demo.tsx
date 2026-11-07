import type { ReactNode } from 'react'
import { AnimatedList, AnimatedListCard, type AnimatedListProps } from './animated-list'

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const ICONS = {
  order: icon(
    <>
      <path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>,
  ),
  review: icon(<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" />),
  payout: icon(
    <>
      <path d="M4 10h16M6 10v7M10 10v7M14 10v7M18 10v7M3.5 20h17" />
      <path d="m12 3.5 8 4.5H4z" />
    </>,
  ),
  stock: icon(
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
    </>,
  ),
  subscriber: icon(
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </>,
  ),
  refund: icon(
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4v4h4" />
    </>,
  ),
  shipped: icon(
    <>
      <path d="M3 7h11v9H3zM14 10h3.5l3 3v3H14" />
      <circle cx="7" cy="17.5" r="1.7" />
      <circle cx="17" cy="17.5" r="1.7" />
    </>,
  ),
}

// 一间虚构的服装店今天的动态，按发生的先后排。8 条 × 默认 1.5 秒 = 12 秒正好一轮，和循环视频等长。
const EVENTS = [
  { id: 'order-4821', icon: ICONS.order, tone: '#8b93ff', title: 'New order #4821', description: '2 × Linen overshirt · Lisbon', value: '$148.00', caption: 'Card' },
  { id: 'review', icon: ICONS.review, tone: '#f5b94a', title: '5-star review · Field jacket', description: '“Fits exactly as described.”', value: '4.9', caption: 'avg' },
  { id: 'payout', icon: ICONS.payout, tone: '#3fcf8e', title: 'Payout sent', description: 'Northbank ···· 0193', value: '$2,310.40', caption: 'Instant' },
  { id: 'order-4822', icon: ICONS.order, tone: '#8b93ff', title: 'New order #4822', description: 'Wool beanie, Canvas tote · Oslo', value: '$86.00', caption: 'Wallet' },
  { id: 'stock', icon: ICONS.stock, tone: '#f78a4b', title: 'Low stock · Field jacket', description: 'Size M · 3 left in Leeds', value: '3', caption: 'units' },
  { id: 'subscriber', icon: ICONS.subscriber, tone: '#ef7fc0', title: 'New subscriber', description: 'Joined from the Autumn lookbook', value: '2,418', caption: 'total' },
  { id: 'refund', icon: ICONS.refund, tone: '#9aa4b8', title: 'Refund issued #4790', description: 'Selvedge chinos · wrong size', value: '−$118.00', caption: 'Card' },
  { id: 'shipped', icon: ICONS.shipped, tone: '#4cc3e8', title: 'Order #4815 shipped', description: 'Tracked parcel · arrives Thursday', value: '3', caption: 'items' },
]

export function Demo(props: Omit<AnimatedListProps, 'children'>) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <p className="text-[13px] text-muted-foreground">Marlow &amp; Pine</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Live activity</h2>
          </div>
          <p className="flex items-center gap-2 pb-0.5 text-xs text-muted-foreground tabular-nums">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Today · $8,412.60
          </p>
        </div>
        {/* 一上来就是满的，第一条新条目在 1 秒时出现：12 秒后的画面和开头一模一样，循环无缝。 */}
        <AnimatedList {...props} initialCount={props.maxItems ?? 5} delay={1} aria-label="Store activity">
          {EVENTS.map(({ id, ...event }) => (
            <AnimatedListCard key={id} {...event} />
          ))}
        </AnimatedList>
      </div>
    </div>
  )
}
