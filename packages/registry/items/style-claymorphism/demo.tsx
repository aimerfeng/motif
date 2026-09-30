import { useState, type ReactNode } from 'react'
import { Alert, Badge, Ball, Button, Card, CardDescription, CardTitle, Input, StyleClaymorphism, Switch, Tabs, type StyleClaymorphismProps } from './style-claymorphism'

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <p className="cl-eyebrow">{eyebrow}</p>
      <h2 className="cl-display mt-3 text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-9">{children}</div>
    </section>
  )
}

const swatches = [
  { name: 'Primary', v: 'var(--cl-accent)', hex: 'accent' },
  { name: 'Secondary', v: 'var(--cl-secondary)', hex: 'secondary' },
  { name: 'Card', v: 'var(--cl-card)', hex: 'card' },
  { name: 'Background', v: 'var(--cl-background)', hex: 'background' },
  { name: 'Accent tint', v: 'color-mix(in oklab, var(--cl-accent) 25%, var(--cl-card))', hex: 'accent 25%' },
  { name: 'Muted text', v: 'var(--cl-mutedForeground)', hex: 'muted-fg' },
  { name: 'Foreground', v: 'var(--cl-foreground)', hex: 'foreground' },
  { name: 'Destructive', v: 'var(--cl-destructive)', hex: 'destructive' },
]

const scale = [
  { name: 'Display', cls: 'cl-display text-6xl', sample: 'Soft and puffy' },
  { name: 'Title', cls: 'cl-display text-4xl', sample: 'Pressed from clay' },
  { name: 'Heading', cls: 'cl-display text-2xl', sample: 'Everything has a little give' },
  { name: 'Body', cls: 'text-base cl-sub font-medium', sample: 'Body text is medium weight, so it stays readable on a raised surface.' },
  { name: 'Label', cls: 'cl-eyebrow', sample: 'Bold caps label' },
]

const spend = [
  { name: 'Groceries', spent: 312, of: 500, color: '#6366f1' },
  { name: 'Eating out', spent: 168, of: 200, color: '#ec4899' },
  { name: 'Transport', spent: 74, of: 150, color: '#10b981' },
]

const txns = [
  { who: 'Blue Door Bakery', when: 'Today, 8:12', amt: '-$6.40', c: '#f59e0b' },
  { who: 'Salary, Northwind', when: 'Yesterday', amt: '+$3,200.00', c: '#10b981', plus: true },
  { who: 'City transit', when: 'Yesterday', amt: '-$2.75', c: '#6366f1' },
  { who: 'Plant shop', when: 'Mon', amt: '-$24.00', c: '#ec4899' },
]

