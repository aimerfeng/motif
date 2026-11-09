// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/ai-orb-face/index.tsx
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/ai-core/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { type MotionValue, motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Orb from './orb'

/* @motif:defaults */
export const defaults = {
  state: 'idle',
  expression: 'auto',
  bodyColor: '#df6ff1',
  edgeColor: '#fcf1fd',
  featureColor: '#1c1e2d',
  size: 128,
  gaze: true,
  amplitude: 0,
}
/* @motif:end */

/**
 * The single state contract shared by every SmoothUI AI component (from ai-core).
 */
export type AIState = 'idle' | 'listening' | 'thinking' | 'streaming' | 'done' | 'error'

/**
 * Chroma multiplier per state, from ai-core's AI_STATE_MOTION. `error`
 * desaturates instead of growing, so it reads as a state change rather than an
 * attention grab.
 */
const STATE_SATURATION: Record<AIState, number> = {
  done: 1,
  error: 0.3,
  idle: 0.75,
  listening: 1.05,
  streaming: 1,
  thinking: 1,
}

/**
 * Amplitude accepted by every reactive AI component.
 *
 * A `MotionValue` is the preferred form: it updates outside React, so a 60fps
 * audio signal never triggers a re-render.
 */
export type AIAmplitude = number | MotionValue<number> | undefined

const isMotionValue = (value: AIAmplitude): value is MotionValue<number> => typeof value === 'object' && value !== null && 'get' in value

/**
 * Normalises the `amplitude` prop into a stable `MotionValue<number>` so
 * component internals only deal with one shape.
 */
const useAmplitudeValue = (amplitude: AIAmplitude): MotionValue<number> => {
  const fallback = useMotionValue(0)
  const numeric = typeof amplitude === 'number' ? amplitude : null

  useEffect(() => {
    if (numeric !== null) {
      fallback.set(numeric)
    }
  }, [numeric, fallback])

  return isMotionValue(amplitude) ? amplitude : fallback
}

const VIEWBOX = 100
const CENTER = VIEWBOX / 2
const EYE_OFFSET = 16
const EYE_Y = 44
const EYE_WIDTH = 11
const EYE_HEIGHT = 26
const EYE_RADIUS = 5.5
/** How far the pupils can travel from centre, in viewBox units. */
const GAZE_RANGE = 5.5
/** Cursor distance, in px, at which the gaze reaches full deflection. */
const GAZE_FALLOFF = 220
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const EASE_IN = [0.4, 0, 1, 1] as const
/** A ~1.25-turn swirl; spun in place it reads as dizzy. */
const SPIRAL = 'M0 0C-0.6 -4 5 -5 6 -0.6C7 4.5 1 8 -4 6C-9 4.5 -9.5 -2 -6 -6'
const BLINK_MIN_MS = 3200
const BLINK_EXTRA_MS = 2600
const DOUBLE_BLINK_CHANCE = 0.25
/** Thinking saccades: the eyes look away and up, the way people search. */
const SACCADE_MIN_MS = 700
const SACCADE_EXTRA_MS = 700
const SACCADE_TARGETS = [
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -0.6, y: -0.4 },
  { x: 0.8, y: -0.9 },
] as const

/** Orb draws its sphere at this fraction of its box; the rest is glow room. */
const ORB_SPHERE_FRACTION = 0.86

/** Amplitude buckets. Five steps is enough to see the interior stir. */
const ENERGY_STEPS = 4

/**
 * Amplitude as React state, quantised.
 *
 * Orb takes plain props, so the level has to cross into a render — and a motion
 * value changes every frame, which would re-render the whole character sixty
 * times a second to nudge one uniform. Rounding to a handful of buckets keeps
 * the reaction visible while the component renders a few times per utterance.
 */
const useEnergyBucket = (value: MotionValue<number>) => {
  const [bucket, setBucket] = useState(0)
  useEffect(() => {
    const read = (level: number) => setBucket(Math.round(level * ENERGY_STEPS) / ENERGY_STEPS)
    read(value.get())
    return value.on('change', read)
  }, [value])
  return bucket
}

