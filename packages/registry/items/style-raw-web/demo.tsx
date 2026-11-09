import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import {
  Button,
  Check,
  Columns,
  Counter,
  Field,
  Fieldset,
  Input,
  Nav,
  Page,
  RawWeb,
  Select,
  Side,
  Table,
  WebBadge,
  bodySize,
  defaults,
  rawWebFonts,
  rawWebTokens,
  type RawWebFont,
  type RawWebProps,
} from './style-raw-web'

/** 访客计数：每 1.6 秒多一位访客。时间来自 useFrameLoop，截图时可复现；减少动态效果时停在第一帧。 */
function LiveCounter() {
  const host = useRef<HTMLSpanElement>(null)
  const last = useRef(4217)
  const [count, setCount] = useState(4217)
  useFrameLoop(host, ({ time }) => {
    const next = 4217 + Math.floor(time / 1.6)
    if (next !== last.current) {
      last.current = next
      setCount(next)
    }
  })
  // 可见的 visitors 只给眼睛看；读屏读 Counter 自己的「4,217 visitors」，不然会听到两遍。
  return (
    <span ref={host} className="inline-flex items-center gap-2">
      <span aria-hidden>visitors</span> <Counter value={count} />
    </span>
  )
}

/** 作者所在地的当地时间，每秒走一格。 */
function LiveClock() {
  const host = useRef<HTMLSpanElement>(null)
  const start = 22 * 3600 + 14 * 60 + 3
  const last = useRef(start)
  const [seconds, setSeconds] = useState(start)
  useFrameLoop(host, ({ time }) => {
    const next = start + Math.floor(time)
    if (next !== last.current) {
      last.current = next
      setSeconds(next)
    }
  })
  const pad = (n: number) => String(n).padStart(2, '0')
  const text = `${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`
  return (
    <span ref={host}>
      Bergen <time className="tabular-nums">{text}</time>
    </span>
  )
}

const writing = [
  { date: '2026-10-29', title: 'Pages should be finished', words: '1,840' },
  { date: '2026-09-14', title: 'A year calendar on one sheet of paper', words: '2,215', visited: true },
  { date: '2026-07-02', title: 'Notes on the default style sheet', words: '960', visited: true },
  { date: '2026-05-21', title: 'Why my links are still blue', words: '1,120' },
  { date: '2026-03-08', title: 'The imposition problem, explained with paper', words: '3,410' },
]

const software = [
  { name: 'Folio', meta: 'v2.3, 38 KB', body: 'Imposes PDF pages into folded booklets for zines and concert programmes.' },
  { name: 'Onesheet', meta: 'v1.1', body: 'Prints a whole year on one sheet of A4, with week numbers and moon phases.', visited: true },
  { name: 'labels.sh', meta: '120 lines', body: 'Prints address labels from a spreadsheet. Needs nothing but a shell and a printer.' },
]

const badges: { mark: string; text: string; colors: [string, string] }[] = [
  { mark: 'RSS', text: 'plain feed', colors: ['#f26b1d', '#fff1dc'] },
  { mark: 'HTML', text: 'by hand', colors: ['#1d3a8f', '#e6ebff'] },
  { mark: 'NO', text: 'cookie banner', colors: ['#121212', '#a6f05a'] },
  { mark: 'A4', text: 'prints well', colors: ['#b3122e', '#ffffff'] },
  { mark: 'ANY', text: 'screen width', colors: ['#5b2a86', '#f3e9ff'] },
]

const borderLines: Record<string, (t: ReturnType<typeof rawWebTokens>) => string> = {
  bevel: (t) => `td, hr    { border: 1px inset ${t.lo}; }`,
  solid: (t) => `td, hr    { border: 1px solid ${t.rule}; }`,
  double: (t) => `table, hr { border: 3px double ${t.ruleStrong}; }`,
  dashed: (t) => `td, hr    { border: 1px dashed ${t.rule}; }`,
}

