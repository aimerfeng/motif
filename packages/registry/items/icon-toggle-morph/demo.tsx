import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { IconToggleMorph, type IconToggleMorphProps } from './icon-toggle-morph'

const ICONS = ['theme', 'menu', 'sound', 'like'] as const
type Key = (typeof ICONS)[number]
type State = Record<Key, boolean>
const START: State = { theme: false, menu: false, sound: false, like: false }

/** 一轮 8 秒：先翻动选中的图标，再依次翻动其余几个，最后全部复位。 */
function scripted(time: number, order: Key[]): State {
  const t = time % 8
  const state = { ...START }
  order.forEach((key, i) => {
    if (t >= 0.8 + i * 0.7 && t < 6.2) state[key] = true
  })
  return state
}

export function Demo(props: IconToggleMorphProps) {
  const host = useRef<HTMLDivElement>(null)
  const first = (ICONS as readonly string[]).includes(props.icon ?? '') ? (props.icon as Key) : 'theme'
  const order: Key[] = [first, ...ICONS.filter((k) => k !== first)]
  const [auto, setAuto] = useState<State>(START)
  const [manual, setManual] = useState<State | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, order)
      setAuto((prev) => (ICONS.every((k) => prev[k] === next[k]) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  const state = manual ?? auto
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6 text-foreground">
      <div className="flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label="Post actions">
        {order.map((key) => (
          <IconToggleMorph key={key} {...props} icon={key} pressed={state[key]} onPressedChange={(v) => setManual({ ...state, [key]: v })} />
        ))}
      </div>
    </div>
  )
}
