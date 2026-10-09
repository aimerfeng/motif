import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { WalletCardStack, type WalletCardStackProps } from './wallet-card-stack'

const IDS = ['daily', 'savings', 'travel']

/** 一轮 10 秒：换到第二张 -> 第三张 -> 隐藏余额 -> 显示 -> 回到第一张。 */
function scripted(time: number) {
  const t = time % 10
  const active = t < 2 ? 0 : t < 4 ? 1 : t < 6.2 ? 2 : t < 8.6 ? 0 : 0
  const hidden = t >= 6.2 && t < 8.4
  return { active: IDS[active], hidden }
}

export function Demo(props: WalletCardStackProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(() => scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.active === next.active && prev.hidden === next.hidden ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  return (
    <div ref={host} onPointerDown={() => setManual(true)} onKeyDown={() => setManual(true)} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_70%_at_50%_0%,oklch(0.95_0.04_85/0.8),transparent)] bg-background p-6">
      <div className="w-full max-w-[360px]">
        <WalletCardStack {...props} activeId={manual ? undefined : auto.active} hidden={manual ? undefined : auto.hidden} />
      </div>
    </div>
  )
}
