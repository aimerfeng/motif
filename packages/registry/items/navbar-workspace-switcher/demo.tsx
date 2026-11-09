import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarWorkspaceSwitcher, type MenuId, type NavbarWorkspaceSwitcherProps } from './navbar-workspace-switcher'

const LOOP = 8

type Auto = { openMenu: MenuId | null; query: string; project: number; account: number }

// 自动播放：打开项目切换器输入搜索并选中，再打开账户切换器。
function autoAt(t: number): Auto {
  const s = t % LOOP
  const typed = 'stag'.slice(0, Math.max(0, Math.floor((s - 1.6) / 0.35)))
  if (s < 1) return { openMenu: null, query: '', project: 0, account: 0 }
  if (s < 3.4) return { openMenu: 'project', query: typed, project: 0, account: 0 }
  if (s < 4.4) return { openMenu: null, query: '', project: 1, account: 0 }
  if (s < 6.4) return { openMenu: 'account', query: '', project: 1, account: s > 5.6 ? 1 : 0 }
  return { openMenu: null, query: '', project: 1, account: 1 }
}

const same = (a: Auto, b: Auto) => a.openMenu === b.openMenu && a.query === b.query && a.project === b.project && a.account === b.account

const deployments = [
  ['web-frontend', 'Ready', '2m ago'],
  ['api-gateway', 'Building', 'just now'],
  ['worker-queue', 'Ready', '1h ago'],
  ['cron-jobs', 'Ready', 'yesterday'],
]

export function Demo(props: NavbarWorkspaceSwitcherProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>(() => autoAt(2.6))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = autoAt(time)
      setAuto((p) => (same(p, next) ? p : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background text-foreground"
      onPointerDown={() => manual || setManual(true)}
      onKeyDown={() => manual || setManual(true)}
    >
      <NavbarWorkspaceSwitcher {...props} {...(manual ? {} : auto)} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-8 pb-24">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-semibold">Deployments</h1>
          <span className="text-xs text-muted-foreground">Region: eu-west</span>
        </div>
        <ul className="divide-y rounded-lg border">
          {deployments.map(([name, state, when]) => (
            <li key={name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span className="truncate font-medium">{name}</span>
              <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={state === 'Ready' ? 'size-1.5 rounded-full bg-emerald-500' : 'size-1.5 rounded-full bg-amber-500'} />
                  {state}
                </span>
                <span className="max-[400px]:hidden">{when}</span>
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
