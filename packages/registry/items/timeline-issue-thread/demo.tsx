import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { IssueThread, type IssueThreadProps } from './timeline-issue-thread'

/** 一轮 8 秒：每 1.6 秒点亮下一条，相对时间按秒走。 */
export function Demo(props: IssueThreadProps) {
  const host = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ step: 4, elapsed: 0 })

  useFrameLoop(
    host,
    ({ time }) => {
      const step = Math.min(4, 1 + Math.floor((time % 8) / 1.6))
      const elapsed = Math.floor(time)
      setFrame((prev) => (prev.step === step && prev.elapsed === elapsed ? prev : { step, elapsed }))
    },
    { reducedMotion: 'static', staticTime: 7 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6">
      <div className="w-full max-w-[460px] min-w-0">
        <IssueThread {...props} activeStep={frame.step} elapsed={frame.elapsed} />
      </div>
    </div>
  )
}
