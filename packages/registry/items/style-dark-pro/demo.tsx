import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Badge, Button, CommandBar, Input, Kbd, Panel, Segmented, StyleDarkPro, Switch, defaults, grayScales, statusColors, tokensOf, type Command, type GrayFamily, type StyleDarkProProps } from './style-dark-pro'

const paths: Record<string, string> = {
  inbox: 'M2.5 9.5h3l1 2h3l1-2h3M2.5 9.5 4 3.5h8l1.5 6v3h-11z',
  issues: 'M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  review: 'M2 8s2.2-4.5 6-4.5S14 8 14 8s-2.2 4.5-6 4.5S2 8 2 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  cycle: 'M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v2.5H11',
  project: 'M2.5 4.5 8 2l5.5 2.5v7L8 14l-5.5-2.5zM2.5 4.5 8 7l5.5-2.5M8 7v7',
  views: 'M8 2 14 5 8 8 2 5zM2 8l6 3 6-3M2 11l6 3 6-3',
  plus: 'M8 3v10M3 8h10',
  user: 'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 13.5c.8-2.2 2.7-3.5 5-3.5s4.2 1.3 5 3.5',
  sliders: 'M2.5 4.5h7M12.5 4.5h1M2.5 11.5h1M6.5 11.5h7M11 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  filter: 'M2.5 4h11M4.5 8h7M6.5 12h3',
  swap: 'M3 5.5h10l-2.5-2.5M13 10.5H3l2.5 2.5',
  branch: 'M5 5v6M5 3.5a1.5 1.5 0 1 1 0 .01M5 12.5a1.5 1.5 0 1 1 0 .01M11 5.5a1.5 1.5 0 1 1 0 .01M11 7c0 2.5-3 2.5-6 4',
  bell: 'M4 11.5V7a4 4 0 1 1 8 0v4.5l1 1H3zM6.5 14h3',
  search: 'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM10.5 10.5 14 14',
  chevron: 'M4.5 6.5 8 10l3.5-3.5',
  arrow: 'M3 8h10M9 4l4 4-4 4',
  archive: 'M2.5 3.5h11v3h-11zM3.5 6.5v6h9v-6M6.5 9h3',
  more: 'M3.5 8h.01M8 8h.01M12.5 8h.01',
}

function Icon({ name, size = 15 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 2.4 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name]} />
    </svg>
  )
}

/** 虚构品牌 Plinth 的标志：三级台座。 */
function Mark({ size = 22 }: { size?: number }) {
  return (
    <span className="grid flex-none place-items-center rounded-[calc(var(--dp-radius)*.75)] bg-[var(--dp-accent)] text-[var(--dp-accent-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 16 16" width={size * 0.62} height={size * 0.62} fill="currentColor">
        <rect x="5.5" y="2.5" width="5" height="3" rx="0.8" />
        <rect x="3.5" y="6.5" width="9" height="3" rx="0.8" />
        <rect x="1.5" y="10.5" width="13" height="3" rx="0.8" />
      </svg>
    </span>
  )
}

type Status = 'backlog' | 'todo' | 'progress' | 'review' | 'done'

function StatusIcon({ status }: { status: Status }) {
  const tone = status === 'progress' ? statusColors.warning.text : status === 'review' || status === 'done' ? 'var(--dp-accent-text)' : 'var(--dp-11)'
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" className="flex-none" aria-hidden>
      {status === 'done' ? (
        <>
          <circle cx="7" cy="7" r="6" fill="var(--dp-accent)" />
          <path d="M4.3 7.2 6.1 9l3.6-3.8" fill="none" stroke="var(--dp-accent-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="7" cy="7" r="5.6" fill="none" stroke={tone} strokeWidth="1.5" strokeDasharray={status === 'backlog' ? '2 2' : undefined} />
          {status === 'progress' ? <path d="M7 3.2A3.8 3.8 0 0 1 7 10.8z" fill={tone} /> : null}
          {status === 'review' ? <path d="M7 3.2A3.8 3.8 0 1 1 3.2 7H7z" fill={tone} /> : null}
        </>
      )}
    </svg>
  )
}

function Priority({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" className="flex-none" aria-label={`Priority ${level} of 3`} role="img">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1.5 + i * 4} y={9 - i * 3} width="3" height={3.5 + i * 3} rx="0.8" fill={i < level ? 'var(--dp-11)' : 'var(--dp-a5)'} />
      ))}
    </svg>
  )
}

