import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Grid, Input, StyleSwiss, Switch, Tabs, Wrap, grays, type StyleSwissProps } from './style-swiss'

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M2 8h11M9 4l4 4-4 4" />
  </svg>
)

function Section({ n, label, title, children }: { n: string; label: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="pb-24">
      <Wrap>
        <hr className="sz-rule-thick" />
        <Grid className="pt-4">
          <p className="sz-label col-span-12 mb-8 md:col-span-3 md:mb-0">
            ({n}) {label}
          </p>
          <h2 className="sz-h2 col-span-12 text-4xl sm:text-5xl md:col-span-9">{title}</h2>
        </Grid>
        <Grid className="mt-14 gap-y-10">{children}</Grid>
      </Wrap>
    </section>
  )
}

const type = [
  { size: '96 / 88', cls: 'sz-display text-[6rem]', sample: 'Grid' },
  { size: '48 / 48', cls: 'sz-h2 text-5xl', sample: 'Order and clarity' },
  { size: '28 / 30', cls: 'sz-h2 text-[1.75rem]', sample: 'Every element has a place' },
  { size: '18 / 26', cls: 'text-lg', sample: 'One typeface, three weights, and a mono for data and labels.' },
  { size: '15 / 22', cls: 'text-[15px] sz-muted', sample: 'Body text runs flush left, ragged right, at a measure of about sixty characters.' },
]

const work = [
  { n: '01', name: 'Nordlicht Energie', kind: 'Identity, Signage', year: '2026' },
  { n: '02', name: 'Kantonsspital app', kind: 'Interface system', year: '2025' },
  { n: '03', name: 'Halde Museum', kind: 'Identity, Website', year: '2025' },
  { n: '04', name: 'Rotor Bikes', kind: 'Packaging, Type', year: '2024' },
  { n: '05', name: 'Verlag Weiss', kind: 'Books, Web', year: '2023' },
]

