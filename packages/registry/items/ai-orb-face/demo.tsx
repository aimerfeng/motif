// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/apps/docs/examples/ai-orb-face.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { AIOrbFace, type AIOrbFaceProps, type AIState } from './ai-orb-face'

const STATES: AIState[] = ['idle', 'listening', 'thinking', 'streaming', 'done', 'error']

const STATUS: Record<AIState, string> = {
  idle: 'Ask me anything about your notes',
  listening: 'Listening…',
  thinking: 'Looking through 14 notes…',
  streaming: 'Writing a summary…',
  done: 'Summary added to “Q3 planning”',
  error: 'Couldn’t reach the notes sync. Try again.',
}

/** 自动播放的脚本：一轮 12 秒依次走过六个状态。 */
const SCRIPT: [AIState, number][] = [
  ['idle', 0],
  ['listening', 2.2],
  ['thinking', 4.4],
  ['streaming', 6.6],
  ['done', 8.2],
  ['error', 9.8],
]
const CYCLE = 12

const scriptedState = (time: number): AIState => {
  const t = time % CYCLE
  let current: AIState = 'idle'
  for (const [state, at] of SCRIPT) if (t >= at) current = state
  return current
}

/** ai-core 的 useSimulatedAmplitude：三个失谐正弦叠出像说话的包络，能量随状态变化。 */
const INTENSITY: Record<AIState, number> = { idle: 0.3, listening: 0.75, thinking: 1, streaming: 0.6, done: 0.4, error: 0.5 }
const SPEED: Record<AIState, number> = { idle: 0.6, listening: 1, thinking: 2.4, streaming: 1.4, done: 0.8, error: 1 }

export function Demo(props: AIOrbFaceProps) {
  const host = useRef<HTMLDivElement>(null)
  const face = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<AIState>('idle')
  const [manual, setManual] = useState<AIState | null>(null)
  const [virtualPointer, setVirtualPointer] = useState(true)
  const amplitude = useMotionValue(0)

  // 在调参面板里改了 state 时，停下自动播放，显示选中的状态。
  const firstState = useRef(props.state)
  useEffect(() => {
    if (props.state !== firstState.current) {
      firstState.current = props.state
      setManual(props.state ?? 'idle')
    }
  }, [props.state])

  const state = manual ?? auto

  // 真实的指针一动，就把眼神交还给访客。
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) setVirtualPointer(false)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrameLoop(
    host,
    ({ time }) => {
      if (!manual) {
        const next = scriptedState(time)
        setAuto((prev) => (prev === next ? prev : next))
      }
      const speed = SPEED[state]
      const envelope = 0.5 + 0.3 * Math.sin(time * 2.1 * speed) + 0.14 * Math.sin(time * 5.3 * speed + 1.7) + 0.06 * Math.sin(time * 11.7 * speed + 0.4)
      amplitude.set(Math.min(1, Math.max(0, envelope * INTENSITY[state] + (typeof props.amplitude === 'number' ? props.amplitude : 0))))

      // 虚拟指针：绕着脸慢慢画一个横向的 8 字，组件照常从 window 的 pointermove 里读它。
      const rect = face.current?.getBoundingClientRect()
      if (virtualPointer && rect) {
        const x = rect.left + rect.width / 2 + Math.sin(time * 0.9) * 240
        const y = rect.top + rect.height / 2 + Math.sin(time * 1.8) * 90 - 30
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }))
      }
    },
    { reducedMotion: 'static', staticTime: 1.8 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background bg-[radial-gradient(50%_55%_at_50%_42%,oklch(0.32_0.08_320/0.35),transparent)] p-6">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-5 text-center">
        <div ref={face}>
          <AIOrbFace {...props} amplitude={amplitude} state={state} aria-label={`Notes assistant, ${state}`} />
        </div>
        <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {STATUS[state]}
        </p>
        <div role="group" aria-label="Assistant state" className="flex flex-wrap justify-center gap-2">
          {STATES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={state === option}
              onClick={() => setManual(option)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                state === option ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
