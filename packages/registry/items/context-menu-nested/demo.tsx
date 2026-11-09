import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ContextMenuNested, type ContextMenuNestedProps, type ContextMenuState } from './context-menu-nested'

/** 一轮 8 秒：右键打开 -> 高亮下移 -> 停在「Add to Playlist」展开子菜单 -> 子菜单下移 -> 关闭。 */
function scripted(time: number): ContextMenuState {
  const t = time % 8
  if (t < 0.8 || t >= 6.8) return { point: null }
  const point = { x: 92, y: 58 }
  if (t < 1.5) return { point, active: 'library' }
  if (t < 2.2) return { point, active: 'playlist' }
  if (t < 3.0) return { point, active: 'playlist', sub: 'playlist' }
  if (t < 3.6) return { point, active: 'playlist', sub: 'playlist', subActive: 'get-up' }
  if (t < 4.2) return { point, active: 'playlist', sub: 'playlist', subActive: 'inside-out' }
  if (t < 5.6) return { point, active: 'playlist', sub: 'playlist', subActive: 'night-beats' }
  return { point, active: 'play-next' }
}

const same = (a: ContextMenuState, b: ContextMenuState) => !a.point === !b.point && a.active === b.active && a.sub === b.sub && a.subActive === b.subActive

export function Demo(props: ContextMenuNestedProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<ContextMenuState>(scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.2 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-64">
        <ContextMenuNested {...props} state={manual ? undefined : auto} onStateChange={() => setManual(true)} />
      </div>
    </div>
  )
}
