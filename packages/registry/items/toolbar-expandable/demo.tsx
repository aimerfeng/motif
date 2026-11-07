import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { ToolbarExpandable, type ToolbarExpandableProps, type ToolbarItem } from './toolbar-expandable'

const svg = (children: ReactNode, className?: string) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

const chip = (selected: boolean) =>
  cn(
    'h-7 rounded-full px-3 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring',
    selected ? 'bg-foreground text-background' : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground',
  )

const round = 'grid size-9 place-items-center rounded-full bg-foreground/[0.07] text-foreground outline-none transition-colors duration-150 hover:bg-foreground/[0.12] focus-visible:ring-2 focus-visible:ring-ring'

function Lights() {
  const [on, setOn] = useState(true)
  const [scene, setScene] = useState('Evening')
  return (
    <div className="space-y-3.5 p-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Living room</p>
          <p className="text-xs text-muted-foreground">{on ? '4 of 6 lights on' : 'All lights off'}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Living room lights"
          onClick={() => setOn(!on)}
          className={cn('relative h-6 w-10 rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring', on ? 'bg-[#f5c26b]' : 'bg-foreground/15')}
        >
          <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200', on && 'translate-x-4')} />
        </button>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Brightness</span>
          <span className="tabular-nums">{on ? '72%' : '0%'}</span>
        </div>
        <div role="meter" aria-label="Brightness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={on ? 72 : 0} className="h-2 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-[72%] origin-left rounded-full bg-[#f5c26b] transition-transform duration-300" style={{ transform: `scaleX(${on ? 1 : 0})` }} />
        </div>
      </div>
      <div className="flex gap-1.5">
        {['Evening', 'Focus', 'Movie'].map((name) => (
          <button key={name} type="button" aria-pressed={scene === name} onClick={() => setScene(name)} className={chip(scene === name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

function Climate() {
  const [target, setTarget] = useState(22)
  return (
    <div className="p-2">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground tabular-nums">Heating to {target.toFixed(1)}°</p>
          <p className="text-[40px] leading-none font-light tracking-tight tabular-nums">21.5°</p>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Lower target temperature" onClick={() => setTarget((t) => Math.max(16, t - 0.5))} className={round}>
            {svg(<path d="M6 12h12" />, 'size-4')}
          </button>
          <button type="button" aria-label="Raise target temperature" onClick={() => setTarget((t) => Math.min(28, t + 0.5))} className={round}>
            {svg(<path d="M12 6v12M6 12h12" />, 'size-4')}
          </button>
        </div>
      </div>
      <dl className="mt-3.5 grid grid-cols-3 gap-2 text-xs">
        {[
          ['Humidity', '46%'],
          ['Outside', '9°'],
          ['Mode', 'Eco'],
        ].map(([term, value]) => (
          <div key={term} className="rounded-lg bg-foreground/[0.05] px-2.5 py-2">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Music() {
  const [playing, setPlaying] = useState(true)
  return (
    <div className="p-2">
      <div className="flex items-center gap-3">
        <div className="size-14 shrink-0 rounded-xl" style={{ background: 'radial-gradient(circle at 30% 25%, #ffd29a 0, transparent 55%), radial-gradient(circle at 75% 80%, #6f5bd6 0, transparent 60%), linear-gradient(135deg, #e0706a, #2c2350)' }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Low Light</p>
          <p className="truncate text-xs text-muted-foreground">Marisol Vega · Kitchen speaker</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full w-[34%] rounded-full bg-foreground/80" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>1:12</span>
            <span>3:28</span>
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-5">
        <button type="button" aria-label="Previous track" className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          {svg(<path d="M17 6.5v11L9 12zM7 6v12" />, 'size-4')}
        </button>
        <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)} className="grid size-9 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {playing ? svg(<path d="M9 6.5v11M15 6.5v11" />, 'size-4') : svg(<path d="M8 6v12l10-6z" />, 'size-4')}
        </button>
        <button type="button" aria-label="Next track" className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          {svg(<path d="M7 6.5v11l8-5.5zM17 6v12" />, 'size-4')}
        </button>
      </div>
    </div>
  )
}

function Security() {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">{svg(<path d="M12 3.5 19 6v5.5c0 4-2.9 7.4-7 8.9-4.1-1.5-7-4.9-7-8.9V6zM9 12l2 2 4-4" />, 'size-4')}</span>
        <p className="text-sm font-medium">All doors locked</p>
        <span className="ml-auto text-xs text-muted-foreground">Away mode</span>
      </div>
      <ul className="mt-2.5 divide-y text-[13px]">
        {[
          ['Front door', 'Locked'],
          ['Garage', 'Closed'],
          ['Back porch camera', 'Recording'],
        ].map(([name, status]) => (
          <li key={name} className="flex items-center justify-between py-2">
            <span>{name}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {status === 'Recording' && <span className="size-1.5 rounded-full bg-red-400" />}
              {status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ITEMS: ToolbarItem[] = [
  {
    id: 'lights',
    label: 'Lights',
    icon: svg(<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z" />),
    content: <Lights />,
  },
  {
    id: 'climate',
    label: 'Climate',
    icon: svg(<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0zM12 9v7" />),
    content: <Climate />,
  },
  {
    id: 'music',
    label: 'Music',
    icon: svg(
      <>
        <path d="M9 18V6l10-2v12" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="16.5" cy="16" r="2.5" />
      </>,
    ),
    content: <Music />,
  },
  {
    id: 'security',
    label: 'Security',
    icon: svg(<path d="M12 3.5 19 6v5.5c0 4-2.9 7.4-7 8.9-4.1-1.5-7-4.9-7-8.9V6z" />),
    content: <Security />,
  },
]

// 12 秒一轮：0.8 秒打开灯光，然后每 2.6 秒换一个工具，11 秒收起，首尾都是收起状态，循环无缝。
const SCHEDULE: [number, string | null][] = [
  [0, null],
  [0.8, 'lights'],
  [3.4, 'climate'],
  [6, 'music'],
  [8.6, 'security'],
  [11, null],
]

function scripted(time: number): string | null {
  const t = time % 12
  let current: string | null = null
  for (const [at, id] of SCHEDULE) if (t >= at) current = id
  return current
}

export function Demo(props: Omit<ToolbarExpandableProps, 'items' | 'active' | 'onActiveChange'>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string | null>(null)
  const [manual, setManual] = useState<{ value: string | null } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 7.4 },
  )

  return (
    <div ref={host} className={cn('flex h-full w-full flex-col items-center bg-background p-6', props.placement === 'bottom' ? 'justify-start pt-[20%]' : 'justify-end pb-[20%]')}>
      <ToolbarExpandable {...props} items={ITEMS} active={manual ? manual.value : auto} onActiveChange={(value) => setManual({ value })} aria-label="Home controls" />
    </div>
  )
}
