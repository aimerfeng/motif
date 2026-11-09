// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/save-button.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  idleLabel: 'Save',
  loadingLabel: 'Saving',
  successLabel: 'Saved',
  loadingStyle: 'spinner',
  color: '#fafafa',
  successColor: '#fafafa',
  duration: 2.5,
  resetDelay: 2,
}
/* @motif:end */

export type SaveStatus = 'idle' | 'loading' | 'success'

export type SaveButtonProps = Partial<typeof defaults> & {
  /** 受控状态（演示用）；不传时组件自己管理。 */
  status?: SaveStatus
  /** 返回 promise 时，loading 持续到它结束。 */
  onAction?: () => unknown
  className?: string
  style?: CSSProperties
}

/** 按背景亮度选深色或浅色文字。 */
function ink(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? '#0a0a0a' : '#fafafa'
}

export function SaveButton({ status: forced, onAction, className, style, ...props }: SaveButtonProps) {
  const { idleLabel, loadingLabel, successLabel, loadingStyle, color, successColor, duration, resetDelay } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [own, setOwn] = useState<SaveStatus>('idle')
  const status = forced ?? own
  const timer = useRef<number>(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      window.clearTimeout(timer.current)
    }
  }, [])

  const handleClick = async () => {
    if (status !== 'idle') return
    setOwn('loading')
    if (onAction) {
      try {
        await onAction()
      } catch {
        if (alive.current) setOwn('idle')
        return
      }
    } else {
      await new Promise<void>((resolve) => {
        timer.current = window.setTimeout(resolve, duration * 1000)
      })
    }
    if (!alive.current) return
    setOwn('success')
    timer.current = window.setTimeout(() => setOwn('idle'), resetDelay * 1000)
  }

  const text = useMemo(() => {
    switch (status) {
      case 'idle':
        return idleLabel
      case 'loading':
        return loadingLabel
      case 'success':
        return successLabel
    }
  }, [status, idleLabel, loadingLabel, successLabel])

  const blur = reduced ? 'blur(0px)' : 'blur(4px)'
  const pop = reduced ? 1 : 0
  const letter = reduced ? { duration: 0.15 } : { type: 'spring' as const, stiffness: 500, damping: 30, mass: 1 }

  return (
    <div className={cn('group relative inline-flex font-sans', className)} style={style}>
      <span role="status" aria-live="polite" className="sr-only">
        {status === 'loading' ? loadingLabel : status === 'success' ? successLabel : ''}
      </span>
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={status !== 'idle'}
        aria-busy={status === 'loading'}
        className={cn(
          'relative inline-flex h-12 min-w-[140px] items-center justify-center rounded-full px-8 text-base font-medium whitespace-nowrap shadow-xs outline-none transition-[background-color,color,box-shadow,opacity] duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/50',
          status === 'idle' ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed bg-muted text-muted-foreground shadow-sm',
        )}
        style={status === 'idle' ? { backgroundColor: color, color: ink(color) } : undefined}
      >
        <span className="flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {text.split('').map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                layout={!reduced}
                initial={{ opacity: 0, scale: pop, filter: blur }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: pop, filter: blur }}
                transition={letter}
                className="inline-block whitespace-pre"
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </button>

      {/* Status Indicator */}
      <div className="pointer-events-none absolute -top-1 -right-1 z-10">
        <AnimatePresence mode="wait">
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: pop, x: reduced ? 0 : -8, filter: blur }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: pop, x: reduced ? 0 : -8, filter: blur }}
              transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 20 }}
              className={cn('flex size-6 items-center justify-center overflow-visible rounded-full ring-3 ring-muted', status === 'success' ? '' : 'bg-muted text-muted-foreground')}
              style={status === 'success' ? { backgroundColor: successColor, color: ink(successColor) } : undefined}
            >
              <AnimatePresence mode="popLayout">
                {status === 'loading' && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {loadingStyle === 'dots' ? (
                      <span className="flex items-center gap-[2px]" aria-hidden>
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="block size-[3.5px] rounded-full bg-current"
                            animate={reduced ? { opacity: 0.8 } : { y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                            transition={reduced ? { duration: 0 } : { duration: 0.8, repeat: Infinity, delay: d * 0.14, ease: 'easeInOut' }}
                          />
                        ))}
                      </span>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                        <path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity=".5" />
                        <motion.path
                          fill="currentColor"
                          d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
                          style={{ originX: '12px', originY: '12px' }}
                          animate={reduced ? { rotate: 0 } : { rotate: 360 }}
                          transition={reduced ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      </svg>
                    )}
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div
                    key="check"
                    initial={{ scale: pop, opacity: 0, filter: blur }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ scale: pop, opacity: 0, filter: blur }}
                    transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 14L8.5 17.5L19 6.5" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
