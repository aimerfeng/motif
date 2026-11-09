import { cn, cssVars } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#8b7bff',
  font: 'serif',
  connectorStyle: 'beam',
  radius: 16,
  columns: 3,
  showFilters: true,
  heading: 'Start from a recipe, not a blank canvas',
  subheading: '140 tested workflows between the apps you already run. Pick one, map two fields, and it fires on the next event.',
}
/* @motif:end */

export type ShowcaseIntegrationRecipesProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 当作「悬停中」显示的配方 id（演示的自动播放用）；真实的悬停和焦点优先。 */
  highlightId?: string | null
  /** 受控的展开配方；不传则组件自己管理。 */
  openId?: string | null
  onOpenChange?: (id: string | null) => void
}

// ---- 数据：应用全是虚构的，只有名字、色相和一个几何字形，不涉及任何真实商标 ----

type AppId = 'pipewell' | 'cadenza' | 'sheetwise' | 'ledgerline' | 'helmdesk' | 'keelson' | 'chirrup' | 'formfold' | 'bugloft'

const APPS: Record<AppId, { name: string; kind: string; hue: number; dark: boolean; glyph: string }> = {
  pipewell: { name: 'Pipewell', kind: 'CRM', hue: 22, dark: false, glyph: 'M4.5 5.5h15l-5.5 6.500v5.500l-4 2v-7.500z' },
  cadenza: { name: 'Cadenza', kind: 'Scheduling', hue: 42, dark: true, glyph: 'M5 7.500A1.500 1.500 0 0 1 6.500 6h11A1.500 1.500 0 0 1 19 7.500v10a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 17.500zM5 10.500h14M9 4v3M15 4v3M9 14h2.500' },
  sheetwise: { name: 'Sheetwise', kind: 'Spreadsheets', hue: 112, dark: true, glyph: 'M4.500 5.500h15v13h-15zM4.500 10h15M4.500 14.500h15M10 5.500v13' },
  ledgerline: { name: 'Ledgerline', kind: 'Accounting', hue: 158, dark: false, glyph: 'M6.500 4h11v16l-2.750-1.800L12 20l-2.750-1.800L6.500 20zM9.500 9h5M9.500 12.500h5M9.500 16h3' },
  helmdesk: { name: 'Helmdesk', kind: 'Support', hue: 198, dark: false, glyph: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6.400 6.400l3.500 3.500M14.100 14.100l3.500 3.500M17.600 6.400l-3.500 3.500M9.900 14.100l-3.500 3.500' },
  keelson: { name: 'Keelson', kind: 'Deploys', hue: 232, dark: false, glyph: 'M4 14.500h16l-2.500 4.500h-11zM12 4v10.500M12 5.500l5.500 7H12' },
  chirrup: { name: 'Chirrup', kind: 'Team chat', hue: 268, dark: false, glyph: 'M5 6.500A1.500 1.500 0 0 1 6.500 5h11A1.500 1.500 0 0 1 19 6.500v8a1.500 1.500 0 0 1-1.500 1.500H11l-4 3.500V16h-.5A1.500 1.500 0 0 1 5 14.500zM9 10.500h.01M12 10.500h.01M15 10.500h.01' },
  formfold: { name: 'Formfold', kind: 'Forms', hue: 322, dark: false, glyph: 'M5.500 5.500h13v13h-13zM8.500 12l2.500 2.500 4.500-5' },
  bugloft: { name: 'Bugloft', kind: 'Issue tracking', hue: 354, dark: false, glyph: 'M9 8.500a3 3 0 0 1 6 0M8 9.500h8v4.500a4 4 0 0 1-8 0zM12 10v8M4.500 12.500H8M16 12.500h3.500M5.500 17.500l2.700-1.600M18.500 17.500l-2.700-1.600M6 7.500l2.200 1.600M18 7.500l-2.200 1.600' },
}
const APP_ORDER = Object.keys(APPS) as AppId[]

type UseCase = 'sales' | 'support' | 'finance' | 'engineering' | 'ops'
const USE_CASES: { id: UseCase | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sales', label: 'Sales' },
  { id: 'support', label: 'Support' },
  { id: 'finance', label: 'Finance' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'ops', label: 'Ops' },
]

type StepKind = 'trigger' | 'filter' | 'find' | 'format' | 'delay' | 'action'
type Step = { kind: StepKind; app?: AppId; text: string; fields?: string[] }
type Recipe = { id: string; useCase: UseCase; from: AppId; to: AppId; when: string; then: string; payload: string; teams: string; minutes: number; steps: Step[] }

const RECIPES: Recipe[] = [
  {
    id: 'deal-won',
    useCase: 'sales',
    from: 'pipewell',
    to: 'chirrup',
    when: 'a deal closes',
    then: 'post it to #wins',
    payload: '$18,200',
    teams: '3.1k',
    minutes: 2,
    steps: [
      { kind: 'trigger', app: 'pipewell', text: 'Deal stage changes to Closed won' },
      { kind: 'filter', text: 'Only when the amount is over $5,000' },
      { kind: 'action', app: 'chirrup', text: 'Post to #wins with the owner and amount', fields: ['owner', 'account', 'amount'] },
    ],
  },
  {
    id: 'urgent-ticket',
    useCase: 'support',
    from: 'helmdesk',
    to: 'chirrup',
    when: 'a ticket is marked urgent',
    then: 'page #support-oncall',
    payload: 'TCK-4821',
    teams: '1.8k',
    minutes: 3,
    steps: [
      { kind: 'trigger', app: 'helmdesk', text: 'Ticket priority is set to Urgent' },
      { kind: 'format', text: 'Attach the customer plan and the last three replies' },
      { kind: 'action', app: 'chirrup', text: 'Post to #support-oncall and mention the on-call lead', fields: ['ticket', 'plan'] },
    ],
  },
  {
    id: 'invoice-paid',
    useCase: 'finance',
    from: 'ledgerline',
    to: 'pipewell',
    when: 'an invoice is paid',
    then: 'mark the deal as paid',
    payload: 'INV-0932',
    teams: '960',
    minutes: 3,
    steps: [
      { kind: 'trigger', app: 'ledgerline', text: 'Invoice status becomes Paid' },
      { kind: 'find', app: 'pipewell', text: 'Find the open deal by customer email' },
      { kind: 'action', app: 'pipewell', text: 'Set Payment to Paid and attach the receipt', fields: ['receipt_url'] },
    ],
  },
  {
    id: 'deploy-failed',
    useCase: 'engineering',
    from: 'keelson',
    to: 'bugloft',
    when: 'a production deploy fails',
    then: 'open a bug',
    payload: 'build 611',
    teams: '1.2k',
    minutes: 2,
    steps: [
      { kind: 'trigger', app: 'keelson', text: 'Deploy to production exits with an error' },
      { kind: 'action', app: 'bugloft', text: 'Create a P1 bug with the commit and the last 40 log lines', fields: ['commit', 'log_tail'] },
    ],
  },
  {
    id: 'new-hire',
    useCase: 'ops',
    from: 'formfold',
    to: 'sheetwise',
    when: 'someone finishes onboarding',
    then: 'add them to New hires',
    payload: '+1 row',
    teams: '2.4k',
    minutes: 2,
    steps: [
      { kind: 'trigger', app: 'formfold', text: 'New response to the Onboarding form' },
      { kind: 'format', text: 'Split the full name into first and last' },
      { kind: 'action', app: 'sheetwise', text: 'Append a row to the New hires sheet', fields: ['name', 'start_date', 'team'] },
    ],
  },
  {
    id: 'demo-booked',
    useCase: 'sales',
    from: 'cadenza',
    to: 'pipewell',
    when: 'a demo is booked',
    then: 'create a deal for the host',
    payload: 'Thu 14:00',
    teams: '2.7k',
    minutes: 2,
    steps: [
      { kind: 'trigger', app: 'cadenza', text: 'Event booked on the Product demo page' },
      { kind: 'action', app: 'pipewell', text: 'Create a deal in Discovery, owned by the host', fields: ['invitee', 'company'] },
    ],
  },
  {
    id: 'bug-closed',
    useCase: 'support',
    from: 'bugloft',
    to: 'helmdesk',
    when: 'a bug is closed',
    then: 'reply to every linked ticket',
    payload: 'BUG-208',
    teams: '740',
    minutes: 4,
    steps: [
      { kind: 'trigger', app: 'bugloft', text: 'Bug moves to Done' },
      { kind: 'find', app: 'helmdesk', text: 'Find tickets linked to the bug' },
      { kind: 'action', app: 'helmdesk', text: 'Reply with the fix note and mark as Solved', fields: ['release'] },
    ],
  },
  {
    id: 'payment-failed',
    useCase: 'finance',
    from: 'ledgerline',
    to: 'chirrup',
    when: 'a card payment fails',
    then: 'alert the account owner',
    payload: '$240 due',
    teams: '1.1k',
    minutes: 3,
    steps: [
      { kind: 'trigger', app: 'ledgerline', text: 'A subscription charge fails' },
      { kind: 'delay', text: 'Wait one hour for the automatic retry' },
      { kind: 'action', app: 'chirrup', text: 'Message the account owner if it is still unpaid', fields: ['customer', 'amount'] },
    ],
  },
  {
    id: 'focus-block',
    useCase: 'engineering',
    from: 'bugloft',
    to: 'cadenza',
    when: 'a P1 bug is assigned to you',
    then: 'block two hours of focus time',
    payload: '2h focus',
    teams: '530',
    minutes: 1,
    steps: [
      { kind: 'trigger', app: 'bugloft', text: 'A P1 bug is assigned to me' },
      { kind: 'action', app: 'cadenza', text: 'Book a focus block in the next free two-hour slot' },
    ],
  },
]

const STEP_LABEL: Record<StepKind, string> = { trigger: 'Trigger', filter: 'Filter', find: 'Find', format: 'Format', delay: 'Delay', action: 'Action' }
// 内置步骤（不属于任何应用）的小图标
const STEP_GLYPH: Partial<Record<StepKind, string>> = {
  filter: 'M5 6.500h14M8 12h8M10.500 17.500h3',
  format: 'M6 7h12M6 12h8M6 17h10',
  delay: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 8v4l2.500 2',
}

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.035em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.035em' },
}
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

