import { useState, type ReactNode } from 'react'
import { HandDrawn, HdAlert, HdBadge, HdButton, HdCard, HdField, HdSwitch, HdTabs, HdText, HdTitle, type HandDrawnProps } from './style-hand-drawn'

// 手绘小涂鸦：路径故意画得不太直。
const SQUIGGLE = 'M3 8 C 25 2, 35 13, 60 7 S 100 3, 120 9 S 165 13, 197 5'

function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={SQUIGGLE} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 8.5 C 4 9.5, 5 11, 6.2 12.8 C 8 8.5, 10.5 5, 13.5 3" />
    </svg>
  )
}

const SWATCHES = [
  { name: 'Paper ground', varName: '--hd-bg', note: '60% / page' },
  { name: 'Paper', varName: '--hd-paper', note: '25% / cards' },
  { name: 'Pencil color', varName: '--hd-accent', note: '8% / actions' },
  { name: 'Highlighter', varName: '--hd-sun', note: 'marks, notes' },
  { name: 'Mint', varName: '--hd-mint', note: 'done, tape' },
  { name: 'Sky', varName: '--hd-sky', note: 'info, rules' },
  { name: 'Pencil', varName: '--hd-ink', note: 'lines + text' },
]

const RATIO = [
  { name: 'ground', varName: '--hd-bg', pct: 60 },
  { name: 'paper', varName: '--hd-paper', pct: 25 },
  { name: 'accent', varName: '--hd-accent', pct: 8 },
  { name: 'sun', varName: '--hd-sun', pct: 4 },
  { name: 'mint', varName: '--hd-mint', pct: 3 },
]

