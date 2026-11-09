import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ReasoningTrace, defaults, type ReasoningTraceProps } from './ai-reasoning-trace'

const QUESTION = 'Our team is 6 people and we need SSO. Which plan should we pick?'

const REASONING = `Six seats, and SSO is a hard requirement.

Starter caps at 5 seats with no SSO, so it is out. Team adds SSO at $4 a seat: 6 x $16 = $96.

Business includes SSO and audit logs: 6 x $18 = $108. The $12 gap also buys SCIM provisioning.`

const ANSWER =
  'Go with Business. Team plus the SSO add-on comes to $96 a month, only $12 less, and Business also gives you audit logs and SCIM so new hires get access automatically.'

const LEAD = 0.6
const ANSWER_CPS = 120
const HOLD = 2.99

type Frame = { reasoningChars: number; streaming: boolean; seconds: number; answerChars: number }

export function Demo(props: ReasoningTraceProps) {
  const host = useRef<HTMLDivElement>(null)
  const speed = props.streamSpeed ?? defaults.streamSpeed
  const [frame, setFrame] = useState<Frame>({ reasoningChars: 0, streaming: false, seconds: 0, answerChars: 0 })
  // 点击「Answer now」时记下截止时刻（秒，相对本轮开始），只对当前这一轮生效
  const cut = useRef<{ cycle: number; at: number } | null>(null)
  const clock = useRef({ cycle: 0, t: 0 })

  useFrameLoop(
    host,
    ({ time }) => {
      const thinkDur = REASONING.length / speed
      const total = LEAD + thinkDur + ANSWER.length / ANSWER_CPS + HOLD
      const cycle = Math.floor(time / total)
      const t = time - cycle * total
      clock.current = { cycle, t }
      const stopAt = cut.current && cut.current.cycle === cycle ? cut.current.at : Infinity
      const thinkEnd = Math.min(LEAD + thinkDur, stopAt)
      const think = Math.max(0, Math.min(t, thinkEnd) - LEAD)
      const next: Frame = {
        reasoningChars: Math.min(REASONING.length, Math.floor(think * speed)),
        streaming: t >= LEAD && t < thinkEnd,
        seconds: Math.floor(think),
        answerChars: t < thinkEnd ? 0 : Math.min(ANSWER.length, Math.floor((t - thinkEnd) * ANSWER_CPS)),
      }
      setFrame((prev) =>
        prev.reasoningChars === next.reasoningChars && prev.streaming === next.streaming && prev.seconds === next.seconds && prev.answerChars === next.answerChars
          ? prev
          : next,
      )
    },
    { reducedMotion: 'static', staticTime: 6 },
  )

  const started = frame.streaming || frame.answerChars > 0

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-[520px] flex-col gap-5">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm text-foreground">{QUESTION}</div>
        <div className="flex min-h-[220px] flex-col gap-3">
          {started && (
            <ReasoningTrace
              {...props}
              reasoning={REASONING.slice(0, frame.reasoningChars)}
              isStreaming={frame.streaming}
              seconds={frame.seconds}
              onStop={() => {
                cut.current = { cycle: clock.current.cycle, at: clock.current.t }
              }}
            />
          )}
          {frame.answerChars > 0 && <p className="text-sm leading-relaxed text-foreground">{ANSWER.slice(0, frame.answerChars)}</p>}
        </div>
      </div>
    </div>
  )
}
