// SPDX-License-Identifier: MIT
// Copyright (c) 2026 anl331
// Source: https://github.com/anl331/goey-toast/blob/be6bd88/src/components/GooeyToast.tsx
// Modified by Motif; see the item's provenance.
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  align: 'center',
  width: 320,
  fill: '#18181b',
  bounce: 0.4,
  expandDelay: 0.5,
  hold: 2.8,
  richColors: false,
  border: true,
}
/* @motif:end */

export type GooeyToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

export type GooeyToastData = {
  id: string
  title: string
  description?: string
  type?: GooeyToastType
  action?: { label: string; onClick?: () => void }
}

export type ToastGooeyProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 当前要显示的 toast；传 null 时收起并退场。换 id 会重新开始一轮「弹出、展开、收起」。 */
  toast?: GooeyToastData | null
  /** 一轮结束（收起完毕）时调用，由调用方清掉 toast。 */
  onDismiss?: () => void
}

/** 胶囊高度；与 goey-toast 一样，胶囊保持不变，下方的主体从它下面长出来。 */
const PH = 40
const COLLAPSE_SECONDS = 0.9

const ACCENT: Record<string, string> = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  loading: '#a1a1aa',
}

function isDark(hex: string): boolean {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6
}

/**
 * 形变路径：t=0 是一颗纯胶囊；t=1 时胶囊居中停在顶部，主体从它下面向两侧长出，
 * 胶囊两侧与主体之间用二次曲线连成一个「颈」，像一滴水被拉开。
 * 几何来自 goey-toast 的 morphPathCenter；align 为 left/right 时胶囊靠一侧，右侧用镜像得到。
 */
function morphPath(pw: number, bw: number, th: number, t: number, centered: boolean): string {
  const pr = PH / 2
  const pillW = Math.min(pw, bw)
  const pillOffset = centered ? (bw - pillW) / 2 : 0
  const bodyH = PH + (th - PH) * t

  if (t <= 0.001 || bodyH - PH < 8) {
    return [
      `M ${pillOffset},${pr}`,
      `A ${pr},${pr} 0 0 1 ${pillOffset + pr},0`,
      `H ${pillOffset + pillW - pr}`,
      `A ${pr},${pr} 0 0 1 ${pillOffset + pillW},${pr}`,
      `A ${pr},${pr} 0 0 1 ${pillOffset + pillW - pr},${PH}`,
      `H ${pillOffset + pr}`,
      `A ${pr},${pr} 0 0 1 ${pillOffset},${pr}`,
      'Z',
    ].join(' ')
  }

  const curve = 14 * Math.min(t, 1.15)
  const cr = Math.max(4, Math.min(18, (bodyH - PH) * 0.45))
  const bodyTop = PH - curve

  if (!centered) {
    const bodyW = pillW + (bw - pillW) * Math.min(t, 1.1)
    const qEndX = Math.min(pillW + curve, bodyW - cr)
    return [
      `M 0,${pr}`,
      `A ${pr},${pr} 0 0 1 ${pr},0`,
      `H ${pillW - pr}`,
      `A ${pr},${pr} 0 0 1 ${pillW},${pr}`,
      `L ${pillW},${bodyTop}`,
      `Q ${pillW},${bodyTop + curve} ${qEndX},${bodyTop + curve}`,
      `H ${bodyW - cr}`,
      `A ${cr},${cr} 0 0 1 ${bodyW},${bodyTop + curve + cr}`,
      `L ${bodyW},${bodyH - cr}`,
      `A ${cr},${cr} 0 0 1 ${bodyW - cr},${bodyH}`,
      `H ${cr}`,
      `A ${cr},${cr} 0 0 1 0,${bodyH - cr}`,
      'Z',
    ].join(' ')
  }

  const center = bw / 2
  const half = pillW / 2 + ((bw - pillW) / 2) * Math.min(t, 1.1)
  const left = center - half
  const right = center + half
  const qLeft = Math.max(left + cr, pillOffset - curve)
  const qRight = Math.min(right - cr, pillOffset + pillW + curve)
  return [
    `M ${pillOffset},${pr}`,
    `A ${pr},${pr} 0 0 1 ${pillOffset + pr},0`,
    `H ${pillOffset + pillW - pr}`,
    `A ${pr},${pr} 0 0 1 ${pillOffset + pillW},${pr}`,
    `L ${pillOffset + pillW},${bodyTop}`,
    `Q ${pillOffset + pillW},${bodyTop + curve} ${qRight},${bodyTop + curve}`,
    `H ${right - cr}`,
    `A ${cr},${cr} 0 0 1 ${right},${bodyTop + curve + cr}`,
    `L ${right},${bodyH - cr}`,
    `A ${cr},${cr} 0 0 1 ${right - cr},${bodyH}`,
    `H ${left + cr}`,
    `A ${cr},${cr} 0 0 1 ${left},${bodyH - cr}`,
    `L ${left},${bodyTop + curve + cr}`,
    `A ${cr},${cr} 0 0 1 ${left + cr},${bodyTop + curve}`,
    `H ${qLeft}`,
    `Q ${pillOffset},${bodyTop + curve} ${pillOffset},${bodyTop}`,
    'Z',
  ].join(' ')
}

