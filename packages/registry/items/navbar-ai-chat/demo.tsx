import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NavbarAiChat, type NavbarAiChatProps } from './navbar-ai-chat'

const LOOP = 8

type Auto = { selectOpen: boolean; activeIndex: number; menuOpen: boolean }

// 自动播放的时间轴：打开模型下拉并依次高亮，收起后再打开账户菜单。
function autoAt(t: number): Auto {
  const s = t % LOOP
  if (s >= 0.6 && s < 4) return { selectOpen: true, activeIndex: Math.min(3, Math.floor((s - 0.6) / 0.8)), menuOpen: false }
  if (s >= 4.8 && s < 7.4) return { selectOpen: false, activeIndex: 0, menuOpen: true }
  return { selectOpen: false, activeIndex: 0, menuOpen: false }
}

export function Demo(props: NavbarAiChatProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>(() => autoAt(1.8))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = autoAt(time)
      setAuto((p) => (p.selectOpen === next.selectOpen && p.activeIndex === next.activeIndex && p.menuOpen === next.menuOpen ? p : next))
    },
    { reducedMotion: 'static', staticTime: 1.8 },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background text-foreground"
      onPointerDown={() => manual || setManual(true)}
      onKeyDown={() => manual || setManual(true)}
    >
      <NavbarAiChat {...props} {...(manual ? {} : auto)} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-10 pb-24">
        <div className="ms-auto w-fit max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm">
          Can you turn last week's support tickets into three themes?
        </div>
        <div className="max-w-[90%] space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground">Here are the three recurring themes from 214 tickets:</p>
          <p>1. Export to CSV times out on workspaces with more than 10k rows.</p>
          <p>2. Invite emails land in spam for two enterprise domains.</p>
          <p>3. The billing page shows the old plan for a few minutes after upgrading.</p>
        </div>
      </main>
    </div>
  )
}
