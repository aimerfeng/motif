import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { LoaderAiThinking, type LoaderAiThinkingProps } from './loader-ai-thinking'

export function Demo(props: LoaderAiThinkingProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 演示里的等待会周期性「回答完」再重新开始，让海报和循环里都能看到完整过程。
  const [round, setRound] = useState(0)
  useFrameLoop(ref, ({ time }) => setRound(Math.floor(time / 9)), { reducedMotion: 'slowed' })

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          Which of these three vendors has the lowest total cost over two years?
        </div>
        <div className="flex gap-3">
          <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">AI</div>
          <div className="min-w-0 flex-1 pt-1">
            <LoaderAiThinking key={round} {...props} />
            <div className="mt-4 space-y-2" aria-hidden>
              <div className="h-2.5 w-full rounded-full bg-muted" />
              <div className="h-2.5 w-11/12 rounded-full bg-muted" />
              <div className="h-2.5 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
