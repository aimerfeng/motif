// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/views/ServicesView.astro
// Modified by Motif; see the item's provenance.
import type { ArtKind, IconName } from './parts'

// 上游的文案表（copy/*.ts、content/insights/*.md）换成一家虚构战略咨询公司的内容。

export const NAV = [
  { href: '#practices', label: 'Practices' },
  { href: '#industries', label: 'Industries' },
  { href: '#results', label: 'Results' },
  { href: '#insights', label: 'Insights' },
  { href: '#offices', label: 'Offices' },
]

export type Article = { title: string; subTitle: string; images: { art: ArtKind; alt: string }[]; cta?: string }

/** AlternatingSections 的 articles：偶数条文字在左、图在右，奇数条图在左。 */
export const PRACTICES: Article[] = [
  {
    title: 'Strategy and growth',
    subTitle: 'Where to compete and how to win, decided with the people who will run it. We build the fact base, test the options with your board and leave a plan with owners, budgets and dates.',
    images: [
      { art: 'contour', alt: 'Topographic lines, a symbol for market mapping' },
      { art: 'bars', alt: 'Bar chart with a rising trend line' },
    ],
  },
  {
    title: 'Operations and cost',
    subTitle: 'Cost programmes that hold after we leave. We work line by line with finance and operations, then stay through the first two quarters of delivery to hand the controls over.',
    images: [{ art: 'grid', alt: 'A heat map of cost lines by business unit' }],
    cta: 'See the cost practice',
  },
  {
    title: 'Transactions',
    subTitle: 'Commercial due diligence, carve-outs and post-merger integration for corporates and private equity, on timelines measured in weeks rather than quarters.',
    images: [
      { art: 'rings', alt: 'Two overlapping circles, a symbol for a merger' },
      { art: 'lines', alt: 'A line chart of synergies against plan' },
    ],
  },
  {
    title: 'Organisation and people',
    subTitle: 'Operating model and organisation design, leadership assessment and the change work that makes a new structure stick past the first reorganisation memo.',
    images: [{ art: 'nodes', alt: 'An organisation chart with eight roles' }],
    cta: 'Talk to a partner',
  },
]

export const INDUSTRIES: { heading: string; content: string; icon: IconName }[] = [
  { heading: 'Financial services', content: 'Retail and commercial banks, insurers and asset managers facing margin pressure.', icon: 'bank' },
  { heading: 'Energy and utilities', content: 'Grid operators and generators planning the next twenty years of capital spend.', icon: 'bolt' },
  { heading: 'Healthcare', content: 'Hospital groups, payers and medtech companies redesigning how care is delivered.', icon: 'cross' },
  { heading: 'Industrial goods', content: 'Manufacturers and suppliers protecting price and mix in flat volume markets.', icon: 'factory' },
  { heading: 'Consumer and retail', content: 'Brands and retailers rebalancing stores, channels and working capital.', icon: 'bag' },
  { heading: 'Technology and media', content: 'Software and media businesses moving from growth at any cost to profitable growth.', icon: 'chip' },
  { heading: 'Transport and logistics', content: 'Carriers, ports and 3PLs running networks with thinner margins and higher volatility.', icon: 'truck' },
  { heading: 'Public sector', content: 'Ministries and agencies delivering reform programmes with fixed budgets.', icon: 'shield' },
]

export const RESULTS = {
  title: 'Results our clients have signed off on',
  subTitle: 'Every figure below is measured by the client’s own finance team twelve months after the engagement ends, not projected at the start of it.',
  mainStatTitle: '$1.9bn',
  mainStatSubTitle: 'in annual run-rate savings verified at our clients since 2019',
  stats: [
    { stat: '41%', description: 'faster separation on a Nordic industrial carve-out' },
    { stat: '+4.1pt', description: 'EBITDA margin at a European logistics operator' },
    { stat: '18 wk', description: 'from diligence to signing on a clinic roll-up' },
    { stat: '$310m', description: 'working capital released at a consumer goods maker' },
    { stat: '7 of 9', description: 'integration milestones met on time in a utility merger' },
    { stat: '92%', description: 'of clients hire us again within three years' },
  ],
}