function Icon({ type }: { type: GooeyToastType }) {
  const common = { viewBox: '0 0 24 24', className: 'size-[18px]', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (type === 'success')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9.5" strokeWidth="1.8" opacity="0.4" />
        <path d="m7.8 12.4 3 3 5.4-6.2" />
      </svg>
    )
  if (type === 'error')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9.5" strokeWidth="1.8" opacity="0.4" />
        <path d="M12 7.5v5.5M12 16.3v.2" />
      </svg>
    )
  if (type === 'warning')
    return (
      <svg {...common}>
        <path d="M12 3.5 21 19H3L12 3.5Z" strokeWidth="1.8" opacity="0.4" />
        <path d="M12 9.5v4.5M12 17v.2" />
      </svg>
    )
  if (type === 'loading')
    return (
      <svg {...common} className="size-[18px] mtg-spin">
        <circle cx="12" cy="12" r="8.5" strokeWidth="2.4" opacity="0.25" />
        <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
      </svg>
    )
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.8" opacity="0.4" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </svg>
  )
}

/**
 * 形变通知：先是一颗小胶囊从顶部落下，停一下，再从胶囊下面「长」出一个带说明和按钮的主体，
 * 过一会儿收回胶囊并退场。轮廓是一条会变形的 SVG 路径，弹簧带一点过冲，读起来像一滴水。
 */
