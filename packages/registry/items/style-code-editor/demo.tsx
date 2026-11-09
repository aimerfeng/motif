import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ActivityBar,
  ActivityItem,
  Badge,
  Breadcrumbs,
  Button,
  Caret,
  CodeBlock,
  Comment,
  Diagnostic,
  Editor,
  FileIcon,
  FileTree,
  Heading,
  Icon,
  Input,
  Kbd,
  Line,
  Main,
  Minimap,
  Panel,
  Sidebar,
  StatusBar,
  StatusItem,
  StyleCodeEditor,
  Switch,
  Swatch,
  TabStrip,
  TitleBar,
  Tok,
  Window,
  accentNames,
  defaults,
  flavorLabels,
  neutralNames,
  palettes,
  type AccentName,
  type CodeLine,
  type CodeToken,
  type Flavor,
  type StyleCodeEditorProps,
  type SyntaxRole,
  type TreeNode,
} from './style-code-editor'

const tree: TreeNode[] = [
  {
    id: 'docs',
    name: 'docs',
    children: [
      { id: 'getting-started', name: 'getting-started.mdx', ext: 'mdx' },
      { id: 'style', name: 'style.mdx', ext: 'mdx', git: 'M' },
      { id: 'cli', name: 'cli.mdx', ext: 'mdx' },
    ],
  },
  {
    id: 'src',
    name: 'src',
    children: [
      { id: 'components', name: 'components', children: [{ id: 'tabs', name: 'Tabs.tsx', ext: 'tsx' }, { id: 'minimap', name: 'Minimap.tsx', ext: 'tsx' }] },
      { id: 'tokens', name: 'tokens.ts', ext: 'ts', git: 'M' },
      { id: 'theme', name: 'theme.css', ext: 'css', git: 'U' },
    ],
  },
  { id: 'toml', name: 'brindle.toml', ext: 'toml' },
  { id: 'readme', name: 'README.md', ext: 'md' },
]

const openTabs = [
  { id: 'style', label: 'style.mdx', ext: 'mdx', dirty: true },
  { id: 'tokens', label: 'tokens.ts', ext: 'ts', dirty: true },
  { id: 'theme', label: 'theme.css', ext: 'css' },
  { id: 'cli', label: 'cli.mdx', ext: 'mdx' },
]

const outline = [
  { id: 'ce-palette', label: 'Palette' },
  { id: 'ce-roles', label: 'Syntax roles' },
  { id: 'ce-type', label: 'Type' },
  { id: 'ce-components', label: 'Components' },
  { id: 'ce-in-use', label: 'In use' },
]

/** 每个具名颜色在上游 style guide 里承担的角色。 */
const accentRoles: Record<AccentName, string> = {
  rosewater: 'cursor, macro',
  flamingo: 'spare accent',
  pink: 'escape, regex',
  mauve: 'keyword',
  red: 'builtin, error',
  maroon: 'parameter',
  peach: 'number',
  yellow: 'type, warning',
  green: 'string, success',
  teal: 'enum, info',
  sky: 'operator',
  sapphire: 'search mark',
  blue: 'function, link',
  lavender: 'active line',
}

const roles: [SyntaxRole, string, string][] = [
  ['keyword', 'export const', 'Keyword'],
  ['string', '"main"', 'String'],
  ['number', '180', 'Number, constant'],
  ['comment', '// todo', 'Comment'],
  ['function', 'render()', 'Function'],
  ['type', 'Theme', 'Type, class'],
  ['parameter', 'props', 'Parameter'],
  ['operator', '=> ===', 'Operator'],
  ['builtin', 'console', 'Builtin'],
  ['variant', 'Mode.Dark', 'Enum variant'],
  ['escape', '\\n \\d+', 'Escape, regex'],
  ['macro', 'println!', 'Macro'],
]

const kw = (t: string): CodeToken => ['keyword', t]
const pn = (t: string): CodeToken => ['punctuation', t]
const tx = (t: string): CodeToken => ['text', t]
const st = (t: string): CodeToken => ['string', t]
const pr = (t: string): CodeToken => ['property', t]

