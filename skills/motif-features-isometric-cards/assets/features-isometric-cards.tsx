// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/neuform-isolated/sources/diagnostics-panel.html
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion, type CanvasSize } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#34d399',
  speed: 1,
  cardStyle: 'gradient',
  background: true,
  typewriter: true,
}
/* @motif:end */

export type FeaturesIsometricCardsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Ctx = CanvasRenderingContext2D
type Rgba = (a: number) => string

const BG = '#020804'
const STATIC_TIME = 2

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [52, 211, 153]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// 3D Canvas Utilities
const projectIso = (x: number, y: number, z: number) => {
  const angle = Math.PI / 6
  return { x: (x - z) * Math.cos(angle), y: y + (x + z) * Math.sin(angle) }
}

// Card 1
function drawLayers(ctx: Ctx, t: number, c: Rgba) {
  const size = 42, layers = 5, gap = 20
  ctx.lineWidth = 1
  for (let i = layers - 1; i >= 0; i--) {
    const yOff = i * gap - (layers * gap) / 2 + Math.sin(t + i * 0.4) * 4
    const p1 = projectIso(-size, yOff, -size), p2 = projectIso(size, yOff, -size)
    const p3 = projectIso(size, yOff, size), p4 = projectIso(-size, yOff, size)

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath()
    ctx.fillStyle = BG; ctx.fill()
    ctx.strokeStyle = i === 0 ? c(0.8) : c(0.15)
    ctx.stroke()

    if (i === 0) {
      ctx.save()
      const center = projectIso(0, yOff, 0)
      ctx.translate(center.x, center.y); ctx.scale(1, 0.5)
      const sqSize = size * 0.55
      ctx.beginPath(); ctx.rect(-sqSize, -sqSize, sqSize * 2, sqSize * 2)
      ctx.strokeStyle = c(0.4); ctx.stroke()
      ctx.clip()
      for (let j = -sqSize; j < sqSize; j += 4) {
        ctx.beginPath(); ctx.moveTo(-sqSize, j); ctx.lineTo(sqSize, j)
        ctx.strokeStyle = c(0.2); ctx.stroke()
      }
      ctx.restore()
    }

    if (i < layers - 1) {
      const nextY = (i + 1) * gap - (layers * gap) / 2 + Math.sin(t + (i + 1) * 0.4) * 4
      const p1Next = projectIso(-size, nextY, -size), p3Next = projectIso(size, nextY, size)
      ctx.beginPath(); ctx.setLineDash([2, 2])
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1Next.x, p1Next.y)
      ctx.moveTo(p3.x, p3.y); ctx.lineTo(p3Next.x, p3Next.y)
      ctx.strokeStyle = c(0.1); ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

// Card 2
function drawCube(ctx: Ctx, x: number, y: number, z: number, s: number, colorStr: string) {
  const pts = [
    projectIso(x - s, y - s, z - s), projectIso(x + s, y - s, z - s), projectIso(x + s, y - s, z + s), projectIso(x - s, y - s, z + s),
    projectIso(x - s, y + s, z - s), projectIso(x + s, y + s, z - s), projectIso(x + s, y + s, z + s), projectIso(x - s, y + s, z + s),
  ]
  ctx.strokeStyle = colorStr; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y); ctx.lineTo(pts[3].x, pts[3].y); ctx.closePath()
  ctx.moveTo(pts[4].x, pts[4].y); ctx.lineTo(pts[5].x, pts[5].y); ctx.lineTo(pts[6].x, pts[6].y); ctx.lineTo(pts[7].x, pts[7].y); ctx.closePath()
  ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[4].x, pts[4].y)
  ctx.moveTo(pts[1].x, pts[1].y); ctx.lineTo(pts[5].x, pts[5].y)
  ctx.moveTo(pts[2].x, pts[2].y); ctx.lineTo(pts[6].x, pts[6].y)
  ctx.moveTo(pts[3].x, pts[3].y); ctx.lineTo(pts[7].x, pts[7].y)
  ctx.stroke()
}

function drawNodes(ctx: Ctx, t: number, c: Rgba) {
  const s = 22, float = Math.sin(t) * 4
  drawCube(ctx, -35, -float, -35, s, c(0.15))
  drawCube(ctx, 35, float, -35, s, c(0.15))
  drawCube(ctx, -35, float, 35, s, c(0.15))
  drawCube(ctx, 35, -float, 35, s, c(0.15))
  drawCube(ctx, 0, Math.cos(t) * 6 - 15, 0, s * 0.9, c(0.6))
}

