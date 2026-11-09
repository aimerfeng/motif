import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputSearchGenerate, type InputSearchGenerateProps, type SearchGenerateMode } from './input-search-generate'

const SWATCHES = ['from-rose-400 to-orange-500', 'from-sky-400 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-amber-300 to-pink-500']

export function Demo(props: InputSearchGenerateProps) {
  const host = useRef<HTMLDivElement>(null)
  const initial = (props.mode ?? 'search') as SearchGenerateMode
  const other: SearchGenerateMode = initial === 'search' ? 'generate' : 'search'
  const [auto, setAuto] = useState<SearchGenerateMode>(initial)
  const [manual, setManual] = useState<SearchGenerateMode | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = time % 8 < 4 ? initial : other
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5">
        <div className="text-center">
          <div className="text-sm font-semibold">Asset library</div>
          <div className="text-xs text-muted-foreground">Find a file or describe a new one</div>
        </div>
        <InputSearchGenerate {...props} activeMode={manual ?? auto} onModeChange={setManual} />
        <div className="grid w-full max-w-sm grid-cols-4 gap-2">
          {SWATCHES.map((tone) => (
            <div key={tone} className={`aspect-square rounded-lg bg-linear-to-br ${tone} opacity-80`} />
          ))}
        </div>
      </div>
    </div>
  )
}
