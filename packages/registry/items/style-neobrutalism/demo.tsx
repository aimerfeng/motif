import { useState, type ReactNode } from 'react'
import { NeoBrutalism, NbAlert, NbBadge, NbButton, NbCard, NbField, NbSwitch, NbTabs, NbText, NbTitle, type NeoBrutalismProps } from './style-neobrutalism'

const SWATCHES = [
  { name: 'Ground', varName: '--nb-bg', note: '60% / accent tint' },
  { name: 'Paper', varName: '--nb-paper', note: '25% / surfaces' },
  { name: 'Accent', varName: '--nb-accent', note: '10% / actions' },
  { name: 'Sun', varName: '--nb-sun', note: 'pop / highlight' },
  { name: 'Pink', varName: '--nb-pink', note: 'pop / stickers' },
  { name: 'Mint', varName: '--nb-mint', note: 'pop / success' },
  { name: 'Ink', varName: '--nb-ink', note: 'text + outlines' },
]

const RATIO = [
  { name: 'ground', varName: '--nb-bg', pct: 60 },
  { name: 'paper', varName: '--nb-paper', pct: 25 },
  { name: 'accent', varName: '--nb-accent', pct: 10 },
  { name: 'sun', varName: '--nb-sun', pct: 5 },
]

const PLANS = [
  {
    name: 'Solo',
    monthly: 12,
    yearly: 10,
    unit: '/ month',
    blurb: 'For one person and a lot of ideas.',
    features: ['3 active projects', 'Public roadmap page', 'Email support'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Studio',
    monthly: 32,
    yearly: 26,
    unit: '/ month',
    blurb: 'Everything a small team ships with.',
    features: ['Unlimited projects', 'Custom domain', 'Roles and audit log', 'Priority support'],
    cta: 'Pick Studio',
    featured: true,
    badge: 'Popular',
  },
  {
    name: 'Agency',
    monthly: 89,
    yearly: 72,
    unit: '/ month',
    blurb: 'Many clients, one login.',
    features: ['25 client workspaces', 'White-label portal', 'SSO', 'Onboarding call'],
    cta: 'Talk to us',
    featured: false,
  },
]

const TABS = [
  { id: 'overview', label: 'Overview', body: 'Twelve launches, four drafts and one very overdue changelog.' },
  {
    id: 'activity',
    label: 'Activity',
    body: 'Mara moved "Pricing page" to Done. Two comments on "Onboarding".',
  },
  { id: 'billing', label: 'Billing', body: 'Studio plan, renews on 1 March. Next invoice: $26.00.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="nb-section">
      <div className="nb-section-head">
        <span className="nb-section-num">{kicker}</span>
        <h2 className="nb-h2">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="nb-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: NeoBrutalismProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <NeoBrutalism {...props} className="h-full overflow-y-auto">
      <div className="nb-wrap">
        <header className="nb-hero">
          <div className="nb-stack" style={{ gap: 'calc(1.5rem * var(--nb-density))' }}>
            <div className="nb-row" style={{ justifyContent: 'space-between' }}>
              <span className="nb-brand">
                <span className="nb-brand-mark" aria-hidden />
                Neobrutalism
              </span>
              <NbBadge tone="sun">Style sheet</NbBadge>
            </div>
            <NbTitle as="h1" className="nb-display">
              Loud on <span className="nb-mark">purpose</span>.
            </NbTitle>
            <NbText className="nb-lead">
              Thick outlines, hard offset shadows and flat, saturated color. Every surface is a sticker: it sits on the page, it presses down when you touch it.
            </NbText>
            <div className="nb-row">
              <NbButton size="lg">Start a project</NbButton>
              <NbButton size="lg" variant="secondary">
                Read the rules
              </NbButton>
            </div>
          </div>
          <div className="nb-collage" aria-hidden>
            <NbCard tone="sun" className="nb-c1">
              <span className="nb-meta">Shipped this week</span>
              <p className="nb-stat">128</p>
              <NbBadge tone="mint">+24%</NbBadge>
            </NbCard>
            <NbCard className="nb-c2">
              <NbTitle>Today</NbTitle>
              <div className="nb-todo">
                <i data-done /> Ship the changelog
              </div>
              <div className="nb-todo">
                <i data-done /> Fix the empty state
              </div>
              <div className="nb-todo">
                <i /> Review pricing copy
              </div>
            </NbCard>
            <NbCard tone="pink" className="nb-c3">
              <span className="nb-meta">Reminder</span>
              <NbTitle style={{ marginTop: '0.35rem' }}>Done beats perfect.</NbTitle>
            </NbCard>
          </div>
        </header>

        <Section kicker="01" title="Palette">
          <div className="nb-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="nb-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="nb-swatch">
                <div className="nb-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="nb-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="nb-scale">
            <div className="nb-scale-row">
              <span className="nb-meta">Display</span>
              <span className="nb-display">Ship it loud</span>
            </div>
            <div className="nb-scale-row">
              <span className="nb-meta">Heading</span>
              <span className="nb-h2">Borders that mean it</span>
            </div>
            <div className="nb-scale-row">
              <span className="nb-meta">Subhead</span>
              <span className="nb-h3">Hard shadows, flat color</span>
            </div>
            <div className="nb-scale-row">
              <span className="nb-meta">Body</span>
              <span className="nb-body">Body text sits at weight 500 so it holds its own next to a 3px outline.</span>
            </div>
            <div className="nb-scale-row">
              <span className="nb-meta">Caption</span>
              <span className="nb-small">Caption / 13px / 62% ink, for hints and metadata</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="nb-two">
            <div className="nb-stack">
              <div className="nb-row">
                <NbButton>Primary</NbButton>
                <NbButton variant="secondary">Secondary</NbButton>
                <NbButton variant="ghost">Ghost</NbButton>
                <NbButton variant="danger">Delete</NbButton>
              </div>
              <div className="nb-row">
                <NbButton size="sm">Small</NbButton>
                <NbButton size="md">Medium</NbButton>
                <NbButton size="lg">Large</NbButton>
                <NbButton disabled>Disabled</NbButton>
              </div>
              <div className="nb-row">
                <NbBadge>Draft</NbBadge>
                <NbBadge tone="accent">New</NbBadge>
                <NbBadge tone="sun">Beta</NbBadge>
                <NbBadge tone="mint">Live</NbBadge>
                <NbBadge tone="pink">Paused</NbBadge>
                <NbBadge tone="ink">v2.4</NbBadge>
              </div>
              <NbTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <NbCard>
                <NbTitle>{active.label}</NbTitle>
                <NbText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </NbText>
              </NbCard>
            </div>
            <div className="nb-stack">
              <NbField label="Project name" defaultValue="Launch week" hint="Shown on your public roadmap." />
              <NbField label="Search" placeholder="Find a project..." />
              <div className="nb-row">
                <NbSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <NbSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <NbAlert tone="success" title="Deploy finished">
                Version 2.4 is live in 3 regions.
              </NbAlert>
              <NbAlert tone="warn" title="Card expires soon">
                Update billing before 1 March.
              </NbAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="nb-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--nb-density))' }}>
            <NbSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="nb-grid">
            {PLANS.map((plan) => (
              <NbCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="nb-plan">
                <div className="nb-row" style={{ justifyContent: 'space-between' }}>
                  <NbTitle>{plan.name}</NbTitle>
                  {plan.badge ? <NbBadge tone="sun">{plan.badge}</NbBadge> : null}
                </div>
                <p className="nb-price">
                  <span className="nb-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="nb-price-unit">{plan.unit}</span>
                </p>
                <NbText muted={!plan.featured}>{plan.blurb}</NbText>
                <ul className="nb-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="nb-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <NbButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </NbButton>
              </NbCard>
            ))}
          </div>

          <NbCard className="nb-settings" style={{ marginTop: 'calc(2rem * var(--nb-density))' }}>
            <div className="nb-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <NbTitle>Workspace settings</NbTitle>
                <NbText muted style={{ marginTop: '0.25rem' }}>
                  Changes apply to everyone on the team.
                </NbText>
              </div>
              <span className="nb-avatar" aria-hidden>MK</span>
            </div>
            <div className="nb-two" style={{ marginTop: 'calc(1.25rem * var(--nb-density))' }}>
              <NbField label="Workspace name" defaultValue="Plinth Studio" />
              <NbField label="Billing email" type="email" defaultValue="billing@plinth.example" hint="Receipts go here." />
            </div>
            <div className="nb-row" style={{ marginTop: 'calc(1.25rem * var(--nb-density))', justifyContent: 'space-between' }}>
              <NbBadge tone="mint">All changes saved</NbBadge>
              <div className="nb-row">
                <NbButton variant="ghost">Discard</NbButton>
                <NbButton>Save changes</NbButton>
              </div>
            </div>
          </NbCard>
        </Section>

        <p className="nb-footnote">Neobrutalism / one ink, one shadow, one radius. Change the accent and everything else follows.</p>
      </div>
    </NeoBrutalism>
  )
}
