import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { Lens, type LensProps } from './lens-magnifier'

/** 生成的插画：远山、湖面和营地，细节小到值得放大。 */
function Artwork() {
  return (
    <svg viewBox="0 0 500 500" className="block h-full w-full" role="img" aria-label="Illustrated lakeside camp at dusk">
      <defs>
        <linearGradient id="lm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="0.55" stopColor="#c2410c" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="lm-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="500" height="320" fill="url(#lm-sky)" />
      <circle cx="330" cy="250" r="46" fill="#fde68a" />
      {[
        [60, 60],
        [120, 36],
        [210, 80],
        [400, 50],
        [455, 96],
        [300, 30],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.85" />
      ))}
      <path d="M0 300 L70 200 L120 250 L190 150 L260 260 L320 210 L400 280 L460 190 L500 240 V320 H0Z" fill="#431407" />
      <path d="M180 162 L190 150 L200 166 L192 160Z M450 202 L460 190 L470 205 L461 198Z" fill="#fef3c7" />
      <path d="M0 320 L60 270 L130 300 L210 250 L300 300 L380 262 L500 310 V330 H0Z" fill="#1c0a05" />
      <rect y="320" width="500" height="180" fill="url(#lm-lake)" />
      {[340, 356, 372, 390].map((y, i) => (
        <rect key={y} x={300 - i * 6} y={y} width={60 + i * 12} height="2" rx="1" fill="#fde68a" opacity={0.7 - i * 0.12} />
      ))}
      <path d="M0 430 Q120 400 250 425 T500 420 V500 H0Z" fill="#0b0a1f" />
      {[30, 52, 76, 430, 452, 476].map((x, i) => (
        <path key={x} d={`M${x} ${440 - (i % 2) * 6} l12 -40 l12 40Z`} fill="#052e16" />
      ))}
      <path d="M150 460 L180 420 L210 460Z" fill="#ea580c" />
      <path d="M180 420 L172 460 H188Z" fill="#7c2d12" />
      <circle cx="240" cy="458" r="5" fill="#fbbf24" />
      <path d="M236 462 L244 462 L240 450Z" fill="#fef08a" />
      <text x="262" y="474" fontSize="7" fill="#fde68a" opacity="0.8" fontFamily="system-ui, sans-serif">
        Camp 04 · 1,240 m
      </text>
    </svg>
  )
}

export function Demo(props: Omit<LensProps, 'children'>) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [size, setSize] = useState({ w: 400, h: 400 })
  const [auto, setAuto] = useState({ x: 200, y: 220 })

  useFrameLoop(
    host,
    ({ time }) => {
      const w = frame.current?.offsetWidth ?? 400
      const h = frame.current?.offsetHeight ?? 400
      if (w !== size.w || h !== size.h) setSize({ w, h })
      if (manual) return
      setAuto({ x: w * (0.5 + 0.3 * Math.sin(time * 0.7)), y: h * (0.6 + 0.2 * Math.sin(time * 1.1 + 0.6)) })
    },
    { reducedMotion: 'static', staticTime: 1.4 },
  )

  const pinned = { x: size.w * 0.66, y: size.h * 0.5 }

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-4 text-card-foreground shadow-2xl shadow-black/30">
        <div ref={frame} className="aspect-square w-full" onPointerEnter={() => setManual(true)}>
          <Lens {...props} isStatic={props.isStatic || !manual} position={props.isStatic ? pinned : auto}>
            <div className="aspect-square w-full">
              <Artwork />
            </div>
          </Lens>
        </div>
        <div className="mt-4 text-xl font-semibold tracking-tight">Your next camp</div>
        <p className="mt-1 text-sm text-muted-foreground">Lakeside pitches above the tree line, open from June to September.</p>
        <div className="mt-4 flex gap-3">
          <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Let&apos;s go
          </button>
          <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            Another time
          </button>
        </div>
      </div>
    </div>
  )
}
