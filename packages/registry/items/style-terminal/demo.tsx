import { useState, type ReactNode } from 'react'
import { Terminal, TermAlert, TermBadge, TermButton, TermCard, TermField, TermSwitch, TermTabs, TermText, TermTitle, type TerminalProps } from './style-terminal'

const SWATCHES = [
  { name: 'ground', varName: '--tm-bg', note: '80% / page' },
  { name: 'surface', varName: '--tm-surface', note: 'cards, windows' },
  { name: 'fg', varName: '--tm-fg', note: '12% / text' },
  { name: 'dim', varName: '--tm-dim', note: 'comments' },
  { name: 'accent', varName: '--tm-accent', note: '6% / actions' },
  { name: 'yellow', varName: '--tm-sun', note: 'warn' },
  { name: 'cyan', varName: '--tm-mint', note: 'info' },
]

const RATIO = [
  { name: 'ground', varName: '--tm-bg', pct: 62 },
  { name: 'surface', varName: '--tm-surface', pct: 18 },
  { name: 'fg', varName: '--tm-fg', pct: 12 },
  { name: 'accent', varName: '--tm-accent', pct: 6 },
  { name: 'sun', varName: '--tm-sun', pct: 2 },
]

const PLANS = [
  {
    name: 'hobby',
    monthly: 0,
    yearly: 0,
    unit: '/ month',
    blurb: 'For side projects and learning.',
    features: ['3 projects', '10k requests / day', 'Community support'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'pro',
    monthly: 24,
    yearly: 19,
    unit: '/ month',
    blurb: 'For teams shipping every day.',
    features: ['Unlimited projects', '5M requests / month', 'Log retention: 30 days', 'Priority support'],
    cta: 'Upgrade to Pro',
    featured: true,
    badge: 'recommended',
  },
  {
    name: 'scale',
    monthly: 99,
    yearly: 82,
    unit: '/ month',
    blurb: 'Compliance and headroom.',
    features: ['SSO and audit log', 'Dedicated region', '99.99% uptime SLA', 'Slack support'],
    cta: 'Contact sales',
    featured: false,
  },
]

const TABS = [
  {
    id: 'logs',
    label: 'logs',
    body: '12:04:11 [ok] deploy 7f3a91c live in fra1 (1.8s). No errors in the last hour.',
  },
  {
    id: 'env',
    label: 'env',
    body: 'DATABASE_URL, API_TOKEN and 4 more variables. Values are encrypted at rest.',
  },
  {
    id: 'domains',
    label: 'domains',
    body: 'app.shell.example is verified. api.shell.example is waiting for a CNAME.',
  },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="tm-section">
      <div className="tm-section-head">
        <div className="tm-section-line">
          <span className="tm-prompt">~/shell $</span> show {title.toLowerCase()} <span className="tm-dimtext"># {kicker}</span>
        </div>
        <h2 className="tm-h2">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="tm-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: TerminalProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <Terminal {...props} className="h-full overflow-y-auto">
      <div className="tm-wrap">
        <header className="tm-hero">
          <div className="tm-stack" style={{ gap: 'calc(1.5rem * var(--tm-density))' }}>
            <div className="tm-row" style={{ justifyContent: 'space-between' }}>
              <span className="tm-brand">shell.style</span>
              <TermBadge tone="accent">v1.0 style sheet</TermBadge>
            </div>
            <TermTitle as="h1" className="tm-display">
              Ship from
              <br />
              the <span className="tm-mark tm-caret">shell</span>
            </TermTitle>
            <TermText className="tm-lead">
              Monospace all the way down. Hairline borders, inverse-video buttons, a single phosphor accent and a blinking caret. Built for tools people live in.
            </TermText>
            <div className="tm-row">
              <TermButton size="lg">Get started</TermButton>
              <TermButton size="lg" variant="secondary">
                Read docs
              </TermButton>
            </div>
            <p className="tm-small">
              <span className="tm-prompt">$</span> npm create shell-app@latest
            </p>
          </div>
          <div className="tm-window" aria-hidden>
            <div className="tm-window-bar">
              <i />
              <i />
              <i />
              <span>~/shell-app — zsh</span>
            </div>
            <div className="tm-window-body">
              <div>
                <span className="tm-prompt">~/shell-app $</span> pnpm build
              </div>
              <div className="tm-dimtext">&gt; shell-app@1.0.0 build</div>
              <div>
                <span className="tm-info">[info]</span> compiling 128 modules
              </div>
              <div>
                <span className="tm-warnc">[warn]</span> 2 unused exports in utils.ts
              </div>
              <div>
                <span className="tm-ok">[ok]</span> built in <span className="tm-pinkc">1.24s</span>
              </div>
              <div className="tm-dimtext">[###############.....] 76%</div>
              <div>
                <span className="tm-prompt">~/shell-app $</span> <span className="tm-caret" />
              </div>
            </div>
          </div>
        </header>

        <Section kicker="01" title="Palette">
          <div className="tm-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="tm-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="tm-swatch">
                <div className="tm-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="tm-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="tm-scale">
            <div className="tm-scale-row">
              <span className="tm-meta">Display</span>
              <span className="tm-display">ship it</span>
            </div>
            <div className="tm-scale-row">
              <span className="tm-meta">Heading</span>
              <span className="tm-h2">hairlines only</span>
            </div>
            <div className="tm-scale-row">
              <span className="tm-meta">Subhead</span>
              <span className="tm-h3">inverse video, one accent</span>
            </div>
            <div className="tm-scale-row">
              <span className="tm-meta">Body</span>
              <span className="tm-body">Body copy is monospace at 15px with a 1.6 line height, so it reads like documentation.</span>
            </div>
            <div className="tm-scale-row">
              <span className="tm-meta">Caption</span>
              <span className="tm-small">Caption / dim gray / 0.82em, for hints and timestamps</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="tm-two">
            <div className="tm-stack">
              <div className="tm-row">
                <TermButton>Primary</TermButton>
                <TermButton variant="secondary">Secondary</TermButton>
                <TermButton variant="ghost">Ghost</TermButton>
                <TermButton variant="danger">Delete</TermButton>
              </div>
              <div className="tm-row">
                <TermButton size="sm">Small</TermButton>
                <TermButton size="md">Medium</TermButton>
                <TermButton size="lg">Large</TermButton>
                <TermButton disabled>Disabled</TermButton>
              </div>
              <div className="tm-row">
                <TermBadge>Draft</TermBadge>
                <TermBadge tone="accent">New</TermBadge>
                <TermBadge tone="sun">Beta</TermBadge>
                <TermBadge tone="mint">Live</TermBadge>
                <TermBadge tone="pink">Paused</TermBadge>
                <TermBadge tone="ink">v2.4</TermBadge>
              </div>
              <TermTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <TermCard>
                <TermTitle>{active.label}</TermTitle>
                <TermText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </TermText>
              </TermCard>
            </div>
            <div className="tm-stack">
              <TermField label="project" defaultValue="shell-app" hint="lowercase letters, digits and dashes." />
              <TermField label="search" placeholder="grep the logs..." />
              <div className="tm-row">
                <TermSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <TermSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <TermAlert tone="success" title="deploy finished">
                version 1.0.4 is live in 3 regions.
              </TermAlert>
              <TermAlert tone="warn" title="token expires">
                rotate API_TOKEN within 3 days.
              </TermAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="tm-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--tm-density))' }}>
            <TermSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="tm-grid">
            {PLANS.map((plan) => (
              <TermCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="tm-plan">
                <div className="tm-row" style={{ justifyContent: 'space-between' }}>
                  <TermTitle>{plan.name}</TermTitle>
                  {plan.badge ? <TermBadge tone="sun">{plan.badge}</TermBadge> : null}
                </div>
                <p className="tm-price">
                  <span className="tm-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="tm-price-unit">{plan.unit}</span>
                </p>
                <TermText muted={!plan.featured}>{plan.blurb}</TermText>
                <ul className="tm-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="tm-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <TermButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </TermButton>
              </TermCard>
            ))}
          </div>

          <TermCard className="tm-settings" style={{ marginTop: 'calc(2rem * var(--tm-density))' }}>
            <div className="tm-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <TermTitle>project settings</TermTitle>
                <TermText muted style={{ marginTop: '0.25rem' }}>
                  changes apply to every environment.
                </TermText>
              </div>
              <span className="tm-avatar" aria-hidden>&gt;_</span>
            </div>
            <div className="tm-two" style={{ marginTop: 'calc(1.25rem * var(--tm-density))' }}>
              <TermField label="Workspace name" defaultValue="shell-app" />
              <TermField label="Billing email" type="email" defaultValue="ops@shell.example" hint="Receipts go here." />
            </div>
            <div className="tm-row" style={{ marginTop: 'calc(1.25rem * var(--tm-density))', justifyContent: 'space-between' }}>
              <TermBadge tone="mint">All changes saved</TermBadge>
              <div className="tm-row">
                <TermButton variant="ghost">Discard</TermButton>
                <TermButton>Save changes</TermButton>
              </div>
            </div>
          </TermCard>
        </Section>

        <p className="tm-footnote">terminal / one font, one accent, hairlines. change the accent and the phosphor follows.</p>
      </div>
    </Terminal>
  )
}
