import { useState, type ReactNode } from 'react'
import { Editorial, EdAlert, EdBadge, EdButton, EdCard, EdField, EdSwitch, EdTabs, EdText, EdTitle, type EditorialProps } from './style-editorial'

// 页边注：每个分节右侧的小字说明，对应 Tufte 的 margin note。
const NOTES: Record<string, string> = {
  '01': 'Ink and paper carry the page. The accent is used like a red pencil: rules, links, the drop cap, and nothing else.',
  '02': 'A display serif for headlines, a text serif for reading. Headings are italic rather than bold, and emphasis is italic too.',
  '03': 'Controls stay quiet: hairlines, small capitals, no shadows. Hovering fades color in over 200 milliseconds.',
  '04': 'Prices use lining tabular figures. Columns are divided by rules, not boxes; tint is reserved for the recommended plan.',
}

const SWATCHES = [
  { name: 'Paper', varName: '--ed-paper', note: '85% / ground' },
  { name: 'Panel', varName: '--ed-panel', note: 'tinted panels' },
  { name: 'Ink', varName: '--ed-ink', note: '10% / text, rules' },
  { name: 'Red pencil', varName: '--ed-accent', note: '4% / accent' },
  { name: 'Ochre', varName: '--ed-sun', note: 'tag' },
  { name: 'Rose', varName: '--ed-pink', note: 'tag' },
  { name: 'Sage', varName: '--ed-mint', note: 'tag' },
]

const RATIO = [
  { name: 'paper', varName: '--ed-paper', pct: 85 },
  { name: 'ink', varName: '--ed-ink', pct: 10 },
  { name: 'accent', varName: '--ed-accent', pct: 4 },
  { name: 'sun', varName: '--ed-sun', pct: 1 },
]

const PLANS = [
  {
    name: 'Reader',
    monthly: 0,
    yearly: 0,
    unit: 'free',
    blurb: 'The weekly essay, in your inbox.',
    features: ['One essay a week', 'Full archive, limited', 'Reading list'],
    cta: 'Subscribe',
    featured: false,
  },
  {
    name: 'Member',
    monthly: 8,
    yearly: 6,
    unit: 'a month',
    blurb: 'Everything we publish, and a say in what comes next.',
    features: ['All essays and interviews', 'Complete archive', 'Print-ready PDFs', 'Member letters'],
    cta: 'Become a member',
    featured: true,
    badge: 'Recommended',
  },
  {
    name: 'Patron',
    monthly: 40,
    yearly: 33,
    unit: 'a month',
    blurb: 'For those who want to fund the work.',
    features: ['Everything in Member', 'Name in the masthead', 'Annual printed volume', 'Two guest passes'],
    cta: 'Support us',
    featured: false,
  },
]