// Card 3
function drawFlow(ctx: Ctx, t: number, c: Rgba) {
  const size = 65, segments = 22, step = (size * 2) / segments
  ctx.lineWidth = 1
  const getH = (x: number, z: number) => {
    const dist = Math.sqrt(x * x + z * z)
    const peak = Math.max(0, 45 - dist * 1.1)
    const wave = Math.sin(x * 0.2 + t * 1.5) * Math.cos(z * 0.2 + t * 1.5) * 5
    return -peak - wave + 15
  }
  for (let z = -size; z < size; z += step) {
    for (let x = -size; x < size; x += step) {
      const y1 = getH(x, z), y2 = getH(x + step, z)
      const y3 = getH(x + step, z + step), y4 = getH(x, z + step)
      const p1 = projectIso(x, y1, z), p2 = projectIso(x + step, y2, z)
      const p3 = projectIso(x + step, y3, z + step), p4 = projectIso(x, y4, z + step)
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath()
      ctx.fillStyle = BG; ctx.fill()
      const heightRatio = Math.max(0, -y1 / 30)
      const alpha = 0.05 + heightRatio * 0.4
      ctx.strokeStyle = heightRatio > 0.6 ? c(alpha + 0.3) : c(alpha + 0.05)
      ctx.stroke()
    }
  }
}

