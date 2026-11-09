import { useState, type ReactNode } from 'react'
import { Alert, Badge, Breadcrumbs, Button, Card, Checkbox, Icon, Input, SearchInput, Select, StyleCorporate, Switch, Tabs, type BadgeProps, type StyleCorporateProps } from './style-corporate'

const I = {
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0',
  filter: 'M4 6h16M7 12h10M10 18h4',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  up: 'M7 14l5-5 5 5',
}

/** 虚构品牌 Corvane 的标志：圆角方块里三条账本横线。 */
function Mark() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <rect width="24" height="24" rx="5" fill="var(--cp-primary)" />
      <path d="M7 8h10M7 12h7M7 16h10" stroke="var(--cp-primary-fg)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

type Status = 'paid' | 'scheduled' | 'approval' | 'overdue' | 'draft'
const STATUS: Record<Status, { label: string; tone: BadgeProps['tone'] }> = {
  paid: { label: 'Paid', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'primary' },
  approval: { label: 'In approval', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'error' },
  draft: { label: 'Draft', tone: 'neutral' },
}

const invoices: { id: string; vendor: string; center: string; due: string; status: Status; amount: string }[] = [
  { id: 'INV-20418', vendor: 'Halvorsen Freight', center: 'OPS-210 Logistics', due: 'Nov 14, 2026', status: 'approval', amount: '12,480.00' },
  { id: 'INV-20417', vendor: 'Bluecrest Facilities', center: 'FAC-104 Facilities', due: 'Nov 12, 2026', status: 'scheduled', amount: '4,215.60' },
  { id: 'INV-20409', vendor: 'Quarry Lane Catering', center: 'HR-330 People', due: 'Oct 28, 2026', status: 'overdue', amount: '1,870.00' },
  { id: 'INV-20402', vendor: 'Tallis & Moore LLP', center: 'LEG-120 Legal', due: 'Nov 30, 2026', status: 'approval', amount: '28,900.00' },
  { id: 'INV-20396', vendor: 'Northfold Packaging', center: 'OPS-210 Logistics', due: 'Nov 03, 2026', status: 'paid', amount: '9,342.18' },
  { id: 'INV-20391', vendor: 'Ivers & Pike Consulting', center: 'FIN-100 Finance', due: 'Oct 21, 2026', status: 'overdue', amount: '36,530.00' },
  { id: 'INV-20385', vendor: 'Kerrow Print Works', center: 'MKT-410 Brand', due: 'Dec 05, 2026', status: 'draft', amount: '2,160.00' },
  { id: 'INV-20377', vendor: 'Sundial Software', center: 'IT-220 Platform', due: 'Nov 01, 2026', status: 'paid', amount: '18,000.00' },
]

const total = (ids: string[]) =>
  invoices
    .filter((row) => ids.includes(row.id))
    .reduce((sum, row) => sum + Number(row.amount.replace(/,/g, '')), 0)
    .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

