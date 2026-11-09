import { useRef } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { ScrollProgress, type ScrollProgressProps } from './scroll-progress'

const sections = [
  {
    heading: 'Why we moved builds off the laptop',
    body: 'For two years every release of Tessel started on someone’s machine. That worked while we were four people. At eighteen, it meant three slightly different toolchains, a release checklist nobody fully trusted and one Friday where we shipped a build signed with an expired key.',
  },
  {
    heading: 'What the new pipeline does',
    body: 'Each merge to main now produces a reproducible artifact in about six minutes. The build image is pinned, dependency hashes are checked before anything compiles, and the signing step runs in an isolated job that only ever sees the finished bundle.',
  },
  {
    heading: 'The part that took longest',
    body: 'Caching. Our first version rebuilt everything on every run and took twenty-two minutes. Splitting the asset step from the compile step, and keying the cache on the lockfile rather than the branch, got us most of the way back.',
  },
  {
    heading: 'What changed for the team',
    body: 'Release day is now a button. Rollbacks point at a previous artifact instead of a rebuild, so they take seconds. The checklist shrank from nineteen items to four, and two of those are about telling support.',
  },
  {
    heading: 'What is next',
    body: 'We want preview builds on every pull request and a size budget that fails the run when the bundle grows past it. Both are small once the pipeline exists, which was the whole point of doing this first.',
  },
]

export function Demo(props: ScrollProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)

  useFrameLoop(
    containerRef,
    ({ time }) => {
      const el = containerRef.current
      if (!el || !autoplay.current) return
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      // 8 秒一个周期：6.5 秒缓动滚到底，停一会儿再回到顶部，让海报和循环视频都能看到进度变化
      const t = (time % 8) / 6.5
      const p = t >= 1 ? 1 : 0.5 - Math.cos(Math.PI * t) / 2
      el.scrollTop = p * max
    },
    { staticTime: 3 },
  )

  const stop = () => {
    autoplay.current = false
  }

  return (
    <div className="relative h-full w-full bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="absolute inset-x-0 top-0 bg-foreground/10" style={{ height: props.thickness ?? 4 }} />
        <ScrollProgress {...props} containerRef={containerRef} className="absolute" />
      </div>
      <div
        ref={containerRef}
        onWheel={stop}
        onTouchStart={stop}
        onPointerDown={stop}
        onKeyDown={stop}
        tabIndex={0}
        className="h-full overflow-y-auto px-6 pb-16 pt-14 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-10"
      >
        <article className="mx-auto max-w-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Engineering · 6 min read</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Shipping from a clean room</h1>
          {sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="text-base font-semibold text-foreground">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
