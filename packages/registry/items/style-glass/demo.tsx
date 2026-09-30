import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Glass, Input, StyleGlass, Switch, Tabs, type StyleGlassProps } from './style-glass'

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <p className="mg-eyebrow">{eyebrow}</p>
      <h2 className="mg-display mt-3 text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Ring({ value }: { value: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 128 128" className="size-32 -rotate-90" aria-hidden>
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--g-fill-hi)" strokeWidth="9" />
      <circle cx="64" cy="64" r={r} fill="none" stroke="url(#mg-ring)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />
      <defs>
        <linearGradient id="mg-ring" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--g-accent-2)" />
          <stop offset="1" stopColor="var(--g-accent)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const agenda = [
  { time: '09:30', title: 'Design review', tone: 'neutral' as const, tag: '30 min' },
  { time: '11:00', title: 'Deep work: pricing page', tone: 'accent' as const, tag: 'Focus' },
  { time: '14:00', title: 'Customer call, Northwind', tone: 'success' as const, tag: 'Confirmed' },
]

const swatches = [
  { name: 'Accent', v: 'var(--g-accent)' },
  { name: 'Accent 2', v: 'var(--g-accent-2)' },
  { name: 'Accent 3', v: 'var(--g-accent-3)' },
  { name: 'Glass', v: 'var(--g-panel-a)' },
  { name: 'Glass, lifted', v: 'var(--g-fill-hi)' },
  { name: 'Ink', v: 'var(--g-fg)' },
  { name: 'Muted', v: 'var(--g-muted)' },
  { name: 'Faint', v: 'var(--g-faint)' },
]

const scale = [
  { name: 'Display', cls: 'mg-display text-6xl', sample: 'Frosted light' },
  { name: 'Title', cls: 'mg-display text-4xl', sample: 'Layers of glass' },
  { name: 'Heading', cls: 'mg-display text-2xl', sample: 'Quiet surfaces, bright edges' },
  { name: 'Body', cls: 'text-base mg-muted', sample: 'Text sits on the panel, never on the blur itself.' },
  { name: 'Label', cls: 'mg-eyebrow', sample: 'Mono label, tracked out' },
]

const plans = [
  { name: 'Solo', price: '0', note: 'For trying it out', items: ['One calendar', 'Focus timer', '7 days of history'] },
  { name: 'Studio', price: '12', note: 'For people who guard their week', items: ['Unlimited calendars', 'Auto-block focus time', 'Weekly time report'], featured: true },
  { name: 'Team', price: '29', note: 'Per seat, billed yearly', items: ['Shared focus hours', 'Admin controls', 'SSO and audit log'] },
]

