import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { defaults, FolderReveal, type FolderRevealItem, type FolderRevealProps } from './folder-fan-reveal'

type FileSpec = { id: string; lines: number[]; name: string; size: string; tint: string }

const PAPER = 'oklch(0.985 0.004 90)'

const FILES: FileSpec[] = [
  { id: 'inv-q1', lines: [90, 74, 82, 58], name: 'Invoice Q1.pdf', size: '248 KB', tint: PAPER },
  { id: 'inv-q2', lines: [86, 62, 78, 70], name: 'Invoice Q2.pdf', size: '312 KB', tint: PAPER },
  { id: 'receipts', lines: [72, 88, 54, 80], name: 'Receipts.xlsx', size: '1.2 MB', tint: 'oklch(0.975 0.014 150)' },
  { id: 'contract', lines: [80, 66, 92, 48], name: 'Lease 2026.pdf', size: '540 KB', tint: PAPER },
  { id: 'notes', lines: [64, 88, 46], name: 'Tax notes.md', size: '12 KB', tint: 'oklch(0.97 0.025 85)' },
]

function FileCard({ lines, name, size, tint }: Omit<FileSpec, 'id'>) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-1 p-2" style={{ background: tint }}>
        {lines.map((width, index) => (
          <div key={`${name}-line-${index}`} className="h-[3px] rounded-full bg-black/15" style={{ width: `${width}%` }} />
        ))}
      </div>
      <div className="border-t border-foreground/10 bg-background px-2 py-1">
        <p className="truncate text-[9px] leading-tight font-medium text-foreground">{name}</p>
        <p className="text-[8px] text-muted-foreground tabular-nums">{size}</p>
      </div>
    </div>
  )
}

const ITEMS: FolderRevealItem[] = FILES.map(({ id, ...file }) => ({ id, content: <FileCard {...file} /> }))

/** 自动播放：每 5 秒一轮，1.0–3.6 秒打开。 */
const isAutoOpen = (time: number) => {
  const t = time % 5
  return t >= 1 && t < 3.6
}

export function Demo(props: Partial<typeof defaults>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  const [manual, setManual] = useState<boolean | null>(null)
  const [scale, setScale] = useState(1)
  const opts = { ...defaults, ...props }

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = isAutoOpen(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  // 扇开后的宽度可能超过窄屏，按容器宽度整体缩小
  useEffect(() => {
    const el = host.current
    if (!el) return
    const count = Math.max(1, Math.min(opts.itemCount, ITEMS.length))
    const fanWidth = Math.max(opts.size, (count - 1) * opts.spread + opts.size * 0.6 + 24)
    const update = () => setScale(Math.min(1, (el.clientWidth - 32) / fanWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [opts.itemCount, opts.size, opts.spread])

  const handle: FolderRevealProps['onOpenChange'] = (next) => setManual(next)

  return (
    <div ref={host} className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden bg-background p-4">
      <div style={{ transform: `scale(${scale})` }} className="flex flex-col items-center gap-4">
        <div className="flex items-end" style={{ height: opts.size * 0.78 * 1.45 }}>
          <FolderReveal {...props} items={ITEMS} open={manual ?? auto} onOpenChange={handle} />
        </div>
        <p className="text-[11px] text-muted-foreground">{opts.trigger === 'click' ? 'Click to toggle' : 'Hover to open'}</p>
      </div>
    </div>
  )
}
