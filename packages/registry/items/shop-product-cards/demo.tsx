import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ShopProductCards, type ShopProductCardsProps } from './shop-product-cards'

/** 自动播放：每 1.6 秒把悬停状态移到下一张卡片；真实指针一动就停。 */
export function Demo(props: ShopProductCardsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(0)
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = Math.floor(time / 1.6) % 6
      setHovered((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerMove={() => setManual(true)}>
      <ShopProductCards {...props} hovered={manual ? null : hovered} />
    </div>
  )
}
