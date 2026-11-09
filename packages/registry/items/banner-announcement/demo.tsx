import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AnnouncementBar, type AnnouncementBarProps } from './banner-announcement'

const LOOP = 4

const NOTES = [
  { tag: 'Added', text: 'Webhook retries now back off up to six attempts over 24 hours.' },
  { tag: 'Improved', text: 'Bulk export of invoices is about three times faster.' },
  { tag: 'Fixed', text: 'Timezone offsets on scheduled reports during DST changes.' },
]

export function Demo(props: AnnouncementBarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState({ nudge: false, updating: false })
  // 演示里没有真实指针：按帧时钟周期性推箭头、切换「更新中」状态。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % LOOP
      const next = { nudge: t % 2 > 1, updating: t > 1.5 && t < 3.5 }
      setPhase((p) => (p.nudge === next.nudge && p.updating === next.updating ? p : next))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <AnnouncementBar {...props} nudge={phase.nudge} updating={props.variant === 'update' ? phase.updating : undefined} />
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <rect width="20" height="20" rx="5" fill="currentColor" opacity="0.9" />
            <path d="M6 14V6l8 8V6" fill="none" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Northwind
        </div>
        <nav className="flex gap-4 text-muted-foreground text-sm" aria-label="Main">
          <span>Docs</span>
          <span className="max-sm:hidden">Pricing</span>
          <span className="text-foreground">Changelog</span>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">March 2026</p>
        <h1 className="mt-2 font-semibold text-2xl tracking-tight">Changelog</h1>
        <div className="mt-8 space-y-6">
          {[0, 1].map((week) => (
            <section key={week} className="rounded-lg border p-5">
              <h2 className="font-medium text-sm">{week === 0 ? 'v2.1.0 · Mar 18' : 'v2.0.4 · Mar 6'}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {NOTES.map((n) => (
                  <li key={n.tag} className="flex gap-3">
                    <span className="w-16 shrink-0 text-muted-foreground">{n.tag}</span>
                    <span>{n.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <div className="border-t">
        <AnnouncementBar {...props} variant="update" dismissible={false} align="center" badgeLabel="" message="New features and improvements available" updating={phase.updating} />
      </div>
    </div>
  )
}
