import { useMemo, useState } from 'react'
import { Bar, Button, DataInk, Figure, MarginNote, NewThought, RangeFrame, Segmented, Sidenote, Slopegraph, SmallMultiples, Sparkline, dataInkTokens, defaults, type DataInkProps, type Point, type Series } from './style-data-ink'

/** 可复现的伪随机数（mulberry32），dataSeed 决定整份报告的数字。 */
function random(seed: number) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const LINES = [
  { label: 'Harbour rail', base: 62_400, trend: [0.6, 1.3], onTime: 93 },
  { label: 'Ridge rail', base: 48_100, trend: [0.4, 1.1], onTime: 95 },
  { label: 'Tram A', base: 31_200, trend: [0.1, 0.6], onTime: 88 },
  { label: 'Bus 4', base: 22_300, trend: [-0.4, 0.3], onTime: 81 },
  { label: 'Bus 9', base: 18_000, trend: [-0.6, 0.2], onTime: 74 },
  { label: 'Bus 12', base: 14_200, trend: [-0.3, 0.4], onTime: 84 },
  { label: 'Bus 21', base: 11_300, trend: [0, 0.5], onTime: 90 },
  { label: 'River ferry', base: 8_900, trend: [0.9, 1.8], onTime: 97 },
]

const WEEKS = 13
const fmt = (v: number) => Math.round(v).toLocaleString('en-US')

function buildReport(seed: number) {
  const r = random(seed)
  const range = ([a, b]: number[]) => a! + (b! - a!) * r()
  const make = (weekend: boolean) =>
    LINES.map((line) => {
      const trend = range(line.trend) * (weekend ? 0.6 : 1)
      const data: number[] = []
      let v = 100
      for (let w = 0; w < WEEKS; w++) {
        data.push(Math.round(v * 10) / 10)
        v *= 1 + trend / 100 + (r() - 0.5) * 0.028
      }
      return { label: line.label, data }
    })
  const weekday = make(false)
  const weekend = make(true)
  const top = (series: Series[]) =>
    [...series]
      .sort((a, b) => b.data[WEEKS - 1]! - a.data[WEEKS - 1]!)
      .slice(0, 2)
      .map((s) => s.label)

  const rows = LINES.map((line, i) => {
    const index = weekday[i]!.data
    const weekly = index.map((v) => (line.base * v) / 100)
    const yoy = (index[WEEKS - 1]! - 100) * 0.9 + (r() - 0.5) * 2
    return { label: line.label, boardings: weekly[WEEKS - 1]!, weekly, change: yoy, onTime: Math.min(99, line.onTime + Math.round((r() - 0.5) * 4)) }
  })
  const totals = Array.from({ length: WEEKS }, (_, w) => rows.reduce((sum, row) => sum + row.weekly[w]!, 0))
  const weekendTotals = Array.from({ length: WEEKS }, (_, w) => LINES.reduce((sum, line, i) => sum + line.base * 0.46 * (weekend[i]!.data[w]! / 100), 0))
  // 早高峰占全天的比例，常年在 20%–23% 之间
  const peak = Array.from({ length: WEEKS }, () => 20.4 + r() * 2.4)

  // 路线长度对准点率：越长的线路越容易晚点，两条线是例外
  const routes: Point[] = []
  for (let i = 0; i < 24; i++) {
    const km = 4 + r() * 24
    routes.push({ x: Math.round(km * 10) / 10, y: Math.round((96 - km * 0.62 + (r() - 0.5) * 7) * 10) / 10 })
  }
  routes.push({ x: 26.4, y: 91.8 + (r() - 0.5) * 2, label: 'Bus 21' })
  routes.push({ x: 6.2, y: 73.6 + (r() - 0.5) * 2, label: 'Bus 9' })

  const share2016 = [47.2, 28.4, 15.1, 4.4, 2.6, 2.3]
  const share2026 = [38.6, 33.9, 15.8, 2.1, 5.9, 3.7]
  const jitter = (values: number[]) => {
    const j = values.map((v) => v * (1 + (r() - 0.5) * 0.1))
    const sum = j.reduce((a, b) => a + b, 0)
    return j.map((v) => (v / sum) * 100)
  }
  const a = jitter(share2016)
  const b = jitter(share2026)
  const modes = ['Bus', 'Rail', 'Tram', 'Minibus', 'Bike share', 'Ferry'].map((label, i) => ({ label, from: a[i]!, to: b[i]! }))

  return { weekday, weekend, topWeekday: top(weekday), topWeekend: top(weekend), rows, totals, weekendTotals, peak, routes, modes }
}

