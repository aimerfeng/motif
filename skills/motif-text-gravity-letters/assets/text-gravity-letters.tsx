// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/gravity-letters/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useReducedMotion } from 'motion/react'
import { type CSSProperties, type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Page not found',
  fontSize: 56,
  gravity: 1200,
  bounce: 0.35,
  friction: 0.4,
  spread: 140,
  stagger: 40,
  trigger: 'hover',
}
/* @motif:end */

export type GravityLettersTrigger = 'click' | 'hover' | 'inView' | 'manual'

export type GravityLettersProps = Partial<Omit<typeof defaults, 'trigger'>> & {
  trigger?: GravityLettersTrigger
  /** 受控模式：传入后由父组件决定字母是否落下（trigger="manual" 时必须用它）。 */
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
  style?: CSSProperties
}

interface LetterOrigin {
  height: number
  width: number
  x: number
  y: number
}

interface LetterPhysics {
  angle: number
  angularVel: number
  dx: number
  dy: number
  releaseAt: number
  settled: boolean
  vx: number
  vy: number
}

type Phase = 'falling' | 'idle' | 'reforming' | 'settled'

const MAX_DT_SECONDS = 0.05
const REST_VELOCITY = 20
const REST_HORIZONTAL_VELOCITY = 5
const SPRING_STIFFNESS = 180
const SPRING_DAMPING = 18
const REFORM_EPSILON_POSITION = 0.5
const REFORM_EPSILON_ANGLE = 0.5
const REFORM_EPSILON_VELOCITY = 5
const WHITESPACE = /\s/

/**
 * 字母逐个脱落、受重力下坠并在容器底部弹跳堆积，收起时用弹簧飞回原位。
 * 容器要有固定高度（例如 h-48）：字母落到它自己的底边，并被它裁切。
 */
