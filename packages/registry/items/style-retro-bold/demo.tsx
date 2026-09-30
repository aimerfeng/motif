import { useState, type ReactNode } from 'react'
import { RetroBold, RbAlert, RbBadge, RbButton, RbCard, RbField, RbSwitch, RbTabs, RbText, RbTitle, type RetroBoldProps } from './style-retro-bold'

const SWATCHES = [
  { name: 'Paper ground', varName: '--rb-bg', note: '55% / page' },
  { name: 'Paper', varName: '--rb-paper', note: '20% / surfaces' },
  { name: 'Accent', varName: '--rb-accent', note: '10% / actions' },
  { name: 'Sun', varName: '--rb-sun', note: 'pop / shadows' },
  { name: 'Teal', varName: '--rb-mint', note: 'pop / success' },
  { name: 'Plum', varName: '--rb-plum', note: 'pop / focus' },
  { name: 'Ink', varName: '--rb-ink', note: 'text + outlines' },
]

const RATIO = [
  { name: 'ground', varName: '--rb-bg', pct: 55 },
  { name: 'paper', varName: '--rb-paper', pct: 20 },
  { name: 'accent', varName: '--rb-accent', pct: 10 },
  { name: 'sun', varName: '--rb-sun', pct: 5 },
  { name: 'mint', varName: '--rb-mint', pct: 5 },
  { name: 'ink', varName: '--rb-ink', pct: 5 },
]

const PLANS = [
  {
    name: 'Listener',
    monthly: 6,
    yearly: 5,
    unit: '/ month',
    blurb: 'Every record, one pair of headphones.',
    features: ['Unlimited streaming', 'Offline crates', 'Ad-free'],
    cta: 'Start listening',
    featured: false,
  },
  {
    name: 'Collector',
    monthly: 14,
    yearly: 11,
    unit: '/ month',
    blurb: 'For people with strong opinions about B-sides.',
    features: ['Lossless audio', 'Liner notes and credits', 'Shared crates for six', 'Early pressings'],
    cta: 'Go Collector',
    featured: true,
    badge: 'Staff pick',
  },
  {
    name: 'Label',
    monthly: 39,
    yearly: 32,
    unit: '/ month',
    blurb: 'Release music without a middleman.',
    features: ['Direct-to-fan sales', 'Sales dashboard', 'Bandcamp-style pages', 'Monthly payouts'],
    cta: 'Open a label',
    featured: false,
  },
]

