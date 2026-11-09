import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DialogShortcutsCheatsheet, Kbd, defaults, type DialogShortcutsCheatsheetProps } from './dialog-shortcuts-cheatsheet'

const TYPED = 'do'

/** 8 秒一轮：0.6s 打开 -> 停留 -> 逐字输入筛选词 -> 清空 -> 关闭。 */
function scripted(time: number) {
  const t = time % 8
  if (t < 0.6 || t > 7.4) return { open: false, chars: 0 }
  if (t > 6.2) return { open: true, chars: 0 }
  const chars = Math.max(0, Math.min(TYPED.length, Math.floor((t - 3.2) / 0.18) + 1))
  return { open: true, chars }
}

export function Demo(props: DialogShortcutsCheatsheetProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState({ open: false, chars: 0 })
  const [manual, setManual] = useState<{ open: boolean; query: string } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.open === next.open && prev.chars === next.chars ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )

  const open = manual ? manual.open : auto.open
  const query = manual ? manual.query : TYPED.slice(0, auto.chars)
  const keycapStyle = props.keycapStyle ?? defaults.keycapStyle

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <div className="mx-auto flex h-full max-w-2xl flex-col gap-3 px-6 py-8">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <span className="truncate font-mono text-xs text-muted-foreground">notes / release-plan.md</span>
          <button
            type="button"
            onClick={() => setManual({ open: true, query: '' })}
            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-[background-color] duration-150 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Shortcuts <Kbd keycapStyle={keycapStyle}>?</Kbd>
          </button>
        </div>
        <div className="space-y-2 font-mono text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground"># Release 2.4</p>
          <p>- Ship offline sync behind a flag</p>
          <p>- Migrate 1,280 workspaces to the new storage</p>
          <p>- Draft the changelog with Mira by Thursday</p>
        </div>
      </div>
      <DialogShortcutsCheatsheet
        {...props}
        contained
        open={open}
        query={query}
        onQueryChange={(q) => setManual({ open: true, query: q })}
        onOpenChange={(o) => setManual({ open: o, query: '' })}
      />
    </div>
  )
}
