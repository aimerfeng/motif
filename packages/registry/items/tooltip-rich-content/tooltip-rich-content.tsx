// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/ui/tooltip.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cloneElement, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  content: 'stats',
  theme: 'surface',
  arrow: true,
  placement: 'top',
  delay: 0,
  maxWidth: 280,
  radius: 6,
}
/* @motif:end */

type Options = typeof defaults
type Side = 'top' | 'bottom' | 'left' | 'right'

export type TooltipRichContentProps = Partial<Options> & {
  /** 触发器：一个可聚焦元素（按钮、链接）。 */
  children: ReactElement<{ 'aria-describedby'?: string }>
  /** 自定义气泡内容；不传时按 `content` 使用内置样式。 */
  body?: ReactNode
  /** 受控打开（演示自动播放用）。 */
  open?: boolean
  className?: string
  style?: CSSProperties
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 shrink-0 opacity-60" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </svg>
  )
}

/** 代替上游的预览截图：一张现画的渐变小图（模拟一个对话框界面）。 */
function PreviewArt() {
  return (
    <svg aria-hidden="true" className="block h-auto w-full rounded" viewBox="0 0 382 216" role="presentation">
      <defs>
        <linearGradient id="trc-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#a855f7" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <radialGradient id="trc-glow" cx="0.25" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="382" height="216" fill="url(#trc-sky)" />
      <rect width="382" height="216" fill="url(#trc-glow)" />
      <rect x="96" y="44" width="190" height="128" rx="10" fill="#fff" fillOpacity="0.92" />
      <rect x="114" y="62" width="88" height="10" rx="5" fill="#18181b" fillOpacity="0.8" />
      <rect x="114" y="82" width="154" height="6" rx="3" fill="#18181b" fillOpacity="0.25" />
      <rect x="114" y="94" width="128" height="6" rx="3" fill="#18181b" fillOpacity="0.25" />
      <rect x="114" y="106" width="140" height="6" rx="3" fill="#18181b" fillOpacity="0.25" />
      <rect x="186" y="140" width="40" height="18" rx="5" fill="#18181b" fillOpacity="0.12" />
      <rect x="232" y="140" width="40" height="18" rx="5" fill="#4f46e5" />
    </svg>
  )
}

function Dot({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={cn('shrink-0', className)} fill="currentColor" height="8" viewBox="0 0 8 8" width="8" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
}

/** 上游 comp-356…362 的几种内容，原样搬过来。 */
export function builtInContent(kind: string): ReactNode {
  switch (kind) {
    case 'text':
      return <span className="text-xs">This tooltip has an arrow</span>
    case 'title':
      return (
        <div className="space-y-1">
          <p className="font-medium text-[13px]">Tooltip with title</p>
          <p className="text-muted-foreground text-xs">
            Tooltips are made to be highly customizable, with features like dynamic placement, rich content, and a robust API. You can even use them as a full-featured dropdown menu by
            setting the <code>trigger</code> prop to <code>click</code>.
          </p>
        </div>
      )
    case 'icon':
      return (
        <div className="flex gap-3">
          <GlobeIcon />
          <div className="space-y-1">
            <p className="font-medium text-[13px]">Tooltip with title and icon</p>
            <p className="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich content, and a robust API.</p>
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="space-y-2">
          <PreviewArt />
          <div className="space-y-1">
            <p className="font-medium text-[13px]">Tooltip with title and icon</p>
            <p className="text-muted-foreground text-xs">Tooltips are made to be highly customizable, with features like dynamic placement, rich content, and a robust API.</p>
          </div>
        </div>
      )
    case 'chart':
      return (
        <div className="space-y-2">
          <div className="font-medium text-[13px]">Tuesday, Aug 13</div>
          {(
            [
              ['Sales', '$40', 'text-indigo-500'],
              ['Revenue', '$74', 'text-purple-500'],
              ['Costs', '$410', 'text-rose-500'],
            ] as const
          ).map(([label, value, tone]) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <Dot className={tone} />
              <span className="flex grow gap-2">
                {label} <span className="ml-auto">{value}</span>
              </span>
            </div>
          ))}
        </div>
      )
    case 'stats':
    default:
      return (
        <ul className="grid gap-3 text-xs">
          {(
            [
              ['Status', 'Completed'],
              ['Code Coverage', '94.3%'],
              ['Last Deploy', 'Today at 15:42'],
              ['Performance Score', '98/100'],
            ] as const
          ).map(([label, value]) => (
            <li key={label} className="grid gap-0.5">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </li>
          ))}
        </ul>
      )
  }
}

