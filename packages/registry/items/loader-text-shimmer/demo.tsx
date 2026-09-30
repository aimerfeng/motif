import { LoaderTextShimmer, type LoaderTextShimmerProps } from './loader-text-shimmer'

const STEPS = [
  { label: 'Read 12 documents', state: 'done' },
  { label: 'Compare pricing tiers', state: 'active' },
  { label: 'Draft the summary', state: 'todo' },
] as const

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export function Demo(props: LoaderTextShimmerProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div>
          <LoaderTextShimmer {...props} />
        </div>
        <ul className="mt-5 space-y-2.5 border-t pt-5 text-sm">
          {STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-2.5">
              <span
                className={
                  step.state === 'done'
                    ? 'grid size-5 place-items-center rounded-full bg-primary/15 text-primary'
                    : step.state === 'active'
                      ? 'grid size-5 place-items-center rounded-full border border-primary/50'
                      : 'grid size-5 place-items-center rounded-full border border-dashed border-border'
                }
              >
                {step.state === 'done' && <Check />}
                {step.state === 'active' && <span className="size-1.5 rounded-full bg-primary" />}
              </span>
              <span className={step.state === 'todo' ? 'text-muted-foreground/60' : step.state === 'done' ? 'text-muted-foreground' : 'text-foreground'}>{step.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
