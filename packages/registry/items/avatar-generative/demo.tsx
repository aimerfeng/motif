import { AvatarGenerative, type AvatarGenerativeProps } from './avatar-generative'

const AGENTS = [
  { seed: 'triage-bot', name: 'Triage', role: 'Sorts new issues', status: 'Running' },
  { seed: 'release-scribe', name: 'Scribe', role: 'Drafts release notes', status: 'Idle' },
  { seed: 'ledger-audit', name: 'Ledger', role: 'Reconciles invoices', status: 'Running' },
]

export function Demo(props: AvatarGenerativeProps) {
  const size = props.size ?? 64
  return (
    <div className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[380px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-4">
          <AvatarGenerative {...props} className="shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{props.seed ?? 'atlas-agent'}</div>
            <div className="text-xs text-muted-foreground">Agent · same seed, same face</div>
          </div>
        </div>
        <div className="mt-5 divide-y divide-border/70">
          {AGENTS.map((a) => (
            <div key={a.seed} className="flex items-center gap-3 py-3 last:pb-0">
              <AvatarGenerative {...props} seed={a.seed} size={Math.round(Math.min(40, size * 0.6))} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.name}</div>
                <div className="truncate text-xs text-muted-foreground">{a.role}</div>
              </div>
              <span className="text-xs text-muted-foreground">{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