export function ToastGooey({ className, style, toast, onDismiss, ...props }: ToastGooeyProps) {
  const { align, width, fill, bounce, expandDelay, hold, richColors, border } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())

  return (
    <div
      className={cn('flex w-full', align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center', className)}
      style={style}
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -28, scale: 0.7 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.85, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={reduced ? { duration: 0.18 } : { type: 'spring', visualDuration: 0.5, bounce: Math.min(bounce, 0.6) }}
            style={{ transformOrigin: align === 'center' ? 'top center' : align === 'left' ? 'top left' : 'top right' }}
          >
            <GooeyBody toast={toast} align={align} width={width} fill={fill} bounce={bounce} expandDelay={expandDelay} hold={hold} richColors={richColors} border={border} reduced={reduced} onDismiss={onDismiss} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type BodyProps = {
  toast: GooeyToastData
  align: string
  width: number
  fill: string
  bounce: number
  expandDelay: number
  hold: number
  richColors: boolean
  border: boolean
  reduced: boolean
  onDismiss?: () => void
}

function GooeyBody({ toast, align, width, fill, bounce, expandDelay, hold, richColors, border, reduced, onDismiss }: BodyProps) {
  const type = toast.type ?? 'default'
  const centered = align === 'center'
  const mirrored = align === 'right'
  const hasBody = Boolean(toast.description || toast.action)
  const t = useMotionValue(0)
  const pathRef = useRef<SVGPathElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ pw: 120, th: PH + 60 })
  const dimsRef = useRef(dims)
  dimsRef.current = dims
  const [hovered, setHovered] = useState(false)
  const pausedRef = useRef(false)
  pausedRef.current = hovered
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const accent = ACCENT[type]
  const baseFill = richColors && accent && type !== 'loading' ? `color-mix(in oklab, ${accent} 16%, ${fill})` : fill
  const dark = isDark(fill)
  const text = dark ? '#fafafa' : '#18181b'
  const muted = dark ? '#a1a1aa' : '#52525b'
  const stroke = border ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)') : 'none'

  // 把当前的 t 画到 DOM 上：路径、容器高度、主体的淡入
  const paint = useCallback(() => {
    const { pw, th } = dimsRef.current
    const v = Math.max(0, t.get())
    pathRef.current?.setAttribute('d', morphPath(pw, width, th, v, centered))
    if (frameRef.current) frameRef.current.style.height = `${PH + (th - PH) * Math.min(v, 1.1)}px`
    if (bodyRef.current) {
      const p = Math.min(Math.max((v - 0.3) / 0.6, 0), 1)
      bodyRef.current.style.opacity = String(p)
      bodyRef.current.style.transform = reduced ? 'none' : `translateY(${(1 - p) * -8}px)`
      bodyRef.current.style.pointerEvents = p > 0.9 ? 'auto' : 'none'
    }
  }, [t, width, centered, reduced])
  useMotionValueEvent(t, 'change', paint)

  // 测量：胶囊宽度取决于图标和标题；主体高度取决于说明文字换行
  useLayoutEffect(() => {
    const pill = pillRef.current
    const body = bodyRef.current
    if (!pill) return
    const measure = () => {
      const pw = Math.ceil(pill.offsetWidth)
      const bodyHeight = body && hasBody ? body.offsetHeight : 0
      setDims((current) => {
        const th = hasBody ? PH + 10 + bodyHeight + 16 : PH
        return current.pw === pw && current.th === th ? current : { pw, th }
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(pill)
    if (body) observer.observe(body)
    return () => observer.disconnect()
  }, [hasBody, width, toast.title, toast.description])
  useLayoutEffect(paint, [dims, paint])

  // 一轮的时间线：落地 → expandDelay 后展开 → hold 秒后收起 → 收起完成后通知调用方。
  // 用 rAF + performance.now 计时（悬停时暂停），手动时钟下也是确定的。
  useEffect(() => {
    t.set(0)
    if (toast.type === 'loading') return
    let frame = 0
    let last = performance.now()
    let elapsed = 0
    let phase = 0
    let controls: ReturnType<typeof animate> | null = null
    const expandAt = expandDelay
    const collapseAt = expandDelay + hold
    const endAt = hasBody ? collapseAt + COLLAPSE_SECONDS : expandDelay + hold
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (!pausedRef.current && !document.hidden) elapsed += dt
      if (phase === 0 && hasBody && elapsed >= expandAt) {
        phase = 1
        controls = reduced ? animate(t, 1, { duration: 0.2, ease: 'easeOut' }) : animate(t, 1, { type: 'spring', visualDuration: 0.65, bounce: Math.min(bounce, 0.8) })
      }
      if (phase === 1 && elapsed >= collapseAt) {
        phase = 2
        controls?.stop()
        controls = reduced ? animate(t, 0, { duration: 0.2, ease: 'easeOut' }) : animate(t, 0, { type: 'spring', visualDuration: COLLAPSE_SECONDS * 0.8, bounce: Math.min(bounce * 0.5, 0.4) })
      }
      if (elapsed >= endAt && phase !== 3) {
        phase = 3
        dismissRef.current?.()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      controls?.stop()
    }
  }, [toast.id, toast.type, hasBody, expandDelay, hold, bounce, reduced, t])

  return (
    <div
      ref={frameRef}
      className="relative"
      style={{ width, height: PH, color: text }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <svg width={width} height="100%" className="absolute left-0 top-0 overflow-visible" style={{ transform: mirrored ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }} aria-hidden>
        <path ref={pathRef} d={morphPath(dims.pw, width, dims.th, 0, centered)} fill={baseFill} stroke={stroke} strokeWidth="1" />
      </svg>

      <div className="absolute top-0 flex" style={{ height: PH, left: 0, right: 0, justifyContent: centered ? 'center' : mirrored ? 'flex-end' : 'flex-start' }}>
        <div ref={pillRef} className="flex items-center gap-2 whitespace-nowrap px-4 text-[13px] font-medium" style={{ height: PH, maxWidth: width }}>
          <span className="grid shrink-0 place-items-center" style={{ color: accent ?? muted }} aria-hidden>
            <Icon type={type} />
          </span>
          <span className="truncate" aria-hidden>
            {toast.title}
          </span>
        </div>
      </div>

      <div ref={bodyRef} className="absolute inset-x-0 opacity-0" style={{ top: PH + 10, padding: '0 18px' }}>
        {toast.description && (
          <p className="text-[13px] leading-[19px]" style={{ color: muted }} aria-hidden>
            {toast.description}
          </p>
        )}
        {toast.action && (
          <div className={cn('mt-3', centered ? 'flex justify-center' : mirrored ? 'flex justify-end' : 'flex')}>
            <button
              type="button"
              onClick={toast.action.onClick}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ background: accent && type !== 'loading' ? `color-mix(in oklab, ${accent} 22%, transparent)` : dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', color: accent && type !== 'loading' ? accent : text }}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <span role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'} className="sr-only">
        {toast.title}
        {toast.description ? `. ${toast.description}` : ''}
      </span>
    </div>
  )
}
