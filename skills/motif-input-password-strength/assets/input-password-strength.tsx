// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-51.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  meterStyle: 'bar',
  segments: 4,
  minLength: 8,
  requireSymbol: false,
  showChecklist: true,
  weakColor: '#ef4444',
  strongColor: '#10b981',
  radius: 6,
}
/* @motif:end */

export type InputPasswordStrengthProps = Partial<typeof defaults> & {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** 强制显示 / 隐藏（演示用）。 */
  visible?: boolean
  className?: string
  style?: CSSProperties
}

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.97 0 8.77 3.4 9.94 6.65a1 1 0 0 1 0 .7 10.8 10.8 0 0 1-1.5 2.8" />
    <path d="M14.08 14.16a3 3 0 0 1-4.24-4.24" />
    <path d="M17.48 17.5A10.75 10.75 0 0 1 2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14" />
    <path d="m2 2 20 20" />
  </svg>
)
const CheckIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-muted-foreground/80">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

/** 密码强度输入框：显示 / 隐藏开关 + 强度条 + 规则清单。 */
export function InputPasswordStrength({ label = 'Password', placeholder = 'Password', value, defaultValue, onChange, visible, className, style, ...props }: InputPasswordStrengthProps) {
  const { meterStyle, segments, minLength, requireSymbol, showChecklist, weakColor, strongColor, radius } = { ...defaults, ...props }
  const id = useId()
  const [inner, setInner] = useState(defaultValue ?? '')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const password = value ?? inner
  const shown = visible ?? isVisible

  const toggleVisibility = () => setIsVisible(!shown)

  const requirements = [
    { regex: new RegExp(`.{${Math.max(1, Math.round(minLength))},}`), text: `At least ${Math.round(minLength)} characters` },
    { regex: /[0-9]/, text: 'At least 1 number' },
    { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
    { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
    ...(requireSymbol ? [{ regex: /[^A-Za-z0-9]/, text: 'At least 1 symbol' }] : []),
  ]
  const strength = requirements.map((req) => ({ met: req.regex.test(password), text: req.text }))
  const total = strength.length
  const strengthScore = strength.filter((req) => req.met).length
  const ratio = strengthScore / total

  // 颜色按得分在弱色 -> 琥珀 -> 强色之间混合（上游是 red / orange / amber / emerald 四档）。
  const strengthColor =
    strengthScore === 0
      ? 'var(--border)'
      : ratio < 0.5
        ? `color-mix(in oklab, ${weakColor} ${Math.round(100 - ratio * 200)}%, #f59e0b)`
        : ratio < 1
          ? `color-mix(in oklab, #f59e0b ${Math.round(100 - (ratio - 0.5) * 200)}%, ${strongColor})`
          : strongColor

  const getStrengthText = () => {
    if (strengthScore === 0) return 'Enter a password'
    if (ratio <= 0.5) return 'Weak password'
    if (ratio < 1) return 'Medium password'
    return 'Strong password'
  }

  const segs = Math.max(2, Math.round(segments))
  const filled = Math.round(ratio * segs)

  return (
    <div className={cn('w-full', className)} style={style}>
      {/* Password input field with toggle visibility button */}
      <div className="*:not-first:mt-2">
        <label htmlFor={id} className="block text-sm leading-4 font-medium text-foreground select-none">
          {label}
        </label>
        <div className="relative">
          <input
            aria-describedby={`${id}-description`}
            className="flex h-9 w-full min-w-0 border border-input bg-transparent px-3 py-1 pe-9 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            style={{ borderRadius: radius }}
            id={id}
            onChange={(e) => {
              if (value === undefined) setInner(e.target.value)
              onChange?.(e.target.value)
            }}
            placeholder={placeholder}
            type={shown ? 'text' : 'password'}
            value={password}
            autoComplete="new-password"
          />
          <button
            aria-controls={id}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            style={{ borderRadius: `0 ${radius}px ${radius}px 0` }}
            onClick={toggleVisibility}
            type="button"
          >
            {shown ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Password strength indicator */}
      <div
        aria-label="Password strength"
        aria-valuemax={total}
        aria-valuemin={0}
        aria-valuenow={strengthScore}
        className={cn('mt-3 mb-4 flex h-1 w-full gap-1', meterStyle === 'bar' && 'overflow-hidden rounded-full bg-border')}
        role="progressbar"
      >
        {meterStyle === 'bar' ? (
          <div
            className="h-full w-full origin-left transition-[transform,background-color] duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `scaleX(${ratio})`, backgroundColor: strengthColor }}
          />
        ) : (
          Array.from({ length: segs }, (_, i) => (
            <div key={i} className="h-full flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full w-full origin-left transition-[transform,background-color] duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `scaleX(${i < filled ? 1 : 0})`, backgroundColor: strengthColor }}
              />
            </div>
          ))
        )}
      </div>

      {/* Password strength description */}
      <p className="mb-2 text-sm font-medium text-foreground" id={`${id}-description`}>
        {getStrengthText()}
        {showChecklist ? '. Must contain:' : '.'}
      </p>

      {/* Password requirements list */}
      {showChecklist && (
        <ul aria-label="Password requirements" className="space-y-1.5">
          {strength.map((req) => (
            <li className="flex items-center gap-2" key={req.text}>
              {req.met ? <CheckIcon color={strongColor} /> : <XIcon />}
              <span className={cn('text-xs', req.met ? 'text-foreground' : 'text-muted-foreground')}>
                {req.text}
                <span className="sr-only">{req.met ? ' - Requirement met' : ' - Requirement not met'}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
