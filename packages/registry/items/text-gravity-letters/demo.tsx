import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { GravityLetters, type GravityLettersProps } from './text-gravity-letters'

/** 自动播放一轮 6 秒：先静止，0.8 秒时字母落下，3.8 秒时飞回原位。 */
const CYCLE = 6
const FALL_AT = 0.8
const RISE_AT = 3.8

export function Demo(props: GravityLettersProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  // 访客悬停或点击过之后就交给组件自己的触发方式，自动播放停止。
  const [manual, setManual] = useState<boolean | null>(null)
  const trigger = props.trigger ?? 'hover'
  const interactive = trigger === 'hover' || trigger === 'click'

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const t = time % CYCLE
      const next = t >= FALL_AT && t < RISE_AT
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(60%_50%_at_50%_100%,oklch(0.32_0.06_260/0.35),transparent)] bg-background px-4 py-8 sm:px-8">
      <div className="w-full max-w-xl">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Error 404</p>
        <GravityLetters
          {...props}
          collapsed={manual ?? auto}
          onCollapsedChange={interactive ? setManual : undefined}
          className="mt-4 h-52 w-full rounded-sm font-bold tracking-tight text-foreground"
        />
        <div className="h-px w-full bg-border" />
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Nothing lives at <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">/changelog/v2-beta</code>. It may have moved, or the link you followed is out of date.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5m6-6-6 6 6 6" />
            </svg>
            Back to home
          </button>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            Browse the changelog
          </button>
        </div>
      </div>
    </div>
  )
}
