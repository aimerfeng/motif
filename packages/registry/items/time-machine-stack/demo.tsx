import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TimeMachineStack, type TimeMachineStackItem, type TimeMachineStackProps } from './time-machine-stack'

const SNAPSHOTS = [
  { when: 'Today, 09:41', size: '4.2 GB', hue: 235, files: ['pricing-v3.fig', 'launch-notes.md', 'hero-loop.mov'] },
  { when: 'Yesterday, 21:40', size: '4.1 GB', hue: 215, files: ['pricing-v2.fig', 'launch-notes.md', 'onboarding.fig'] },
  { when: 'Oct 7, 18:05', size: '4.1 GB', hue: 195, files: ['brand-guide.pdf', 'pricing-v2.fig', 'icons.sketch'] },
  { when: 'Oct 6, 10:22', size: '3.9 GB', hue: 175, files: ['roadmap-q4.md', 'brand-guide.pdf', 'tokens.json'] },
  { when: 'Oct 4, 16:48', size: '3.8 GB', hue: 155, files: ['tokens.json', 'icons.sketch', 'changelog.md'] },
  { when: 'Oct 2, 08:30', size: '3.6 GB', hue: 135, files: ['changelog.md', 'wireframes.fig', 'research.md'] },
  { when: 'Sep 29, 19:12', size: '3.5 GB', hue: 110, files: ['wireframes.fig', 'research.md', 'interviews.mp3'] },
  { when: 'Sep 27, 11:03', size: '3.3 GB', hue: 85, files: ['research.md', 'interviews.mp3', 'brief.pdf'] },
]

const ITEMS: TimeMachineStackItem[] = SNAPSHOTS.map((s, i) => ({
  id: `snap-${i}`,
  content: (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-2.5" style={{ background: `linear-gradient(90deg, oklch(0.55 0.14 ${s.hue} / 0.28), transparent)` }}>
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-foreground/20" />
          <i className="size-2.5 rounded-full bg-foreground/20" />
          <i className="size-2.5 rounded-full bg-foreground/20" />
        </span>
        <span className="text-[13px] font-semibold">{s.when}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{s.size}</span>
      </div>
      <ul className="flex-1 space-y-1 px-4 py-3">
        {s.files.map((file) => (
          <li key={file} className="flex items-center gap-2.5 text-[13px]">
            <span className="size-4 rounded-[5px]" style={{ background: `oklch(0.72 0.13 ${s.hue})` }} />
            <span className="truncate text-foreground/90">{file}</span>
            <span className="ml-auto text-xs text-muted-foreground">modified</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          Snapshot {SNAPSHOTS.length - i} of {SNAPSHOTS.length}
        </span>
        <span className="rounded-full px-2.5 py-1 font-medium text-foreground" style={{ background: `oklch(0.55 0.14 ${s.hue} / 0.35)` }}>
          Restore
        </span>
      </div>
    </div>
  ),
}))

/** 每 1.9 秒往里翻一张，翻到最后一张再整体退回最前，让后退的动画也看得到。 */
const STEP = 1.9

export function Demo(props: Partial<TimeMachineStackProps>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(0)
  const [manual, setManual] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = Math.floor(time / STEP) % (ITEMS.length - 1)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.3 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(70%_60%_at_50%_100%,oklch(0.34_0.09_235/0.5),transparent)] bg-background p-6">
      <div className="w-full max-w-[420px]">
        <TimeMachineStack {...props} items={ITEMS} index={manual ?? auto} onIndexChange={setManual} />
        <p className="mt-3 text-center text-xs text-muted-foreground">Scroll, drag or press the arrow keys to travel back.</p>
      </div>
    </div>
  )
}