function Avatar({ initials, tone = false }: { initials: string; tone?: boolean }) {
  return (
    <span
      className="grid h-5 w-5 flex-none place-items-center rounded-full text-[9.5px] font-semibold"
      style={{ background: tone ? 'color-mix(in oklab, var(--dp-accent) 30%, var(--dp-s2))' : 'var(--dp-a4)', color: 'var(--dp-12)', boxShadow: 'inset 0 0 0 1px var(--dp-a5)' }}
      aria-label={initials}
      role="img"
    >
      {initials}
    </span>
  )
}

const labelColors: Record<string, string> = {
  Feature: 'var(--dp-accent)',
  Bug: statusColors.danger.solid,
  Backend: '#6e56cf',
  Infra: statusColors.warning.solid,
  Design: '#e93d82',
  Editor: '#12a594',
}

type Issue = { id: string; title: string; labels: string[]; who: string; date: string; priority: number }
const issueGroups: { status: Status; name: string; issues: Issue[] }[] = [
  {
    status: 'progress',
    name: 'In progress',
    issues: [
      { id: 'PLN-482', title: 'Realtime cursors in shared views', labels: ['Feature'], who: 'MK', date: 'Nov 12', priority: 3 },
      { id: 'PLN-475', title: 'Batch webhook retries with exponential backoff', labels: ['Backend'], who: 'JT', date: 'Nov 14', priority: 2 },
      { id: 'PLN-469', title: 'Sidebar loses scroll position after route change', labels: ['Bug'], who: 'AR', date: 'Nov 11', priority: 3 },
    ],
  },
  {
    status: 'review',
    name: 'In review',
    issues: [
      { id: 'PLN-461', title: 'Shortcut for moving issues between cycles', labels: ['Feature', 'Editor'], who: 'SL', date: 'Nov 10', priority: 2 },
      { id: 'PLN-458', title: 'Migrate audit log to partitioned tables', labels: ['Backend', 'Infra'], who: 'MK', date: 'Nov 13', priority: 1 },
    ],
  },
  {
    status: 'todo',
    name: 'Todo',
    issues: [
      { id: 'PLN-490', title: 'Empty state for the filtered board view', labels: ['Design'], who: 'EV', date: 'Nov 15', priority: 1 },
      { id: 'PLN-488', title: 'Rate limit the public GraphQL endpoint', labels: ['Infra'], who: 'JT', date: 'Nov 16', priority: 2 },
      { id: 'PLN-486', title: 'Inline code blocks in issue comments', labels: ['Editor'], who: 'AR', date: 'Nov 17', priority: 1 },
    ],
  },
  {
    status: 'done',
    name: 'Done',
    issues: [
      { id: 'PLN-451', title: 'Persist column widths per view', labels: ['Feature'], who: 'SL', date: 'Nov 6', priority: 1 },
      { id: 'PLN-447', title: 'Crash when pasting a table into the description', labels: ['Bug', 'Editor'], who: 'EV', date: 'Nov 5', priority: 3 },
    ],
  },
]

const commands: Command[] = [
  { id: 'new', group: 'Suggestions', label: 'Create new issue', icon: <Icon name="plus" />, shortcut: ['C'] },
  { id: 'assign', group: 'Suggestions', label: 'Assign to me', icon: <Icon name="user" />, shortcut: ['I'] },
  { id: 'branch', group: 'Suggestions', label: 'Copy git branch name', icon: <Icon name="branch" />, hint: 'pln-482-realtime-cursors', shortcut: ['⌘', '⇧', '.'] },
  { id: 'team', group: 'Suggestions', label: 'Switch team…', icon: <Icon name="swap" />, shortcut: ['O', 'T'] },
  { id: 'inbox', group: 'Navigation', label: 'Go to inbox', icon: <Icon name="inbox" />, shortcut: ['G', 'I'] },
  { id: 'cycle', group: 'Navigation', label: 'Go to active cycle', icon: <Icon name="cycle" />, shortcut: ['G', 'C'] },
  { id: 'settings', group: 'Navigation', label: 'Open workspace settings', icon: <Icon name="sliders" />, shortcut: ['G', 'S'] },
]