// 主色填充上的文字：分别算深、浅两种墨色对主色的对比度，取高的那个，中等亮度的主色也不会配到白字
const DARK_INK = '#0b0b0f'
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}
function inkFor(hex: string) {
  const l = luminance(hex)
  if (l === null) return '#ffffff'
  const dark = luminance(DARK_INK) ?? 0
  const onWhite = 1.05 / (l + 0.05)
  const onDark = (l + 0.05) / (dark + 0.05)
  return onDark >= onWhite ? DARK_INK : '#ffffff'
}

// 主色当文字用时先和前景色混一下：深色主色在深底上、浅色主色在浅底上都还能读
const ACC_TEXT = 'color-mix(in oklab, var(--acc) 56%, var(--foreground))'
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
// 数据包一趟的时长和两趟之间的停顿（秒）
const TRIP = 1.7
const REST = 0.45

function Mark({ app, size, radius, className }: { app: AppId; size: number; radius: number; className?: string }) {
  const a = APPS[app]
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center', className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.min(radius, size * 0.34),
        color: a.dark ? 'rgb(18 14 4 / .82)' : '#fff',
        background: `linear-gradient(145deg, hsl(${a.hue} 82% 62%), hsl(${(a.hue + 26) % 360} 72% ${a.dark ? 48 : 42}%))`,
        boxShadow: `inset 0 1px 0 rgb(255 255 255 / .3), inset 0 0 0 1px rgb(255 255 255 / .08), 0 10px 22px -12px hsl(${a.hue} 85% 50% / .85)`,
      }}
    >
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} fill="none" stroke="currentColor" strokeWidth={size < 30 ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={a.glyph} />
      </svg>
    </span>
  )
}

