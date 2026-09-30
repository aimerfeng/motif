import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Input, StyleDusk, Switch, Tabs, palettes, type StyleDuskProps, type Variant } from './style-dusk'

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <hr className="rp-rule" />
      <div className="grid gap-10 py-16 lg:grid-cols-[220px_1fr]">
        <div>
          <p className="rp-eyebrow">{eyebrow}</p>
          <h2 className="rp-display mt-3 text-3xl">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  )
}

const tokens: [string, string, string][] = [
  ['base', 'base', 'Page'],
  ['surface', 'surface', 'Cards'],
  ['overlay', 'overlay', 'Raised, inputs'],
  ['hlMed', 'highlight med', 'Hairlines'],
  ['muted', 'muted', 'Placeholder, captions'],
  ['subtle', 'subtle', 'Secondary text'],
  ['text', 'text', 'Primary text'],
  ['iris', 'iris', 'Accent'],
  ['rose', 'rose', 'Accent'],
  ['foam', 'foam', 'Success'],
  ['gold', 'gold', 'Warning'],
  ['love', 'love', 'Danger'],
]

const scale = [
  { name: 'Display', cls: 'rp-display text-6xl', sample: 'The quiet hours' },
  { name: 'Title', cls: 'rp-display text-4xl', sample: 'Less, and then a little less' },
  { name: 'Heading', cls: 'rp-display text-2xl', sample: 'Set in a serif, sized with restraint' },
  { name: 'Body', cls: 'text-base rp-sub', sample: 'Body copy is a clean sans at 15px. It keeps to a narrow measure so the eye rests.' },
  { name: 'Label', cls: 'rp-mono text-xs rp-faint', sample: 'MONO / 12 / TRACKED' },
]

const entries = [
  { title: 'On beginning again', date: 'Sep 28', words: '1,204', tone: 'success' as const, tag: 'Published' },
  { title: 'Notes from the lake house', date: 'Sep 24', words: '862', tone: 'neutral' as const, tag: 'Draft' },
  { title: 'A letter to my future editor', date: 'Sep 19', words: '2,310', tone: 'warning' as const, tag: 'In review' },
  { title: 'Winter reading list', date: 'Sep 11', words: '540', tone: 'neutral' as const, tag: 'Draft' },
]