function Section({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6">
      <p className="cp-overline">{label}</p>
      <h2 className="cp-heading mt-1">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const swatches = [
  ['Primary', 'var(--cp-primary)', 'var(--cp-primary-fg)', '--color-primary'],
  ['Secondary', 'var(--cp-secondary)', 'var(--cp-secondary-fg)', '--color-secondary'],
  ['Accent', 'var(--cp-accent)', 'var(--cp-accent-fg)', '--color-accent'],
  ['Neutral', 'var(--cp-neutral)', 'var(--cp-neutral-fg)', '--color-neutral'],
  ['Base 100', 'var(--cp-b1)', 'var(--cp-bc)', '--color-base-100'],
  ['Base 200', 'var(--cp-b2)', 'var(--cp-bc)', '--color-base-200'],
  ['Base 300', 'var(--cp-b3)', 'var(--cp-bc)', '--color-base-300'],
  ['Info', 'var(--cp-info)', '#fff', '--color-info'],
  ['Success', 'var(--cp-success)', '#fff', '--color-success'],
  ['Warning', 'var(--cp-warning)', '#000', '--color-warning'],
  ['Error', 'var(--cp-error)', 'var(--cp-error-fg)', '--color-error'],
] as const

const typeScale = [
  ['Page title', '24 / 600', 'cp-title', 'Invoices'],
  ['Section', '18 / 600', 'cp-heading', 'Vendor details'],
  ['Body', '14 / 400', 'text-sm', 'Invoices above $10,000 need a second approver before the payment run.'],
  ['Label', '13 / 600', 'cp-label', 'Payment terms'],
  ['Caption', '12 / 400', 'text-xs cp-muted', 'Synced with the general ledger at 09:42'],
  ['Mono', '13 / 400', 'cp-mono', 'INV-20418 · PO-204118'],
] as const

export function Demo(props: StyleCorporateProps) {
  const [tab, setTab] = useState('open')
  const [selected, setSelected] = useState<string[]>(['INV-20417'])
  const [overdueMail, setOverdueMail] = useState(true)
  const [weekly, setWeekly] = useState(false)
  const [twoApprovers, setTwoApprovers] = useState(true)

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const all = selected.length === invoices.length

  return (
    <div className="h-full w-full overflow-y-auto">
      <StyleCorporate {...props}>
        {/* 顶栏 */}
        <header className="border-b border-[var(--cp-line)] bg-[var(--cp-b1)]">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
            <Mark />
            <span className="text-[15px] font-semibold">Corvane</span>
            <span className="cp-muted hidden text-sm sm:inline">/ Finance</span>
            <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
              {['Overview', 'Payables', 'Receivables', 'Payroll', 'Reports'].map((item) => (
                <Button key={item} variant="ghost" size="sm" aria-current={item === 'Payables' ? 'page' : undefined} className={item === 'Payables' ? 'bg-[var(--cp-b2)]' : 'text-[var(--cp-muted)]'}>
                  {item}
                </Button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <SearchInput placeholder="Search invoices, vendors…" aria-label="Search" className="hidden w-64 md:block" />
              <Button variant="ghost" square aria-label="Notifications">
                <Icon d={I.bell} />
              </Button>
              <span className="cp-avatar" aria-label="Mara Kowalczyk">
                MK
              </span>
            </div>
          </div>
        </header>

        {/* 页头 */}
        <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6">
          <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Payables' }, { label: 'Invoices' }]} />
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="cp-title">Invoices</h1>
                <Badge tone="primary">Q4 2026</Badge>
              </div>
              <p className="cp-muted mt-1 text-sm">128 open invoices across 42 vendors. Synced with the general ledger at 09:42.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Icon d={I.download} />
                Export CSV
              </Button>
              <Button variant="primary">
                <Icon d={I.plus} />
                New invoice
              </Button>
            </div>
          </div>

          {/* 指标 */}
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {[
              { label: 'Outstanding', value: '$482,190', note: <Badge tone="neutral">+4.2% vs Q3</Badge> },
              { label: 'Overdue', value: '$38,400', note: <Badge tone="error" dot>9 invoices</Badge> },
              { label: 'Paid this month', value: '$1,206,400', note: <Badge tone="success">+12% vs Oct</Badge> },
              { label: 'Avg. days to pay', value: '23.4', note: <Badge tone="info">Target 30</Badge> },
            ].map((stat) => (
              <Card key={stat.label} className="cp-card-body min-w-0">
                <dt className="cp-muted truncate text-[13px] font-medium">{stat.label}</dt>
                <dd className="m-0 mt-1">
                  <p className="cp-stat-value truncate text-[1.2rem] sm:text-[1.5rem]">{stat.value}</p>
                  <div className="mt-2">{stat.note}</div>
                </dd>
              </Card>
            ))}
          </dl>

          {/* 数据表 */}
          <Card className="mt-6">
            <Tabs
              label="Invoice status"
              className="px-[var(--cp-pad)] pt-1"
              value={tab}
              onValueChange={setTab}
              items={[
                { id: 'all', label: 'All', count: 214 },
                { id: 'open', label: 'Open', count: 128 },
                { id: 'overdue', label: 'Overdue', count: 9 },
                { id: 'paid', label: 'Paid', count: 77 },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2 px-[var(--cp-pad)] py-3">
              <SearchInput placeholder="Filter by vendor or ID" aria-label="Filter invoices" className="min-w-0 flex-1 sm:max-w-72" />
              <Button variant="outline" aria-label="Filters">
                <Icon d={I.filter} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <div className="ml-auto flex items-center gap-3" aria-live="polite">
                <span className="text-sm">
                  <span className="font-semibold">{selected.length} selected</span>
                  <span className="cp-muted cp-num hidden sm:inline"> · ${total(selected)}</span>
                </span>
                <Button size="sm" variant="outline" disabled={!selected.length}>
                  Hold
                </Button>
                <Button size="sm" variant="primary" disabled={!selected.length}>
                  Approve
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto border-t border-[var(--cp-line)]">
              <table className="cp-table min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-10">
                      <Checkbox aria-label="Select all invoices" checked={all} indeterminate={!all && selected.length > 0} onChange={() => setSelected(all ? [] : invoices.map((r) => r.id))} />
                    </th>
                    <th>Invoice</th>
                    <th>Vendor</th>
                    <th>Cost center</th>
                    <th>
                      <span className="inline-flex items-center gap-1">
                        Due
                        <Icon d={I.up} size={13} />
                      </span>
                    </th>
                    <th>Status</th>
                    <th className="cp-end">Amount (USD)</th>
                    <th className="w-10">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((row) => {
                    const on = selected.includes(row.id)
                    return (
                      <tr key={row.id} data-selected={on}>
                        <td>
                          <Checkbox aria-label={`Select ${row.id}`} checked={on} onChange={() => toggle(row.id)} />
                        </td>
                        <td>
                          <a className="cp-link cp-mono" href="#">
                            {row.id}
                          </a>
                        </td>
                        <td>
                          <span className="flex items-center gap-2.5 whitespace-nowrap">
                            <span className="cp-avatar h-7 w-7 rounded-[var(--cp-r)] text-[11px]" aria-hidden>
                              {initials(row.vendor)}
                            </span>
                            {row.vendor}
                          </span>
                        </td>
                        <td className="cp-muted whitespace-nowrap">{row.center}</td>
                        <td className={'cp-num whitespace-nowrap ' + (row.status === 'overdue' ? 'text-[var(--cp-error-ink)] font-medium' : '')}>{row.due}</td>
                        <td>
                          <Badge tone={STATUS[row.status].tone} dot>
                            {STATUS[row.status].label}
                          </Badge>
                        </td>
                        <td className="cp-end cp-num font-medium">{row.amount}</td>
                        <td>
                          <Button variant="ghost" size="sm" square aria-label={`More actions for ${row.id}`}>
                            <Icon d={I.more} />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cp-line)] px-[var(--cp-pad)] py-3">
              <p className="cp-muted m-0 text-[13px]">
                Showing <span className="cp-num font-semibold text-[var(--cp-bc)]">1–8</span> of <span className="cp-num font-semibold text-[var(--cp-bc)]">128</span>
              </p>
              <nav aria-label="Pagination" className="flex items-center gap-1">
                <Button size="sm" variant="ghost" square aria-label="Previous page" disabled>
                  <Icon d={I.left} />
                </Button>
                {['1', '2', '3', '…', '16'].map((p) => (
                  <Button key={p} size="sm" square variant={p === '1' ? 'outline' : 'ghost'} aria-current={p === '1' ? 'page' : undefined} disabled={p === '…'} className="cp-num">
                    {p}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" square aria-label="Next page">
                  <Icon d={I.right} />
                </Button>
              </nav>
            </div>
          </Card>

          {/* 表单 + 提示 */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <div className="cp-card-body">
                <h2 className="cp-heading">Vendor details</h2>
                <p className="cp-muted mt-1 text-sm">Changes apply to invoices received after you save.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Input label="Legal name" defaultValue="Halvorsen Freight AS" state="success" hint="Matches the company registry record." />
                  <Input label="Vendor ID" defaultValue="V-00418" disabled className="cp-mono" />
                  <Input label="Purchase order" defaultValue="PO-55" state="error" hint="PO numbers have six digits, for example PO-204118." className="cp-mono" />
                  <Select
                    label="Payment terms"
                    defaultValue="net30"
                    hint="Counted from the invoice date."
                    options={[
                      { value: 'net15', label: 'Net 15' },
                      { value: 'net30', label: 'Net 30' },
                      { value: 'net45', label: 'Net 45' },
                      { value: 'eom', label: 'End of month' },
                    ]}
                  />
                </div>
                <label className="mt-5 flex items-start gap-3 text-sm">
                  <Checkbox checked={twoApprovers} onChange={() => setTwoApprovers((v) => !v)} className="mt-0.5" />
                  <span>
                    <span className="font-semibold">Require two approvers above $10,000</span>
                    <span className="cp-muted block text-[13px]">Applies to every cost center this vendor bills.</span>
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--cp-line)] px-[var(--cp-pad)] py-3">
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Save vendor</Button>
              </div>
            </Card>

            <div className="grid content-start gap-3">
              <Alert tone="error" title="Possible duplicate">
                INV-20391 matches INV-20377 on amount and vendor reference.
              </Alert>
              <Alert tone="warning" title="3 invoices are missing receipts">
                Attach them before Nov 25 to keep them in this payment run.
              </Alert>
              <Alert tone="success" title="Payment run approved">
                41 invoices, $612,480.00, released to the bank file.
              </Alert>
              <Alert tone="info" title="Ledger sync scheduled">
                The next sync with the general ledger runs at 12:00.
              </Alert>
              <Card className="cp-card-body grid gap-4">
                {[
                  { title: 'Email me when an invoice is overdue', note: 'Sent to mara.k@corvane.example at 08:00', on: overdueMail, set: setOverdueMail },
                  { title: 'Weekly payables summary', note: 'Every Monday, as a PDF', on: weekly, set: setWeekly },
                ].map((row) => (
                  <div key={row.title} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold">{row.title}</p>
                      <p className="cp-muted m-0 text-[13px]">{row.note}</p>
                    </div>
                    <Switch checked={row.on} onCheckedChange={row.set} aria-label={row.title} />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>

        {/* 样张 */}
        <Section label="Style sheet · 01" title="Colour">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
            {swatches.map(([name, bg, fg, token]) => (
              <div key={name} className="min-w-0">
                <div className="grid h-20 place-items-center border border-[var(--cp-line)] text-lg font-semibold" style={{ background: bg, color: fg, borderRadius: 'var(--cp-r)' }}>
                  Aa
                </div>
                <p className="m-0 mt-2 text-[13px] font-semibold">{name}</p>
                <p className="cp-muted cp-mono m-0 truncate text-[11px]">{token}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Style sheet · 02" title="Type">
          <Card>
            {typeScale.map(([name, spec, cls, sample], i) => (
              <div key={name} className={'grid items-baseline gap-1 px-[var(--cp-pad)] py-4 sm:grid-cols-[160px_1fr] sm:gap-6 ' + (i ? 'border-t border-[var(--cp-hair)]' : '')}>
                <div>
                  <p className="m-0 text-[13px] font-semibold">{name}</p>
                  <p className="cp-muted cp-mono m-0 text-[11px]">{spec}</p>
                </div>
                <p className={'m-0 ' + cls}>{sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section label="Style sheet · 03" title="Controls">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="cp-card-body grid content-start gap-5">
              <div>
                <p className="cp-label">Buttons</p>
                <p className="cp-muted m-0 text-[13px]">One primary action per view, placed last.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Approve</Button>
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="neutral">Neutral</Button>
                <Button variant="error">Void invoice</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="primary">
                  Small
                </Button>
                <Button variant="primary">Medium</Button>
                <Button size="lg" variant="primary">
                  Large
                </Button>
              </div>
            </Card>
            <Card className="cp-card-body grid content-start gap-5">
              <div>
                <p className="cp-label">Badges</p>
                <p className="cp-muted m-0 text-[13px]">Soft tints; text always uses the darker ink.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Draft</Badge>
                <Badge tone="primary" dot>
                  Scheduled
                </Badge>
                <Badge tone="info">Synced</Badge>
                <Badge tone="success" dot>
                  Paid
                </Badge>
                <Badge tone="warning" dot>
                  In approval
                </Badge>
                <Badge tone="error" dot>
                  Overdue
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Approver" placeholder="Name or email" />
                <Input label="Amount" defaultValue="12,480.00" state="success" className="cp-num" />
              </div>
            </Card>
          </div>
        </Section>

        <footer className="mx-auto mt-14 w-full max-w-7xl border-t border-[var(--cp-line)] px-4 py-6 sm:px-6">
          <div className="cp-muted flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2">
              <Mark /> Corvane Finance · v4.12
            </span>
            <span>Data refreshed 09:42 · All amounts in USD</span>
          </div>
        </footer>
      </StyleCorporate>
    </div>
  )
}
