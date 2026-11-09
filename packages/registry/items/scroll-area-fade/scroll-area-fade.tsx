// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/scroll-area/demos/scroll-fade/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react'

/* @motif:defaults */
export const defaults = {
  axis: 'vertical',
  fadeSize: 40,
  thumbWidth: 16,
  thumbColor: '#ffffff',
  radius: 0,
  autoHide: true,
  trackVisible: true,
}
/* @motif:end */

export type ScrollAreaFadeProps = Partial<typeof defaults> & {
  children?: ReactNode
  /** 视口元素（演示自动滚动用）。 */
  viewportRef?: Ref<HTMLDivElement>
  /** 视口的无障碍名称。 */
  'aria-label'?: string
  className?: string
  viewportClassName?: string
  style?: CSSProperties
}

type Axis = 'vertical' | 'horizontal' | 'both'
type Metrics = { hasY: boolean; hasX: boolean }

const MIN_THUMB = 16

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as { current: T | null }).current = value
}

/** Scroll area：原生滚动 + 自定义滚动条；只在还有被遮住内容的一侧渐隐。 */
export function ScrollAreaFade({ children, viewportRef, 'aria-label': ariaLabel, className, viewportClassName, style, ...props }: ScrollAreaFadeProps) {
  const { axis, fadeSize, thumbWidth, thumbColor, autoHide, radius, trackVisible } = { ...defaults, ...props } as {
    axis: Axis
    fadeSize: number
    thumbWidth: number
    thumbColor: string
    autoHide: boolean
    radius: number
    trackVisible: boolean
  }
  const allowY = axis !== 'horizontal'
  const allowX = axis !== 'vertical'

  const viewport = useRef<HTMLDivElement | null>(null)
  const barY = useRef<HTMLDivElement>(null)
  const barX = useRef<HTMLDivElement>(null)
  const thumbY = useRef<HTMLDivElement>(null)
  const thumbX = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const [metrics, setMetrics] = useState<Metrics>({ hasY: false, hasX: false })
  const scrollState = useRef({ pending: false, last: 0, raf: 0 })

  const attachViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewport.current = node
      setRef(viewportRef, node)
    },
    [viewportRef],
  )

  const update = useCallback(() => {
    const el = viewport.current
    if (!el) return
    const maxY = Math.max(0, el.scrollHeight - el.clientHeight)
    const maxX = Math.max(0, el.scrollWidth - el.clientWidth)
    const top = Math.min(Math.max(el.scrollTop, 0), maxY)
    const left = Math.min(Math.max(el.scrollLeft, 0), maxX)
    el.style.setProperty('--scroll-area-overflow-y-start', `${top}px`)
    el.style.setProperty('--scroll-area-overflow-y-end', `${maxY - top}px`)
    el.style.setProperty('--scroll-area-overflow-x-start', `${left}px`)
    el.style.setProperty('--scroll-area-overflow-x-end', `${maxX - left}px`)

    const hasY = allowY && maxY > 0.5
    const hasX = allowX && maxX > 0.5
    setMetrics((prev) => (prev.hasY === hasY && prev.hasX === hasX ? prev : { hasY, hasX }))

    if (barY.current && thumbY.current && hasY) {
      const track = barY.current.clientHeight
      const size = Math.max(MIN_THUMB, (el.clientHeight / el.scrollHeight) * track)
      thumbY.current.style.height = `${size}px`
      thumbY.current.style.transform = `translate3d(0, ${(top / maxY) * (track - size)}px, 0)`
    }
    if (barX.current && thumbX.current && hasX) {
      const track = barX.current.clientWidth
      const size = Math.max(MIN_THUMB, (el.clientWidth / el.scrollWidth) * track)
      thumbX.current.style.width = `${size}px`
      thumbX.current.style.transform = `translate3d(${(left / maxX) * (track - size)}px, 0, 0)`
    }
  }, [allowX, allowY])

  useLayoutEffect(() => {
    update()
  })

  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    const state = scrollState.current
    // data-scrolling 在最后一次滚动后保持 500ms（用 rAF 时间戳计时，不用定时器）。
    const tick = (ts: number) => {
      if (state.pending) {
        state.pending = false
        state.last = ts
      }
      if (ts - state.last > 500) {
        state.raf = 0
        setScrolling(false)
        return
      }
      state.raf = requestAnimationFrame(tick)
    }
    const onScroll = () => {
      update()
      state.pending = true
      setScrolling(true)
      if (!state.raf) state.raf = requestAnimationFrame(tick)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', onScroll)
      if (state.raf) cancelAnimationFrame(state.raf)
      state.raf = 0
    }
  }, [update])

  /** 拖动滑块；点在轨道上时先跳到指针处，再继续拖动。 */
  const drag = (vertical: boolean) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = viewport.current
    const bar = vertical ? barY.current : barX.current
    const thumb = vertical ? thumbY.current : thumbX.current
    if (!el || !bar || !thumb || event.button !== 0) return
    event.preventDefault()
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const track = vertical ? rect.height : rect.width
    const size = vertical ? thumbRect.height : thumbRect.width
    const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth
    const ratio = max / Math.max(1, track - size)
    const pointer = vertical ? event.clientY : event.clientX
    if (event.target !== thumb) {
      const target = (pointer - (vertical ? rect.top : rect.left) - size / 2) * ratio
      if (vertical) el.scrollTop = target
      else el.scrollLeft = target
    }
    const startScroll = vertical ? el.scrollTop : el.scrollLeft
    bar.setPointerCapture(event.pointerId)
    const move = (e: PointerEvent) => {
      const delta = ((vertical ? e.clientY : e.clientX) - pointer) * ratio
      if (vertical) el.scrollTop = startScroll + delta
      else el.scrollLeft = startScroll + delta
    }
    const up = () => {
      bar.removeEventListener('pointermove', move)
      bar.removeEventListener('pointerup', up)
      bar.removeEventListener('pointercancel', up)
    }
    bar.addEventListener('pointermove', move)
    bar.addEventListener('pointerup', up)
    bar.addEventListener('pointercancel', up)
  }

  const fade = `${fadeSize}px`
  const yMask = `linear-gradient(to bottom, transparent 0, black min(${fade}, var(--scroll-area-overflow-y-start, 0px)), black calc(100% - min(${fade}, var(--scroll-area-overflow-y-end, ${fade}))), transparent 100%)`
  const xMask = `linear-gradient(to right, transparent 0, black min(${fade}, var(--scroll-area-overflow-x-start, 0px)), black calc(100% - min(${fade}, var(--scroll-area-overflow-x-end, ${fade}))), transparent 100%)`
  const mask = axis === 'vertical' ? yMask : axis === 'horizontal' ? xMask : `${yMask}, ${xMask}`

  const visible = !autoHide || hovering || scrolling
  const thumbRadius = Math.min(radius, thumbWidth / 2)
  const bothBars = metrics.hasX && metrics.hasY
  const barClass = cn(
    'absolute m-px flex touch-none select-none transition-opacity motion-reduce:transition-none',
    scrolling ? 'duration-0' : 'duration-150',
    trackVisible ? 'bg-foreground/10' : 'bg-transparent',
    visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
  )

  return (
    <div
      data-slot="scroll-area"
      className={cn(
        'relative box-border h-48 w-96 max-w-full overflow-hidden bg-card text-card-foreground',
        '[&:has(>[data-slot=scroll-area-viewport]:focus-visible)]:outline-2 [&:has(>[data-slot=scroll-area-viewport]:focus-visible)]:outline-offset-2 [&:has(>[data-slot=scroll-area-viewport]:focus-visible)]:outline-ring',
        className,
      )}
      style={{ borderRadius: radius, ...style }}
      onPointerEnter={(e) => e.pointerType !== 'touch' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div
        ref={attachViewport}
        data-slot="scroll-area-viewport"
        tabIndex={0}
        role="region"
        aria-label={ariaLabel ?? 'Scrollable content'}
        className={cn(
          'h-full w-full outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          axis === 'vertical' ? 'overflow-x-hidden overflow-y-auto' : axis === 'horizontal' ? 'overflow-x-auto overflow-y-hidden' : 'overflow-auto',
          viewportClassName,
        )}
        style={{ maskImage: mask, WebkitMaskImage: mask, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } as CSSProperties}
      >
        <div data-slot="scroll-area-content" style={{ minWidth: 'fit-content' }}>
          {children}
        </div>
      </div>
      {allowY && (
        <div
          ref={barY}
          data-orientation="vertical"
          data-hovering={hovering ? '' : undefined}
          data-scrolling={scrolling ? '' : undefined}
          aria-hidden
          className={cn(barClass, 'top-0 right-0 justify-center', !metrics.hasY && 'hidden')}
          style={{ width: thumbWidth, bottom: bothBars ? thumbWidth + 2 : 0, borderRadius: thumbRadius }}
          onPointerDown={drag(true)}
        >
          <div ref={thumbY} className="absolute top-0 left-0 w-full will-change-transform" style={{ background: thumbColor, borderRadius: thumbRadius }} />
        </div>
      )}
      {allowX && (
        <div
          ref={barX}
          data-orientation="horizontal"
          data-hovering={hovering ? '' : undefined}
          data-scrolling={scrolling ? '' : undefined}
          aria-hidden
          className={cn(barClass, 'bottom-0 left-0', !metrics.hasX && 'hidden')}
          style={{ height: thumbWidth, right: bothBars ? thumbWidth + 2 : 0, borderRadius: thumbRadius }}
          onPointerDown={drag(false)}
        >
          <div ref={thumbX} className="absolute top-0 left-0 h-full will-change-transform" style={{ background: thumbColor, borderRadius: thumbRadius }} />
        </div>
      )}
    </div>
  )
}