/**
 * An expression is two eyes, and an eye is a rounded capsule.
 *
 * Four numbers describe every face this character can pull: how tall the
 * capsule is, how wide, how far it is rotated, and how far it sits from its
 * resting line. Tall and narrow is neutral; short and wide is a closed, content
 * eye; small is surprise; rotated inward is a scowl. Letting the two eyes carry
 * different values is what buys wink, doubt and mischief for free.
 *
 * There is no mouth. A drawn mouth on a shader body reads as a sticker stuck
 * onto it, and eyes alone are both more legible and more expressive — which is
 * why every avatar system built this way ends up eyes-only.
 */
export interface EyeShape {
  /** Vertical offset in viewBox units. Negative sits the eye higher. */
  dy?: number
  /** Multiplier on the resting height. `0` is a shut eye. */
  h: number
  /** Degrees. Positive tilts the inner corner down, which reads as a scowl. */
  rotate?: number
  /** Multiplier on the resting width. */
  w: number
}

export interface Expression {
  left: EyeShape
  right: EyeShape
}

const EYE = (h: number, w = 1, rotate = 0, dy = 0): EyeShape => ({ dy, h, rotate, w })

/** Mirrored: the same tilt on both eyes, pointing at each other. */
const symmetric = (h: number, w = 1, rotate = 0, dy = 0): Expression => ({
  left: EYE(h, w, rotate, dy),
  right: EYE(h, w, -rotate, dy),
})

export const EXPRESSIONS = {
  /** Wide. Paying attention. */
  alert: symmetric(1.2, 1.05, 0, -1),
  /** Eyes shut, curved down. Reads as content rather than asleep. */
  content: symmetric(0.16, 1.25, 0, 2),
  /** Both eyes tilted inward. */
  cross: symmetric(0.85, 1, 18),
  /** Flat dashes. Unimpressed. */
  deadpan: symmetric(0.14, 1.35),
  /** One eye narrowed. The face is not convinced. */
  doubtful: { left: EYE(1, 1), right: EYE(0.45, 1.1, -14) },
  /** Narrowed and level. Working on it. */
  focused: symmetric(0.55, 1.05),
  /** Resting. */
  neutral: symmetric(1),
  /** Small and high. Caught off guard. */
  surprised: symmetric(0.5, 0.55, 0, -3),
  /** One shut, one open. */
  wink: { left: EYE(1, 1), right: EYE(0.12, 1.2, 0, 2) },
} satisfies Record<string, Expression>

export type ExpressionName = keyof typeof EXPRESSIONS

/**
 * The `state` prop keeps working; it now selects an expression instead of
 * branching into a bespoke pair of shapes per state.
 */
const STATE_EXPRESSION: Record<string, ExpressionName> = {
  done: 'content',
  error: 'cross',
  idle: 'neutral',
  listening: 'alert',
  streaming: 'focused',
  thinking: 'doubtful',
}

export type AIOrbFaceProps = Partial<Omit<typeof defaults, 'state' | 'expression' | 'amplitude'>> & {
  /** Accessible label. Omit to keep the character decorative. */
  'aria-label'?: string
  /** Live audio level, 0–1. Widens the eyes and lifts the body while speaking. */
  amplitude?: AIAmplitude
  className?: string
  style?: CSSProperties
  state?: AIState
  /**
   * Set the face directly, ignoring `state`. Either a name from
   * `EXPRESSIONS` or a pair of eye shapes of your own; `auto` follows `state`.
   */
  expression?: 'auto' | ExpressionName | Expression
}

/**
 * A little character rather than an indicator.
 *
 * Status is carried by expression — the thing humans read fastest and the reason
 * a literal checkmark stuck onto an orb feels wrong. Squints while it thinks,
 * eyes wide while it listens, happy arcs when it finishes, spiral-eyed when it
 * breaks. The gaze and blink cadence are borrowed from the SmoothUI moai so the
 * two feel like the same creature.
 */
