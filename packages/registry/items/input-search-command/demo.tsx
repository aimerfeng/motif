import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputSearchCommand, type InputSearchCommandProps } from './input-search-command'

const typed = (text: string, t: number, start: number, rate = 0.16) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - start) / rate) + 1)))

/** 一轮 12 秒：浏览 -> 输入 "th" 过滤 -> 回车 -> 清空 -> 输入 "new" -> 回车。 */
function scripted(time: number) {
  const t = time % 12
  if (t < 0.9) return { query: '', highlight: undefined, flash: undefined }
  if (t < 2.7) return { query: '', highlight: (['dashboard', 'projects', 'inbox', 'new-project'] as const)[Math.min(3, Math.floor((t - 0.9) / 0.6))], flash: undefined }
  if (t < 3.3) return { query: '', highlight: 'new-project', flash: undefined }
  if (t < 5.6) return { query: typed('nwp', t, 3.3, 0.35), highlight: undefined, flash: undefined }
  if (t < 6.3) return { query: 'nwp', highlight: 'new-project', flash: 'new-project' }
  if (t < 7.2) return { query: '', highlight: undefined, flash: undefined }
  if (t < 9.2) return { query: typed('dark', t, 7.2, 0.3), highlight: undefined, flash: undefined }
  if (t < 10.4) return { query: 'dark', highlight: 'theme', flash: 'theme' }
  return { query: '', highlight: undefined, flash: undefined }
}

function AppBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-6 top-5 flex h-10 items-center gap-3 rounded-xl border bg-card/50 px-4">
        <div className="size-5 rounded-md bg-linear-to-br from-violet-400 to-indigo-600" />
        <div className="h-2 w-16 rounded-full bg-muted-foreground/25" />
        <div className="ml-auto h-2 w-10 rounded-full bg-muted-foreground/20" />
        <div className="size-5 rounded-full bg-muted-foreground/25" />
      </div>
      <div className="absolute inset-x-6 top-20 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl border bg-card/40 p-3">
            <div className="h-2 w-1/2 rounded-full bg-muted-foreground/25" />
            <div className="mt-3 h-6 w-2/3 rounded-md bg-muted-foreground/15" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[188px] h-40 rounded-xl border bg-card/40" />
    </div>
  )
}

export function Demo(props: InputSearchCommandProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<ReturnType<typeof scripted>>({ query: '', highlight: undefined, flash: undefined })
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev.query === next.query && prev.highlight === next.highlight && prev.flash === next.flash ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <AppBackdrop />
      <div className="absolute inset-0 bg-background/45 backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 top-[4%] mx-auto w-[min(560px,calc(100%-3rem))]">
        <InputSearchCommand
          {...props}
          query={manual ?? auto.query}
          onQueryChange={setManual}
          highlight={manual === null ? auto.highlight : undefined}
          flash={manual === null ? auto.flash : undefined}
          focused={manual === null ? true : undefined}
        />
      </div>
    </div>
  )
}
