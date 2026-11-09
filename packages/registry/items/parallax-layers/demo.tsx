import { useRef } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { landscapeLayers, luminance, mixHex, ParallaxLayers, type ParallaxLayer, type ParallaxLayersProps } from './parallax-layers'
import { defaults } from './parallax-layers'

export function Demo(props: ParallaxLayersProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const o = { ...defaults, ...props }

  useFrameLoop(
    scrollRef,
    ({ time }) => {
      const el = scrollRef.current
      if (!el || !autoplay.current) return
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      // 8 秒一个往返：缓动滚到底再滚回顶部，海报和循环视频都能看到图层错开
      const p = 0.5 - Math.cos((time / 8) * Math.PI * 2) / 2
      el.scrollTop = p * max
    },
    { staticTime: 3 },
  )

  const stop = () => {
    autoplay.current = false
  }

  // 标题叠在场景中部：按地平线色的亮度选深浅墨色和对应的遮罩
  const horizon = o.palette[1] ?? o.palette[0] ?? '#000000'
  const mid = mixHex(o.palette[0] ?? horizon, horizon, 0.5)
  const light = luminance(mid) > 0.35
  const ink = light ? '#10131c' : '#ffffff'
  const scrim = light
    ? 'linear-gradient(to top, rgba(255,255,255,0.7), rgba(255,255,255,0.35), rgba(255,255,255,0.15))'
    : 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.3), rgba(0,0,0,0.12))'

  const layers: ParallaxLayer[] = [
    ...landscapeLayers({ palette: o.palette, layerCount: o.layerCount, haze: o.haze, overscan: o.range + o.pointerStrength }),
    { id: 'scrim', depth: 0, content: <div className="absolute inset-0" style={{ background: scrim }} /> },
    {
      id: 'title',
      depth: 1,
      content: (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center" style={{ color: ink }}>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Halden Ridge Trail</h2>
          <p className="text-sm font-medium opacity-85">14 km · 1,120 m of climbing · Open May to October</p>
        </div>
      ),
    },
  ]

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div
        ref={scrollRef}
        onWheel={stop}
        onTouchStart={stop}
        onPointerDown={stop}
        onKeyDown={stop}
        tabIndex={0}
        aria-label="Trail overview"
        className="relative h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-[55%] min-h-[180px] items-end justify-center px-6 pb-6">
          <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            A two-day loop above the tree line. The first ridge is a steady climb; the second is where the views open up.
          </p>
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ParallaxLayers
            {...props}
            className="h-[300px] w-full overflow-hidden rounded-2xl bg-foreground/5 sm:h-[380px]"
            container={scrollRef}
            layers={layers}
          />
        </div>
        <div className="flex h-[55%] min-h-[180px] items-start justify-center px-6 pt-8">
          <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            Huts at kilometre 6 and 11. Water is reliable until late August.
          </p>
        </div>
      </div>
    </div>
  )
}
