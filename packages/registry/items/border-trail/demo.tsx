import { BorderTrail, type BorderTrailProps } from './border-trail'

export function Demo(props: BorderTrailProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-4 shadow-2xl shadow-black/40">
        <p className="px-1 text-sm leading-relaxed text-muted-foreground">
          <span className="text-card-foreground">Summarize the launch notes</span> from this week into three bullets for the changelog, and flag anything customers need to act on.
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {['Attach', 'Web search'].map((label) => (
              <span key={label} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
            Send
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <BorderTrail {...props} />
      </div>
    </div>
  )
}