export function Demo(props: StyleClaymorphismProps) {
  const [tab, setTab] = useState('month')
  const [round, setRound] = useState(true)
  const [alerts, setAlerts] = useState(false)

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleClaymorphism {...props}>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full text-[var(--cl-accent-fg)]" style={{ background: 'radial-gradient(circle at 32% 26%, color-mix(in oklab, var(--cl-accent) 55%, #fff), var(--cl-accent) 55%, color-mix(in oklab, var(--cl-accent) 78%, #000))', boxShadow: 'inset -3px -4px 8px rgb(0 0 0 / .2), inset 3px 3px 6px rgb(255 255 255 / .5), 4px 7px 14px var(--drop)' }}>
              <Icon d="M12 6v12M8.5 9.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1 3.5 2.3c0 3-7 1.7-7 5 0 1.3 1.6 2.4 3.5 2.4s3.5-1.1 3.5-2.5" size={20} />
            </span>
            <span className="cl-display text-2xl">Pebble</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {['Budgets', 'Goals', 'Family', 'Pricing'].map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>
          <Button size="sm">Log in</Button>
        </header>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-16">
          <div>
            <Badge tone="pink">Family plans are here</Badge>
            <h1 className="cl-display mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Money that feels <span className="text-[var(--cl-accent)]">friendly.</span>
            </h1>
            <p className="cl-sub mt-6 max-w-md text-lg font-medium">Pebble is the budgeting app that never scolds. See where your money went, set gentle goals, and share the load with the people you live with.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg">
                Get Pebble free
              </Button>
              <Button size="lg">Take a tour</Button>
            </div>
            <p className="cl-sub mt-6 text-sm font-semibold">4.9 average from 21,000 households</p>
          </div>

          <div className="relative min-h-[420px]">
            <Ball color="#f9a8d4" size={150} className="right-2 top-0" />
            <Ball color="#fcd34d" size={84} className="bottom-4 left-0" />
            <Ball color="#86efac" size={64} className="right-24 bottom-0" />
            <Ball color="var(--cl-accent)" size={46} className="left-16 top-3" />
            <Card className="absolute left-[8%] top-10 w-[62%] max-w-[330px]">
              <div className="flex items-center justify-between">
                <p className="cl-eyebrow">Balance</p>
                <Badge tone="success">+4.2%</Badge>
              </div>
              <p className="cl-display mt-3 text-5xl">
                $4,280<span className="cl-sub text-2xl">.50</span>
              </p>
              <p className="cl-sub text-sm font-semibold">across 3 accounts</p>
              <Card dent className="mt-5 flex items-center gap-3 p-3">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-[#10b981] text-white">
                  <Icon d="M5 12.5l4.5 4.5L19 7.5" size={16} />
                </span>
                <span className="text-sm font-bold">Rent is covered for October</span>
              </Card>
            </Card>
            <Card className="absolute bottom-6 right-[4%] w-[58%] max-w-[300px]">
              <div className="flex items-center justify-between">
                <CardTitle>Holiday fund</CardTitle>
                <span className="cl-mono text-xs font-semibold cl-sub">64%</span>
              </div>
              <div className="cl-dent mt-4 h-4 p-[3px]">
                <div className="h-full w-[64%] rounded-full" style={{ background: 'linear-gradient(180deg, color-mix(in oklab, var(--cl-accent) 70%, #fff), var(--cl-accent))', boxShadow: '1px 2px 4px color-mix(in oklab, var(--cl-accent) 50%, transparent)' }} />
              </div>
              <p className="cl-sub mt-3 text-sm font-semibold">$1,920 of $3,000 by December</p>
            </Card>
          </div>
        </div>

        <Section eyebrow="01 / Palette" title="Stone neutrals, one bright colour">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {swatches.map((s) => (
              <div key={s.name} className="grid justify-items-center gap-3 text-center">
                <span className="size-20 rounded-full" style={{ background: s.v, boxShadow: 'inset 5px 5px 10px var(--hl), inset -6px -6px 12px var(--lo), 8px 10px 22px var(--drop), -5px -5px 14px var(--lift)' }} />
                <div>
                  <p className="text-sm font-extrabold">{s.name}</p>
                  <p className="cl-mono cl-sub text-[11px]">{s.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 / Type" title="Heavy, round, and easy to read">
          <Card className="grid gap-5 p-7">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-1 sm:grid-cols-[110px_1fr] sm:gap-6">
                <p className="cl-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section eyebrow="03 / Components" title="Raised to press, sunken to type">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="grid gap-5">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>They rise off the surface, and sink when pressed.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Save goal</Button>
                <Button>Cancel</Button>
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
                <CardDescription>Fields are pressed into the surface.</CardDescription>
              </div>
              <Input label="Goal name" placeholder="Holiday in Lisbon" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold">Round up purchases</p>
                  <p className="cl-sub text-xs font-medium">Spare change goes to savings</p>
                </div>
                <Switch checked={round} onCheckedChange={setRound} aria-label="Round up purchases" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold">Weekly summary</p>
                  <p className="cl-sub text-xs font-medium">Sundays at 9 am</p>
                </div>
                <Switch checked={alerts} onCheckedChange={setAlerts} aria-label="Weekly summary" />
              </div>
            </Card>
            <Card className="grid gap-5">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>A raised thumb slides along a sunken track.</CardDescription>
              </div>
              <Tabs label="Range" items={[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }, { id: 'year', label: 'Year' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-2.5">
                <Badge>Neutral</Badge>
                <Badge tone="accent">Primary</Badge>
                <Badge tone="pink">Family</Badge>
                <Badge tone="success">On track</Badge>
                <Badge tone="warning">Near limit</Badge>
                <Badge tone="danger">Over</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-5">
              <Alert tone="success" title="Goal reached">Holiday fund is 64% there. Only $1,080 to go.</Alert>
              <Alert tone="warning" title="Eating out is at 84%">Twelve days left in the month.</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="04 / In use" title="A month, without the guilt">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Card className="p-7">
              <CardTitle>Budgets</CardTitle>
              <div className="mt-6 grid gap-6">
                {spend.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-extrabold">{s.name}</span>
                      <span className="cl-mono cl-sub text-xs font-semibold">
                        ${s.spent} / ${s.of}
                      </span>
                    </div>
                    <div className="cl-dent mt-2.5 h-4 p-[3px]">
                      <div className="h-full rounded-full" style={{ width: `${(s.spent / s.of) * 100}%`, background: `linear-gradient(180deg, color-mix(in oklab, ${s.color} 70%, #fff), ${s.color})`, boxShadow: `1px 2px 4px color-mix(in oklab, ${s.color} 50%, transparent)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-7">
              <CardTitle>Recent</CardTitle>
              <ul className="mt-5 grid gap-4">
                {txns.map((t) => (
                  <li key={t.who} className="flex items-center gap-3.5">
                    <span className="size-10 flex-none rounded-full" style={{ background: `radial-gradient(circle at 32% 26%, color-mix(in oklab, ${t.c} 55%, #fff), ${t.c} 55%, color-mix(in oklab, ${t.c} 80%, #000))`, boxShadow: 'inset -2px -3px 6px rgb(0 0 0 / .18), inset 2px 2px 4px rgb(255 255 255 / .45), 3px 5px 10px var(--drop)' }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{t.who}</p>
                      <p className="cl-sub text-xs font-medium">{t.when}</p>
                    </div>
                    <span className={'cl-mono text-sm font-bold ' + (t.plus ? 'text-[#10b981]' : '')}>{t.amt}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pb-12 pt-4 sm:px-8">
          <span className="cl-display text-xl">Pebble</span>
          <span className="cl-sub text-sm font-semibold">Built to be pleasant to press.</span>
          <span className="cl-mono cl-sub text-xs">v5.2</span>
        </footer>
      </StyleClaymorphism>
    </div>
  )
}
