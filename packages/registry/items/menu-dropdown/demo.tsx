import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { MenuDropdown, type MenuDropdownProps } from './menu-dropdown'

const glyph = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

const TOOLS = [
  { label: 'Select', path: <path d="m5 4 5.5 15 2.2-6.3L19 10.5z" /> },
  { label: 'Frame', path: <path d="M8 4v16M16 4v16M4 8h16M4 16h16" /> },
  { label: 'Text', path: <path d="M6 6.5V5h12v1.5M12 5v14M9.5 19h5" /> },
]

/** 一轮 9 秒：展开 -> 高亮依次下移 -> 勾选「显示网格」-> 移到删除 -> 关闭。 */
function scripted(time: number) {
  const t = time % 9
  const open = t >= 1.0 && t < 7.2
  const steps: [number, string][] = [
    [1.8, 'rename'],
    [2.4, 'duplicate'],
    [3.0, 'share'],
    [3.6, 'grid'],
    [5.0, 'archive'],
    [5.7, 'delete'],
  ]
  let highlight: string | undefined
  for (const [at, id] of steps) if (t >= at) highlight = id
  return { open, highlight: open ? highlight : undefined, grid: t >= 4.0 && t < 8.2 }
}

export function Demo(props: MenuDropdownProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(scripted(0))
  const [manual, setManual] = useState<{ open: boolean } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.open === next.open && prev.highlight === next.highlight && prev.grid === next.grid ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.9 },
  )

  return (
    <div ref={host} className="relative h-full w-full bg-[radial-gradient(60%_60%_at_50%_10%,oklch(0.3_0.09_285/0.45),transparent)] bg-background">
      <div className="absolute inset-x-0 top-[13%] mx-auto flex w-fit items-center gap-1.5 rounded-2xl border bg-card/70 p-2 shadow-xl shadow-black/30">
        <div className="mr-1 grid size-9 place-items-center rounded-xl bg-linear-to-br from-violet-400 to-indigo-600 text-sm font-bold text-white">N</div>
        <div className="mr-1 h-5 w-px bg-border" />
        <MenuDropdown
          {...props}
          triggerIcon={glyph(<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2.5h6.5A1.5 1.5 0 0 1 20 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />)}
          open={manual ? undefined : auto.open}
          onOpenChange={(open) => setManual({ open })}
          highlight={manual ? undefined : auto.highlight}
          checked={manual ? undefined : { grid: auto.grid }}
        />
        <div className="mx-1 h-5 w-px bg-border" />
        {TOOLS.map((tool) => (
          <button key={tool.label} type="button" aria-label={tool.label} className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
            {glyph(tool.path)}
          </button>
        ))}
      </div>
      <div aria-hidden className="absolute inset-x-[14%] top-[72%] flex gap-3 opacity-70">
        <div className="h-24 flex-1 rounded-xl border bg-card/40" />
        <div className="h-24 flex-[1.4] rounded-xl border bg-card/40" />
        <div className="h-24 flex-1 rounded-xl border bg-card/40" />
      </div>
    </div>
  )
}
