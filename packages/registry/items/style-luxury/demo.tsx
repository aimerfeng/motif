import { useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, CardDescription, CardTitle, Input, Ornament, StyleLuxury, Switch, Tabs, type StyleLuxuryProps } from './style-luxury'

/** 表盘：纯 SVG，颜色取自当前风格的令牌。 */
function Watch({ size = 260, dial = 'var(--lx-navy)', hands = 'var(--lx-accent)', time = [10, 9] }: { size?: number; dial?: string; hands?: string; time?: [number, number] }) {
  const [h, m] = time
  const ha = ((h % 12) + m / 60) * 30
  const ma = m * 6
  const ticks = Array.from({ length: 60 }, (_, i) => i)
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Wristwatch face" style={{ maxWidth: '100%' }}>
      <defs>
        <radialGradient id={`dial-${dial}`.replace(/[^a-z0-9-]/gi, '')} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={dial} stopOpacity="1" />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </radialGradient>
        <linearGradient id="lx-bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lx-accent)" />
          <stop offset=".5" stopColor="color-mix(in oklab, var(--lx-accent) 40%, #000)" />
          <stop offset="1" stopColor="var(--lx-accent)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#lx-bezel)" />
      <circle cx="100" cy="100" r="90.5" fill="#0b0a09" />
      <circle cx="100" cy="100" r="88" fill={dial} />
      <circle cx="100" cy="100" r="88" fill={`url(#${`dial-${dial}`.replace(/[^a-z0-9-]/gi, '')})`} />
      {ticks.map((i) => {
        const major = i % 5 === 0
        const a = (i * 6 * Math.PI) / 180
        const r1 = major ? 72 : 80
        return <line key={i} x1={100 + Math.sin(a) * r1} y1={100 - Math.cos(a) * r1} x2={100 + Math.sin(a) * 84} y2={100 - Math.cos(a) * 84} stroke={hands} strokeWidth={major ? 2 : 0.6} strokeLinecap="round" opacity={major ? 1 : 0.6} />
      })}
      <text x="100" y="58" textAnchor="middle" fontSize="7" letterSpacing="2.4" fill={hands} style={{ fontFamily: 'var(--lx-body)' }}>
        AURELLE
      </text>
      <text x="100" y="142" textAnchor="middle" fontSize="5" letterSpacing="2" fill={hands} opacity=".7" style={{ fontFamily: 'var(--lx-body)' }}>
        MERIDIAN 38
      </text>
      <g transform={`rotate(${ha} 100 100)`}>
        <path d="M100 104 L96 100 L100 56 L104 100 Z" fill={hands} />
      </g>
      <g transform={`rotate(${ma} 100 100)`}>
        <path d="M100 108 L97.5 100 L100 34 L102.5 100 Z" fill={hands} />
      </g>
      <line x1="100" y1="112" x2="100" y2="24" stroke="var(--lx-champagne)" strokeWidth=".8" transform="rotate(148 100 100)" opacity=".85" />
      <circle cx="100" cy="100" r="4" fill={hands} />
      <circle cx="100" cy="100" r="1.6" fill="#0b0a09" />
    </svg>
  )
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
      <Ornament className="mb-10" />
      <div className="text-center">
        <p className="lx-eyebrow">{eyebrow}</p>
        <h2 className="lx-display mx-auto mt-5 max-w-2xl text-4xl sm:text-5xl">{title}</h2>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  )
}

const scale = [
  { name: 'Display', cls: 'lx-display text-6xl', sample: 'An unhurried elegance' },
  { name: 'Title', cls: 'lx-display text-4xl', sample: 'Made by a few, for a few' },
  { name: 'Heading', cls: 'lx-display text-2xl italic', sample: 'Set in a high-contrast serif' },
  { name: 'Body', cls: 'text-base lx-dim', sample: 'Body copy is a quiet sans at 15px with generous leading, so the serif headings can do the talking.' },
  { name: 'Label', cls: 'lx-eyebrow', sample: 'Small caps, tracked wide' },
]

