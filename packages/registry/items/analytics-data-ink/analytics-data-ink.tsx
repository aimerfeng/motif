// SPDX-License-Identifier: MIT
// Copyright (c) 2014 Dave Liepmann
// Source: https://github.com/edwardtufte/tufte-css/blob/b5d7b7b/index.html
// Modified by Motif; see the item's provenance.
import { useId, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@motif/runtime'
import { formatCount, liveStart, LiveSparkline, sampleData, Slopegraph, SmallMultiples, Sparkline } from './charts'

/* @motif:defaults */
export const defaults = {
  brandName: 'Marginalia',
  headline: 'Web analytics that shows its work',
  inkColor: '#111111',
  highlightColor: '#a8321f',
  paperTone: 'ivory',
  serifFont: 'newsreader',
  gridlines: false,
  dataSeed: 1869,
}
/* @motif:end */

export type AnalyticsDataInkProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/* ---------- 主题：纸、墨、强调色，保证任何取值下文字都读得清 ---------- */

export const PAPERS = {
  ivory: { paper: '#fffff8', ink: '#111111', dark: false },
  white: { paper: '#ffffff', ink: '#111111', dark: false },
  newsprint: { paper: '#f3efe4', ink: '#1a1a18', dark: false },
  dark: { paper: '#151515', ink: '#dddddd', dark: true },
} as const
export type PaperTone = keyof typeof PAPERS

export const SERIFS = {
  newsreader: "'Newsreader Variable', Palatino, 'Palatino Linotype', 'Palatino LT STD', 'Book Antiqua', Georgia, serif",
  fraunces: "'Fraunces Variable', Palatino, 'Palatino Linotype', 'Palatino LT STD', 'Book Antiqua', Georgia, serif",
  palatino: "Palatino, 'Palatino Linotype', 'Palatino LT STD', 'Book Antiqua', Georgia, serif",
} as const

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string) {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

function mix(a: string, b: string, t: number) {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  const to = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`
}

/** 保持色相，往黑或白推，直到与纸色的对比度达到 min。 */
function readable(color: string, paper: string, min: number) {
  const target = luminance(paper) > 0.3 ? '#000000' : '#ffffff'
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(color, target, t)
    if (contrast(candidate, paper) >= min) return candidate
  }
  return target
}

export function themeOf(options: { inkColor: string; highlightColor: string; paperTone: string; serifFont: string }) {
  const tone = PAPERS[options.paperTone as PaperTone] ?? PAPERS.ivory
  const valid = (hex: string) => /^#[0-9a-f]{6}/i.test(hex)
  // 墨色对比不够 AA（例如深色纸上的黑墨）就换回这张纸的默认墨色，不去硬推一个灰。
  const ink = valid(options.inkColor) && contrast(options.inkColor.slice(0, 7), tone.paper) >= 4.5 ? options.inkColor.slice(0, 7) : tone.ink
  const hl = valid(options.highlightColor) ? options.highlightColor.slice(0, 7) : '#a8321f'
  return {
    paper: tone.paper,
    dark: tone.dark,
    vars: {
      '--paper': tone.paper,
      '--ink': ink,
      '--ink-soft': readable(mix(ink, tone.paper, 0.32), tone.paper, 4.6),
      '--rule': mix(ink, tone.paper, 0.8),
      '--hl': readable(hl, tone.paper, 3),
      '--hl-text': readable(hl, tone.paper, 4.6),
      '--serif': SERIFS[options.serifFont as keyof typeof SERIFS] ?? SERIFS.newsreader,
      '--sans': "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', ui-sans-serif, system-ui, sans-serif",
      colorScheme: tone.dark ? 'dark' : 'light',
    } as CSSProperties,
  }
}

/* ---------- 上游的 sidenote / marginnote：label + 复选框 + span，纯 CSS 切换 ---------- */

function Sidenote({ children }: { children: ReactNode }) {
  const id = `sn-${useId().replace(/[^\w-]/g, '')}`
  return (
    <>
      <label htmlFor={id} className="margin-toggle sidenote-number" />
      <input type="checkbox" id={id} className="margin-toggle" aria-label="Show sidenote" />
      <span className="sidenote">{children}</span>
    </>
  )
}

function MarginNote({ children }: { children: ReactNode }) {
  const id = `mn-${useId().replace(/[^\w-]/g, '')}`
  return (
    <>
      <label htmlFor={id} className="margin-toggle" aria-hidden="true">
        &#8853;
      </label>
      <input type="checkbox" id={id} className="margin-toggle" aria-label="Show margin note" />
      <span className="marginnote">{children}</span>
    </>
  )
}

/** 虚构的字标：一条迷你折线加末端一个点。 */
function Mark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17.5l4.2-5.1 3.6 2.8 4.4-7.4 3.3 3.6" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={18.5} cy={11.4} r={2} fill="var(--hl)" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth={0.8} />
    </svg>
  )
}

/**
 * 隐私优先网站统计产品的官网，整页按 tufte-css 的版式排：正文占栏宽 55%，术语和出处放页边注，
 * 每个论点后面跟一条字大小的迷你折线。图表全部是内联 SVG，数据由 dataSeed 生成。
 */
export function AnalyticsDataInk({ className, style, ...props }: AnalyticsDataInkProps) {
  const options = { ...defaults, ...props }
  const theme = themeOf(options)
  const data = useMemo(() => sampleData(options.dataSeed), [options.dataSeed])
  const liveRef = useRef<HTMLSpanElement>(null)
  const brand = options.brandName.trim() || defaults.brandName
  const { script, load, sites } = data.claims
  const busiest = data.pages.reduce((a, b) => (b.total > a.total ? b : a))
  const totalVisitors = data.pages.reduce((sum, page) => sum + page.total, 0)

  return (
    <div className={cn('tufte relative w-full overflow-x-clip', className)} data-gridlines={options.gridlines ? 'on' : 'off'} style={{ ...theme.vars, ...style }}>
      <div className="tufte-body">
        <header className="di-nav sans">
          <a href="#di-top" className="di-brand" aria-label={`${brand} home`}>
            <Mark />
            <span>{brand}</span>
          </a>
          <nav className="di-links" aria-label="Main">
            <a href="#di-evidence">Evidence</a>
            <a href="#di-speed">Speed</a>
            <a href="#di-pricing">Pricing</a>
            <a href="#di-start">Start</a>
          </nav>
        </header>

        <article className="di-article" id="di-top">
          <h1>{options.headline}</h1>
          <p className="subtitle">Privacy-first analytics, printed like a handout</p>

          <section>
            <p>
              <span className="newthought">Right now</span>,{' '}
              <span className="di-hl" ref={liveRef} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {liveStart(data.live)}
              </span>{' '}
              people
              <LiveSparkline values={data.live} numberRef={liveRef} /> are reading pages on the {sites[sites.length - 1]!.toLocaleString('en-US')} sites we
              count. None of them were given a cookie, a fingerprint or a banner to click.
              <Sidenote>
                A <em>visitor</em> is a salted hash of address and browser that is rotated at midnight UTC. We can count a person once a day; we cannot follow
                them to tomorrow.
              </Sidenote>
            </p>
            <p>
              Your dashboard is a single page of small multiples: one panel per page of your site, the same thirty days in each, nothing to configure.
            </p>
          </section>

          <figure className="fullwidth di-figure-wide">
            <SmallMultiples pages={data.pages} gridlines={options.gridlines} />
            <figcaption className="di-caption sans">
              Daily visitors to twelve pages of one customer site over the last 30 days: {formatCount(totalVisitors)} in all, most of them on{' '}
              <em>{busiest.path}</em>. Each panel has its own scale; the accent dot marks the busiest day and the small dot is today.
            </figcaption>
          </figure>

          <div className="epigraph">
            <blockquote>
              <p>We replaced four dashboards with one page of small multiples, and the Monday meeting got twenty minutes shorter.</p>
              <footer>Ines Okafor, head of data, Fernhill Press</footer>
            </blockquote>
          </div>

          <section id="di-evidence">
            <h2>Claims, with the evidence beside them</h2>
            <p>
              <span className="newthought">The tracking script</span> weighs{' '}
              <span className="di-hl">{script[script.length - 1]} kB</span> gzipped
              <Sparkline values={script} label={`Script size over the last ${script.length} releases, from ${script[0]} kB to ${script[script.length - 1]} kB`} />,
              down from {script[0]} kB fourteen releases ago. It loads after your content, sets nothing in storage and sends one request per page.
            </p>
            <p>
              Dashboards open in a median of <span className="di-hl">{load[load.length - 1]} ms</span>
              <Sparkline values={load} label="Median dashboard load time over the last 40 days" />
              <Sidenote>
                Median time from request to the last chart drawn, measured from three regions for every dashboard view in the last 40 days.
              </Sidenote>{' '}
              because every chart is drawn from pre-aggregated hourly rollups, not raw events. A year of data for a busy site is a few megabytes.
            </p>
            <p>
              Teams stay. We count {sites[sites.length - 1]!.toLocaleString('en-US')} sites today
              <Sparkline values={sites} label="Sites counted per month over two years" />, up from {sites[0]!.toLocaleString('en-US')} two years ago, and
              most arrive from a colleague, not an advertisement.
              <MarginNote>
                Sites counted at the end of each month, January 2025 to today. A site counts once it has sent a pageview in the last 30 days.
              </MarginNote>
            </p>
          </section>

          <section id="di-speed">
            <h2>What leaving the tag manager does to load time</h2>
            <p>
              Analytics should not cost your readers time. We measured six page types on forty customer sites before and after they removed three
              third-party tags and switched to {brand}.
            </p>
            <figure>
              <MarginNote>
                Largest Contentful Paint at the 75th percentile, in milliseconds, mobile visits only. The highlighted line is the largest drop.
              </MarginNote>
              <Slopegraph rows={data.slope} before="Three tags" after={brand} gridlines={options.gridlines} />
            </figure>
          </section>

          <section id="di-pricing">
            <h2>Pricing</h2>
            <p>
              One price per traffic band. Every plan keeps raw events for as long as you subscribe, exports to CSV
              <Sidenote>Exports are plain CSV and Parquet files, one row per pageview, with the same columns we query ourselves.</Sidenote> and has no
              seat limit.
            </p>
            <div className="table-wrapper di-pricing">
              <table className="di-table">
                <caption>Prices in US dollars, billed monthly. Yearly billing takes two months off.</caption>
                <thead>
                  <tr>
                    <th scope="col">Plan</th>
                    <th scope="col">Pageviews a month</th>
                    <th scope="col">Sites</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Notebook', '10,000', '1', 'Free'],
                    ['Folio', '100,000', '10', '$9'],
                    ['Codex', '1,000,000', '50', '$49'],
                    ['Archive', '10,000,000', 'Any', '$190'],
                  ].map(([plan, views, count, price]) => (
                    <tr key={plan}>
                      <th scope="row">{plan}</th>
                      <td>{views}</td>
                      <td>{count}</td>
                      <td>{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="di-start">
            <h2>Start counting</h2>
            <p>
              <span className="newthought">Add one line</span> to the head of your site. Pageviews appear within a minute, and the first thirty days are free
              on every plan.
            </p>
            <pre>
              <code>{'<script defer data-site="example.org" src="/js/count.js"></script>'}</code>
            </pre>
            <p>
              <a href="#di-start">Start a free trial</a>, or <a href="#di-evidence">read how we count</a> before you decide.
            </p>
          </section>
        </article>

        <footer className="di-footer sans">
          © 2026 {brand} Analytics · No cookies, no fingerprinting · Data stored in the EU
        </footer>
      </div>
    </div>
  )
}
