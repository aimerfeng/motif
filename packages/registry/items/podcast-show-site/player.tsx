import { cn } from '@motif/runtime'
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react'
import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react'
import { CoverArt, Icon, MetaLine, SkipIcon, type CoverStyle } from './art'
import { chapterEnd, chapterIndexAt, episodeBy, LATEST, levelAt, levelsFor, type Episode } from './data'
import { DISPLAY, formatDate, formatTime } from './theme'

/* ---------- 播放状态 ---------- */

export interface PlayerState {
  episode: number
  /** 秒。 */
  time: number
  playing: boolean
  rate: number
  /** 这次访问里是否按过播放（迷你播放条只在这之后出现）。 */
  started: boolean
}

export interface PlayerStore {
  get(): PlayerState
  subscribe(listener: () => void): () => void
  play(): void
  pause(): void
  toggle(): void
  seek(time: number): void
  skip(seconds: number): void
  load(episode: number, options?: { at?: number; play?: boolean }): void
  setRate(rate: number): void
  /** 推进模拟时钟。接真实音频时改成在 timeupdate 里调用 seek。 */
  advance(seconds: number): void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * 一个很小的外部 store：播放进度每帧都在变，组件按需订阅（整秒、当前章节、当前词），
 * 波形和进度条直接改 DOM，不让整页每帧重渲染。
 */
export function createPlayerStore(initial: { episode: number; time: number }): PlayerStore {
  let state: PlayerState = { episode: initial.episode, time: initial.time, playing: false, rate: 1, started: false }
  const listeners = new Set<() => void>()
  // 切换单集时记住每一集听到哪里
  const positions = new Map<number, number>([[initial.episode, initial.time]])
  const duration = () => episodeBy(state.episode).duration
  const commit = (patch: Partial<PlayerState>) => {
    state = { ...state, ...patch }
    for (const listener of listeners) listener()
  }
  const play = () => commit({ playing: true, started: true, time: state.time >= duration() - 0.5 ? 0 : state.time })
  const pause = () => commit({ playing: false })
  return {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    play,
    pause,
    toggle: () => (state.playing ? pause() : play()),
    seek: (time) => commit({ time: clamp(time, 0, duration()) }),
    skip: (seconds) => commit({ time: clamp(state.time + seconds, 0, duration()) }),
    load(episode, options = {}) {
      positions.set(state.episode, state.time)
      const target = episodeBy(episode)
      const time = clamp(options.at ?? positions.get(target.number) ?? 0, 0, target.duration)
      const playing = options.play ?? state.playing
      commit({ episode: target.number, time, playing, started: state.started || playing })
    },
    setRate: (rate) => commit({ rate }),
    advance(seconds) {
      if (!state.playing || seconds <= 0) return
      const next = state.time + seconds * state.rate
      if (next >= duration()) commit({ time: duration(), playing: false })
      else commit({ time: next })
    },
  }
}

const PlayerContext = createContext<PlayerStore | null>(null)
export const PlayerProvider = PlayerContext.Provider

export function usePlayerStore(): PlayerStore {
  const store = useContext(PlayerContext)
  if (!store) throw new Error('usePlayerStore must be used inside <PlayerProvider>')
  return store
}

/** 订阅一个派生值；selector 要返回原始值（整秒、索引、布尔），这样只有它变了才重渲染。 */
export function usePlayer<T>(select: (state: PlayerState) => T): T {
  const store = usePlayerStore()
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(store.get()),
  )
}

/** 每次状态变化都调用 paint（直接改 DOM），不触发重渲染。 */
export function usePlayerPaint(paint: (state: PlayerState) => void): void {
  const store = usePlayerStore()
  const ref = useRef(paint)
  useLayoutEffect(() => {
    ref.current = paint
    paint(store.get())
  })
  useLayoutEffect(() => store.subscribe(() => ref.current(store.get())), [store])
}

/**
 * 模拟播放的时钟。它是功能而不是装饰：开启「减少动态效果」时页面不会自动播放，但用户按下播放后进度照常走，
 * 所以这里不用 useFrameLoop（它在减少动态效果时会停住），只在播放期间跑 requestAnimationFrame。
 */
export function PlaybackClock() {
  const store = usePlayerStore()
  const playing = usePlayer((s) => s.playing)
  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, 0.25)
      last = now
      store.advance(delta)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, store])
  return null
}

/* ---------- 小部件 ---------- */