export type Insight = {
  title: string
  description: string
  art: ArtKind
  practice: string
  date: string
  minutes: number
  author: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const INSIGHTS: Insight[] = [
  {
    title: 'The second year of a cost programme',
    description: 'Why savings fade after month eighteen, and the four controls that keep them on the ledger.',
    art: 'bars',
    practice: 'Operations',
    date: 'October 2026',
    minutes: 8,
    author: 'Imogen Hale, Partner',
    sections: [
      {
        heading: 'Where the savings go',
        paragraphs: [
          'Across the 37 programmes we reviewed, the median company kept 71 percent of its first-year savings into year three. The rest drifted back through headcount backfills, renegotiated supplier terms and costs that moved between budget lines instead of leaving them.',
          'None of these leaks is dramatic. Each one is a sensible local decision, made after the programme office has been disbanded and the steering committee has moved on to the next priority.',
        ],
      },
      {
        heading: 'Four controls that hold',
        paragraphs: [
          'The companies that kept more than 90 percent shared four habits: position control owned by finance rather than HR, supplier terms checked against the signed baseline every quarter, a single named owner for each saving written into their objectives, and a twelve-month review commissioned by the board.',
          'None of this needs new systems. It needs a decision about who is accountable once the consultants and the programme office have gone.',
        ],
      },
      {
        heading: 'Designing for month eighteen',
        paragraphs: [
          'We now plan the exit before the first workshop. The last six weeks of every cost engagement are spent handing controls to line owners and running the first quarterly review with them, so the second year starts with the habits already in place.',
          'It makes the programme look slower on paper. Twelve months later it is the difference between a number in a board pack and a number in the accounts.',
        ],
      },
    ],
  },
  {
    title: 'Carve-outs without the stranded costs',
    description: 'A playbook for separating shared services before day one, drawn from eleven divestments.',
    art: 'rings',
    practice: 'Transactions',
    date: 'September 2026',
    minutes: 6,
    author: 'Tomas Lindqvist, Partner',
    sections: [
      {
        heading: 'The cost nobody priced',
        paragraphs: [
          'When a business is sold, the shared services it used do not shrink by themselves. In the eleven divestments we supported over five years, stranded costs averaged 2.3 percent of divested revenue, and most were still on the parent’s books two years later.',
          'Finance, IT, procurement and facilities carry most of it. They were sized for the larger group and nobody owns the job of resizing them once the deal team has closed.',
        ],
      },
      {
        heading: 'Separate before day one',
        paragraphs: [
          'The cheapest moment to resize shared services is before signing, while the transitional service agreements are being drafted. Each service in the agreement should come with an exit date, a named owner on both sides and a plan for the cost that remains after it ends.',
          'Buyers increasingly expect this. A credible separation plan shortened negotiations in four of the eleven deals.',
        ],
      },
      {
        heading: 'A playbook in three lists',
        paragraphs: [
          'We ask clients to keep three lists from the first week: every service the divested unit consumes, every contract that names it, and every person who spends more than a fifth of their time on it.',
          'Most stranded costs hide in the gaps between those lists. Reconciling them once a month is dull work, and it is the work that protects the sale price.',
        ],
      },
    ],
  },
  {
    title: 'Pricing power in a flat market',
    description: 'How industrial suppliers raised realised prices by 3 to 5 percent without losing volume.',
    art: 'lines',
    practice: 'Strategy',
    date: 'August 2026',
    minutes: 7,
    author: 'Ana Ferreira, Principal',
    sections: [
      {
        heading: 'Volume is not coming back',
        paragraphs: [
          'For many industrial suppliers unit volumes have been flat for three years and customers are consolidating their purchasing. Growth now has to come from price and mix, which most commercial teams were never organised to manage.',
        ],
      },
      {
        heading: 'Where the margin leaks',
        paragraphs: [
          'In a typical price waterfall we find 4 to 7 percent of list price lost to discounts that nobody approved centrally: legacy rebates, free freight, extended payment terms and one-off concessions that quietly became permanent.',
          'Recovering half of that leakage is worth more than a year of volume growth, and it does not require a single new customer.',
        ],
      },
      {
        heading: 'What the winners changed',
        paragraphs: [
          'The suppliers that raised realised prices without losing volume did three things. They gave sales teams a deal-by-deal view of margin, they tied part of commission to price realisation, and they reviewed the twenty largest accounts with the managing director every month.',
          'The tools were simple. What changed was that price became a weekly management conversation rather than an annual list update.',
        ],
      },
    ],
  },
]

export const OFFICES = [
  { heading: 'London', content: 'Headquarters, 58 people', address: '4 Marlowe Yard, London EC2A 3PJ' },
  { heading: 'New York', content: 'Americas, 41 people', address: '1180 Harlan Avenue, 21st floor, New York, NY 10036' },
  { heading: 'Singapore', content: 'Asia Pacific, 23 people', address: '9 Temasek Quay, #14-02, Singapore 038987' },
]

export const FOOTER_SECTIONS = [
  { title: 'Practices', links: ['Strategy and growth', 'Operations and cost', 'Transactions', 'Organisation'] },
  { title: 'Firm', links: ['About us', 'Partners', 'Careers', 'Alumni'] },
  { title: 'Insights', links: ['Research', 'Briefings', 'Events'] },
]