const PLANS = [
  {
    name: 'Scribble',
    monthly: 0,
    yearly: 0,
    unit: '/ month',
    blurb: 'A notebook for you and your ideas.',
    features: ['5 boards', 'Pencil and marker tools', 'Export as PNG'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Sketchbook',
    monthly: 9,
    yearly: 7,
    unit: '/ month',
    blurb: 'For people who draw every day.',
    features: ['Unlimited boards', 'Shared with 5 friends', 'Sticky notes and tape', 'Version history'],
    cta: 'Get Sketchbook',
    featured: true,
    badge: 'Fan favorite',
  },
  {
    name: 'Classroom',
    monthly: 29,
    yearly: 24,
    unit: '/ month',
    blurb: 'A whole class on one page.',
    features: ['30 student seats', 'Teacher dashboard', 'Safe sharing', 'Lesson templates'],
    cta: 'Try it in class',
    featured: false,
  },
]

const TABS = [
  {
    id: 'boards',
    label: 'Boards',
    body: 'Twelve boards, three in progress. "Birthday poster" was edited yesterday.',
  },
  { id: 'shared', label: 'Shared', body: 'Mira invited you to "Logo sketches" and left two sticky notes.' },
  { id: 'trash', label: 'Crumpled', body: 'Two crumpled drafts. They vanish in seven days.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="hd-section">
      <div className="hd-section-head">
        <span className="hd-section-num">{kicker}</span>
        <div className="hd-section-title">
          <h2 className="hd-h2">{title}</h2>
          <Squiggle className="hd-squig" />
        </div>
      </div>
      {children}
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="hd-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: HandDrawnProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <HandDrawn {...props} className="h-full overflow-y-auto">
      <div className="hd-wrap">
        <header className="hd-hero">
          <div className="hd-stack" style={{ gap: 'calc(1.5rem * var(--hd-density))' }}>
            <div className="hd-row" style={{ justifyContent: 'space-between' }}>
              <span className="hd-brand">
                <svg viewBox="0 0 32 32" className="hd-doodle" aria-hidden>
                  <path d="M6 26 L8 19 L21 6 C 23 4, 26 6, 26 8 L13 22 Z" style={{ fill: 'var(--hd-sun)' }} />
                  <path d="M8 19 L13 22 M19 8 L24 13" />
                  <path d="M5 28 C 12 26, 20 30, 28 27" />
                </svg>
                Doodle Pad
              </span>
              <HdBadge tone="mint">Style sheet</HdBadge>
            </div>
            <div>
              <HdTitle as="h1" className="hd-display">
                Ideas, on
                <br />
                <span className="hd-mark">paper</span>.
              </HdTitle>
              <Squiggle className="hd-squig" />
            </div>
            <HdText className="hd-lead">
              Wobbly outlines, hatched shadows and a pencil hand. Everything looks like it was sketched in a notebook margin, then made to work.
            </HdText>
            <div className="hd-row" style={{ gap: '1.1rem' }}>
              <HdButton size="lg">Start sketching</HdButton>
              <HdButton size="lg" variant="secondary">
                See examples
              </HdButton>
              <svg viewBox="0 0 90 44" width="90" height="44" className="hd-doodle" aria-hidden style={{ color: 'var(--hd-muted)' }}>
                <path d="M4 36 C 18 8, 52 4, 82 26" />
                <path d="M82 26 L 68 25 M82 26 L 77 12" />
              </svg>
            </div>
          </div>
          <div className="hd-page" aria-hidden>
            <span className="hd-tape hd-tape-l" />
            <span className="hd-tape hd-tape-r" />
            <HdTitle style={{ marginBottom: '0.4rem' }}>Today</HdTitle>
            <div className="hd-todo" data-done>
              <span className="hd-check">
                <Tick />
              </span>
              <span>Sketch the landing page</span>
            </div>
            <div className="hd-todo" data-done>
              <span className="hd-check">
                <Tick />
              </span>
              <span>Buy more markers</span>
            </div>
            <div className="hd-todo">
              <span className="hd-check" />
              <span>Send draft to Mira</span>
            </div>
            <div className="hd-todo">
              <span className="hd-check" />
              <span>Water the plant</span>
            </div>
            <svg viewBox="0 0 24 24" width="46" height="46" className="hd-doodle" style={{ position: 'absolute', right: '1.6rem', top: '1.4rem', fill: 'var(--hd-sun)' }}>
              <path d="M12 2.5 L14.6 9 L21.5 9.6 L16.2 14 L18 21 L12 17.3 L6 21 L7.8 14 L2.5 9.6 L9.4 9 Z" />
            </svg>
            <div className="hd-note">Call Mira about the deck!</div>
          </div>
        </header>

        <Section kicker="01" title="Palette">
          <div className="hd-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="hd-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="hd-swatch">
                <div className="hd-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="hd-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="hd-scale">
            <div className="hd-scale-row">
              <span className="hd-meta">Display</span>
              <span className="hd-display">Ideas, on paper</span>
            </div>
            <div className="hd-scale-row">
              <span className="hd-meta">Heading</span>
              <span className="hd-h2">Drawn, then made to work</span>
            </div>
            <div className="hd-scale-row">
              <span className="hd-meta">Subhead</span>
              <span className="hd-h3">Wobbly lines, hatched shadows</span>
            </div>
            <div className="hd-scale-row">
              <span className="hd-meta">Body</span>
              <span className="hd-body">Body copy stays clean and readable so the doodles can be silly.</span>
            </div>
            <div className="hd-scale-row">
              <span className="hd-meta">Caption</span>
              <span className="hd-small">Caption / 13px / muted pencil, for hints and dates</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="hd-two">
            <div className="hd-stack">
              <div className="hd-row">
                <HdButton>Primary</HdButton>
                <HdButton variant="secondary">Secondary</HdButton>
                <HdButton variant="ghost">Ghost</HdButton>
                <HdButton variant="danger">Delete</HdButton>
              </div>
              <div className="hd-row">
                <HdButton size="sm">Small</HdButton>
                <HdButton size="md">Medium</HdButton>
                <HdButton size="lg">Large</HdButton>
                <HdButton disabled>Disabled</HdButton>
              </div>
              <div className="hd-row">
                <HdBadge>Draft</HdBadge>
                <HdBadge tone="accent">New</HdBadge>
                <HdBadge tone="sun">Beta</HdBadge>
                <HdBadge tone="mint">Live</HdBadge>
                <HdBadge tone="pink">Paused</HdBadge>
                <HdBadge tone="ink">v2.4</HdBadge>
              </div>
              <HdTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <HdCard>
                <HdTitle>{active.label}</HdTitle>
                <HdText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </HdText>
              </HdCard>
            </div>
            <div className="hd-stack">
              <HdField label="Board name" defaultValue="Birthday poster" hint="Friends with the link can see it." />
              <HdField label="Search" placeholder="Find a doodle..." />
              <div className="hd-row">
                <HdSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <HdSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <HdAlert tone="success" title="Saved!">
                Your board is safe in the notebook.
              </HdAlert>
              <HdAlert tone="warn" title="Storage is nearly full">
                Crumple a few old drafts to make room.
              </HdAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="hd-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--hd-density))' }}>
            <HdSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="hd-grid">
            {PLANS.map((plan) => (
              <HdCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="hd-plan">
                <div className="hd-row" style={{ justifyContent: 'space-between' }}>
                  <HdTitle>{plan.name}</HdTitle>
                  {plan.badge ? <HdBadge tone="sun">{plan.badge}</HdBadge> : null}
                </div>
                <p className="hd-price">
                  <span className="hd-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="hd-price-unit">{plan.unit}</span>
                </p>
                <HdText muted={!plan.featured}>{plan.blurb}</HdText>
                <ul className="hd-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="hd-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <HdButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </HdButton>
              </HdCard>
            ))}
          </div>

          <HdCard className="hd-settings" style={{ marginTop: 'calc(2rem * var(--hd-density))' }}>
            <div className="hd-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <HdTitle>Notebook settings</HdTitle>
                <HdText muted style={{ marginTop: '0.25rem' }}>
                  How your notebook looks to friends.
                </HdText>
              </div>
              <span className="hd-avatar" aria-hidden>MK</span>
            </div>
            <div className="hd-two" style={{ marginTop: 'calc(1.25rem * var(--hd-density))' }}>
              <HdField label="Workspace name" defaultValue="Mira's notebook" />
              <HdField label="Billing email" type="email" defaultValue="mira@doodle.example" hint="Receipts go here." />
            </div>
            <div className="hd-row" style={{ marginTop: 'calc(1.25rem * var(--hd-density))', justifyContent: 'space-between' }}>
              <HdBadge tone="mint">All changes saved</HdBadge>
              <div className="hd-row">
                <HdButton variant="ghost">Discard</HdButton>
                <HdButton>Save changes</HdButton>
              </div>
            </div>
          </HdCard>
        </Section>

        <p className="hd-footnote">Hand-drawn / one pencil, one wobble, one hatch. Change the pencil color and the whole notebook re-tints.</p>
      </div>
    </HandDrawn>
  )
}