export function Demo(props: DataInkProps) {
  const seed = props.dataSeed ?? defaults.dataSeed
  const report = useMemo(() => buildReport(seed), [seed])
  const [day, setDay] = useState('weekday')
  const tokens = dataInkTokens({ ...defaults, ...props })
  const { rows, totals, weekendTotals, peak } = report
  const growth = ((totals[WEEKS - 1]! - totals[0]!) / totals[0]!) * 100
  const best = [...rows].sort((x, y) => y.change - x.change)[0]!
  const maxBoardings = Math.max(...rows.map((row) => row.boardings))

  return (
    <div className="h-full w-full overflow-y-auto">
      <DataInk {...props}>
        <div className="di-page">
          <article>
            <h1>Ridership, spring 2026</h1>
            <p className="subtitle">Halden Valley Transit, quarterly service report</p>

            <section>
              <p>
                <NewThought>Weekday boardings</NewThought> reached <span className="di-num">{fmt(totals[WEEKS - 1]!)}</span>
                <Sparkline data={totals} label={`Weekday boardings over ${WEEKS} weeks`} /> by the last week of June, {growth >= 0 ? 'up' : 'down'}{' '}
                <span className="di-num">{Math.abs(growth).toFixed(1)}%</span> over the quarter.
                <Sidenote>
                  A boarding is counted each time a card or ticket is validated. A trip with one transfer counts as two boardings.
                </Sidenote>{' '}
                Weekend travel <Sparkline data={weekendTotals} label="Weekend boardings" /> <span className="di-num">{fmt(weekendTotals[WEEKS - 1]!)}</span> grew more
                slowly, and the morning peak <Sparkline data={peak} band={[20, 23]} label="Morning peak share of daily boardings" /> stayed inside its
                usual band.
              </p>
              <p>
                Growth came from the two rail lines and the river ferry. The four radial bus routes were flat, which is the pattern the network review predicted when
                the Ridge extension opened in March.
              </p>
            </section>

            <section>
              <h2>Eight lines on one scale</h2>
              <p>
                Each panel shows thirteen weeks of boardings indexed to the first week of April. All panels share one vertical scale, so a steeper line is a real
                difference and not an artefact of the axis. The two lines that grew most are marked.
              </p>
              <div className="fullwidth flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <Segmented
                  label="Day type"
                  value={day}
                  onChange={setDay}
                  options={[
                    { value: 'weekday', label: 'Weekdays' },
                    { value: 'weekend', label: 'Weekends' },
                  ]}
                />
                <Button variant="quiet">Download the figures (CSV)</Button>
              </div>
              <Figure fullwidth caption="Index, first week of April = 100. Latest week at the right of each panel.">
                <SmallMultiples
                  series={day === 'weekday' ? report.weekday : report.weekend}
                  highlight={day === 'weekday' ? report.topWeekday : report.topWeekend}
                  format={(v) => v.toFixed(0)}
                />
              </Figure>
            </section>

            <section>
              <h2>Long routes run late</h2>
              <p>
                Punctuality falls by roughly six points for every ten kilometres of route.
                <Sidenote>
                  On time means arriving between one minute early and four minutes late at a timing point, measured on every weekday trip from April to June.
                </Sidenote>{' '}
                Two routes break the pattern: Bus 21 runs on segregated lanes for most of its length, and Bus 9 is short but crosses the old town at school times.
              </p>
              <Figure caption="Each dot is one route. The axes cover only the range of the data and are marked at the minimum, median and maximum.">
                <RangeFrame
                  points={report.routes}
                  labelled={['Bus 21', 'Bus 9']}
                  x={{ label: 'Route length, km', format: (v) => v.toFixed(1) }}
                  y={{ label: 'On time, %', format: (v) => v.toFixed(0) }}
                />
              </Figure>
            </section>

            <section>
              <h2>A decade of mode share</h2>
              <p>
                Rail has taken most of what bus has lost since 2016. Bike share more than doubled from a small base, while the on-demand minibus was cut back
                in 2023.
              </p>
              <Figure caption="Share of all trips, percent. Lines that changed by more than three points are marked.">
                <Slopegraph
                  rows={report.modes}
                  fromLabel="2016"
                  toLabel="2026"
                  format={(v) => v.toFixed(1)}
                  highlight={report.modes.filter((m) => Math.abs(m.to - m.from) > 3).map((m) => m.label)}
                />
              </Figure>
            </section>

            <section>
              <h2>Line by line</h2>
              <p>
                <span className="di-hl">{best.label}</span> grew fastest on the same quarter last year. The bars show the share of trips on time.
                <MarginNote>Boardings are the average weekday in the last week of June. Change is against the same week in 2025.</MarginNote>
              </p>
              <table className="di-table">
                <thead>
                  <tr>
                    <th scope="col">Line</th>
                    <th scope="col" className="di-r">
                      Boardings
                    </th>
                    <th scope="col" className="di-r">
                      Change
                    </th>
                    <th scope="col" className="di-wide-only">
                      13 weeks
                    </th>
                    <th scope="col">On time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="di-r">
                        <span className="di-num">{fmt(row.boardings)}</span>
                      </td>
                      <td className="di-r">
                        <span className={row === best ? 'di-num di-hl' : 'di-num'}>
                          {row.change >= 0 ? '+' : '−'}
                          {Math.abs(row.change).toFixed(1)}%
                        </span>
                      </td>
                      <td className="di-wide-only">
                        <Sparkline data={row.weekly} extremes={false} width={3.6} label={`${row.label}, ${WEEKS} weeks`} />
                      </td>
                      <td className="whitespace-nowrap">
                        <Bar value={row.onTime - 60} max={40} highlighted={row.onTime < 80} />
                        <span className="di-num">{row.onTime}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="di-muted text-[0.9em]">
                Bars start at 60% so that differences between lines are visible; <span className="di-num">{fmt(maxBoardings)}</span> is the busiest line.
              </p>
            </section>

            <section>
              <h2>The style sheet</h2>
              <p>
                One serif, one mono for figures, one ink and one highlight. Everything else is the paper.
                <Sidenote>Ink, muted text and the highlight are lifted to a minimum contrast against the paper, whatever colours are chosen.</Sidenote>
              </p>
              <div className="fullwidth flex flex-wrap gap-x-8 gap-y-5 pt-2">
                {[
                  ['Paper', tokens.paper],
                  ['Ink', tokens.ink],
                  ['Muted', tokens.muted],
                  ['Rule', tokens.rule],
                  ['Highlight', tokens.hl],
                ].map(([name, hex]) => (
                  <div key={name} className="min-w-[96px]">
                    <div className="h-10 w-24" style={{ background: hex, boxShadow: `inset 0 0 0 1px ${tokens.rule}` }} />
                    <div className="mt-2 text-[1.05em]">{name}</div>
                    <div className="di-num di-muted">{hex}</div>
                  </div>
                ))}
              </div>
              <h3>Headings are italic, text is set at 21 over 30</h3>
              <p>
                <NewThought>A new thought</NewThought> opens a section in small capitals. Figures such as <span className="di-num">1,284.50</span> and{' '}
                <span className="di-num">+3.2%</span> are set in a tabular mono, so they line up in columns.
              </p>
              <div className="fullwidth flex flex-wrap items-center gap-x-6 gap-y-3 pb-4 pt-2">
                <Button>Export report</Button>
                <Button variant="quiet">Methodology</Button>
                <Button disabled>Archived</Button>
              </div>
            </section>
          </article>
        </div>
      </DataInk>
    </div>
  )
}