function tokensFile(flavor: string, accent: string): CodeLine[] {
  return [
    { t: [kw('import'), pn(' { '), tx('palette'), pn(' } '), kw('from'), st(' "./palette"')] },
    { t: [] },
    { t: [['comment', '/** One named colour per role, never a raw hex. */']] },
    { t: [kw('export const'), tx(' theme '), ['operator', '='], pn(' {')] },
    { t: [tx('  '), pr('flavor'), pn(': '), st(`"${flavor}"`), pn(',')] },
    { t: [tx('  '), pr('accent'), pn(': '), tx('palette'), pn('.'), pr(flavor), pn('.'), pr(accent), pn(',')] },
    { t: [tx('  '), pr('radius'), pn(': '), ['number', '6'], pn(',')] },
    { t: [pn('} '), kw('satisfies'), ['type', ' Theme']] },
    { t: [] },
    { t: [kw('export function'), ['function', ' tabLabel'], pn('('), ['parameter', 'file'], pn(': '), ['type', 'File'], pn(', '), ['parameter', 'dirty'], ['operator', ' = '], ['number', 'false'], pn('): '), ['type', 'string'], pn(' {')] },
    { t: [tx('  '), kw('return'), tx(' dirty '), ['operator', '?'], st(' `'), ['escape', '${'], tx('file'), pn('.'), pr('name'), ['escape', '}'], st(' ●`'), ['operator', ' :'], tx(' file'), pn('.'), pr('name')] },
    { t: [pn('}')] },
  ]
}

const diff: CodeLine[] = [
  { t: [['attribute', ':root'], pn(' {')] },
  { diff: '-', t: [tx('  '), pr('--accent'), pn(': '), ['function', 'var'], pn('('), pr('--blue'), pn(');')] },
  { diff: '+', t: [tx('  '), pr('--accent'), pn(': '), ['function', 'var'], pn('('), pr('--mauve'), pn(');')] },
  { diff: '+', t: [tx('  '), pr('--radius'), pn(': '), ['number', '6px'], pn(';')] },
  { t: [tx('  '), pr('--font-mono'), pn(': '), st('"Brindle Mono"'), pn(', '), ['builtin', 'monospace'], pn(';')] },
  { t: [pn('}')] },
]

const flags = [
  { flag: '--out', type: '<dir>', value: ['string', '"site"'], desc: 'Where the built site is written.' },
  { flag: '--base', type: '<path>', value: ['string', '"/"'], desc: 'URL prefix added to every page and asset.' },
  { flag: '--watch', type: 'bool', value: ['number', 'false'], desc: 'Rebuild the pages you touch on save.' },
  { flag: '--jobs', type: 'int', value: ['number', '8'], desc: 'Pages rendered in parallel.' },
] as const

function Meta({ children }: { children: ReactNode }) {
  return <Comment className="text-[12px]">{children}</Comment>
}

function H2Line({ id, children, note }: { id: string; children: ReactNode; note?: string }) {
  return (
    <Line>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-3">
        <Heading level={2} id={id}>
          {children}
        </Heading>
        {note ? <Meta>{note}</Meta> : null}
      </div>
    </Line>
  )
}

