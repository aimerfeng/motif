// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Spell UI
// Source: https://github.com/xxtomm/spell-ui/blob/fffe96d/registry/spell-ui/exploding-input.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useCallback, useEffect, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  particleSet: 'shapes',
  color: '#6366f1',
  count: 3,
  gravity: 0.5,
  horizontal: 'left',
  vertical: 'top',
  duration: 3,
  scale: 1,
  scaleVariation: 30,
  rotate: true,
}
/* @motif:end */

export type ExplodingInputProps = Partial<typeof defaults> & {
  /** Custom styles for the container */
  style?: CSSProperties
  /** Class name for the container */
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
  vx: number
  vy: number
  gravity: number
  birthTime: number
  life: number
  scaleStart: number
  scaleEnd: number
  rotateStart: number
  rotateEnd: number
  element: HTMLDivElement
  isDead: boolean
}

function mapLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

function createPRNG(seed: number): () => number {
  let s = seed
  return function () {
    s |= 0
    s = (s + 1831565813) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 上游演示用 emoji 当粒子；这里换成内联 SVG，颜色跟随 currentColor
const SHAPES = [
  '<svg width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" rx="6" fill="currentColor"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor"/></svg>',
  '<svg width="18" height="16" viewBox="0 0 18 16"><path d="M9 1.5 17 15H1z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3h10v3H6v7H3z" fill="currentColor"/></svg>',
]
const SPARKS = [
  '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 0c.8 6.5 4.7 10.9 12 12-7.3 1.1-11.2 5.5-12 12-.8-6.5-4.7-10.9-12-12C7.3 10.9 11.2 6.5 12 0z" fill="currentColor"/></svg>',
  '<svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.5" fill="currentColor"/></svg>',
  '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
]

export function ExplodingInput({ style, className, ...props }: ExplodingInputProps) {
  const options = { ...defaults, ...props }
  const { count, gravity, duration, scale, scaleVariation, rotate, horizontal, vertical, particleSet, color } = options
  const reduced = usePrefersReducedMotion()
  const particleIdCounter = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const randRef = useRef<() => number>(() => Math.random())
  const clockRef = useRef(0)
  const measureRef = useRef<CanvasRenderingContext2D | null>(null)

  // Initialize PRNG and cleanup on unmount
  useEffect(() => {
    const timeBits = (Date.now() & 4294967295) >>> 0
    const extra = Math.floor(Math.random() * 4294967295) >>> 0
    randRef.current = createPRNG((timeBits ^ extra) >>> 0)
    return () => {
      particlesRef.current.forEach((p) => p.element.remove())
      particlesRef.current = []
    }
  }, [])

  const getInputSpawnPosition = useCallback((input: HTMLInputElement): { x: number; y: number } | null => {
    const container = containerRef.current
    if (!container) return null

    const inputRect = input.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const inputValue = input.value

    const getTextWidth = (text: string, inp: HTMLInputElement): number => {
      if (!measureRef.current) measureRef.current = document.createElement('canvas').getContext('2d')
      const context = measureRef.current
      if (!context) return 0
      const computedStyle = window.getComputedStyle(inp)
      context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`
      return context.measureText(text).width
    }

    const computedStyle = window.getComputedStyle(input)
    const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0
    const paddingRight = parseInt(computedStyle.paddingRight, 10) || 0

    // 祖先上的 transform: scale（例如截图 zoom）会让 rect 与布局像素不一致，这里换算回布局坐标
    const ratio = input.offsetWidth > 0 ? inputRect.width / input.offsetWidth : 1
    const inputStartX = (inputRect.left - containerRect.left) / ratio
    let x: number
    if (inputValue.length > 0) {
      const textWidth = getTextWidth(inputValue, input)
      const maxX = inputStartX + input.offsetWidth - paddingRight
      x = Math.min(textWidth + inputStartX + paddingLeft, maxX)
    } else {
      x = inputStartX + paddingLeft
    }
    const y = (inputRect.top - containerRect.top) / ratio + input.offsetHeight / 2
    return { x, y }
  }, [])

  const createParticlesAtPosition = useCallback(
    (x: number, y: number, typed: string | null) => {
      const spawnOne = () => {
        const horizontalValue = horizontal === 'left' ? -0.4 : horizontal === 'right' ? 0.4 : 0
        const baseVx = mapLinear(horizontalValue, -1, 1, -800, 800)
        const vx = baseVx + (randRef.current() * 2 - 1) * 300

        const verticalValue = vertical === 'top' ? -0.7 : vertical === 'bottom' ? 0.7 : 0
        const baseVy = mapLinear(verticalValue, -1, 1, -800, 800)
        const vy = baseVy + (randRef.current() * 2 - 1) * 300

        particleIdCounter.current += 1
        const randBetween = (min: number, max: number) => min + randRef.current() * (max - min)

        let particleScale = scale
        if (scaleVariation > 0) {
          const variation = (scaleVariation / 100) * scale
          particleScale = randBetween(scale - variation, scale + variation)
        }
        const safeScale = Math.max(0.1, Math.min(4, particleScale))

        let initRot = 0
        let endRot = 0
        if (rotate) {
          initRot = randBetween(-180, 180)
          endRot = initRot + randBetween(-360, 360)
        }

        const el = document.createElement('div')
        el.style.position = 'absolute'
        el.style.left = '0'
        el.style.top = '0'
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'
        el.style.pointerEvents = 'none'
        el.style.willChange = 'transform, opacity'
        el.style.transformOrigin = '50% 50%'
        el.style.color = color
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${safeScale}) rotate(${initRot}deg)`
        el.style.opacity = '1'

        const idx = particleIdCounter.current - 1
        if (particleSet === 'glyphs') {
          el.textContent = typed && typed.trim() ? typed.slice(-1) : '*'
          el.style.fontSize = '22px'
          el.style.fontWeight = '600'
          el.style.lineHeight = '1'
        } else {
          const set = particleSet === 'sparks' ? SPARKS : SHAPES
          el.innerHTML = set[idx % set.length] ?? ''
        }

        particleContainerRef.current?.appendChild(el)

        particlesRef.current.push({
          id: particleIdCounter.current,
          x,
          y,
          scale: safeScale,
          rotate: initRot,
          opacity: 1,
          vx,
          vy,
          gravity: mapLinear(Math.max(-1, Math.min(1, gravity)), -1, 1, -2000, 2000),
          birthTime: clockRef.current,
          life: duration,
          scaleStart: safeScale,
          scaleEnd: safeScale,
          rotateStart: initRot,
          rotateEnd: endRot,
          element: el,
          isDead: false,
        })
      }

      const particlesToSpawn = Math.max(1, Math.min(5, Math.round(count)))
      for (let i = 0; i < particlesToSpawn; i++) spawnOne()
    },
    [count, horizontal, vertical, duration, gravity, rotate, scale, scaleVariation, particleSet, color],
  )

  // Find input element and listen to changes（减少动态效果时不生成粒子）
  useEffect(() => {
    const container = containerRef.current
    if (!container || reduced) return
    const label = container.closest('label')
    const input = label?.querySelector('input') ?? null
    if (!input) return

    const handleInput = (event: Event) => {
      const pos = getInputSpawnPosition(input)
      const typed = event instanceof InputEvent ? event.data : null
      if (pos) createParticlesAtPosition(pos.x, pos.y, typed)
    }

    input.addEventListener('input', handleInput)
    return () => input.removeEventListener('input', handleInput)
  }, [createParticlesAtPosition, getInputSpawnPosition, reduced])

  // Physics animation loop：时钟来自帧循环，粒子到期在循环里移除（上游用 setTimeout）
  useFrameLoop(
    containerRef,
    ({ time, delta }) => {
      clockRef.current = time
      const dt = Math.min(0.032, delta)
      let anyDead = false

      particlesRef.current.forEach((p) => {
        if (p.isDead) return
        const age = time - p.birthTime
        if (age >= p.life) {
          p.isDead = true
          anyDead = true
          p.element.remove()
          return
        }

        const progress = age / p.life

        p.vy = p.vy + p.gravity * dt
        p.x = p.x + p.vx * dt
        p.y = p.y + p.vy * dt

        p.scale = mapLinear(progress, 0, 1, p.scaleStart, p.scaleEnd)
        p.rotate = mapLinear(progress, 0, 1, p.rotateStart, p.rotateEnd)

        const fadeStart = 0.7
        p.opacity = progress > fadeStart ? mapLinear(progress, fadeStart, 1, 1, 0) : 1

        if (isNaN(p.x) || isNaN(p.y) || isNaN(p.scale)) return

        const clampedScale = Math.max(0.1, Math.min(3, p.scale))
        p.element.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${clampedScale}) rotate(${p.rotate}deg)`
        p.element.style.opacity = String(p.opacity)
      })

      if (anyDead) particlesRef.current = particlesRef.current.filter((p) => !p.isDead)
    },
    { reducedMotion: 'static' },
  )

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
      style={{
        ...style,
        position: 'relative',
        width: '0px',
        height: '0px',
        overflow: 'visible',
        backgroundColor: 'transparent',
        transform: 'translateZ(0)',
      }}
    >
      <div
        ref={particleContainerRef}
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  )
}

export default ExplodingInput
