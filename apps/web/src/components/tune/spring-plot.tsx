/**
 * 弹簧响应曲线的小图：用和 motion 相同的「visualDuration + bounce」参数化，
 * 画出从 0 到 1 的位移随时间的变化（阻尼比 = 1 − bounce）。
 */
export function SpringPlot({ visualDuration, bounce }: { visualDuration: number; bounce: number }) {
  const width = 236
  const height = 64
  const total = Math.max(visualDuration * 2.2, 0.4)
  const zeta = Math.min(Math.max(1 - bounce, 0.05), 1)
  // 让曲线在 visualDuration 附近基本到位：自然频率按视觉时长估算。
  const omega = (2 * Math.PI) / Math.max(visualDuration, 0.05) * (zeta < 1 ? 0.75 : 0.9)

  const displacement = (t: number) => {
    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta)
      return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
    }
    return 1 - Math.exp(-omega * t) * (1 + omega * t)
  }

  const points: string[] = []
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * total
    const y = displacement(t)
    points.push(`${((i / 80) * width).toFixed(1)},${(height - 10 - y * (height - 22)).toFixed(1)}`)
  }
  const target = height - 10 - (height - 22)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full rounded-lg border border-line bg-sunken" aria-hidden>
      <line x1="0" x2={width} y1={target} y2={target} stroke="oklch(1 0 0 / 0.08)" strokeDasharray="3 3" />
      <line x1={(visualDuration / total) * width} x2={(visualDuration / total) * width} y1="4" y2={height - 4} stroke="oklch(1 0 0 / 0.08)" />
      <polyline points={points.join(' ')} fill="none" stroke="var(--color-ink)" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}
