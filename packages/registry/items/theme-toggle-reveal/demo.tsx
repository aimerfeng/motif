import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { getThemeTransitionClipPaths, ThemeToggleReveal, type ThemeToggleRevealProps, type TransitionVariant } from './theme-toggle-reveal'

const CYCLE = 4
const CLICK_AT = 0.7

/** 把收拢形状和展开形状里对应的数字按进度插值（两者的数字个数一致）。 */
function lerpClip(from: string, to: string, p: number) {
  const a = from.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  let i = 0
  return to.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => {
    const s = Number(a[i++] ?? m)
    return String(s + (Number(m) - s) * p)
  })
}

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p))

/** 一个小页面：同一份内容画成浅色和深色两层。 */
function Page({ dark }: { dark: boolean }) {
  return (
    <div className={cn('absolute inset-0 flex flex-col', dark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900')}>
      <header className={cn('flex h-16 shrink-0 items-center gap-6 border-b px-5', dark ? 'border-zinc-800' : 'border-zinc-200')}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <svg aria-hidden viewBox="0 0 20 20" width="20" height="20">
            <circle cx="10" cy="10" r="8" fill={dark ? '#a78bfa' : '#7c3aed'} />
            <path d="M6 12.5 10 6l4 6.5" fill="none" stroke={dark ? '#18181b' : '#fff'} strokeWidth="2" strokeLinejoin="round" />
          </svg>
          Ridgeline
        </div>
        <nav className={cn('hidden gap-5 text-sm sm:flex', dark ? 'text-zinc-400' : 'text-zinc-500')}>
          <span>Docs</span>
          <span>Guides</span>
          <span>Changelog</span>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-7">
        <div className={cn('text-xs font-medium tracking-wide uppercase', dark ? 'text-violet-300' : 'text-violet-600')}>Release 3.2</div>
        <h1 className="text-2xl font-semibold tracking-tight">Offline sync, rebuilt</h1>
        <p className={cn('max-w-md text-sm leading-6', dark ? 'text-zinc-400' : 'text-zinc-600')}>
          Edits made without a connection now merge field by field when you reconnect, so two people changing the same record no longer overwrite each other.
        </p>
        <div className="grid max-w-md grid-cols-2 gap-3 pt-2">
          {[
            ['Conflicts resolved', '98.4%'],
            ['Median merge', '42 ms'],
          ].map(([k, v]) => (
            <div key={k} className={cn('rounded-xl border p-3', dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50')}>
              <div className={cn('text-xs', dark ? 'text-zinc-400' : 'text-zinc-500')}>{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export function Demo(props: ThemeToggleRevealProps) {
  const { variant = 'circle', duration = 400, fromCenter = false } = props
  const host = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLSpanElement>(null)
  const [phase, setPhase] = useState({ k: 0, clicked: false })

  // 自动播放：每 4 秒「点一下」按钮，新主题从按钮处按所选形状展开（只在这个页面框里演示）。
  useFrameLoop(
    host,
    ({ time }) => {
      const k = Math.floor(time / CYCLE)
      const local = time - k * CYCLE
      const clicked = local >= CLICK_AT
      setPhase((prev) => (prev.k === k && prev.clicked === clicked ? prev : { k, clicked }))
      const box = host.current
      const layer = top.current
      if (!box || !layer) return
      const w = box.clientWidth
      const h = box.clientHeight
      let x = w / 2
      let y = h / 2
      if (!fromCenter && btn.current) {
        const b = btn.current.getBoundingClientRect()
        const r = box.getBoundingClientRect()
        x = b.left - r.left + b.width / 2
        y = b.top - r.top + b.height / 2
      }
      const maxRadius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
      const [from, to] = getThemeTransitionClipPaths(variant as TransitionVariant, x, y, maxRadius, w, h)
      const raw = Math.min(1, Math.max(0, (local - CLICK_AT) / (duration / 1000)))
      const p = variant === 'star' ? raw : easeInOut(raw)
      layer.style.clipPath = p >= 1 ? 'none' : lerpClip(from, to, p)
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  // 偶数轮：深色 → 浅色；奇数轮：浅色 → 深色。
  const targetDark = phase.k % 2 === 1
  const shownDark = phase.clicked ? targetDark : !targetDark

  return (
    <div className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div ref={host} className="relative h-full max-h-[440px] w-full max-w-[640px] overflow-hidden rounded-2xl border shadow-2xl shadow-black/40">
        <Page dark={!targetDark} />
        <div ref={top} className="absolute inset-0" style={{ clipPath: 'circle(0% at 50% 50%)' }}>
          <Page dark={targetDark} />
        </div>
        <span ref={btn} className="absolute top-3 right-4">
          <ThemeToggleReveal
            {...props}
            theme={shownDark ? 'dark' : 'light'}
            className={cn(
              'grid size-10 place-items-center rounded-full border transition-colors duration-200',
              shownDark ? 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100',
            )}
          />
        </span>
      </div>
    </div>
  )
}
