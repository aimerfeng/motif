import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Checkbox, Input, StyleSoftPastel, Switch, Tabs, palettes, type Flavor, type StyleSoftPastelProps } from './style-soft-pastel'

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
      <p className="cp-eyebrow">{eyebrow}</p>
      <h2 className="cp-display mt-3 text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

const accentRow = ['rosewater', 'flamingo', 'pink', 'mauve', 'red', 'maroon', 'peach', 'yellow', 'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender'] as const
const neutralRow = ['text', 'subtext1', 'subtext0', 'overlay2', 'overlay1', 'overlay0', 'surface2', 'surface1', 'surface0', 'base', 'mantle', 'crust'] as const

/** 色块上的文字：按亮度在深浅两色间选。 */
function inkOn(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16)
  const luma = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  return luma > 150 ? '#1e2030' : '#f5f7ff'
}

const scale = [
  { name: 'Display', cls: 'cp-display text-6xl', sample: 'Sweet and soft' },
  { name: 'Title', cls: 'cp-display text-4xl', sample: 'Rounded on purpose' },
  { name: 'Heading', cls: 'cp-display text-2xl', sample: 'A little bounce goes a long way' },
  { name: 'Body', cls: 'text-base cp-sub', sample: 'Body copy stays calm and warm, set a shade softer than the headline.' },
  { name: 'Label', cls: 'cp-mono text-xs cp-faint', sample: 'MONO / 12 PX / FOR NUMBERS' },
]

const days = [
  { d: 'M', v: 55 },
  { d: 'T', v: 80 },
  { d: 'W', v: 62 },
  { d: 'T', v: 100 },
  { d: 'F', v: 74 },
  { d: 'S', v: 40 },
  { d: 'S', v: 90 },
]

