'use client'

import { useRef } from 'react'

type Curve = [number, number, number, number]

// 常用缓动：数值取自 open-props（MIT）的 easing 变量。
const PRESETS: { name: string; curve: Curve }[] = [
  { name: 'ease-out', curve: [0, 0, 0.3, 1] },
  { name: 'ease-out-strong', curve: [0, 0, 0, 1] },
  { name: 'ease-in-out', curve: [0.5, 0, 0.5, 1] },
  { name: 'ease-in', curve: [0.5, 0, 1, 1] },
  { name: 'expressive', curve: [0.22, 1, 0.36, 1] },
  { name: 'overshoot', curve: [0.34, 1.56, 0.64, 1] },
]

const SIZE = 132
const PAD = 16
const INNER = SIZE - PAD * 2

/** cubic-bezier 曲线编辑器：拖动两个控制点；y 可以超出 [0,1] 做回弹。 */
export function EasingEditor({ id, value, onChange, label }: { id: string; value: Curve; onChange: (value: Curve) => void; label: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [x1, y1, x2, y2] = value
  const toX = (x: number) => PAD + x * INNER
  const toY = (y: number) => PAD + (1 - y) * INNER

  const drag = (handle: 0 | 1) => (event: React.PointerEvent<SVGCircleElement>) => {
    const svg = svgRef.current
    if (!svg) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const move = (e: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, ((e.clientX - rect.left) / rect.width) * SIZE - PAD) / INNER)
      const y = Math.min(1.6, Math.max(-0.6, 1 - ((((e.clientY - rect.top) / rect.height) * SIZE - PAD) / INNER)))
      const round = (n: number) => Math.round(n * 100) / 100
      onChange(handle === 0 ? [round(x), round(y), x2, y2] : [x1, y1, round(x), round(y)])
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="flex gap-3" id={id}>
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-[132px] shrink-0 touch-none overflow-visible rounded-lg border border-line bg-sunken" role="img" aria-label={label}>
        <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="none" stroke="oklch(1 0 0 / 0.06)" />
        <line x1={toX(0)} y1={toY(0)} x2={toX(x1)} y2={toY(y1)} stroke="oklch(1 0 0 / 0.3)" />
        <line x1={toX(1)} y1={toY(1)} x2={toX(x2)} y2={toY(y2)} stroke="oklch(1 0 0 / 0.3)" />
        <path d={`M ${toX(0)} ${toY(0)} C ${toX(x1)} ${toY(y1)}, ${toX(x2)} ${toY(y2)}, ${toX(1)} ${toY(1)}`} fill="none" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx={toX(x1)} cy={toY(y1)} r="5.5" fill="var(--color-focus)" className="cursor-grab" onPointerDown={drag(0)} />
        <circle cx={toX(x2)} cy={toY(y2)} r="5.5" fill="var(--color-focus)" className="cursor-grab" onPointerDown={drag(1)} />
      </svg>
      <div className="flex flex-col gap-1">
        {PRESETS.map((preset) => {
          const active = preset.curve.every((n, i) => Math.abs(n - value[i]!) < 0.005)
          return (
            <button
              key={preset.name}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(preset.curve)}
              className="rounded px-1.5 py-0.5 text-left font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:text-ink"
            >
              {preset.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
