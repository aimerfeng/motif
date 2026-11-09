import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AiApprovalCard, type AiApprovalCardProps, type AIApprovalOption } from './ai-approval-card'

const CLEANUP: AIApprovalOption[] = [
  { id: 'keep', label: 'Keep the draft' },
  { id: 'delete', label: 'Delete all 412 rows', destructive: true },
]

type Picks = { first: string | null; second: string | null }

/** One 9 s loop: the first card resolves, then the second (alternating keep / delete), then both ask again. */
function scripted(time: number): Picks {
  const t = time % 9
  const round = Math.floor(time / 9)
  return {
    first: t >= 1.6 && t < 7.6 ? 'option-0' : null,
    second: t >= 3.6 && t < 7.6 ? (round % 2 === 0 ? 'delete' : 'keep') : null,
  }
}

export function Demo(props: AiApprovalCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Picks>({ first: null, second: null })
  const [manual, setManual] = useState<Picks | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.first === next.first && prev.second === next.second ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5 },
  )

  const picks = manual ?? auto
  const take = (key: keyof Picks) => (option: AIApprovalOption) => setManual({ ...picks, [key]: option.id })

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-md flex-col gap-4">
        <AiApprovalCard {...props} value={picks.first} onDecide={take('first')}>
          Cold-chain capacity covers five, but marketing has budget for three.
        </AiApprovalCard>
        <AiApprovalCard {...props} question="Clear the staging table before the import?" items={CLEANUP} value={picks.second} onDecide={take('second')} />
        <button
          className="w-fit rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setManual({ first: null, second: null })}
          type="button"
        >
          Ask again
        </button>
      </div>
    </div>
  )
}
