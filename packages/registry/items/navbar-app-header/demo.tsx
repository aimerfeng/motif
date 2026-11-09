import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarAppHeader, navigationLinks, type MenuId, type NavbarAppHeaderProps } from './navbar-app-header'

const LOOP = 10
const POSTER = 2.8

type Auto = { openMenu: MenuId | null; active: number; allRead: boolean }

// 自动播放：切到 Projects，打开通知并全部标为已读，再切到 Docs、打开账户菜单，最后回到开头。
function autoAt(t: number): Auto {
  const s = t % LOOP
  const active = s < 1.2 ? 0 : s < 5.4 ? 1 : s < 9.2 ? 2 : 0
  const openMenu: MenuId | null = s >= 1.8 && s < 4.6 ? 'notifications' : s >= 6.2 && s < 8.4 ? 'user' : null
  return { openMenu, active, allRead: s >= 3.7 && s < 9.2 }
}

const same = (a: Auto, b: Auto) => a.openMenu === b.openMenu && a.active === b.active && a.allRead === b.allRead

const stats = [
  ['Active users', '12,480', '+4.1%'],
  ['Requests / min', '3,912', '+0.8%'],
  ['Error rate', '0.12%', '−0.03%'],
]

const rows = [
  ['Checkout service', 'Deployed', '3m ago'],
  ['Search indexer', 'Building', 'just now'],
  ['Billing webhooks', 'Deployed', '1h ago'],
  ['Email digests', 'Paused', 'yesterday'],
]

export function Demo(props: NavbarAppHeaderProps) {
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

  const page = navigationLinks[auto.active]?.label ?? 'Dashboard'

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background text-foreground"
      onPointerDown={() => manual || setManual(true)}
      onKeyDown={() => manual || setManual(true)}
    >
      <NavbarAppHeader {...props} defaultTheme="dark" {...(manual ? {} : auto)} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-8 pb-24 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{manual ? 'Overview' : page}</h1>
            <p className="text-sm text-muted-foreground">Production · eu-west-1</p>
          </div>
          <span className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground">Last 24 hours</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map(([label, value, delta]) => (
            <div key={label} className="rounded-lg border bg-card p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{value}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{delta}</span>
              </div>
            </div>
          ))}
        </div>
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Services</h2>
          <ul className="divide-y rounded-lg border">
            {rows.map(([name, state, when]) => (
              <li key={name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <span className="truncate font-medium">{name}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={state === 'Deployed' ? 'size-1.5 rounded-full bg-emerald-500' : state === 'Building' ? 'size-1.5 rounded-full bg-amber-500' : 'size-1.5 rounded-full bg-muted-foreground'}
                    />
                    {state}
                  </span>
                  <span className="max-[400px]:hidden">{when}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
