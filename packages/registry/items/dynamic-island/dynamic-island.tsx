// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/ui/dynamic-island.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  spring: {
    visualDuration: 0.55,
    bounce: 0.3,
  },
  autoplay: true,
  dwell: 2,
  scale: 1,
  background: '#000000',
  accent: '#30d158',
  shine: true,
}
/* @motif:end */

export type DynamicIslandProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

type SceneId = 'idle' | 'music' | 'battery' | 'call' | 'timer'

// 每个状态对应一组尺寸预设（沿用上游 size presets 的思路），单位 px，scale = 1 时的大小。
const SCENES: { id: SceneId; width: number; height: number; radius: number }[] = [
  { id: 'idle', width: 124, height: 36, radius: 18 },
  { id: 'music', width: 256, height: 40, radius: 20 },
  { id: 'battery', width: 344, height: 88, radius: 36 },
  { id: 'call', width: 344, height: 158, radius: 40 },
  { id: 'timer', width: 176, height: 40, radius: 20 },
]

const LEAD = 0.6

function Bars({ color, still }: { color: string; still: boolean }) {
  const scales = [0.35, 1, 0.55, 0.85, 0.4]
  return (
    <div className="flex h-5 items-center gap-[3px]" aria-hidden>
      {scales.map((s, i) => (
        <motion.span
          key={i}
          className="h-full w-[3px] origin-center rounded-full"
          style={{ background: color, scaleY: still ? s : undefined }}
          animate={still ? undefined : { scaleY: [s, 1, 0.3, 0.8, s] }}
          transition={{ duration: 0.9 + i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

const HANDSET = 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z'

function Scene({ id, accent, still, seconds }: { id: SceneId; accent: string; still: boolean; seconds: number }): ReactNode {
  switch (id) {
    case 'idle':
      return (
        <div className="flex size-full items-center justify-end pr-3.5">
          <span className="size-2.5 rounded-full bg-[#14141c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]" />
        </div>
      )
    case 'music':
      return (
        <div className="flex size-full items-center justify-between px-3.5">
          <span className="size-[26px] rounded-[7px]" style={{ background: `linear-gradient(135deg, ${accent}, #6366f1)` }} />
          <Bars color={accent} still={still} />
        </div>
      )
    case 'timer': {
      const total = 134 + seconds
      return (
        <div className="flex size-full items-center justify-between px-4">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 1.5M9.5 2.5h5" />
          </svg>
          <span className="font-mono text-[15px] font-semibold tabular-nums" style={{ color: accent }}>
            {Math.floor(total / 60)}:{String(total % 60).padStart(2, '0')}
          </span>
        </div>
      )
    }
    case 'battery':
      return (
        <div className="flex size-full items-center gap-3.5 px-5">
          <svg viewBox="0 0 40 28" className="h-7 w-10 shrink-0 text-white" fill="currentColor" aria-hidden>
            <rect x="4" y="2" width="9" height="16" rx="4.5" />
            <rect x="7.6" y="15" width="2.6" height="10" rx="1.3" />
            <rect x="27" y="2" width="9" height="16" rx="4.5" />
            <rect x="29.6" y="15" width="2.6" height="10" rx="1.3" />
          </svg>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[15px] leading-tight font-semibold text-white">AirPods Pro</p>
            <p className="mt-0.5 text-xs text-white/55">Connected</p>
          </div>
          <div className="relative size-11 shrink-0">
            <svg viewBox="0 0 44 44" className="size-full -rotate-90" fill="none" strokeWidth="4" strokeLinecap="round" aria-hidden>
              <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.14)" />
              <motion.circle cx="22" cy="22" r="18" stroke={accent} initial={{ pathLength: still ? 0.82 : 0 }} animate={{ pathLength: 0.82 }} transition={{ duration: still ? 0 : 0.9, delay: 0.25, ease: 'easeOut' }} />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[13px] font-semibold text-white tabular-nums">82</span>
          </div>
        </div>
      )
    case 'call':
      return (
        <div className="flex size-full flex-col justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="relative grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f472b6, #8b5cf6)' }}>
              ML
              {!still && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[#f472b6]"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] leading-tight font-semibold text-white">Mara Lindqvist</p>
              <p className="mt-0.5 text-xs text-white/55">Incoming call · mobile</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#ff453a] text-sm font-semibold text-white">
              <svg viewBox="0 0 24 24" className="size-[18px] rotate-[135deg]" fill="currentColor" aria-hidden>
                <path d={HANDSET} />
              </svg>
              Decline
            </div>
            <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#30d158] text-sm font-semibold text-black">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
                <path d={HANDSET} />
              </svg>
              Accept
            </div>
          </div>
        </div>
      )
  }
}

/**
 * 灵动岛：一颗黑色胶囊在几个状态之间用弹簧改变宽、高和圆角，内容淡入淡出。
 * 默认自动轮播；点击胶囊手动切到下一个状态。
 */
export function DynamicIsland({ className, style, ...props }: DynamicIslandProps) {
  const { spring, autoplay, dwell, scale, background, accent, shine } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [offset, setOffset] = useState(0)

  // 用帧循环计时，离屏和后台标签页自动暂停；减少动态效果时停在「来电」这一格。
  useFrameLoop(
    rootRef,
    ({ time }) => {
      // 第一次切换发生在 LEAD 秒，之后每 dwell 秒一次：先让观众看一眼待机状态。
      setTick(autoplay ? Math.floor((time + dwell - LEAD) / dwell) : 0)
      setSeconds(Math.floor(time))
    },
    { reducedMotion: 'static', staticTime: dwell * 2.5 + LEAD },
  )

  const scene = SCENES[(((tick + offset) % SCENES.length) + SCENES.length) % SCENES.length]!
  const sizeTransition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  return (
    <div ref={rootRef} className={cn('flex justify-center', className)} style={style}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <motion.button
          type="button"
          aria-label={`Dynamic island: ${scene.id}. Click for the next state`}
          onClick={() => setOffset((value) => value + 1)}
          className="relative block cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
          initial={false}
          animate={{ width: scene.width, height: scene.height, borderRadius: scene.radius }}
          transition={sizeTransition}
          style={{
            background,
            boxShadow: shine
              ? '0 14px 34px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.16)'
              : '0 14px 34px rgba(0,0,0,0.38)',
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={scene.id}
              className="absolute inset-0"
              // 内容比外形晚一点出现，等胶囊先长到大致的尺寸。
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { delay: reduced ? 0 : 0.12, duration: reduced ? 0.15 : 0.32, ease: 'easeOut' } }}
              exit={reduced ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.16 } }}
            >
              <Scene id={scene.id} accent={accent} still={!!reduced} seconds={seconds} />
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