const MONO = 'font-[family-name:var(--pc-mono)]'
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-(--pc-accent-ui) focus-visible:ring-offset-2 focus-visible:ring-offset-(--pc-surface)'

export function Clock({ kind, className }: { kind: 'elapsed' | 'remaining'; className?: string }) {
  const value = usePlayer((s) => (kind === 'remaining' ? Math.ceil(episodeBy(s.episode).duration - s.time) : Math.floor(s.time)))
  return <span className={cn('tabular-nums', className)}>{kind === 'remaining' ? `−${formatTime(value)}` : formatTime(value)}</span>
}

/** 播放中但开着「减少动态效果」时的静态电平：一眼看出在播，但不跳。 */
const STILL_LEVELS = [0.55, 0.95, 0.7, 0.4]

/** 电平表：高度取自当前位置的波形包络，所以暂停时停住，拖动时跟着变。纯装饰，减少动态效果时不跳动。 */
export function Equalizer({ className }: { className?: string }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const reduced = useReducedMotion()
  usePlayerPaint((s) => {
    const episode = episodeBy(s.episode)
    const level = levelAt(levelsFor(episode), s.time / episode.duration)
    bars.current.forEach((bar, i) => {
      if (!bar) return
      const wobble = 0.5 + 0.5 * Math.sin(s.time * (7.1 + i * 2.3) + i * 1.9)
      const value = !s.playing ? 0.2 + 0.12 * ((i * 7) % 3) : reduced ? STILL_LEVELS[i]! : 0.2 + 0.8 * level * (0.35 + 0.65 * wobble)
      bar.style.transform = `scaleY(${value.toFixed(3)})`
    })
  })
  return (
    <span className={cn('inline-flex h-3.5 items-end gap-[2px]', className)} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el
          }}
          className="h-full w-[3px] origin-bottom rounded-full bg-current"
        />
      ))}
    </span>
  )
}

export function PlayButton({ episode, size = 'lg', className }: { episode?: number; size?: 'lg' | 'md'; className?: string }) {
  const store = usePlayerStore()
  const current = usePlayer((s) => s.episode)
  const target = episode ?? current
  const active = usePlayer((s) => s.playing && s.episode === target)
  const info = episodeBy(target)
  return (
    <button
      type="button"
      onClick={() => (store.get().episode === target ? store.toggle() : store.load(target, { play: true }))}
      aria-label={active ? `Pause episode ${target}` : `Play episode ${target}: ${info.title}`}
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-(--pc-accent) text-(--pc-on-accent) shadow-[0_8px_24px_-10px_var(--pc-accent)] transition-transform duration-150 hover:scale-[1.04] active:scale-95',
        FOCUS,
        size === 'lg' ? 'size-14' : 'size-11',
        className,
      )}
    >
      <Icon name={active ? 'pause' : 'play'} className={size === 'lg' ? 'size-6' : 'size-5'} />
    </button>
  )
}

function SkipButton({ seconds, forward, className }: { seconds: number; forward?: boolean; className?: string }) {
  const store = usePlayerStore()
  return (
    <button
      type="button"
      onClick={() => store.skip(forward ? seconds : -seconds)}
      aria-label={forward ? `Skip forward ${seconds} seconds` : `Skip back ${seconds} seconds`}
      className={cn('grid size-11 place-items-center rounded-full text-(--pc-muted) transition-colors hover:bg-(--pc-raised) hover:text-(--pc-fg)', FOCUS, className)}
    >
      <SkipIcon seconds={seconds} forward={forward} />
    </button>
  )
}

const RATES = [1, 1.25, 1.5, 2, 0.75]

function RateButton({ className }: { className?: string }) {
  const store = usePlayerStore()
  const rate = usePlayer((s) => s.rate)
  const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]!
  return (
    <button
      type="button"
      onClick={() => store.setRate(next)}
      aria-label={`Playback speed ${rate}×. Switch to ${next}×`}
      className={cn('h-9 min-w-14 rounded-full border border-(--pc-line-strong) px-3 text-[13px] tabular-nums text-(--pc-fg) transition-colors hover:bg-(--pc-raised)', MONO, FOCUS, className)}
    >
      {rate}×
    </button>
  )
}

function ChapterName({ episode, className }: { episode: Episode; className?: string }) {
  const index = usePlayer((s) => (s.episode === episode.number ? chapterIndexAt(episode, s.time) : 0))
  return (
    <span className={cn('min-w-0 truncate', className)}>
      Ch {index + 1} · {episode.chapters[index]!.title}
    </span>
  )
}

