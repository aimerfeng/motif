import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarServiceStatus, type NavbarServiceStatusProps } from './navbar-service-status'

const LOOP = 8

type Auto = { powered: boolean; activeTab: number }

// 自动播放：依次切换标签，中途关掉电源再打开。
function autoAt(t: number): Auto {
  const s = t % LOOP
  return { activeTab: s < 2 ? 0 : s < 4 ? 1 : 2, powered: !(s >= 4.8 && s < 6.8) }
}

export function Demo(props: NavbarServiceStatusProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>(() => autoAt(1.2))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = autoAt(time)
      setAuto((p) => (p.powered === next.powered && p.activeTab === next.activeTab ? p : next))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background text-foreground"
      onPointerDown={() => manual || setManual(true)}
      onKeyDown={() => manual || setManual(true)}
    >
      <NavbarServiceStatus {...props} {...(manual ? {} : auto)} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-8 pb-24">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-semibold">edge-node-07</h1>
          <span className="text-xs text-muted-foreground">Region: north-2</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ['CPU', '23%'],
            ['Memory', '4.1 / 8 GB'],
            ['Requests', '1.2k/min'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 text-sm font-medium">{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-3 text-sm text-muted-foreground">Last backup completed 2 hours ago.</div>
      </main>
    </div>
  )
}
