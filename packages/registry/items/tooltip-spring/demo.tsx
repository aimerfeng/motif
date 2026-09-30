import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { TooltipGroup, TooltipSpring, type TooltipGroupProps } from './tooltip-spring'

const g = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
)

const TOOLS: { id: string; label: string; keys: string[]; glyph: ReactNode }[] = [
  { id: 'bold', label: 'Bold', keys: ['⌘', 'B'], glyph: g(<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />) },
  { id: 'italic', label: 'Italic', keys: ['⌘', 'I'], glyph: g(<path d="M10 5h7M7 19h7M14.5 5l-5 14" />) },
  { id: 'underline', label: 'Underline', keys: ['⌘', 'U'], glyph: g(<path d="M7 5v6a5 5 0 0 0 10 0V5M5 20h14" />) },
  { id: 'link', label: 'Add link', keys: ['⌘', 'K'], glyph: g(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />) },
  { id: 'code', label: 'Inline code', keys: ['⌘', 'E'], glyph: g(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />) },
  { id: 'comment', label: 'Comment', keys: ['⌘', '⌥', 'M'], glyph: g(<path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4 3.5V16h-.5A1.5 1.5 0 0 1 5 14.5z" />) },
]

/** 一轮 9 秒：气泡依次滑过每个图标，最后收起。 */
function scripted(time: number): string | null {
  const t = time % 9
  if (t < 1.0 || t >= 8.0) return null
  return TOOLS[Math.min(TOOLS.length - 1, Math.floor((t - 1.0) / 1.15))]!.id
}

export function Demo(props: TooltipGroupProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string | null>(null)
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!manual) setAuto(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 4.4 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_30%,oklch(0.3_0.09_285/0.4),transparent)] bg-background p-6">
      <div className="w-full max-w-[460px] rounded-2xl border bg-card/40 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Release notes</div>
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">Draft</span>
        </div>
        <div className="h-12" />
        <TooltipGroup
          {...props}
          activeId={manual ? undefined : auto}
          onPointerEnter={() => setManual(true)}
          className="mx-auto flex w-fit items-center gap-1 rounded-2xl border bg-card p-1.5 shadow-xl shadow-black/30"
        >
          {TOOLS.map((tool, i) => (
            <span key={tool.id} className="flex items-center gap-1">
              {i === 3 && <span aria-hidden className="mx-1 h-5 w-px bg-border" />}
              <TooltipSpring
                id={tool.id}
                content={
                  <>
                    {tool.label}
                    <span className="flex gap-0.5 opacity-60">
                      {tool.keys.map((k, n) => (
                        <kbd key={n} className="font-sans">{k}</kbd>
                      ))}
                    </span>
                  </>
                }
              >
                <button type="button" aria-label={tool.label} className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors duration-150 outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
                  {tool.glyph}
                </button>
              </TooltipSpring>
            </span>
          ))}
        </TooltipGroup>
        <div aria-hidden className="mt-6 space-y-2.5 px-1">
          <div className="h-2.5 w-3/5 rounded-full bg-muted-foreground/25" />
          <div className="h-2 w-full rounded-full bg-muted-foreground/15" />
          <div className="h-2 w-11/12 rounded-full bg-muted-foreground/15" />
          <div className="h-2 w-4/5 rounded-full bg-muted-foreground/15" />
        </div>
      </div>
    </div>
  )
}
