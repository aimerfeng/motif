// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/polaroid-drag.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type MotionValue, type PanInfo } from 'motion/react'
import React, { createContext, useCallback, useContext, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  tableColor: '#f6f4f6',
  size: 'md',
  fastener: 'tape',
  captionFont: 'script',
  tiltFactor: 18,
  spring: {
    visualDuration: 0.28,
    bounce: 0.33,
  },
}
/* @motif:end */

type CardSize = 'sm' | 'md' | 'lg'

// 上游用 Google Fonts 的手写体 Dawning of a New Day；这里换成自托管字体，按字宽给每档尺寸配字号。
const CAPTION_FONTS: Record<string, { fontFamily: string; fontStyle?: 'italic'; sizes: Record<CardSize, string> }> = {
  script: { fontFamily: "'Instrument Serif', ui-serif, Georgia, serif", fontStyle: 'italic', sizes: { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' } },
  typewriter: { fontFamily: "'IBM Plex Mono', ui-monospace, monospace", sizes: { sm: 'text-[13px]', md: 'text-[15px]', lg: 'text-[17px]' } },
  grotesk: { fontFamily: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", sizes: { sm: 'text-[15px]', md: 'text-lg', lg: 'text-[22px]' } },
}

const toSize = (value: string | undefined): CardSize => (value === 'sm' || value === 'lg' ? value : 'md')

interface PolaroidContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>
  bringToFront: (id: string) => void
  getZIndex: (id: string) => number
  enableConstraints: boolean
  options: typeof defaults
}

const PolaroidContext = createContext<PolaroidContextValue | null>(null)

function usePolaroid() {
  const context = useContext(PolaroidContext)
  if (!context) {
    throw new Error('Polaroid components must be used within a <PolaroidGallery />')
  }
  return context
}

export type PolaroidGalleryProps = Partial<typeof defaults> &
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
    enableConstraints?: boolean
  }

/** 桌面：提供层叠顺序、拖动边界和共享的外观参数。 */
export const PolaroidGallery = React.forwardRef<HTMLDivElement, PolaroidGalleryProps>(
  ({ children, className, style, enableConstraints = true, tableColor, size, fastener, captionFont, tiltFactor, spring, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => containerRef.current!)
    const [cardOrder, setCardOrder] = useState<string[]>([])
    const options = { ...defaults, ...strip({ tableColor, size, fastener, captionFont, tiltFactor, spring }) }

    const bringToFront = useCallback((id: string) => {
      setCardOrder((prev) => (prev[prev.length - 1] === id ? prev : [...prev.filter((cardId) => cardId !== id), id]))
    }, [])

    // 上游把排过序的第一张也设成 10，和没排过的卡片打平，拿起来压不到上面；这里从 11 开始。
    const getZIndex = (id: string) => {
      const index = cardOrder.indexOf(id)
      return index === -1 ? 10 : 11 + index
    }

    return (
      <PolaroidContext.Provider
        value={{
          containerRef,
          bringToFront,
          getZIndex,
          enableConstraints,
          options,
        }}
      >
        <div
          ref={containerRef}
          className={cn('relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-12 px-4 select-none', className)}
          style={{ backgroundColor: options.tableColor, ...style }}
          {...props}
        >
          {children}
        </div>
      </PolaroidContext.Provider>
    )
  },
)
PolaroidGallery.displayName = 'PolaroidGallery'

/** 去掉值为 undefined 的键，避免覆盖默认值。 */
function strip<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Partial<T>
}

export interface PolaroidArenaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const PolaroidArena = React.forwardRef<HTMLDivElement, PolaroidArenaProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('relative z-10 flex min-h-[520px] w-full max-w-6xl flex-wrap items-center justify-center gap-8 md:gap-14', className)} {...props}>
      {children}
    </div>
  )
})
PolaroidArena.displayName = 'PolaroidArena'

export interface PolaroidCardProps {
  id?: string
  src?: string
  alt?: string
  caption?: string
  aspectRatio?: 'square' | 'portrait' | 'classic' | 'landscape'
  rotate?: number
  initialX?: number
  initialY?: number
  textColor?: string
  /** 不传时用 PolaroidGallery 的 size。 */
  size?: CardSize
  /** 不传时由 PolaroidGallery 的 fastener 决定。 */
  showTape?: boolean
  showPin?: boolean
  className?: string
  /** 代替 src 填进相框的内容（例如一张 SVG）。 */
  children?: React.ReactNode
  /** 外部提供的位移（演示的自动播放用它把卡片拖来拖去）；不传则卡片自己管。 */
  x?: MotionValue<number>
  y?: MotionValue<number>
  /** 强制显示「被拿起」的状态：置顶、放大、按速度倾斜。 */
  dragging?: boolean
}

