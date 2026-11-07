// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-subscribe-button.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useState, type ComponentProps, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Subscribe',
  doneLabel: 'Subscribed',
  color: '#f2f0eb',
  doneStyle: 'tinted',
  icon: 'bell',
  radius: 20,
  spring: {
    visualDuration: 0.38,
    bounce: 0.25,
  },
}
/* @motif:end */

export type SubscribeButtonProps = Partial<typeof defaults> &
  Omit<ComponentProps<'button'>, keyof typeof defaults> & {
    /** 受控用法：是否已订阅。不传时按钮自己记住状态。 */
    subscribed?: boolean
    onSubscribedChange?: (subscribed: boolean) => void
  }

const ICONS: Record<string, string> = {
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a1.94 1.94 0 0 0 3.4 0',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm17 2-9 6-9-6',
  plus: 'M12 5v14M5 12h14',
}

/** 底色上用深色字吗：比较白字和深色字（#0b0b10，相对亮度约 0.0035）的 WCAG 对比度。 */
function prefersDarkInk(hex: string): boolean {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return false
  const value = Number.parseInt(match[1]!, 16)
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (luminance + 0.05) / 0.0535 > 1.05 / (luminance + 0.05)
}

/** 已订阅时按钮的外观：淡色底、描边，或保持实心。 */
function doneLook(style: string, color: string, ink: string): CSSProperties {
  const quietInk = `color-mix(in oklab, ${color} 55%, var(--foreground))`
  if (style === 'solid') return { backgroundColor: color, color: ink, boxShadow: `inset 0 0 0 1px ${color}` }
  if (style === 'outline') return { backgroundColor: 'transparent', color: quietInk, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 50%, transparent)` }
  return { backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color: quietInk, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 22%, transparent)` }
}

/**
 * 订阅按钮：点击后「订阅」向右滑出，「已订阅」从上方落下，按钮换成次要样式；再点一次退订。
 * 两段文案始终挂在同一个格子里（宽度取较长的那个），只按状态切换动画目标，按钮本身从不替换，焦点不会丢。
 */
export function SubscribeButton({ className, style, subscribed, onSubscribedChange, onClick, type = 'button', ...props }: SubscribeButtonProps) {
  const { label, doneLabel, color, doneStyle, icon, radius, spring, ...rest } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [own, setOwn] = useState(false)
  const on = subscribed ?? own
  const ink = prefersDarkInk(color) ? '#0b0b10' : '#ffffff'
  const iconPath = ICONS[icon]

  const enter = { delay: 0.1 }
  const idleTarget = on ? { x: reduced ? 0 : 48, opacity: 0 } : { x: 0, opacity: 1 }
  const doneTarget = on ? { y: 0, opacity: 1 } : { y: reduced ? 0 : '-120%', opacity: 0 }

  return (
    <>
      <button
        type={type}
        {...rest}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (subscribed === undefined) setOwn(!on)
          onSubscribedChange?.(!on)
        }}
        className={cn(
          'relative inline-flex h-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden px-5 text-sm font-semibold tracking-tight select-none',
          'transition-[background-color,color,box-shadow,scale] duration-300 ease-out active:scale-[0.97]',
          // 外观用了内联 box-shadow，焦点环改用 outline，不会被覆盖。
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        style={{
          borderRadius: radius,
          ...(on ? doneLook(doneStyle, color, ink) : { backgroundColor: color, color: ink, boxShadow: `inset 0 0 0 1px ${color}` }),
          ...style,
        }}
      >
        <span className="grid place-items-center">
          {/* 未订阅：离场时快速向右滑出（被按钮裁掉），回来时稍晚一点淡入。 */}
          <motion.span
            aria-hidden={on}
            className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap"
            initial={false}
            animate={idleTarget}
            transition={on ? { duration: 0.14, ease: 'easeIn' } : { duration: 0.24, ease: [0.22, 1, 0.36, 1], ...enter }}
          >
            {iconPath && (
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={iconPath} />
              </svg>
            )}
            {label}
          </motion.span>

          {/* 已订阅：等上一段让开后从上方落下（弹簧），对勾随后一笔画出。 */}
          <motion.span
            aria-hidden={!on}
            className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap"
            initial={false}
            animate={doneTarget}
            transition={
              on
                ? { y: { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce, ...enter }, opacity: { duration: 0.18, ...enter } }
                : { duration: 0.16, ease: 'easeIn' }
            }
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <motion.path
                d="m5 12.5 4.5 4.5L19 7.5"
                initial={false}
                // 圆头线帽在长度为 0 时会留下一个点：开始画之前先隐藏。
                animate={{ pathLength: on || reduced ? 1 : 0, opacity: on || reduced ? 1 : 0 }}
                transition={
                  on && !reduced
                    ? { pathLength: { duration: 0.32, delay: 0.24, ease: 'easeOut' }, opacity: { duration: 0.01, delay: 0.24 } }
                    : { duration: 0 }
                }
              />
            </svg>
            {doneLabel}
          </motion.span>
        </span>
      </button>
      {/* 状态播报放在按钮外面，避免按钮的可访问名称把文案念两遍。 */}
      <span className="sr-only" aria-live="polite">
        {on ? doneLabel : ''}
      </span>
    </>
  )
}
