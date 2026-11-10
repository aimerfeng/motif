import type { ComponentType, ReactNode, SVGProps } from 'react'
import { InboxIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'

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

/**
 * 能点进去的数据格：数字背后有一张完整的列表时用（「创作者 12」点进去就是那 12 个人）。
 * 链接只包住数字，再用 ::after 铺满整格：dl 里不能直接放 a，读屏也只读到一个带名字的链接。
 */
export function StatLink({ label, value, href, hint, className = '' }: { label: string; value: string; href: string; hint?: string; className?: string }) {
  return (
    <div className={`group relative min-w-0 bg-canvas px-5 py-4 transition-colors duration-150 hover:bg-raised ${className}`}>
      <dt className="text-[12px] text-ink-faint transition-colors duration-150 group-hover:text-ink-muted">{label}</dt>
      <dd className="mt-1 truncate font-display text-[19px] font-semibold tracking-[-0.02em] tabular-nums sm:text-[22px]" title={hint}>
        {/* 数据格有 overflow-hidden，往外扩的焦点框会被裁掉：画在铺满格子的 ::after 上，往里收 2px。 */}
        <Link
          href={href}
          aria-label={`${label} ${value}`}
          className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
        >
          {value}
        </Link>
      </dd>
    </div>
  )
}

/** 圆角数据格：一组 Stat 放进去，格子之间是细线。 */
export function StatGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <dl className={`grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line ${className}`}>{children}</dl>
}

/**
 * 细线卡片格：一、二、三列，卡片之间一条细线（仓库列表、创作者名录共用）。
 * 细线其实是容器的底色从 1px 的间隙里透出来；最后一行没排满时，空着的位置会露出一整块底色，
 * 所以按「两列时缺几格、三列时缺几格」补上占位格。类名写成完整的字面量，Tailwind 才扫得到。
 */
export function HairlineGrid({ count, children, className = '' }: { count: number; children: ReactNode; className?: string }) {
  const missingAtTwo = (2 - (count % 2)) % 2
  const missingAtThree = (3 - (count % 3)) % 3
  return (
    <div className={`grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
      {Array.from({ length: Math.max(missingAtTwo, missingAtThree) }, (_, index) => (
        <div key={`filler-${index}`} aria-hidden className={`hidden bg-canvas ${index < missingAtTwo ? 'sm:block' : ''} ${index < missingAtThree ? 'lg:block' : 'lg:hidden'}`} />
      ))}
    </div>
  )
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

/**
 * 页头的占位，给 loading.tsx 用：标题、一行副标题、右侧一个按钮，尺寸跟 PageHeader 对齐。
 * 手机上真实的副标题会折成两行、按钮掉到下一行，占位也照这个样子留高度，内容出来时下面的东西不往下挤。
 */
export function PageHeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="w-full max-w-xl min-w-0">
        <Skeleton className="h-[37px] w-28 sm:h-11 sm:w-32" />
        <Skeleton className="mt-2.5 h-[47px] w-full sm:h-[23px] sm:max-w-md" />
      </div>
      {action && <Skeleton className="h-[38px] w-28 rounded-full" />}
    </div>
  )
}

export const buttonPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40'
export const buttonSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-[13.5px] text-ink transition-colors duration-150 hover:border-ink disabled:opacity-40'
export const linkMuted = 'text-[13px] text-ink-muted transition-colors duration-150 hover:text-ink'
