import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { GlareHover, type GlareHoverProps } from './glare-hover'

const PERIOD = 3

export function Demo(props: GlareHoverProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [active, setActive] = useState(false)

  // 真实指针一动就停下自动播放，交给用户自己悬停；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setActive(false)
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 每 3 秒「悬停」一次。用帧循环的时间而不是定时器，录屏时也能对上。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % PERIOD
      setActive(t >= 0.5 && t < 2.1)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <GlareHover {...props} active={active} className="w-full max-w-[340px] shadow-2xl shadow-black/60">
        <div className="relative flex aspect-[1.586] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#2c2645_0%,#15131f_48%,#211c33_100%)] p-6 text-white">
          {/* 细斜纹：让反光扫过时有材质可以「抓住」。 */}
          <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_1px,transparent_1px_7px)]" />
          <div aria-hidden className="absolute -top-16 -right-10 size-48 rounded-full bg-[radial-gradient(circle,rgb(167_139_250/0.35),transparent_65%)]" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-white/55">Members pass</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">Halcyon Studio</p>
            </div>
            <svg viewBox="0 0 32 32" className="size-8 text-white/85" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12.5" cy="16" r="8" />
              <circle cx="19.5" cy="16" r="8" />
            </svg>
          </div>
          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-sm font-medium">Mira Sato</p>
              <p className="mt-0.5 text-xs text-white/55 tabular-nums">No. 0418 · since 2023</p>
            </div>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/75">Annual</span>
          </div>
        </div>
      </GlareHover>
    </div>
  )
}
