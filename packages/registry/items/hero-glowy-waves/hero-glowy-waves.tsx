// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/glowy-waves-hero.tsx
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { motion } from 'motion/react'
import { useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  headline: 'Live visuals that keep up with your data',
  subline: 'Drive installations, lobby screens and launch pages from one timeline. Sub-10ms response, no render farm.',
  cta: 'Book a demo',
  palette: ['#7c5cff', '#22d3ee', '#f472b6'],
  font: 'geist',
  radius: 999,
  layout: 'behind',
  amplitude: 1,
  speed: 1,
  pointer: 1,
}
/* @motif:end */

export type HeroGlowyWavesProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.05em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.055em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.03em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function rgba(hex: string, a: number) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

// 每条波的相位、振幅、频率沿用上游的一组预设，颜色轮流取自调色板。
const WAVES = [
  { offset: 0, amplitude: 70, frequency: 0.003, opacity: 0.9 },
  { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, opacity: 0.75 },
  { offset: Math.PI, amplitude: 60, frequency: 0.0034, opacity: 0.65 },
  { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, opacity: 0.55 },
  { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, opacity: 0.45 },
]

const STATS: [string, string][] = [
  ['320+', 'live installations'],
  ['8 ms', 'median latency'],
  ['120', 'teams onboarded'],
]

export function HeroGlowyWaves({ className, style, ...props }: HeroGlowyWavesProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const host = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const opts = useRef(o)
  opts.current = o
  const pointer = useRef({ x: 0.5, y: 0.5, real: false, at: -10, sx: 0.5, sy: 0.5 })
  const draw = useRef<(t: number, dt: number) => void>(() => {})
  const below = o.layout === 'below'

  const lastTime = useRef(3)
  const size = useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => draw.current(lastTime.current, 0) })

  draw.current = (time, dt) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width, height, dpr } = size.current
    const w = width / dpr
    const h = height / dpr
    const cfg = opts.current
    const p = pointer.current
    // 没有真实指针时，一个虚拟指针沿波面缓慢来回，海报和视频里也能看到互动效果。
    const auto = { x: 0.5 + 0.34 * Math.sin(time * 0.45), y: 0.5 + 0.1 * Math.sin(time * 0.7) }
    const target = p.real && time - p.at < 2 ? { x: p.x, y: p.y } : auto
    const k = dt > 0 ? 1 - Math.pow(0.001, dt) : 1
    p.sx += (target.x - p.sx) * k
    p.sy += (target.y - p.sy) * k

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const base = cfg.layout === 'below' ? h * 0.72 : h * 0.55
    const colors = cfg.palette as string[]
    const influenceRadius = 340
    const influence = 78 * cfg.pointer
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineJoin = 'round'
    WAVES.forEach((wave, i) => {
      const color = colors[i % colors.length]!
      const amp = wave.amplitude * cfg.amplitude
      ctx.beginPath()
      for (let x = 0; x <= w + 4; x += 4) {
        const dx = x - p.sx * w
        const dy = base - p.sy * h
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / influenceRadius)
        const y =
          base +
          Math.sin(x * wave.frequency + time * 1.2 + wave.offset) * amp +
          Math.sin(x * wave.frequency * 0.4 + time * 1.7) * amp * 0.45 +
          near * influence * Math.sin(time * 0.9 + x * 0.01 + wave.offset)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      // 光晕用一条粗而淡的线叠出来，比 shadowBlur 便宜得多。
      ctx.strokeStyle = rgba(color, 0.07 * wave.opacity)
      ctx.lineWidth = 16
      ctx.stroke()
      ctx.strokeStyle = rgba(color, 0.16 * wave.opacity)
      ctx.lineWidth = 6
      ctx.stroke()
      ctx.strokeStyle = rgba(color, 0.95 * wave.opacity)
      ctx.lineWidth = 1.6
      ctx.stroke()
    })
    ctx.globalCompositeOperation = 'source-over'
  }

  useFrameLoop(
    host,
    ({ time, delta }) => {
      lastTime.current = time * o.speed
      draw.current(time * o.speed, delta * o.speed)
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  const radius = `${o.radius}px`

  return (
    <section
      ref={host}
      className={cn('relative isolate flex min-h-[800px] w-full flex-col overflow-hidden', className)}
      style={{ background: 'radial-gradient(90% 60% at 50% 100%, #14163a 0%, #080910 60%, #05060a 100%)', color: '#f5f5f7', fontFamily: BODY, ...style }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        pointer.current.x = (e.clientX - r.left) / r.width
        pointer.current.y = (e.clientY - r.top) / r.height
        pointer.current.real = true
        pointer.current.at = lastTime.current
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden style={{ background: 'radial-gradient(60% 45% at 50% 22%, rgba(5,6,10,0.75), transparent)' }} />

      <div className={cn('mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 text-center sm:px-10', below ? 'pt-28' : 'justify-center pb-16')}>
        <motion.div {...fade(0)} className="flex flex-wrap justify-center gap-2">
          {['Immersive visuals', 'Responsive motion', 'GPU friendly'].map((t) => (
            <span key={t} className="rounded-full border px-3.5 py-1.5 text-[12px] backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: 'rgba(245,245,247,0.78)' }}>
              {t}
            </span>
          ))}
        </motion.div>
        <motion.h1
          {...fade(0.08)}
          className="mt-8 max-w-4xl text-balance text-[clamp(2.7rem,7vw,5.8rem)] leading-[1.0]"
          style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking, textShadow: '0 4px 40px rgba(5,6,10,0.8)' }}
        >
          {o.headline}
        </motion.h1>
        <motion.p {...fade(0.16)} className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed" style={{ color: 'rgba(245,245,247,0.68)', textShadow: '0 2px 20px rgba(5,6,10,0.9)' }}>
          {o.subline}
        </motion.p>
        <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium" style={{ borderRadius: radius, background: colorAt(o.palette, 0), color: onColor(colorAt(o.palette, 0)), boxShadow: `0 10px 40px -10px ${colorAt(o.palette, 0)}` }}>
            {o.cta}
          </span>
          <span className="inline-flex items-center border px-6 py-3.5 text-[15px] font-medium backdrop-blur-md" style={{ borderRadius: radius, borderColor: 'rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)' }}>
            See it in motion
          </span>
        </motion.div>
      </div>

      <motion.dl {...fade(0.4)} className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4 px-6 pb-12 text-center sm:px-10">
        {STATS.map(([v, l]) => (
          <div key={l} className="rounded-2xl border px-3 py-4 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(8,9,16,0.5)' }}>
            <dt className="text-[22px] font-semibold tabular-nums sm:text-[26px]" style={{ fontFamily: font.family, letterSpacing: '-0.03em' }}>
              {v}
            </dt>
            <dd className="mt-0.5 text-[12px]" style={{ color: 'rgba(245,245,247,0.56)' }}>
              {l}
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  )
}

function colorAt(palette: unknown, i: number) {
  const list = palette as string[]
  return list[i % list.length] ?? '#7c5cff'
}
