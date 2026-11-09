import { PresenceCursors, type PresenceCursorsProps } from './presence-cursors'

const AVATARS = [
  { initials: 'MI', tint: 'linear-gradient(135deg, #34d399, #059669)' },
  { initials: 'TH', tint: 'linear-gradient(135deg, #fb7185, #e11d48)' },
  { initials: 'JU', tint: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
]

export function Demo(props: PresenceCursorsProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span className="truncate font-medium">Onboarding v2</span>
          <span className="hidden text-muted-foreground sm:inline">/ Flows</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {AVATARS.map((a) => (
              <span key={a.initials} className="grid size-7 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-background" style={{ background: a.tint }}>
                {a.initials}
              </span>
            ))}
          </div>
          <button type="button" className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            Share
          </button>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-5 p-6">
          {['Welcome', 'Pick a workspace', 'Invite team'].map((label, i) => (
            <div key={label} className="w-40 rounded-xl border bg-card p-3 shadow-lg shadow-black/30">
              <div className="mb-3 h-20 rounded-lg bg-muted" style={{ opacity: 1 - i * 0.15 }} />
              <p className="text-xs font-medium text-card-foreground">{label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Step {i + 1} of 3</p>
            </div>
          ))}
        </div>
        <PresenceCursors {...props} />
      </div>
    </div>
  )
}