export function Demo(props: RawWebProps) {
  const options = { ...defaults, ...props }
  const tokens = rawWebTokens(options)
  const font = rawWebFonts[options.font as RawWebFont] ?? rawWebFonts.serif
  const size = bodySize(options.font, options.textSize)
  const px = (em: number) => `${Math.round(size * em)}px`
  const lineHeight = (1.36 + 0.14 * options.density).toFixed(2)
  const familyName = font.body === font.mono ? 'IBM Plex Mono, monospace' : font.body.includes('Newsreader') ? 'Newsreader, serif' : 'IBM Plex Sans, sans-serif'
  const borderLine = (borderLines[options.borderStyle] ?? borderLines.bevel)(tokens)

  // 边框那几行跟着边框风格换：表里写的必须是这一页此刻真正在用的颜色和用途。
  const borderColours: Record<string, { name: string; value: string; use: string }[]> = {
    bevel: [
      { name: 'Light edge', value: tokens.hi, use: 'Lit edge of tables, fields, hr' },
      { name: 'Dark edge', value: tokens.lo, use: 'Shaded edge of the same' },
    ],
    solid: [
      { name: 'Rule', value: tokens.rule, use: 'hr, table, code, fieldset' },
      { name: 'Control', value: tokens.control, use: 'Button and field borders' },
    ],
    double: [
      { name: 'Rule', value: tokens.rule, use: 'Lines between table cells' },
      { name: 'Double rule', value: tokens.ruleStrong, use: 'hr, table, code, fieldset' },
      { name: 'Control', value: tokens.control, use: 'Button and field borders' },
    ],
    dashed: [
      { name: 'Rule', value: tokens.rule, use: 'hr, table, code, fieldset' },
      { name: 'Control', value: tokens.control, use: 'Button and field borders' },
    ],
  }
  const colours = [
    { name: 'Ground', value: tokens.ground, use: 'Page background' },
    { name: 'Ink', value: tokens.ink, use: 'Text, headings, button focus' },
    { name: 'Link', value: tokens.link, use: 'Unvisited links, checkboxes' },
    { name: 'Visited', value: tokens.visited, use: 'Links already followed' },
    { name: 'Active', value: tokens.active, use: 'A link while it is pressed' },
    { name: 'Muted', value: tokens.muted, use: 'Dates, captions, the meta line' },
    ...(borderColours[options.borderStyle] ?? borderColours.bevel),
    { name: 'Face', value: tokens.face, use: 'Buttons and header cells' },
    { name: 'Mark', value: tokens.mark, use: 'Highlighted text' },
  ]

  return (
    <div className="h-full w-full overflow-y-auto">
      <RawWeb {...props}>
        <Page>
          <header>
            <div className="rw-meta flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <span>~wren/index.html &middot; 14.2 KB &middot; modified Sun 8 Nov 2026</span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <LiveClock />
                <LiveCounter />
              </span>
            </div>
            <hr />
            <h1 className="mb-[calc(.35em*var(--rw-d))] mt-[calc(.6em*var(--rw-d))] text-[clamp(2.4em,7cqi,3.2em)] leading-[1.02]">Wren Okafor</h1>
            <p className="max-w-[40em] text-[1.08em]">
              I make small programs for people who print things: an imposition tool for zines, a one-page year calendar, a script that prints address labels. This page is written by hand in a text editor. It has no trackers and no cookies, and it should still open in 2046.
            </p>
            <Nav
              label="Site"
              items={[
                { label: 'Home', current: true },
                { label: 'Writing', href: '#writing', visited: true },
                { label: 'Software', href: '#software' },
                { label: 'Now', href: '#now' },
                { label: 'Guestbook', href: '#guestbook', visited: true },
                { label: 'Colophon', href: '#colophon' },
              ]}
            />
          </header>
          <hr />

          <Columns>
            <main>
              <h2 id="now">
                Now <small className="rw-muted font-normal">updated 3 November 2026</small>
              </h2>
              <ul>
                <li>
                  Porting <a href="#software">Folio</a>, my zine imposition tool, to a single HTML file you can save and keep.
                </li>
                <li>Teaching a four-week evening class on hand-written HTML at the public library. Week two is tables.</li>
                <li>
                  Learning four-hole Japanese stab binding, badly. <a href="#now" data-visited="">Photos of the failures</a>.
                </li>
              </ul>

              <h2 id="writing">Writing</h2>
              <Table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Title</th>
                    <th scope="col" data-num="" className="hidden @md:table-cell">
                      Words
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {writing.map((post) => (
                    <tr key={post.date}>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">{post.date}</td>
                      <td>
                        <a href="#writing" data-visited={post.visited ? '' : undefined}>
                          {post.title}
                        </a>
                      </td>
                      <td data-num="" className="hidden @md:table-cell">
                        {post.words}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p>
                <small>
                  62 posts since 2009. <a href="#writing">Full archive</a>, or the same list as a <a href="#writing">plain text feed</a>.
                </small>
              </p>
            </main>

            <Side>
              <h2 id="software">Software</h2>
              <dl>
                {software.map((tool) => (
                  <div key={tool.name}>
                    <dt>
                      <a href="#software" data-visited={tool.visited ? '' : undefined}>
                        {tool.name}
                      </a>{' '}
                      <small className="rw-muted font-normal">{tool.meta}</small>
                    </dt>
                    <dd>{tool.body}</dd>
                  </div>
                ))}
              </dl>

              <h2 id="letters">Letters</h2>
              <form onSubmit={(event) => event.preventDefault()}>
                <Fieldset legend="One email a month">
                  <Field label="Email address:">{(id) => <Input id={id} type="email" placeholder="you@example.org" autoComplete="email" />}</Field>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Check label="Plain text only" defaultChecked />
                    <Button primary type="submit">
                      Subscribe
                    </Button>
                  </div>
                </Fieldset>
              </form>
              <p className="rw-muted">
                <small>Sent from my own server. Reply &ldquo;stop&rdquo; and you will never hear from me again.</small>
              </p>
            </Side>
          </Columns>

          <hr />

          <section aria-labelledby="colophon">
            <h2 id="colophon">Colophon</h2>
            <p className="max-w-[40em]">
              The whole design of this site is one style sheet, <code>raw.css</code>, 3.1 KB. It styles HTML elements and almost nothing else. Below is everything it does, with the values this page is using right now.
            </p>

            <Columns even>
              <div>
                <h3>Colour</h3>
                <Table>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Value</th>
                      <th scope="col" className="hidden @lg:table-cell">
                        Used for
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {colours.map((colour) => (
                      <tr key={colour.name}>
                        <td className="whitespace-nowrap">
                          <span className="mr-[.5em] inline-block h-[.9em] w-[1.4em] border border-[var(--rw-rule)] align-[-.08em]" style={{ background: colour.value }} aria-hidden />
                          {colour.name}
                        </td>
                        <td className="rw-mono text-[.86em]">{colour.value}</td>
                        <td className="hidden @lg:table-cell">
                          <small>{colour.use}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div>
                <h3>Type</h3>
                <Table>
                  <thead>
                    <tr>
                      <th scope="col">Element</th>
                      <th scope="col">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">h1 &middot; {px(2.25)}</td>
                      <td>
                        <span className="rw-h1 leading-none">Plain pages</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">h2 &middot; {px(1.5)}</td>
                      <td>
                        <span className="rw-h2">Writing, 2026</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">h3 &middot; {px(1.17)}</td>
                      <td>
                        <span className="rw-h3">Notes on tables</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">p &middot; {px(1)}</td>
                      <td>Set at {lineHeight} line height, ragged right, never justified.</td>
                    </tr>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">small</td>
                      <td>
                        <small>Updated 3 November 2026</small>
                      </td>
                    </tr>
                    <tr>
                      <td className="rw-mono whitespace-nowrap text-[.86em]">inline</td>
                      <td>
                        <code>&lt;hr&gt;</code>, <mark>marked</mark>, <kbd>Ctrl</kbd>+<kbd>U</kbd>, <em>emphasis</em>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div>
                <h3>Links</h3>
                <ul>
                  <li>
                    <a href="#colophon">Not yet followed</a>: link colour, 1px underline
                  </li>
                  <li>
                    <a href="#colophon" data-visited="">Already followed</a>: the visited colour
                  </li>
                  <li>
                    <a href="#colophon" data-hover="">Under the pointer</a>: the underline doubles
                  </li>
                  <li>
                    <a href="#colophon" data-active="">Being pressed</a>: {tokens.activeName} until released
                  </li>
                  <li>
                    <a href="#colophon" data-focus="">Reached by keyboard</a>: a dotted outline
                  </li>
                </ul>
                <details>
                  <summary>Why no rounded corners?</summary>
                  <p>Because the page worked before browsers could draw them, and it still does.</p>
                </details>
              </div>

              <div>
                <h3>Controls</h3>
                <div className="mb-[calc(1em*var(--rw-d))] flex flex-wrap gap-2.5">
                  <Button primary>Subscribe</Button>
                  <Button>Cancel</Button>
                  <Button disabled>Sent</Button>
                </div>
                <div className="grid gap-x-3 @md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <Field label="Search the archive:">{(id) => <Input id={id} type="search" defaultValue="calendar" />}</Field>
                  <Field label="Year:">
                    {(id) => (
                      <Select id={id} defaultValue="2026">
                        <option>2026</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>All years</option>
                      </Select>
                    )}
                  </Field>
                </div>
                <Fieldset legend="Feed format">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <Check type="radio" name="raw-web-feed" label="Full text" defaultChecked />
                    <Check type="radio" name="raw-web-feed" label="Titles only" />
                  </div>
                </Fieldset>
              </div>
            </Columns>

            <h3>The style sheet</h3>
            <pre>
              <code>{`body {
  max-width: ${options.maxWidth}px; margin: 0 auto;
  font: ${size}px/${lineHeight} ${familyName};
  color: ${tokens.ink}; background: ${tokens.ground};
}
a         { color: ${tokens.link}; }
a:visited { color: ${tokens.visited}; }
a:active  { color: ${tokens.active}; }
${borderLine}
*         { border-radius: 0; box-shadow: none; }`}</code>
            </pre>
          </section>

          <hr />

          <footer className="text-center">
            <p id="guestbook">
              &larr; <a href="#guestbook">Previous</a> | <b>Plain Page Ring</b> | <a href="#guestbook">Random</a> | <a href="#guestbook">Next</a> &rarr;
            </p>
            <address className="mx-auto max-w-[34em]">Wren Okafor, Bergen, Norway. Write to wren at this domain; I answer most letters within a week.</address>
            <div className="flex flex-wrap justify-center gap-1.5">
              {badges.map((badge) => (
                <WebBadge key={badge.mark} {...badge} />
              ))}
            </div>
          </footer>
        </Page>
      </RawWeb>
    </div>
  )
}