const TABS = [
  {
    id: 'crate',
    label: 'Crate',
    body: 'Forty-two records saved, six on repeat, and one you keep meaning to finish.',
  },
  { id: 'history', label: 'History', body: 'Yesterday: Late Night Tapes, Side A, three times in a row.' },
  { id: 'friends', label: 'Friends', body: 'Ines added "Sunday Mornings" to the shared crate.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="rb-section">
      <div className="rb-section-head">
        <span className="rb-section-num">{kicker}</span>
        <h2 className="rb-h2">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="rb-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: RetroBoldProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <RetroBold {...props} className="h-full overflow-y-auto">
      <div className="rb-wrap">
        <header className="rb-hero">
          <div className="rb-stack" style={{ gap: 'calc(1.6rem * var(--rb-density))' }}>
            <div className="rb-row" style={{ justifyContent: 'space-between' }}>
              <span className="rb-brand">
                <span className="rb-brand-mark" aria-hidden />
                Cassette
              </span>
              <RbBadge tone="mint">Style sheet</RbBadge>
            </div>
            <RbTitle as="h1" className="rb-display">
              Turn it <span className="rb-underline">up.</span>
            </RbTitle>
            <RbText className="rb-lead">
              Warm paper, black outlines, chunky keys that press down and a little sunset in every corner. Old-record charm with modern manners.
            </RbText>
            <div className="rb-row">
              <RbButton size="lg">Start listening</RbButton>
              <RbButton size="lg" variant="secondary">
                Browse crates
              </RbButton>
            </div>
          </div>
          <div className="rb-poster" aria-hidden>
            <RbBadge tone="accent">Side A</RbBadge>
            <span className="rb-record" />
            <div className="rb-ticket">
              <span className="rb-meta">Now spinning</span>
              <b>Late Night Tapes</b>
            </div>
          </div>
        </header>

        <Section kicker="01" title="Palette">
          <div className="rb-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="rb-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="rb-swatch">
                <div className="rb-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="rb-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="rb-scale">
            <div className="rb-scale-row">
              <span className="rb-meta">Display</span>
              <span className="rb-display">Turn it up</span>
            </div>
            <div className="rb-scale-row">
              <span className="rb-meta">Heading</span>
              <span className="rb-h2">Warm paper, black ink</span>
            </div>
            <div className="rb-scale-row">
              <span className="rb-meta">Subhead</span>
              <span className="rb-h3">Chunky keys and sunset stripes</span>
            </div>
            <div className="rb-scale-row">
              <span className="rb-meta">Body</span>
              <span className="rb-body">Body copy stays in a friendly grotesque at weight 450 so the headings can be loud.</span>
            </div>
            <div className="rb-scale-row">
              <span className="rb-meta">Caption</span>
              <span className="rb-small">Caption / 13px / 66% ink, for liner notes and metadata</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="rb-two">
            <div className="rb-stack">
              <div className="rb-row">
                <RbButton>Primary</RbButton>
                <RbButton variant="secondary">Secondary</RbButton>
                <RbButton variant="ghost">Ghost</RbButton>
                <RbButton variant="danger">Delete</RbButton>
              </div>
              <div className="rb-row">
                <RbButton size="sm">Small</RbButton>
                <RbButton size="md">Medium</RbButton>
                <RbButton size="lg">Large</RbButton>
                <RbButton disabled>Disabled</RbButton>
              </div>
              <div className="rb-row">
                <RbBadge>Draft</RbBadge>
                <RbBadge tone="accent">New</RbBadge>
                <RbBadge tone="sun">Beta</RbBadge>
                <RbBadge tone="mint">Live</RbBadge>
                <RbBadge tone="pink">Paused</RbBadge>
                <RbBadge tone="ink">v2.4</RbBadge>
              </div>
              <RbTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <RbCard>
                <RbTitle>{active.label}</RbTitle>
                <RbText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </RbText>
              </RbCard>
            </div>
            <div className="rb-stack">
              <RbField label="Playlist name" defaultValue="Sunday Morning" hint="Shown to friends who join the crate." />
              <RbField label="Search" placeholder="Find a record..." />
              <div className="rb-row">
                <RbSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <RbSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <RbAlert tone="success" title="Playlist saved">
                Sunday Morning is now in your crate.
              </RbAlert>
              <RbAlert tone="warn" title="Storage almost full">
                Free up space before your next download.
              </RbAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="rb-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--rb-density))' }}>
            <RbSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="rb-grid">
            {PLANS.map((plan) => (
              <RbCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="rb-plan">
                <div className="rb-row" style={{ justifyContent: 'space-between' }}>
                  <RbTitle>{plan.name}</RbTitle>
                  {plan.badge ? <RbBadge tone="sun">{plan.badge}</RbBadge> : null}
                </div>
                <p className="rb-price">
                  <span className="rb-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="rb-price-unit">{plan.unit}</span>
                </p>
                <RbText muted={!plan.featured}>{plan.blurb}</RbText>
                <ul className="rb-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rb-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <RbButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </RbButton>
              </RbCard>
            ))}
          </div>

          <RbCard className="rb-settings" style={{ marginTop: 'calc(2rem * var(--rb-density))' }}>
            <div className="rb-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <RbTitle>Account settings</RbTitle>
                <RbText muted style={{ marginTop: '0.25rem' }}>
                  Your profile and where receipts are sent.
                </RbText>
              </div>
              <span className="rb-avatar" aria-hidden>IN</span>
            </div>
            <div className="rb-two" style={{ marginTop: 'calc(1.25rem * var(--rb-density))' }}>
              <RbField label="Workspace name" defaultValue="Ines Marlow" />
              <RbField label="Billing email" type="email" defaultValue="ines@cassette.example" hint="Receipts go here." />
            </div>
            <div className="rb-row" style={{ marginTop: 'calc(1.25rem * var(--rb-density))', justifyContent: 'space-between' }}>
              <RbBadge tone="mint">All changes saved</RbBadge>
              <div className="rb-row">
                <RbButton variant="ghost">Discard</RbButton>
                <RbButton>Save changes</RbButton>
              </div>
            </div>
          </RbCard>
        </Section>

        <p className="rb-footnote">Retro Bold / warm paper, black ink, one downward shadow. Change the accent and the whole sheet re-tints.</p>
      </div>
    </RetroBold>
  )
}
