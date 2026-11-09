// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/number-field/demos/hero/css-modules/index.tsx
// Source: https://github.com/mui/base-ui/blob/6a29b4b/packages/react/src/number-field/scrub-area/NumberFieldScrubArea.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  accent: '#4c9aff',
  size: 32,
  radius: 8,
  buttonLayout: 'split',
  labelPlacement: 'inside',
  scrubSensitivity: 3,
  meter: true,
}
/* @motif:end */

export type InputNumberScrubProps = Partial<typeof defaults> & {
  /** 可见标签：既是拖拽手柄，也是输入框的无障碍名称。 */
  label?: string
  /** 标签在框内时用图标代替文字（文字仍然留给读屏器）。 */
  icon?: ReactNode
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** 一次操作结束时调用：松开拖拽、松开按钮、按键、提交输入。适合写撤销历史或保存。 */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Shift 与 PageUp / PageDown 的步长，默认 step × 10。 */
  largeStep?: number
  /** Alt 的精细步长；不传则 Alt 不起作用。 */
  smallStep?: number
  /** 显示的小数位数，默认取 step（和 smallStep）的小数位。 */
  decimals?: number
  /** 单位后缀，例如 px、%、°。 */
  unit?: string
  disabled?: boolean
  name?: string
  id?: string
  /** 鼠标拖拽时锁定指针，可以一直拖下去；Safari 和不允许锁定的 iframe 会自动退回普通拖拽。 */
  pointerLock?: boolean
  /** 聚焦后滚轮调整数值。 */
  wheel?: boolean
  /** 强制显示拖拽中的样子（演示自动播放用）。 */
  scrubbing?: boolean
  className?: string
  style?: CSSProperties
}

const NUMBER = String.raw`-?(?:\d+\.?\d*|\.\d+)`
const MATH = new RegExp(`^(${NUMBER})\\s*([-+*/×÷])\\s*(${NUMBER})$`)

function decimalsOf(n: number) {
  const text = String(n)
  const exp = text.indexOf('e-')
  if (exp >= 0) return Number(text.slice(exp + 2))
  const dot = text.indexOf('.')
  return dot < 0 ? 0 : text.length - dot - 1
}

/** 解析输入：允许带单位、逗号小数点，以及「24*2」这样的一步算式（设计工具里常见）。 */
function parse(text: string, unit: string): number | null {
  let t = text.trim().replace(/,/g, '.')
  if (unit && t.toLowerCase().endsWith(unit.toLowerCase())) t = t.slice(0, -unit.length).trim()
  if (t === '') return null
  const direct = Number(t)
  if (Number.isFinite(direct)) return direct
  const match = MATH.exec(t)
  if (!match) return null
  const a = Number(match[1])
  const b = Number(match[3])
  const op = match[2]
  const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' || op === '×' ? a * b : b === 0 ? NaN : a / b
  return Number.isFinite(result) ? result : null
}

/** Safari 锁定指针时会弹出带布局位移的提示条，上游也在 WebKit 上关掉了锁定。 */
function isSafari() {
  return typeof navigator !== 'undefined' && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent)
}

/** 虚拟指针跟随视觉视口缩放的倒数，和系统指针一样不随双指缩放变大。 */
function placeCursor(el: HTMLElement | null, at: { x: number; y: number }) {
  if (!el) return
  const scale = window.visualViewport?.scale ?? 1
  el.style.transform = `translate3d(${at.x - 13}px, ${at.y - 7}px, 0) scale(${1 / scale})`
}

// 环境不允许锁定（沙箱 iframe 没有 allow-pointer-lock、浏览器不支持）时，本页之后不再尝试：
// 浏览器每次拒绝都会在控制台记一条错误。刚按 Esc 退出后的短暂拒绝不算，下次还能锁。
let lockDenied = false

function requestLock(el: HTMLElement) {
  if (lockDenied) return
  try {
    const pending: unknown = el.requestPointerLock()
    if (pending instanceof Promise) {
      void pending.catch((error: unknown) => {
        if (error instanceof DOMException && (error.name === 'NotSupportedError' || /sandbox/i.test(error.message))) lockDenied = true
      })
    }
  } catch {
    // 老实现不返回 Promise 且直接抛错：视为不支持，退回普通拖拽。
    lockDenied = true
  }
}