// 自动播放：高亮项依次走过的序号（停留在前几项，看起来像在挑选命令）。
const autoplay = [0, 1, 2, 4, 5, 2, 1]

function Section({ eyebrow, title, desc, children }: { eyebrow: string; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="dp-wrap pb-20">
      <div className="grid gap-3 border-t border-[var(--dp-a4)] pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
        <div>
          <p className="dp-label">{eyebrow}</p>
          <h2 className="dp-title mt-2 text-[22px] sm:text-[26px]">{title}</h2>
        </div>
        <p className="dp-muted max-w-md md:justify-self-end md:pt-6">{desc}</p>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function NavItem({ icon, label, current, count }: { icon: keyof typeof paths; label: string; current?: boolean; count?: number }) {
  return (
    <button type="button" className="dp-nav-item" aria-current={current ? 'page' : undefined}>
      <Icon name={icon} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? <span className="dp-mono text-[11px] text-[var(--dp-11)]">{count}</span> : null}
    </button>
  )
}

function Sidebar() {
  return (
    <aside className="hidden flex-col gap-5 pt-1 lg:flex" aria-label="Workspace">
      <div className="flex items-center gap-2">
        <button type="button" className="dp-nav-item !w-auto flex-1 !text-[var(--dp-12)]">
          <Mark size={20} />
          <span className="font-semibold">Plinth</span>
          <Icon name="chevron" size={13} />
        </button>
        <Button variant="ghost" size="icon" aria-label="Search">
          <Icon name="search" />
        </Button>
        <Button size="icon" aria-label="New issue">
          <Icon name="plus" />
        </Button>
      </div>
      <nav className="grid gap-0.5" aria-label="Personal">
        <NavItem icon="inbox" label="Inbox" count={4} />
        <NavItem icon="issues" label="My issues" />
        <NavItem icon="review" label="Reviews" count={2} />
      </nav>
      <div className="grid gap-0.5">
        <p className="px-2 pb-1 text-[11px] font-medium text-[var(--dp-11)]">Workspace</p>
        <NavItem icon="project" label="Projects" />
        <NavItem icon="views" label="Views" />
      </div>
      <div className="grid gap-0.5">
        <p className="px-2 pb-1 text-[11px] font-medium text-[var(--dp-11)]">Your teams</p>
        <button type="button" className="dp-nav-item !text-[var(--dp-12)]">
          <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-[#6e56cf] text-[9px] font-bold text-white" aria-hidden>
            E
          </span>
          Engineering
        </button>
        <div className="ml-4 grid gap-0.5 border-l border-[var(--dp-a4)] pl-2">
          <NavItem icon="issues" label="Issues" />
          <NavItem icon="cycle" label="Cycles" current />
          <NavItem icon="project" label="Projects" />
        </div>
        <button type="button" className="dp-nav-item">
          <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-[#12a594] text-[9px] font-bold text-[#111]" aria-hidden>
            P
          </span>
          Platform
        </button>
      </div>
    </aside>
  )
}

function IssueRow({ issue, status }: { issue: Issue; status: Status }) {
  return (
    <div className="dp-row">
      <Priority level={issue.priority} />
      <span className="dp-mono hidden w-[62px] flex-none text-[12px] text-[var(--dp-11)] sm:block">{issue.id}</span>
      <StatusIcon status={status} />
      <span className="min-w-0 flex-1 truncate">{issue.title}</span>
      <span className="hidden flex-none gap-1.5 md:flex">
        {issue.labels.map((label) => (
          <Badge key={label}>
            <span className="dp-dot" style={{ background: labelColors[label] }} aria-hidden />
            {label}
          </Badge>
        ))}
      </span>
      <span className="dp-mono hidden w-[46px] flex-none text-right text-[12px] text-[var(--dp-11)] sm:block">{issue.date}</span>
      <Avatar initials={issue.who} tone={issue.who === 'MK'} />
    </div>
  )
}

function AppShell({ active, onActive, view, setView }: { active: number; onActive: (i: number) => void; view: string; setView: (id: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const manual = useRef(false)
  const last = useRef(-1)
  // 自动播放：用帧循环的时间推进高亮项（截图只接管 rAF），用户一碰命令面板就停。
  useFrameLoop(
    hostRef,
    ({ time }) => {
      if (manual.current) return
      const i = autoplay[Math.floor(time / 1.15) % autoplay.length]!
      if (i !== last.current) {
        last.current = i
        onActive(i)
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
  const takeOver = () => {
    manual.current = true
  }
  return (
    <div className="dp-wrap grid gap-5 pb-20 pt-4 lg:grid-cols-[216px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2 lg:hidden">
          <Mark size={22} />
          <span className="font-semibold">Plinth</span>
          <span className="flex-1" />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Icon name="bell" />
          </Button>
          <Button size="icon" aria-label="Search">
            <Icon name="search" />
          </Button>
        </div>
        <div className="relative">
          <Panel className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--dp-a4)] px-3.5 py-2.5">
              <div className="flex min-w-[160px] flex-1 items-center gap-2">
                <span className="hidden text-[var(--dp-11)] sm:inline">Engineering</span>
                <span className="hidden text-[var(--dp-10)] sm:inline" aria-hidden>
                  /
                </span>
                <span className="truncate font-medium">Cycle 24</span>
                <Badge tone="accent">Current</Badge>
                <span className="dp-mono hidden text-[12px] text-[var(--dp-11)] xl:inline">Nov 4 – Nov 17</span>
              </div>
              <Segmented
                label="Layout"
                className="hidden md:inline-grid"
                items={[
                  { id: 'list', label: 'List' },
                  { id: 'board', label: 'Board' },
                  { id: 'timeline', label: 'Timeline' },
                ]}
                value={view}
                onValueChange={setView}
              />
              <Button variant="ghost" size="icon" aria-label="Filter">
                <Icon name="filter" />
              </Button>
              <Button variant="primary">
                <Icon name="plus" />
                New issue <Kbd>C</Kbd>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--dp-a4)] px-3.5 py-2.5 text-[12px]">
              <span className="text-[var(--dp-11)]">
                Scope <span className="dp-mono text-[var(--dp-12)]">42</span>
              </span>
              <span className="text-[var(--dp-11)]">
                Started <span className="dp-mono text-[var(--dp-12)]">17</span>
              </span>
              <span className="text-[var(--dp-11)]">
                Completed <span className="dp-mono text-[var(--dp-12)]">19</span>
              </span>
              <div className="flex min-w-[140px] flex-1 items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--dp-a3)]" role="progressbar" aria-label="Cycle progress" aria-valuenow={45} aria-valuemin={0} aria-valuemax={100}>
                  <div className="flex h-full">
                    <span className="h-full bg-[var(--dp-accent)]" style={{ width: '45%' }} />
                    <span className="h-full" style={{ width: '40%', background: 'color-mix(in oklab, var(--dp-accent) 35%, transparent)' }} />
                  </div>
                </div>
                <span className="dp-mono text-[var(--dp-11)]">45%</span>
              </div>
            </div>
            {issueGroups.map((group) => (
              <div key={group.name}>
                <div className="flex items-center gap-2 border-b border-[var(--dp-a3)] bg-[var(--dp-a2)] px-3.5 py-1.5 text-[12px]">
                  <StatusIcon status={group.status} />
                  <span className="font-medium">{group.name}</span>
                  <span className="dp-mono text-[var(--dp-11)]">{group.issues.length}</span>
                </div>
                {group.issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} status={group.status} />
                ))}
              </div>
            ))}
            <div className="h-3" />
          </Panel>
          <div className="pointer-events-none absolute inset-0 hidden rounded-[calc(var(--dp-radius)*1.5)] lg:block" style={{ background: 'color-mix(in oklab, var(--dp-s0) 58%, transparent)' }} aria-hidden />
          <div ref={hostRef} className="isolate mt-5 lg:absolute lg:left-1/2 lg:top-[76px] lg:mt-0 lg:w-[min(600px,88%)] lg:-translate-x-1/2" onPointerMove={takeOver} onKeyDown={takeOver} onFocus={takeOver}>
            <CommandBar commands={commands} active={active} onActiveChange={onActive} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Surfaces(props: StyleDarkProProps) {
  const t = tokensOf(props)
  const layers = [
    { name: 'Page', token: '--dp-s0', hex: t.s0, note: 'Gray 1. The app background.', bg: 'var(--dp-s0)', shadow: 'none' },
    { name: 'Panel', token: '--dp-s1', hex: t.s1, note: 'Between gray 2 and 3. Views, cards, sidebars.', bg: 'var(--dp-s1)', shadow: 'inset 0 1px 0 0 var(--dp-hl)' },
    { name: 'Raised', token: '--dp-s2', hex: t.s2, note: 'Gray 3 to 5. Buttons, segmented thumbs.', bg: 'var(--dp-s2)', shadow: 'inset 0 1px 0 0 var(--dp-hl), var(--dp-shadow-1)' },
    { name: 'Overlay', token: '--dp-s3', hex: t.s3, note: 'Gray 4 to 6. Menus, popovers, the command bar.', bg: 'var(--dp-s3)', shadow: 'inset 0 1px 0 0 var(--dp-hl), var(--dp-shadow-2)' },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {layers.map((layer) => (
        <div
          key={layer.name}
          className="flex min-h-[150px] flex-col justify-between rounded-[calc(var(--dp-radius)*1.5)] border border-[var(--dp-a5)] p-4"
          style={{ background: layer.bg, boxShadow: layer.shadow } as CSSProperties}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{layer.name}</span>
            <span className="dp-mono text-[11px] text-[var(--dp-11)]">{layer.hex}</span>
          </div>
          <div>
            <p className="dp-mono text-[12px] text-[var(--dp-accent-text)]">{layer.token}</p>
            <p className="dp-muted mt-1 text-[12px] leading-snug">{layer.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Scale({ family }: { family: GrayFamily }) {
  const scale = grayScales[family] ?? grayScales.slate
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-6 gap-1.5 md:grid-cols-12">
        {scale.solid.map((hex, i) => (
          <div key={hex} className="min-w-0">
            <div className="aspect-[4/5] rounded-[var(--dp-radius)] shadow-[inset_0_0_0_1px_var(--dp-a4)]" style={{ background: hex }} />
            <p className="dp-mono mt-2 text-[12px]">{i + 1}</p>
            <p className="dp-mono truncate text-[10.5px] text-[var(--dp-11)]">{hex}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1.5 rounded-[calc(var(--dp-radius)*1.5)] bg-[var(--dp-s1)] p-1.5 md:grid-cols-12">
        {scale.alpha.map((hex, i) => (
          <div key={hex} className="min-w-0">
            <div className="aspect-[2/1] rounded-[var(--dp-radius)]" style={{ background: hex }} />
            <p className="dp-mono mt-1 px-0.5 text-[10.5px] text-[var(--dp-11)]">A{i + 1}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent" dot>
          Accent
        </Badge>
        <Badge tone="success" dot>
          Green 11
        </Badge>
        <Badge tone="warning" dot>
          Amber 11
        </Badge>
        <Badge tone="danger" dot>
          Red 11
        </Badge>
        <Badge>Gray 11 on A3</Badge>
      </div>
    </div>
  )
}

const typeRows = [
  { spec: 'Display 40 / 44 · 600', cls: 'dp-title text-[30px] sm:text-[40px] sm:leading-[44px]', sample: 'Ship the cycle on Friday' },
  { spec: 'Title 20 / 28 · 600', cls: 'dp-title text-[20px] leading-7', sample: 'Cycle 24 · Engineering' },
  { spec: 'Body 13 / 20 · 400', cls: '', sample: 'Dense by default: 13px text, 32px controls and 36px rows keep a whole sprint on one screen.' },
  { spec: 'Secondary 12 / 16 · 500', cls: 'dp-muted text-[12px] font-medium', sample: 'Updated 4 minutes ago by Mira Kowalski' },
  { spec: 'Mono 12 / 16', cls: 'dp-mono text-[12px]', sample: 'PLN-482 · pln-482-realtime-cursors · v2.4.0-rc.1' },
]

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-[var(--dp-a4)] px-4 py-4 first:border-t-0 sm:grid-cols-[164px_minmax(0,1fr)] sm:items-center">
      <p className="dp-label">{name}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Demo(props: StyleDarkProProps) {
  const [active, setActive] = useState(0)
  const [view, setView] = useState('list')
  const [settings, setSettings] = useState({ autoClose: true, triage: false, digest: true })
  const [tab, setTab] = useState('week')
  const family = (props.grayFamily ?? defaults.grayFamily) as GrayFamily

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleDarkPro {...props}>
        <AppShell active={active} onActive={setActive} view={view} setView={setView} />

        <Section eyebrow="01 · Surfaces" title="Four layers, each one lighter" desc="Elevation is a step up the gray scale plus a 1px whiteA highlight on the top edge. Only raised controls and overlays cast a blackA shadow.">
          <Surfaces {...props} />
        </Section>

        <Section eyebrow="02 · Scale" title="One tinted gray, twelve steps" desc="Solid steps fill surfaces; the matching alpha steps draw every line, hover and selection, so they hold up on any layer.">
          <Scale family={family} />
        </Section>

        <Section eyebrow="03 · Type" title="Thirteen pixels, set tight" desc="One sans for the interface and a mono for IDs, branches and shortcuts. Headings at 600 with negative tracking.">
          <Panel className="overflow-hidden">
            {typeRows.map((row) => (
              <Row key={row.spec} name={row.spec}>
                <p className={row.cls}>{row.sample}</p>
              </Row>
            ))}
          </Panel>
        </Section>

        <Section eyebrow="04 · Controls" title="Built for the keyboard" desc="Every frequent action shows its shortcut. Controls are 32px tall by default and switch to 28 or 36 with the density setting.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <Row name="Buttons">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary">
                    Create issue <Kbd>C</Kbd>
                  </Button>
                  <Button>
                    <Icon name="filter" /> Filter
                  </Button>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="danger">
                    <Icon name="archive" /> Archive
                  </Button>
                  <Button size="icon" aria-label="More actions">
                    <Icon name="more" />
                  </Button>
                </div>
              </Row>
              <Row name="Inputs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input aria-label="Search issues" placeholder="Search issues" icon={<Icon name="search" />} trailing={<Kbd>/</Kbd>} />
                  <Input aria-label="Branch name" placeholder="pln-482-realtime-cursors" icon={<Icon name="branch" />} className="dp-mono" />
                </div>
              </Row>
              <Row name="Badges">
                <div className="flex flex-wrap gap-2">
                  <Badge>Backlog</Badge>
                  <Badge tone="accent">In review</Badge>
                  <Badge tone="success" dot>
                    Deployed
                  </Badge>
                  <Badge tone="warning" dot>
                    Degraded
                  </Badge>
                  <Badge tone="danger" dot>
                    Failed
                  </Badge>
                </div>
              </Row>
              <Row name="Segmented">
                <Segmented
                  label="Range"
                  items={[
                    { id: 'day', label: 'Day' },
                    { id: 'week', label: 'Week' },
                    { id: 'month', label: 'Month' },
                  ]}
                  value={tab}
                  onValueChange={setTab}
                />
              </Row>
            </Panel>
            <div className="grid gap-4">
              <Panel elevation="raised">
                {(
                  [
                    ['autoClose', 'Auto-close stale issues', 'Close issues with no activity for 30 days.'],
                    ['triage', 'Require triage', 'New issues from integrations land in Triage first.'],
                    ['digest', 'Weekly digest', 'A Monday summary of the cycle for the whole team.'],
                  ] as const
                ).map(([key, title, body]) => (
                  <div key={key} className="flex items-center justify-between gap-4 border-t border-[var(--dp-a4)] px-4 py-3.5 first:border-t-0">
                    <div className="min-w-0">
                      <p className="font-medium">{title}</p>
                      <p className="dp-muted text-[12px]">{body}</p>
                    </div>
                    <Switch checked={settings[key]} onCheckedChange={(on) => setSettings((s) => ({ ...s, [key]: on }))} aria-label={title} />
                  </div>
                ))}
              </Panel>
              <Panel className="grid gap-3 p-4">
                <p className="dp-label">Shortcuts</p>
                {(
                  [
                    ['Open command bar', ['⌘', 'K']],
                    ['Go to inbox', ['G', 'I']],
                    ['Assign to me', ['I']],
                    ['Move to next cycle', ['⇧', 'C']],
                  ] as const
                ).map(([label, keys]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="dp-muted">{label}</span>
                    <span className="flex gap-1">
                      {keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </Section>

        <footer className="dp-wrap pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dp-a4)] pt-5 text-[12px] text-[var(--dp-11)]">
            <span className="flex items-center gap-2">
              <Mark size={18} /> Plinth design tokens
            </span>
            <span className="dp-mono">Radix {family} dark · whiteA · blackA</span>
          </div>
        </footer>
      </StyleDarkPro>
    </div>
  )
}
