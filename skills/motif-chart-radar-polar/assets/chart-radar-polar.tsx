// SPDX-License-Identifier: MIT
// Copyright (c) Mark Mead
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/application/charts/8.html
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  chartType: 'radar',
  palette: ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'],
  rings: 5,
  fillOpacity: 0.2,
  tone: 'light',
  showLegend: true,
  animateIn: true,
}
/* @motif:end */

export type ChartRadarPolarProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled hover index (used by the demo autoplay); pointer / keyboard hover overrides it. */
  activeIndex?: number | null
}

// 8.html: team performance radar.
const radarLabels = ['Speed', 'Quality', 'Collaboration', 'Innovation', 'Reliability']
const radarSets = [
  { label: 'Team A', data: [80, 90, 70, 60, 85] },
  { label: 'Team B', data: [65, 75, 88, 92, 70] },
]
// 9.html: traffic sources polar area.
const polarLabels = ['Organic', 'Paid', 'Referral', 'Direct']
const polarData = [45, 25, 18, 12]

const H = 256 // h-64

function rgba(hex: string, a: number) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return hex
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

const polarPt = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const

export function ChartRadarPolar({ className, style, activeIndex = null, ...props }: ChartRadarPolarProps) {
  const { chartType, palette, rings, fillOpacity, tone, showLegend, animateIn } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const polar = chartType === 'polar'
  const dark = tone === 'dark'
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [pointer, setPointer] = useState<number | null>(null)
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState(animateIn && !reduced ? 0 : 1)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Chart.js-style grow-in from the center, replayed when the chart type changes.
  useEffect(() => {
    setHidden({})
    if (!animateIn || reduced) {
      setProgress(1)
      return
    }
    setProgress(0)
    const controls = animate(0, 1, { duration: 1, ease: [0.22, 1, 0.36, 1], onUpdate: setProgress })
    return () => controls.stop()
  }, [chartType, animateIn, reduced])

  const colors = [0, 1, 2, 3].map((i) => palette[i] ?? defaults.palette[i])
  const ink = dark
    ? { card: '#111827', border: '#1f2937', title: '#f9fafb', label: '#d1d5db', grid: '#374151' }
    : { card: '#ffffff', border: '#e5e7eb', title: '#111827', label: '#4b5563', grid: '#e5e7eb' }

  const labels = polar ? polarLabels : radarLabels
  const n = labels.length
  const hover = pointer ?? activeIndex
  const cx = width / 2
  const cy = H / 2 - (showLegend ? 14 : 0)
  const R = Math.max(30, polar ? Math.min(width / 2, cy) - 8 : Math.min(width / 2 - 56, cy - 22))
  const ringCount = Math.round(rings)
  const max = polar ? Math.ceil(Math.max(...polarData) / ringCount / 5) * 5 * ringCount : 100
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2
  const scale = (v: number) => (v / max) * R * progress

  const legend = polar ? polarLabels.map((label, i) => ({ label, color: colors[i] })) : radarSets.map((s, i) => ({ label: s.label, color: colors[i] }))

  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    setPointer((p) => (p === null ? 0 : (p + next + n) % n))
  }

  // Tooltip anchor and rows (Chart.js default dark tooltip).
  let tip: { x: number; y: number; title: string; rows: { label: string; value: string; color: string }[] } | null = null
  if (hover !== null && hover < n) {
    if (polar) {
      if (!hidden[polarLabels[hover]]) {
        const [x, y] = polarPt(scale(polarData[hover]) * 0.6, angle(hover) + Math.PI / n)
        tip = { x: cx + x, y: cy + y, title: '', rows: [{ label: polarLabels[hover], value: `${polarData[hover]}%`, color: colors[hover] }] }
      }
    } else {
      const visible = radarSets.map((s, k) => ({ ...s, color: colors[k] })).filter((s) => !hidden[s.label])
      if (visible.length) {
        const top = Math.max(...visible.map((s) => s.data[hover]))
        const [x, y] = polarPt(scale(top), angle(hover))
        tip = { x: cx + x, y: cy + y, title: radarLabels[hover], rows: visible.map((s) => ({ label: s.label, value: String(s.data[hover]), color: s.color })) }
      }
    }
  }

  const title = polar ? 'Traffic sources' : 'Team performance'

  return (
    <div className={cn('w-full max-w-sm rounded-lg border p-6', className)} style={{ backgroundColor: ink.card, borderColor: ink.border, ...style }}>
      <h2 className="text-sm font-medium" style={{ color: ink.title }}>
        {title}
      </h2>

      <div
        ref={box}
        className="relative mt-4 h-64 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        tabIndex={0}
        role="group"
        aria-label={`${title}, ${polar ? 'polar area' : 'radar'} chart. Use arrow keys to inspect values.`}
        onKeyDown={onKey}
        onBlur={() => setPointer(null)}
      >
        {width > 0 && (
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block touch-pan-y overflow-visible select-none" aria-hidden="true" onPointerLeave={() => setPointer(null)}>
            <g transform={`translate(${cx} ${cy})`}>
              {/* Grid: polygons for radar, circles for polar area. */}
              {Array.from({ length: ringCount }, (_, k) => {
                const r = ((k + 1) / ringCount) * R
                return polar ? (
                  <circle key={k} r={r} fill="none" stroke={ink.grid} />
                ) : (
                  <polygon key={k} points={labels.map((_, i) => polarPt(r, angle(i)).join(',')).join(' ')} fill="none" stroke={ink.grid} />
                )
              })}
              {!polar &&
                labels.map((label, i) => {
                  const [x, y] = polarPt(R, angle(i))
                  const [lx, ly] = polarPt(R + 12, angle(i))
                  const c = Math.cos(angle(i))
                  const s = Math.sin(angle(i))
                  return (
                    <g key={label}>
                      <line x1={0} y1={0} x2={x} y2={y} stroke={ink.grid} />
                      <text x={lx} y={ly + (s > 0.3 ? 10 : s < -0.3 ? -2 : 4)} textAnchor={c > 0.2 ? 'start' : c < -0.2 ? 'end' : 'middle'} fill={ink.label} fontSize={11} fontWeight={hover === i ? 600 : 400}>
                        {label}
                      </text>
                    </g>
                  )
                })}

              {polar
                ? polarData.map((v, i) => {
                    if (hidden[polarLabels[i]]) return null
                    const span = (Math.PI * 2) / n
                    const a0 = -Math.PI / 2 + i * span * progress
                    const a1 = a0 + span * progress
                    const r = scale(v)
                    const [x0, y0] = polarPt(r, a0)
                    const [x1, y1] = polarPt(r, a1)
                    return (
                      <path
                        key={polarLabels[i]}
                        d={`M0 0L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`}
                        fill={hover === i ? colors[i] : rgba(colors[i], Math.min(1, 0.5 + fillOpacity))}
                        stroke={ink.card}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        onPointerEnter={() => setPointer(i)}
                      />
                    )
                  })
                : radarSets.map((s, k) => {
                    if (hidden[s.label]) return null
                    const pts = s.data.map((v, i) => polarPt(scale(v), angle(i)))
                    return (
                      <g key={s.label}>
                        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={rgba(colors[k], fillOpacity)} stroke={colors[k]} strokeWidth={2} strokeLinejoin="round" />
                        {pts.map(([x, y], i) => (
                          <circle key={radarLabels[i]} cx={x} cy={y} r={hover === i ? 5 : 3} fill={colors[k]} stroke="#ffffff" strokeWidth={1} />
                        ))}
                      </g>
                    )
                  })}

              {/* Radar hit areas: one wedge per axis. */}
              {!polar &&
                labels.map((label, i) => {
                  const half = Math.PI / n
                  const rr = R + 20
                  const [x0, y0] = polarPt(rr, angle(i) - half)
                  const [x1, y1] = polarPt(rr, angle(i) + half)
                  return <path key={label} d={`M0 0L${x0} ${y0}A${rr} ${rr} 0 0 1 ${x1} ${y1}Z`} fill="transparent" onPointerEnter={() => setPointer(i)} />
                })}
            </g>
          </svg>
        )}

        {tip && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 rounded-md px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: tip.x,
              top: tip.y,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              transform: `translate(${tip.x > width / 2 ? 'calc(-100% - 10px)' : '10px'}, -50%)`,
            }}
          >
            {tip.title && <div className="mb-1 font-semibold whitespace-nowrap">{tip.title}</div>}
            {tip.rows.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-2.5 w-2.5 shrink-0 border border-white" style={{ backgroundColor: row.color }} />
                {row.label}: {row.value}
              </div>
            ))}
          </div>
        )}

        {showLegend && (
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {legend.map((item) => {
              const off = Boolean(hidden[item.label])
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={!off}
                  onClick={() => setHidden((h) => ({ ...h, [item.label]: !h[item.label] }))}
                  className="flex items-center gap-1.5 rounded px-1 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                  style={{ color: ink.label }}
                >
                  <span className="h-3 w-8 shrink-0 border-2" style={{ borderColor: item.color, backgroundColor: rgba(item.color, polar ? Math.min(1, 0.5 + fillOpacity) : fillOpacity) }} />
                  <span className={cn(off && 'line-through')}>{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {polar ? (
        <table className="sr-only">
          <caption>Traffic by source</caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {polarLabels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{polarData[i]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="sr-only">
          <caption>Team performance by metric</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              {radarSets.map((s) => (
                <th key={s.label} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {radarLabels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {radarSets.map((s) => (
                  <td key={s.label}>{s.data[i]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
