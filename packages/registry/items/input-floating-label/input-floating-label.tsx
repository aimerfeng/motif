// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/animated-input/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'outline',
  color: '#a78bfa',
  radius: 12,
  size: 'md',
  spring: {
    visualDuration: 0.3,
    bounce: 0.15,
  },
  label: 'Email address',
  placeholder: 'you@company.com',
}
/* @motif:end */

export type InputFloatingLabelProps = Partial<typeof defaults> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'value' | 'defaultValue' | 'onChange' | 'placeholder'> & {
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    /** 输入框前面的图标。 */
    leading?: ReactNode
    error?: string
    hint?: string
    /** 强制显示聚焦外观（演示自动播放用）。 */
    focused?: boolean
    ref?: Ref<HTMLInputElement>
    className?: string
    style?: CSSProperties
  }

const HEIGHTS = { sm: 46, md: 54, lg: 62 } as const
const FONT = { sm: 14, md: 15, lg: 16 } as const

/** 浮动标签输入框：聚焦或有内容时标签缩小飘到左上角；密码框自带显示 / 隐藏；错误信息展开并抖动。 */
export function InputFloatingLabel({ value, defaultValue, onChange, leading, error, hint, focused: forcedFocus, ref, className, style, type = 'text', disabled, id, ...rest }: InputFloatingLabelProps) {
  const { variant, color, radius, size, spring, label, placeholder, ...inputProps } = { ...defaults, ...rest }
  const reduced = useReducedMotion()
  const uid = useId()
  const inputId = id ?? uid
  const [inner, setInner] = useState(defaultValue ?? '')
  const [focus, setFocus] = useState(false)
  const [reveal, setReveal] = useState(false)
  const text = value ?? inner
  const isFocused = forcedFocus ?? focus
  const floated = isFocused || text.length > 0
  const height = HEIGHTS[size as keyof typeof HEIGHTS] ?? 54
  const font = FONT[size as keyof typeof FONT] ?? 15
  const padX = leading ? 44 : 16
  const invalid = Boolean(error)
  const accent = invalid ? '#f43f5e' : color
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const isPassword = type === 'password'

  return (
    <div className={cn('w-full', className)} style={{ '--c': accent, ...style } as CSSProperties}>
      <div
        className={cn(
          'relative transition-colors duration-200',
          variant === 'outline' && 'border bg-foreground/[0.03]',
          variant === 'filled' && 'border-b-2 bg-foreground/[0.06]',
          variant === 'underline' && 'border-b',
          isFocused || invalid ? 'border-(--c)' : 'border-input',
          variant === 'filled' && !(isFocused || invalid) && 'border-foreground/20',
          disabled && 'opacity-50',
        )}
        style={{
          height,
          borderRadius: variant === 'outline' ? radius : variant === 'filled' ? `${radius}px ${radius}px 0 0` : 0,
          boxShadow: variant === 'outline' && (isFocused || invalid) ? `0 0 0 3.5px color-mix(in oklab, ${accent} 24%, transparent)` : undefined,
        }}
      >
        {leading && (
          <span className={cn('pointer-events-none absolute top-1/2 left-3.5 grid size-5 -translate-y-1/2 place-items-center transition-colors duration-200 [&>svg]:size-full', isFocused ? 'text-(--c)' : 'text-muted-foreground')}>{leading}</span>
        )}
        <motion.label
          htmlFor={inputId}
          className="pointer-events-none absolute top-0 origin-left leading-5 whitespace-nowrap"
          style={{ left: variant === 'underline' && !leading ? 0 : padX, fontSize: font, color: isFocused || invalid ? accent : 'var(--muted-foreground)' }}
          initial={false}
          animate={{ y: floated ? 8 : height / 2 - 10, scale: floated ? 0.78 : 1 }}
          transition={transition}
        >
          {label}
        </motion.label>
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          value={text}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={error || hint ? `${inputId}-note` : undefined}
          placeholder={floated ? placeholder : ''}
          onChange={(event) => {
            if (value === undefined) setInner(event.target.value)
            onChange?.(event.target.value)
          }}
          onFocus={(event) => {
            setFocus(true)
            inputProps.onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocus(false)
            inputProps.onBlur?.(event)
          }}
          className="absolute inset-0 h-full w-full bg-transparent pt-[22px] pb-1 text-foreground outline-none placeholder:text-muted-foreground/50"
          style={{ fontSize: font, paddingLeft: variant === 'underline' && !leading ? 0 : padX, paddingRight: isPassword ? 46 : 16, caretColor: accent }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            onClick={() => setReveal((v) => !v)}
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--c)"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="3" />
              {!reveal && <path d="m4 4 16 16" />}
            </svg>
          </button>
        )}
        {variant === 'underline' && (
          <motion.span
            aria-hidden
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-(--c)"
            initial={false}
            animate={{ scaleX: isFocused || invalid ? 1 : 0 }}
            transition={transition}
          />
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {(error || hint) && (
          <motion.p
            key={error ? 'error' : 'hint'}
            id={`${inputId}-note`}
            role={error ? 'alert' : undefined}
            className={cn('px-1 pt-1.5 text-xs', error ? 'text-rose-400' : 'text-muted-foreground')}
            initial={{ opacity: 0, y: reduced ? 0 : -4 }}
            animate={{ opacity: 1, y: 0, x: error && !reduced ? [0, -5, 4, -2, 0] : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {error ?? hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
