import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ShowcaseIntegrationRecipes, type ShowcaseIntegrationRecipesProps } from './showcase-integration-recipes'

// 自动播放：按时间表轮流「悬停」几张卡片，中途展开一张的步骤；用户移动指针或点开配方后交还控制。
// 节奏全部来自 useFrameLoop 的 time（截图时只接管 rAF），不用 setTimeout。
const CYCLE = 13
const SCHEDULE: { from: number; highlight: string | null; open?: boolean }[] = [
  { from: 0, highlight: null },
  { from: 0.35, highlight: 'deal-won' },
  { from: 2.6, highlight: 'new-hire' },
  { from: 3.4, highlight: 'new-hire', open: true },
  { from: 6.4, highlight: 'bug-closed' },
  { from: 8.8, highlight: 'payment-failed' },
  { from: 11, highlight: 'urgent-ticket' },
  { from: 12.7, highlight: null },
]

function slotAt(time: number) {
  const t = ((time % CYCLE) + CYCLE) % CYCLE
  let slot = SCHEDULE[0]
  for (const s of SCHEDULE) if (t >= s.from) slot = s
  return slot
}

export function Demo(props: ShowcaseIntegrationRecipesProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const slot = slotAt(time)
      setHighlight((prev) => (prev === slot.highlight ? prev : slot.highlight))
      const nextOpen = slot.open ? slot.highlight : null
      setOpen((prev) => (prev === nextOpen ? prev : nextOpen))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background"
      onPointerMove={() => {
        if (auto) setAuto(false)
      }}
    >
      <ShowcaseIntegrationRecipes
        {...props}
        highlightId={auto ? highlight : null}
        openId={open}
        onOpenChange={(id) => {
          setAuto(false)
          setOpen(id)
        }}
      />
    </div>
  )
}