/** 拖拽时的虚拟指针：左右双箭头。 */
export function ScrubCursorIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden width="26" height="14" viewBox="0 0 24 14" fill="black" stroke="white" className={className} style={{ display: 'block', ...style }}>
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  )
}

const ICONS = {
  minus: 'M3 8h10',
  plus: 'M3 8h10M8 3v10',
  up: 'm4.5 9.75 3.5-3.5 3.5 3.5',
  down: 'm4.5 6.25 3.5 3.5 3.5-3.5',
} as const

/**
 * 可拖拽的数字输入框：按住标签左右拖动调整数值（Shift 十倍步长），也支持 − / + 按钮（按住连发）、
 * 聚焦后的滚轮、方向键、Home / End 和直接输入。input 是 role="spinbutton"。
 */
export function InputNumberScrub({
  label = 'Value',
  icon,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = -Infinity,
  max = Infinity,
  step = 1,
  largeStep,
  smallStep,
  decimals,
  unit = '',
  disabled = false,
  name,
  id: idProp,
  pointerLock = true,
  wheel = true,
  scrubbing: forcedScrubbing,
  className,
  style,
  ...props
}: InputNumberScrubProps) {
  const { accent, size, radius, buttonLayout, labelPlacement, scrubSensitivity, meter } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const autoId = useId()
  const id = idProp ?? `scrub${autoId}`
  const places = decimals ?? Math.max(decimalsOf(step), smallStep ? decimalsOf(smallStep) : 0)
  const roundClamp = (n: number) => Number(Math.min(max, Math.max(min, n)).toFixed(places))

  const [inner, setInner] = useState(() => roundClamp(defaultValue ?? (Number.isFinite(min) ? Math.max(min, 0) : 0)))
  const [draft, setDraft] = useState<string | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const [locked, setLocked] = useState(false)
  const current = value ?? inner

  const inputRef = useRef<HTMLInputElement>(null)
  const handleRef = useRef<HTMLLabelElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement | null>(null)
  const valueRef = useRef(current)
  const wall = useRef(0)
  const scrub = useRef<{ acc: number; moved: boolean; lastX: number; fine: boolean } | null>(null)
  const cursorAt = useRef({ x: 0, y: 0 })
  const hold = useRef<number | null>(null)

  useLayoutEffect(() => {
    valueRef.current = current
  }, [current])

  const format = (n: number) => String(Number(n.toFixed(places)))
  const stepFor = (event: { shiftKey: boolean; altKey: boolean }) => (event.shiftKey ? (largeStep ?? step * 10) : event.altKey && smallStep ? smallStep : step)

  // 撞到上下限时整个框朝那个方向轻轻一顶（Web Animations，只动 transform）。
  const bump = (dir: number) => {
    const el = fieldRef.current
    if (!el || reduced || typeof el.animate !== 'function') return
    el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dir * 3}px)` }, { transform: 'translateX(0)' }], { duration: 240, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' })
  }

  const apply = (raw: number, commit = false) => {
    const next = roundClamp(raw)
    const over = raw > max ? 1 : raw < min ? -1 : 0
    if (over !== 0 && wall.current !== over) bump(over)
    wall.current = over
    if (next !== valueRef.current) {
      valueRef.current = next
      if (value === undefined) setInner(next)
      onValueChange?.(next)
    }
    if (commit) {
      wall.current = 0
      onValueCommit?.(next)
    }
  }

  const commitDraft = () => {
    if (draft === null) return
    setDraft(null)
    const parsed = parse(draft, unit)
    if (parsed !== null) apply(parsed, true)
  }

  // 拖拽、滚轮的全局监听只注册一次，通过 ref 拿到最新的闭包。
  const live = useRef({ apply, stepFor, sensitivity: scrubSensitivity, onValueCommit })
  useLayoutEffect(() => {
    live.current = { apply, stepFor, sensitivity: scrubSensitivity, onValueCommit }
  })

  useEffect(() => {
    if (!scrubbing) return
    const ownsLock = () => handleRef.current !== null && document.pointerLockElement === handleRef.current
    const onMove = (event: PointerEvent) => {
      const s = scrub.current
      if (!s) return
      event.preventDefault()
      const lockedNow = ownsLock()
      // 锁定后 clientX 不再变化，只能用 movementX；没锁定时用 clientX 的差值，不受缩放影响。
      const dx = lockedNow ? event.movementX : event.clientX - s.lastX
      s.lastX = event.clientX
      if (lockedNow) {
        // 虚拟指针越过视口边缘时从另一侧绕回来。
        const w = window.innerWidth
        const h = window.innerHeight
        let x = cursorAt.current.x + event.movementX
        let y = cursorAt.current.y + event.movementY
        if (x < 0) x += w
        else if (x > w) x -= w
        if (y < 0) y += h
        else if (y > h) y -= h
        cursorAt.current = { x, y }
        placeCursor(cursorRef.current, cursorAt.current)
      }
      s.acc += dx
      const { sensitivity } = live.current
      const steps = Math.trunc(s.acc / sensitivity)
      if (steps === 0) return
      s.acc -= steps * sensitivity
      s.moved = true
      live.current.apply(valueRef.current + steps * live.current.stepFor(event))
    }
    const onUp = () => {
      const s = scrub.current
      scrub.current = null
      if (ownsLock()) document.exitPointerLock()
      setScrubbing(false)
      setLocked(false)
      // 没有拖动就是一次点击：选中数值方便直接改写。
      if (s && !s.moved && s.fine) inputRef.current?.select()
      wall.current = 0
      live.current.onValueCommit?.(valueRef.current)
    }
    const onLockChange = () => setLocked(ownsLock())
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    document.addEventListener('pointerlockchange', onLockChange)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.removeEventListener('pointerlockchange', onLockChange)
      if (ownsLock()) document.exitPointerLock()
    }
  }, [scrubbing])

  useEffect(() => {
    const input = inputRef.current
    if (!input || !wheel || disabled) return
    let acc = 0
    // React 的 onWheel 是 passive，阻止不了页面滚动，所以挂原生监听；只在聚焦时接管。
    const onWheel = (event: WheelEvent) => {
      if (document.activeElement !== input) return
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      if (horizontal && !event.shiftKey) return
      const delta = horizontal ? event.deltaX : event.deltaY
      if (delta === 0) return
      event.preventDefault()
      acc += delta
      // 鼠标滚轮一格一步；触控板的细碎增量攒够再走。
      if (event.deltaMode === 0 && Math.abs(acc) < 40) return
      const dir = acc < 0 ? 1 : -1
      acc = 0
      live.current.apply(valueRef.current + dir * live.current.stepFor(event), true)
    }
    input.addEventListener('wheel', onWheel, { passive: false })
    return () => input.removeEventListener('wheel', onWheel)
  }, [wheel, disabled])

  useEffect(
    () => () => {
      if (hold.current !== null) window.clearTimeout(hold.current)
    },
    [],
  )

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLLabelElement>) => {
    if (disabled || event.button !== 0) return
    const fine = event.pointerType !== 'touch'
    event.preventDefault()
    // 触摸时不聚焦，免得弹出软键盘。
    if (fine) inputRef.current?.focus({ preventScroll: true })
    commitDraft()
    scrub.current = { acc: 0, moved: false, lastX: event.clientX, fine }
    cursorAt.current = { x: event.clientX, y: event.clientY }
    setScrubbing(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // 指针已经抬起。
    }
    if (event.pointerType === 'mouse' && pointerLock && !isSafari()) requestLock(event.currentTarget)
  }

  const stopHold = () => {
    if (hold.current === null) return
    window.clearTimeout(hold.current)
    hold.current = null
    wall.current = 0
    onValueCommit?.(valueRef.current)
  }

  // 按住按钮：先走一步，400ms 后每 60ms 连发（与上游的节奏一致）。
  const startHold = (dir: 1 | -1, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return
    if (event.pointerType !== 'touch') {
      event.preventDefault()
      inputRef.current?.focus({ preventScroll: true })
    }
    commitDraft()
    const amount = stepFor(event)
    const tick = (delay: number) => {
      live.current.apply(valueRef.current + dir * amount)
      hold.current = window.setTimeout(() => tick(60), delay)
    }
    if (hold.current !== null) window.clearTimeout(hold.current)
    tick(400)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const big = largeStep ?? step * 10
    const base = () => {
      commitDraft()
      return valueRef.current
    }
    let next: number | null = null
    switch (event.key) {
      case 'ArrowUp':
        next = base() + stepFor(event)
        break
      case 'ArrowDown':
        next = base() - stepFor(event)
        break
      case 'PageUp':
        next = base() + big
        break
      case 'PageDown':
        next = base() - big
        break
      case 'Home':
        if (draft === null && Number.isFinite(min)) next = min
        break
      case 'End':
        if (draft === null && Number.isFinite(max)) next = max
        break
      case 'Enter':
        commitDraft()
        event.currentTarget.select()
        return
      case 'Escape':
        if (draft !== null) {
          event.preventDefault()
          setDraft(null)
        }
        return
      default:
        return
    }
    if (next === null) return
    event.preventDefault()
    apply(next, true)
  }

  const active = forcedScrubbing ?? scrubbing
  const r = Math.min(radius, size / 2)
  const innerR = Math.max(r - 3, 2)
  const fontSize = Math.round(Math.min(16, Math.max(12, size * 0.4)))
  const glyph = Math.round(size * 0.4)
  const bounded = Number.isFinite(min) && Number.isFinite(max) && max > min
  const ratio = bounded ? (current - min) / (max - min) : 0
  const display = draft ?? format(current)
  const inside = labelPlacement !== 'above'
  const centered = buttonLayout === 'split'
  // 「px」「ms」这类字母单位前留一点空，「°」「%」紧贴数字（与 Figma 等设计工具一致）。
  const spacedUnit = /^\p{L}/u.test(unit)

  const stepButton = (dir: 1 | -1, shape: string, buttonClass: string, buttonStyle?: CSSProperties) => {
    const atBound = dir > 0 ? current >= max : current <= min
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${dir > 0 ? 'Increase' : 'Decrease'} ${label}`}
        aria-controls={id}
        aria-disabled={atBound || undefined}
        disabled={disabled}
        onPointerDown={(event) => startHold(dir, event)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={(event) => {
          // 指针按下时已经走过一步（detail > 0）；这里只处理读屏器等没有指针的点击。
          if (event.detail > 0) return
          commitDraft()
          apply(valueRef.current + dir * stepFor(event), true)
        }}
        className={cn(
          'relative z-[1] grid place-items-center text-muted-foreground outline-none select-none transition-[color,background-color,opacity] duration-150 hover:bg-foreground/[0.07] hover:text-foreground active:bg-foreground/[0.12] [&>svg]:transition-transform [&>svg]:duration-100 active:[&>svg]:scale-[0.82] motion-reduce:[&>svg]:transition-none',
          atBound && 'opacity-40',
          buttonClass,
        )}
        style={buttonStyle}
      >
        <svg aria-hidden viewBox="0 0 16 16" width={glyph} height={glyph} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={shape} />
        </svg>
      </button>
    )
  }

  // 空间不够时按钮先缩（最多到 60%），数字最后才让位。
  const square: CSSProperties = { width: size - 6, minWidth: Math.round(size * 0.6), margin: 3, borderRadius: innerR }

  // 拖动时指针一直停在标签上，所以强调色要直接按 active 切换，不能被 hover 盖掉。
  const handleClass = cn('cursor-ew-resize touch-none select-none transition-colors duration-150', active ? 'text-(--c)' : 'text-muted-foreground hover:text-foreground')

  return (
    <div
      className={cn('group/scrub flex min-w-0 flex-col gap-1.5', disabled && 'pointer-events-none opacity-50', className)}
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      style={{ '--c': accent, '--r': `${r}px`, '--h': `${size}px`, fontSize, ...style } as CSSProperties}
    >
      {!inside && (
        <label ref={handleRef} htmlFor={id} data-scrub-handle onPointerDown={onHandlePointerDown} className={cn('w-fit py-0.5 text-[0.86em] leading-none font-medium', handleClass)}>
          {label}
        </label>
      )}
      {/* 具名分组：外层容器自己带 group 时，聚焦一个字段不会点亮同一容器里的其他字段。 */}
      <div ref={fieldRef} data-scrub-field className="relative flex h-(--h) items-stretch rounded-(--r) bg-foreground/[0.05] ring-1 ring-foreground/10 ring-inset transition-[background-color] duration-150 hover:bg-foreground/[0.07]">
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 ring-1 ring-(--c) ring-inset transition-opacity duration-150 group-focus-within/scrub:opacity-100 group-data-[active=true]/scrub:opacity-100" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-data-[active=true]/scrub:opacity-100"
          style={{ boxShadow: '0 0 0 3px color-mix(in oklab, var(--c) 22%, transparent), 0 6px 22px -6px color-mix(in oklab, var(--c) 55%, transparent)' }}
        />
        {inside && (
          <label
            ref={handleRef}
            htmlFor={id}
            data-scrub-handle
            onPointerDown={onHandlePointerDown}
            className={cn('relative z-[1] flex shrink-0 items-center justify-center font-medium', icon ? 'w-[calc(var(--h)*0.82)] pl-0.5' : 'pr-0.5 pl-[calc(var(--h)*0.3)]', handleClass)}
          >
            {icon ? (
              <>
                <span aria-hidden className="grid place-items-center">
                  {icon}
                </span>
                <span className="sr-only">{label}</span>
              </>
            ) : (
              <span className="text-[0.92em]">{label}</span>
            )}
          </label>
        )}
        {buttonLayout === 'split' && stepButton(-1, ICONS.minus, '', square)}
        <div
          className={cn('flex min-w-0 flex-[1_1_auto] shrink-[0.02] cursor-text items-center overflow-hidden', centered ? 'justify-center-safe px-1' : inside ? 'justify-start pr-2 pl-0.5' : 'justify-start px-2.5')}
          onPointerDown={(event) => {
            if (event.target === inputRef.current || disabled) return
            event.preventDefault()
            inputRef.current?.focus({ preventScroll: true })
            inputRef.current?.select()
          }}
        >
          {/* 隐藏的同文字 span 撑开宽度，输入框绝对定位盖在上面：单位能紧跟在数字后面。 */}
          <span className="relative shrink-0">
            <span aria-hidden className="invisible block pr-px font-medium whitespace-pre tabular-nums">
              {display || ' '}
            </span>
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="text"
              role="spinbutton"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              size={1}
              disabled={disabled}
              aria-valuenow={current}
              aria-valuemin={Number.isFinite(min) ? min : undefined}
              aria-valuemax={Number.isFinite(max) ? max : undefined}
              aria-valuetext={unit ? `${format(current)} ${unit}` : format(current)}
              value={display}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              onBlur={commitDraft}
              className="absolute inset-0 h-full w-full min-w-0 bg-transparent p-0 font-medium text-foreground tabular-nums caret-(--c) outline-none selection:bg-(--c)/35"
            />
          </span>
          {unit && (
            <span aria-hidden className={cn('shrink-0 text-muted-foreground', spacedUnit && 'ml-[0.25em]')}>
              {unit}
            </span>
          )}
        </div>
        {buttonLayout === 'split' && stepButton(1, ICONS.plus, '', square)}
        {buttonLayout === 'end' && (
          <span className="flex shrink-0 items-stretch">
            {stepButton(-1, ICONS.minus, '', { ...square, marginRight: 0 })}
            {stepButton(1, ICONS.plus, '', square)}
          </span>
        )}
        {buttonLayout === 'stacked' && (
          <span className="relative z-[1] flex w-[calc(var(--h)*0.62)] shrink-0 flex-col border-l border-foreground/10 p-[3px]">
            {stepButton(1, ICONS.up, 'min-h-0 flex-1', { borderRadius: `${innerR}px ${innerR}px 2px 2px` })}
            {stepButton(-1, ICONS.down, 'min-h-0 flex-1', { borderRadius: `2px 2px ${innerR}px ${innerR}px` })}
          </span>
        )}
        {meter && bounded && (
          <span aria-hidden className="pointer-events-none absolute bottom-0 h-[2px] overflow-hidden rounded-full bg-foreground/10 opacity-0 transition-opacity duration-200 group-focus-within/scrub:opacity-60 group-data-[active=true]/scrub:opacity-100" style={{ left: Math.max(r, 8), right: Math.max(r, 8) }}>
            <span className="absolute inset-0 origin-left rounded-full bg-(--c)" style={{ transform: `scaleX(${Math.min(1, Math.max(0, ratio))})` }} />
          </span>
        )}
      </div>
      {scrubbing &&
        typeof document !== 'undefined' &&
        createPortal(
          locked ? (
            <span
              ref={(el) => {
                cursorRef.current = el
                placeCursor(el, cursorAt.current)
              }}
              aria-hidden
              className="pointer-events-none fixed top-0 left-0 z-[2147483647]"
              style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 50%))' }}
            >
              <ScrubCursorIcon />
            </span>
          ) : (
            // 没锁定时铺一层透明遮罩，指针离开手柄后仍然是左右箭头。
            <div aria-hidden className="fixed inset-0 z-[2147483647] cursor-ew-resize" />
          ),
          document.body,
        )}
    </div>
  )
}
