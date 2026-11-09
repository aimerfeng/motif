import { cssVars, useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  Banner,
  BlockText,
  Button,
  Card,
  Crest,
  defaults,
  Input,
  Jersey,
  Patch,
  Pennant,
  Segmented,
  Stripes,
  Switch,
  Tabs,
  Varsity,
  varsityPalette,
  Wrap,
  type VarsityProps,
} from './style-varsity'

/** 标题字体的字号：宽体字体会按比例缩小，所以字号走 --t 而不是 Tailwind 的 text-*。 */
const t = (size: string) => cssVars({ '--t': size })

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" />
  </svg>
)

const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden className={className}>
    <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" />
  </svg>
)

function Heading({ n, kicker, title, children }: { n: string; kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-3 md:items-end">
      <Patch letter={n} size={60} shape="square" tone="secondary" label={`Section ${n}`} className="md:row-span-2 md:mb-2" />
      <p className="vs-label vs-muted m-0">{kicker}</p>
      <BlockText as="h2" size="clamp(1.6rem, 3.6vw + .6rem, 3.3rem)" className="col-span-2 md:col-span-1 md:col-start-2">
        {title}
      </BlockText>
      {children ? <p className="vs-muted col-span-2 m-0 max-w-xl text-[15px] md:col-start-2">{children}</p> : null}
    </div>
  )
}

