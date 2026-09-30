import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { ToggleSegmented, type SegmentOption, type ToggleSegmentedProps } from './toggle-segmented'

const svg = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

const OPTIONS: SegmentOption[] = [
  { value: 'list', label: 'List', icon: svg(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />) },
  { value: 'grid', label: 'Grid', icon: svg(<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>) },
  { value: 'board', label: 'Board', icon: svg(<><rect x="4" y="4" width="4.5" height="16" rx="1.5" /><rect x="10" y="4" width="4.5" height="10" rx="1.5" /><rect x="16" y="4" width="4.5" height="13" rx="1.5" /></>) },
]

const FILES = [
  { name: 'Brand guidelines', meta: 'PDF · 4.2 MB', tone: 'from-rose-400 to-pink-600' },
  { name: 'Launch storyboard', meta: 'Figma · edited 2h ago', tone: 'from-violet-400 to-indigo-600' },
  { name: 'Q4 budget', meta: 'Sheet · 12 tabs', tone: 'from-emerald-400 to-teal-600' },
  { name: 'Interview notes', meta: 'Doc · 8 pages', tone: 'from-amber-300 to-orange-500' },
]

function Preview({ mode }: { mode: string }) {
  if (mode === 'grid') {
    return (
      <div key="grid" className="grid grid-cols-4 gap-2.5">
        {FILES.map((file) => (
          <div key={file.name} className="rounded-lg border bg-background/50 p-2">
            <div className={`mb-2 aspect-[4/3] rounded-md bg-linear-to-br ${file.tone}`} />
            <div className="truncate text-[11px] font-medium">{file.name}</div>
          </div>
        ))}
      </div>
    )
  }
  if (mode === 'board') {
    return (
      <div key="board" className="grid grid-cols-3 gap-2.5">
        {['Draft', 'Review', 'Done'].map((col, ci) => (
          <div key={col} className="rounded-lg bg-background/50 p-2">
            <div className="mb-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{col}</div>
            <div className="space-y-1.5">
              {FILES.slice(0, ci === 1 ? 2 : ci === 0 ? 2 : 1).map((file) => (
                <div key={file.name} className="rounded-md border bg-card px-2 py-1.5 text-[11px]">{file.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div key="list" className="space-y-1">
      {FILES.map((file) => (
        <div key={file.name} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className={`size-7 rounded-md bg-linear-to-br ${file.tone}`} />
          <div className="min-w-0 flex-1 truncate text-[13px] font-medium">{file.name}</div>
          <div className="text-[11px] text-muted-foreground">{file.meta}</div>
        </div>
      ))}
    </div>
  )
}

export function Demo(props: ToggleSegmentedProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState('list')
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      setAuto(OPTIONS[Math.floor(time / 2.6) % OPTIONS.length]!.value)
    },
    { reducedMotion: 'static', staticTime: 3.1 },
  )
  const mode = manual ?? auto

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.09_285/0.45),transparent)] bg-background p-6">
      <div className="w-full max-w-[520px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Campaign assets</div>
            <div className="text-[11px] text-muted-foreground">4 files · synced just now</div>
          </div>
          <ToggleSegmented {...props} options={OPTIONS} value={mode} onValueChange={setManual} label="View mode" />
        </div>
        <div className="min-h-[120px]">
          <Preview mode={mode} />
        </div>
      </div>
    </div>
  )
}
