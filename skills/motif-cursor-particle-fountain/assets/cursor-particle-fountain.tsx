// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/cool-mode.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  particle: 'circle',
  size: 0,
  particleCount: 45,
  speedHorz: 10,
  speedUp: 25,
}
/* @motif:end */

export type CoolModeProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

interface CoolParticle {
  left: number
  top: number
  size: number
  direction: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
  hue: number
}

const sizes = [15, 20, 25, 35, 45]
/** Seconds between two spawned particles while the pointer is held (upstream: 30 ms). */
const particleGenerationDelay = 0.03

/** Hold the pointer on the children and particles stream out of it, arcing up and falling under gravity. */
export function CoolMode({ className, style, children, ...props }: CoolModeProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options

  const hostRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvasRef, { maxDpr: 2 })
  const state = useRef({ particles: [] as CoolParticle[], autoAddParticle: false, mouseX: 0, mouseY: 0, last: -1 })

  useEffect(() => {
    const element = hostRef.current
    if (!element) return
    const s = state.current
    const updateMousePosition = (e: PointerEvent) => {
      s.mouseX = e.clientX
      s.mouseY = e.clientY
    }
    const tapHandler = (e: PointerEvent) => {
      updateMousePosition(e)
      s.autoAddParticle = true
    }
    const disableAutoAddParticle = () => {
      s.autoAddParticle = false
    }
    element.addEventListener('pointermove', updateMousePosition, { passive: true })
    element.addEventListener('pointerdown', tapHandler, { passive: true })
    element.addEventListener('pointerup', disableAutoAddParticle, { passive: true })
    element.addEventListener('pointercancel', disableAutoAddParticle, { passive: true })
    element.addEventListener('pointerleave', disableAutoAddParticle, { passive: true })
    return () => {
      element.removeEventListener('pointermove', updateMousePosition)
      element.removeEventListener('pointerdown', tapHandler)
      element.removeEventListener('pointerup', disableAutoAddParticle)
      element.removeEventListener('pointercancel', disableAutoAddParticle)
      element.removeEventListener('pointerleave', disableAutoAddParticle)
    }
  }, [])

  const generateParticle = () => {
    const o = optionsRef.current
    const s = state.current
    const particleSize = o.size || sizes[Math.floor(Math.random() * sizes.length)]!
    s.particles.push({
      size: particleSize,
      speedHorz: Math.random() * o.speedHorz,
      speedUp: Math.random() * o.speedUp,
      spinVal: Math.random() * 360,
      spinSpeed: Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1),
      top: s.mouseY - particleSize / 2,
      left: s.mouseX - particleSize / 2,
      direction: Math.random() <= 0.5 ? -1 : 1,
      hue: Math.random() * 360,
    })
  }

  useFrameLoop(
    hostRef,
    ({ time, delta }) => {
      const o = optionsRef.current
      const s = state.current
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      if (s.autoAddParticle && s.particles.length < o.particleCount && time - s.last > particleGenerationDelay) {
        generateParticle()
        s.last = time
      }

      // refreshParticles: the upstream steps assume one step per 60 fps frame.
      const { dpr } = size.current
      const k = delta * 60
      const bottom = canvas.height / dpr
      s.particles = s.particles.filter((p) => {
        p.left = p.left - p.speedHorz * p.direction * k
        p.top = p.top - p.speedUp * k
        p.speedUp = Math.min(p.size, p.speedUp - k)
        p.spinVal = p.spinVal + p.spinSpeed * k
        return p.top < bottom + p.size
      })

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isCircle = o.particle === 'circle' || o.particle.trim() === ''
      if (!isCircle) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
      }
      for (const p of s.particles) {
        const r = p.size / 2
        ctx.setTransform(dpr, 0, 0, dpr, (p.left + r) * dpr, (p.top + r) * dpr)
        ctx.rotate((p.spinVal * Math.PI) / 180)
        ctx.fillStyle = `hsl(${p.hue}, 70%, 50%)`
        if (isCircle) {
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.font = `${Math.round(p.size * 1.2)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
          ctx.fillText(o.particle, 0, 0)
        }
      }
    },
    { reducedMotion: 'static' },
  )

  return (
    <span ref={hostRef} className={cn('inline-block', className)} style={style}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2147483647 }}
      />
    </span>
  )
}
