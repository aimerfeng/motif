import { useState, type ReactNode } from 'react'
import { Alert, Button, defaults, HazardStripe, INK, Input, Lamp, Meter, palettes, Panel, PanelDescription, PanelTitle, StyleIndustrial, Switch, Tag, type StyleIndustrialProps, type TagProps } from './style-industrial'

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" aria-hidden>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

/** 虚构品牌的标志：一颗六角螺母。 */
const Mark = () => (
  <span className="grid size-10 flex-none place-items-center border-2 border-[var(--ind-ink)] bg-[var(--ind-hazard)] text-[var(--ind-hazard-fg)]" style={{ borderRadius: 'var(--r-sm)', boxShadow: 'var(--hard)' }}>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.6 20.2 7.3v9.4L12 21.4l-8.2-4.7V7.3Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  </span>
)

function Section({ n, label, title, children }: { n: string; label: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="flex items-center gap-3">
        <Tag tone="ink">{n}</Tag>
        <span className="ind-label">{label}</span>
        <span aria-hidden className="h-0.5 min-w-6 flex-1 bg-[var(--ind-edge)]" />
      </div>
      <h2 className="ind-display mt-5 text-3xl sm:text-5xl">{title}</h2>
      <div className="mt-9">{children}</div>
    </section>
  )
}

const scale = [
  { name: 'Display', cls: 'ind-display text-5xl sm:text-6xl', sample: 'Lift plan 04-B' },
  { name: 'Title', cls: 'ind-display text-3xl', sample: 'Rigging & slinging' },
  { name: 'Body', cls: 'text-base ind-sub max-w-xl', sample: 'Body copy is IBM Plex Sans at 15 to 17px. It explains the job; the labels and numbers do the shouting.' },
  { name: 'Label', cls: 'ind-label', sample: 'SWL 25 t · Cert 2026-118' },
  { name: 'Value', cls: 'ind-mono text-3xl font-bold', sample: '18.4 t' },
]

const orders: { wo: string; job: string; crew: string; when: string; tone: TagProps['tone']; status: string }[] = [
  { wo: 'WO-2291', job: 'Transformer set, Pier 2', crew: 'Okafor, Lind', when: 'Today 07:00', tone: 'ok', status: 'Complete' },
  { wo: 'WO-2294', job: 'Roof trusses, Hall C', crew: 'Marsh, Duarte', when: 'Today 11:30', tone: 'hazard', status: 'On hook' },
  { wo: 'WO-2297', job: 'Generator swap, Quay 6', crew: 'Petrov', when: 'Tomorrow 06:00', tone: 'steel', status: 'Planned' },
  { wo: 'WO-2301', job: 'Hull lift, Marina 1', crew: 'Unassigned', when: 'Thu 09:00', tone: 'danger', status: 'Wind hold' },
]

const crew = [
  { initials: 'AO', name: 'Ada Okafor', role: 'Crane operator', on: true },
  { initials: 'TL', name: 'Tomas Lind', role: 'Rigger, slinger', on: true },
  { initials: 'RM', name: 'Rae Marsh', role: 'Banksman', on: true },
  { initials: 'IP', name: 'Ivan Petrov', role: 'Lift supervisor', on: false },
]