function Connector({ recipe, variant, active, run, radius }: { recipe: Recipe; variant: string; active: boolean; run: boolean; radius: number }) {
  const a = APPS[recipe.from]
  const b = APPS[recipe.to]
  const markR = Math.max(5, radius * 0.75)
  const pipe = variant === 'pipe'
  const dashed = variant === 'dashed'
  const packet = (
    <span
      className={cn('absolute top-1/2 left-0 inline-flex h-[18px] -translate-x-1/2 -translate-y-1/2 items-center px-1.5 text-[10px] leading-none font-medium whitespace-nowrap tabular-nums', dashed ? 'rounded-[4px]' : 'rounded-full')}
      style={{
        fontFamily: MONO,
        background: 'var(--acc)',
        color: 'var(--acc-ink)',
        boxShadow: pipe ? 'none' : '0 0 0 3px color-mix(in oklab, var(--acc) 22%, transparent), 0 6px 18px -4px color-mix(in oklab, var(--acc) 75%, transparent)',
      }}
    >
      {recipe.payload}
    </span>
  )

  return (
    <div className="relative flex items-center gap-3">
      <Mark app={recipe.from} size={44} radius={markR} className="relative z-10" />
      <div aria-hidden className="relative h-6 min-w-0 flex-1">
        {variant === 'beam' && (
          <>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-opacity duration-300" style={{ opacity: active ? 0.95 : 0.4, background: `linear-gradient(90deg, hsl(${a.hue} 80% 62%), hsl(${b.hue} 80% 64%))` }} />
            <span className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 blur-[5px] transition-opacity duration-300" style={{ opacity: active ? 0.55 : 0, background: `linear-gradient(90deg, hsl(${a.hue} 80% 60%), var(--acc), hsl(${b.hue} 80% 60%))` }} />
          </>
        )}
        {dashed && (
          <span
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[1.5px] border-dashed transition-[border-color] duration-300"
            style={{ borderColor: active ? 'color-mix(in oklab, var(--acc-text) 80%, transparent)' : 'color-mix(in oklab, var(--foreground) 22%, transparent)' }}
          />
        )}
        {pipe && (
          <span
            className="absolute inset-x-0 top-1/2 h-[24px] -translate-y-1/2 rounded-full border transition-[border-color,box-shadow] duration-300"
            style={{
              background: 'color-mix(in oklab, var(--muted) 70%, transparent)',
              borderColor: active ? 'color-mix(in oklab, var(--acc) 55%, var(--border))' : undefined,
              boxShadow: active ? 'inset 0 0 12px -2px color-mix(in oklab, var(--acc) 45%, transparent)' : 'inset 0 1px 3px rgb(0 0 0 / .25)',
            }}
          />
        )}
        {active &&
          (run ? (
            // 外层占满整条通道，按自身宽度平移 0→100%：数据包中心正好从通道起点走到终点，不用测量
            <motion.span className="absolute inset-0" initial={{ x: '0%' }} animate={{ x: ['0%', '100%'] }} transition={{ duration: TRIP, ease: [0.6, 0, 0.3, 1], repeat: Infinity, repeatDelay: REST }}>
              <motion.span className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: TRIP, times: [0, 0.16, 0.84, 1], repeat: Infinity, repeatDelay: REST }}>
                {packet}
              </motion.span>
            </motion.span>
          ) : (
            <span className="absolute inset-0 translate-x-1/2">{packet}</span>
          ))}
      </div>
      <span className="relative z-10">
        <motion.span
          className="block"
          animate={active && run ? { scale: [1, 1, 1.08, 1] } : { scale: 1 }}
          transition={active && run ? { duration: TRIP, times: [0, 0.82, 0.9, 1], repeat: Infinity, repeatDelay: REST } : { duration: 0.2 }}
        >
          <Mark app={recipe.to} size={44} radius={markR} />
        </motion.span>
        {active && run && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 border-2"
            style={{ borderRadius: Math.min(markR, 15), borderColor: 'var(--acc)' }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0, 0.8, 0], scale: [1, 1, 1.04, 1.5] }}
            transition={{ duration: TRIP, times: [0, 0.82, 0.88, 1], repeat: Infinity, repeatDelay: REST }}
          />
        )}
      </span>
    </div>
  )
}

