import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InlineAlert, type AlertTone, type InlineAlertProps } from './alert-inline-callouts'

const LOOP = 8
const STEPS: { tone: AlertTone; text: string; items?: string[] }[] = [
  { tone: 'info', text: 'Just a quick note!' },
  { tone: 'success', text: 'Completed successfully!' },
  { tone: 'error', text: 'Password does not meet requirements:', items: ['Minimum 8 characters', 'Include a special character'] },
]

export function Demo(props: InlineAlertProps) {
  const host = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(STEPS.length)
  useFrameLoop(
    host,
    ({ time }) => {
      const next = Math.min(STEPS.length, Math.floor((time % LOOP) / 1.4))
      setCount((c) => (c === next ? c : next))
    },
    { reducedMotion: 'static', staticTime: LOOP - 1 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-3">
        <InlineAlert {...props} />
        {STEPS.map((s, i) => (
          <div
            key={s.tone}
            className="transition-[opacity,transform] duration-500 motion-reduce:transition-none"
            style={{ opacity: i < count ? 1 : 0, transform: i < count ? 'none' : 'translateY(6px)' }}
          >
            <InlineAlert {...props} tone={s.tone} action={s.items ? '' : props.action} items={s.items}>
              {s.text}
            </InlineAlert>
          </div>
        ))}
      </div>
    </div>
  )
}
