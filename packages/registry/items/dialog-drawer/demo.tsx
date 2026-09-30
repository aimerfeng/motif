import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DialogDrawer, type DialogDrawerProps } from './dialog-drawer'

/** 一轮 11 秒：半高打开 -> 拖到全高 -> 关闭。 */
function scripted(time: number) {
  const t = time % 11
  if (t < 1.0) return { open: false, snap: 0 }
  if (t < 4.6) return { open: true, snap: 0 }
  if (t < 8.4) return { open: true, snap: 1 }
  return { open: false, snap: 0 }
}

const STOPS = [
  { name: 'Alfama Viewpoint', meta: 'Day 1 · 10:00', tone: 'from-amber-300 to-orange-500' },
  { name: 'Time Out Market', meta: 'Day 1 · 13:30', tone: 'from-rose-400 to-pink-600' },
  { name: 'Sintra Day Trip', meta: 'Day 2 · 09:00', tone: 'from-emerald-400 to-teal-600' },
]

function Page({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative flex h-full flex-col bg-[radial-gradient(70%_50%_at_50%_0%,oklch(0.34_0.09_285/0.5),transparent)] px-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Trip</div>
          <h1 className="text-xl font-semibold tracking-tight">Lisbon, 4 days</h1>
        </div>
        <div className="flex -space-x-2">
          {['from-sky-400 to-indigo-600', 'from-pink-400 to-rose-600', 'from-lime-300 to-emerald-500'].map((tone, i) => (
            <div key={i} className={`size-7 rounded-full border-2 border-background bg-linear-to-br ${tone}`} />
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-linear-to-br from-indigo-500/40 to-violet-500/10 p-3.5">
          <div className="text-[11px] text-muted-foreground">Budget</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">€1,240</div>
        </div>
        <div className="h-24 rounded-2xl bg-linear-to-br from-emerald-500/30 to-teal-500/5 p-3.5">
          <div className="text-[11px] text-muted-foreground">Weather</div>
          <div className="mt-1 text-lg font-semibold">22° Sunny</div>
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        {STOPS.map((stop) => (
          <div key={stop.name} className="flex items-center gap-3 rounded-xl border bg-card/60 p-2.5">
            <div className={`size-10 rounded-lg bg-linear-to-br ${stop.tone}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{stop.name}</div>
              <div className="text-[11px] text-muted-foreground">{stop.meta}</div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="absolute inset-x-6 bottom-5 h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        Add a stop
      </button>
    </div>
  )
}

const SUGGESTIONS = [
  { name: 'Pastéis de Belém', meta: 'Bakery · 4.8', tone: 'from-amber-300 to-orange-500' },
  { name: 'LX Factory', meta: 'Creative hub · 4.6', tone: 'from-violet-400 to-indigo-600' },
  { name: 'Miradouro da Graça', meta: 'Viewpoint · 4.7', tone: 'from-sky-400 to-blue-600' },
]

function Sheet({ color }: { color: string }) {
  return (
    <div className="space-y-4">
      <div className="flex h-11 items-center gap-2.5 rounded-xl border bg-background/60 px-3.5 text-sm text-muted-foreground">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        Search places in Lisbon
      </div>
      <div className="flex gap-2">
        {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map((day, i) => (
          <span key={day} className="rounded-full border px-3 py-1 text-xs" style={i === 1 ? { borderColor: color, color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` } : undefined}>{day}</span>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Popular nearby</div>
        {SUGGESTIONS.map((s) => (
          <div key={s.name} className="flex items-center gap-3 rounded-xl p-2">
            <div className={`size-11 rounded-lg bg-linear-to-br ${s.tone}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.meta}</div>
            </div>
            <span className="grid size-7 place-items-center rounded-full border text-muted-foreground">+</span>
          </div>
        ))}
      </div>
      <div className="h-[68px] rounded-xl border bg-background/60 px-3.5 py-3 text-sm text-muted-foreground">Add a note for the group…</div>
      <div className="flex items-center justify-between rounded-xl border bg-background/60 px-3.5 py-3 text-sm">
        <span>Remind me the day before</span>
        <span className="h-5 w-9 rounded-full p-0.5" style={{ backgroundColor: color }}><span className="ml-auto block size-4 rounded-full bg-white" /></span>
      </div>
      <button type="button" className="h-11 w-full rounded-xl text-sm font-medium text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c)" style={{ backgroundColor: color }}>
        Add to Day 2
      </button>
    </div>
  )
}

export function Demo(props: DialogDrawerProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState({ open: false, snap: 0 })
  const [manual, setManual] = useState<{ open: boolean; snap: number } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.open === next.open && prev.snap === next.snap ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.6 },
  )

  const state = manual ?? auto
  return (
    <div ref={host} className="h-full w-full">
      <DialogDrawer
        {...props}
        contained
        open={state.open}
        snap={state.snap}
        onOpenChange={(open) => setManual({ open, snap: state.snap })}
        onSnapChange={(snap) => setManual({ open: state.open, snap })}
        title="Add a stop"
        description="Pick a place and the day it fits."
        page={<Page onAdd={() => setManual({ open: true, snap: 0 })} />}
      >
        <Sheet color={props.color ?? '#8b5cf6'} />
      </DialogDrawer>
    </div>
  )
}
