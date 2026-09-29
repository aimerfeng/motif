import { BorderBeam, type BorderBeamProps } from './border-beam'

export function Demo(props: BorderBeamProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">Motif Pro</p>
            <p className="text-xs text-muted-foreground">Unlock every effect</p>
          </div>
        </div>
        <p className="mt-6 text-3xl font-semibold tracking-tight text-card-foreground">
          $12<span className="text-base font-normal text-muted-foreground"> / month</span>
        </p>
        <button type="button" className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          Get started
        </button>
        <BorderBeam {...props} />
      </div>
    </div>
  )
}