/* ---------- 波形拖动条 ---------- */

/** 每个柱子的高度取它覆盖的那段包络的平均值和峰值的中间值，看起来像真实的语音波形。 */
function pooled(levels: Float32Array, from: number, to: number): number {
  const a = Math.floor(from * levels.length)
  const b = Math.max(a + 1, Math.ceil(to * levels.length))
  let sum = 0
  let peak = 0
  for (let i = a; i < b; i++) {
    const v = levels[Math.min(levels.length - 1, i)]!
    sum += v
    peak = Math.max(peak, v)
  }
  return (sum / (b - a) + peak) / 2
}

function HoverLabel({ hover, episode }: { hover: MotionValue<number>; episode: Episode }) {
  const [second, setSecond] = useState(() => Math.round(hover.get() * episode.duration))
  useMotionValueEvent(hover, 'change', (value) => setSecond(Math.round(value * episode.duration)))
  const chapter = episode.chapters[chapterIndexAt(episode, second)]!
  return (
    <>
      <span className={cn('tabular-nums text-(--pc-fg)', MONO)}>{formatTime(second)}</span>
      <span className="min-w-0 truncate text-(--pc-muted)">{chapter.title}</span>
    </>
  )
}

export interface WaveformProps {
  episode: Episode
  /** 每 100px 多少根柱子。 */
  density: number
  /** 演示用的虚拟指针位置（0–1），null 时不显示。真实指针优先。 */
  ghost?: number | null
  className?: string
}

/**
 * 可拖动的波形：按下或拖动跳转，悬停显示时间和章节，键盘 ←/→ 5 秒、PageUp/PageDown 30 秒、Home/End。
 * 章节边界处空出一根柱子，下面一行是可点击的章节标签。
 */