export function GravityLetters({ className, style, collapsed: collapsedProp, onCollapsedChange, ...props }: GravityLettersProps) {
  const { text, fontSize, gravity, bounce, friction, spread, stagger, trigger: triggerValue } = { ...defaults, ...props }
  const trigger = triggerValue as GravityLettersTrigger
  const shouldReduceMotion = useReducedMotion()
  const letters = useMemo(() => Array.from(text), [text])
  // 同一个单词的字母放进不换行的分组：窄屏上只在词与词之间折行。
  const groups = useMemo(() => {
    const result: { index: number; chars: string[]; space: boolean }[] = []
    for (let index = 0; index < letters.length; index++) {
      const char = letters[index]!
      const space = WHITESPACE.test(char)
      const last = result.at(-1)
      if (last && !space && !last.space) last.chars.push(char)
      else result.push({ index, chars: [char], space })
    }
    return result
  }, [letters])

  const isControlled = collapsedProp !== undefined
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = isControlled ? Boolean(collapsedProp) : internalCollapsed

  const onCollapsedChangeRef = useRef(onCollapsedChange)
  useEffect(() => {
    onCollapsedChangeRef.current = onCollapsedChange
  })

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalCollapsed(next)
      }
      onCollapsedChangeRef.current?.(next)
    },
    [isControlled],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([])
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const originsRef = useRef<LetterOrigin[]>([])
  const physicsRef = useRef<LetterPhysics[]>([])
  const phaseRef = useRef<Phase>('idle')
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const configRef = useRef({ bounce, friction, gravity, spread, stagger })

  useEffect(() => {
    configRef.current = { bounce, friction, gravity, spread, stagger }
  }, [bounce, friction, gravity, spread, stagger])

  const applyIdleTransforms = useCallback(() => {
    for (let i = 0; i < letterRefs.current.length; i++) {
      const el = letterRefs.current[i]
      const origin = originsRef.current[i]
      if (el && origin) {
        el.style.transform = `translate3d(${origin.x}px, ${origin.y}px, 0) rotate(0deg)`
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (shouldReduceMotion) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    const measure = () => {
      const containerRect = container.getBoundingClientRect()
      originsRef.current = measureRefs.current.map((el) => {
        if (!el) {
          return { height: 0, width: 0, x: 0, y: 0 }
        }
        const rect = el.getBoundingClientRect()
        return {
          height: rect.height,
          width: rect.width,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
        }
      })

      if (phaseRef.current === 'idle') {
        applyIdleTransforms()
      }
    }

    measure()

    const resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [letters, fontSize, shouldReduceMotion, applyIdleTransforms])

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) {
      return
    }

    lastTickRef.current = null

    const tick = (now: number) => {
      const lastTick = lastTickRef.current ?? now
      const dt = Math.min((now - lastTick) / 1000, MAX_DT_SECONDS)
      lastTickRef.current = now

      const container = containerRef.current
      if (!container) {
        rafRef.current = null
        return
      }

      const rect = container.getBoundingClientRect()
      const floorY = rect.height
      const wallRight = rect.width
      const { bounce: b, friction: f, gravity: g } = configRef.current

      let stillActive = false

      for (let i = 0; i < physicsRef.current.length; i++) {
        const p = physicsRef.current[i]
        const el = letterRefs.current[i]
        const origin = originsRef.current[i]
        if (!(p && el && origin)) {
          continue
        }

        if (phaseRef.current === 'falling') {
          if (now < p.releaseAt) {
            stillActive = true
            continue
          }
          if (p.settled) {
            continue
          }
          stillActive = true

          p.vy += g * dt
          p.dx += p.vx * dt
          p.dy += p.vy * dt
          p.angle += p.angularVel * dt

          const floorLimit = floorY - origin.y - origin.height
          if (p.dy >= floorLimit) {
            p.dy = floorLimit
            p.vy = -p.vy * b
            p.vx *= 1 - f
            p.angularVel *= 1 - f
            if (Math.abs(p.vy) < REST_VELOCITY && Math.abs(p.vx) < REST_HORIZONTAL_VELOCITY) {
              p.vy = 0
              p.vx = 0
              p.angularVel = 0
              p.settled = true
            }
          }

          const leftLimit = -origin.x
          const rightLimit = wallRight - origin.x - origin.width
          if (p.dx <= leftLimit) {
            p.dx = leftLimit
            p.vx = -p.vx * b
          } else if (p.dx >= rightLimit) {
            p.dx = rightLimit
            p.vx = -p.vx * b
          }
        } else if (phaseRef.current === 'reforming') {
          if (p.settled) {
            continue
          }

          const ax = -SPRING_STIFFNESS * p.dx - SPRING_DAMPING * p.vx
          const ay = -SPRING_STIFFNESS * p.dy - SPRING_DAMPING * p.vy
          const aAngle = -SPRING_STIFFNESS * p.angle - SPRING_DAMPING * p.angularVel

          p.vx += ax * dt
          p.vy += ay * dt
          p.angularVel += aAngle * dt
          p.dx += p.vx * dt
          p.dy += p.vy * dt
          p.angle += p.angularVel * dt

          if (
            Math.abs(p.dx) < REFORM_EPSILON_POSITION &&
            Math.abs(p.dy) < REFORM_EPSILON_POSITION &&
            Math.abs(p.angle) < REFORM_EPSILON_ANGLE &&
            Math.abs(p.vx) < REFORM_EPSILON_VELOCITY &&
            Math.abs(p.vy) < REFORM_EPSILON_VELOCITY
          ) {
            p.dx = 0
            p.dy = 0
            p.angle = 0
            p.vx = 0
            p.vy = 0
            p.settled = true
          } else {
            stillActive = true
          }
        }

        el.style.transform = `translate3d(${origin.x + p.dx}px, ${origin.y + p.dy}px, 0) rotate(${p.angle}deg)`
      }

      if (stillActive) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        phaseRef.current = phaseRef.current === 'falling' ? 'settled' : 'idle'
        if (phaseRef.current === 'idle') {
          applyIdleTransforms()
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [applyIdleTransforms])

  const startFalling = useCallback(() => {
    if (originsRef.current.length === 0) {
      return
    }

    const now = performance.now()
    const { spread: s, stagger: st } = configRef.current

    physicsRef.current = letters.map((_, index) => ({
      angle: 0,
      angularVel: (Math.random() * 2 - 1) * 180,
      dx: 0,
      dy: 0,
      releaseAt: now + index * st,
      settled: false,
      vx: (Math.random() * 2 - 1) * s,
      vy: 0,
    }))

    phaseRef.current = 'falling'
    startLoop()
  }, [letters, startLoop])

  const startReforming = useCallback(() => {
    if (physicsRef.current.length === 0) {
      return
    }

    for (const p of physicsRef.current) {
      p.settled = false
    }

    phaseRef.current = 'reforming'
    startLoop()
  }, [startLoop])

  useEffect(() => {
    if (shouldReduceMotion) {
      return
    }

    if (collapsed) {
      startFalling()
    } else {
      startReforming()
    }
    // startFalling / startReforming 读的都是 ref，只在 collapsed 变化时触发（与上游一致）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed, shouldReduceMotion])

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (trigger !== 'inView' || shouldReduceMotion) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCollapsed(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [trigger, shouldReduceMotion, setCollapsed])

  const isInteractive = trigger === 'hover' || trigger === 'click'

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setCollapsed(true)
    }
  }
  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setCollapsed(false)
    }
  }
  const handleFocus = () => {
    if (trigger === 'hover') {
      setCollapsed(true)
    }
  }
  const handleBlur = () => {
    if (trigger === 'hover') {
      setCollapsed(false)
    }
  }
  const handleClick = () => {
    if (trigger === 'click') {
      setCollapsed(!collapsed)
    }
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (trigger === 'click' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      setCollapsed(!collapsed)
    }
  }

  // 字号参数代替上游示例里的 text-5xl（它的行高是 1）：字母盒子贴着字形，落地时才不会悬空。
  const textStyle: CSSProperties = { fontSize, lineHeight: 1, ...style }

  if (shouldReduceMotion) {
    return (
      <div className={cn('relative', className)} style={textStyle}>
        <span>{text}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative isolate min-h-24 select-none overflow-hidden',
        isInteractive && 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
      style={textStyle}
      aria-pressed={trigger === 'click' ? collapsed : undefined}
      onBlur={isInteractive ? handleBlur : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onFocus={isInteractive ? handleFocus : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onMouseEnter={isInteractive ? handleMouseEnter : undefined}
      onMouseLeave={isInteractive ? handleMouseLeave : undefined}
      ref={containerRef}
      role={trigger === 'click' ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <span className="sr-only">{text}</span>

      <div aria-hidden="true" className="pointer-events-none invisible flex flex-wrap">
        {groups.map((group) => (
          <span className="inline-flex whitespace-nowrap" key={group.index}>
            {group.chars.map((char, offset) => {
              const index = group.index + offset
              return (
                <span
                  className="inline-block whitespace-pre"
                  key={index}
                  ref={(el) => {
                    measureRefs.current[index] = el
                  }}
                >
                  {char}
                </span>
              )
            })}
          </span>
        ))}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {letters.map((char, index) => (
          <span
            className="absolute top-0 left-0 inline-block whitespace-pre will-change-transform"
            key={index}
            ref={(el) => {
              letterRefs.current[index] = el
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
