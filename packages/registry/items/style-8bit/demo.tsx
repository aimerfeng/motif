import { useState, type ReactNode } from 'react'
import { EightBit, BitAlert, BitBadge, BitButton, BitCard, BitField, BitSwitch, BitTabs, BitText, BitTitle, type EightBitProps } from './style-8bit'

// 像素精灵：每个字符是一格，'.' 是透明。全部是自己画的通用形状，不含任何游戏的角色。
const INVADER = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...']
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']
const SHIP = ['.....#.....', '....###....', '....###....', '.#########.', '###########', '###########']
const COIN = ['..###..', '.#####.', '#######', '#######', '#######', '.#####.', '..###..']

function Sprite({ rows, fill, size = 5, className }: { rows: string[]; fill: string; size?: number; className?: string }) {
  const width = rows[0]!.length
  return (
    <svg viewBox={`0 0 ${width} ${rows.length}`} width={width * size} height={rows.length * size} shapeRendering="crispEdges" className={className} aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" style={{ fill }} />)),
      )}
    </svg>
  )
}

const SWATCHES = [
  { name: 'Ground', varName: '--bit-bg', note: '60% / page' },
  { name: 'Panel', varName: '--bit-surface', note: '25% / cards' },
  { name: 'Accent', varName: '--bit-accent', note: '10% / actions' },
  { name: 'Sun', varName: '--bit-sun', note: 'gold / score' },
  { name: 'Lime', varName: '--bit-mint', note: 'ok / lives' },
  { name: 'Rose', varName: '--bit-pink', note: 'hit / hearts' },
  { name: 'Ink', varName: '--bit-ink', note: 'text + outline' },
]

const RATIO = [
  { name: 'ground', varName: '--bit-bg', pct: 60 },
  { name: 'panel', varName: '--bit-surface', pct: 25 },
  { name: 'accent', varName: '--bit-accent', pct: 10 },
  { name: 'sun', varName: '--bit-sun', pct: 3 },
  { name: 'mint', varName: '--bit-mint', pct: 2 },
]

const PLANS = [
  {
    name: 'Solo',
    monthly: 5,
    yearly: 4,
    unit: '/ mo',
    blurb: 'One save slot, all the basics.',
    features: ['3 save slots', 'Cloud backup', 'Community chat'],
    cta: 'Insert coin',
    featured: false,
  },
  {
    name: 'Co-op',
    monthly: 12,
    yearly: 9,
    unit: '/ mo',
    blurb: 'Play with three friends.',
    features: ['Unlimited saves', '4 player lobbies', 'Leaderboards', 'Priority servers'],
    cta: 'Join co-op',
    featured: true,
    badge: 'Best',
  },
  {
    name: 'Arcade',
    monthly: 29,
    yearly: 24,
    unit: '/ mo',
    blurb: 'Run a room for your community.',
    features: ['50 player rooms', 'Custom rules', 'Tournament tools', 'Stream overlays'],
    cta: 'Open arcade',
    featured: false,
  },
]

const TABS = [
  { id: 'stats', label: 'Stats', body: 'Level 12, 3,420 coins, 7 achievements. Next boss in 2 stages.' },
  { id: 'items', label: 'Items', body: 'Rusty key, healing potion x3, map of the north cave.' },
  { id: 'party', label: 'Party', body: 'Nova and Bit are online. One slot open for player 3.' },
]

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="bit-section">
      <div className="bit-section-head">
        <span className="bit-section-num">{kicker}</span>
        <h2 className="bit-h2">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden className="bit-tick">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}

