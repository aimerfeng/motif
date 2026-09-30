import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Horizon, Input, StyleSynthwave, Switch, Tabs, type StyleSynthwaveProps, type Theme } from './style-synthwave'

const Icon = ({ d, size = 18, fill }: { d: string; size?: number; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <p className="sw-eyebrow">{eyebrow}</p>
      <h2 className="sw-display mt-3 text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

const bars = [38, 62, 46, 84, 58, 92, 50, 74, 42, 66, 88, 54, 36, 70, 48, 80]

const scale = [
  { name: 'Display', cls: 'sw-display sw-chrome text-6xl', sample: 'Midnight run' },
  { name: 'Title', cls: 'sw-display text-4xl', sample: 'Chrome and neon' },
  { name: 'Heading', cls: 'sw-display text-2xl', sample: 'Set in caps, tracked tight' },
  { name: 'Body', cls: 'text-base sw-dim', sample: 'Body copy stays plain and quiet so the glow has something to shine against.' },
  { name: 'Label', cls: 'sw-mono text-xs sw-dim uppercase tracking-[0.2em]', sample: 'Mono / 12 px / tracked out' },
]

const shows = [
  { day: '03', mon: 'OCT', name: 'Neon Harbor', city: 'Rotterdam', tag: 'On sale', tone: 'success' as const },
  { day: '11', mon: 'OCT', name: 'Chrome Sunday', city: 'Berlin', tag: 'Low stock', tone: 'warning' as const },
  { day: '19', mon: 'OCT', name: 'Afterglow Live', city: 'Lisbon', tag: 'Sold out', tone: 'danger' as const },
  { day: '02', mon: 'NOV', name: 'Night Drive Club', city: 'Warsaw', tag: 'On sale', tone: 'success' as const },
]

export function Demo(props: StyleSynthwaveProps) {
  const theme = (props.theme ?? 'synthwave') as Theme
  const [tab, setTab] = useState('live')
  const [loud, setLoud] = useState(true)
  const [gapless, setGapless] = useState(true)
  const swatches: [string, string][] = [
    ['Primary', 'var(--sw-primary)'],
    ['Secondary', 'var(--sw-secondary)'],
    ['Tertiary', 'var(--sw-tertiary)'],
    ['Content', 'var(--sw-content)'],
    ['Base 300', 'var(--sw-base300)'],
    ['Base 200', 'var(--sw-base200)'],
    ['Base 100', 'var(--sw-base100)'],
    ['Neutral', 'var(--sw-neutral)'],
  ]

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleSynthwave {...props}>
        <div className="relative overflow-hidden">
          <Horizon horizon={theme === 'synthwave' ? 24 : 0} sunX={70} />
          <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:px-8">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full border-2 border-[var(--sw-primary)] text-[var(--sw-primary)]" style={{ boxShadow: '0 0 calc(16px*var(--g)) color-mix(in oklab, var(--sw-primary) 60%, transparent)' }}>
                <Icon d="M3 12h3l2-6 4 12 3-9 2 3h4" size={18} />
              </span>
              <span className="sw-display text-xl tracking-wide">Afterglow</span>
            </div>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              {['Stations', 'Shows', 'Merch', 'About'].map((item) => (
                <Button key={item} variant="ghost" size="sm">
                  {item}
                </Button>
              ))}
            </nav>
            <Button variant="primary" size="sm">
              Listen live
            </Button>
          </header>

          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-36 pt-14 sm:px-8 lg:min-h-[560px] lg:grid-cols-[1.1fr_1fr] lg:pb-44 lg:pt-16">
            <div>
              <div className="flex items-center gap-3">
                <Badge tone="danger">Live</Badge>
                <span className="sw-eyebrow">24/7 synth-pop radio</span>
              </div>
              <h1 className="sw-display sw-chrome mt-6 text-6xl sm:text-7xl lg:text-8xl">
                Drive
                <br />
                all night
              </h1>
              <p className="sw-dim mt-6 max-w-md text-lg">Four channels of new wave, italo and outrun from independent labels. No ads, no algorithm, only a long road and a full tank.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button variant="primary" size="lg">
                  <Icon d="M8 5.5v13l11-6.5z" size={16} fill />
                  Play channel one
                </Button>
                <Button size="lg">Browse shows</Button>
              </div>
            </div>

            <Card className="mx-auto w-full max-w-[360px] lg:ml-auto">
              <div className="flex items-center justify-between">
                <span className="sw-eyebrow">Ch. 01 / Outrun</span>
                <Badge tone="cyan">320 kbps</Badge>
              </div>
              <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[var(--r-sm)] border border-[color-mix(in_oklab,var(--sw-primary)_50%,transparent)]" style={{ background: 'linear-gradient(180deg, color-mix(in oklab, var(--sw-base100) 60%, #000), var(--sw-base200))' }}>
                <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-[3px] px-3 pb-3">
                  {bars.map((h, i) => (
                    <span key={i} className="flex-1 rounded-[1px]" style={{ height: `${h}%`, background: `linear-gradient(180deg, var(--sw-secondary), var(--sw-primary))`, boxShadow: '0 0 calc(8px*var(--g)) color-mix(in oklab, var(--sw-primary) 70%, transparent)', opacity: 0.55 + (h / 100) * 0.45 }} />
                  ))}
                </div>
              </div>
              <p className="sw-display mt-4 text-xl">Midnight Signal</p>
              <p className="sw-dim text-sm">Kaleidoscope Motel &middot; Tape Loop EP</p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--sw-content)_20%,transparent)]">
                <div className="h-full w-[38%] rounded-full bg-[var(--sw-primary)]" style={{ boxShadow: '0 0 calc(10px*var(--g)) var(--sw-primary)' }} />
              </div>
              <div className="sw-mono sw-dim mt-2 flex justify-between text-[11px]">
                <span>01:24</span>
                <span>-02:19</span>
              </div>
            </Card>
          </div>
        </div>

        <Section eyebrow="01 / Palette" title={theme === 'synthwave' ? 'Indigo night, hot pink, cyan' : 'Yellow, ink and hot pink'}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map(([name, v]) => (
              <div key={name}>
                <div className="h-20 rounded-[var(--r-sm)] border border-[color-mix(in_oklab,var(--sw-content)_25%,transparent)]" style={{ background: v, boxShadow: '0 0 calc(24px*var(--g)) color-mix(in oklab, ' + v + ' 45%, transparent)' }} />
                <p className="sw-display mt-3 text-sm">{name}</p>
                <p className="sw-mono sw-dim text-[11px]">{v.replace('var(', '').replace(')', '')}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 / Type" title="Caps, wide and glowing">
          <Card className="grid gap-5 p-7">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-1 border-b border-[color-mix(in_oklab,var(--sw-content)_14%,transparent)] pb-5 last:border-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-6">
                <p className="sw-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section eyebrow="03 / Components" title="Every edge is lit">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="grid gap-5">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Outlined by default, solid for the one main action.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Buy tickets</Button>
                <Button>Details</Button>
                <Button variant="ghost">Later</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg" variant="primary">
                  Large
                </Button>
              </div>
            </Card>
            <Card className="grid gap-4">
              <div>
                <CardTitle>Form</CardTitle>
                <CardDescription>Mono inputs that light up on focus.</CardDescription>
              </div>
              <Input label="Callsign" placeholder="NIGHT_OWL_84" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="sw-display text-sm">Loudness boost</p>
                  <p className="sw-dim text-xs">+3 dB on all channels</p>
                </div>
                <Switch checked={loud} onCheckedChange={setLoud} aria-label="Loudness boost" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="sw-display text-sm">Gapless</p>
                  <p className="sw-dim text-xs">Cross-fade between tracks</p>
                </div>
                <Switch checked={gapless} onCheckedChange={setGapless} aria-label="Gapless" />
              </div>
            </Card>
            <Card className="grid gap-5">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>A glowing bar slides under the active tab.</CardDescription>
              </div>
              <Tabs label="Channel" items={[{ id: 'live', label: 'Live' }, { id: 'archive', label: 'Archive' }, { id: 'mixes', label: 'Mixes' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-2.5">
                <Badge tone="neutral">Neutral</Badge>
                <Badge>Primary</Badge>
                <Badge tone="cyan">Cyan</Badge>
                <Badge tone="success">On sale</Badge>
                <Badge tone="warning">Low stock</Badge>
                <Badge tone="danger">Sold out</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <Alert title="Stream stable">Channel one is running at 320 kbps with 1.2 s of buffer.</Alert>
              <Alert tone="warning" title="Signal dropping">Switching to the backup relay in Frankfurt.</Alert>
              <Alert tone="danger" title="Tickets sold out">Afterglow Live in Lisbon has no seats left.</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="04 / In use" title="On tour this autumn">
          <Card className="p-0">
            <ul>
              {shows.map((s) => (
                <li key={s.name} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-[color-mix(in_oklab,var(--sw-content)_14%,transparent)] px-6 py-5 last:border-0 sm:grid-cols-[64px_1fr_140px_auto]">
                  <div className="text-center">
                    <p className="sw-display sw-neon text-3xl leading-none">{s.day}</p>
                    <p className="sw-mono sw-dim text-[11px] tracking-widest">{s.mon}</p>
                  </div>
                  <div>
                    <p className="sw-display text-lg">{s.name}</p>
                    <p className="sw-dim text-sm">{s.city}</p>
                  </div>
                  <Badge className="hidden justify-self-start sm:inline-flex" tone={s.tone}>
                    {s.tag}
                  </Badge>
                  <Button size="sm" variant={s.tag === 'Sold out' ? 'ghost' : 'secondary'} disabled={s.tag === 'Sold out'}>
                    Tickets
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pb-12 pt-4 sm:px-8">
          <span className="sw-display text-lg">Afterglow</span>
          <span className="sw-dim text-sm">Broadcasting from a parking lot somewhere.</span>
          <span className="sw-mono sw-dim text-xs">v1.984</span>
        </footer>
      </StyleSynthwave>
    </div>
  )
}
