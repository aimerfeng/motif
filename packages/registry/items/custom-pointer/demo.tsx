import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { CustomPointer, type CustomPointerProps } from './custom-pointer'

/**
 * 虚拟指针的路线：8 秒一圈，和循环视频等长。每 2 秒换一张作品（先 0.6 秒移过去，再停一会儿），
 * 最后半秒离开网格，让指针收起，下一圈开始时再弹出来。
 */
const CYCLE = 8
const SEGMENT = 2
const TRAVEL = 0.6
const LEAVE_AT = 7.5
const ORDER = [0, 1, 2, 1]

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** 演示用的「自动播放」：没有真实指针时向网格派发合成的指针事件；真实指针一动就让位，离开页面后恢复。 */
function useGhostPointer(gridRef: React.RefObject<HTMLElement | null>) {
  const real = useRef(false)
  const away = useRef(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
    }
    const onLeave = () => {
      real.current = false
    }
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrameLoop(
    gridRef,
    ({ time }) => {
      const grid = gridRef.current
      if (!grid || real.current) return
      const tiles = Array.from(grid.querySelectorAll<HTMLElement>('[data-ghost-target]'))
      if (tiles.length < 3) return
      const local = time % CYCLE
      if (local >= LEAVE_AT) {
        if (!away.current) grid.dispatchEvent(new PointerEvent('pointerleave'))
        away.current = true
        return
      }
      away.current = false
      const center = (index: number) => {
        const rect = tiles[ORDER[(index + ORDER.length) % ORDER.length]!]!.getBoundingClientRect()
        return { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.46 }
      }
      const segment = Math.floor(local / SEGMENT)
      const from = center(segment - 1)
      const to = center(segment)
      const t = easeInOutCubic(Math.min(1, (local - segment * SEGMENT) / TRAVEL))
      const lift = Math.sin(Math.PI * t) * 28
      grid.dispatchEvent(new PointerEvent('pointermove', { clientX: from.x + (to.x - from.x) * t, clientY: from.y + (to.y - from.y) * t - lift, bubbles: true }))
    },
    { reducedMotion: 'static', staticTime: 2.9 },
  )
}

const WORK = [
  {
    title: 'Halden Coffee',
    detail: 'Brand identity · 2025',
    art: (
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f6c27a,#e0745a_55%,#7c2d3b)]">
        <div className="absolute top-[18%] left-1/2 aspect-square w-[52%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fde7c2,#f0a35e_60%,#c2573f)] shadow-[0_20px_40px_-12px_rgb(80_20_20/0.6)]" />
        <div className="absolute inset-x-[22%] bottom-[16%] h-[6%] rounded-full bg-[#5b1d2a]/60 blur-md" />
      </div>
    ),
  },
  {
    title: 'Tidewater',
    detail: 'Product design · 2024',
    art: (
      <div className="absolute inset-0 bg-[linear-gradient(200deg,#7dd3c0,#2a8ca8_55%,#123a5c)]">
        <div className="absolute top-[14%] left-1/2 h-[78%] w-[42%] -translate-x-1/2 rounded-[18%/12%] border border-white/40 bg-white/15 shadow-[0_24px_40px_-14px_rgb(5_30_50/0.7)]">
          <div className="mx-auto mt-[14%] h-[3%] w-[38%] rounded-full bg-white/60" />
          <div className="mx-[14%] mt-[16%] h-[26%] rounded-lg bg-white/25" />
          <div className="mx-[14%] mt-[8%] h-[4%] w-[58%] rounded-full bg-white/45" />
          <div className="mx-[14%] mt-[5%] h-[4%] w-[40%] rounded-full bg-white/30" />
        </div>
      </div>
    ),
  },
  {
    title: 'North Atelier',
    detail: 'Website · 2024',
    art: (
      <div className="absolute inset-0 bg-[linear-gradient(170deg,#b9b2f5,#6d5bd0_50%,#2b2160)]">
        <svg viewBox="0 0 100 125" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${-10 + i * 14} 125 L ${30 + i * 9} 0`} stroke="white" strokeOpacity={0.14 + (i % 3) * 0.06} strokeWidth="0.6" fill="none" />
          ))}
        </svg>
        <div className="absolute bottom-[14%] left-[14%] text-[clamp(18px,3.4vw,30px)] leading-none font-semibold tracking-tight text-white/90">NA</div>
      </div>
    ),
  },
]

export function Demo(props: CustomPointerProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  useGhostPointer(gridRef)

  return (
    <div className="grid h-full w-full place-items-center overflow-hidden bg-background p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-foreground">Selected work</h3>
          <span className="text-xs text-muted-foreground">12 projects</span>
        </div>
        <div ref={gridRef} className="relative grid grid-cols-3 gap-4">
          {WORK.map((work) => (
            <a key={work.title} href="#work" className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={(event) => event.preventDefault()}>
              <div data-ghost-target className="relative aspect-[4/5] overflow-hidden rounded-xl border">
                {work.art}
              </div>
              <p className="mt-2.5 text-sm font-medium text-foreground">{work.title}</p>
              <p className="text-xs text-muted-foreground">{work.detail}</p>
            </a>
          ))}
          <CustomPointer {...props} />
        </div>
      </div>
    </div>
  )
}