export function Waveform({ episode, density, ghost = null, className }: WaveformProps) {
  const store = usePlayerStore()
  const reduced = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const sliderRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef<SVGRectElement>(null)
  const bufferedRef = useRef<SVGRectElement>(null)
  const rangeRef = useRef<SVGRectElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  /** 手指按下的位置：还没判断出是点、拖还是滚动。 */
  const touch = useRef<{ id: number; x: number; y: number } | null>(null)
  const lastSecond = useRef(-1)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [pointerOver, setPointerOver] = useState(false)
  const hover = useMotionValue(ghost ?? 0)
  const visible = pointerOver || ghost !== null
  const visibleRef = useRef(visible)
  // 悬停线和提示框的像素位置；宽度变了也要重算，所以不用 useTransform（它会捕获旧的宽度）
  const hoverPx = useMotionValue(0)
  const tipPx = useMotionValue(0)

  useLayoutEffect(() => {
    const element = sliderRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const bars = useMemo(() => {
    const { w, h } = size
    if (w < 24 || h < 8) return []
    const levels = levelsFor(episode)
    const count = Math.max(16, Math.floor((w * density) / 100))
    const step = w / count
    // 柱子的左边和宽度对齐到整设备像素：两三像素宽的柱子落在小数位置上，抗锯齿会让一部分柱子看起来更亮
    const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
    const snap = (value: number) => Math.round(value * dpr) / dpr
    const barWidth = Math.max(1 / dpr, snap(Math.max(1.2, step * 0.58)))
    // 太细的柱子画圆头只剩一层糊边，直接用方头
    const radius = barWidth >= 2.5 ? barWidth / 2 : 0
    const boundaries = episode.chapters.slice(1).map((chapter) => chapter.at / episode.duration)
    const list: { x: number; y: number; h: number }[] = []
    for (let i = 0; i < count; i++) {
      const from = i / count
      const to = (i + 1) / count
      if (boundaries.some((b) => b > from - 0.4 / count && b < to + 0.4 / count)) continue
      // 相邻柱子之间加一点确定性的抖动（按时间位置取，宽度变了也基本不变），像真实语音那样参差
      const grain = Math.sin(Math.floor(from * 2400) * 12.9898 + episode.number) * 43758.5453
      const jitter = 0.7 + 0.3 * (grain - Math.floor(grain))
      const v = pooled(levels, from, to) * jitter
      const height = clamp(h * (0.06 + 0.94 * v ** 1.35), barWidth, h)
      list.push({ x: snap(i * step + (step - barWidth) / 2), y: (h - height) / 2, h: height })
    }
    return list.map((bar) => <rect key={bar.x} x={bar.x.toFixed(3)} y={bar.y.toFixed(2)} width={barWidth.toFixed(3)} height={bar.h.toFixed(2)} rx={radius ? radius.toFixed(2) : undefined} />)
  }, [size, density, episode])

  // 已播放、已缓冲和悬停预览三层都是同一组柱子，用裁剪矩形决定露出多少
  const paintRange = () => {
    const s = store.get()
    const played = s.episode === episode.number ? s.time / episode.duration : 0
    const a = played * size.w
    const b = hover.get() * size.w
    hoverPx.set(b)
    tipPx.set(clamp(b, 104, Math.max(104, size.w - 104)))
    const range = rangeRef.current
    if (!range) return
    range.setAttribute('x', String(Math.min(a, b)))
    range.setAttribute('width', visibleRef.current ? String(Math.abs(b - a)) : '0')
  }

  usePlayerPaint((s) => {
    const loaded = s.episode === episode.number
    const time = loaded ? s.time : 0
    const x = (time / episode.duration) * size.w
    playedRef.current?.setAttribute('width', String(x))
    bufferedRef.current?.setAttribute('width', String(Math.min(size.w, x + size.w * 0.11)))
    if (headRef.current) {
      headRef.current.style.transform = `translateX(${x.toFixed(2)}px)`
      headRef.current.style.opacity = loaded ? '1' : '0'
    }
    paintRange()
    // 读屏信息每秒更新一次就够了
    const second = Math.floor(time)
    if (second !== lastSecond.current && sliderRef.current) {
      lastSecond.current = second
      const chapter = episode.chapters[chapterIndexAt(episode, time)]!
      sliderRef.current.setAttribute('aria-valuenow', String(second))
      sliderRef.current.setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(episode.duration)}, ${chapter.title}`)
    }
  })
  useMotionValueEvent(hover, 'change', paintRange)

  useEffect(() => {
    visibleRef.current = visible
    paintRange()
  })

  // 演示的虚拟指针：第一次出现直接定位，之后滑到下一个位置
  const ghostShown = useRef(false)
  useEffect(() => {
    if (pointerOver) return
    if (ghost === null) {
      ghostShown.current = false
      return
    }
    if (!ghostShown.current || reduced) {
      hover.set(ghost)
      ghostShown.current = true
      return
    }
    const controls = animate(hover, ghost, { duration: 1.1, ease: [0.45, 0, 0.2, 1] })
    return () => controls.stop()
  }, [ghost, pointerOver, reduced, hover])

  const fractionAt = (clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return clamp((clientX - rect.left) / rect.width, 0, 1)
  }
  const seekTo = (fraction: number) => {
    const time = clamp(fraction, 0, 1) * episode.duration
    if (store.get().episode === episode.number) store.seek(time)
    else store.load(episode.number, { at: time })
  }

  // 鼠标和笔按下就跳转；手指要先分清是在滚页面还是在拖波形：点一下（几乎没动）才跳转，
  // 横向拖过几像素才开始拖动，竖着划交给浏览器滚动（touch-pan-y），它会发 pointercancel，这时什么都不改。
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragging.current = true
    setPointerOver(true)
  }
  const endGesture = (event: PointerEvent<HTMLDivElement>) => {
    touch.current = null
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (event.pointerType === 'touch') setPointerOver(false)
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const f = fractionAt(event.clientX)
    if (event.pointerType === 'touch') {
      touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      return
    }
    hover.set(f)
    startDrag(event)
    seekTo(f)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const f = fractionAt(event.clientX)
    const start = touch.current
    if (event.pointerType === 'touch') {
      if (!start || start.id !== event.pointerId) return
      if (!dragging.current) {
        const dx = Math.abs(event.clientX - start.x)
        if (dx < 6 || dx < Math.abs(event.clientY - start.y)) return
        startDrag(event)
      }
    } else if (!pointerOver) setPointerOver(true)
    hover.set(f)
    if (dragging.current) seekTo(f)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = touch.current
    if (event.pointerType === 'touch' && start && !dragging.current && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 10) seekTo(fractionAt(event.clientX))
    endGesture(event)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const s = store.get()
    const time = s.episode === episode.number ? s.time : 0
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -30, PageUp: 30 }
    let next: number | null = null
    if (event.key in steps) next = time + steps[event.key]!
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = episode.duration
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (s.episode === episode.number) store.toggle()
      else store.load(episode.number, { play: true })
      return
    }
    if (next === null) return
    event.preventDefault()
    seekTo(next / episode.duration)
  }

  const current = usePlayer((s) => (s.episode === episode.number ? chapterIndexAt(episode, s.time) : -1))

  return (
    <div className={cn('relative', className)}>
      <div
        ref={sliderRef}
        role="slider"
        tabIndex={0}
        aria-label={`Seek in episode ${episode.number}`}
        aria-valuemin={0}
        aria-valuemax={Math.round(episode.duration)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={endGesture}
        onPointerLeave={() => {
          if (!dragging.current) setPointerOver(false)
        }}
        onKeyDown={onKeyDown}
        className={cn('relative h-16 cursor-pointer touch-pan-y select-none rounded-md @2xl:h-24', FOCUS, 'focus-visible:ring-offset-8')}
      >
        <motion.svg
          key={episode.number}
          width={size.w}
          height={size.h}
          className="absolute inset-0 overflow-visible"
          initial={reduced ? false : { scaleY: 0.25, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <defs>
            <g id={`${uid}-bars`}>{bars}</g>
            <clipPath id={`${uid}-played`}>
              <rect ref={playedRef} x={0} y={-4} width={0} height={size.h + 8} />
            </clipPath>
            <clipPath id={`${uid}-buffered`}>
              <rect ref={bufferedRef} x={0} y={-4} width={0} height={size.h + 8} />
            </clipPath>
            <clipPath id={`${uid}-range`}>
              <rect ref={rangeRef} x={0} y={-4} width={0} height={size.h + 8} />
            </clipPath>
          </defs>
          <use href={`#${uid}-bars`} fill="var(--pc-wave)" />
          <use href={`#${uid}-bars`} fill="var(--pc-buffered)" clipPath={`url(#${uid}-buffered)`} />
          <use href={`#${uid}-bars`} fill="var(--pc-accent-ui)" fillOpacity={0.42} clipPath={`url(#${uid}-range)`} />
          <use href={`#${uid}-bars`} fill="var(--pc-accent-ui)" clipPath={`url(#${uid}-played)`} />
        </motion.svg>
        <div ref={headRef} className="pointer-events-none absolute -inset-y-1.5 left-0 -ml-px w-0.5 rounded-full bg-(--pc-fg)" aria-hidden>
          <span className="absolute -left-[4px] -top-1 size-2.5 rounded-full bg-(--pc-fg)" />
        </div>
        <AnimatePresence>
          {visible && (
            <motion.div key="hover" className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} aria-hidden>
              <motion.div className="absolute -inset-y-1 left-0 w-px bg-(--pc-fg)/55" style={{ x: hoverPx }} />
              <motion.div
                className="absolute bottom-[calc(100%+8px)] left-0 flex max-w-52 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg border border-(--pc-line-strong) bg-(--pc-raised) px-2.5 py-1.5 text-[12px] shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]"
                style={{ x: tipPx }}
              >
                <HoverLabel hover={hover} episode={episode} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative mt-3 h-6">
        {episode.chapters.map((chapter, i) => {
          const start = chapter.at / episode.duration
          const span = (chapterEnd(episode, i) - chapter.at) / episode.duration
          const roomy = span * size.w > 84
          const active = i === current
          return (
            <button
              key={chapter.at}
              type="button"
              onClick={() => seekTo(start)}
              aria-label={`Chapter ${i + 1}, ${chapter.title}, at ${formatTime(chapter.at)}`}
              className={cn(
                'absolute top-0 h-full overflow-hidden border-l pl-2 text-left text-[12px] leading-6 transition-colors',
                active ? 'border-(--pc-accent-ui) text-(--pc-accent-text)' : 'border-(--pc-line-strong) text-(--pc-muted) hover:text-(--pc-fg)',
                FOCUS,
              )}
              style={{ left: `${start * 100}%`, width: `${span * 100}%` }}
            >
              <span className={cn('block truncate', roomy ? 'hidden @3xl:block' : 'hidden')}>{chapter.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- 首屏播放器 ---------- */

export function PlayerCard({ density, ghost }: { density: number; ghost: number | null }) {
  const number = usePlayer((s) => s.episode)
  const episode = episodeBy(number)
  const latest = number === LATEST.number
  const resumed = usePlayer((s) => !s.started && s.time > 0)
  return (
    <div className="relative rounded-[calc(var(--pc-radius)+6px)] border border-(--pc-line) bg-(--pc-surface) p-4 shadow-[0_30px_80px_-48px_rgb(0_0_0/0.55)] @2xl:p-6 @4xl:p-7">
      <div className="flex items-start gap-5">
        {/* 和右侧的快退、快进、倍速在同一个断点切换：窄一些时它们都在卡片底部那一行 */}
        <PlayButton className="hidden @3xl:grid" />
        <div className="min-w-0 flex-1">
          <MetaLine
            className={cn('text-[11px] uppercase tracking-[0.14em] text-(--pc-muted)', MONO)}
            items={[<span key="state" className="text-(--pc-accent-text)">{resumed ? 'Continue listening' : latest ? 'Latest episode' : 'Now playing'}</span>, `Ep ${episode.number}`, formatDate(episode.date)]}
          />
          <h2 className="mt-2 text-[calc(23px*var(--pc-display-scale))] leading-[1.1] @2xl:text-[calc(30px*var(--pc-display-scale))]" style={DISPLAY}>
            {episode.title}
          </h2>
          <p className="mt-1.5 text-[14px] text-(--pc-muted)">
            with <span className="text-(--pc-fg)">{episode.guest}</span>, {episode.affiliation}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1 @3xl:flex">
          <SkipButton seconds={15} />
          <SkipButton seconds={30} forward />
          <RateButton className="ml-1" />
        </div>
      </div>
      <Waveform key={episode.number} className="mt-11 @2xl:mt-10" episode={episode} density={density} ghost={latest ? ghost : null} />
      <div className={cn('mt-2 flex items-center justify-between gap-4 text-[12px] text-(--pc-muted)', MONO)}>
        <span className="flex min-w-0 items-center gap-2">
          <Clock kind="elapsed" className="text-(--pc-fg)" />
          <span aria-hidden>·</span>
          <ChapterName episode={episode} />
        </span>
        <Clock kind="remaining" className="shrink-0" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-(--pc-line) pt-4 @3xl:hidden">
        <RateButton />
        <div className="flex items-center gap-2">
          <SkipButton seconds={15} />
          <PlayButton />
          <SkipButton seconds={30} forward />
        </div>
        <span className="w-14" aria-hidden />
      </div>
    </div>
  )
}

/* ---------- 迷你播放条 ---------- */

export function MiniPlayer({ visible, coverStyle, accent, showName, onReturn }: { visible: boolean; coverStyle: CoverStyle; accent: string; showName: string; onReturn: () => void }) {
  const number = usePlayer((s) => s.episode)
  const episode = episodeBy(number)
  const progressRef = useRef<HTMLSpanElement>(null)
  usePlayerPaint((s) => {
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${(s.time / episodeBy(s.episode).duration).toFixed(4)})`
  })
  return (
    <div className="pointer-events-none sticky bottom-0 z-40 h-0">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="mini"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ type: 'spring', visualDuration: 0.38, bounce: 0.18 }}
            className="pointer-events-auto absolute inset-x-3 bottom-3 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-(--pc-line-strong) bg-(--pc-raised)/95 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md @2xl:bottom-5"
            role="region"
            aria-label="Now playing"
          >
            <span className="absolute inset-x-0 top-0 h-0.5 bg-(--pc-line)" aria-hidden>
              <span ref={progressRef} className="absolute inset-0 origin-left bg-(--pc-accent-ui)" />
            </span>
            <div className="flex items-center gap-3 p-2.5 pr-3">
              <CoverArt style={coverStyle} accent={accent} title={showName} seed={episode.number} variant="mini" className="w-11 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{episode.title}</p>
                <p className={cn('truncate text-[11px] text-(--pc-muted)', MONO)}>
                  Ep {episode.number} · <Clock kind="elapsed" /> / {formatTime(episode.duration)}
                </p>
              </div>
              <Equalizer className="hidden text-(--pc-accent-ui) @md:inline-flex" />
              <SkipButton seconds={15} className="hidden @md:grid" />
              <PlayButton size="md" />
              <button
                type="button"
                onClick={onReturn}
                aria-label="Back to the full player"
                className={cn('grid size-10 place-items-center rounded-full text-(--pc-muted) transition-colors hover:bg-(--pc-surface) hover:text-(--pc-fg)', FOCUS)}
              >
                <Icon name="up" className="size-[18px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
