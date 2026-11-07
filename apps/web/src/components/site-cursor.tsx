'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { cursorEnabled, cursorPreferred, cursorStill, cursorSupported, setCursorPreferred, subscribeCursor } from '@/lib/cursor'

/*
 * 站点的鼠标样式（docs/decisions/0010 第 3 节）：一个精确跟随的小点 + 一个弹性跟随的细圈。
 * 指到不同的东西时变形，告诉用户「这里能做什么」：链接和按钮圈放大，市场卡片变成「查看」，
 * 文字上收成竖线（还能选中），输入框和预览沙箱（iframe）里交还给系统光标。
 * 只改 transform 和 opacity；指针停下、细圈追上之后 rAF 就停。
 */

type CursorState = 'default' | 'link' | 'view' | 'text' | 'hidden'

/** 要打字的地方：交还系统的插入符。 */
const TEXT_ENTRY = 'input:not([type=button],[type=submit],[type=reset],[type=checkbox],[type=radio],[type=range],[type=color],[type=file]), textarea, select, [contenteditable]:not([contenteditable=false])'
const INTERACTIVE = 'a[href], button:not(:disabled), [role=button], [role=tab], [role=menuitem], [role=option], [role=switch], [role=slider], label, summary, input'
const TEXT = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, td, th, figcaption, pre, code'

interface Look {
  state: CursorState
  label?: string
}

function lookAt(target: EventTarget | null): Look {
  if (!(target instanceof Element) || target.tagName === 'IFRAME' || target.closest(TEXT_ENTRY)) return { state: 'hidden' }
  const marked = target.closest<HTMLElement>('[data-cursor]')
  if (marked?.dataset.cursor === 'view') return { state: 'view', label: marked.dataset.cursorLabel }
  if (marked?.dataset.cursor === 'grab') return { state: 'link' }
  if (target.closest(INTERACTIVE)) return { state: 'link' }
  if (target.closest(TEXT)) return { state: 'text' }
  return { state: 'default' }
}

/** 细圈追指针的时间常数：越小越跟手。70ms 能看出「跟上来」，又不会拖沓。 */
const LAG_SECONDS = 0.07

export function SiteCursor() {
  const t = useTranslations('cursor')
  const enabled = useSyncExternalStore(subscribeCursor, cursorEnabled, () => false)
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const [look, setLook] = useState<Look>({ state: 'hidden' })
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.dataset.customCursor = ''
    let x = 0
    let y = 0
    let ringX = 0
    let ringY = 0
    let frame = 0
    let last = 0
    let visible = false
    // 减少动态效果：细圈和点一起走，没有追赶。
    const lag = cursorStill() ? 0 : LAG_SECONDS

    const update = (next: Look) => setLook((previous) => (previous.state === next.state && previous.label === next.label ? previous : next))
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      const k = lag === 0 ? 1 : 1 - Math.exp(-dt / lag)
      ringX += (x - ringX) * k
      ringY += (y - ringY) * k
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (Math.abs(x - ringX) + Math.abs(y - ringY) > 0.3) frame = requestAnimationFrame(tick)
      else {
        frame = 0
        last = 0
      }
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      if (!visible) {
        // 从窗口外进来：细圈直接出现在指针处，不从上一次离开的地方飞过来。
        visible = true
        ringX = x
        ringY = y
        update(lookAt(event.target))
      }
      frame ||= requestAnimationFrame(tick)
    }
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') update(lookAt(event.target))
    }
    const onLeave = () => {
      visible = false
      update({ state: 'hidden' })
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setPressed(true)
    }
    const onUp = () => setPressed(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    root.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      delete root.dataset.customCursor
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      root.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div aria-hidden className="motif-cursor" data-state={look.state} data-pressed={pressed ? '' : undefined}>
      <div ref={ring} className="motif-cursor-anchor">
        <span className="motif-cursor-ring" />
        <span className="motif-cursor-label">{look.label ?? t('view')}</span>
      </div>
      <div ref={dot} className="motif-cursor-anchor">
        <span className="motif-cursor-dot" />
      </div>
    </div>
  )
}

/** 页脚的开关：设备不合适（触屏、减少动态效果）时不出现。 */
export function CursorToggle() {
  const t = useTranslations('cursor')
  const supported = useSyncExternalStore(subscribeCursor, cursorSupported, () => false)
  const on = useSyncExternalStore(subscribeCursor, cursorPreferred, () => true)
  if (!supported) return null
  return (
    <button type="button" aria-pressed={on} onClick={() => setCursorPreferred(!on)} className="transition-colors duration-(--duration-fast) hover:text-ink">
      {t('toggle')} · {on ? t('on') : t('off')}
    </button>
  )
}