export function Demo(props: StyleSwissProps) {
  const [tab, setTab] = useState('work')
  const [news, setNews] = useState(true)
  const scale = props.dark ? grays.dark : grays.light

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleSwiss {...props}>
        <header className="pt-5">
          <Wrap>
            <Grid className="items-center pb-4">
              <span className="sz-h3 col-span-6 md:col-span-3">
                Modul<sup className="sz-accent text-xs">&reg;</sup>
              </span>
              <nav className="col-span-6 hidden gap-1 md:col-span-6 md:flex" aria-label="Primary">
                {['Work', 'Studio', 'Journal', 'Contact'].map((item, i) => (
                  <Button key={item} variant="ghost" size="sm" className={i === 0 ? 'underline underline-offset-4' : ''}>
                    {item}
                  </Button>
                ))}
              </nav>
              <span className="sz-label col-span-6 text-right md:col-span-3">Zürich, 47.37° N</span>
            </Grid>
            <hr className="sz-rule-thick" />
          </Wrap>
        </header>

        <Wrap className="pb-20 pt-10">
          <Grid className="gap-y-10">
            <p className="sz-label col-span-12 md:col-span-3">
              (01) Studio for identity
              <br />+ interface systems
            </p>
            <h1 className="sz-display col-span-12 text-[clamp(3.4rem,9.4vw,8.4rem)] md:col-span-9">
              Order is a form of <span className="sz-accent">clarity.</span>
            </h1>

            <div className="col-span-12 md:col-span-5 md:col-start-4">
              <p className="text-lg leading-snug">Modul designs visual identities and the interface systems that carry them. We work with a twelve-column grid, one typeface and a single colour, because constraints make decisions faster.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button variant="primary" size="lg" className="min-w-[240px]">
                  Start a project <Arrow />
                </Button>
                <Button variant="link">See selected work</Button>
              </div>
            </div>
            <div className="hidden md:col-span-3 md:col-start-10 md:block">
              <div className="aspect-square rounded-full bg-[var(--sz-accent)]" />
              <p className="sz-label mt-3">Fig. 1, one accent only</p>
            </div>
          </Grid>
        </Wrap>

        <section className="pb-24">
          <Wrap>
            <hr className="sz-rule" />
            <Grid className="py-5">
              {[
                ['14', 'People in the studio'],
                ['212', 'Projects since 2009'],
                ['3', 'Languages in the team'],
                ['1', 'Grid, always'],
              ].map(([n, l]) => (
                <div key={l} className="col-span-6 py-3 md:col-span-3">
                  <p className="sz-display text-6xl">{n}</p>
                  <p className="sz-label mt-3">{l}</p>
                </div>
              ))}
            </Grid>
          </Wrap>
        </section>

        <Section n="02" label="Colour" title="Twelve greys and one accent">
          <div className="col-span-12 grid grid-cols-6 md:grid-cols-12 md:gap-x-[var(--gutter)]">
            {scale.map((hex, i) => (
              <div key={hex} className="pb-6">
                <div className="aspect-[3/4] border border-[var(--sz-6)]" style={{ background: hex }} />
                <p className="sz-mono mt-3 text-xs">{i + 1}</p>
                <p className="sz-label mt-1 !normal-case">{hex}</p>
              </div>
            ))}
          </div>
          <div className="col-span-12 grid grid-cols-3 gap-x-[var(--gutter)] md:col-span-6">
            {[
              ['Accent', 'var(--sz-accent)'],
              ['Accent, 12%', 'color-mix(in oklab, var(--sz-accent) 12%, var(--sz-1))'],
              ['Accent, dark', 'color-mix(in oklab, var(--sz-accent) 70%, #000)'],
            ].map(([name, v]) => (
              <div key={name}>
                <div className="aspect-[3/2]" style={{ background: v }} />
                <p className="sz-label mt-3">{name}</p>
              </div>
            ))}
          </div>
          <p className="col-span-12 max-w-md self-end text-sm sz-muted md:col-span-4 md:col-start-9">Grey carries ninety-five percent of every screen. The accent marks one thing at a time: a link, a primary action, a single shape.</p>
        </Section>

        <Section n="03" label="Type" title="One family, sized on a scale">
          <div className="col-span-12 md:col-span-4">
            <p className="sz-display text-[12rem] leading-none md:text-[15rem]">Aa</p>
            <p className="sz-label mt-4">Space Grotesk, 600 and 400</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            {type.map((row) => (
              <div key={row.size} className="grid gap-2 border-t border-[var(--sz-6)] py-5 sm:grid-cols-[110px_1fr]">
                <p className="sz-label">{row.size}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
            <div className="border-t border-[var(--sz-6)] pt-5">
              <p className="sz-label">Labels, mono 11 px, caps, tracked +6%</p>
            </div>
          </div>
        </Section>

        <Section n="04" label="Components" title="Rectangles, lines, and one hover colour">
          {[
            {
              name: 'Buttons',
              body: (
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">
                    Send enquiry <Arrow />
                  </Button>
                  <Button>
                    Default <Arrow />
                  </Button>
                  <Button variant="secondary">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">
                    Text link <Arrow />
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              ),
            },
            {
              name: 'Sizes',
              body: (
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              ),
            },
            {
              name: 'Input',
              body: (
                <div className="grid max-w-xl gap-6 sm:grid-cols-2">
                  <Input label="Name" placeholder="Anna Keller" />
                  <Input label="Email" placeholder="anna@studio.ch" type="email" />
                </div>
              ),
            },
            {
              name: 'Switch',
              body: (
                <div className="flex max-w-md items-center justify-between gap-6">
                  <div>
                    <p className="font-medium">Studio newsletter</p>
                    <p className="sz-muted text-sm">Four times a year, no more.</p>
                  </div>
                  <Switch checked={news} onCheckedChange={setNews} aria-label="Studio newsletter" />
                </div>
              ),
            },
            {
              name: 'Tabs',
              body: <Tabs label="Index" className="max-w-xl" items={[{ id: 'work', label: 'Work' }, { id: 'studio', label: 'Studio' }, { id: 'journal', label: 'Journal' }]} value={tab} onValueChange={setTab} />,
            },
            {
              name: 'Badges',
              body: (
                <div className="flex flex-wrap gap-2.5">
                  <Badge>Neutral</Badge>
                  <Badge tone="accent">Accent</Badge>
                  <Badge tone="success">Solid</Badge>
                  <Badge tone="warning">Attention</Badge>
                  <Badge tone="outline">Outline</Badge>
                </div>
              ),
            },
            {
              name: 'Alerts',
              body: (
                <div className="grid gap-8 md:grid-cols-2">
                  <Alert title="Proof approved">Version 3 of the identity manual was signed off on 12 October.</Alert>
                  <Alert tone="danger" title="Deadline in two days">The pitch deck is missing the pricing grid.</Alert>
                </div>
              ),
            },
          ].map((row) => (
            <div key={row.name} className="col-span-12 grid gap-4 border-t border-[var(--sz-6)] pt-5 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-x-[var(--gutter)]">
              <p className="sz-label">{row.name}</p>
              <div className="pb-4">{row.body}</div>
            </div>
          ))}
        </Section>

        <Section n="05" label="In use" title="Selected work">
          <div className="col-span-12">
            {work.map((w) => (
              <div key={w.n} className="group grid grid-cols-[40px_1fr_auto] items-baseline gap-x-4 border-t border-[var(--sz-12)] py-5 transition-colors hover:bg-[var(--sz-accent)] hover:text-[var(--sz-accent-fg)] md:grid-cols-[minmax(0,1fr)_minmax(0,5fr)_minmax(0,3fr)_minmax(0,2fr)_24px] md:gap-x-[var(--gutter)]">
                <span className="sz-mono text-sm">{w.n}</span>
                <span className="sz-h2 text-2xl sm:text-3xl">{w.name}</span>
                <span className="hidden text-sm md:block">{w.kind}</span>
                <span className="sz-mono hidden text-sm md:block">{w.year}</span>
                <Arrow />
              </div>
            ))}
            <hr className="sz-rule" />
          </div>
          <Card fill="ink" className="col-span-12 grid gap-6 p-8 md:col-span-8">
            <CardTitle className="text-3xl">Have a brief?</CardTitle>
            <CardDescription>We take on six projects a year. Tell us about yours before the end of October and we will reply within two working days.</CardDescription>
            <div>
              <Button variant="primary">
                hello@modul.studio <Arrow />
              </Button>
            </div>
          </Card>
          <Card fill className="col-span-12 md:col-span-4">
            <p className="sz-label">Studio</p>
            <p className="mt-4 text-lg leading-snug">Sihlstrasse 71
              <br />8001 Zürich
              <br />Mon to Fri, 9 to 18</p>
          </Card>
        </Section>

        <footer className="pb-10">
          <Wrap>
            <hr className="sz-rule-thick" />
            <Grid className="pt-4">
              <span className="sz-h3 col-span-6 md:col-span-3">
                Modul<sup className="sz-accent text-xs">&reg;</sup>
              </span>
              <span className="sz-label col-span-6 text-right md:col-span-9">&copy; 2026 Modul Studio GmbH</span>
            </Grid>
          </Wrap>
        </footer>
      </StyleSwiss>
    </div>
  )
}