export function Demo(props: StyleDuskProps) {
  const variant = (props.variant ?? 'main') as Variant
  const pal = palettes[variant] ?? palettes.main
  const [tab, setTab] = useState('drafts')
  const [focus, setFocus] = useState(true)
  const [spell, setSpell] = useState(false)

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleDusk {...props}>
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-7 sm:px-8">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--rp-accent)" strokeWidth="1.6" aria-hidden>
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
            </svg>
            <span className="rp-display text-xl">Nocturne</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {['Writing', 'Journal', 'Pricing', 'Changelog'].map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>
          <Button size="sm">Sign in</Button>
        </header>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-28">
          <div>
            <p className="rp-eyebrow">A writing app for the evening</p>
            <h1 className="rp-display mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Write where <br className="hidden sm:block" />
              it&rsquo;s <span className="rp-em">quiet.</span>
            </h1>
            <p className="rp-sub mt-7 max-w-md text-lg">Nocturne removes everything but the page. No toolbars, no streaks, no notifications. Just you and the sentence you are working on.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg">
                Start writing
              </Button>
              <Button variant="link">Read the manifesto</Button>
            </div>
          </div>

          <div className="relative">
            <svg viewBox="0 0 400 400" className="pointer-events-none absolute -right-10 -top-16 hidden w-[380px] lg:block" fill="none" aria-hidden>
              <circle cx="200" cy="200" r="190" stroke="var(--rp-hlMed)" strokeWidth="1" />
              <circle cx="200" cy="200" r="140" stroke="var(--rp-hlMed)" strokeWidth="1" />
              <circle cx="200" cy="200" r="90" stroke="color-mix(in oklab, var(--rp-accent) 50%, transparent)" strokeWidth="1" />
            </svg>
            <Card raised className="relative p-0">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[var(--rp-hlHigh)]" />
                  <span className="size-2.5 rounded-full bg-[var(--rp-hlHigh)]" />
                  <span className="size-2.5 rounded-full bg-[var(--rp-hlHigh)]" />
                </div>
                <span className="rp-mono rp-faint text-xs">chapter-03.md</span>
                <Badge tone="success">Saved</Badge>
              </div>
              <div className="px-7 py-8">
                <p className="rp-eyebrow">Chapter three</p>
                <h3 className="rp-display mt-3 text-3xl">The house at the end of the road</h3>
                <p className="rp-display mt-5 text-[1.15rem] leading-[1.7] text-[var(--rp-text)] opacity-90">
                  By the time she reached the gate the light had gone the colour of weak tea, and the hedges had begun to lean toward each other as if sharing something
                  <span className="ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] bg-[var(--rp-accent)]" />
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-3">
                <span className="rp-mono rp-faint text-xs">1,204 words &middot; 5 min read</span>
                <span className="flex items-center gap-2 text-xs rp-sub">
                  Focus mode
                  <Switch checked={focus} onCheckedChange={setFocus} aria-label="Focus mode" />
                </span>
              </div>
            </Card>
          </div>
        </div>

        <Section eyebrow="01 / Palette" title="Three colours doing the work">
          <div className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
            {tokens.map(([key, name, use]) => (
              <div key={key} className="flex items-center gap-4 border-b border-[var(--line)] py-4">
                <span className="size-9 flex-none rounded-full border border-[var(--rp-hlHigh)]" style={{ background: `var(--rp-${key})` }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize">{name}</p>
                  <p className="rp-faint text-xs">{use}</p>
                </div>
                <span className="rp-mono rp-faint text-xs">{pal[key as keyof typeof pal]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 / Type" title="A serif that leans back">
          <div className="grid gap-7">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-1 sm:grid-cols-[100px_1fr] sm:gap-6">
                <p className="rp-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="03 / Components" title="Hairlines, not shadows">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="grid gap-5">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>One filled action, everything else quiet.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Publish</Button>
                <Button>Save draft</Button>
                <Button variant="ghost">Discard</Button>
                <Button variant="link">Learn more</Button>
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
                <CardDescription>Fields sit flat, and light up on focus.</CardDescription>
              </div>
              <Input label="Title" placeholder="An untitled evening" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm">Spelling suggestions</p>
                  <p className="rp-faint text-xs">Underline, never interrupt</p>
                </div>
                <Switch checked={spell} onCheckedChange={setSpell} aria-label="Spelling suggestions" />
              </div>
            </Card>
            <Card className="grid gap-5">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>The underline glides between tabs.</CardDescription>
              </div>
              <Tabs label="Library" items={[{ id: 'drafts', label: 'Drafts' }, { id: 'published', label: 'Published' }, { id: 'archive', label: 'Archive' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-2">
                <Badge>Neutral</Badge>
                <Badge tone="accent">Iris</Badge>
                <Badge tone="success">Published</Badge>
                <Badge tone="warning">In review</Badge>
                <Badge tone="danger">Overdue</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <Alert title="Autosaved">Your last edit was saved 4 seconds ago.</Alert>
              <Alert tone="warning" title="Chapter is 30% over target">Consider splitting the scene at the lake.</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="04 / In use" title="A journal, listed">
          <div>
            <div className="flex items-end justify-between">
              <p className="rp-sub text-sm">Four pieces, 4,916 words this month</p>
              <Button variant="link" size="sm">
                View all
              </Button>
            </div>
            <ul className="mt-4">
              {entries.map((entry) => (
                <li key={entry.title} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[var(--line)] py-5 sm:grid-cols-[70px_1fr_90px_110px]">
                  <span className="rp-mono rp-faint hidden text-xs sm:block">{entry.date}</span>
                  <span className="rp-display text-xl">{entry.title}</span>
                  <span className="rp-mono rp-faint hidden text-xs sm:block">{entry.words} w</span>
                  <span className="justify-self-end">
                    <Badge tone={entry.tone}>{entry.tag}</Badge>
                  </span>
                </li>
              ))}
              <li className="border-t border-[var(--line)]" />
            </ul>
            <div className="mt-8 flex items-center gap-3 text-sm rp-sub">
              <Icon d="M5 12.5l4.5 4.5L19 7.5" />
              All changes synced to your notebook.
            </div>
          </div>
        </Section>

        <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] px-5 py-10 sm:px-8">
          <span className="rp-display text-lg">Nocturne</span>
          <span className="rp-sub text-sm">Made for the last hour of the day.</span>
          <span className="rp-mono rp-faint text-xs">v2.0</span>
        </footer>
      </StyleDusk>
    </div>
  )
}
