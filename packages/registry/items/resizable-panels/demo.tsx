import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelGroupProps } from './resizable-panels'

type DemoProps = ResizablePanelGroupProps & { layout?: string }

const START: Record<string, number[]> = { nested: [30, 70], three: [25, 50, 25], two: [32, 68] }
const PERIOD = 8

function ease(x: number) {
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2
}

/** 自动播放：悬停把手 → 拖宽 → 拖窄 → 回到原位。 */
function scripted(time: number, base: number[]) {
  const t = time % PERIOD
  const first = base[0]!
  let offset = 0
  let state: 'hover' | 'drag' | null = null
  if (t >= 0.8 && t < 1.4) state = 'hover'
  else if (t >= 1.4 && t < 5.4) {
    state = 'drag'
    const p = (t - 1.4) / 4
    offset = p < 0.4 ? 14 * ease(p / 0.4) : p < 0.8 ? 14 - 26 * ease((p - 0.4) / 0.4) : -12 + 12 * ease((p - 0.8) / 0.2)
  } else if (t >= 5.4 && t < 6) state = 'hover'
  const sizes = base.slice()
  sizes[0] = first + offset
  sizes[1] = base[1]! - offset
  return { sizes, force: state ? { index: 0, state } : null }
}

function Label({ children, meta }: { children: ReactNode; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
      <span className="truncate text-xs font-semibold tracking-wide">{children}</span>
      {meta && <span className="shrink-0 text-[11px] text-muted-foreground">{meta}</span>}
    </div>
  )
}

function Lines({ widths }: { widths: number[] }) {
  return (
    <div className="space-y-2.5 p-4">
      {widths.map((w, i) => (
        <div key={i} className="h-2 rounded-full bg-muted-foreground/15" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

const FILES = ['app.tsx', 'layout.tsx', 'routes.ts', 'theme.css', 'utils.ts']
const MAIL = [
  { from: 'Ines Okafor', subject: 'Q3 roadmap review' },
  { from: 'Build bot', subject: 'Deploy #482 passed' },
  { from: 'Theo Marsh', subject: 'Re: onboarding copy' },
  { from: 'Linnea Berg', subject: 'Invoice for October' },
]

function FileList() {
  return (
    <div className="h-full">
      <Label meta="5">Files</Label>
      <ul className="space-y-0.5 p-2">
        {FILES.map((f, i) => (
          <li key={f} className={`truncate rounded-md px-2 py-1.5 text-xs ${i === 0 ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Editor() {
  return (
    <div className="h-full">
      <Label meta="TSX">app.tsx</Label>
      <div className="flex">
        <div className="space-y-2.5 py-4 pl-4 font-mono text-[10px] leading-2 text-muted-foreground/60">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <Lines widths={[62, 80, 44, 70, 36, 56]} />
        </div>
      </div>
    </div>
  )
}

export function Demo({ layout = 'nested', ...props }: DemoProps) {
  const host = useRef<HTMLDivElement>(null)
  const base = START[layout] ?? START.nested!
  const [auto, setAuto] = useState(() => scripted(0, base))
  const [manual, setManual] = useState<{ layout: string; sizes: number[] } | null>(null)
  const isManual = manual?.layout === layout

  useFrameLoop(
    host,
    ({ time }) => {
      if (isManual) return
      setAuto(scripted(time, base))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const outer = {
    ...props,
    sizes: isManual ? manual.sizes : auto.sizes.length === base.length ? auto.sizes : base,
    forceHandle: isManual ? null : auto.force,
    onSizesChange: (sizes: number[]) => setManual({ layout, sizes }),
  }

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="h-[min(340px,80%)] w-full max-w-2xl">
        {layout === 'two' ? (
          <ResizablePanelGroup key="two" {...outer} className="border bg-card/60">
            <ResizablePanel defaultSize={32}>
              <Label meta="12">Inbox</Label>
              <ul className="divide-y divide-border/60">
                {MAIL.map((m, i) => (
                  <li key={m.subject} className={`px-4 py-2.5 ${i === 0 ? 'bg-muted/60' : ''}`}>
                    <div className="truncate text-xs font-medium">{m.from}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.subject}</div>
                  </li>
                ))}
              </ul>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={68}>
              <Label meta="09:41">Q3 roadmap review</Label>
              <Lines widths={[90, 84, 70, 0, 88, 76, 52]} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : layout === 'three' ? (
          <ResizablePanelGroup key="three" {...outer} className="border bg-card/60">
            <ResizablePanel defaultSize={25}>
              <FileList />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
              <Editor />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <Label>Preview</Label>
              <div className="p-4">
                <div className="aspect-4/3 rounded-lg border bg-[linear-gradient(135deg,var(--color-muted),transparent)]" />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup key="nested" {...outer} className="border bg-card/60">
            <ResizablePanel defaultSize={30}>
              <FileList />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={68}>
                  <Editor />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={32}>
                  <Label meta="zsh">Terminal</Label>
                  <div className="space-y-1 p-4 font-mono text-[11px] text-muted-foreground">
                    <div className="truncate">$ pnpm dev</div>
                    <div className="truncate">ready on :3000 in 412ms</div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  )
}
