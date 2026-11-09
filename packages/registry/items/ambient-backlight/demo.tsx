import { useRef } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { Backlight, type BacklightProps } from './ambient-backlight'

const ARTWORK = {
  aurora: { bg: '#0b1a3a', blobs: ['#22d3ee', '#a855f7', '#34d399', '#f472b6'] },
  sunset: { bg: '#3a0d1f', blobs: ['#fb923c', '#f43f5e', '#facc15', '#c026d3'] },
  ocean: { bg: '#04213a', blobs: ['#0ea5e9', '#2dd4bf', '#6366f1', '#38bdf8'] },
} as const

const ORBITS = [
  { cx: 90, cy: 100, rx: 50, ry: 40, r: 60, f: 0.5, p: 0 },
  { cx: 210, cy: 110, rx: 45, ry: 55, r: 56, f: 0.37, p: 2 },
  { cx: 120, cy: 210, rx: 60, ry: 35, r: 52, f: 0.43, p: 4 },
  { cx: 220, cy: 220, rx: 40, ry: 50, r: 50, f: 0.31, p: 1 },
]

export function Demo(props: BacklightProps) {
  const host = useRef<HTMLDivElement>(null)
  const blobs = useRef<(SVGCircleElement | null)[]>([])
  const art = ARTWORK[props.artwork as keyof typeof ARTWORK] ?? ARTWORK.aurora

  useFrameLoop(
    host,
    ({ time }) => {
      ORBITS.forEach((o, i) => {
        const el = blobs.current[i]
        if (!el) return
        el.setAttribute('cx', String(o.cx + Math.cos(time * o.f + o.p) * o.rx))
        el.setAttribute('cy', String(o.cy + Math.sin(time * o.f * 1.3 + o.p) * o.ry))
      })
    },
    { speed: props.artSpeed ?? 1, staticTime: 2 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-[#050507] p-8">
      <div className="flex w-full max-w-[18rem] flex-col items-center gap-6">
        <Backlight {...props} className="w-full">
          <svg viewBox="0 0 300 300" className="block h-auto w-full" role="img" aria-label="Album artwork: drifting color fields">
            <defs>
              {art.blobs.map((c, i) => (
                <radialGradient key={i} id={`ambient-backlight-g${i}`}>
                  <stop offset="0" stopColor={c} />
                  <stop offset="1" stopColor={c} stopOpacity="0" />
                </radialGradient>
              ))}
              <clipPath id="ambient-backlight-clip">
                <rect width="300" height="300" rx="14" />
              </clipPath>
            </defs>
            <g clipPath="url(#ambient-backlight-clip)">
              <rect width="300" height="300" fill={art.bg} />
              <g>
                {ORBITS.map((o, i) => (
                  <circle
                    key={i}
                    ref={(el) => {
                      blobs.current[i] = el
                    }}
                    cx={o.cx}
                    cy={o.cy}
                    r={o.r * 1.8}
                    fill={`url(#ambient-backlight-g${i})`}
                  />
                ))}
              </g>
              <text x="24" y="272" fill="#ffffff" fillOpacity="0.9" fontSize="22" fontWeight="600" fontFamily="system-ui, sans-serif">
                Low Tide
              </text>
            </g>
          </svg>
        </Backlight>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Low Tide</p>
          <p className="text-xs text-white/60">Harbor Lights · 2026</p>
        </div>
      </div>
    </div>
  )
}
