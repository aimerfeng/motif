import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChoiceCards, defaults, type ChoiceCardsProps, type ChoiceOption } from './choice-cards'

const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

/** 虚构的小标记：深色圆角方块里一个几何图形，代替上游的品牌 logo。 */
function Mark({ hue, children }: { hue: string; children: React.ReactNode }) {
  return (
    <svg aria-hidden width={32} height={32} viewBox="0 0 32 32" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#18181b" />
      <g fill={hue}>{children}</g>
    </svg>
  )
}

const ADDONS: ChoiceOption[] = [
  {
    value: 'backups',
    label: 'Daily backups',
    sublabel: '$4/mo',
    description: 'Snapshots every night, kept for 14 days.',
    icon: (
      <Mark hue="#60a5fa">
        <path d="M9 12h14v3H9zM9 17h14v3H9z" />
      </Mark>
    ),
  },
  {
    value: 'edge',
    label: 'Edge cache',
    sublabel: '$9/mo',
    description: 'Serve static files from 38 regions.',
    icon: (
      <Mark hue="#34d399">
        <circle cx="16" cy="16" r="6" />
      </Mark>
    ),
  },
  {
    value: 'support',
    label: 'Priority support',
    sublabel: '$19/mo',
    description: 'Replies within one business hour.',
    icon: (
      <Mark hue="#f472b6">
        <path d="M16 9l7 12H9z" />
      </Mark>
    ),
  },
]

const TOOLS: ChoiceOption[] = [
  {
    value: 'palette',
    label: 'Palette',
    description: 'Shared swatches',
    icon: (
      <svg {...svg}>
        <circle cx="13.5" cy="6.5" r="1" />
        <circle cx="17.5" cy="10.5" r="1" />
        <circle cx="8.5" cy="7.5" r="1" />
        <path d="M12 2a10 10 0 0 0 0 20c1 0 1.5-.8 1.5-1.6 0-.9-.6-1.2-.6-2 0-.9.7-1.4 1.6-1.4H17a5 5 0 0 0 5-5c0-5.5-4.5-10-10-10Z" />
      </svg>
    ),
  },
  {
    value: 'brush',
    label: 'Brush',
    description: 'Pressure strokes',
    icon: (
      <svg {...svg}>
        <path d="m9.1 11.4 9.5-9.5a2 2 0 1 1 3 3l-9.6 9.5" />
        <path d="M7 14.5c-1.7 0-3 1.3-3 3 0 1.3-2.5 1.5-2 2 1.1 1.1 2.5 2 4 2a4 4 0 0 0 4-4c0-1.7-1.3-3-3-3Z" />
      </svg>
    ),
  },
  {
    value: 'eraser',
    label: 'Eraser',
    description: 'Soft edges',
    icon: (
      <svg {...svg}>
        <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21" />
        <path d="M22 21H7M5 11l9 9" />
      </svg>
    ),
  },
  {
    value: 'cut',
    label: 'Cut',
    description: 'Lasso and slice',
    icon: (
      <svg {...svg}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
      </svg>
    ),
  },
]

const CPUS: ChoiceOption[] = [
  { value: '2', label: '2 CPU' },
  { value: '4', label: '4 CPU' },
  { value: '6', label: '6 CPU' },
  { value: '8', label: '8 CPU' },
  { value: '12', label: '12 CPU' },
  { value: '16', label: '16 CPU', disabled: true },
]

const SETS = {
  list: { legend: 'Add-ons', options: ADDONS, steps: [['backups'], ['backups', 'edge'], ['edge'], ['edge', 'support'], ['support']] },
  grid: { legend: 'Toolbar', options: TOOLS, steps: [['palette'], ['palette', 'brush'], ['brush'], ['brush', 'cut'], ['eraser']] },
  tiles: { legend: 'CPU cores', options: CPUS, steps: [['2'], ['4'], ['8'], ['12'], ['6']] },
}

const STEP = 1.6

export function Demo(props: ChoiceCardsProps) {
  const host = useRef<HTMLDivElement>(null)
  const layout = (props.layout ?? defaults.layout) as keyof typeof SETS
  const radio = (props.mode ?? defaults.mode) === 'radio'
  const set = SETS[layout] ?? SETS.list
  const [step, setStep] = useState(0)
  const [manual, setManual] = useState<{ layout: string; value: string[] } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      const next = Math.floor(time / STEP) % set.steps.length
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )

  const auto = set.steps[step] ?? set.steps[0]!
  const scripted = radio ? auto.slice(-1) : auto
  const value = manual && manual.layout === layout ? manual.value : scripted

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6">
      <div className={layout === 'list' ? 'w-full max-w-sm' : 'w-full max-w-md'}>
        <ChoiceCards
          {...props}
          legend={set.legend}
          options={set.options}
          value={value}
          onValueChange={(v) => setManual({ layout, value: v })}
        />
      </div>
    </div>
  )
}