export function Demo(props: StyleGlassProps) {
  const [tab, setTab] = useState('week')
  const [quiet, setQuiet] = useState(true)
  const [sync, setSync] = useState(false)

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleGlass {...props}>
        <header className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-8">
          <Glass className="flex items-center justify-between gap-4 rounded-[999px] py-2 pl-5 pr-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-full text-[var(--g-accent-fg)]" style={{ background: 'linear-gradient(135deg, var(--g-accent-2), var(--g-accent))', boxShadow: 'inset 0 1px 0 rgb(255 255 255 / .5)' }}>
                <Icon d="M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2m0-12-2 2M8 16l-2 2" size={15} />
              </span>
              <span className="mg-display text-lg">Lumen</span>
            </div>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              {['Product', 'Method', 'Pricing', 'Changelog'].map((item) => (
                <Button key={item} variant="ghost" size="sm">
                  {item}
                </Button>
              ))}
            </nav>
            <Button variant="primary" size="sm">
              Get Lumen
            </Button>
          </Glass>
        </header>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-8 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <Badge tone="accent">New: weekly focus report</Badge>
            <h1 className="mg-display mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Focus, in <span className="mg-grad-text">better light.</span>
            </h1>
            <p className="mg-muted mt-6 max-w-md text-lg">Lumen blocks out your calendar, mutes the noise and shows where your week really went.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg">
                Start free trial
              </Button>
              <Button size="lg">
                <Icon d="M8 5.5v13l11-6.5z" size={16} />
                90-second tour
              </Button>
            </div>
            <p className="mg-faint mt-5 text-sm">No card needed. Works with every calendar you already use.</p>
          </div>

          <div className="relative grid gap-4 sm:grid-cols-2 lg:block lg:h-[470px]">
            <Card className="lg:absolute lg:left-0 lg:top-0 lg:w-[64%]">
              <div className="flex items-center justify-between">
                <p className="mg-eyebrow">Focus session</p>
                <Badge tone="success">Live</Badge>
              </div>
              <div className="mt-4 flex items-center gap-5">
                <div className="relative grid place-items-center">
                  <Ring value={0.68} />
                  <span className="mg-mono absolute text-2xl font-medium">24:18</span>
                </div>
                <div>
                  <CardTitle>Pricing page</CardTitle>
                  <CardDescription>Notifications muted</CardDescription>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button size="sm" className="flex-1">
                  Pause
                </Button>
                <Button size="sm" variant="ghost" className="flex-1">
                  End
                </Button>
              </div>
            </Card>
            <Card className="lg:absolute lg:right-0 lg:top-[238px] lg:w-[64%]">
              <p className="mg-eyebrow">Today</p>
              <ul className="mt-3 grid gap-3">
                {agenda.map((row) => (
                  <li key={row.time} className="flex items-center gap-3">
                    <span className="mg-mono mg-faint w-11 text-xs">{row.time}</span>
                    <span className="flex-1 truncate text-sm font-medium">{row.title}</span>
                    <Badge tone={row.tone}>{row.tag}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
            <Glass className="flex items-center gap-3 px-4 py-3 sm:col-span-2 lg:absolute lg:left-0 lg:top-[316px] lg:w-[34%] lg:flex-col lg:items-start">
              <span className="grid size-9 place-items-center rounded-full bg-[color-mix(in_oklab,var(--g-ok)_20%,transparent)] text-[var(--g-ok)]">
                <Icon d="M4 16l5-5 4 4 7-8" />
              </span>
              <div>
                <p className="mg-mono text-lg leading-none">3h 42m</p>
                <p className="mg-faint mt-1 text-xs">deep work today, +18% on last week</p>
              </div>
            </Glass>
          </div>
        </div>

        <Section eyebrow="01 / Palette" title="Light with a tint, never a colour block">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {swatches.map((s) => (
              <Glass key={s.name} className="p-3">
                <div className="h-16 rounded-[calc(var(--g-r-sm))] border border-white/20" style={{ background: s.v }} />
                <p className="mt-3 text-sm font-medium">{s.name}</p>
                <p className="mg-mono mg-faint text-[11px]">{s.v.replace('var(', '').replace(')', '')}</p>
              </Glass>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 / Type" title="One family, two weights, a mono for numbers">
          <Card className="grid gap-5 p-7">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-1 border-b border-white/10 pb-5 last:border-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-6">
                <p className="mg-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section eyebrow="03 / Components" title="Everything sits on the same glass">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="grid gap-5">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>One filled action per view.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Save changes</Button>
                <Button>Cancel</Button>
                <Button variant="ghost">Skip</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
                <CardDescription>Inputs are wells cut into the glass.</CardDescription>
              </div>
              <Input label="Work email" placeholder="you@studio.com" type="email" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Quiet hours</p>
                  <p className="mg-faint text-xs">Mute alerts outside 9 to 6</p>
                </div>
                <Switch checked={quiet} onCheckedChange={setQuiet} aria-label="Quiet hours" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Sync with Outlook</p>
                  <p className="mg-faint text-xs">Two-way, every 5 minutes</p>
                </div>
                <Switch checked={sync} onCheckedChange={setSync} aria-label="Sync" />
              </div>
            </Card>
            <Card className="grid gap-5">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>The thumb slides; it never jumps.</CardDescription>
              </div>
              <Tabs label="Range" items={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-2">
                <Badge>Neutral</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="success">On track</Badge>
                <Badge tone="warning">Overbooked</Badge>
                <Badge tone="danger">Conflict</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <Alert title="Focus block added">Thursday, 11:00 to 13:00. We moved one recurring sync out of the way.</Alert>
              <Alert tone="warning" title="Friday is overbooked">Six meetings and no break. Want Lumen to suggest a fix?</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="04 / In use" title="Plans that don't shout">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.featured ? 'md:-translate-y-3' : ''} style={plan.featured ? { boxShadow: '0 0 0 1px color-mix(in oklab, var(--g-accent) 60%, transparent), 0 30px 80px -20px color-mix(in oklab, var(--g-accent) 60%, transparent)' } : undefined}>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured ? <Badge tone="accent">Popular</Badge> : null}
                </div>
                <p className="mg-display mt-5 text-5xl">
                  ${plan.price}
                  <span className="mg-muted text-base font-normal tracking-normal"> /mo</span>
                </p>
                <CardDescription>{plan.note}</CardDescription>
                <ul className="mt-5 grid gap-2.5 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="text-[var(--g-accent-2)]">
                        <Icon d="M5 12.5l4.5 4.5L19 7.5" size={15} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.featured ? 'primary' : 'glass'} className="mt-6 w-full">
                  {plan.price === '0' ? 'Start free' : 'Choose ' + plan.name}
                </Button>
              </Card>
            ))}
          </div>
        </Section>

        <footer className="mx-auto w-full max-w-6xl px-5 pb-12 pt-6 sm:px-8">
          <Glass className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <span className="mg-display text-lg">Lumen</span>
            <span className="mg-faint text-sm">Made for people who guard their calendar.</span>
            <span className="mg-mono mg-faint text-xs">v2.4.0</span>
          </Glass>
        </footer>
      </StyleGlass>
    </div>
  )
}
