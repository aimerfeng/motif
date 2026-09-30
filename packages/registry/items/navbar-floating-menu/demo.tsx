import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarFloatingMenu, type NavbarFloatingMenuProps } from './navbar-floating-menu'

const SEQUENCE = ['products', 'solutions', 'products', 'pricing', 'docs'] as const

export function Demo(props: NavbarFloatingMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>('products')
  const [manual, setManual] = useState(false)
  const dark = props.tone !== 'light'

  // 演示里的自动播放：菜单依次悬停在几个导航项上；用户真的动了指针就交还控制权。
  useFrameLoop(
    ref,
    ({ time }) => {
      if (manual) return
      const next = SEQUENCE[Math.floor(time / 1.6) % SEQUENCE.length] ?? null
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.4 },
  )

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-y-auto"
      style={{
        background: dark
          ? 'radial-gradient(70% 50% at 20% 10%, rgba(124,140,255,0.28), transparent), radial-gradient(60% 50% at 90% 30%, rgba(236,72,153,0.16), transparent), #07080b'
          : 'radial-gradient(70% 50% at 20% 10%, rgba(14,165,233,0.2), transparent), radial-gradient(60% 50% at 90% 30%, rgba(251,146,60,0.16), transparent), #f7f6f2',
      }}
      onPointerMove={() => manual || setManual(true)}
    >
      <div className="sticky top-0 z-50">
        <NavbarFloatingMenu {...props} active={manual ? undefined : active} />
      </div>
      {/* 页面内容的轮廓，让毛玻璃有东西可以模糊 */}
      <div className="mx-auto max-w-5xl px-6 pt-24 pb-32" style={{ color: dark ? '#f5f5f7' : '#0c0d10' }}>
        <div className="h-3 w-24 rounded-full" style={{ background: 'currentColor', opacity: 0.18 }} />
        <h1 className="mt-6 max-w-2xl text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] font-semibold" style={{ fontFamily: "'Geist Variable', sans-serif", letterSpacing: '-0.045em' }}>
          Every deploy, traced end to end
        </h1>
        <div className="mt-6 space-y-2.5">
          {[70, 56, 40].map((w) => (
            <div key={w} className="h-3 rounded-full" style={{ width: `${w}%`, background: 'currentColor', opacity: 0.12 }} />
          ))}
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl border" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
