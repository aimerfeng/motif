import { LoaderPathTrace, type LoaderPathTraceProps } from './loader-path-trace'

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  )
}

function QueuedIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="2.2 2.4" aria-hidden>
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  )
}

export function Demo(props: LoaderPathTraceProps) {
  const color = props.color ?? '#38bdf8'
  // 行内用法：小尺寸、细线，和正文一起排。
  const inline = { ...props, size: 16, stroke: Math.min(props.stroke ?? 4, 2.25) }
  // 卡片顶部的主角：按参数尺寸线性放大 1.6 倍，整个 16-96 范围都有变化；最大时（154px）也放得进卡片。
  const hero = Math.round((props.size ?? 44) * 1.6)

  return (
    <div className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex min-h-16 items-center justify-center">
          <LoaderPathTrace {...props} size={hero} label="Deployment in progress" />
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-card-foreground">Deploying to staging</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-mono">checkout-v2 · 8e41c0a</span> · started 42 s ago
          </p>
        </div>

        <ol className="mt-5 divide-y divide-border rounded-xl border bg-background/40 text-[13px]">
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="grid w-6 shrink-0 place-items-center text-muted-foreground">
              <CheckIcon />
            </span>
            <span className="flex-1 text-muted-foreground">Installed 312 packages</span>
            <span className="text-xs tabular-nums text-muted-foreground">11.8 s</span>
          </li>
          <li className="flex items-center gap-3 px-3.5 py-2.5" aria-current="step">
            <span className="grid w-6 shrink-0 place-items-center">
              <LoaderPathTrace {...inline} label="Build in progress" />
            </span>
            <span className="flex-1 text-card-foreground">Building 418 modules</span>
            <span className="text-xs font-medium" style={{ color }} aria-hidden>
              Running
            </span>
          </li>
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="grid w-6 shrink-0 place-items-center text-muted-foreground/60">
              <QueuedIcon />
            </span>
            <span className="flex-1 text-muted-foreground/80">Upload static assets</span>
            <span className="text-xs text-muted-foreground/70">Queued</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