// Background wave grid
function drawBg(ctx: Ctx, bw: number, bh: number, bgT: number, c: Rgba) {
  ctx.save()
  ctx.translate(bw / 2, bh / 2 + 150)
  const cols = 32, rows = 22, sp = 65
  ctx.lineWidth = 1
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      const px = (x - cols / 2) * sp
      const pz = z * sp
      const scale = 800 / (800 + pz)
      const sx = px * scale
      const y = Math.sin(x * 0.3 + bgT) * Math.cos(z * 0.3 + bgT) * 60
      const sy = (y + 50) * scale - 200
      ctx.fillStyle = c(0.7 * scale)
      ctx.beginPath(); ctx.arc(sx, sy, 1.2 * scale, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = c(0.12 * scale)
      ctx.beginPath()
      if (x > 0) {
        const sxL = (x - 1 - cols / 2) * sp * scale
        const yL = Math.sin((x - 1) * 0.3 + bgT) * Math.cos(z * 0.3 + bgT) * 60
        ctx.moveTo(sx, sy); ctx.lineTo(sxL, (yL + 50) * scale - 200)
      }
      if (z > 0) {
        const scaleU = 800 / (800 + (z - 1) * sp)
        const yU = Math.sin(x * 0.3 + bgT) * Math.cos((z - 1) * 0.3 + bgT) * 60
        ctx.moveTo(sx, sy); ctx.lineTo(px * scaleU, (yU + 50) * scaleU - 200)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
}

function paint(canvas: HTMLCanvasElement | null, size: CanvasSize, center: boolean, render: (ctx: Ctx, w: number, h: number) => void) {
  const ctx = canvas?.getContext('2d', { alpha: true })
  if (!ctx) return
  const w = size.width / size.dpr, h = size.height / size.dpr
  ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  if (center) ctx.translate(w / 2, h / 2 + 5)
  render(ctx, w, h)
  ctx.restore()
}

const ICONS: ReactNode[] = [
  <path key="cpu" d="M9 4v2M15 4v2M9 18v2M15 18v2M4 9h2M4 15h2M18 9h2M18 15h2M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM10 10h4v4h-4z" />,
  <path key="server" d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM4 12h16M8 8h.01M8 16h.01M12 8h4M12 16h4" />,
  <path key="network" d="M12 4a2 2 0 1 0 0 .01M5 18a2 2 0 1 0 0 .01M19 18a2 2 0 1 0 0 .01M12 6v5M12 11l-6 5.5M12 11l6 5.5" />,
]

const CARDS = [
  { label: 'CORE-X', title: 'Neural Synchrony', body: 'Optimized for zero-latency cognitive routing, maintaining absolute parity across decentralized processing nodes.' },
  { label: 'LINK-Y', title: 'Fluid Topologies', body: 'Self-healing network architectures that dynamically adjust vectors to circumvent bottlenecks and systemic anomalies.' },
  { label: 'GRID-Z', title: 'Elastic Matrices', body: 'Responsive structural frameworks that instantly allocate computational mass during spikes and retract to preserve efficiency.' },
]

/** Typewriter timing from the upstream setTimeout chain: 80ms/char in, hold 4s, 30ms/char out, hold 1.5s. */
function typedLength(text: string, t: number) {
  const n = text.length
  const typeIn = n * 0.08, hold = 4, typeOut = n * 0.03, rest = 1.5
  const p = t % (typeIn + hold + typeOut + rest)
  if (p < typeIn) return Math.min(n, Math.floor(p / 0.08) + 1)
  if (p < typeIn + hold) return n
  if (p < typeIn + hold + typeOut) return Math.max(0, n - 1 - Math.floor((p - typeIn - hold) / 0.03))
  return 0
}

function RevealText({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <p className="text-sm leading-relaxed font-extralight text-white/40" aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={i} aria-hidden className="mr-[0.25em] inline-block overflow-hidden align-bottom leading-tight">
          <motion.span
            className="inline-block will-change-transform"
            initial={reduced ? false : { y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.02 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </p>
  )
}

export function FeaturesIsometricCards({ className, style, ...props }: FeaturesIsometricCardsProps) {
  const options = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const [r, g, b] = hexToRgb(options.accent)
  const rgb = `${r},${g},${b}`
  const optionsRef = useRef({ ...options, rgb })
  optionsRef.current = { ...options, rgb }

  const hostRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLCanvasElement>(null)
  const c1 = useRef<HTMLCanvasElement>(null)
  const c2 = useRef<HTMLCanvasElement>(null)
  const c3 = useRef<HTMLCanvasElement>(null)
  const shootRefs = useRef<(HTMLDivElement | null)[]>([])
  const timeRef = useRef(STATIC_TIME)
  const [typed, setTyped] = useState<number[]>(() => CARDS.map((c) => c.title.length))

  const draw = (time: number) => {
    timeRef.current = time
    const o = optionsRef.current
    const color: Rgba = (a) => `rgba(${o.rgb},${a})`
    const t = time * 0.9 // upstream: += 0.015 per frame
    paint(c1.current, s1.current, true, (ctx) => drawLayers(ctx, t, color))
    paint(c2.current, s2.current, true, (ctx) => drawNodes(ctx, t, color))
    paint(c3.current, s3.current, true, (ctx) => drawFlow(ctx, t, color))
    if (o.background) paint(bgRef.current, sb.current, false, (ctx, w, h) => drawBg(ctx, w, h, time * 0.72, color))

    // Shooting lines: upstream px-per-frame speeds at 60fps.
    const main = mainRef.current
    if (main) {
      const h = main.offsetHeight || 1000, w = main.offsetWidth || 1200
      const lines: [number, number, number, boolean][] = [
        [2.5, -200, h + 200, false], [1.8, -400, h + 200, false], [3, -300, h + 200, false], [3.5, -300, w + 300, true],
      ]
      lines.forEach(([v, start, range, horizontal], i) => {
        const el = shootRefs.current[i]
        if (!el) return
        const off = horizontal ? 300 : 200
        const pos = ((start + off + v * 60 * time) % range) - off
        el.style.transform = horizontal ? `translateX(${pos}px)` : `translateY(${pos}px)`
      })
    }

    const next = CARDS.map((c) => (o.typewriter ? typedLength(c.title, time) : c.title.length))
    setTyped((prev) => (prev.every((v, i) => v === next[i]) ? prev : next))
  }

  const redraw = () => draw(timeRef.current)
  const s1 = useCanvasSize(c1, { maxDpr: 1.5, onResize: redraw })
  const s2 = useCanvasSize(c2, { maxDpr: 1.5, onResize: redraw })
  const s3 = useCanvasSize(c3, { maxDpr: 1.5, onResize: redraw })
  const sb = useCanvasSize(bgRef, { maxDpr: 1, onResize: redraw })

  useFrameLoop(hostRef, ({ time }) => draw(time + STATIC_TIME), {
    speed: options.speed,
    reducedMotion: 'static',
    staticTime: 0,
  })

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const main = mainRef.current, flash = flashRef.current
    if (!main || !flash) return
    const rect = main.getBoundingClientRect()
    flash.style.setProperty('--x', `${e.clientX - rect.left}px`)
    flash.style.setProperty('--y', `${e.clientY - rect.top}px`)
    flash.style.opacity = '1'
  }
  const onLeave = () => {
    if (flashRef.current) flashRef.current.style.opacity = '0'
  }

  const accent = (a: number) => `rgba(${rgb},${a})`
  const canvases = [c1, c2, c3] as RefObject<HTMLCanvasElement | null>[]

  return (
    <section
      ref={hostRef}
      className={cn('relative flex items-center justify-center overflow-hidden bg-[#020804] p-4 text-white/90 antialiased md:p-12', className)}
      style={{ fontFamily: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif", ...style }}
    >
      {/* Lines & Particles Background */}
      {options.background && <canvas ref={bgRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40" />}

      <main
        ref={mainRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative z-10 w-full max-w-7xl rounded-sm bg-white/[0.04] p-px shadow-2xl backdrop-blur-sm"
        style={{ boxShadow: `0 25px 50px -12px ${accent(0.05)}` }}
      >
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
          style={{ background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), ${accent(0.08)}, transparent 40%)` }}
        />

        {/* Corner Accents */}
        {['-top-[3px] -left-[3px]', '-top-[3px] -right-[3px]', '-bottom-[3px] -left-[3px]', '-bottom-[3px] -right-[3px]'].map((pos) => (
          <div key={pos} className={cn('absolute z-30 h-1.5 w-1.5 border bg-[#020804]', pos)} style={{ borderColor: accent(0.3) }} />
        ))}

        {/* Horizontal Shooting Line */}
        <div className="pointer-events-none absolute -top-px right-0 left-0 z-20 hidden h-px overflow-hidden md:block">
          <div
            ref={(el) => { shootRefs.current[3] = el }}
            className="absolute top-0 left-0 h-full w-64"
            style={{ background: `linear-gradient(to right, transparent, ${accent(0.8)}, transparent)` }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-y-px md:grid-cols-3 md:gap-x-px">
          {CARDS.map((card, i) => (
            <article key={card.label} className="relative flex flex-col bg-[#020804]/90 px-6 py-12 backdrop-blur-md md:p-12">
              {/* Border Gradient Overlay */}
              {options.cardStyle === 'gradient' && (
                <div
                  className="pointer-events-none absolute inset-0 z-20 border border-transparent"
                  style={{
                    background: `linear-gradient(to bottom, ${accent(0.35)}, transparent) border-box`,
                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    mask: 'linear-gradient(#fff 0 0) padding-box exclude, linear-gradient(#fff 0 0)',
                  }}
                />
              )}

              {i > 0 && (
                <div className="pointer-events-none absolute top-0 bottom-0 -left-px z-20 hidden w-px overflow-hidden md:block">
                  <div
                    ref={(el) => { shootRefs.current[i - 1] = el }}
                    className={cn('absolute top-0 left-0 w-full', i === 1 ? 'h-48' : 'h-32')}
                    style={{ background: `linear-gradient(to bottom, transparent, ${accent(i === 1 ? 0.7 : 0.6)}, transparent)` }}
                  />
                </div>
              )}
              {i === 2 && (
                <div className="pointer-events-none absolute top-0 -right-px bottom-0 z-20 hidden w-px overflow-hidden md:block">
                  <div
                    ref={(el) => { shootRefs.current[2] = el }}
                    className="absolute top-0 left-0 h-56 w-full"
                    style={{ background: `linear-gradient(to bottom, transparent, ${accent(0.7)}, transparent)` }}
                  />
                </div>
              )}

              <header className="mb-16 flex items-center gap-3 text-xs font-extralight tracking-widest text-white/40 uppercase" style={{ fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace" }}>
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke={options.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ filter: `drop-shadow(0 0 8px ${accent(0.5)})` }}>
                  {ICONS[i]}
                </svg>
                {card.label}
              </header>
              <div className="relative mb-16 flex h-56 w-full flex-grow items-center justify-center">
                <canvas ref={canvases[i]} aria-hidden className="absolute inset-0 h-full w-full" style={{ touchAction: 'none' }} />
              </div>
              <div>
                <h3 className="mb-3 flex items-center text-lg font-extralight tracking-tight text-white/90" aria-label={card.title}>
                  <span aria-hidden>{card.title.slice(0, typed[i])}</span>
                  <span
                    aria-hidden
                    className="ml-2 inline-block h-4 w-1 animate-pulse motion-reduce:animate-none"
                    style={{ background: accent(0.8), boxShadow: `0 0 8px ${accent(0.6)}` }}
                  />
                </h3>
                <RevealText text={card.body} reduced={reduced} />
              </div>
            </article>
          ))}
        </div>
      </main>
    </section>
  )
}
