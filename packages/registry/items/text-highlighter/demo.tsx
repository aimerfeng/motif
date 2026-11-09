import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { Highlighter, type HighlighterProps } from './text-highlighter'

const SERIF = "'Newsreader Variable', ui-serif, Georgia, serif"
const CYCLE = 6

export function Demo(props: Omit<HighlighterProps, 'children'>) {
  const ref = useRef<HTMLDivElement>(null)
  const [round, setRound] = useState(0)
  useFrameLoop(ref, ({ time }) => {
    const next = Math.floor(time / CYCLE)
    setRound((prev) => (prev === next ? prev : next))
  })
  const gap = (props.animationDuration ?? 600) + 250

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background px-4 py-8 sm:px-8">
      <div key={round} className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground">Field notes · Release 4.2</p>
        <h1 className="mt-4 text-4xl leading-[1.2] font-medium tracking-[-0.02em] text-balance text-foreground sm:text-5xl" style={{ fontFamily: SERIF }}>
          Drafts now sync{' '}
          <Highlighter {...props} delay={300}>
            between every device
          </Highlighter>{' '}
          before you close the lid.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          The editor keeps a local copy and{' '}
          <Highlighter {...props} delay={300 + gap}>
            merges changes line by line
          </Highlighter>
          {' '}so two people typing in the same paragraph no longer overwrite each other.
        </p>
      </div>
    </div>
  )
}