const KEY_MOVES: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  id,
  src,
  alt = 'Polaroid photo',
  caption,
  aspectRatio = 'square',
  rotate = 0,
  initialX = 0,
  initialY = 0,
  textColor,
  size: sizeProp,
  showTape: showTapeProp,
  showPin: showPinProp,
  className,
  children,
  x: xProp,
  y: yProp,
  dragging,
}) => {
  const generatedId = useId()
  const cardId = id || generatedId
  const { containerRef, bringToFront, getZIndex, enableConstraints, options } = usePolaroid()
  const reduced = useReducedMotion() ?? false
  const [isDragging, setIsDragging] = useState(false)
  const lifted = isDragging || dragging === true
  const size = sizeProp ?? toSize(options.size)
  const showTape = showTapeProp ?? options.fastener === 'tape'
  const showPin = showPinProp ?? options.fastener === 'pin'
  const font = CAPTION_FONTS[options.captionFont] ?? CAPTION_FONTS.script!

  const ownX = useMotionValue(initialX)
  const ownY = useMotionValue(initialY)
  const x = xProp ?? ownX
  const y = yProp ?? ownY

  const xVelocity = useVelocity(x)
  const rawTilt = useTransform(xVelocity, [-2000, 0, 2000], [-options.tiltFactor, 0, options.tiltFactor])
  const smoothTilt = useSpring(rawTilt, { visualDuration: options.spring.visualDuration, bounce: options.spring.bounce })
  const dynamicRotate = useTransform(smoothTilt, (v) => (lifted && !reduced ? rotate + v : rotate))

  useEffect(() => {
    if (dragging) bringToFront(cardId)
  }, [dragging, cardId, bringToFront])

  const handleDragStart = () => {
    setIsDragging(true)
    bringToFront(cardId)
  }

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    setIsDragging(false)
  }

  // 键盘也能挪动：方向键 12px，按住 Shift 48px。
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const move = KEY_MOVES[event.key]
    if (!move) return
    event.preventDefault()
    const step = event.shiftKey ? 48 : 12
    bringToFront(cardId)
    x.set(x.get() + move[0] * step)
    y.set(y.get() + move[1] * step)
  }

  const sizeClasses = {
    sm: 'w-[230px] p-2.5 pb-9',
    md: 'w-[280px] p-3 pb-12',
    lg: 'w-[330px] p-3.5 pb-14',
  }[size]

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    classic: 'aspect-[4/5]',
    landscape: 'aspect-[4/3]',
  }[aspectRatio]

  return (
    <div className="relative flex items-center justify-center [perspective:1000px]">
      <motion.div
        role="group"
        aria-roledescription="draggable photo"
        aria-label={caption || alt}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          x,
          y,
          rotate: dynamicRotate,
          zIndex: getZIndex(cardId),
          touchAction: 'none',
          transformOrigin: 'top center',
        }}
        drag
        dragConstraints={enableConstraints ? containerRef : false}
        dragElastic={0.15}
        dragMomentum={true}
        animate={dragging === undefined ? undefined : { scale: dragging && !reduced ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
        whileHover={
          reduced
            ? undefined
            : {
                scale: lifted ? 1.05 : 1.02,
                transition: { duration: 0.2 },
              }
        }
        whileTap={{
          scale: reduced ? 1 : 1.05,
          cursor: 'grabbing',
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={() => bringToFront(cardId)}
        className={cn(
          'relative rounded-[2px] bg-white cursor-grab active:cursor-grabbing select-none border border-neutral-100/60 outline-none transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2',
          sizeClasses,
          lifted
            ? 'shadow-[0_30px_60px_-12px_rgba(0,0,0,0.22),0_18px_36px_-18px_rgba(0,0,0,0.18)]'
            : 'shadow-[0_10px_30px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
          className,
        )}
      >
        {showTape && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-amber-100/75 backdrop-blur-[1px] border-t border-b border-amber-200/50 -rotate-2 pointer-events-none shadow-xs z-20"
            style={{
              clipPath: 'polygon(0% 10%, 5% 0%, 95% 0%, 100% 10%, 98% 90%, 95% 100%, 5% 100%, 2% 90%)',
            }}
          />
        )}

        {showPin && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-red-600 z-20 pointer-events-none flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
          </div>
        )}

        <div className={cn('relative w-full overflow-hidden rounded-[1px] bg-neutral-100 mb-4', aspectClasses)}>
          {children ?? (src ? <img src={src} alt={alt} draggable={false} className="h-full w-full object-cover pointer-events-none select-none" /> : null)}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-white/5 to-white/20 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>

        {caption && (
          <div
            className={cn('w-full text-center select-none font-normal tracking-normal pointer-events-none', font.sizes[size])}
            style={{
              fontFamily: font.fontFamily,
              fontStyle: font.fontStyle,
              // 相框永远是白的：不继承外层（深色主题下会是浅色）的文字颜色。
              color: textColor || '#333333',
            }}
          >
            {caption}
          </div>
        )}

        <div className="absolute inset-0 rounded-[2px] bg-gradient-to-tr from-stone-100/10 via-transparent to-white/30 pointer-events-none" />
      </motion.div>
    </div>
  )
}