const pieces = [
  { name: 'The Meridian', ref: 'Ref. 3801', price: '14,800', dial: 'var(--lx-navy)', detail: '38 mm, 18k rose gold, midnight dial', time: [10, 9] as [number, number] },
  { name: 'The Solstice', ref: 'Ref. 3814', price: '18,200', dial: 'var(--lx-plum)', detail: '36 mm, 18k yellow gold, plum dial', time: [8, 20] as [number, number] },
  { name: 'The Vesper', ref: 'Ref. 3822', price: '11,400', dial: '#1a1917', detail: '40 mm, steel and gold, onyx dial', time: [2, 45] as [number, number] },
]

export function Demo(props: StyleLuxuryProps) {
  const [tab, setTab] = useState('collection')
  const [wait, setWait] = useState(true)
  const [gift, setGift] = useState(false)

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleLuxury {...props}>
        <header className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <span className="lx-eyebrow hidden sm:block">Vol. IV &middot; Autumn 2026</span>
            <span className="lx-display text-center text-xl tracking-[0.4em] sm:text-2xl">AURELLE</span>
            <span className="lx-eyebrow justify-self-end">Bag &middot; 0</span>
          </div>
          <div className="lx-rule-double mt-5" />
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 py-2" aria-label="Primary">
            {['Collections', 'The Atelier', 'Journal', 'Boutiques', 'Care'].map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>
          <div className="lx-rule" />
        </header>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:pt-20">
          <div>
            <p className="lx-eyebrow">The Meridian collection</p>
            <h1 className="lx-display mt-7 text-6xl sm:text-7xl lg:text-[5.6rem]">
              Time, <span className="lx-em">made by hand.</span>
            </h1>
            <p className="lx-dim mt-8 max-w-md text-lg lx-dropcap">Every Aurelle movement takes four hundred and twelve hours to finish, and is signed by the one person who made it. We build fewer than three hundred a year.</p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Button variant="primary" size="lg">
                Reserve a viewing
              </Button>
              <Button variant="link">Read the story</Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[380px]">
            <div className="relative overflow-hidden border border-[var(--hair)] p-3 pb-10" style={{ borderRadius: '999px 999px 2px 2px', background: 'linear-gradient(180deg, color-mix(in oklab, var(--lx-navy) 55%, var(--lx-base100)), var(--lx-base100))' }}>
              <div className="pointer-events-none absolute inset-3 border border-[var(--hair-soft)]" style={{ borderRadius: '999px 999px 0 0' }} />
              <div className="relative grid place-items-center pt-14" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.45))' }}>
                <Watch size={290} />
              </div>
              <div className="relative mt-8 text-center">
                <p className="lx-display text-2xl">The Meridian</p>
                <p className="lx-eyebrow mt-3">From $14,800</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="lx-rule" />
          <dl className="grid grid-cols-3 text-center">
            {[
              ['412', 'Hours per movement'],
              ['38', 'Makers in Geneva'],
              ['1921', 'The first atelier'],
            ].map(([n, l], i) => (
              <div key={l} className={'py-8 ' + (i ? 'border-l border-[var(--hair-soft)]' : '')}>
                <dt className="lx-num lx-display text-4xl sm:text-5xl">{n}</dt>
                <dd className="lx-eyebrow mt-3 px-2">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="lx-rule" />
        </div>

        <Section eyebrow="I &middot; Palette" title={<>A little gold goes a <span className="lx-em">long way</span></>}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
            {[
              ['Gold', 'var(--lx-accent)'],
              ['Champagne', 'var(--lx-fg)'],
              ['Base 100', 'var(--lx-base100)'],
              ['Base 200', 'var(--lx-base200)'],
              ['Base 300', 'var(--lx-base300)'],
              ['Midnight', 'var(--lx-navy)'],
              ['Plum', 'var(--lx-plum)'],
            ].map(([name, v]) => (
              <div key={name}>
                <div className="h-36 border border-[var(--hair)]" style={{ background: v, borderRadius: 'var(--r)' }} />
                <p className="lx-eyebrow mt-4">{name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="II &middot; Type" title="A serif with a sharp edge">
          <Card framed className="grid gap-6 p-10">
            {scale.map((row) => (
              <div key={row.name} className="grid items-baseline gap-2 border-b border-[var(--hair-soft)] pb-6 last:border-0 last:pb-0 sm:grid-cols-[120px_1fr] sm:gap-8">
                <p className="lx-eyebrow">{row.name}</p>
                <p className={row.cls}>{row.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section eyebrow="III &middot; Components" title="Lines, not fills">
          <div className="grid gap-6 md:grid-cols-2">
            <Card framed className="grid gap-6">
              <div>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Outlined and quiet. One gold fill per page.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <Button variant="primary">Reserve</Button>
                <Button>Enquire</Button>
                <Button variant="ghost">Later</Button>
                <Button variant="link">Details</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Card>
            <Card framed className="grid gap-6">
              <div>
                <CardTitle>Form</CardTitle>
                <CardDescription>Inputs are a single line under italic text.</CardDescription>
              </div>
              <Input label="Full name" placeholder="As it should appear on the certificate" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="lx-display text-lg">Join the waiting list</p>
                  <p className="lx-dim text-xs">Notified when a piece becomes available</p>
                </div>
                <Switch checked={wait} onCheckedChange={setWait} aria-label="Join the waiting list" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="lx-display text-lg">Gift presentation</p>
                  <p className="lx-dim text-xs">Hand-wrapped in the atelier</p>
                </div>
                <Switch checked={gift} onCheckedChange={setGift} aria-label="Gift presentation" />
              </div>
            </Card>
            <Card framed className="grid gap-6">
              <div>
                <CardTitle>Tabs and badges</CardTitle>
                <CardDescription>A diamond travels along the gold line.</CardDescription>
              </div>
              <Tabs label="Section" items={[{ id: 'collection', label: 'Collection' }, { id: 'atelier', label: 'Atelier' }, { id: 'care', label: 'Care' }]} value={tab} onValueChange={setTab} />
              <div className="flex flex-wrap gap-3">
                <Badge tone="neutral">Limited</Badge>
                <Badge tone="accent">New</Badge>
                <Badge tone="success">Available</Badge>
                <Badge tone="warning">Two remaining</Badge>
                <Badge tone="danger">Sold</Badge>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <Alert title="Your viewing is confirmed">Thursday at 4 pm, Rue du Rhône. A private room has been prepared.</Alert>
              <Alert tone="warning" title="Only two pieces remain">The Solstice is nearly allocated for this year.</Alert>
            </div>
          </div>
        </Section>

        <Section eyebrow="IV &middot; In use" title={<>The <span className="lx-em">collection</span></>}>
          <div className="grid gap-6 md:grid-cols-3">
            {pieces.map((p) => (
              <Card key={p.name} framed className="grid gap-4 text-center">
                <div className="grid place-items-center py-2" style={{ filter: 'drop-shadow(0 18px 22px rgba(0,0,0,.35))' }}>
                  <Watch size={170} dial={p.dial} time={p.time} />
                </div>
                <div>
                  <p className="lx-eyebrow">{p.ref}</p>
                  <h3 className="lx-display mt-3 text-2xl">{p.name}</h3>
                  <p className="lx-dim mt-2 text-sm">{p.detail}</p>
                </div>
                <p className="lx-num lx-display text-2xl">${p.price}</p>
                <Button className="mx-auto">Enquire</Button>
              </Card>
            ))}
          </div>
          <Card tone="navy" framed className="mx-auto mt-12 max-w-3xl text-center">
            <p className="lx-display text-3xl italic leading-snug sm:text-4xl">&ldquo;It doesn&rsquo;t tick like a machine. It breathes.&rdquo;</p>
            <div className="mt-6 flex justify-center">
              <Ornament className="w-40" />
            </div>
            <p className="lx-eyebrow mt-5 opacity-80">Collector, Lausanne</p>
          </Card>
        </Section>

        <footer className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8">
          <div className="lx-rule-double" />
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
            <span className="lx-display text-xl tracking-[0.4em]">AURELLE</span>
            <span className="lx-dim text-sm">Rue du Rhône, Geneva &middot; By appointment</span>
            <span className="lx-eyebrow">MMXXVI</span>
          </div>
        </footer>
      </StyleLuxury>
    </div>
  )
}
