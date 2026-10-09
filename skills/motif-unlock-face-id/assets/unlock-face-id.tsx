// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/unlock-face-id/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#0d9488',
  successColor: '#16a34a',
  size: 132,
  strokeWidth: 4,
  scanDuration: 1.8,
  idleMessage: 'Look at your device to unlock',
  successMessage: 'Identity confirmed. Unlocked.',
}
/* @motif:end */

export type UnlockStatus = 'idle' | 'scanning' | 'success' | 'error'

export type UnlockFaceIdProps = Partial<typeof defaults> & {
  /** 受控状态；不传则点击后自己走完 扫描 -> 成功。 */
  status?: UnlockStatus
  /** 被保护的内容：锁定时模糊，解锁后清晰。 */
  children?: ReactNode
  errorMessage?: string
  label?: string
  onScan?: () => void
  onComplete?: () => void
  className?: string
  style?: CSSProperties
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const EASE_IN_OUT: [number, number, number, number] = [0.645, 0.045, 0.355, 1]
const INSTANT = { duration: 0 }
const CHECK_SPRING = { bounce: 0.28, duration: 0.4, type: 'spring' as const }
const GLYPH_SPRING = { bounce: 0.1, duration: 0.25, type: 'spring' as const }
const SHAKE = [0, -7, 7, -5, 5, -2, 0]
const ERROR_COLOR = '#ef4444'

// Face ID 的形状：四个圆角括号 + 一张示意的脸
const BRACKETS = ['M8 34 L8 28 A20 20 0 0 1 28 8 L34 8', 'M66 8 L72 8 A20 20 0 0 1 92 28 L92 34', 'M92 66 L92 72 A20 20 0 0 1 72 92 L66 92', 'M34 92 L28 92 A20 20 0 0 1 8 72 L8 66']
const FACE = ['M36 38 L36 47', 'M64 38 L64 47', 'M50 38 L50 54 Q50 57.5 53.5 57.5 L56 57.5', 'M36 61 L36 66 Q50 73 64 66 L64 61']
const CHECK = 'M30 52 L44 66 L72 34'
const SCAN = { size: 84, rx: 22, offset: 8, band: 18, travel: 34 }

/** 人脸识别解锁：括号和五官逐笔画出，扫描线上下游走，成功后变成对勾并让被保护的内容变清晰。 */
export function UnlockFaceId({ status: controlled, children, errorMessage = 'Face not recognized. Try again.', label = 'Scan to unlock', onScan, onComplete, className, style, ...props }: UnlockFaceIdProps) {
  const { color, successColor, size, strokeWidth, scanDuration, idleMessage, successMessage } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const animated = !reduced
  const [inner, setInner] = useState<UnlockStatus>('idle')
  const status = controlled ?? inner
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const uid = useId().replace(/:/g, '')

  useEffect(() => () => clearTimeout(timer.current), [])

  const begin = useCallback(() => {
    onScan?.()
    if (controlled !== undefined) return
    setInner('scanning')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setInner('success')
      onComplete?.()
    }, scanDuration * 1000)
  }, [controlled, onComplete, onScan, scanDuration])

  const click = () => {
    if (status === 'error') {
      onScan?.()
      if (controlled === undefined) setInner('idle')
    } else if (status === 'idle') begin()
  }

  const busy = status === 'scanning'
  const unlocked = status === 'success'
  const stroke = status === 'error' ? ERROR_COLOR : 'currentColor'
  const message = status === 'error' ? errorMessage : status === 'success' ? successMessage : status === 'scanning' ? 'Scanning face…' : idleMessage

  return (
    <div className={cn('flex w-full flex-col items-center gap-4', className)} style={style}>
      <button
        type="button"
        aria-busy={busy}
        aria-label={label}
        aria-describedby={`${uid}-msg`}
        disabled={busy || unlocked}
        onClick={click}
        className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-3xl text-foreground outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-(--c) focus-visible:ring-offset-4 focus-visible:ring-offset-background active:scale-95 disabled:cursor-default disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100"
        style={{ width: size, height: size, '--c': color } as CSSProperties}
      >
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          animate={{ x: status === 'error' && animated ? SHAKE : 0 }}
          transition={animated ? { duration: 0.4, ease: EASE_IN_OUT } : INSTANT}
        >
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={SCAN.offset} y={SCAN.offset} width={SCAN.size} height={SCAN.size} rx={SCAN.rx} />
            </clipPath>
            <linearGradient id={`${uid}-grad`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0} />
              <stop offset="100%" stopColor={color} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          {BRACKETS.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke={unlocked ? successColor : stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animated ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={animated ? { delay: i * 0.07, duration: 0.4, ease: EASE_OUT } : INSTANT}
            />
          ))}
          {/* 括号一直在；五官和对勾互相替换。mode="wait" 在沙箱截图里会卡在退场，所以让两者同时进出。 */}
          <AnimatePresence initial={false}>
            {unlocked ? (
              <motion.g key="check" style={{ transformOrigin: '50px 50px' }} initial={animated ? { opacity: 0, scale: 0.6 } : false} animate={{ opacity: 1, scale: 1 }} transition={animated ? CHECK_SPRING : INSTANT}>
                <motion.path d={CHECK} fill="none" stroke={successColor} strokeWidth={strokeWidth + 1} strokeLinecap="round" strokeLinejoin="round" initial={animated ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={animated ? CHECK_SPRING : INSTANT} />
              </motion.g>
            ) : (
              <motion.g
                key="face"
                style={{ transformOrigin: '50px 50px' }}
                initial={animated ? { opacity: 0, scale: 0.94 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={animated ? { opacity: 0, scale: 0.82 } : { opacity: 0, transition: INSTANT }}
                transition={animated ? GLYPH_SPRING : INSTANT}
              >
                {FACE.map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={animated ? { pathLength: 0 } : false}
                    animate={{ pathLength: 1 }}
                    transition={animated ? { delay: 0.26 + i * 0.07, duration: 0.42, ease: EASE_OUT } : INSTANT}
                  />
                ))}
                {busy && animated ? (
                  <g clipPath={`url(#${uid}-clip)`}>
                    <motion.g initial={{ y: -SCAN.travel }} animate={{ y: SCAN.travel }} transition={{ duration: 1.5, ease: EASE_IN_OUT, repeat: Infinity, repeatType: 'reverse' }}>
                      <rect x={SCAN.offset} y={50 - SCAN.band / 2} width={SCAN.size} height={SCAN.band} fill={`url(#${uid}-grad)`} />
                      <line x1={SCAN.offset + 2} x2={SCAN.offset + SCAN.size - 2} y1={50 + SCAN.band / 2} y2={50 + SCAN.band / 2} stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.95} />
                    </motion.g>
                  </g>
                ) : null}
              </motion.g>
            )}
          </AnimatePresence>
        </motion.svg>
      </button>

      <p
        id={`${uid}-msg`}
        role="status"
        aria-live="polite"
        className="text-center text-sm font-medium transition-colors duration-200 motion-reduce:transition-none"
        style={{ color: status === 'error' ? ERROR_COLOR : status === 'success' ? successColor : 'var(--muted-foreground)' }}
      >
        {message}
      </p>

      {children ? (
        <motion.div
          initial={false}
          animate={{ filter: unlocked ? 'blur(0px)' : 'blur(9px)', opacity: unlocked ? 1 : 0.55 }}
          transition={animated ? { duration: 0.45, ease: EASE_OUT } : INSTANT}
          className={cn('w-full', !unlocked && 'pointer-events-none select-none')}
          aria-hidden={!unlocked}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  )
}