const padding: Record<string, string> = { text: 'px-2 py-1', title: 'py-3', icon: 'py-3', image: 'py-3', stats: 'py-3', chart: 'py-2' }
const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const SIDE_OFFSET = 4
const ARROW = 5

/**
 * 富内容提示：悬停或键盘聚焦打开，Esc 关闭；放不下时翻到对侧。
 * 气泡是 role="tooltip"，打开时用 aria-describedby 关联到触发器。
 */
export function TooltipRichContent({ children, body, open: forced, className, style, ...props }: TooltipRichContentProps) {
  const { content, theme, arrow, placement, delay, maxWidth, radius } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const tipId = useId()
  const anchor = useRef<HTMLSpanElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [side, setSide] = useState<Side>(placement as Side)
  const open = forced ?? ((hover || focus) && !dismissed)

  const show = useCallback(() => {
    window.clearTimeout(timer.current)
    setDismissed(false)
    if (delay <= 0) setHover(true)
    else timer.current = window.setTimeout(() => setHover(true), delay * 1000)
  }, [delay])
  const hide = useCallback(() => {
    window.clearTimeout(timer.current)
    setHover(false)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // 放不下时翻到对侧（只比较首选方向和对侧的可用空间）。
  useLayoutEffect(() => {
    const preferred = placement as Side
    if (!open) {
      setSide(preferred)
      return
    }
    const a = anchor.current?.getBoundingClientRect()
    const b = bubble.current
    if (!a || !b) return
    const need = (preferred === 'top' || preferred === 'bottom' ? b.offsetHeight : b.offsetWidth) + SIDE_OFFSET + ARROW
    const room = { top: a.top, bottom: window.innerHeight - a.bottom, left: a.left, right: window.innerWidth - a.right }
    const flip = opposite[preferred]
    setSide(room[preferred] < need && room[flip] > room[preferred] ? flip : preferred)
  }, [open, placement, content, maxWidth])

  const vertical = side === 'top' || side === 'bottom'
  const slide = 8
  const from = reduced ? {} : side === 'top' ? { y: slide } : side === 'bottom' ? { y: -slide } : side === 'left' ? { x: slide } : { x: -slide }
  const pos: CSSProperties =
    side === 'top'
      ? { bottom: `calc(100% + ${SIDE_OFFSET}px)`, left: '50%', translate: '-50% 0' }
      : side === 'bottom'
        ? { top: `calc(100% + ${SIDE_OFFSET}px)`, left: '50%', translate: '-50% 0' }
        : side === 'left'
          ? { right: `calc(100% + ${SIDE_OFFSET}px)`, top: '50%', translate: '0 -50%' }
          : { left: `calc(100% + ${SIDE_OFFSET}px)`, top: '50%', translate: '0 -50%' }
  const origin = { top: 'bottom center', bottom: 'top center', left: 'center right', right: 'center left' }[side]

  return (
    <span
      ref={anchor}
      className={cn('relative inline-flex', className)}
      style={style}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={(event) => {
        setDismissed(false)
        setFocus((event.target as HTMLElement).matches(':focus-visible'))
      }}
      onBlur={() => setFocus(false)}
    >
      {isValidElement(children) && open ? cloneElement(children, { 'aria-describedby': tipId }) : children}
      <AnimatePresence>
        {open && (
          <div className={cn('pointer-events-none absolute z-50', theme === 'dark' && 'dark')} style={pos}>
            <motion.div
              ref={bubble}
              id={tipId}
              role="tooltip"
              data-side={side}
              data-slot="tooltip-content"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.95, ...from }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
              transition={{ duration: reduced ? 0.12 : 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={cn('relative w-max rounded-md border bg-popover px-3 py-1.5 text-popover-foreground text-sm', body ? 'py-3' : padding[content])}
              style={{ maxWidth, borderRadius: radius, transformOrigin: origin }}
            >
              {body ?? builtInContent(content)}
              {arrow && (
                <svg
                  aria-hidden="true"
                  className="absolute -my-px fill-popover drop-shadow-[0_1px_0_var(--border)]"
                  width={10}
                  height={ARROW}
                  viewBox="0 0 30 10"
                  preserveAspectRatio="none"
                  style={
                    vertical
                      ? { left: '50%', [side === 'top' ? 'top' : 'bottom']: '100%', translate: '-50% 0', rotate: side === 'top' ? '0deg' : '180deg' }
                      : { top: '50%', [side === 'left' ? 'left' : 'right']: '100%', translate: `${side === 'left' ? '-2.5px' : '2.5px'} -50%`, rotate: side === 'left' ? '-90deg' : '90deg' }
                  }
                >
                  <polygon points="0,0 30,0 15,10" />
                </svg>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </span>
  )
}
