import { useState, type ReactNode } from 'react'
import { ClassicDesktop, CdAlert, CdBadge, CdButton, CdCard, CdField, CdSwitch, CdTabs, CdText, CdTitle, type ClassicDesktopProps } from './style-classic-desktop'
import { CdProgress, CdWindow } from './style-classic-desktop'

// 桌面图标：自己画的中性图形，没有任何操作系统的图标或商标。
function DeskIcon({ kind, label }: { kind: 'folder' | 'doc' | 'bin'; label: string }) {
  return (
    <div className="cd-deskicon">
      <svg viewBox="0 0 32 32" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinejoin="miter" aria-hidden>
        {kind === 'folder' ? (
          <>
            <path d="M3 7h9l3 3h14v16H3z" fill="#f2d46b" />
            <path d="M3 12h26" />
          </>
        ) : kind === 'doc' ? (
          <>
            <path d="M8 3h11l6 6v20H8z" fill="#ffffff" />
            <path d="M19 3v6h6" fill="#dfdfdf" />
            <path d="M11 15h11M11 19h11M11 23h7" />
          </>
        ) : (
          <>
            <path d="M9 10h14l-1.5 18h-11z" fill="#c0c0c0" />
            <path d="M7 10h18M13 7h6M13 14v10M16 14v10M19 14v10" />
          </>
        )}
      </svg>
      <span>{label}</span>
    </div>
  )
}

const SWATCHES = [
  { name: 'Desktop', varName: '--cd-desktop', note: '15% / backdrop' },
  { name: 'Face', varName: '--cd-face', note: '55% / surfaces' },
  { name: 'Field', varName: '--cd-field', note: '20% / inputs' },
  { name: 'Accent', varName: '--cd-accent', note: '8% / title bars' },
  { name: 'Shadow', varName: '--cd-shadow', note: 'bevel dark' },
  { name: 'Tip', varName: '--cd-tip', note: 'hints' },
  { name: 'Ink', varName: '--cd-dark', note: 'outline + text' },
]

const RATIO = [
  { name: 'face', varName: '--cd-face', pct: 55 },
  { name: 'field', varName: '--cd-field', pct: 20 },
  { name: 'desktop', varName: '--cd-desktop', pct: 15 },
  { name: 'accent', varName: '--cd-accent', pct: 8 },
  { name: 'tip', varName: '--cd-tip', pct: 2 },
]

const PLANS = [
  {
    name: 'Home',
    monthly: 8,
    yearly: 6,
    unit: '/ month',
    blurb: 'One machine, all the basics.',
    features: ['1 workstation', 'Local backups', 'Email support'],
    cta: 'Install',
    featured: false,
  },
  {
    name: 'Office',
    monthly: 22,
    yearly: 18,
    unit: '/ month',
    blurb: 'Five seats and shared folders.',
    features: ['5 workstations', 'Network folders', 'Scheduled backups', 'Phone support'],
    cta: 'Buy now',
    featured: true,
    badge: 'Best value',
  },
  {
    name: 'Campus',
    monthly: 79,
    yearly: 64,
    unit: '/ month',
    blurb: 'A lab full of computers.',
    features: ['50 workstations', 'Central console', 'Volume licensing', 'On-site training'],
    cta: 'Contact us',
    featured: false,
  },
]

