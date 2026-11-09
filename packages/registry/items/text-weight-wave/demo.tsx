import { usePrefersReducedMotion, useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type RefObject } from 'react'
import { defaults, WeightWaveText, type WeightWaveTextProps } from './text-weight-wave'

const BODY = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"

const NAV = ['Work', 'Typefaces', 'Info', 'Contact']

const FACTS = [
  { label: 'Now', value: 'Signage type for Halden Rail' },
  { label: 'Before', value: 'Senior designer, Northfold' },
  { label: 'Typefaces', value: 'Brine, Tessel, Marlow Mono' },
  { label: 'Based in', value: 'Rotterdam, NL' },
]

/** 虚拟指针在标题上来回扫一趟用 8 秒，和循环视频一样长。 */
const CYCLE = 8

/**
 * 演示用的「自动播放」：没有真实指针时，沿标题来回派发合成的 pointermove，并画一个假光标；
 * 真实指针一动就让位，指针离开页面后恢复。组件本体没有这段逻辑。
 */
function useGhostPointer(hostRef: RefObject<HTMLElement | null>, targetRef: RefObject<HTMLElement | null>, cursorRef: RefObject<HTMLElement | null>) {
  const real = useRef(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!event.isTrusted) return
      real.current = true
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
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
  }, [cursorRef])

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const host = hostRef.current
      const target = targetRef.current
      const cursor = cursorRef.current
      if (!host || !target || real.current || reduced) return
      const origin = host.getBoundingClientRect()
      const box = target.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      // 从左到右再回来，两端放慢；纵向轻轻起伏，落在基线附近，光标不挡住浪尖。
      const sweep = 0.5 - 0.5 * Math.cos(phase)
      const x = box.left + box.width * (0.04 + 0.92 * sweep)
      const y = box.top + box.height * (0.98 + 0.04 * Math.sin(phase * 2 + 0.6))
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, pointerType: 'mouse' }))
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = `translate3d(${x - origin.left}px, ${y - origin.top}px, 0)`
      }
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )
}

/**
 * 每种字体在 -0.035em 字距下：静止时一个字符约占多少 em，一个字母从静止涨到最粗又多占多少 em（按 "Oona Marsh" 实测，略取大）。
 */
const METRICS: Record<string, { advance: number; swell: number }> = {
  geist: { advance: 0.52, swell: 0.08 },
  fraunces: { advance: 0.53, swell: 0.085 },
  outfit: { advance: 0.52, swell: 0.035 },
  mono: { advance: 0.565, swell: 0 },
}

/**
 * 名字排成一行，字号取 size 与「浪最宽时也放得下」两者中较小的那个。浪会把这一行撑宽：
 * 浪里的墨量合起来约等于 spread 个 em 宽的字母，每个满墨字母多出 swell 再加左右让位。
 */
function fittedSize(text: string, font: string, size: number, spread: number, letterPadding: number): string {
  const metrics = METRICS[font] ?? METRICS.geist!
  const chars = Array.from(text).length
  const letters = Array.from(text.replace(/\s+/g, '')).length
  const inked = Math.min(letters, spread / metrics.advance)
  const em = chars * metrics.advance + inked * (metrics.swell + (2 * letterPadding) / 100) + 0.15
  return `min(${size}px, ${(100 / Math.max(em, 1)).toFixed(2)}cqw)`
}

function initials(text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase()
}

export function Demo(props: WeightWaveTextProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, targetRef, cursorRef)
  const { text, font, size, spread, letterPadding } = { ...defaults, ...props }

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-background text-foreground" style={{ fontFamily: BODY }}>
      <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col px-[clamp(20px,6vw,72px)] py-[clamp(20px,5.5vh,44px)]">
        <header className="flex items-center justify-between gap-6 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full border text-[11px] font-semibold tracking-[0.06em]" aria-hidden>
              {initials(text) || 'OM'}
            </span>
            <span className="hidden text-muted-foreground sm:inline">Type &amp; identity</span>
          </div>
          <nav aria-label="Primary" className="flex gap-5 sm:gap-7">
            {NAV.map((item, i) => (
              <a key={item} href={`#${item.toLowerCase()}`} className={i === 0 ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}>
                {item}
              </a>
            ))}
          </nav>
        </header>

        <main className="@container flex min-h-0 flex-1 flex-col justify-end-safe pt-8 pb-10">
          <p className="mb-6 flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[#7ee2b8] shadow-[0_0_0_4px_rgb(126_226_184/0.14)]" aria-hidden />
            Booking new projects from March 2027
          </p>
          <div ref={targetRef} className="w-fit max-w-full">
            <WeightWaveText
              {...props}
              as="h1"
              className="leading-[0.92] tracking-[-0.035em] whitespace-nowrap text-[#f4f1ea]"
              style={{ fontSize: fittedSize(text, font, size, spread, letterPadding) }}
            />
          </div>
          <p className="mt-8 max-w-[460px] text-[15px] leading-relaxed text-muted-foreground [@media(max-height:540px)]:hidden">
            Type designer and art director. I draw typefaces for transit systems, publishers and the occasional record sleeve.
          </p>
        </main>

        <footer className="grid grid-cols-2 gap-x-8 gap-y-4 border-t pt-5 text-[13px] md:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <div className="text-muted-foreground">{fact.label}</div>
              <div className="mt-1 text-foreground">{fact.value}</div>
            </div>
          ))}
        </footer>
      </div>

      {/* 虚拟光标：只为让海报和循环视频里看得出「有指针在扫过」。 */}
      <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-6 -translate-x-[4px] -translate-y-[3px] drop-shadow-[0_2px_6px_rgb(0_0_0/0.5)]" fill="#fff" stroke="#0b0b10" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7.5-6 1.8-2.6 6z" />
        </svg>
      </div>
    </div>
  )
}