const TABS = [
  {
    id: 'issue',
    label: 'This issue',
    body: 'Twelve pieces on typography, from grid systems to the lost art of the footnote.',
  },
  {
    id: 'archive',
    label: 'Archive',
    body: 'Thirty-six issues, searchable by author, subject and reading time.',
  },
  { id: 'letters', label: 'Letters', body: 'Readers write in about hyphenation, kerning and the em dash.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="ed-section">
      <header className="ed-section-head">
        <span className="ed-kicker">{kicker}</span>
        <h2 className="ed-h2">{title}</h2>
      </header>
      <div className="ed-section-body">
        <div style={{ minWidth: 0 }}>{children}</div>
        <aside className="ed-margin">
          <span className="ed-sn">{kicker}</span>
          {NOTES[kicker]}
        </aside>
      </div>
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="ed-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: EditorialProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <Editorial {...props} className="h-full overflow-y-auto">
      <div className="ed-wrap">
        <div className="ed-masthead">
          <span className="ed-meta">Vol. 3 · No. 12</span>
          <span className="ed-masthead-name">The Margin Review</span>
          <span className="ed-meta">Autumn edition</span>
        </div>
        <header className="ed-hero">
          <div className="ed-stack" style={{ gap: 'calc(1.4rem * var(--ed-density))' }}>
            <span className="ed-kicker">Essay · Typography</span>
            <EdTitle as="h1" className="ed-display">
              White space is a <span className="ed-mark">decision</span>
            </EdTitle>
            <EdText className="ed-lead">A short case for setting the margins first and letting the words find their way in.</EdText>
            <div className="ed-byline">
              <span>
                By <em>Nora Whitfield</em>
              </span>
              <span className="ed-meta">9 min read</span>
              <EdBadge tone="accent">Style sheet</EdBadge>
            </div>
            <EdText className="ed-drop" style={{ maxWidth: 'calc(var(--ed-measure) * 1ch)' }}>
              For most of the web’s history we treated white space as whatever was left once the content had been placed.<sup className="ed-sn">1</sup> The best pages now do the opposite: they decide the margins first, and let the words find their way in.
            </EdText>
            <div className="ed-row" style={{ gap: '1.4rem' }}>
              <EdButton size="lg">Read the essay</EdButton>
              <EdButton size="lg" variant="secondary">
                Subscribe
              </EdButton>
            </div>
          </div>
          <aside className="ed-stack" style={{ gap: 'calc(1.7rem * var(--ed-density))' }}>
            <figure className="ed-figure">
              <svg viewBox="0 0 240 96" aria-hidden>
                <path d="M0 78 H240 M0 52 H240 M0 26 H240" stroke="currentColor" strokeOpacity="0.14" fill="none" />
                <path d="M0 70 L34 62 L68 68 L102 44 L136 50 L170 30 L204 34 L240 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="240" cy="12" r="3.4" style={{ fill: 'var(--ed-accent)' }} />
                <text x="236" y="32" textAnchor="end" style={{ fill: 'var(--ed-accent)', fontSize: 11, fontStyle: 'italic' }}>
                  66
                </text>
                <text x="0" y="94" style={{ fill: 'var(--ed-muted)', fontSize: 9 }}>
                  2019
                </text>
                <text x="240" y="94" textAnchor="end" style={{ fill: 'var(--ed-muted)', fontSize: 9 }}>
                  2025
                </text>
              </svg>
              <figcaption>
                <em>Figure 1.</em> Average line length of the most-read articles, in characters.
              </figcaption>
            </figure>
            <p className="ed-margin">
              <span className="ed-sn">1</span>
              Between 45 and 75 characters is the comfortable range for most readers; 66 is the classic target.
            </p>
            <blockquote className="ed-pull">“The margin is where the page breathes.”</blockquote>
          </aside>
        </header>

        <Section kicker="01" title="Palette">
          <div className="ed-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="ed-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="ed-swatch">
                <div className="ed-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="ed-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="ed-scale">
            <div className="ed-scale-row">
              <span className="ed-meta">Display</span>
              <span className="ed-display">White space</span>
            </div>
            <div className="ed-scale-row">
              <span className="ed-meta">Heading</span>
              <span className="ed-h2">Set the margins first</span>
            </div>
            <div className="ed-scale-row">
              <span className="ed-meta">Subhead</span>
              <span className="ed-h3">Italic, never bold</span>
            </div>
            <div className="ed-scale-row">
              <span className="ed-meta">Body</span>
              <span className="ed-body">Body text is a text serif at 17px on a 1.6 line height, held to a measure of about 64 characters.</span>
            </div>
            <div className="ed-scale-row">
              <span className="ed-meta">Caption</span>
              <span className="ed-small">Caption, 14px, muted ink, for figures and sources</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="ed-two">
            <div className="ed-stack">
              <div className="ed-row">
                <EdButton>Primary</EdButton>
                <EdButton variant="secondary">Secondary</EdButton>
                <EdButton variant="ghost">Ghost</EdButton>
                <EdButton variant="danger">Delete</EdButton>
              </div>
              <div className="ed-row">
                <EdButton size="sm">Small</EdButton>
                <EdButton size="md">Medium</EdButton>
                <EdButton size="lg">Large</EdButton>
                <EdButton disabled>Disabled</EdButton>
              </div>
              <div className="ed-row">
                <EdBadge>Draft</EdBadge>
                <EdBadge tone="accent">New</EdBadge>
                <EdBadge tone="sun">Beta</EdBadge>
                <EdBadge tone="mint">Live</EdBadge>
                <EdBadge tone="pink">Paused</EdBadge>
                <EdBadge tone="ink">v2.4</EdBadge>
              </div>
              <EdTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <EdCard>
                <EdTitle>{active.label}</EdTitle>
                <EdText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </EdText>
              </EdCard>
            </div>
            <div className="ed-stack">
              <EdField label="Email address" defaultValue="nora@margin.example" hint="One essay a week. Unsubscribe any time." />
              <EdField label="Search the archive" placeholder="Try “kerning”" />
              <div className="ed-row">
                <EdSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <EdSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <EdAlert tone="success" title="Subscription confirmed">
                The next issue arrives on Sunday morning.
              </EdAlert>
              <EdAlert tone="warn" title="Payment method expires">
                Update your card before 1 November.
              </EdAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="ed-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--ed-density))' }}>
            <EdSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="ed-grid">
            {PLANS.map((plan) => (
              <EdCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="ed-plan">
                <div className="ed-row" style={{ justifyContent: 'space-between' }}>
                  <EdTitle>{plan.name}</EdTitle>
                  {plan.badge ? <EdBadge tone="sun">{plan.badge}</EdBadge> : null}
                </div>
                <p className="ed-price">
                  <span className="ed-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="ed-price-unit">{plan.unit}</span>
                </p>
                <EdText muted={!plan.featured}>{plan.blurb}</EdText>
                <ul className="ed-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="ed-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <EdButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </EdButton>
              </EdCard>
            ))}
          </div>

          <EdCard className="ed-settings" style={{ marginTop: 'calc(2rem * var(--ed-density))' }}>
            <div className="ed-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <EdTitle>Reader settings</EdTitle>
                <EdText muted style={{ marginTop: '0.25rem' }}>
                  How the letter reaches you.
                </EdText>
              </div>
              <span className="ed-avatar" aria-hidden>N</span>
            </div>
            <div className="ed-two" style={{ marginTop: 'calc(1.25rem * var(--ed-density))' }}>
              <EdField label="Workspace name" defaultValue="Nora Whitfield" />
              <EdField label="Billing email" type="email" defaultValue="nora@margin.example" hint="Receipts go here." />
            </div>
            <div className="ed-row" style={{ marginTop: 'calc(1.25rem * var(--ed-density))', justifyContent: 'space-between' }}>
              <EdBadge tone="mint">All changes saved</EdBadge>
              <div className="ed-row">
                <EdButton variant="ghost">Discard</EdButton>
                <EdButton>Save changes</EdButton>
              </div>
            </div>
          </EdCard>
        </Section>

        <p className="ed-footnote">The Margin Review, set in Instrument Serif and Newsreader. Change the red pencil and every rule and link follows.</p>
      </div>
    </Editorial>
  )
}
