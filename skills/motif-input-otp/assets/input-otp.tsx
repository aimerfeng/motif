// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Guilherme Rodz
// Source: https://github.com/guilhermerodz/input-otp/blob/cf81845/packages/input-otp/src/input.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  length: 6,
  variant: 'boxes',
  color: '#818cf8',
  radius: 12,
  size: 52,
  separator: true,
  spring: {
    visualDuration: 0.28,
    bounce: 0.35,
  },
}
/* @motif:end */

export type InputOtpProps = Partial<typeof defaults> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** 填满所有位数时触发。 */
  onComplete?: (value: string) => void
  status?: 'idle' | 'error' | 'success'
  /** 只允许数字，或字母加数字。 */
  charset?: 'numeric' | 'alphanumeric'
  /** 强制显示聚焦外观（演示自动播放用）。 */
  focused?: boolean
  disabled?: boolean
  name?: string
  label?: string
  className?: string
  style?: CSSProperties
}

const STATUS_COLORS = { error: '#f43f5e', success: '#34d399' } as const

/**
 * 验证码输入：真正的输入框是一个覆盖在格子上的透明 input（粘贴、短信自动填充、退格都是原生行为），
 * 格子只负责显示。光标始终在末尾，所以用不着处理格子间的焦点跳转。
 */
export function InputOtp({ value, defaultValue = '', onChange, onComplete, status = 'idle', charset = 'numeric', focused: forcedFocus, disabled, name, label = 'Verification code', className, style, ...props }: InputOtpProps) {
  const { length, variant, color, radius, size, separator, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inner, setInner] = useState(defaultValue)
  const [focus, setFocus] = useState(false)
  const text = (value ?? inner).slice(0, length)
  const isFocused = forcedFocus ?? focus
  const accent = status === 'idle' ? color : STATUS_COLORS[status]
  const active = Math.min(text.length, length - 1)
  const split = separator && variant !== 'underline' && length % 2 === 0 && length >= 4 ? length / 2 : -1

  const sanitize = (raw: string) => (charset === 'numeric' ? raw.replace(/\D/g, '') : raw.replace(/[^a-z0-9]/gi, '').toUpperCase()).slice(0, length)

  const change = (raw: string) => {
    const next = sanitize(raw)
    if (value === undefined) setInner(next)
    onChange?.(next)
    if (next.length === length && text.length !== length) onComplete?.(next)
  }

  const pop = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const gapPx = variant === 'underline' ? 10 : 8
  const slotWidth = variant === 'underline' ? Math.round(size * 0.7) : size

  return (
    <div className={cn('relative inline-block', className)} style={{ '--c': accent, ...style } as CSSProperties}>
      <motion.div
        role="group"
        aria-hidden
        className="flex items-center"
        style={{ gap: gapPx }}
        animate={status === 'error' && !reduced ? { x: [0, -9, 8, -6, 4, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        key={status === 'error' ? `error-${text.length}` : 'ok'}
      >
        {Array.from({ length }, (_, i) => {
          const char = text[i]
          const current = isFocused && i === active && !disabled
          const filledLast = isFocused && text.length === length && i === length - 1
          const lit = current || filledLast || status !== 'idle'
          return (
            <div key={i} className="flex items-center" style={{ gap: gapPx }}>
              {i === split && <span className="mr-0.5 h-0.5 w-2.5 rounded-full bg-foreground/25" />}
              <div
                className={cn(
                  'relative grid place-items-center font-mono font-semibold text-foreground transition-colors duration-200',
                  variant === 'underline' ? 'border-b-2' : 'border bg-foreground/[0.04]',
                  variant === 'underline' ? 'border-foreground/20' : 'border-input',
                  lit && 'border-(--c)',
                  disabled && 'opacity-50',
                )}
                style={{
                  width: slotWidth,
                  height: variant === 'underline' ? Math.round(size * 0.95) : Math.round(size * 1.12),
                  fontSize: Math.round(size * 0.46),
                  borderRadius: variant === 'underline' ? 0 : radius,
                  boxShadow: lit && variant !== 'underline' ? `0 0 0 3px color-mix(in oklab, ${accent} ${current ? 28 : 16}%, transparent)` : undefined,
                }}
              >
                {char !== undefined && (
                  <motion.span
                    key={`${i}-${char}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 6 }}
                    animate={status === 'success' && !reduced ? { opacity: 1, scale: 1, y: [0, -7, 0] } : { opacity: 1, scale: 1, y: 0 }}
                    transition={status === 'success' ? { duration: 0.5, delay: i * 0.06 } : pop}
                    style={status === 'success' ? { color: STATUS_COLORS.success } : undefined}
                  >
                    {char}
                  </motion.span>
                )}
                {char === undefined && current && (
                  <motion.span
                    aria-hidden
                    className="h-[46%] w-0.5 rounded-full bg-(--c)"
                    animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </motion.div>
      <input
        ref={inputRef}
        id={uid}
        name={name}
        aria-label={label}
        aria-invalid={status === 'error' || undefined}
        disabled={disabled}
        value={text}
        maxLength={length}
        inputMode={charset === 'numeric' ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        spellCheck={false}
        autoCapitalize="off"
        onChange={(event) => change(event.target.value)}
        onFocus={(event) => {
          setFocus(true)
          const end = event.target.value.length
          requestAnimationFrame(() => event.target.setSelectionRange(end, end))
        }}
        onBlur={() => setFocus(false)}
        // 光标固定在末尾：点击、方向键都不该把光标放到中间。
        onSelect={(event) => {
          const el = event.currentTarget
          if (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length) el.setSelectionRange(el.value.length, el.value.length)
        }}
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
      />
    </div>
  )
}
