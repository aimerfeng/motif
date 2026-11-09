// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/reui/scrollspy.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  indicator: 'glide',
  accent: '#8b5cf6',
  offset: 50,
  smooth: true,
  spring: {
    visualDuration: 0.35,
    bounce: 0.15,
  },
}
/* @motif:end */

type ScrollspyProps = {
  children: ReactNode
  targetRef?: RefObject<HTMLElement | HTMLDivElement | Document | null | undefined>
  onUpdate?: (id: string) => void
  offset?: number
  smooth?: boolean
  className?: string
  dataAttribute?: string
  history?: boolean
  throttleTime?: number
}

export function Scrollspy({ children, targetRef, onUpdate, className, offset = 0, smooth = true, dataAttribute = 'scrollspy', history = true }: ScrollspyProps) {
  const selfRef = useRef<HTMLDivElement | null>(null)
  const anchorElementsRef = useRef<Element[] | null>(null)
  const prevIdTracker = useRef<string | null>(null)
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  })

  // Sets active nav, hash, prevIdTracker, and calls onUpdate
  const setActiveSection = useCallback(
    (sectionId: string | null, force = false) => {
      if (!sectionId) return
      anchorElementsRef.current?.forEach((item) => {
        const id = item.getAttribute(`data-${dataAttribute}-anchor`)
        if (id === sectionId) {
          item.setAttribute('data-active', 'true')
          item.setAttribute('aria-current', 'location')
        } else {
          item.removeAttribute('data-active')
          item.removeAttribute('aria-current')
        }
      })
      onUpdateRef.current?.(sectionId)
      if (history && (force || prevIdTracker.current !== sectionId)) {
        window.history.replaceState({}, '', `#${sectionId}`)
      }
      prevIdTracker.current = sectionId
    },
    [anchorElementsRef, dataAttribute, history],
  )

  const handleScroll = useCallback(() => {
    if (!anchorElementsRef.current || anchorElementsRef.current.length === 0) return

    const scrollElement = targetRef?.current === document ? document.documentElement : (targetRef?.current as HTMLElement)

    if (!scrollElement) return

    const scrollTop = scrollElement === document.documentElement ? window.scrollY || document.documentElement.scrollTop : scrollElement.scrollTop

    // Find the anchor whose section is closest to but not past the top
    let activeIdx = 0
    let minDelta = Infinity

    anchorElementsRef.current.forEach((anchor, idx) => {
      const sectionId = anchor.getAttribute(`data-${dataAttribute}-anchor`)
      const sectionElement = sectionId ? document.getElementById(sectionId) : null
      if (!sectionElement) return

      let customOffset = offset
      const dataOffset = anchor.getAttribute(`data-${dataAttribute}-offset`)
      if (dataOffset) customOffset = parseInt(dataOffset, 10)

      const delta = Math.abs(sectionElement.offsetTop - customOffset - scrollTop)

      if (sectionElement.offsetTop - customOffset <= scrollTop && delta < minDelta) {
        minDelta = delta
        activeIdx = idx
      }
    })

    // If at bottom, force last anchor
    const scrollHeight = scrollElement.scrollHeight
    const clientHeight = scrollElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 2) {
      activeIdx = anchorElementsRef.current.length - 1
    }

    // Set only one anchor active and sync the URL hash
    const activeAnchor = anchorElementsRef.current[activeIdx]
    const sectionId = activeAnchor?.getAttribute(`data-${dataAttribute}-anchor`) || null

    setActiveSection(sectionId)
  }, [anchorElementsRef, targetRef, dataAttribute, offset, setActiveSection])

  const scrollTo = useCallback(
    (anchorElement: HTMLElement) => (event?: Event) => {
      if (event) event.preventDefault()
      const sectionId = anchorElement.getAttribute(`data-${dataAttribute}-anchor`)?.replace('#', '') || null
      if (!sectionId) return
      const sectionElement = document.getElementById(sectionId)
      if (!sectionElement) return

      const scrollToElement: HTMLElement | Window | null = targetRef?.current === document ? window : (targetRef?.current as HTMLElement)

      let customOffset = offset
      const dataOffset = anchorElement.getAttribute(`data-${dataAttribute}-offset`)
      if (dataOffset) {
        customOffset = parseInt(dataOffset, 10)
      }

      const scrollTop = sectionElement.offsetTop - customOffset

      if (scrollToElement && 'scrollTo' in scrollToElement) {
        scrollToElement.scrollTo({
          top: scrollTop,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
      setActiveSection(sectionId, true)
    },
    [dataAttribute, offset, smooth, targetRef, setActiveSection],
  )

  // Scroll to the section if the ID is present in the URL hash
  const scrollToHashSection = useCallback(() => {
    if (!history) return
    const hash = CSS.escape(window.location.hash.replace('#', ''))

    if (hash) {
      const targetElement = selfRef.current?.querySelector(`[data-${dataAttribute}-anchor="${hash}"]`)
      if (targetElement instanceof HTMLElement) {
        scrollTo(targetElement)()
      }
    }
  }, [dataAttribute, scrollTo, history])

  useEffect(() => {
    // Query elements and store them in the ref, avoiding unnecessary re-renders
    if (selfRef.current) {
      anchorElementsRef.current = Array.from(selfRef.current.querySelectorAll(`[data-${dataAttribute}-anchor]`))
    }

    const currentAnchors = (anchorElementsRef.current ?? []).map((item) => {
      const handler = scrollTo(item as HTMLElement)
      item.addEventListener('click', handler)
      return [item, handler] as const
    })

    const onScroll = (event: Event) => {
      const scrollElement = targetRef?.current === document ? window : (targetRef?.current as HTMLElement)
      if (!scrollElement) return

      if (scrollElement === window || (scrollElement instanceof HTMLElement && scrollElement.contains(event.target as Node))) {
        handleScroll()
      }
    }

    // Use window listener with capture to catch scroll events from targetRef even if set later
    window.addEventListener('scroll', onScroll, true)

    // Check if there's a hash in the URL and scroll to the corresponding section
    const initialFrame = requestAnimationFrame(() => {
      scrollToHashSection()
      handleScroll()
    })

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      currentAnchors.forEach(([item, handler]) => item.removeEventListener('click', handler))
      cancelAnimationFrame(initialFrame)
    }
  }, [targetRef, selfRef, handleScroll, dataAttribute, scrollTo, scrollToHashSection])

  return (
    <div data-slot="scrollspy" className={className} ref={selfRef}>
      {children}
    </div>
  )
}

export type ScrollspyTocItem = { id: string; label: string }

export type ScrollspyTocProps = Partial<typeof defaults> & {
  items: ScrollspyTocItem[]
  /** 可滚动的内容容器（或 document）。 */
  targetRef?: ScrollspyProps['targetRef']
  onUpdate?: (id: string) => void
  /** 是否同步地址栏 hash（上游默认开启，这里默认关闭）。 */
  history?: boolean
  className?: string
  style?: CSSProperties
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0a0a0a' : '#ffffff'
}

/** 按 reui 的 c-scrollspy-1 示例排好的目录：outline 按钮列表，滚到哪一节就高亮哪一项，点击平滑滚动到该节。 */
export function ScrollspyToc({ items, targetRef, onUpdate, history = false, className, style, ...props }: ScrollspyTocProps) {
  const { indicator, accent, offset, smooth, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null)
  const [box, setBox] = useState<{ y: number; height: number } | null>(null)
  const glide = indicator === 'glide'

  // 高亮块是一个独立的绝对定位元素，按当前条目的位置滑动（不用 layoutId：滚动容器里每帧都会触发投影重算）。
  useLayoutEffect(() => {
    const el = active ? listRef.current?.querySelector<HTMLElement>(`[data-scrollspy-anchor="${CSS.escape(active)}"]`) : null
    if (el) setBox({ y: el.offsetTop, height: el.offsetHeight })
  }, [active, items])

  return (
    <nav aria-label="On this page" className={cn('w-[150px] shrink-0', className)} style={{ '--accent-c': accent, '--accent-ink': inkFor(accent), ...style } as CSSProperties}>
      <div ref={listRef} className="relative">
        {glide && box && (
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 rounded-md bg-(--accent-c)"
            initial={false}
            animate={{ y: box.y, height: box.height }}
            transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce }}
          />
        )}
        <Scrollspy
          offset={offset}
          smooth={smooth}
          history={history}
          targetRef={targetRef}
          onUpdate={(id) => {
            setActive(id)
            onUpdate?.(id)
          }}
          className="relative flex flex-col gap-2.5"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              data-scrollspy-anchor={item.id}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium whitespace-nowrap shadow-xs outline-none transition-[color,background-color,border-color] duration-200 hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-(--accent-c)/50',
                glide
                  ? 'bg-transparent data-[active=true]:border-transparent data-[active=true]:text-(--accent-ink) data-[active=true]:hover:bg-transparent'
                  : 'bg-background data-[active=true]:border-transparent data-[active=true]:bg-(--accent-c) data-[active=true]:text-(--accent-ink)',
              )}
            >
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </Scrollspy>
      </div>
    </nav>
  )
}