export function Demo(props: StyleSoftPastelProps) {
  const flavor = (props.flavor ?? 'latte') as Flavor
  const pal = palettes[flavor] ?? palettes.latte
  const [tab, setTab] = useState('week')
  const [remind, setRemind] = useState(true)
  const [habits, setHabits] = useState([true, true, false, false])
  const list = ['Drink two glasses of water', 'Ten-minute stretch', 'Read before bed', 'Message a friend']

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleSoftPastel {...props}>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[12px] bg-[var(--cp-accent)] text-[var(--cp-accent-fg)] shadow-[0_3px_0_color-mix(in_oklab,var(--cp-accent)_66%,var(--cp-crust))]">
              <Icon d="M12 20v-8m0 0c0-4 3-6 7-6 0 4-3 6-7 6zm0 2c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" size={20} />
            </span>
            <span className="cp-display text-xl">Sprout</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {['Habits', 'Streaks', 'Friends', 'Pricing'].map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>
          <Button variant="soft" size="sm">
            Sign in
          </Button>
        </header>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-10 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <Badge>Now with friend streaks</Badge>
            <h1 className="cp-display mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Small habits, <span className="cp-hl">big</span> wins.
            </h1>
            <p className="cp-sub mt-6 max-w-md text-lg">Sprout turns the things you keep meaning to do into a garden you actually want to water. Two minutes a day, no guilt.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg">Plant your first habit</Button>
              <Button size="lg" variant="outline">
                See how it works
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {(['pink', 'peach', 'green', 'blue'] as const).map((c, i) => (
                  <span key={c} className="grid size-8 place-items-center rounded-full border-2 border-[var(--cp-base)] text-xs font-extrabold text-[var(--cp-crust)]" style={{ background: `color-mix(in oklab, var(--cp-${c}) 75%, var(--cp-base))` }}>
                    {'AJMK'[i]}
                  </span>
                ))}
              </div>
              <p className="cp-sub text-sm">
                <b className="text-[var(--cp-text)]">48,000</b> people watered a habit today
              </p>
            </div>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:block lg:h-[440px]">
            <Card tint="peach" className="lg:absolute lg:left-0 lg:top-0 lg:w-[52%] lg:-rotate-3">
              <div className="flex items-center justify-between">
                <Badge tone="peach">Streak</Badge>
                <span className="cp-mono cp-faint text-xs">day 12</span>
              </div>
              <p className="cp-display mt-3 text-6xl">12</p>
              <p className="cp-sub text-sm">days in a row. Your longest yet.</p>
              <div className="mt-4 flex gap-1.5">
                {[1, 1, 1, 1, 1, 1, 0].map((on, i) => (
                  <span key={i} className="size-6 rounded-full border-2" style={{ background: on ? 'color-mix(in oklab, var(--cp-peach) 68%, var(--cp-base))' : 'transparent', borderColor: 'color-mix(in oklab, var(--cp-peach) 55%, var(--cp-base))' }} />
                ))}
              </div>
            </Card>
            <Card tint="green" className="lg:absolute lg:right-0 lg:top-20 lg:w-[54%] lg:rotate-2">
              <CardTitle>Today</CardTitle>
              <ul className="mt-3 grid gap-2.5">
                {list.slice(0, 3).map((item, i) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid size-6 place-items-center rounded-lg border-2 border-[color-mix(in_oklab,var(--cp-green)_60%,var(--cp-base))]" style={{ background: i < 2 ? 'var(--cp-green)' : 'transparent', color: 'var(--cp-crust)' }}>
                      {i < 2 ? <Icon d="M5 12.5l4.5 4.5L19 7.5" size={14} /> : null}
                    </span>
                    <span className={i < 2 ? 'cp-sub line-through decoration-2' : ''}>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card tint="lavender" className="sm:col-span-2 lg:absolute lg:bottom-0 lg:left-[6%] lg:w-[64%] lg:-rotate-1">
              <div className="flex items-center gap-4">
                <span className="grid size-12 flex-none place-items-center rounded-2xl bg-[var(--cp-lavender)] text-[var(--cp-crust)]">
                  <Icon d="M12 3l2.5 5.5L20 9.3l-4 4 1 5.7-5-2.8L7 19l1-5.7-4-4 5.5-.8z" size={22} />
                </span>
                <div>
                  <p className="font-extrabold">Level 4 gardener</p>
                  <p className="cp-sub text-sm">Three more days to unlock the greenhouse.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Section eyebrow="01 / Palette" title={`Catppuccin ${flavor.charAt(0).toUpperCase() + flavor.slice(1)}, used gently`}>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {accentRow.map((name) => (
              <div key={name} className="grid gap-2 text-center">
                <span className="mx-auto size-14 rounded-full border-2 border-[color-mix(in_oklab,var(--cp-text)_10%,transparent)] sm:size-16" style={{ background: `var(--cp-${name})` }} />
                <p className="text-xs font-bold capitalize">{name}</p>
                <p className="cp-mono cp-faint text-[10px]">{pal[name]}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-6 overflow-hidden rounded-[var(--r)] border-2 border-[var(--line)] sm:grid-cols-12">
            {neutralRow.map((name) => (
              <div key={name} className="grid h-24 content-end p-2" style={{ background: `var(--cp-${name})`, color: inkOn(pal[name]) }}>
                <span className="text-[10px] font-extrabold capitalize leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 / Type" title="Friendly display, quiet body">
          <Card tint="surface" className="grid gap-5 p-7">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-1 border-b-2 border-dashed border-[var(--line)] pb-5 last:border-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-6">
                <p className="cp-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section eyebrow="03 / Components" title="Chunky buttons, soft edges">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="grid gap-5">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>They sit on a thick edge and press down.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3.5">
                <Button>Save habit</Button>
                <Button variant="soft">Snooze</Button>
                <Button variant="outline">Cancel</Button>
                <Button variant="ghost">Skip</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3.5">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Card>
            <Card className="grid gap-4">
              <div>
                <CardTitle>Form</CardTitle>
                <CardDescription>Two-pixel outlines, generous padding.</CardDescription>
              </div>
              <Input label="Habit name" placeholder="Stretch for ten minutes" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">Daily reminder</p>
                  <p className="cp-faint text-xs">A gentle nudge at 8 pm</p>
                </div>
                <Switch checked={remind} onCheckedChange={setRemind} aria-label="Daily reminder" />
              </div>
              <div className="grid gap-2.5">
                {list.map((item, i) => (
                  <label key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <Checkbox checked={habits[i]} onCheckedChange={(v) => setHabits(habits.map((h, j) => (j === i ? v : h)))} aria-label={item} />
                    {item}
                  </label>
                ))}
              </div>
            </Card>
            <Card className="grid gap-5">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>Pastel chips carry a dark, readable label.</CardDescription>
              </div>
              <Tabs label="Range" items={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-2">
                <Badge>Mauve</Badge>
                <Badge tone="pink">Pink</Badge>
                <Badge tone="peach">Peach</Badge>
                <Badge tone="green">Done</Badge>
                <Badge tone="yellow">Due soon</Badge>
                <Badge tone="red">Missed</Badge>
                <Badge tone="blue">New</Badge>
                <Badge tone="neutral">Archived</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <Alert tone="success" title="Streak saved">You checked in at 11:52 pm. Twelve days and counting.</Alert>
              <Alert title="Tip of the day">Attach a new habit to one you already have, like stretching while the kettle boils.</Alert>
              <Alert tone="warning" title="You're at risk of losing your streak">Two hours left to check in today.</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="04 / In use" title="A week, at a glance">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card tint="surface" className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Check-ins</CardTitle>
                  <CardDescription>This week you finished 86% of your habits.</CardDescription>
                </div>
                <Badge tone="green">+9%</Badge>
              </div>
              <div className="mt-6 flex h-44 items-end justify-between gap-3">
                {days.map((day, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="w-full rounded-[calc(var(--r-sm))] border-2" style={{ height: `${day.v}%`, background: `color-mix(in oklab, var(--cp-${['pink', 'peach', 'yellow', 'green', 'teal', 'blue', 'mauve'][i]}) 55%, var(--cp-base))`, borderColor: `color-mix(in oklab, var(--cp-${['pink', 'peach', 'yellow', 'green', 'teal', 'blue', 'mauve'][i]}) 80%, var(--cp-base))` }} />
                    <span className="cp-mono cp-faint text-xs">{day.d}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid gap-5">
              <Card tint="pink">
                <CardTitle>Plants grown</CardTitle>
                <p className="cp-display mt-2 text-5xl">27</p>
                <CardDescription>Four this month.</CardDescription>
              </Card>
              <Card tint="blue">
                <CardTitle>Next milestone</CardTitle>
                <div className="mt-4 h-3.5 overflow-hidden rounded-full border-2 border-[color-mix(in_oklab,var(--cp-blue)_50%,var(--cp-base))] bg-[var(--cp-base)]">
                  <div className="h-full w-[72%] rounded-full bg-[var(--cp-blue)]" />
                </div>
                <CardDescription>36 of 50 check-ins to Sapling.</CardDescription>
              </Card>
            </div>
          </div>
        </Section>

        <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pb-12 pt-6 sm:px-8">
          <span className="cp-display text-lg">Sprout</span>
          <span className="cp-sub text-sm">Made slowly, in small batches.</span>
          <span className="cp-mono cp-faint text-xs">v3.1</span>
        </footer>
      </StyleSoftPastel>
    </div>
  )
}