export function Demo(props: StyleIndustrialProps) {
  const [banksman, setBanksman] = useState(true)
  const [lighting, setLighting] = useState(false)
  const tone = props.steelTone === 'dark' ? 'dark' : 'light'
  const p = palettes[tone]
  const hazard = props.hazardColor ?? defaults.hazardColor

  const swatches = [
    { name: 'Hazard', v: 'var(--ind-hazard)', hex: hazard },
    { name: 'Ink', v: INK, hex: INK },
    { name: 'Steel', v: p.primary, hex: p.primary },
    { name: 'Plate', v: p.card, hex: p.card },
    { name: 'Ground', v: p.background, hex: p.background },
    { name: 'Rail', v: p.secondary, hex: p.secondary },
    { name: 'Teal steel', v: p.teal, hex: p.teal },
    { name: 'Alarm', v: p.destructive, hex: p.destructive },
  ]

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleIndustrial {...props}>
        <HazardStripe height={10} edge />
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Mark />
            <span className="ind-display truncate text-lg sm:text-xl">Ferrow Yard</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {['Fleet', 'Lift plans', 'Depots', 'Safety'].map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>
          <Button variant="outline" size="sm">
            Dispatch
          </Button>
        </header>

        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Tag tone="hazard">Depot 3</Tag>
              <span className="ind-label">Open 05:30 to 22:00, 7 days</span>
            </div>
            <h1 className="ind-display mt-6 text-[2.5rem] sm:text-6xl lg:text-7xl">Heavy lifts, logged to the bolt.</h1>
            <p className="ind-sub mt-6 max-w-lg text-[17px]">Ferrow Yard hires out mobile cranes, flatbeds and certified riggers across the north harbour. Every lift gets a written plan, a load chart and a sign-off before the hook moves.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="hazard" size="lg">
                Book a lift <Arrow />
              </Button>
              <Button variant="steel" size="lg">
                Load charts
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                ['412', 'Lifts this quarter'],
                ['0', 'Lost-time incidents'],
                ['60 t', 'Heaviest rated'],
              ].map(([value, label]) => (
                <div key={label} className="flex min-w-0 flex-col border-l-2 border-[var(--ind-edge)] pl-3">
                  <dt className="ind-label order-2 mt-1.5 text-[10px] tracking-[.1em]">{label}</dt>
                  <dd className="ind-mono order-1 m-0 text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Panel className="grid min-w-0 gap-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Lamp />
                <span className="ind-label">Bay 04 · Live</span>
              </div>
              <Tag tone="ok">Inspected</Tag>
            </div>
            <div>
              <PanelTitle className="text-xl">Unit 07 · MC-60 mobile crane</PanelTitle>
              <PanelDescription>Operator A. Okafor · Lift plan 04-B · Signed 06:42</PanelDescription>
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="ind-label">Load on hook</span>
                <span className="ind-mono text-sm font-bold">18.4 / 25.0 t</span>
              </div>
              <Meter label="Load on hook" value={18.4} max={25} running />
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="ind-label">Wind at jib head</span>
                <span className="ind-mono text-sm font-bold">6.2 / 9.8 m/s</span>
              </div>
              <Meter label="Wind at jib head" value={6.2} max={9.8} solid />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Boom angle', '62°'],
                ['Radius', '14.0 m'],
              ].map(([label, value]) => (
                <div key={label} className="border border-[var(--ind-border)] bg-[var(--well)] px-3 py-2.5" style={{ borderRadius: 'var(--r-sm)' }}>
                  <p className="ind-label m-0">{label}</p>
                  <p className="ind-mono m-0 mt-1 text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <Alert title="Exclusion zone active">12 m radius around Bay 04 until 14:30.</Alert>
          </Panel>
        </div>

        <HazardStripe height={14} edge />

        <Section n="01" label="Palette" title="Graphite steel, one hazard colour">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {swatches.map((s) => (
              <Panel key={s.name} className="overflow-hidden p-0">
                <div className="h-20 border-b border-[var(--ind-edge)]" style={{ background: s.v }} />
                <div className="px-4 py-3">
                  <p className="m-0 text-sm font-semibold">{s.name}</p>
                  <p className="ind-mono ind-sub m-0 text-xs uppercase">{s.hex}</p>
                </div>
              </Panel>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <HazardStripe height={28} edge className="rounded-[var(--r-sm)]" />
            <p className="ind-label m-0">Stripes: hazard + ink, one angle, edges only</p>
          </div>
        </Section>

        <Section n="02" label="Type" title="Stamped, stencilled, legible">
          <Panel className="grid gap-6 sm:p-8">
            {scale.map((row) => (
              <div key={row.name} className="grid min-w-0 items-baseline gap-1.5 sm:grid-cols-[110px_1fr] sm:gap-6">
                <p className="ind-label m-0">{row.name}</p>
                <p className={'m-0 min-w-0 break-words ' + row.cls}>{row.sample}</p>
              </div>
            ))}
          </Panel>
        </Section>

        <Section n="03" label="Components" title="Built to take a knock">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel className="grid content-start gap-5">
              <div>
                <PanelTitle>Buttons</PanelTitle>
                <PanelDescription>Press one: it drops onto its shadow.</PanelDescription>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="hazard">Book a lift</Button>
                <Button variant="steel">Load chart</Button>
                <Button>Save draft</Button>
                <Button variant="outline">Print</Button>
                <Button variant="ghost">Cancel</Button>
                <Button variant="danger">Stop work</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg" variant="hazard">
                  Large
                </Button>
              </div>
            </Panel>

            <Panel className="grid content-start gap-4">
              <div>
                <PanelTitle>Lift request</PanelTitle>
                <PanelDescription>Values are mono; units sit in their own block.</PanelDescription>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Load weight" unit="t" defaultValue="18.4" inputMode="decimal" />
                <Input label="Site reference" placeholder="NH-BAY-04" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-semibold">Banksman on site</p>
                  <p className="ind-sub m-0 text-xs">Required for blind lifts</p>
                </div>
                <Switch checked={banksman} onCheckedChange={setBanksman} aria-label="Banksman on site" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-semibold">Night lighting</p>
                  <p className="ind-sub m-0 text-xs">Tower lights on after 18:00</p>
                </div>
                <Switch checked={lighting} onCheckedChange={setLighting} aria-label="Night lighting" />
              </div>
            </Panel>

            <Panel className="grid content-start gap-5">
              <div>
                <PanelTitle>Tags and lamps</PanelTitle>
                <PanelDescription>Punched like a luggage tag, hung with a hard shadow.</PanelDescription>
              </div>
              <div className="flex flex-wrap gap-x-3.5 gap-y-3">
                <Tag>Draft</Tag>
                <Tag tone="hazard">Caution</Tag>
                <Tag tone="steel">Spec 7</Tag>
                <Tag tone="ok">Inspected</Tag>
                <Tag tone="danger">Out of service</Tag>
                <Tag tone="ink">LOTO</Tag>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  ['Running', 'var(--ind-teal)'],
                  ['Idle', 'var(--ind-hazard)'],
                  ['Fault', 'var(--ind-destructive)'],
                ].map(([label, color]) => (
                  <span key={label} className="flex items-center gap-2.5">
                    <Lamp color={color} />
                    <span className="ind-label">{label}</span>
                  </span>
                ))}
              </div>
              <div className="grid gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="ind-label">Job progress</span>
                  <span className="ind-mono text-sm font-bold">48%</span>
                </div>
                <Meter label="Job progress" value={48} running />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="ind-label">Fuel</span>
                  <span className="ind-mono text-sm font-bold">62%</span>
                </div>
                <Meter label="Fuel" value={62} solid />
              </div>
            </Panel>

            <div className="grid content-start gap-5">
              <Alert title="Wind near limit">Gusts at 9.1 m/s. Lower the boom before 15:00.</Alert>
              <Alert tone="danger" title="Sling S-14 tagged out">Cut strand found at inspection. Do not use.</Alert>
              <Alert tone="info" title="Inspection due">Unit 07 thorough examination on 21 November.</Alert>
            </div>
          </div>
        </Section>

        <Section n="04" label="In use" title="Today on the yard">
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <Panel className="min-w-0 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PanelTitle>Work orders</PanelTitle>
                <Button size="sm" variant="hazard">
                  New order
                </Button>
              </div>
              <ul className="m-0 mt-5 grid list-none gap-0 p-0">
                {orders.map((o) => (
                  <li key={o.wo} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--ind-border)] py-4 first:border-t-0">
                    <span className="ind-mono w-[72px] flex-none text-sm font-bold">{o.wo}</span>
                    <div className="min-w-0 flex-1 basis-[150px]">
                      <p className="m-0 truncate text-sm font-semibold">{o.job}</p>
                      <p className="ind-sub m-0 text-xs">
                        {o.crew} · {o.when}
                      </p>
                    </div>
                    <Tag tone={o.tone}>{o.status}</Tag>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel className="min-w-0 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <PanelTitle>Shift board</PanelTitle>
                <span className="ind-label">Day shift</span>
              </div>
              <ul className="m-0 mt-5 grid list-none gap-4 p-0">
                {crew.map((c) => (
                  <li key={c.name} className="flex items-center gap-3.5">
                    <span className="ind-mono grid size-10 flex-none place-items-center border-2 border-[var(--ind-edge)] bg-[var(--ind-secondary)] text-sm font-bold" style={{ borderRadius: 'var(--r-sm)' }}>
                      {c.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold">{c.name}</p>
                      <p className="ind-sub m-0 text-xs">{c.role}</p>
                    </div>
                    <span className="flex items-center gap-2">
                      <Lamp color={c.on ? 'var(--ind-teal)' : 'var(--ind-accent)'} />
                      <span className="ind-label">{c.on ? 'On' : 'Off'}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="ind-label">Hours logged</span>
                  <span className="ind-mono text-sm font-bold">26 / 40 h</span>
                </div>
                <Meter label="Hours logged" value={26} max={40} solid />
              </div>
            </Panel>
          </div>
        </Section>

        <footer className="mt-4">
          <HazardStripe height={12} edge />
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-8">
            <div className="flex items-center gap-3">
              <Mark />
              <span className="ind-display text-lg">Ferrow Yard</span>
            </div>
            <span className="ind-sub text-sm">Yard 3, Pier Road, North Harbour</span>
            <span className="ind-label">Est. 1987</span>
          </div>
        </footer>
      </StyleIndustrial>
    </div>
  )
}