export function Demo(props: StyleCodeEditorProps) {
  const flavor = ((props.flavor ?? defaults.flavor) in palettes ? (props.flavor ?? defaults.flavor) : 'mocha') as Flavor
  const accent = ((accentNames as readonly string[]).includes(props.accent ?? defaults.accent) ? (props.accent ?? defaults.accent) : 'mauve') as AccentName
  const p = palettes[flavor]
  const scrollRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState('files')
  const [file, setFile] = useState('style')
  const [tab, setTab] = useState('style')
  const [sampleTab, setSampleTab] = useState('tokens')
  const [formatOnSave, setFormatOnSave] = useState(true)
  const [whitespace, setWhitespace] = useState(false)

  const open = (id: string) => {
    setFile(id)
    if (openTabs.some((t) => t.id === id)) setTab(id)
  }
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ block: 'start' })

  return (
    <div className="h-full w-full">
      <StyleCodeEditor {...props} className="h-full">
        <Window>
          <TitleBar>
            <button type="button" className="ce-command" aria-label="Search files and commands">
              <Icon name="search" size={13} />
              <span>brindle — style.mdx</span>
            </button>
          </TitleBar>

          <ActivityBar>
            <ActivityItem icon="files" label="Explorer" active={view === 'files'} onClick={() => setView('files')} />
            <ActivityItem icon="search" label="Search" active={view === 'search'} onClick={() => setView('search')} />
            <ActivityItem icon="branch" label="Source control" count={3} active={view === 'scm'} onClick={() => setView('scm')} />
            <ActivityItem icon="run" label="Run and debug" active={view === 'run'} onClick={() => setView('run')} />
            <ActivityItem icon="blocks" label="Extensions" active={view === 'ext'} onClick={() => setView('ext')} />
            <span className="ce-act-spacer" />
            <ActivityItem icon="user" label="Account" />
            <ActivityItem icon="gear" label="Settings" />
          </ActivityBar>

          <Sidebar title="Explorer">
            <p className="ce-label px-[18px] pb-1 pt-1 !text-[10.5px]">brindle</p>
            <FileTree nodes={tree} current={file} onOpen={open} />
            <div className="ce-side-head mt-2 border-t border-[var(--line)]">
              <span className="ce-label">Outline</span>
            </div>
            <ul className="ce-tree">
              {outline.map((item) => (
                <li key={item.id}>
                  <button type="button" className="ce-node" style={{ paddingLeft: 20 }} onClick={() => jump(item.id)}>
                    <span className="ce-mono" style={{ color: 'var(--ce-i-peach)' }} aria-hidden>
                      ##
                    </span>
                    <span className="ce-node-name">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Sidebar>

          <Main>
            <TabStrip items={openTabs} value={tab} onValueChange={setTab} />
            <Breadcrumbs items={['docs', 'style.mdx', '# Docs that read like source']} />
            <Editor scrollRef={scrollRef} label="style.mdx" minimap={<Minimap target={scrollRef} />}>
              <Line>
                <span className="ce-mono ce-t-punctuation">---</span>
              </Line>
              <Line>
                <span className="ce-mono">
                  <Tok k="property">title</Tok>
                  <Tok k="punctuation">: </Tok>
                  <Tok k="string">"Brindle style guide"</Tok>
                </span>
              </Line>
              <Line>
                <span className="ce-mono">
                  <Tok k="property">flavor</Tok>
                  <Tok k="punctuation">: </Tok>
                  <Tok k="string">"{flavor}"</Tok>
                </span>
              </Line>
              <Line>
                <span className="ce-mono">
                  <Tok k="property">accent</Tok>
                  <Tok k="punctuation">: </Tok>
                  <span className="ce-decor" style={{ '--c': p[accent] } as CSSProperties} aria-hidden />
                  <Tok k="string">"{accent}"</Tok>
                </span>
              </Line>
              <Line>
                <span className="ce-mono ce-t-punctuation">---</span>
              </Line>
              <Line />
              <Line>
                <Comment>a code editor&apos;s chrome, used as a design language</Comment>
              </Line>
              <Line active>
                <Heading level={1} className="py-1">
                  Docs that read like <Tok k="string">"source"</Tok>.
                  <Caret />
                </Heading>
              </Line>
              <Line>
                <p className="ce-lead pb-2">
                  Brindle turns Markdown and your <code className="ce-code">--help</code> output into a fast, searchable docs site. One binary, no runtime, and a full rebuild of 48 pages in 176 ms.
                </p>
              </Line>
              <Line block>
                <div className="flex flex-wrap items-center gap-2.5 pb-1">
                  <Button variant="primary">
                    <Icon name="arrow" size={15} />
                    Install brindle
                  </Button>
                  <Button>Read the guide</Button>
                  <span className="ce-sub flex items-center gap-1.5 text-[12.5px]">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>K</Kbd>
                    to search
                  </span>
                </div>
              </Line>
              <Line />

              <H2Line id="ce-palette" note={`${flavorLabels[flavor]}, 26 named colours`}>
                Palette
              </H2Line>
              <Line>
                <p className="ce-p">Base is the editor; mantle and crust hold the panes around it; surfaces carry controls and overlays carry quiet text. The fourteen accents each stand for a role, never for decoration.</p>
              </Line>
              <Line block>
                <div className="ce-swatches pb-2">
                  {neutralNames.map((name) => (
                    <Swatch key={name} name={name} value={p[name]} />
                  ))}
                </div>
              </Line>
              <Line block>
                <div className="ce-swatches pb-1" style={{ '--min': '118px' } as CSSProperties}>
                  {accentNames.map((name) => (
                    <Swatch key={name} name={name} value={p[name]} note={accentRoles[name]} ink={`var(--ce-i-${name})`} />
                  ))}
                </div>
              </Line>
              <Line />

              <H2Line id="ce-roles" note="style-guide: language defaults">
                Syntax roles
              </H2Line>
              <Line>
                <p className="ce-p">Headings, labels and links borrow their colour from the token they would be in code, so the page and the code samples on it share one vocabulary.</p>
              </Line>
              <Line block>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-6">
                  {roles.map(([role, sample, name]) => (
                    <div key={role} className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2">
                      <Tok k={role} className="ce-mono text-[15px]">
                        {sample}
                      </Tok>
                      <span className="ce-sub truncate text-[12px]">{name}</span>
                    </div>
                  ))}
                </div>
              </Line>
              <Line block>
                <Panel title={<TabStrip items={[{ id: 'tokens', label: 'tokens.ts', ext: 'ts', dirty: true }, { id: 'readme', label: 'README.md', ext: 'md' }]} value={sampleTab} onValueChange={setSampleTab} label="Sample files" className="!border-0 !bg-transparent" />} className="[&_.ce-panel-head]:px-0 [&_.ce-panel-head]:!min-h-0">
                  {sampleTab === 'tokens' ? (
                    <CodeBlock lines={tokensFile(flavor, accent)} label="tokens.ts" />
                  ) : (
                    <CodeBlock
                      label="README.md"
                      lines={[
                        { t: [['symbol', '# '], tx('brindle')] },
                        { t: [] },
                        { t: [tx('Static docs for command line tools.')] },
                        { t: [tx('Run '), ['string', '`brindle dev`'], tx(' and edit '), ['function', '[style.mdx](docs/style.mdx)'], tx('.')] },
                      ]}
                    />
                  )}
                </Panel>
              </Line>
              <Line />

              <H2Line id="ce-type" note="mono for structure, sans for prose">
                Type
              </H2Line>
              {(
                [
                  [<Heading key="h1" level={1}>Heading one</Heading>, 'mono 700, 48 / 54'],
                  [<Heading key="h2" level={2}>Heading two</Heading>, 'mono 700, 24 / 31'],
                  [<Heading key="h3" level={3}>Heading three</Heading>, 'mono 700, 16 / 23'],
                  [<p key="p" className="ce-p">Body copy is set in a sans so that long pages stay easy to read.</p>, 'sans 400, 15 / 25'],
                  [
                    <span key="c" className="ce-mono text-[13px]">
                      <Tok k="function">tabLabel</Tok>
                      <Tok k="punctuation">(</Tok>
                      <Tok k="parameter">file</Tok>
                      <Tok k="punctuation">, </Tok>
                      <Tok k="number">true</Tok>
                      <Tok k="punctuation">)</Tok>
                    </span>,
                    'mono 400, 13 / 22',
                  ],
                  [<span key="l" className="ce-label">Explorer, outline</span>, 'mono 600, 11 caps'],
                ] as [ReactNode, string][]
              ).map(([sample, meta]) => (
                <Line key={meta}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-1.5">
                    {sample}
                    <Meta>{meta}</Meta>
                  </div>
                </Line>
              ))}
              <Line />

              <H2Line id="ce-components" note="chrome you already know">
                Components
              </H2Line>
              <Line>
                <Comment>buttons</Comment>
              </Line>
              <Line block>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button variant="primary">Publish docs</Button>
                  <Button>Preview</Button>
                  <Button variant="outline">Open in editor</Button>
                  <Button variant="ghost">Dismiss</Button>
                  <Button disabled>Building…</Button>
                </div>
              </Line>
              <Line>
                <Comment>pills, blue by default</Comment>
              </Line>
              <Line block>
                <div className="flex flex-wrap gap-2">
                  <Badge>docs</Badge>
                  <Badge tone="green" dot>
                    stable
                  </Badge>
                  <Badge tone="yellow" dot>
                    beta
                  </Badge>
                  <Badge tone="red" dot>
                    deprecated
                  </Badge>
                  <Badge tone="teal">v2.4.0</Badge>
                  <Badge tone="accent">new</Badge>
                </div>
              </Line>
              <Line>
                <Comment>inputs</Comment>
              </Line>
              <Line block>
                <div className="grid max-w-[620px] gap-3 sm:grid-cols-2">
                  <Input icon="search" placeholder="Search the docs" shortcut="Ctrl K" aria-label="Search the docs" />
                  <Input defaultValue="site" aria-label="Output directory" className="ce-mono" />
                </div>
              </Line>
              <Line>
                <Comment>settings</Comment>
              </Line>
              <Line block>
                <div className="grid max-w-[620px]">
                  {[
                    { label: 'Format on save', hint: 'Run brindle fmt before the file is written.', checked: formatOnSave, set: setFormatOnSave },
                    { label: 'Render whitespace', hint: 'Show spaces and tabs as faint dots.', checked: whitespace, set: setWhitespace },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-2.5">
                      <div className="min-w-0">
                        <p className="m-0 text-[13.5px] font-medium">{row.label}</p>
                        <p className="ce-sub m-0 text-[12.5px]">{row.hint}</p>
                      </div>
                      <Switch checked={row.checked} onCheckedChange={row.set} aria-label={row.label} />
                    </div>
                  ))}
                </div>
              </Line>
              <Line>
                <Comment>diagnostics</Comment>
              </Line>
              <Line block>
                <div className="grid max-w-[720px] gap-2">
                  <Diagnostic level="error" source="ts(2322) Ln 5">
                    Type <code className="ce-code">"mocah"</code> is not assignable to type <Tok k="type">Flavor</Tok>.
                  </Diagnostic>
                  <Diagnostic level="warning" source="cli.mdx:14">
                    Unknown flag <code className="ce-code">--verbos</code>. Did you mean <code className="ce-code">--verbose</code>?
                  </Diagnostic>
                  <Diagnostic level="info" source="links">
                    3 pages link to <span className="ce-link">/guide/install</span>, which moved.
                  </Diagnostic>
                </div>
              </Line>
              <Line>
                <Comment>diff</Comment>
              </Line>
              <Line block>
                <Panel
                  className="max-w-[720px]"
                  icon={<FileIcon ext="css" />}
                  title="theme.css"
                  actions={
                    <>
                      <Tok k="string">+2</Tok>
                      <Tok k="builtin">−1</Tok>
                    </>
                  }
                >
                  <CodeBlock lines={diff} label="theme.css diff" />
                </Panel>
              </Line>
              <Line />

              <H2Line id="ce-in-use" note="docs/cli.mdx">
                In use
              </H2Line>
              <Line>
                <p className="ce-p">A command reference page: flags read as properties, types as types, defaults as the literals they are.</p>
              </Line>
              <Line block>
                <Panel className="max-w-[760px]" icon={<FileIcon ext="mdx" />} title="brindle build" actions={<Badge tone="teal">v2.4</Badge>}>
                  <div className="grid gap-4 p-4">
                    <p className="ce-mono m-0 text-[14px]">
                      <Tok k="punctuation">$ </Tok>
                      <Tok k="function">brindle</Tok> build <Tok k="parameter">[dir]</Tok> <Tok k="parameter">[flags]</Tok>
                    </p>
                    <p className="ce-p !text-[14px]">Compiles a docs folder into a static site. Pages are cached by content hash, so a rebuild only touches what changed.</p>
                    <div>
                      {flags.map((f) => (
                        <div key={f.flag} className="grid gap-x-6 gap-y-0.5 border-t border-[var(--line)] py-2 sm:grid-cols-[15rem_minmax(0,1fr)]">
                          <span className="ce-mono text-[13px]">
                            <Tok k="property">{f.flag}</Tok> <Tok k="type">{f.type}</Tok>
                            <Tok k="punctuation"> = </Tok>
                            <Tok k={f.value[0]}>{f.value[1]}</Tok>
                          </span>
                          <span className="ce-sub1 text-[13px]">{f.desc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[var(--ce-r)] border border-[var(--line)] bg-[var(--ce-crust)] px-3.5 py-3">
                      <p className="ce-label m-0 pb-2">Terminal</p>
                      <div className="ce-mono grid gap-0.5 text-[12.5px] leading-[1.7]">
                        <span>
                          <Tok k="string">~/brindle</Tok> <Tok k="operator">❯</Tok> brindle build docs <Tok k="property">--out</Tok> site
                        </span>
                        <span>
                          <Tok k="string">✓</Tok> 48 pages <Tok k="comment">·</Tok> 312 KB <Tok k="comment">·</Tok> <Tok k="number">176 ms</Tok>
                        </span>
                        <span>
                          <Tok k="type">!</Tok> <span className="ce-link">docs/cli.mdx:14:9</span> unknown flag <Tok k="property">--verbos</Tok>
                        </span>
                      </div>
                    </div>
                  </div>
                </Panel>
              </Line>
              <Line />
              <Line>
                <Comment>end of style.mdx</Comment>
              </Line>
            </Editor>
          </Main>

          <StatusBar>
            <StatusItem mode>NORMAL</StatusItem>
            <StatusItem>
              <Icon name="branch" size={13} />
              main*
            </StatusItem>
            <StatusItem wide>
              <Icon name="sync" size={13} />1
            </StatusItem>
            <StatusItem tone="red">
              <Icon name="error" size={13} />1
            </StatusItem>
            <StatusItem tone="yellow">
              <Icon name="warning" size={13} />1
            </StatusItem>
            <span className="ce-status-spacer" />
            <StatusItem wide>Ln 8, Col 34</StatusItem>
            <StatusItem wide>Spaces: 2</StatusItem>
            <StatusItem wide>UTF-8</StatusItem>
            <StatusItem>MDX</StatusItem>
            <StatusItem tone={accent}>
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--ce-accent)]" />
              {flavorLabels[flavor]}
            </StatusItem>
            <StatusItem wide>
              <Icon name="bell" size={13} />
            </StatusItem>
          </StatusBar>
        </Window>
      </StyleCodeEditor>
    </div>
  )
}
