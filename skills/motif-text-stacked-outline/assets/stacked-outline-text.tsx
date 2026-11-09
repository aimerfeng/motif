// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/stacked-outline-text.tsx
// Modified by Motif; see the item's provenance.
import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { cn } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  text: 'LMNO',
  fontSize: 250,
  stacks: 10,
  trailDistance: 132,
  strokeWidth: 7,
  fill: '#000000',
  stroke: '#ffffff',
  spring: {
    visualDuration: 0.3,
    bounce: 0,
  },
}
/* @motif:end */

export type StackedOutlineTextProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Optional external position values (e.g. to drive the text from a script). */
  motionX?: MotionValue<number>
  motionY?: MotionValue<number>
  /** Treat the text as being dragged even without a pointer (used by demos). */
  active?: boolean
}

const DEFAULT_TEXT = 'LMNO'
const DEFAULT_FONT_SIZE = 250
const MIN_STACK_COUNT = 3
const MAX_STACK_COUNT = 14
const MIN_SHADOW_SPEED = 120
const MAX_SHADOW_SPEED = 2200
const MIN_TRAIL_DISTANCE = 18
const KEYBOARD_STEP = 32
const SVG_HORIZONTAL_PADDING = 36
const SVG_VERTICAL_PADDING = 168
const MAX_SVG_WIDTH = 1040

