import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* ---------- 图标（单线，跟随 currentColor） ---------- */

const ICONS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  doc: <path d="M6 3h9l4 4v14H6V3zM15 3v4h4M9 12h7M9 16h5" />,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c-3 3.2-3 14.8 0 18M12 3c3 3.2 3 14.8 0 18" />
    </>
  ),
  terminal: <path d="M4 5h16v14H4V5zM7.5 9.5l3 2.5-3 2.5M12.5 15h4" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="square" strokeLinejoin="miter" className={cn('size-4 shrink-0', className)} aria-hidden>
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 品牌：虚构的字标，一个源站分出三条线 ---------- */

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5 text-ink', className)}>
      <svg viewBox="0 0 28 28" className="size-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="1.5" y="1.5" width="25" height="25" />
        <circle cx="8" cy="14" r="2.6" fill="currentColor" stroke="none" />
        <path d="M10.6 14H14M14 7.5V20.5M14 7.5h4.5M14 14h4.5M14 20.5h4.5" />
        <rect x="18.5" y="5.5" width="4" height="4" />
        <rect x="18.5" y="12" width="4" height="4" />
        <rect x="18.5" y="18.5" width="4" height="4" />
      </svg>
      <span className="bp-display truncate text-[19px] leading-none">{name}</span>
    </span>
  )
}

/* ---------- 基础组件 ---------- */

export function Button({ children, variant = 'solid', className, onClick }: { children: ReactNode; variant?: 'solid' | 'outline'; className?: string; onClick?: () => void }) {
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
      }}
      className={cn(
        'bp-focus inline-flex h-11 shrink-0 items-center justify-center gap-2 px-5 font-bp-mono text-[13px] font-medium tracking-[0.04em] whitespace-nowrap uppercase transition-[background-color,color,border-color] duration-150',
        variant === 'solid' ? 'bg-ink text-paper hover:bg-ink-soft' : 'border border-rule text-ink hover:border-ink hover:bg-faint',
        className,
      )}
    >
      {children}
    </a>
  )
}

/** 图纸上的标注字：等宽、全大写、略加字距。 */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-bp-mono text-[11px] leading-none tracking-[0.12em] text-ink-muted uppercase', className)}>{children}</span>
}

export function Heading({ children, level = 2, className, id }: { children: ReactNode; level?: 1 | 2 | 3; className?: string; id?: string }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const size =
    level === 1
      ? '[font-size:clamp(2.3rem,calc(4.4cqw*var(--hs)),3.75rem)] leading-[1.02]'
      : level === 2
        ? '[font-size:clamp(1.7rem,calc(3.1cqw*var(--hs)),2.6rem)] leading-[1.08]'
        : 'text-lg leading-snug'
  return (
    <Tag id={id} className={cn('bp-display text-balance text-ink', size, className)}>
      {children}
    </Tag>
  )
}

/** 圆圈编号（零件引出号）。 */
export function Balloon({ n, className }: { n: number | string; className?: string }) {
  return (
    <span className={cn('inline-grid size-[18px] shrink-0 place-items-center rounded-full border border-ink font-bp-mono text-[10px] leading-none text-ink', className)} aria-hidden>
      {n}
    </span>
  )
}

/* ---------- 尺寸线 ---------- */

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 8 8" className="size-2 shrink-0" aria-hidden>
      <path d={dir === 'left' ? 'M0 4L8 1.2v5.6z' : 'M8 4L0 1.2v5.6z'} fill="currentColor" />
    </svg>
  )
}

/**
 * 水平尺寸线：两端界线 + 箭头 + 居中标注。
 * 用 flex 画而不是 SVG，这样任意宽度下标注字都不会被拉伸。
 */
export function DimLine({ label, className }: { label: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center text-rule', className)} aria-hidden>
      <span className="h-3 w-px bg-current" />
      <Arrow dir="left" />
      <span className="h-px min-w-3 flex-1 bg-current" />
      <span className="min-w-0 px-2.5 text-center font-bp-mono text-[11px] leading-snug tracking-[0.08em] text-balance text-ink-soft uppercase">{label}</span>
      <span className="h-px min-w-3 flex-1 bg-current" />
      <Arrow dir="right" />
      <span className="h-3 w-px bg-current" />
    </div>
  )
}

/* ---------- 图框 ---------- */

function Cross({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 14 14" className={cn('absolute size-3.5 text-rule', className)} aria-hidden>
      <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/**
 * 一张图纸：细线外框 + 四角十字定位标 + 左上角图号、右上角图名。
 * 页面上的每个区块都是一张图纸，图号按顺序编（这是真实的顺序，不是装饰编号）。
 */
export function Sheet({ code, title, children, className, id, labelledBy }: { code: string; title: string; children: ReactNode; className?: string; id?: string; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('px-4 py-6 @3xl:px-8 @3xl:py-8', className)}>
      <div className="relative mx-auto max-w-[1240px] border border-hair">
        <Cross className="-top-[7px] -left-[7px]" />
        <Cross className="-top-[7px] -right-[7px]" />
        <Cross className="-bottom-[7px] -left-[7px]" />
        <Cross className="-right-[7px] -bottom-[7px]" />
        <div className="flex items-stretch justify-between border-b border-hair">
          <Label className="border-r border-hair px-3 py-2.5">{code}</Label>
          <Label className="min-w-0 truncate border-l border-hair px-3 py-2.5">{title}</Label>
        </div>
        <div className="px-5 py-10 @3xl:px-10 @3xl:py-12">{children}</div>
      </div>
    </section>
  )
}

/* ---------- 命令行（带复制按钮） ---------- */

export function Command({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    setCopied(true)
    try {
      void navigator.clipboard?.writeText(command).catch(() => undefined)
    } catch {
      // 沙箱 iframe 里可能没有剪贴板权限：按钮状态照常切换，命令本身就在旁边可选中。
    }
  }
  return (
    <div className={cn('flex h-11 min-w-0 items-center border border-hair bg-paper-deep/40 font-bp-mono text-[13px]', className)}>
      <span className="pl-3.5 text-ink-muted select-none" aria-hidden>
        $
      </span>
      <code className="min-w-0 flex-1 truncate px-2.5 text-ink">{command}</code>
      <button
        type="button"
        onClick={copy}
        onBlur={() => setCopied(false)}
        onMouseLeave={() => setCopied(false)}
        aria-label={copied ? 'Copied' : `Copy command: ${command}`}
        className="bp-focus grid h-full w-11 shrink-0 place-items-center border-l border-hair text-ink-soft transition-colors duration-150 hover:bg-faint hover:text-ink"
      >
        <Icon name={copied ? 'check' : 'copy'} />
      </button>
    </div>
  )
}
