// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/delete-button.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  deleteText: 'Delete Account',
  cancelText: 'Cancel Deletion',
  countdown: 10,
  deleteColor: '#FE322A',
  softColor: '#FFEDF1',
  duration: 0.4,
  ease: [0.77, 0, 0.175, 1],
}
/* @motif:end */

export type DeleteButtonProps = Partial<typeof defaults> & {
  /** 受控：是否处于倒计时（演示自动播放用）。 */
  deleting?: boolean
  /** 受控：倒计时剩余秒数（演示自动播放用）。 */
  count?: number
  /** 倒计时归零时调用：这时才真正删除。 */
  onDelete?: () => void
  /** 用户点了撤销。 */
  onCancel?: () => void
  className?: string
  style?: CSSProperties
}

type Bezier = [number, number, number, number]

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return 0
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const inkOn = (bg: string) => (contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111')

function UndoIcon({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h11a5 5 0 0 1 0 10H9" />
      <path d="M8 5 4 9l4 4" />
    </svg>
  )
}

/** 可撤销删除：红色删除按钮点下后变形成「撤销 + 倒计时」，倒计时结束才真正删除。 */
export function DeleteButton({ deleting: forcedDeleting, count: forcedCount, onDelete, onCancel, className, style, ...props }: DeleteButtonProps) {
  const params = { ...defaults, ...props } as typeof defaults & {
    deleteText: string
    cancelText: string
    countdown: number
    deleteColor: string
    softColor: string
    duration: number
    ease: Bezier
  }
  const reduced = useReducedMotion()
  const [stateDeleting, setIsDeleting] = useState(false)
  const [stateCount, setCount] = useState(params.countdown)
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimer = useRef<number>(0)
  const isDeleting = forcedDeleting ?? stateDeleting
  const count = forcedCount ?? stateCount
  const controlled = forcedDeleting !== undefined

  useEffect(() => {
    if (controlled || !stateDeleting) return
    if (stateCount === 0) {
      onDelete?.()
      return
    }
    const timer = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [controlled, stateDeleting, stateCount, onDelete])

  useEffect(() => () => window.clearTimeout(animTimer.current), [])

  const handleClick = (newState: boolean) => {
    if (isAnimating) return
    if (!newState) onCancel?.()
    setIsAnimating(true)
    setIsDeleting(newState)
    if (newState) setCount(params.countdown)
    animTimer.current = window.setTimeout(() => setIsAnimating(false), params.duration * 1000)
  }

  const t = (v: number) => (reduced ? 0 : v)
  const layoutT = { duration: t(params.duration), ease: [...params.ease] as Bezier }
  const charT = (i: number, step: number) => ({ duration: t(0.3), ease: [0.785, 0.135, 0.15, 0.86] as Bezier, delay: t(i * step) })
  const deleteInk = inkOn(params.deleteColor)
  const cancelInk = contrast(params.deleteColor, params.softColor) >= 3 ? params.deleteColor : inkOn(params.softColor)
  const charInit = reduced ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.3 }
  const charExit = reduced ? { opacity: 0 } : { y: -20, opacity: 0, scale: 0.3 }
  const focus = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2'

  return (
    <div className={cn('flex items-center justify-center', className)} style={style}>
      <span role="status" aria-live="polite" className="sr-only">
        {isDeleting ? (count > 0 ? `Deleting in ${count} seconds` : 'Deleted') : ''}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        {!isDeleting ? (
          <motion.button
            type="button"
            key="delete"
            layoutId="deleteButton"
            onClick={() => handleClick(true)}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: isAnimating ? 'none' : 'auto', color: deleteInk, outlineColor: params.deleteColor }}
            initial={{ backgroundColor: params.softColor, filter: 'blur(1px)', opacity: 1 }}
            animate={{ backgroundColor: params.deleteColor, filter: 'blur(0px)', opacity: 1 }}
            exit={{ backgroundColor: params.softColor, filter: 'blur(1px)', opacity: 0 }}
            className={cn('flex items-center justify-center overflow-hidden rounded-full px-5 py-3', focus)}
            transition={{
              layout: layoutT,
              backgroundColor: { duration: t(0.4), ease: 'easeInOut' },
              filter: { duration: t(0.1), ease: 'easeInOut' },
              opacity: { duration: t(0.2), ease: 'easeOut' },
            }}
          >
            <motion.span layoutId="buttonText" className="flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: t(0.1) }}>
              {params.deleteText.split('').map((char, i) => (
                <motion.span
                  key={`delete-${i}-${char}`}
                  initial={charInit}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={charExit}
                  transition={charT(i, 0.005)}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            key="cancel"
            layoutId="deleteButton"
            onClick={() => handleClick(false)}
            whileTap={{ scale: 0.95 }}
            aria-label={`${params.cancelText}, ${count} seconds left`}
            style={{ pointerEvents: isAnimating ? 'none' : 'auto', outlineColor: params.deleteColor }}
            initial={{ backgroundColor: params.deleteColor, filter: 'blur(1px)', opacity: 0 }}
            animate={{ backgroundColor: params.softColor, filter: 'blur(0px)', opacity: 1 }}
            exit={{ backgroundColor: params.deleteColor, filter: 'blur(1px)', opacity: 0 }}
            className={cn('flex items-center gap-2 overflow-hidden rounded-full px-3 py-3', focus)}
            transition={{
              layout: layoutT,
              backgroundColor: { duration: t(0.4), ease: 'easeInOut' },
              filter: { duration: t(0.2), ease: 'easeInOut' },
              opacity: { duration: t(0.2), ease: 'easeIn' },
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: t(0.2), delay: t(0.05) }}
              className="flex shrink-0 items-center justify-center rounded-full p-1.5"
              style={{ backgroundColor: params.deleteColor }}
            >
              <UndoIcon color={deleteInk} />
            </motion.div>

            <motion.span
              layoutId="buttonText"
              className="flex font-medium"
              style={{ color: cancelInk }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: t(0.1) }}
            >
              {params.cancelText.split('').map((char, i) => (
                <motion.span
                  key={`cancel-${i}-${char}`}
                  initial={charInit}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={charExit}
                  transition={charT(i, 0.006)}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>

            <motion.div
              aria-hidden
              className="relative flex min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full px-4 py-3 text-sm font-semibold"
              style={{ backgroundColor: params.deleteColor, color: deleteInk }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: t(0.2), delay: t(0.1) }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ duration: t(0.2), ease: [0.33, 1, 0.68, 1] }}
                  className="absolute"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
