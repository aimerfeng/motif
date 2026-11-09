import { MotionConfig } from 'motion/react'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { Closing, Docs, Footer, Header, Hero, HowItWorks, Network, Pricing, Ticker } from './sections'
import { themeStyle } from './theme'

/* @motif:defaults */
export const defaults = {
  brandName: 'Keelson',
  headline: 'Serve every request from the city it came from',
  paper: '#1b4a85',
  lineColor: '#eaf1ff',
  gridSize: 24,
  fontPairing: 'drafting',
  showDimensions: true,
  packetSpeed: 1,
}
/* @motif:end */

export type EdgeNetworkBlueprintProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 边缘网络产品官网，整页画成一套晒图：首屏是会走包的请求路径图，下面依次是实时指标、请求路径细部、区域延迟地图、
 * 按量计价的物料清单和配置文件预告。所有颜色由纸色和线条色两个参数推出，网格、尺寸线、字体搭配都可调。
 * 布局全部用容器查询，放进任何宽度的容器都能正确响应。
 */
export function EdgeNetworkBlueprint({ className, style, ...props }: EdgeNetworkBlueprintProps) {
  const options = { ...defaults, ...props }
  return (
    <MotionConfig reducedMotion="user">
      <div className={cn('@container bp-grid relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
        <Header brand={options.brandName} />
        <main>
          <Hero brand={options.brandName} headline={options.headline} speed={options.packetSpeed} showDimensions={options.showDimensions} />
          <Ticker />
          <HowItWorks showDimensions={options.showDimensions} />
          <Network speed={options.packetSpeed} showDimensions={options.showDimensions} />
          <Pricing />
          <Docs brand={options.brandName} />
          <Closing brand={options.brandName} />
        </main>
        <Footer brand={options.brandName} />
      </div>
    </MotionConfig>
  )
}
