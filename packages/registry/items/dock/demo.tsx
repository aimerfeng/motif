import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type ReactNode } from 'react'
import { Dock, DockIcon, type DockProps } from './dock'

const APPS: { name: string; tone: string; glyph: ReactNode }[] = [
  { name: 'Home', tone: 'from-sky-400 to-blue-600', glyph: <><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V19h12v-8.5" /><path d="M10 19v-5h4v5" /></> },
  { name: 'Mail', tone: 'from-emerald-400 to-teal-600', glyph: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /></> },
  { name: 'Calendar', tone: 'from-rose-400 to-red-600', glyph: <><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" /></> },
  { name: 'Music', tone: 'from-pink-400 to-fuchsia-600', glyph: <><path d="M9 17.5V6.5l9-2v11" /><circle cx="7" cy="17.5" r="2" /><circle cx="16" cy="15.5" r="2" /></> },
  { name: 'Photos', tone: 'from-amber-300 to-orange-500', glyph: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m4.5 17 4.5-4.5 3.5 3.5 2.5-2.5 4.5 4" /></> },
  { name: 'Notes', tone: 'from-yellow-300 to-amber-500', glyph: <><rect x="5.5" y="4.5" width="13" height="15" rx="1.8" /><path d="M9 9h6M9 12.5h6M9 16h3.5" /></> },
  { name: 'Messages', tone: 'from-indigo-400 to-violet-600', glyph: <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4 3.5V16h-.5A1.5 1.5 0 0 1 5 14.5z" /> },
  { name: 'Settings', tone: 'from-zinc-500 to-zinc-700', glyph: <><path d="M5 8h9M18 8h1M5 16h1M10 16h9" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></> },
]

export function Demo(props: DockProps) {
  const host = useRef<HTMLDivElement>(null)
  const dockBox = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)

  const send = (clientX: number, clientY: number) => {
    const dock = dockBox.current?.querySelector('[role="toolbar"]')
    dock?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }))
  }

  // 真实指针一动，自动播放就停下；脚本派发的事件 isTrusted 为 false，不会误触发。
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      send(-1e6, 0)
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // 幽灵指针在图标上来回扫过。
  useFrameLoop(
    host,
    ({ time }) => {
      const dock = dockBox.current?.querySelector('[role="toolbar"]')
      if (!autoplay.current || !dock) return
      const bounds = dock.getBoundingClientRect()
      const x = bounds.left + bounds.width * (0.5 + 0.42 * Math.sin((time * Math.PI) / 3))
      send(x, bounds.top + bounds.height / 2)
    },
    { reducedMotion: 'static', staticTime: 1.4 },
  )

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,oklch(0.42_0.13_285/0.35),transparent),radial-gradient(50%_45%_at_80%_70%,oklch(0.42_0.12_200/0.28),transparent)]" />
      <div className="absolute top-[9%] left-1/2 h-[50%] w-[62%] -translate-x-1/2 rounded-xl border bg-card/60 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 border-b px-3 py-2.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          <span className="ml-3 text-[10px] text-muted-foreground">Today</span>
        </div>
        <div className="space-y-3 p-4">
          {[
            ['bg-sky-400/70', 'w-2/5'],
            ['bg-rose-400/70', 'w-3/5'],
            ['bg-emerald-400/70', 'w-1/2'],
            ['bg-amber-400/70', 'w-2/3'],
          ].map(([dot, width], index) => (
            <div key={index} className="flex items-center gap-3">
              <span className={`size-2 shrink-0 rounded-full ${dot}`} />
              <div className={`h-2 rounded-full bg-muted-foreground/20 ${width}`} />
            </div>
          ))}
        </div>
      </div>
      <div ref={dockBox} className="absolute inset-x-0 bottom-8 flex justify-center">
        <Dock {...props}>
          {APPS.map((app) => (
            <DockIcon key={app.name}>
              <div role="img" aria-label={app.name} className={`grid size-full place-items-center rounded-[24%] bg-linear-to-b shadow-lg shadow-black/30 ${app.tone}`}>
                <svg viewBox="0 0 24 24" className="size-[52%] text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {app.glyph}
                </svg>
              </div>
            </DockIcon>
          ))}
        </Dock>
      </div>
    </div>
  )
}
