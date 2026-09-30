import { cn } from '@motif/runtime'
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'no-results',
  accent: '#8b5cf6',
  size: 220,
  float: true,
  title: '',
  description: '',
  actionLabel: '',
  secondaryLabel: '',
}
/* @motif:end */

export type EmptyStateIllustratedProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  onAction?: () => void
  onSecondary?: () => void
  /** 放在按钮下方的额外内容。 */
  children?: ReactNode
}

/** 每个变体的默认文案；参数里留空就用它。 */
const COPY: Record<string, { title: string; description: string; action: string; secondary: string }> = {
  'no-results': {
    title: 'No results for “brand sprint”',
    description: 'Check the spelling, or try a broader term. You can also search by owner or tag.',
    action: 'Clear search',
    secondary: 'Browse all projects',
  },
  inbox: {
    title: 'You’re all caught up',
    description: 'New mentions and review requests will land here. Enjoy the quiet.',
    action: 'Set up notifications',
    secondary: '',
  },
  'no-files': {
    title: 'No files yet',
    description: 'Drop files here or upload from your computer. Anything you add shows up for the whole team.',
    action: 'Upload a file',
    secondary: 'Import from Drive',
  },
  offline: {
    title: 'You’re offline',
    description: 'We can’t reach the server. Your changes are saved on this device and will sync when you’re back.',
    action: 'Try again',
    secondary: '',
  },
}

function isDark(hex: string): boolean {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.62
}

const LINE = 'color-mix(in oklab, var(--foreground) 26%, transparent)'
const SOFT = 'color-mix(in oklab, var(--foreground) 7%, transparent)'
const FAINT = 'color-mix(in oklab, var(--foreground) 13%, transparent)'