export function Demo(props: EightBitProps) {
  const [tab, setTab] = useState(TABS[0]!.id)
  const [digest, setDigest] = useState(true)
  const [roadmap, setRoadmap] = useState(false)
  const [yearly, setYearly] = useState(true)
  const active = TABS.find((item) => item.id === tab) ?? TABS[0]!

  return (
    <EightBit {...props} className="h-full overflow-y-auto">
      <div className="bit-wrap">
        <header className="bit-hero">
          <div className="bit-stack" style={{ gap: 'calc(1.6rem * var(--bit-density))' }}>
            <div className="bit-row" style={{ justifyContent: 'space-between' }}>
              <span className="bit-brand">
                <Sprite rows={COIN} fill="var(--bit-sun)" size={4} />
                Quest Log
              </span>
              <BitBadge tone="mint">Style sheet</BitBadge>
            </div>
            <BitTitle as="h1" className="bit-display">
              Press
              <br />
              <span className="bit-mark bit-caret">Start</span>
            </BitTitle>
            <BitText className="bit-lead">Chunky pixels, hard edges and a four-color heart. Every control is a little block you can press, with a stepped, 8-frame feel.</BitText>
            <div className="bit-row">
              <BitButton size="lg">Player 1</BitButton>
              <BitButton size="lg" variant="secondary">
                Options
              </BitButton>
            </div>
          </div>
          <div className="bit-screen" aria-hidden>
            <div className="bit-stars" />
            <div className="bit-hud">
              <span>
                Score
                <b>012450</b>
              </span>
              <span className="bit-lives">
                <Sprite rows={HEART} fill="var(--bit-pink)" size={4} />
                <Sprite rows={HEART} fill="var(--bit-pink)" size={4} />
                <Sprite rows={HEART} fill="var(--bit-mint)" size={4} />
              </span>
              <span style={{ textAlign: 'right' }}>
                Hi
                <b>099999</b>
              </span>
            </div>
            <div className="bit-fleet">
              <Sprite rows={INVADER} fill="var(--bit-mint)" size={5} />
              <Sprite rows={INVADER} fill="var(--bit-sun)" size={5} />
              <Sprite rows={INVADER} fill="var(--bit-pink)" size={5} />
              <Sprite rows={INVADER} fill="var(--bit-cyan)" size={5} />
              <Sprite rows={INVADER} fill="var(--bit-accent)" size={5} />
              <Sprite rows={INVADER} fill="var(--bit-mint)" size={5} />
            </div>
            <Sprite rows={SHIP} fill="#f4f4f4" size={6} className="bit-ship" />
            <div className="bit-ground" />
          </div>
        </header>

        <Section kicker="01" title="Palette">
          <div className="bit-ratio" aria-hidden>
            {RATIO.map((part) => (
              <span key={part.name} style={{ flexGrow: part.pct, background: `var(${part.varName})` }} />
            ))}
          </div>
          <div className="bit-swatches">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="bit-swatch">
                <div className="bit-swatch-chip" style={{ background: `var(${swatch.varName})` }} />
                <div className="bit-swatch-label">
                  <strong>{swatch.name}</strong>
                  <span>{swatch.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Type">
          <div className="bit-scale">
            <div className="bit-scale-row">
              <span className="bit-meta">Display</span>
              <span className="bit-display">Game on</span>
            </div>
            <div className="bit-scale-row">
              <span className="bit-meta">Heading</span>
              <span className="bit-h2">Blocks and edges</span>
            </div>
            <div className="bit-scale-row">
              <span className="bit-meta">Subhead</span>
              <span className="bit-h3">Stepped, chunky, honest</span>
            </div>
            <div className="bit-scale-row">
              <span className="bit-meta">Body</span>
              <span className="bit-body">Body copy is set in VT323 so paragraphs stay readable.</span>
            </div>
            <div className="bit-scale-row">
              <span className="bit-meta">Caption</span>
              <span className="bit-small">Caption, muted blue-gray, for scores and hints</span>
            </div>
          </div>
        </Section>

        <Section kicker="03" title="Components">
          <div className="bit-two">
            <div className="bit-stack">
              <div className="bit-row">
                <BitButton>Primary</BitButton>
                <BitButton variant="secondary">Secondary</BitButton>
                <BitButton variant="ghost">Ghost</BitButton>
                <BitButton variant="danger">Delete</BitButton>
              </div>
              <div className="bit-row">
                <BitButton size="sm">Small</BitButton>
                <BitButton size="md">Medium</BitButton>
                <BitButton size="lg">Large</BitButton>
                <BitButton disabled>Disabled</BitButton>
              </div>
              <div className="bit-row">
                <BitBadge>Draft</BitBadge>
                <BitBadge tone="accent">New</BitBadge>
                <BitBadge tone="sun">Beta</BitBadge>
                <BitBadge tone="mint">Live</BitBadge>
                <BitBadge tone="pink">Paused</BitBadge>
                <BitBadge tone="ink">v2.4</BitBadge>
              </div>
              <BitTabs tabs={TABS} value={tab} onChange={setTab} label="Sample tabs" />
              <BitCard>
                <BitTitle>{active.label}</BitTitle>
                <BitText muted style={{ marginTop: '0.35rem' }}>
                  {active.body}
                </BitText>
              </BitCard>
            </div>
            <div className="bit-stack">
              <BitField label="Player name" defaultValue="NOVA" hint="Shown on the leaderboard." />
              <BitField label="Lobby code" placeholder="A1B2C3" />
              <div className="bit-row">
                <BitSwitch checked={digest} onChange={setDigest} label="Weekly digest" />
                <BitSwitch checked={roadmap} onChange={setRoadmap} label="Public profile" />
              </div>
              <BitAlert tone="success" title="Game saved">
                Slot 2 saved at Cave Entrance.
              </BitAlert>
              <BitAlert tone="warn" title="Low health">
                Find a potion before the boss.
              </BitAlert>
            </div>
          </div>
        </Section>

        <Section kicker="04" title="In context">
          <div className="bit-row" style={{ justifyContent: 'center', marginBottom: 'calc(1.5rem * var(--bit-density))' }}>
            <BitSwitch checked={yearly} onChange={setYearly} label="Bill yearly (2 months free)" />
          </div>
          <div className="bit-grid">
            {PLANS.map((plan) => (
              <BitCard key={plan.name} tone={plan.featured ? 'accent' : 'default'} className="bit-plan">
                <div className="bit-row" style={{ justifyContent: 'space-between' }}>
                  <BitTitle>{plan.name}</BitTitle>
                  {plan.badge ? <BitBadge tone="sun">{plan.badge}</BitBadge> : null}
                </div>
                <p className="bit-price">
                  <span className="bit-price-amount">${yearly ? plan.yearly : plan.monthly}</span>
                  <span className="bit-price-unit">{plan.unit}</span>
                </p>
                <BitText muted={!plan.featured}>{plan.blurb}</BitText>
                <ul className="bit-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="bit-feature">
                      <Check />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <BitButton variant={plan.featured ? 'secondary' : 'primary'} style={{ marginTop: 'auto' }}>
                  {plan.cta}
                </BitButton>
              </BitCard>
            ))}
          </div>

          <BitCard className="bit-settings" style={{ marginTop: 'calc(2rem * var(--bit-density))' }}>
            <div className="bit-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <BitTitle>Player settings</BitTitle>
                <BitText muted style={{ marginTop: '0.25rem' }}>
                  How you appear to the rest of the lobby.
                </BitText>
              </div>
              <span className="bit-avatar" aria-hidden>P1</span>
            </div>
            <div className="bit-two" style={{ marginTop: 'calc(1.25rem * var(--bit-density))' }}>
              <BitField label="Workspace name" defaultValue="Nova Nine" />
              <BitField label="Billing email" type="email" defaultValue="nova@quest.example" hint="Receipts go here." />
            </div>
            <div className="bit-row" style={{ marginTop: 'calc(1.25rem * var(--bit-density))', justifyContent: 'space-between' }}>
              <BitBadge tone="mint">All changes saved</BitBadge>
              <div className="bit-row">
                <BitButton variant="ghost">Discard</BitButton>
                <BitButton>Save changes</BitButton>
              </div>
            </div>
          </BitCard>
        </Section>

        <p className="bit-footnote">8-bit pixel / one pixel unit drives outline, notch, bevel and press. Change it and every control re-snaps.</p>
      </div>
    </EightBit>
  )
}
