import { cn } from '@motif/runtime'
import { useRef, type ReactNode, type Ref } from 'react'
import { AnimatedBeam, type AnimatedBeamProps } from './animated-beam'

function Node({ ref, className, children, label }: { ref?: Ref<HTMLDivElement>; className?: string; children: ReactNode; label: string }) {
  return (
    <div ref={ref} role="img" aria-label={label} className={cn('z-10 grid size-12 place-items-center rounded-full border bg-card text-card-foreground shadow-lg shadow-black/30', className)}>
      {children}
    </div>
  )
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

export function Demo(props: Omit<AnimatedBeamProps, 'containerRef' | 'fromRef' | 'toRef'>) {
  const container = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)
  const c = useRef<HTMLDivElement>(null)
  const d = useRef<HTMLDivElement>(null)
  const e = useRef<HTMLDivElement>(null)
  const f = useRef<HTMLDivElement>(null)

  const beam = (key: string, from: typeof a, to: typeof a) => <AnimatedBeam key={key} {...props} containerRef={container} fromRef={from} toRef={to} />

  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div ref={container} className="relative flex h-72 w-full max-w-md items-center justify-between">
        <div className="flex h-full flex-col justify-between py-1">
          <Node ref={a} label="Database">
            <Icon>
              <ellipse cx="12" cy="6.5" rx="6.5" ry="2.8" />
              <path d="M5.5 6.5v11c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-11M5.5 12c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8" />
            </Icon>
          </Node>
          <Node ref={b} label="Documents">
            <Icon>
              <path d="M7 3.5h6.5L18 8v12a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
              <path d="M13 3.5V8h5M9.5 13h5M9.5 16h5" />
            </Icon>
          </Node>
          <Node ref={c} label="Messages">
            <Icon>
              <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4 3.5V16h-.5A1.5 1.5 0 0 1 5 14.5z" />
            </Icon>
          </Node>
        </div>
        <Node ref={hub} label="Hub" className="size-16 border-primary/40 bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4.5 19 8.5v7L12 19.5 5 15.5v-7z" />
            <path d="M12 4.5v15M5 8.5l14 7M19 8.5l-14 7" opacity=".55" />
          </svg>
        </Node>
        <div className="flex h-full flex-col justify-between py-1">
          <Node ref={d} label="Alerts">
            <Icon>
              <path d="M7 16.5V11a5 5 0 0 1 10 0v5.5l1.5 1.5h-13z" />
              <path d="M10 20.5a2 2 0 0 0 4 0" />
            </Icon>
          </Node>
          <Node ref={e} label="Reports">
            <Icon>
              <path d="M5 19.5V5M5 19.5h14.5" />
              <path d="m8.5 15 3-4 3 2.5 4-6" />
            </Icon>
          </Node>
          <Node ref={f} label="Calendar">
            <Icon>
              <rect x="4.5" y="5.5" width="15" height="14" rx="2" />
              <path d="M4.5 10h15M8.5 3.5v3M15.5 3.5v3" />
            </Icon>
          </Node>
        </div>
        {[
          ['a', a, hub],
          ['b', b, hub],
          ['c', c, hub],
          ['d', hub, d],
          ['e', hub, e],
          ['f', hub, f],
        ].map(([key, from, to]) => beam(key as string, from as typeof a, to as typeof a))}
      </div>
    </div>
  )
}