function Sparkle({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const s = size
  return (
    <path
      className="mes-twinkle"
      style={{ animationDelay: `${delay}s` }}
      d={`M${x} ${y - s}C${x + s * 0.15} ${y - s * 0.3} ${x + s * 0.3} ${y - s * 0.15} ${x + s} ${y}C${x + s * 0.3} ${y + s * 0.15} ${x + s * 0.15} ${y + s * 0.3} ${x} ${y + s}C${x - s * 0.15} ${y + s * 0.3} ${x - s * 0.3} ${y + s * 0.15} ${x - s} ${y}C${x - s * 0.3} ${y - s * 0.15} ${x - s * 0.15} ${y - s * 0.3} ${x} ${y - s}Z`}
      fill={color}
    />
  )
}

function Illustration({ variant, accent, float }: { variant: string; accent: string; float: boolean }) {
  const id = useId()
  const grad = `${id}-g`
  const soft = `color-mix(in oklab, ${accent} 14%, transparent)`
  const mid = `color-mix(in oklab, ${accent} 30%, transparent)`
  const paper = 'var(--card)'
  return (
    <svg viewBox="0 0 240 180" className={cn('block h-auto w-full overflow-visible', float && 'mes-animated')} aria-hidden>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.38" />
          <stop offset="1" stopColor={accent} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="160" rx="66" ry="7" fill={FAINT} />

      {variant === 'no-results' && (
        <>
          <g transform="rotate(-6 112 90)">
            <rect x="62" y="26" width="98" height="124" rx="12" fill={paper} stroke={LINE} strokeWidth="1.6" />
            <rect x="78" y="46" width="40" height="7" rx="3.5" fill={FAINT} />
            <rect x="78" y="64" width="64" height="6" rx="3" fill={SOFT} />
            <rect x="78" y="78" width="52" height="6" rx="3" fill={SOFT} />
            <rect x="78" y="92" width="60" height="6" rx="3" fill={SOFT} />
            <rect x="78" y="106" width="34" height="6" rx="3" fill={SOFT} />
          </g>
          <g className="mes-scan">
            <circle cx="150" cy="104" r="31" fill={soft} stroke={accent} strokeWidth="3" />
            <path d="M172 127 196 152" stroke={accent} strokeWidth="10" strokeLinecap="round" />
            <path d="M172 127 196 152" stroke={paper} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
            <path d="M141 97c0-6 4.500-10.500 10.500-10.500S162 90.500 162 96c0 6.500-9 7.500-9.500 14" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <circle cx="152.500" cy="119.500" r="2.400" fill={accent} />
          </g>
          <Sparkle x={38} y={62} size={6} delay={0} color={accent} />
          <Sparkle x={202} y={44} size={8} delay={0.9} color={mid} />
          <Sparkle x={30} y={124} size={4.500} delay={1.6} color={mid} />
        </>
      )}

      {variant === 'inbox' && (
        <>
          <g className="mes-float">
            <rect x="92" y="14" width="56" height="40" rx="7" fill={soft} stroke={accent} strokeWidth="2" strokeDasharray="4 4" />
            <path d="m95 19 25 19 25-19" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <path d="M50 100 74 62a8 8 0 0 1 7-4h78a8 8 0 0 1 7 4l24 38Z" fill={SOFT} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M38 100h54c0 11 11 17 28 17s28-6 28-17h54v40a14 14 0 0 1-14 14H52a14 14 0 0 1-14-14Z" fill={paper} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M92 100c0 11 11 17 28 17s28-6 28-17" fill="none" stroke={accent} strokeWidth="2.400" strokeLinecap="round" />
          <Sparkle x={40} y={52} size={6} delay={0.4} color={accent} />
          <Sparkle x={200} y={62} size={5} delay={1.2} color={mid} />
          <Sparkle x={182} y={24} size={4} delay={1.9} color={mid} />
        </>
      )}

      {variant === 'no-files' && (
        <>
          <path d="M52 48h40l10 12h86a10 10 0 0 1 10 10v62a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10V58a10 10 0 0 1 10-10Z" fill={soft} stroke={accent} strokeWidth="2" strokeLinejoin="round" />
          <g transform="rotate(-4 120 80)">
            <g className="mes-float">
              <rect x="76" y="40" width="88" height="72" rx="8" fill={paper} stroke={LINE} strokeWidth="1.6" strokeDasharray="5 4" />
              <rect x="90" y="56" width="36" height="6" rx="3" fill={FAINT} />
              <rect x="90" y="70" width="58" height="6" rx="3" fill={SOFT} />
            </g>
          </g>
          <path d="M42 84a10 10 0 0 1 10-10h136a10 10 0 0 1 10 10v50a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10Z" fill={`url(#${grad})`} stroke={accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M120 96v26M107 109h26" stroke={accent} strokeWidth="3.200" strokeLinecap="round" />
          <Sparkle x={34} y={34} size={6} delay={0.2} color={accent} />
          <Sparkle x={208} y={38} size={5} delay={1.1} color={mid} />
          <Sparkle x={214} y={112} size={4} delay={1.8} color={mid} />
        </>
      )}

      {variant === 'offline' && (
        <>
          <g className="mes-float">
            <path d="M70 132c-17 0-27-11-27-25 0-13 9-23 22-25 4-19 21-31 41-31 20 0 36 11 41 30 18 1 33 12 33 28 0 14-11 23-25 23Z" fill={paper} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M96 104a34 34 0 0 1 48 0M105 114a20 20 0 0 1 30 0" fill="none" stroke={mid} strokeWidth="3" strokeLinecap="round" />
            <circle cx="120" cy="124" r="3.200" fill={mid} />
            <path className="mes-slash-halo" d="M74 46 168 146" stroke={paper} strokeWidth="14" strokeLinecap="round" />
            <path className="mes-slash" d="M74 46 168 146" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          </g>
          <Sparkle x={36} y={50} size={5} delay={0.3} color={mid} />
          <Sparkle x={206} y={60} size={6} delay={1} color={accent} />
        </>
      )}
    </svg>
  )
}

/**
 * 带插画的空状态：SVG 插画（搜索无结果、收件箱清空、还没有文件、离线）+ 标题 + 说明 + 主次两个操作。
 * 插画是装饰，对读屏隐藏；文案留空时使用各变体自带的默认文案。
 */
export function EmptyStateIllustrated({ className, style, onAction, onSecondary, children, ...props }: EmptyStateIllustratedProps) {
  const { variant, title, description, actionLabel, secondaryLabel, accent, size, float } = { ...defaults, ...props }
  const copy = COPY[variant] ?? COPY['no-results']!
  const heading = title || copy.title
  const body = description || copy.description
  const action = actionLabel || copy.action
  const secondary = secondaryLabel || copy.secondary
  const headingId = useId()
  const onAccent = isDark(accent) ? '#ffffff' : '#18181b'

  return (
    <section aria-labelledby={headingId} className={cn('mx-auto flex w-full max-w-md flex-col items-center px-6 py-8 text-center', className)} style={style}>
      <div style={{ width: size }}>
        <Illustration variant={variant} accent={accent} float={float} />
      </div>
      <h3 id={headingId} className="mt-4 text-[17px] font-semibold tracking-tight text-foreground">
        {heading}
      </h3>
      <p className="mt-1.5 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">{body}</p>
      {(action || secondary) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-lg px-4 py-2 text-sm font-medium outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
              style={{ background: accent, color: onAccent }}
            >
              {action}
            </button>
          )}
          {secondary && (
            <button type="button" onClick={onSecondary} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              {secondary}
            </button>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