type ShadowTextLayerProps = {
  displayText: string
  layerIndex: number
  stackCount: number
  fill: string
  stroke: string
  strokeWidth: number
  shadowOpacity: MotionValue<number>
  shadowX: MotionValue<number>
  shadowY: MotionValue<number>
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const estimateTextWidth = (text: string, fontSize: number) => {
  return Array.from(text).reduce((width, character) => {
    if (character === ' ') return width + fontSize * 0.34
    if ("ilI.,'!|".includes(character)) return width + fontSize * 0.34
    if ('mwMWOQ@#'.includes(character)) return width + fontSize * 0.9
    return width + fontSize * 0.68
  }, 0)
}

const getLayerIndexes = (stackCount: number) => Array.from({ length: stackCount }, (_, index) => stackCount - index)

const getSafeStackCount = (stackCount: number) => Math.round(clamp(stackCount, MIN_STACK_COUNT, MAX_STACK_COUNT))

const getSvgMetrics = (displayText: string, fontSize: number) => {
  const textWidth = estimateTextWidth(displayText, fontSize)
  const viewBoxWidth = Math.max(textWidth + SVG_HORIZONTAL_PADDING * 2, fontSize * 2.65)
  const viewBoxHeight = fontSize + SVG_VERTICAL_PADDING
  const viewBox = `${-viewBoxWidth / 2} ${-viewBoxHeight / 2} ${viewBoxWidth} ${viewBoxHeight}`
  const renderedWidth = Math.min(MAX_SVG_WIDTH, viewBoxWidth * (fontSize / DEFAULT_FONT_SIZE))

  return {
    renderedWidth,
    viewBox,
  }
}

const ShadowTextLayer = ({
  displayText,
  layerIndex,
  stackCount,
  fill,
  stroke,
  strokeWidth,
  shadowOpacity,
  shadowX,
  shadowY,
}: ShadowTextLayerProps) => {
  const layerDepth = layerIndex / stackCount
  const layerX = useTransform(shadowX, (latest) => latest * layerDepth)
  const layerY = useTransform(shadowY, (latest) => latest * layerDepth)
  const layerOpacity = useTransform(shadowOpacity, (latest) => latest * (0.34 + layerDepth * 0.66))

  return (
    <motion.text
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={{
        opacity: layerOpacity,
        x: layerX,
        y: layerY,
      }}
      x="0"
      y="0"
    >
      {displayText}
    </motion.text>
  )
}

export const StackedOutlineText = ({ className, style, motionX, motionY, active = false, ...props }: StackedOutlineTextProps) => {
  const options = { ...defaults, ...props }
  const { text, fontSize, stacks, trailDistance, strokeWidth, fill, stroke, spring } = options
  const containerRef = useRef<HTMLElement>(null)
  const draggableRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activeRef = useRef(active)
  activeRef.current = active
  const shouldReduceMotion = useReducedMotion()
  const ownX = useMotionValue(0)
  const ownY = useMotionValue(0)
  const x = motionX ?? ownX
  const y = motionY ?? ownY
  const velocityX = useVelocity(x)
  const velocityY = useVelocity(y)
  const rawShadowX = useMotionValue(0)
  const rawShadowY = useMotionValue(0)
  const rawShadowOpacity = useMotionValue(0)
  const shadowSpring = { visualDuration: spring.visualDuration, bounce: spring.bounce }
  const shadowX = useSpring(rawShadowX, shadowSpring)
  const shadowY = useSpring(rawShadowY, shadowSpring)
  const shadowOpacity = useSpring(rawShadowOpacity, shadowSpring)
  const displayText = text.trim() || DEFAULT_TEXT
  const stackCount = getSafeStackCount(stacks)
  const letterSpacing = fontSize * -0.04
  const layerIndexes = getLayerIndexes(stackCount)
  const svgMetrics = getSvgMetrics(displayText, fontSize)
  const maxTrailDistance = Math.max(trailDistance, MIN_TRAIL_DISTANCE)
  const layerStrokeWidth = (strokeWidth * 5) / 7

  const updateShadowFromVelocity = (latestX: number, latestY: number) => {
    if (shouldReduceMotion || !(isDraggingRef.current || activeRef.current)) {
      rawShadowX.set(0)
      rawShadowY.set(0)
      rawShadowOpacity.set(0)
      return
    }

    const speed = Math.hypot(latestX, latestY)

    if (speed < MIN_SHADOW_SPEED) {
      rawShadowX.set(0)
      rawShadowY.set(0)
      rawShadowOpacity.set(0)
      return
    }

    const normalizedSpeed = clamp((speed - MIN_SHADOW_SPEED) / (MAX_SHADOW_SPEED - MIN_SHADOW_SPEED), 0, 1)
    const easedSpeed = Math.pow(normalizedSpeed, 0.62)
    const distance = MIN_TRAIL_DISTANCE + easedSpeed * (maxTrailDistance - MIN_TRAIL_DISTANCE)

    rawShadowX.set((-latestX / speed) * distance)
    rawShadowY.set((-latestY / speed) * distance)
    rawShadowOpacity.set(0.12 + easedSpeed * 0.88)
  }

  useMotionValueEvent(velocityX, 'change', (latestX) => {
    updateShadowFromVelocity(latestX, velocityY.get())
  })

  useMotionValueEvent(velocityY, 'change', (latestY) => {
    updateShadowFromVelocity(velocityX.get(), latestY)
  })

  const handleDragStart = () => {
    isDraggingRef.current = true
  }

  const handleDragEnd = () => {
    isDraggingRef.current = false
    rawShadowX.set(0)
    rawShadowY.set(0)
    rawShadowOpacity.set(0)
  }

  const moveByKeyboardDelta = (deltaX: number, deltaY: number) => {
    const containerElement = containerRef.current
    const draggableElement = draggableRef.current

    if (!containerElement || !draggableElement) {
      return
    }

    const containerRect = containerElement.getBoundingClientRect()
    const draggableRect = draggableElement.getBoundingClientRect()
    const safeDeltaX = clamp(deltaX, containerRect.left - draggableRect.left, containerRect.right - draggableRect.right)
    const safeDeltaY = clamp(deltaY, containerRect.top - draggableRect.top, containerRect.bottom - draggableRect.bottom)

    if (safeDeltaX === 0 && safeDeltaY === 0) {
      return
    }

    x.set(x.get() + safeDeltaX)
    y.set(y.get() + safeDeltaY)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keyDeltaByKey: Record<string, [number, number]> = {
      ArrowDown: [0, KEYBOARD_STEP],
      ArrowLeft: [-KEYBOARD_STEP, 0],
      ArrowRight: [KEYBOARD_STEP, 0],
      ArrowUp: [0, -KEYBOARD_STEP],
    }
    const keyDelta = keyDeltaByKey[event.key]

    if (!keyDelta) {
      return
    }

    event.preventDefault()
    moveByKeyboardDelta(keyDelta[0], keyDelta[1])
  }

  return (
    <section
      ref={containerRef}
      aria-label={`${displayText} stacked outline typography`}
      className={cn('relative flex h-full min-h-[520px] w-full items-center justify-center overflow-hidden px-4 py-12', className)}
      style={{ backgroundColor: fill, color: stroke, ...style }}
    >
      <motion.div
        ref={draggableRef}
        aria-label={`Drag ${displayText} typography`}
        className="touch-none select-none rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-current"
        drag
        dragConstraints={containerRef}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onKeyDown={handleKeyDown}
        role="group"
        style={{
          x,
          y,
        }}
        tabIndex={0}
        whileDrag={
          shouldReduceMotion
            ? undefined
            : {
                cursor: 'grabbing',
                scale: 0.985,
              }
        }
      >
        <svg
          aria-hidden="true"
          className="h-auto max-w-[92vw] cursor-grab overflow-visible active:cursor-grabbing"
          style={{
            width: svgMetrics.renderedWidth,
          }}
          viewBox={svgMetrics.viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            dominantBaseline="middle"
            fontFamily="'Archivo Black', 'Arial Black', Impact, sans-serif"
            fontSize={fontSize}
            fontWeight="900"
            letterSpacing={letterSpacing}
            paintOrder="stroke fill"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeMiterlimit="2"
            textAnchor="middle"
          >
            {layerIndexes.map((layerIndex) => (
              <ShadowTextLayer
                displayText={displayText}
                key={layerIndex}
                layerIndex={layerIndex}
                stackCount={stackCount}
                fill={fill}
                stroke={stroke}
                strokeWidth={layerStrokeWidth}
                shadowOpacity={shadowOpacity}
                shadowX={shadowX}
                shadowY={shadowY}
              />
            ))}
            <text fill={fill} stroke={stroke} strokeWidth={strokeWidth} x="0" y="0">
              {displayText}
            </text>
          </g>
        </svg>
      </motion.div>
    </section>
  )
}

export default StackedOutlineText
