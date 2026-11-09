import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { Cursor, type CursorProps } from './cursor-preview-list'

const WORK = [
  { title: 'Halden Coffee', kind: 'Identity', year: '2025', art: 'linear-gradient(160deg,#f6c27a,#e0745a 55%,#7c2d3b)', mark: 'circle' },
  { title: 'Tidewater', kind: 'Product', year: '2025', art: 'linear-gradient(200deg,#7dd3c0,#2a8ca8 55%,#123a5c)', mark: 'phone' },
  { title: 'North Atelier', kind: 'Website', year: '2024', art: 'linear-gradient(170deg,#b9b2f5,#6d5bd0 50%,#2b2160)', mark: 'lines' },
  { title: 'Ferro Lamps', kind: 'Campaign', year: '2024', art: 'linear-gradient(150deg,#e9e4d8,#a8a29e 55%,#3f3a36)', mark: 'arc' },
  { title: 'Okra Market', kind: 'Packaging', year: '2023', art: 'linear-gradient(190deg,#d9f99d,#65a30d 55%,#1a2e05)', mark: 'grid' },
] as const

function Art({ index }: { index: number }) {
  const work = WORK[index]!
  return (
    <div className="relative size-full overflow-hidden rounded-lg" style={{ background: work.art }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {work.mark === 'circle' && <circle cx="50" cy="46" r="24" fill="#fde7c2" fillOpacity="0.85" />}
        {work.mark === 'phone' && <rect x="34" y="16" width="32" height="68" rx="7" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.5" />}
        {work.mark === 'lines' &&
          Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${-10 + i * 16} 100 L ${30 + i * 10} 0`} stroke="white" strokeOpacity="0.25" strokeWidth="0.8" />)}
        {work.mark === 'arc' && <path d="M20 80 A30 30 0 0 1 80 80" fill="none" stroke="#1c1917" strokeOpacity="0.55" strokeWidth="6" />}
        {work.mark === 'grid' &&
          Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={22 + (i % 3) * 20} y={22 + Math.floor(i / 3) * 20} width="14" height="14" rx="3" fill="white" fillOpacity={0.15 + (i % 4) * 0.12} />
          ))}
      </svg>
    </div>
  )
}

/** 自动播放：8 秒一圈，虚拟指针沿着列表扫下去再回来一点，最后离开列表让预览收起。 */
const CYCLE = 8
const ENTER_AT = 0.3
const LEAVE_AT = 7.2
function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function Demo(props: Partial<CursorProps>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const real = useRef(false)
  const inside = useRef(false)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
      const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-row]'))
      const index = rows.findIndex((row) => {
        const rect = row.getBoundingClientRect()
        return event.clientY >= rect.top && event.clientY < rect.bottom
      })
      if (index >= 0) setActive(index)
    }
    const onLeave = () => {
      real.current = false
    }
    document.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrameLoop(
    listRef,
    ({ time }) => {
      const list = listRef.current
      if (!list || real.current) return
      const local = time % CYCLE
      if (local >= LEAVE_AT || local < ENTER_AT) {
        if (inside.current) list.dispatchEvent(new PointerEvent('pointerleave'))
        inside.current = false
        return
      }
      if (!inside.current) list.dispatchEvent(new PointerEvent('pointerenter'))
      inside.current = true
      const rect = list.getBoundingClientRect()
      const p = (local - ENTER_AT) / (LEAVE_AT - ENTER_AT)
      const v = p < 0.6 ? ease(p / 0.6) : 1 - ease((p - 0.6) / 0.4) * 0.55
      const x = rect.left + rect.width * (0.4 + 0.25 * Math.sin(p * Math.PI * 2))
      const y = rect.top + rect.height * (0.1 + 0.8 * v)
      list.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
    },
    { reducedMotion: 'static', staticTime: 1.6 },
  )

  return (
    <div className="grid h-full w-full place-items-center overflow-hidden bg-background p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-foreground">Selected work</h3>
          <span className="text-xs text-muted-foreground">2023 – 2025</span>
        </div>
        <div ref={listRef}>
          <ul className="border-t">
            {WORK.map((work, index) => (
              <li key={work.title} data-row className="border-b">
                <a
                  href="#work"
                  onClick={(event) => event.preventDefault()}
                  onFocus={() => setActive(index)}
                  className="flex items-baseline justify-between gap-4 py-4 text-foreground transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  style={{ opacity: active === index ? 1 : 0.55 }}
                >
                  <span className="truncate text-lg font-medium tracking-tight sm:text-2xl">{work.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {work.kind} · {work.year}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Cursor {...props} className="rounded-lg shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)]">
            <Art index={active} />
          </Cursor>
        </div>
      </div>
    </div>
  )
}