function Steps({ recipe, id, radius, run }: { recipe: Recipe; id: string; radius: number; run: boolean }) {
  const [on, setOn] = useState(false)
  const btnR = Math.max(4, Math.round(radius * 0.6))
  return (
    <div id={id} className="mt-5 border-t pt-4">
      <ol className="space-y-3.5" aria-label="Steps">
        {recipe.steps.map((s, i) => (
          <li key={i} className="relative flex gap-3">
            {i < recipe.steps.length - 1 && <span aria-hidden className="absolute top-7 -bottom-3.5 left-[11px] w-px" style={{ background: 'color-mix(in oklab, var(--foreground) 14%, transparent)' }} />}
            {s.app ? (
              <Mark app={s.app} size={23} radius={Math.max(4, radius * 0.4)} className="mt-0.5" />
            ) : (
              <span aria-hidden className="mt-0.5 grid size-[23px] shrink-0 place-items-center border bg-muted text-muted-foreground" style={{ borderRadius: Math.max(4, radius * 0.4) }}>
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={STEP_GLYPH[s.kind] ?? STEP_GLYPH.filter} />
                </svg>
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {STEP_LABEL[s.kind]}
                {s.app && <span className="font-normal normal-case"> · {APPS[s.app].name}</span>}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-pretty">{s.text}</p>
              {s.fields && (
                <p className="mt-1.5 flex flex-wrap gap-1">
                  {s.fields.map((f) => (
                    <code key={f} className="rounded border bg-muted px-1.5 py-px text-[11px] text-muted-foreground" style={{ fontFamily: MONO }}>
                      {f}
                    </code>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* 文字本身随状态变化（Turn on / Recipe is on），所以不再加 aria-pressed，免得读屏念出矛盾的状态 */}
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className={cn('inline-flex h-9 items-center gap-1.5 px-3.5 text-sm font-medium transition-[filter,background-color,color] hover:brightness-110', FOCUS)}
          style={{ borderRadius: btnR, background: on ? 'color-mix(in oklab, var(--acc) 18%, transparent)' : 'var(--acc)', color: on ? 'var(--acc-text)' : 'var(--acc-ink)' }}
        >
          {on && (
            <motion.svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden initial={run ? { scale: 0.4, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }}>
              <path d="m3.500 8.500 3 3 6-7" />
            </motion.svg>
          )}
          {on ? 'Recipe is on' : 'Turn on recipe'}
        </button>
        <button type="button" className={cn('inline-flex h-9 items-center border px-3.5 text-sm font-medium transition-colors hover:bg-muted', FOCUS)} style={{ borderRadius: btnR }}>
          Customize
        </button>
      </div>
    </div>
  )
}

/** 集成配方：一句话写成的自动化卡片，两个虚构应用之间有一条通道，悬停时数据包沿通道送过去；可按用途或应用筛选，步骤就地展开。 */
export function ShowcaseIntegrationRecipes({ className, style, highlightId, openId, onOpenChange, ...props }: ShowcaseIntegrationRecipesProps) {
  const { accent, font, connectorStyle, radius: rawRadius, columns, showFilters, heading, subheading } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = !reduced
  const uid = useId()
  const f = FONT[font] ?? FONT.serif
  const radius = Math.max(0, Math.min(28, rawRadius))
  const cols = columns >= 3 ? 3 : 2
  const chipR = radius >= 14 ? 999 : Math.max(4, Math.round(radius * 0.6))

  const [useCase, setUseCase] = useState<UseCase | 'all'>('all')
  const [app, setApp] = useState<AppId | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [ownOpen, setOwnOpen] = useState<string | null>(null)
  const open = openId !== undefined ? openId : ownOpen
  const setOpen = (id: string | null) => {
    if (openId === undefined) setOwnOpen(id)
    onOpenChange?.(id)
  }
  // 首屏入场依次错开；之后筛选带来的新卡片不再等待
  const entered = useRef(false)

  const byApp = (r: Recipe) => !app || r.from === app || r.to === app
  const visible = useMemo(() => RECIPES.filter((r) => (useCase === 'all' || r.useCase === useCase) && (!app || r.from === app || r.to === app)), [useCase, app])
  const filtered = useCase !== 'all' || app !== null
  const active = hovered ?? focused ?? highlightId ?? null
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (d: number) => ({ initial: run ? { opacity: 0, y: 16 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: d, ease } })
  const caseName = USE_CASES.find((u) => u.id === useCase)?.label ?? ''

  return (
    <section
      className={cn('relative w-full overflow-hidden text-foreground', className)}
      style={cssVars({ '--acc': accent, '--acc-ink': inkFor(accent), '--acc-text': ACC_TEXT }, { fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style })}
    >
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[56rem] max-w-[140%] -translate-x-1/2 rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--acc) 22%, transparent), transparent)' }} />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
        <motion.header {...enter(0)} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc-text)' }}>
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2.500 4.500h4l3 7h4M10.500 9l3 2.500-3 2.500" />
              </svg>
              Recipes
            </p>
            <h2 className="mt-3 text-4xl text-balance sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-base text-pretty text-muted-foreground">{subheading}</p>
          </div>
          <a href="#" className={cn('group inline-flex h-10 shrink-0 items-center gap-2 self-start border px-4 text-sm font-medium transition-colors hover:bg-muted lg:self-auto', FOCUS)} style={{ borderRadius: chipR }}>
            Browse all 140 recipes
            <svg viewBox="0 0 16 16" className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </motion.header>

        {showFilters && (
          <motion.div {...enter(0.08)} className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filter by use case" className="flex flex-wrap gap-2">
              {USE_CASES.map((u) => {
                const on = useCase === u.id
                const count = RECIPES.filter((r) => (u.id === 'all' || r.useCase === u.id) && byApp(r)).length
                return (
                  <button
                    key={u.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setUseCase(u.id)}
                    className={cn('inline-flex h-8 items-center gap-1.5 border px-3 text-sm transition-[background-color,border-color,color]', on ? 'font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground', FOCUS)}
                    style={{ borderRadius: chipR, ...(on ? { background: 'var(--acc)', color: 'var(--acc-ink)', borderColor: 'color-mix(in oklab, var(--acc-text) 45%, transparent)' } : {}) }}
                  >
                    {u.label}
                    <span className="text-xs tabular-nums opacity-70">{count}</span>
                  </button>
                )
              })}
            </div>
            <div role="group" aria-label="Filter by app" className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <span className="mr-1.5 hidden text-xs text-muted-foreground sm:inline">Apps</span>
              {APP_ORDER.map((id) => {
                const on = app === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${APPS[id].name} recipes`}
                    title={`${APPS[id].name} · ${APPS[id].kind}`}
                    onClick={() => setApp(on ? null : id)}
                    className={cn('grid size-8 place-items-center border transition-[opacity,background-color,border-color]', app && !on && 'opacity-40 hover:opacity-100 focus-visible:opacity-100', FOCUS)}
                    style={{
                      borderRadius: Math.max(6, Math.round(radius * 0.55)),
                      borderColor: on ? 'var(--acc-text)' : 'transparent',
                      background: on ? 'color-mix(in oklab, var(--acc) 14%, transparent)' : undefined,
                    }}
                  >
                    <Mark app={id} size={22} radius={Math.max(4, radius * 0.38)} />
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        <div className={cn('flex min-h-5 items-center gap-3 text-xs text-muted-foreground', showFilters ? 'mt-4' : 'mt-10')}>
          <p aria-live="polite">
            {filtered ? `${visible.length} of ${RECIPES.length} recipes` : `${RECIPES.length} popular recipes`}
            {app && ` with ${APPS[app].name}`}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setUseCase('all')
                setApp(null)
              }}
              className={cn('rounded font-medium underline-offset-4 hover:underline', FOCUS)}
              style={{ color: 'var(--acc-text)' }}
            >
              Clear filters
            </button>
          )}
        </div>

        <ul className={cn('mt-4 grid items-start gap-4 sm:grid-cols-2', cols === 3 && 'lg:grid-cols-3')}>
          <AnimatePresence mode="popLayout">
            {visible.map((r, i) => {
              const isActive = active === r.id
              const isOpen = open === r.id
              const panelId = `${uid}-${r.id}`
              const delay = entered.current ? 0 : 0.14 + i * 0.05
              return (
                <motion.li
                  key={r.id}
                  layout={run ? 'position' : false}
                  initial={run ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={run ? { opacity: 0, scale: 0.97, transition: { duration: 0.18 } } : { opacity: 0, transition: { duration: 0 } }}
                  transition={{ duration: 0.5, delay, ease, layout: { type: 'spring', visualDuration: 0.4, bounce: 0.12 } }}
                  onAnimationComplete={() => {
                    entered.current = true
                  }}
                  className="min-w-0"
                >
                  <article
                    onPointerEnter={() => setHovered(r.id)}
                    onPointerLeave={() => setHovered((h) => (h === r.id ? null : h))}
                    onFocus={() => setFocused(r.id)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused((v) => (v === r.id ? null : v))
                    }}
                    className="relative overflow-hidden border bg-card p-5 transition-[border-color,box-shadow] duration-300"
                    style={{
                      borderRadius: radius,
                      borderColor: isActive || isOpen ? 'color-mix(in oklab, var(--acc-text) 45%, var(--border))' : undefined,
                      boxShadow: isActive ? '0 18px 40px -24px color-mix(in oklab, var(--acc) 70%, transparent)' : '0 1px 0 rgb(255 255 255 / .03) inset',
                    }}
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: isActive ? 1 : 0, background: 'radial-gradient(120% 70% at 50% 0%, color-mix(in oklab, var(--acc) 12%, transparent), transparent 65%)' }} />
                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span className="font-medium tracking-wide uppercase">{USE_CASES.find((u) => u.id === r.useCase)?.label}</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5.500 7.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5ZM1.500 13.500a4 4 0 0 1 8 0M11 7.500a2 2 0 1 0 0-4M12 9.500a3.500 3.500 0 0 1 2.500 4" />
                          </svg>
                          {r.teams} teams
                        </span>
                      </div>
                      <Connector recipe={r} variant={connectorStyle} active={isActive} run={run} radius={radius} />
                      <h3 className={cn('mt-4 text-[15px] leading-[1.4] font-normal text-pretty sm:min-h-[4.2em]', cols === 2 && 'lg:min-h-[2.8em]')}>
                        When {r.when} in <strong className="font-semibold">{APPS[r.from].name}</strong>, {r.then} in <strong className="font-semibold">{APPS[r.to].name}</strong>.
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {r.steps.length} steps · {r.minutes} min setup
                        </span>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpen(isOpen ? null : r.id)}
                          className={cn('inline-flex h-8 shrink-0 items-center gap-1.5 border px-3 text-sm font-medium transition-[background-color,border-color,color] hover:bg-muted', FOCUS)}
                          style={{ borderRadius: chipR, ...(isActive && !isOpen ? { borderColor: 'color-mix(in oklab, var(--acc-text) 50%, var(--border))', color: 'var(--acc-text)' } : {}) }}
                        >
                          {isOpen ? 'Hide steps' : 'Use recipe'}
                          <svg viewBox="0 0 16 16" className={cn('size-3.5 transition-transform duration-300', isOpen && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m4 6 4 4 4-4" />
                          </svg>
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="steps"
                            initial={run ? { height: 0, opacity: 0 } : false}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={run ? { height: 0, opacity: 0 } : { opacity: 0, transition: { duration: 0 } }}
                            transition={{ duration: 0.38, ease }}
                            className="overflow-hidden"
                          >
                            <Steps recipe={r} id={panelId} radius={radius} run={run} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </article>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {visible.length === 0 && (
          <div className="mt-4 grid place-items-center border border-dashed px-6 py-12 text-center" style={{ borderRadius: radius }}>
            <p className="text-sm">
              No {caseName.toLowerCase()} recipes use {app ? APPS[app].name : 'this app'} yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setUseCase('all')
                setApp(null)
              }}
              className={cn('mt-3 inline-flex h-8 items-center border px-3 text-sm font-medium transition-colors hover:bg-muted', FOCUS)}
              style={{ borderRadius: chipR }}
            >
              Show all recipes
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
