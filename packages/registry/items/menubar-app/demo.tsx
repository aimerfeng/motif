import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { MenubarApp, type MenubarAppProps, type MenubarState } from './menubar-app'

/** 一轮 8 秒：点开 File -> 下移到 Export 展开子菜单 -> 悬停切到 Edit -> 再到 View，展开 Layout -> 回到勾选项 -> 关闭。 */
function scripted(time: number): MenubarState {
  const t = time % 8
  if (t < 0.6 || t >= 7.4) return {}
  if (t < 1.2) return { open: 'file', active: 'new' }
  if (t < 1.7) return { open: 'file', active: 'save' }
  if (t < 2.2) return { open: 'file', active: 'export', sub: 'export' }
  if (t < 2.8) return { open: 'file', active: 'export', sub: 'export', subActive: 'png' }
  if (t < 3.4) return { open: 'edit' }
  if (t < 4.0) return { open: 'edit', active: 'copy' }
  if (t < 4.6) return { open: 'view', active: 'zoom-in' }
  if (t < 5.2) return { open: 'view', active: 'layout', sub: 'layout' }
  if (t < 6.6) return { open: 'view', active: 'layout', sub: 'layout', subActive: 'two' }
  return { open: 'view', active: 'minimap' }
}

const same = (a: MenubarState, b: MenubarState) => a.open === b.open && a.active === b.active && a.sub === b.sub && a.subActive === b.subActive

export function Demo(props: MenubarAppProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<MenubarState>(scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 6 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-start justify-center overflow-hidden bg-background p-4 pt-[12%]">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-2 py-1">
          <MenubarApp {...props} state={manual ? undefined : auto} onStateChange={() => setManual(true)} />
          <span className="ml-auto hidden truncate pr-2 text-xs text-neutral-500 sm:block">field-notes.md</span>
        </div>
        <div className="space-y-2 px-4 py-5 text-sm text-neutral-400">
          <p className="text-neutral-200">Field notes, week 32</p>
          <p>Moved the sensor array to the north ridge. Readings stabilised after two days.</p>
          <p>Next: recalibrate the humidity probe before the rain front arrives.</p>
        </div>
      </div>
    </div>
  )
}
