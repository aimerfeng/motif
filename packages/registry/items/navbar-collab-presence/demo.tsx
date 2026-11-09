import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarCollabPresence, type NavbarCollabPresenceProps } from './navbar-collab-presence'

const LOOP = 8
const POSTER = 1.2

type Auto = { online: boolean[]; extra: number }

// 自动播放：协作者陆续上线、离开，+N 随有人加入跳动。
function autoAt(t: number): Auto {
  const s = t % LOOP
  return {
    online: [true, s >= 1 && s < 6.5, s >= 2.6 && s < 7.4, s >= 4, s >= 5],
    extra: s >= 3.4 && s < 7 ? 1 : 0,
  }
}

const same = (a: Auto, b: Auto) => a.extra === b.extra && a.online.every((v, i) => v === b.online[i])

export function Demo(props: NavbarCollabPresenceProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>(() => autoAt(POSTER))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = autoAt(time)
      setAuto((p) => (same(p, next) ? p : next))
    },
    { reducedMotion: 'static', staticTime: POSTER },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background text-foreground"
      onPointerDown={() => manual || setManual(true)}
      onKeyDown={() => manual || setManual(true)}
    >
      <NavbarCollabPresence {...props} {...(manual ? {} : auto)} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-10 pb-24">
        <p className="text-xs text-muted-foreground">Last edited 4 minutes ago</p>
        <h2 className="text-2xl font-semibold">Button states</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Default, hover, pressed and disabled share one 36px height. Focus uses a 3px ring at half opacity so it stays
          visible on both surfaces.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Default', 'Hover', 'Pressed', 'Disabled'].map((k, i) => (
            <div key={k} className="rounded-lg border p-3">
              <div className={i === 3 ? 'h-9 rounded-md bg-muted' : 'h-9 rounded-md bg-primary'} style={{ opacity: 1 - i * 0.15 }} />
              <div className="mt-2 text-xs text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Martha:</span> Should disabled keep the border?
        </div>
      </main>
    </div>
  )
}