/** 现场比分：比赛钟按 useFrameLoop 的时间走，截图和减少动态效果下都是确定的。 */
function LiveScores() {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef(0)
  const [tick, setTick] = useState(0)
  useFrameLoop(ref, ({ time }) => {
    const s = Math.floor(time)
    if (s !== last.current) {
      last.current = s
      setTick(s)
    }
  })
  const clock = 61 * 60 + 8 + tick
  const mm = String(Math.floor(clock / 60)).padStart(2, '0')
  const ss = String(clock % 60).padStart(2, '0')
  const games = [
    { sport: "Women's soccer", state: `2nd half · ${mm}:${ss}`, home: 2, away: 1, them: 'Comets', live: true },
    { sport: 'Field hockey', state: 'Final', home: 3, away: 0, them: 'Gulls', live: false },
    { sport: 'Rugby sevens', state: 'Kick-off 3:00 pm', home: null, away: null, them: 'Rams', live: false },
  ]
  return (
    <div ref={ref}>
      <Card tone="primary" className="grid gap-5 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-center lg:gap-0">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start">
          <Badge tone="secondary">
            <span className="inline-block size-2 rounded-full bg-current" style={{ opacity: tick % 2 === 0 ? 1 : 0.35 }} />
            Live now
          </Badge>
          <p className="vs-label m-0 opacity-80">Saturday scores</p>
        </div>
        <div className="grid border-t-2 border-dashed border-current/25 md:grid-cols-3 lg:border-l-2 lg:border-t-0">
        {games.map((g, i) => (
          <div key={g.sport} className={`min-w-0 py-5 last:pb-0 md:px-6 md:pb-0 md:first:pl-0 lg:py-0 lg:first:pl-7 ${i > 0 ? 'border-t-2 border-dashed border-current/25 md:border-l-2 md:border-t-0' : ''}`}>
            <p className="vs-label m-0 opacity-80">{g.sport}</p>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
              {[
                { team: 'Kestrels', score: g.home, lead: g.home !== null && g.away !== null && g.home >= g.away },
                { team: g.them, score: g.away, lead: g.home !== null && g.away !== null && g.away >= g.home },
              ].map((row) => (
                <div key={row.team} className="contents">
                  <span className={`vs-display truncate leading-[1.3] ${row.lead || row.score === null ? '' : 'opacity-70'}`} style={t('1.25rem')}>{row.team}</span>
                  <span className={`vs-num leading-[1.2] ${row.lead ? '' : 'opacity-70'}`} style={t('1.5rem')}>{row.score ?? '–'}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-2 text-[14px] font-medium tabular-nums opacity-85">{g.state}</p>
          </div>
        ))}
        </div>
      </Card>
    </div>
  )
}

const fixtures = [
  { month: 'Oct', day: '16', dow: 'Fri', sport: "Women's soccer", opp: 'Eastfield Comets', where: 'home', venue: 'Alder Field', when: '7:00 pm', tag: null },
  { month: 'Oct', day: '17', dow: 'Sat', sport: 'Football', opp: 'Marlow Prep Foxes', where: 'home', venue: 'Calder Bowl', when: '1:30 pm', tag: 'Homecoming' },
  { month: 'Oct', day: '17', dow: 'Sat', sport: 'Volleyball', opp: "St. Brennan's Owls", where: 'away', venue: 'Brennan Fieldhouse', when: '4:00 pm', tag: null },
  { month: 'Oct', day: '18', dow: 'Sun', sport: 'Cross country', opp: 'Linden Bay Invitational', where: 'away', venue: 'Linden Bay Park', when: '9:00 am', tag: null },
  { month: 'Oct', day: '10', dow: 'Sat', sport: 'Football', opp: 'Harwood Tech Rams', where: 'away', venue: 'Final', when: 'W 24–17', tag: null },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ value: s, label: s }))

const NAV = [
  { label: 'Teams', href: '#top' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Kit shop', href: '#kit-shop' },
  { label: 'Alumni', href: '#alumni' },
]

export function Demo(props: VarsityProps) {
  const p = varsityPalette(props.primary ?? defaults.primary, props.secondary ?? defaults.secondary, props.ground ?? defaults.ground)
  const [kit, setKit] = useState<'home' | 'away' | 'alt'>('home')
  const [name, setName] = useState('Holloway')
  const [number, setNumber] = useState('26')
  const [size, setSize] = useState('M')
  const [sleeves, setSleeves] = useState(true)
  const [reminders, setReminders] = useState(true)

  const swatches = [
    { role: 'Home', hex: p.primary, use: 'Letter fill, buttons, the home kit' },
    { role: 'Trim', hex: p.secondary, use: 'Outer outline, sleeve stripes, stitching' },
    { role: 'Felt', hex: p.felt, use: 'The inner ring of every letter' },
    { role: 'Ink', hex: p.ink, use: 'Body copy and labels' },
  ]

  return (
    <div className="h-full w-full overflow-y-auto">
      <Varsity {...props}>
        <header>
          <Wrap className="flex h-[78px] items-center justify-between gap-4">
            <a href="#top" className="flex min-w-0 items-center gap-3 text-inherit no-underline" aria-label="Calder Hill Athletics, home">
              <Crest monogram="CH" className="h-12 w-auto shrink-0" />
              <span className="min-w-0">
                <span className="vs-display block truncate" style={t('1.05rem')}>Calder Hill</span>
                <span className="vs-label vs-muted mt-1 block truncate text-[.6rem]">Athletics · Est. 1926</span>
              </span>
            </a>
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <a key={item.label} href={item.href} className="vs-btn" data-variant="ghost" data-size="sm">
                  {item.label}
                </a>
              ))}
            </nav>
            <Button size="sm" className="shrink-0">
              Tickets
            </Button>
          </Wrap>
          {/* 平板和手机上导航换到第二行，放不下时横向滚动；焦点框画在里面，免得被滚动容器裁掉 */}
          <nav aria-label="Primary" className="border-t-2 border-dashed border-[var(--vs-line)] lg:hidden">
            <Wrap className="flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none]">
              {NAV.map((item, i) => (
                <a key={item.label} href={item.href} className={`vs-btn shrink-0 focus-visible:[outline-offset:-4px] ${i === 0 ? '-ml-[.8em]' : ''}`} data-variant="ghost" data-size="sm">
                  {item.label}
                </a>
              ))}
            </Wrap>
          </nav>
          <Stripes height={14} />
        </header>

        <main id="top">
          <section className="overflow-hidden">
            <Wrap className="grid items-center gap-12 pb-14 pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-14">
              <div className="min-w-0 lg:col-span-7">
                <div className="flex flex-wrap gap-2.5">
                  <Badge tone="ink">
                    <Star />
                    Homecoming week
                  </Badge>
                  <Badge tone="felt">Oct 16 – 18</Badge>
                </div>
                <p className="vs-label vs-ink-primary m-0 mt-8">Calder Hill College · Since 1926</p>
                <BlockText as="h1" className="mt-1 [--bt-min:2.1rem] [--fs:clamp(3rem,11vw,6.5rem)] lg:[--fs:clamp(3rem,8.2vw,6.5rem)]">
                  Kestrels
                </BlockText>
                <Banner className="ml-[0.4em] mt-2">Homecoming &rsquo;26 · Beat the Foxes</Banner>
                <p className="vs-muted m-0 mt-8 max-w-[33rem] text-[1.06rem]">
                  Three days of games, a bonfire on the quad and the alumni parade down College Street. Students get in free with a campus card.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button size="lg">
                    Get tickets <Arrow />
                  </Button>
                  <Button size="lg" variant="outline">
                    Weekend schedule
                  </Button>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[440px] lg:col-span-5" aria-label="Homecoming kit" role="group">
                <Pennant text="Kestrels" className="absolute left-[-4%] top-[0%] w-[74%] -rotate-[14deg]" />
                <Jersey name="Holloway" number="26" className="relative mx-auto mt-[20%] block w-[84%] rotate-[5deg]" />
                <Patch letter="K" size={104} label="Kestrels letter patch" className="absolute bottom-[3%] left-[-1%] -rotate-[9deg]" />
              </div>
            </Wrap>
          </section>

          <Wrap className="pb-20">
            <LiveScores />
          </Wrap>

          <section className="pb-24">
            <Wrap>
              <Heading n="1" kicker="Team colours" title="Two colours, one felt">
                Home fills the letters, trim rings them. Felt cream sits between the two so they never touch.
              </Heading>
              <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
                {swatches.map((s) => (
                  <Card key={s.role} className="p-4 sm:p-5">
                    <div className="aspect-[4/3] rounded-[calc(var(--vs-r)*.7)]" style={{ background: s.hex, boxShadow: 'inset 0 0 0 2px var(--vs-line)' }} />
                    <p className="vs-display m-0 mt-4" style={t('1.1rem')}>{s.role}</p>
                    <p className="vs-label vs-muted m-0 mt-1 !tracking-[.1em]">{s.hex}</p>
                    <p className="vs-muted m-0 mt-2 text-[13px] leading-snug">{s.use}</p>
                  </Card>
                ))}
              </div>
            </Wrap>
          </section>

          <section className="pb-24">
            <Wrap>
              <Heading n="2" kicker="Lettering" title="Block caps, always outlined">
                Display type is set in caps and always wears its outline. Body copy stays quiet so the letters can shout.
              </Heading>
              <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <Card className="min-w-0">
                  <p className="vs-label vs-muted m-0">Display, caps only</p>
                  <BlockText as="div" size="clamp(1.8rem, 5.2vw, 4.1rem)" className="mt-4">
                    ABCDEFGHI
                    <br />
                    JKLMNOPQR
                    <br />
                    STUVWXYZ&amp;
                  </BlockText>
                  <BlockText as="div" size="clamp(1.8rem, 5.2vw, 4.1rem)" tone="secondary" className="mt-2">
                    0123456789
                  </BlockText>
                </Card>
                <Card className="grid min-w-0 content-start gap-5">
                  <div>
                    <p className="vs-label vs-muted m-0">Jersey numbers</p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      <Patch letter="7" size={72} tone="primary" letterTone="felt" />
                      <Patch letter="12" size={72} tone="secondary" />
                      <Patch letter="23" size={72} tone="felt" shape="square" />
                      <Patch letter="44" size={72} tone="primary" letterTone="secondary" shape="square" />
                    </div>
                  </div>
                  <div className="border-t-2 border-dashed border-[var(--vs-line)] pt-5">
                    <p className="vs-label vs-muted m-0">Body, Outfit 16 / 25</p>
                    <p className="m-0 mt-2 text-[16px]">
                      Season tickets cover every home game across eleven sports, plus first pick of seats at the Calder Bowl for the homecoming game.
                    </p>
                  </div>
                  <div className="border-t-2 border-dashed border-[var(--vs-line)] pt-5">
                    <p className="vs-label m-0">Labels, 800 caps, +15%</p>
                  </div>
                </Card>
              </div>
            </Wrap>
          </section>

          <section id="kit-shop" className="pb-24">
            <Wrap>
              <Heading n="3" kicker="Kit shop" title="Build your jersey">
                Official replica tops, stitched to order in the campus store. Ready for pick-up in five working days.
              </Heading>
              <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                <Card tone="felt" className="grid min-h-[360px] place-items-center overflow-hidden">
                  <div className="relative w-full max-w-[380px]">
                    <Jersey name={name} number={number} kit={kit} stripes={sleeves} className="block w-full" />
                  </div>
                </Card>
                <Card className="grid min-w-0 content-start gap-6">
                  <div>
                    <Tabs
                      label="Kit"
                      idBase="kit"
                      value={kit}
                      onValueChange={(id) => setKit(id as typeof kit)}
                      items={[
                        { id: 'home', label: 'Home' },
                        { id: 'away', label: 'Away' },
                        { id: 'alt', label: 'Alternate' },
                      ]}
                    />
                    <div id={`kit-panel-${kit}`} role="tabpanel" aria-labelledby={`kit-tab-${kit}`} className="pt-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="vs-display m-0" style={t('1.3rem')}>{kit === 'home' ? 'Home' : kit === 'away' ? 'Away' : 'Alternate'} replica jersey</p>
                        <p className="vs-num m-0" style={t('1.5rem')}>${kit === 'alt' ? 74 : 68}</p>
                      </div>
                      <p className="vs-muted m-0 mt-1 text-[14px]">Heavyweight mesh, tackle-twill numbers, sewn not printed.</p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <Input label="Name on back" value={name} caps maxLength={12} autoComplete="off" onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z' .-]/g, '').slice(0, 12))} hint="Up to 12 letters." />
                    <Input label="Number" value={number} caps inputMode="numeric" maxLength={2} autoComplete="off" onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))} hint="0 to 99." />
                  </div>
                  <div className="grid gap-3">
                    <p className="vs-label vs-muted m-0" aria-hidden>
                      Size
                    </p>
                    <Segmented label="Size" options={SIZES} value={size} onValueChange={setSize} />
                  </div>
                  <div className="flex items-center justify-between gap-6 border-t-2 border-dashed border-[var(--vs-line)] pt-5">
                    <div>
                      <p className="m-0 font-semibold">Sleeve stripes</p>
                      <p className="vs-muted m-0 text-[14px]">Two trim bands on each cuff.</p>
                    </div>
                    <Switch checked={sleeves} onCheckedChange={setSleeves} aria-label="Sleeve stripes" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="lg" className="grow sm:grow-0">
                      Add to bag · ${kit === 'alt' ? 74 : 68}
                    </Button>
                    <Button variant="ghost">Size guide</Button>
                  </div>
                </Card>
              </div>
            </Wrap>
          </section>

          <section className="pb-24">
            <Wrap>
              <Heading n="4" kicker="Components" title="Patches, pennants, buttons">
                Every surface is felt with a running stitch. Rings follow the lettering: chenille, tackle twill or drop shadow.
              </Heading>
              <div className="mt-10 grid gap-6">
                {[
                  {
                    name: 'Buttons',
                    body: (
                      <div className="flex flex-wrap items-center gap-5">
                        <Button>
                          Buy tickets <Arrow />
                        </Button>
                        <Button variant="secondary">Join the club</Button>
                        <Button variant="outline">View roster</Button>
                        <Button variant="ghost">Cancel</Button>
                        <Button size="sm">Small</Button>
                        <Button disabled>Sold out</Button>
                      </div>
                    ),
                  },
                  {
                    name: 'Badges',
                    body: (
                      <div className="flex flex-wrap gap-3">
                        <Badge>Varsity</Badge>
                        <Badge tone="secondary">Captain</Badge>
                        <Badge tone="felt">JV</Badge>
                        <Badge tone="ink">Class of &rsquo;27</Badge>
                        <Badge tone="outline">Away</Badge>
                      </div>
                    ),
                  },
                  {
                    name: 'Pennants',
                    body: (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Pennant text="Champs 2025" className="w-full max-w-[340px]" />
                        <Pennant text="Go Kestrels" tone="secondary" className="w-full max-w-[340px]" />
                      </div>
                    ),
                  },
                  {
                    name: 'Crests and patches',
                    body: (
                      <div className="flex flex-wrap items-center gap-7">
                        <Crest monogram="CH" year="1926" className="h-[132px] w-auto" />
                        <Patch letter="K" size={96} />
                        <Patch letter="C" size={96} tone="primary" letterTone="felt" shape="square" />
                        <Patch letter="H" size={96} tone="felt" />
                      </div>
                    ),
                  },
                  {
                    name: 'Switch',
                    body: (
                      <div className="flex max-w-xl items-center justify-between gap-6">
                        <div>
                          <p className="m-0 font-semibold">Game-day reminders</p>
                          <p className="vs-muted m-0 text-[14px]">A text two hours before kick-off, with the gate to use.</p>
                        </div>
                        <Switch checked={reminders} onCheckedChange={setReminders} aria-label="Game-day reminders" />
                      </div>
                    ),
                  },
                ].map((row) => (
                  <div key={row.name} className="grid gap-4 border-t-2 border-dashed border-[var(--vs-line)] pt-6 md:grid-cols-[200px_minmax(0,1fr)]">
                    <p className="vs-label vs-muted m-0 pt-2">{row.name}</p>
                    <div className="min-w-0">{row.body}</div>
                  </div>
                ))}
              </div>
            </Wrap>
          </section>

          <section id="schedule" className="pb-24">
            <Wrap>
              <Heading n="5" kicker="Schedule" title="Fixtures and results" />
              <Card className="mt-10 p-0 sm:p-0" stitched={false}>
                <ul className="m-0 list-none p-0">
                  {fixtures.map((f, i) => (
                    <li key={`${f.day}-${f.sport}`} className={`grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-5 gap-y-3 px-5 py-5 sm:px-7 md:grid-cols-[72px_minmax(0,1fr)_120px_130px] ${i > 0 ? 'border-t-2 border-dashed border-[var(--vs-line)]' : ''}`}>
                      <div className="text-center">
                        <p className="vs-label vs-muted m-0 text-[.62rem]">
                          {f.dow} · {f.month}
                        </p>
                        <p className="vs-num m-0 leading-[1.05]" style={t('2rem')}>{f.day}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="vs-label vs-ink-primary m-0">
                          {f.sport}
                          {f.tag ? <Badge tone="secondary" className="ml-2.5 align-middle">{f.tag}</Badge> : null}
                        </p>
                        <p className="m-0 mt-1 truncate text-[1.08rem] font-semibold">
                          {f.where === 'home' ? 'vs.' : 'at'} {f.opp}
                        </p>
                      </div>
                      <div className="col-start-2 flex flex-wrap items-center gap-3 md:col-start-auto">
                        <Badge tone={f.where === 'home' ? 'primary' : 'outline'}>{f.where === 'home' ? 'Home' : 'Away'}</Badge>
                        <span className="vs-muted text-[13px] md:hidden">{f.venue}</span>
                      </div>
                      <div className="col-start-2 md:col-start-auto md:text-right">
                        <p className="vs-num m-0 whitespace-nowrap" style={t('1.2rem')}>{f.when}</p>
                        <p className="vs-muted m-0 hidden text-[13px] md:block">{f.venue}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </Wrap>
          </section>
        </main>

        <footer>
          <Stripes height={18} />
          <Wrap className="grid gap-8 py-12 md:grid-cols-[auto_1fr_auto] md:items-center">
            <Crest monogram="CH" year="1926" className="h-[96px] w-auto" />
            <div>
              <p className="vs-display m-0" style={t('1.3rem')}>Calder Hill Athletics</p>
              <p className="vs-muted m-0 mt-1 text-[14px]">Field House, 400 College Street · Box office open weekdays 10 to 4</p>
            </div>
            <p className="vs-label vs-muted m-0">&copy; 2026 Calder Hill College</p>
          </Wrap>
        </footer>
      </Varsity>
    </div>
  )
}
