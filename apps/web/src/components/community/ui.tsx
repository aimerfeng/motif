import type { ComponentType, ReactNode, SVGProps } from 'react'
import { InboxIcon } from '@/components/icons'

/**
 * 社区各页共用的版式：统一的页头、分区标题、空状态和数据格。
 * 原则：标题说清这页做什么，一句话以内的副标题；规则和数字用数据展示，不写成段落。
 */

export function PageHeader({ title, lead, children }: { title: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        <h1 className="font-display text-[34px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[40px]">{title}</h1>
        {lead && <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-pretty text-ink-muted">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-baseline gap-2 text-[15px] font-medium">
        {title}
        {count !== undefined && <span className="font-mono text-[12px] text-ink-faint tabular-nums">{count}</span>}
      </h2>
      {action}
    </div>
  )
}

/** 空状态：一个图标、一句话，最好再给一个下一步。 */
export function EmptyState({ title, action, icon: Glyph = InboxIcon, compact = false }: { title: string; action?: ReactNode; icon?: ComponentType<SVGProps<SVGSVGElement>>; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line text-center ${compact ? 'px-5 py-8' : 'px-6 py-14'}`}>
      <span className="grid size-10 place-items-center rounded-full border border-line bg-raised text-ink-faint">
        <Glyph className="size-[18px]" />
      </span>
      <p className="max-w-xs text-[13.5px] text-ink-muted">{title}</p>
      {action}
    </div>
  )
}

export function Stat({ label, value, hint, className = '' }: { label: string; value: ReactNode; hint?: string; className?: string }) {
  return (
    <div className={`min-w-0 bg-canvas px-5 py-4 ${className}`}>
      <dt className="text-[12px] text-ink-faint">{label}</dt>
      <dd className="mt-1 truncate font-display text-[19px] font-semibold tracking-[-0.02em] tabular-nums sm:text-[22px]" title={hint}>
        {value}
      </dd>
    </div>
  )
}

/** 圆角数据格：一组 Stat 放进去，格子之间是细线。 */
export function StatGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <dl className={`grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line ${className}`}>{children}</dl>
}

/** 票数进度：每一票一格，凑满法定票数就结算。 */
export function VoteMeter({ votes, quorum }: { votes: number; quorum: number }) {
  return (
    <span aria-hidden className="inline-flex gap-0.5">
      {Array.from({ length: Math.max(quorum, votes) }, (_, index) => (
        <span key={index} className={`h-1.5 w-3 rounded-full ${index < votes ? 'bg-success' : 'bg-line-strong'}`} />
      ))}
    </span>
  )
}

/** 加载中的占位块：开了「减少动态效果」时不闪。 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`rounded-md bg-raised motion-safe:animate-pulse ${className}`} />
}

export const buttonPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40'
export const buttonSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-[13.5px] text-ink transition-colors duration-150 hover:border-ink disabled:opacity-40'
export const linkMuted = 'text-[13px] text-ink-muted transition-colors duration-150 hover:text-ink'
