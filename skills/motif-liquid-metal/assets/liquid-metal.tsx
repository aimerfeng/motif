// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { LiquidMetal } from '@paper-design/shaders-react'
import { cn, useDrawnImage, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mark: 'text',
  text: 'M',
  font: 'archivo',
  colorBack: '#0c0c0e',
  colorTint: '#ffffff',
  repetition: 2,
  softness: 0.1,
  shiftRed: 0.3,
  shiftBlue: 0.3,
  distortion: 0.07,
  contour: 0.4,
  angle: 70,
  scale: 0.6,
  speed: 1,
}
/* @motif:end */

export type LiquidMetalMarkProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const FONTS: Record<string, { family: string; weight: number }> = {
  archivo: { family: 'Archivo Black', weight: 400 },
  syne: { family: 'Syne Variable', weight: 800 },
  serif: { family: 'DM Serif Display', weight: 400 },
}
/** 字在画布上的字号；画布够大，标志放大后边缘依然清楚。 */
const FONT_SIZE = 420

/**
 * 液态金属标志：文字（或内置形状）变成会流动的镀铬。
 * 文字先在 Canvas 上画成透明底的白字，裁掉四周空白，再交给 Paper 的 LiquidMetal 当遮罩。
 */
export function LiquidMetalMark({ className, style, children, ...props }: LiquidMetalMarkProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()
  const font = FONTS[options.font] ?? FONTS.archivo!
  const fontCss = `${font.weight} ${FONT_SIZE}px "${font.family}"`
  const text = options.text.trim() || 'M'
  const useText = options.mark === 'text'

  const image = useDrawnImage(
    `${text}|${fontCss}`,
    (context, width, height) => {
      context.font = fontCss
      context.fillStyle = '#ffffff'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, width / 2, height / 2, width * 0.96)
    },
    // 画布按最长 6 个字留足宽度，画完裁到字形本身。
    { width: FONT_SIZE * 4.4, height: FONT_SIZE * 1.6, fonts: [fontCss], trim: 24 },
  )

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      {/* 文字模式下图还没画好时不渲染：空图会让着色器先铺满整个画面再缩回去。 */}
      {(!useText || image) && (
        <LiquidMetal
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={useText ? image : undefined}
          shape={useText ? undefined : (options.mark as 'circle' | 'daisy' | 'diamond' | 'metaballs')}
          colorBack={options.colorBack}
          colorTint={options.colorTint}
          repetition={options.repetition}
          softness={options.softness}
          shiftRed={options.shiftRed}
          shiftBlue={options.shiftBlue}
          distortion={options.distortion}
          contour={options.contour}
          angle={options.angle}
          scale={options.scale}
          // 减少动态效果时停在一帧好看的静态画面上。
          speed={reducedMotion ? 0 : options.speed}
          frame={reducedMotion ? 2600 : 0}
        />
      )}
      {children}
    </div>
  )
}