export function AIOrbFace({ 'aria-label': ariaLabel, amplitude, className, style, expression, state: stateProp, ...props }: AIOrbFaceProps) {
  const options = { ...defaults, ...props }
  const state: AIState = stateProp ?? (options.state as AIState)
  const { gaze, size } = options
  const shouldReduceMotion = useReducedMotion()
  const amplitudeValue = useAmplitudeValue(amplitude ?? options.amplitude)
  const saturation = STATE_SATURATION[state] ?? STATE_SATURATION.idle
  const finalColors = { body: options.bodyColor, bodyEdge: options.edgeColor, feature: options.featureColor }

  const rootRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const energy = useEnergyBucket(amplitudeValue)
  const leftLid = useAnimationControls()
  const rightLid = useAnimationControls()
  const bodyControls = useAnimationControls()

  const gazeX = useSpring(0, { damping: 26, stiffness: 220 })
  const gazeY = useSpring(0, { damping: 26, stiffness: 220 })

  const resolvedSize = `${size}px`

  const isHappy = state === 'done'
  const isThinking = state === 'thinking'
  const isListening = state === 'listening'
  const isBroken = state === 'error'
  const eyesOpen = !isBroken

  /**
   * Explicit `expression` wins; otherwise the state picks one. A caller can
   * also pass a pair of eye shapes that is not in the preset list at all.
   */
  const chosen = expression ?? options.expression
  const active: Expression = (() => {
    if (typeof chosen === 'object') {
      return chosen
    }
    if (chosen && chosen !== 'auto' && chosen in EXPRESSIONS) {
      return EXPRESSIONS[chosen as ExpressionName]
    }
    return EXPRESSIONS[STATE_EXPRESSION[state] ?? 'neutral']
  })()

  // A blink spans several awaits, so the component can unmount mid-blink — a
  // route change, a state that hides the eyes. Animation controls throw if they
  // are driven after unmount, so every leg checks first.
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Snap shut, ease back open — an even-timed blink reads as a machine.
  const blink = useCallback(
    async (double = false): Promise<void> => {
      const closeT = { duration: 0.07, ease: EASE_IN }
      const openT = { duration: 0.16, ease: EASE_OUT }
      if (!mountedRef.current) {
        return
      }
      await Promise.all([leftLid.start({ scaleY: 0.08 }, closeT), rightLid.start({ scaleY: 0.08 }, closeT)])
      if (!mountedRef.current) {
        return
      }
      await Promise.all([leftLid.start({ scaleY: 1 }, double ? closeT : openT), rightLid.start({ scaleY: 1 }, double ? closeT : openT)])
      if (double) {
        await blink(false)
      }
    },
    [leftLid, rightLid],
  )

  // 上游用 setTimeout 排眨眼和扫视；这里改成按 useFrameLoop 的时间排期，
  // 离屏时一起暂停，截图的假时钟里也能看到。-1 表示「下一帧从当前时间重新排」。
  const schedule = useRef({ blinkAt: -1, saccadeAt: -1, saccadeIndex: 0 })
  useEffect(() => {
    schedule.current.blinkAt = -1
  }, [eyesOpen])
  useEffect(() => {
    schedule.current.saccadeAt = -1
    schedule.current.saccadeIndex = 0
  }, [isThinking])

  useFrameLoop(
    rootRef,
    ({ time }) => {
      if (shouldReduceMotion) {
        return
      }
      const s = schedule.current
      // Idle blinking, occasionally a double.
      if (eyesOpen) {
        if (s.blinkAt < 0) {
          s.blinkAt = time + (BLINK_MIN_MS + Math.random() * BLINK_EXTRA_MS) / 1000
        } else if (time >= s.blinkAt) {
          void blink(Math.random() < DOUBLE_BLINK_CHANCE)
          s.blinkAt = time + (BLINK_MIN_MS + Math.random() * BLINK_EXTRA_MS) / 1000
        }
      }
      // Thinking saccades.
      if (isThinking) {
        if (s.saccadeAt < 0) {
          s.saccadeAt = time + (SACCADE_MIN_MS + Math.random() * SACCADE_EXTRA_MS) / 1000
        } else if (time >= s.saccadeAt) {
          const target = SACCADE_TARGETS[s.saccadeIndex % SACCADE_TARGETS.length]!
          s.saccadeIndex += 1
          gazeX.set(target.x * GAZE_RANGE)
          gazeY.set(target.y * GAZE_RANGE)
          s.saccadeAt = time + (SACCADE_MIN_MS + Math.random() * SACCADE_EXTRA_MS) / 1000
        }
      }
    },
    { reducedMotion: 'static' },
  )

  // Gaze follows the pointer, except while thinking — then it looks away, which
  // is exactly what makes "thinking" legible without any added graphic.
  useEffect(() => {
    if (!gaze || shouldReduceMotion || isThinking || !eyesOpen) {
      return
    }
    const handle = (event: PointerEvent) => {
      const svg = svgRef.current
      if (!svg) {
        return
      }
      const rect = svg.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)
      const reach = Math.min(1, distance / GAZE_FALLOFF) * GAZE_RANGE
      const angle = Math.atan2(dy, dx)
      gazeX.set(Math.cos(angle) * reach)
      gazeY.set(Math.sin(angle) * reach)
    }
    window.addEventListener('pointermove', handle)
    return () => window.removeEventListener('pointermove', handle)
  }, [gaze, gazeX, gazeY, isThinking, eyesOpen, shouldReduceMotion])

  // Error: one dizzy wobble.
  useEffect(() => {
    if (!isBroken) {
      return
    }
    gazeX.set(0)
    gazeY.set(0)
    if (shouldReduceMotion) {
      return
    }
    // The wobble plays once, but the spiral eyes stay for as long as the state
    // is `error`. Recovering to a neutral face after a couple of seconds would
    // leave a broken assistant looking fine.
    void bodyControls.start({ rotate: [0, -11, 9, -7, 5, -3, 0], x: [0, -5, 4, -3, 2, -1, 0] }, { duration: 1.05, ease: [0.45, 0, 0.55, 1] })
  }, [bodyControls, gazeX, gazeY, isBroken, shouldReduceMotion])

  // Done: a happy hop. The squash-and-stretch is the whole payload.
  useEffect(() => {
    if (!isHappy || shouldReduceMotion) {
      return
    }
    void bodyControls.start(
      {
        scaleX: [1, 1.08, 0.94, 1.04, 0.99, 1],
        scaleY: [1, 0.9, 1.08, 0.95, 1.02, 1],
        y: [0, 3, -9, 0, -3, 0],
      },
      { duration: 0.85, ease: EASE_OUT, times: [0, 0.12, 0.4, 0.62, 0.82, 1] },
    )
  }, [bodyControls, isHappy, shouldReduceMotion])

  // Listening: the body breathes with the voice. Driven from the MotionValue so
  // a 60fps audio signal never re-renders this component.
  useEffect(() => {
    if (shouldReduceMotion || !isListening) {
      return
    }
    const unsubscribe = amplitudeValue.on('change', (level) => {
      bodyControls.set({ scale: 1 + level * 0.07, y: -level * 2 })
    })
    return unsubscribe
  }, [amplitudeValue, bodyControls, isListening, shouldReduceMotion])

  // Reset the breathing here rather than in the effect above. Animation
  // controls reject `set()` after unmount, and an unsubscribe cleanup is
  // exactly when the component may already be gone.
  useEffect(() => {
    if (!(isListening || !mountedRef.current)) {
      bodyControls.set({ scale: 1, y: 0 })
    }
  }, [bodyControls, isListening])

  const renderEye = (side: -1 | 1) => {
    const shape = side === -1 ? active.left : active.right
    const controls = side === -1 ? leftLid : rightLid

    const width = EYE_WIDTH * shape.w
    const height = EYE_HEIGHT * shape.h
    const x = CENTER + side * EYE_OFFSET - width / 2
    // Keep the eye centred as it opens and closes, so a squint reads as lids
    // meeting rather than the eye sliding up the face.
    const y = EYE_Y + (EYE_HEIGHT - height) / 2 + (shape.dy ?? 0)
    const cx = x + width / 2
    const cy = y + height / 2

    return (
      <motion.rect
        animate={controls}
        fill={finalColors.feature}
        height={Math.max(height, 0.5)}
        initial={{ scaleY: 1 }}
        // A capsule at any height: at full height this is a rounded bar, and as
        // the eye shuts the radius follows it down into a lozenge instead of
        // squashing a fixed corner into a rectangle.
        rx={Math.min(EYE_RADIUS * shape.w, Math.max(height, 0.5) / 2)}
        style={{
          rotate: shape.rotate ?? 0,
          transformOrigin: `${cx}px ${cy}px`,
          x: gazeX,
          y: gazeY,
        }}
        transition={shouldReduceMotion ? { duration: 0 } : { bounce: 0.1, duration: 0.25, type: 'spring' }}
        width={width}
        x={x}
        y={y}
      />
    )
  }

  const renderDizzyEye = (side: -1 | 1) => (
    <motion.path
      animate={shouldReduceMotion ? undefined : { rotate: 360 * side }}
      d={SPIRAL}
      fill="none"
      stroke={finalColors.feature}
      strokeLinecap="round"
      strokeWidth={3}
      style={{
        scale: 1.5,
        x: CENTER + side * EYE_OFFSET,
        y: EYE_Y + EYE_HEIGHT / 2,
      }}
      transition={{
        duration: 2.4,
        ease: 'linear',
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  )

  // Orb draws its sphere at 86% of its own box, so the box is scaled up by
  // that much to land the sphere exactly on the r=48 circle the face was drawn
  // around. Both layers carry the same controls, so it breathes as one object.
  const bodySpan = (96 / VIEWBOX / ORB_SPHERE_FRACTION) * 100
  const bodyInset = (100 - bodySpan) / 2

  return (
    <div
      ref={rootRef}
      className={cn('relative block shrink-0', className)}
      style={{
        filter: `saturate(${saturation})`,
        height: resolvedSize,
        width: resolvedSize,
        ...style,
      }}
    >
      <motion.div
        animate={bodyControls}
        className="absolute"
        style={{
          height: `${bodySpan}%`,
          left: `${bodyInset}%`,
          top: `${bodyInset}%`,
          width: `${bodySpan}%`,
        }}
      >
        {/* Painted understudy for the shader: on pages running many WebGL
            surfaces the browser reclaims the oldest contexts, and a reclaimed
            Orb leaves a blank canvas — which turned the character into a pair
            of floating eyes. This circle sits exactly under the sphere so the
            body survives losing its context. */}
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle at 34% 30%, ${finalColors.bodyEdge}, ${finalColors.body} 72%)`,
            inset: `${(1 - ORB_SPHERE_FRACTION) * 50}%`,
          }}
        />
        <Orb
          className="relative size-full"
          colors={[finalColors.body, finalColors.bodyEdge]}
          // Speaking stirs the interior, so the character looks like it is
          // doing something inside rather than only changing size.
          flow={0.6 + energy * 0.36}
          // The halo would spill past the silhouette the features sit against.
          glow={0}
          size="100%"
          turbulence={0.4 + energy * 0.32}
        />
      </motion.div>
      <motion.svg
        animate={bodyControls}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        className="absolute inset-0 block size-full overflow-visible"
        ref={svgRef}
        role={ariaLabel ? 'img' : undefined}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      >
        <title>{ariaLabel ?? 'AI assistant character'}</title>

        {isBroken ? null : renderEye(-1)}
        {isBroken ? null : renderEye(1)}
        {isBroken && renderDizzyEye(-1)}
        {isBroken && renderDizzyEye(1)}
      </motion.svg>
    </div>
  )
}
