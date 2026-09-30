import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ButtonCopy, type ButtonCopyProps } from './button-copy'

export function Demo(props: ButtonCopyProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  const [manual, setManual] = useState(false)
  const inline = props.variant === 'button' || props.variant === 'icon'

  // 一轮 6 秒：1.4 秒时点击，反馈持续 2.4 秒。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % 6
      setAuto(t >= 1.4 && t < 3.8)
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const copied = manual ? undefined : auto

  return (
    <div ref={host} onPointerDown={() => setManual(true)} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.32_0.08_165/0.38),transparent)] bg-background p-6">
      <div className="w-full max-w-[460px] rounded-2xl border bg-card/70 p-6 shadow-2xl shadow-black/30">
        <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">Quick start</div>
        <h2 className="text-lg font-semibold tracking-tight">Add the component</h2>
        <p className="mt-1 mb-9 text-[13px] leading-5 text-muted-foreground">Run this in your project root. It copies the source files and installs nothing else.</p>
        {inline ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-background/50 py-2 pr-2 pl-4 font-mono text-[13px]">
            <code className="min-w-0 truncate">
              <span className="text-muted-foreground/60">$ </span>
              {props.value ?? 'npx motif add tabs-animated'}
            </code>
            <ButtonCopy {...props} copied={copied} />
          </div>
        ) : (
          <ButtonCopy {...props} copied={copied} />
        )}
        <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="grid size-5 place-items-center rounded-full border text-[10px] font-semibold">2</span>
          Import it and pass your own items.
        </div>
      </div>
    </div>
  )
}