const TABS = [
  { id: 'general', label: 'General', body: 'Computer: Workstation 2. Memory: 64 MB. Free disk space: 412 MB.' },
  { id: 'display', label: 'Display', body: 'Resolution 800 x 600, 256 colors. Refresh rate 60 Hz.' },
  { id: 'sound', label: 'Sound', body: 'Master volume 70%. Startup chime enabled.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="cd-section">
      <CdWindow title={`${kicker} - ${title}`} heading>
        <div className="cd-pad">{children}</div>
      </CdWindow>
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="cd-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: ClassicDesktopProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <ClassicDesktop {...props} className="h-full overflow-y-auto">
      <div className="cd-wrap">
        <header className="cd-hero">
          <div className="cd-icons" aria-hidden>
            <DeskIcon kind="folder" label="Projects" />
            <DeskIcon kind="doc" label="Readme" />
            <DeskIcon kind="bin" label="Trash" />
          </div>
          <div className="cd-stage">
            <CdWindow title="Welcome" className="cd-w-main">
              <div className="cd-menubar" aria-hidden>
                <span>
                  <u>F</u>ile
                </span>
                <span>
                  <u>E</u>dit
                </span>
                <span>
                  <u>V</u>iew
                </span>
                <span>
                  <u>H</u>elp
                </span>
              </div>
              <div className="cd-client">
                <CdTitle as="h1" className="cd-display">
                  Hello, <span className="cd-mark">retro</span>.
                </CdTitle>
                <CdText className="cd-lead" style={{ marginTop: '0.75rem' }}>
                  Gray bevels, a bold title bar and a solid-color desktop. Every control is a raised button that sinks when pressed, the way dialogs used to feel.
                </CdText>
                <div className="cd-row" style={{ marginTop: '1rem' }}>
                  <CdBadge>Style sheet</CdBadge>
                  <CdBadge tone="sun">Tip of the day</CdBadge>
                </div>
              </div>
              <div className="cd-dialog-row">
                <CdButton>OK</CdButton>
                <CdButton variant="secondary">Cancel</CdButton>
                <CdButton variant="secondary" disabled>
                  Apply
                </CdButton>
              </div>
            </CdWindow>
            <CdWindow title="Disk usage" active={false} className="cd-w-side">
              <div className="cd-stack" style={{ gap: '0.6rem', padding: '0.5rem 0.25rem 0.25rem' }}>
                <span className="cd-small" style={{ color: 'inherit' }}>
                  Scanning drive C: ... 68%
                </span>
                <CdProgress value={68} label="Disk scan" />
                <div className="cd-row" style={{ justifyContent: 'space-between' }}>
                  <span className="cd-small">412 MB free of 1.2 GB</span>
                  <CdButton size="sm">Stop</CdButton>
                </div>
              </div>
            </CdWindow>
          </div>
        </header>
        <div className="cd-taskbar" aria-hidden>
          <CdButton size="sm">Menu</CdButton>
          <CdButton size="sm" data-on>
            Welcome
          </CdButton>
          <CdButton size="sm">Disk usage</CdButton>
          <span className="cd-clock">9:41 AM</span>
        </div>

        <Section kicker="01" title="Palette">
          <div className="cd-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="cd-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="cd-swatch">
                <div className="cd-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="cd-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="cd-scale">
            <div className="cd-scale-row">
              <span className="cd-meta">Display</span>
              <span className="cd-display">Hello, retro</span>
            </div>
            <div className="cd-scale-row">
              <span className="cd-meta">Heading</span>
              <span className="cd-h2">Bevels, not shadows</span>
            </div>
            <div className="cd-scale-row">
              <span className="cd-meta">Subhead</span>
              <span className="cd-h3">Raised, sunken, done</span>
            </div>
            <div className="cd-scale-row">
              <span className="cd-meta">Body</span>
              <span className="cd-body">Body copy is set at 14px in a humanist sans, in near-black on gray.</span>
            </div>
            <div className="cd-scale-row">
              <span className="cd-meta">Caption</span>
              <span className="cd-small">Caption / 12px / dark gray, for status-bar text</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="cd-two">
            <div className="cd-stack">
              <div className="cd-row">
                <CdButton>Primary</CdButton>
                <CdButton variant="secondary">Secondary</CdButton>
                <CdButton variant="ghost">Ghost</CdButton>
                <CdButton variant="danger">Delete</CdButton>
              </div>
              <div className="cd-row">
                <CdButton size="sm">Small</CdButton>
                <CdButton size="md">Medium</CdButton>
                <CdButton size="lg">Large</CdButton>
                <CdButton disabled>Disabled</CdButton>
              </div>
              <div className="cd-row">
                <CdBadge>Draft</CdBadge>
                <CdBadge tone="accent">New</CdBadge>
                <CdBadge tone="sun">Beta</CdBadge>
                <CdBadge tone="mint">Live</CdBadge>
                <CdBadge tone="pink">Paused</CdBadge>
                <CdBadge tone="ink">v2.4</CdBadge>
              </div>
              <CdTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <CdCard>
                <CdTitle>{active.label}</CdTitle>
                <CdText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </CdText>
              </CdCard>
            </div>
            <div className="cd-stack">
              <CdField label="Computer name" defaultValue="WORKSTATION-2" hint="Up to 15 letters, no spaces." />
              <CdField label="Search for" placeholder="Type a file name..." />
              <div className="cd-row">
                <CdSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <CdSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <CdAlert tone="success" title="Setup complete">
                The program was installed successfully.
              </CdAlert>
              <CdAlert tone="warn" title="Low disk space">
                Free some space before you continue.
              </CdAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="cd-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--cd-density))' }}>
            <CdSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="cd-grid">
            {PLANS.map((plan) => (
              <CdCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="cd-plan">
                <div className="cd-row" style={{ justifyContent: 'space-between' }}>
                  <CdTitle>{plan.name}</CdTitle>
                  {plan.badge ? <CdBadge tone="sun">{plan.badge}</CdBadge> : null}
                </div>
                <p className="cd-price">
                  <span className="cd-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="cd-price-unit">{plan.unit}</span>
                </p>
                <CdText muted={!plan.featured}>{plan.blurb}</CdText>
                <ul className="cd-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="cd-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <CdButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </CdButton>
              </CdCard>
            ))}
          </div>

          <CdCard className="cd-settings" style={{ marginTop: 'calc(2rem * var(--cd-density))' }}>
            <div className="cd-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <CdTitle>Control panel</CdTitle>
                <CdText muted style={{ marginTop: '0.25rem' }}>
                  System properties for this computer.
                </CdText>
              </div>
              <span className="cd-avatar" aria-hidden>PC</span>
            </div>
            <div className="cd-two" style={{ marginTop: 'calc(1.25rem * var(--cd-density))' }}>
              <CdField label="Workspace name" defaultValue="Workstation 2" />
              <CdField label="Billing email" type="email" defaultValue="admin@office.example" hint="Receipts go here." />
            </div>
            <div className="cd-row" style={{ marginTop: 'calc(1.25rem * var(--cd-density))', justifyContent: 'space-between' }}>
              <CdBadge tone="mint">All changes saved</CdBadge>
              <div className="cd-row">
                <CdButton variant="ghost">Discard</CdButton>
                <CdButton>Save changes</CdButton>
              </div>
            </div>
          </CdCard>
        </Section>

        <p className="cd-footnote">Classic desktop / Ready. Bevel thickness, title bar color and desktop are all tokens.</p>
      </div>
    </ClassicDesktop>
  )
}
