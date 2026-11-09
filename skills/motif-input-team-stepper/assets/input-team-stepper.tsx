// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/team-selector.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  min: 1,
  max: 4,
  overlap: 12,
  avatarStyle: 'neutral',
  accent: '#a1a1aa',
  spring: {
    visualDuration: 0.3,
    bounce: 0.25,
  },
  shake: true,
  label: 'Team Size',
}
/* @motif:end */

export interface TeamMember {
  id: string
  name: string
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'member-1', name: 'Alex Rivera' },
  { id: 'member-2', name: 'Blair Kim' },
  { id: 'member-3', name: 'Casey Lin' },
  { id: 'member-4', name: 'Devon Marsh' },
  { id: 'member-5', name: 'Emery Stone' },
  { id: 'member-6', name: 'Finley Ortiz' },
]

const NEUTRAL = ['#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa']

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return [161, 161, 170]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** 把强调色按序号旋转色相，生成每个头像的两段渐变色。 */
function rotate([r, g, b]: [number, number, number], deg: number, light: number): [number, number, number] {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    const rr = r / 255
    const gg = g / 255
    const bb = b / 255
    if (max === rr) h = ((gg - bb) / d) % 6
    else if (max === gg) h = (bb - rr) / d + 2
    else h = (rr - gg) / d + 4
  }
  h = (((h * 60 + deg) % 360) + 360) % 360
  const ll = Math.min(0.85, Math.max(0.2, l + light))
  const c = (1 - Math.abs(2 * ll - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ll - c / 2
  const [a, bq, cq] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [Math.round((a + m) * 255), Math.round((bq + m) * 255), Math.round((cq + m) * 255)]
}

const rgb = (c: [number, number, number]) => `rgb(${c[0]} ${c[1]} ${c[2]})`

function avatarColors(style: string, accent: string, index: number) {
  if (style === 'gradient') {
    const base = hexToRgb(accent)
    const from = rotate(base, index * 28, 0.08)
    const to = rotate(base, index * 28 + 24, -0.08)
    const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
    return { background: `linear-gradient(135deg, ${rgb(from)}, ${rgb(to)})`, color: luminance(mid) > 0.18 ? '#18181b' : '#fafafa' }
  }
  const bg = NEUTRAL[index % NEUTRAL.length] ?? '#e4e4e7'
  return { background: bg, color: luminance(hexToRgb(bg)) > 0.18 ? '#3f3f46' : '#fafafa' }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

export type TeamSelectorProps = Partial<typeof defaults> & {
  members?: TeamMember[]
  defaultValue?: number
  /** 受控值。 */
  value?: number
  onChange?: (size: number) => void
  /** 每次变化都触发一次抖动（演示自动播放用）。 */
  shakeSignal?: number
  className?: string
  style?: CSSProperties
}

const buttonClass =
  'flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-[color,background-color,border-color,opacity] duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--team-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-card active:bg-muted aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-card aria-disabled:hover:text-muted-foreground'

export function TeamSelector({ members = DEFAULT_MEMBERS, defaultValue, value, onChange, shakeSignal, className, style, ...props }: TeamSelectorProps) {
  const { min, max, overlap, avatarStyle, accent, spring, shake, label } = { ...defaults, ...props }
  const list = members.slice(0, Math.max(1, max))
  const maxTeamSize = list.length
  const minTeamSize = Math.min(Math.max(1, min), maxTeamSize)
  const clamp = (n: number) => Math.min(maxTeamSize, Math.max(minTeamSize, n))
  const [inner, setInner] = useState(() => clamp(defaultValue ?? minTeamSize))
  const peopleCount = clamp(value ?? inner)
  const directionRef = useRef<1 | -1>(1)
  const prefersReducedMotion = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()

  const triggerVibration = () => {
    if (prefersReducedMotion || !shake || !scope.current) return
    animate(scope.current, { x: [-3, 3, -2, 2, 0] }, { duration: 0.28, ease: 'easeOut' })
  }

  const lastSignal = useRef(shakeSignal)
  useEffect(() => {
    if (shakeSignal !== undefined && shakeSignal !== lastSignal.current) triggerVibration()
    lastSignal.current = shakeSignal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeSignal])

  const set = (next: number) => {
    directionRef.current = next > peopleCount ? 1 : -1
    setInner(next)
    onChange?.(next)
  }

  const handleIncrement = () => {
    if (peopleCount < maxTeamSize) set(peopleCount + 1)
    else triggerVibration()
  }

  const handleDecrement = () => {
    if (peopleCount > minTeamSize) set(peopleCount - 1)
    else triggerVibration()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      handleDecrement()
    }
  }

  const counterDistance = prefersReducedMotion ? 0 : 10
  const avatarVariants = {
    visible: { opacity: 1, scale: 1, transition: prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce } },
    hidden: { opacity: 0, scale: 0.85, transition: { duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' as const } },
  }

  return (
    <div className={cn('flex w-full flex-col items-center justify-center', className)} style={{ ...style, ['--team-accent' as string]: accent }}>
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <fieldset onKeyDown={handleKeyDown}>
          <legend className="mb-5 w-full text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</legend>

          <div className="mb-7 flex justify-center" aria-hidden="true">
            <div className="flex items-center">
              {list.map((member, index) => {
                const colors = avatarColors(avatarStyle, accent, index)
                return (
                  <motion.div
                    animate={index < peopleCount ? 'visible' : 'hidden'}
                    className="flex items-center justify-center"
                    initial={index < peopleCount ? 'visible' : 'hidden'}
                    key={member.id}
                    style={{ marginLeft: index === 0 ? 0 : -overlap, zIndex: maxTeamSize - index }}
                    variants={avatarVariants}
                  >
                    <div
                      title={member.name}
                      className="flex size-11 items-center justify-center rounded-full border-2 border-card text-[13px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 select-none"
                      style={colors}
                    >
                      {initials(member.name)}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div ref={scope} className="flex items-center justify-center gap-5">
            <button
              aria-label="Decrease team size"
              aria-disabled={peopleCount <= minTeamSize}
              className={buttonClass}
              onClick={handleDecrement}
              type="button"
            >
              <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>

            <div className="flex min-w-16 flex-col items-center">
              <div className="relative h-9 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.output
                    animate={{ opacity: 1, y: 0 }}
                    aria-live="polite"
                    className="block text-3xl font-semibold text-foreground tabular-nums select-none"
                    exit={{ opacity: 0, y: directionRef.current * -counterDistance, transition: { duration: 0.14, ease: 'easeIn' } }}
                    initial={{ opacity: 0, y: directionRef.current * counterDistance }}
                    key={peopleCount}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                  >
                    {peopleCount}
                  </motion.output>
                </AnimatePresence>
              </div>
              <span className="text-[11px] text-muted-foreground">{peopleCount === 1 ? 'member' : 'members'}</span>
            </div>

            <button
              aria-label="Increase team size"
              aria-disabled={peopleCount >= maxTeamSize}
              className={buttonClass}
              onClick={handleIncrement}
              type="button"
            >
              <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  )
}
