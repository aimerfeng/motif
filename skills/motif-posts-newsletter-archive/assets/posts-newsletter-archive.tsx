import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#f2a65a',
  font: 'newsreader',
  radius: 12,
  layout: 'split',
  showPreview: true,
  showTags: true,
  name: 'Ledgerline',
  heading: 'Every letter, since the first one',
}
/* @motif:end */

export type Issue = {
  /** 期号。 */
  no: number
  /** ISO 日期，例如 2026-10-27。 */
  date: string
  title: string
  /** 一句话导语。 */
  teaser: string
  tags: string[]
  /** 阅读时长（分钟）。 */
  minutes: number
  /** 正文开头的几句。 */
  opening: string
  /** 本期目录。 */
  contents: string[]
  /** 这一期的地址；不传时用 #issue-<期号>。 */
  href?: string
}

export type NewsletterArchiveProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  issues?: Issue[]
  /** 标题下的一句介绍；后面自动接上作者、创刊时间和期数。 */
  description?: string
  /** 作者署名；预览里的「回信给 …」取第一个词。传空字符串隐藏。 */
  author?: string
  /** 创刊年月，例如 2021-07。传空字符串隐藏。 */
  since?: string
  /** 下一期的 ISO 日期；传空字符串时不写日期。 */
  nextIssueDate?: string
  /** 订阅框里关于频率的一句话。 */
  cadence?: string
  /** 订阅人数；0 时隐藏。 */
  readers?: number
  /** 更早几期（不在 issues 里的）的完整目录；传空字符串隐藏那一行。 */
  indexHref?: string
  /** RSS 地址；传空字符串隐藏。 */
  rssHref?: string
  /** 选中的期号；不传时组件自己管理。 */
  selected?: number | null
  onSelectedChange?: (no: number | null) => void
  query?: string
  onQueryChange?: (query: string) => void
  /** 'all' 或四位年份。 */
  year?: string
  onYearChange?: (year: string) => void
  /** 话题筛选：精确匹配标签，null 表示不筛。 */
  tag?: string | null
  onTagChange?: (tag: string | null) => void
  onSubscribe?: (email: string) => void
}

export const ISSUES: Issue[] = [
  {
    no: 64,
    date: '2026-10-27',
    title: 'The quiet price increase',
    teaser: 'We raised the Team plan by 22% with four emails and lost two customers. Every email, word for word.',
    tags: ['Pricing', 'Customers'],
    minutes: 9,
    opening: 'September was the month we raised the Team plan from $18 to $22 a seat. I spent three weeks dreading it and about forty minutes actually doing it. This issue is the forty minutes.',
    contents: ['The four emails, in the order they went out', 'What 31 customers wrote back', 'The two we lost, and why that is fine'],
  },
  {
    no: 63,
    date: '2026-09-29',
    title: 'Hiring our fifth person',
    teaser: 'A job post that drew 412 applications, and the three written questions that got us down to six interviews.',
    tags: ['Hiring', 'Operations'],
    minutes: 11,
    opening: 'Five is a strange size for a company. It is the first hire the founders don’t interview alone, and the first person who never met the version of us that fit around a kitchen table.',
    contents: ['Writing a job post people read to the end', 'Three questions instead of a take-home', 'The offer, and the candidate we lost'],
  },
  {
    no: 62,
    date: '2026-08-25',
    title: 'Support at 2,000 customers',
    teaser: 'We still answer every ticket ourselves. What changed is when we answer, and which ones we let wait.',
    tags: ['Support', 'Customers'],
    minutes: 7,
    opening: 'Our median first reply is now four hours. Two years ago it was twenty minutes, and our customers were noticeably less happy.',
    contents: ['Why faster replies made things worse', 'The two-inbox rule', 'Eleven saved replies we deleted'],
  },
  {
    no: 61,
    date: '2026-07-28',
    title: 'A year without a roadmap',
    teaser: 'Last July we swapped the quarterly roadmap for one list of customer problems. Twelve months on, the scorecard.',
    tags: ['Product', 'Essays'],
    minutes: 10,
    opening: 'Last July I deleted our roadmap. Not archived, deleted, along with the four spreadsheets that fed it and the meeting that reviewed them.',
    contents: ['The problem list, as it looks today', 'What we shipped instead', 'Where it went wrong in March'],
  },
  {
    no: 60,
    date: '2026-06-30',
    title: 'Our books, line by line',
    teaser: 'Revenue, payroll, tools, and the $1,140 a month we were paying for software nobody opened.',
    tags: ['Money', 'Operations'],
    minutes: 12,
    opening: 'Every June I open our books to readers. This year the most interesting line is not revenue. It is the column our accountant labels “other”.',
    contents: ['Revenue: $61k a month, up 18%', 'Payroll, including what the founders take', 'The subscriptions nobody remembered'],
  },
  {
    no: 59,
    date: '2026-05-26',
    title: 'Walking away from a $90k deal',
    teaser: 'A sixty-page security questionnaire, a single sign-on deadline, and why we said no on page eleven.',
    tags: ['Sales', 'Essays'],
    minutes: 8,
    opening: 'The email arrived on a Friday. A logistics company with four thousand employees wanted to roll us out to all of them, provided we shipped single sign-on by August.',
    contents: ['The questionnaire, page by page', 'What we offered instead', 'Their reply, six months later'],
  },
  {
    no: 58,
    date: '2026-04-28',
    title: 'The four-day week, two years in',
    teaser: 'Output, burnout, response times, and the Friday that keeps sneaking back onto the calendar.',
    tags: ['Operations', 'Hiring'],
    minutes: 9,
    opening: 'We started the four-day week as a three-month experiment. That was two years and one very long spreadsheet ago.',
    contents: ['What we measured, and what we stopped measuring', 'The Friday problem', 'Would I do it again?'],
  },
  {
    no: 57,
    date: '2026-03-31',
    title: 'Pricing pages worth stealing from',
    teaser: 'Six pricing pages I keep going back to, and the single idea I took from each one.',
    tags: ['Pricing', 'Product'],
    minutes: 6,
    opening: 'Every pricing page is a small argument about who the product is for. These six make the argument well, and not one of them needs a comparison table.',
    contents: ['One plan, explained in a paragraph', 'Prices that show their working', 'The best free tier I have seen'],
  },
  {
    no: 56,
    date: '2026-02-24',
    title: 'Firing a customer, politely',
    teaser: 'The script we use when an account costs more than it pays, and the three times we have used it.',
    tags: ['Customers', 'Support'],
    minutes: 7,
    opening: 'The hardest email in a small company is not the price increase. It is the one that says: we think you would be happier somewhere else.',
    contents: ['The signs, usually six months early', 'The script, with the edits', 'What happened to the three accounts'],
  },
  {
    no: 55,
    date: '2026-01-27',
    title: 'Year nine, in writing',
    teaser: 'What worked, what didn’t, and the pricing mistake I am least proud of. The annual letter.',
    tags: ['Essays', 'Money'],
    minutes: 14,
    opening: 'Nine years ago I started a company with a friend, a laptop each and a strong opinion about invoicing software. Two of those three things made it through the year.',
    contents: ['The numbers, without rounding', 'The mistake, and what it cost', 'Three things I want from year ten'],
  },
  {
    no: 54,
    date: '2025-12-30',
    title: 'Closing for two weeks',
    teaser: 'Every December we shut down completely. How we prepare customers, and what broke the one year we didn’t.',
    tags: ['Operations', 'Support'],
    minutes: 6,
    opening: 'From December 22nd to January 5th nobody here opens a laptop. Customers hear about it in November, again in December, and once more from an autoreply I rewrite every year.',
    contents: ['The November email', 'What keeps running while we are gone', '2023, the year we stayed open'],
  },
  {
    no: 53,
    date: '2025-11-25',
    title: 'Changelogs people actually read',
    teaser: 'We turned release notes into a short monthly email. Opens went from 18% to 61%.',
    tags: ['Product', 'Growth'],
    minutes: 8,
    opening: 'For four years our changelog was a page nobody visited. Then we started writing it as a letter to one specific customer, and people started replying to it.',
    contents: ['Writing to one customer', 'What we cut from every entry', 'The reply rate, month by month'],
  },
  {
    no: 52,
    date: '2025-10-28',
    title: 'Onboarding with five plain emails',
    teaser: 'We removed the product tour and sent five plain-text emails instead. Activation went up, tickets went down.',
    tags: ['Growth', 'Product'],
    minutes: 9,
    opening: 'Our product tour had fourteen steps and a progress bar. Eight out of ten new accounts closed it at step two.',
    contents: ['The five emails, in full', 'Why plain text beat the tour', 'What we still show inside the app'],
  },
  {
    no: 51,
    date: '2025-09-30',
    title: 'On being the boring choice',
    teaser: 'Why “reliable and slightly dull” is the best positioning a small software company can have.',
    tags: ['Essays', 'Growth'],
    minutes: 6,
    opening: 'A customer once described us as “the tool nobody on the team has to think about”. I have tried to write a better tagline ever since, and failed.',
    contents: ['Boring is a feature', 'Where we still take risks', 'Things we will never build'],
  },
]

/** 「全部」时先显示多少期，其余收在「再显示 N 期」后面。 */
const PAGE = 8
/** 年份按钮最多几个；更多的年份收进最后一格的下拉框，手机宽度下也放得下。 */
const YEAR_SEGMENTS = 3

const newsreader = "'Newsreader Variable', ui-serif, Georgia, serif"
// body：预览里「正文开头」用的字体。无衬线标题配 Newsreader 正文，读起来仍像一封信
const FONT: Record<string, { family: string; weight: number; tracking: string; body: string }> = {
  newsreader: { family: newsreader, weight: 500, tracking: '-0.012em', body: newsreader },
  fraunces: { family: "'Fraunces Variable', ui-serif, Georgia, serif", weight: 520, tracking: '-0.018em', body: "'Fraunces Variable', ui-serif, Georgia, serif" },
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em', body: newsreader },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.035em', body: newsreader },
}
const sans = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const mono = "'Geist Mono Variable', ui-monospace, monospace"

// ---- 颜色：任何主色都要可读 ----

type RGB = [number, number, number]
type Theme = 'dark' | 'light'

function parseHex(hex: string): RGB | null {
  const raw = hex.trim().replace(/^#/, '')
  const full = /^[0-9a-f]{3}$/i.test(raw) ? raw.replace(/./g, (c) => c + c) : raw
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const toHex = (c: RGB) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** 往白（暗色主题）或往黑（亮色主题）推，直到亮度越过 threshold，色相尽量保留。 */
function push(rgb: RGB, theme: Theme, threshold: number): string {
  const target = theme === 'dark' ? 255 : 0
  for (let t = 0; t <= 1.001; t += 0.04) {
    const c = rgb.map((v) => v + (target - v) * t) as RGB
    const l = luminance(c)
    if (theme === 'dark' ? l >= threshold : l <= threshold) return toHex(c)
  }
  return toHex([target, target, target])
}

// 主色当文字用：对背景约 5:1
const tone = (rgb: RGB, theme: Theme) => push(rgb, theme, theme === 'dark' ? 0.3 : 0.14)
// 主色当细线、圆点、浅色底用：至少和背景拉开一点亮度，否则（例如亮色主题配白色主色）选中态会消失
const mark = (rgb: RGB, theme: Theme) => push(rgb, theme, theme === 'dark' ? 0.08 : 0.45)
// 主色当按钮、刊头标记的实心填充：暗色主题下要和卡片拉开约 3:1，深色主色的按钮才不会沉进卡片里
const fill = (rgb: RGB, theme: Theme) => push(rgb, theme, theme === 'dark' ? 0.13 : 0.45)

const INK = '#111014'
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
/** 填充上的文字：深字和白字里对比度更高的那个（两者在亮度约 0.18 处打平）。 */
function inkOn(hex: string): string {
  const l = luminance(parseHex(hex) ?? [0, 0, 0])
  return contrast(l, luminance(parseHex(INK)!)) >= contrast(l, 1) ? INK : '#ffffff'
}

// ---- 断点：侧栏预览只在 lg 以上出现，以下改在行内展开 ----

const WIDE = '(min-width: 64rem)'
function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
/** 服务端渲染时未知（undefined），这时两种预览都渲染，交给 CSS 的 lg: 决定显示哪个。 */
function useWide(): boolean | undefined {
  return useSyncExternalStore<boolean | undefined>(subscribeWide, () => window.matchMedia(WIDE).matches, () => undefined)
}

// ---- 日期：ISO 字符串手动拆开，避免时区把日期推前一天 ----

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parts(iso: string) {
  const [y = 2026, m = 1, d = 1] = iso.split('-').map(Number)
  return { y, m, d, month: MONTHS[m - 1] ?? '', short: (MONTHS[m - 1] ?? '').slice(0, 3), weekday: DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? '' }
}
const fmtDate = (iso: string) => {
  const p = parts(iso)
  return `${p.short} ${p.d}, ${p.y}`
}
const fmtShort = (iso: string) => {
  const p = parts(iso)
  return `${p.short} ${String(p.d).padStart(2, '0')}`
}
const fmtDay = (iso: string) => {
  const p = parts(iso)
  return `${p.weekday}, ${p.short} ${p.d}`
}
const fmtMonth = (ym: string) => {
  if (!/^\d{4}-\d{2}/.test(ym)) return ym
  const p = parts(`${ym.slice(0, 7)}-01`)
  return `${p.month} ${p.y}`
}
const validDate = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso.trim())

/** 把搜索词在文本里标出来。 */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const out: ReactNode[] = []
  let from = 0
  for (let at = lower.indexOf(query); at >= 0; at = lower.indexOf(query, from)) {
    if (at > from) out.push(text.slice(from, at))
    out.push(
      <mark key={at} className="rounded-[3px] px-px" style={{ background: 'color-mix(in oklab, var(--acc-mark) 30%, transparent)', color: 'inherit' }}>
        {text.slice(at, at + query.length)}
      </mark>,
    )
    from = at + query.length
  }
  if (from < text.length) out.push(text.slice(from))
  return out
}

function matches(issue: Issue, query: string) {
  if (!query) return true
  return [issue.title, issue.teaser, issue.opening, ...issue.tags, ...issue.contents, `no. ${issue.no}`].some((field) => field.toLowerCase().includes(query))
}

/** 标签出现次数，多的在前，同数按字母。 */
function countTags(list: Issue[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const issue of list) for (const tag of issue.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return Array.from(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

/** 受控 / 非受控两用的状态。 */
function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = useState(initial)
  const current = value !== undefined ? value : inner
  const set = (next: T) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set]
}

// ---- 图标与小部件 ----

/** 虚构的刊头标记：一张带横线的账页。 */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="var(--acc-fill)" />
      <path d="M6.8 8.6h10.4M6.8 12h10.4M6.8 15.4h6.2" stroke="var(--acc-on)" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16.6" cy="15.4" r="1.25" fill="var(--acc-on)" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.75 12.75 3.75 3.75" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8h9.5M8.5 4l4 4-4 4" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4 6 4 4 4-4" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.4 3 3 6-6.8" />
    </svg>
  )
}

function RssIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3.5 7.5a5 5 0 0 1 5 5M3.5 3.5a9 9 0 0 1 9 9" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Tags({ tags, on, active }: { tags: string[]; on: boolean; active: string | null }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const lit = on || tag === active
        return (
          <span
            key={tag}
            className={cn('border px-2 py-[3px] text-[11px] leading-none font-medium transition-[background-color,border-color,color] duration-300', !lit && 'border-border text-muted-foreground')}
            style={{
              borderRadius: 'calc(var(--r) * 0.5)',
              ...(lit ? { color: 'var(--acc-ink)', borderColor: 'color-mix(in oklab, var(--acc-mark) 34%, transparent)', background: 'color-mix(in oklab, var(--acc-mark) 12%, transparent)' } : null),
            }}
          >
            {tag}
          </span>
        )
      })}
    </span>
  )
}

/** 选中那一期的开头与本期目录：侧栏和行内展开共用。 */
function PreviewBody({ issue, f, compact, clamp }: { issue: Issue; f: (typeof FONT)[string]; compact?: boolean; clamp?: boolean }) {
  return (
    <>
      <p
        className={cn(
          // flow-root：开头只有一行时，首字下沉的浮动也不会把下面的目录挤到旁边
          'flow-root text-pretty text-foreground/85 first-letter:float-left first-letter:mt-[0.06em] first-letter:mr-2 first-letter:text-[3.15em] first-letter:leading-[0.8] first-letter:text-[color:var(--acc-ink)]',
          compact ? 'text-[15px] leading-[1.6]' : 'text-[15.5px] leading-[1.62]',
        )}
        // 侧栏里只露出四行，末行淡出，提示正文还在继续
        style={{ fontFamily: f.body, fontWeight: 400, ...(clamp ? { maxHeight: '6.48em', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, #000 62%, transparent)' } : null) }}
      >
        {issue.opening}
      </p>
      <div className={compact ? 'mt-4' : 'mt-5'}>
        <p className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase" style={{ fontFamily: mono }}>
          In this issue
        </p>
        <ol className="mt-2 space-y-1.5">
          {issue.contents.map((line, i) => (
            <li key={line} className="flex gap-3 text-sm leading-snug">
              <span className="w-5 shrink-0 tabular-nums" style={{ fontFamily: mono, color: 'var(--acc-ink)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-foreground/85">{line}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}

/** 电子报往期目录：搜索 + 年份 + 话题筛选，选中一期在侧栏（或行内）预览，订阅框固定在列表旁。 */
export function NewsletterArchive({
  className,
  style,
  issues = ISSUES,
  description = 'A monthly letter on pricing, hiring and keeping a small software company calm.',
  author = 'Ines Calloway',
  since = '2021-07',
  nextIssueDate = '2026-11-24',
  cadence = 'One email a month, no tracking pixels.',
  readers = 6240,
  indexHref = '#index',
  rssHref = '#rss',
  selected: selectedProp,
  onSelectedChange,
  query: queryProp,
  onQueryChange,
  year: yearProp,
  onYearChange,
  tag: tagProp,
  onTagChange,
  onSubscribe,
  ...props
}: NewsletterArchiveProps) {
  const { accent, font, radius, layout, showPreview, showTags, name: nameProp, heading: headingProp } = { ...defaults, ...props }
  const uid = useId().replace(/:/g, '')
  const reduced = useReducedMotion() ?? false
  const wide = useWide()
  const f = FONT[font] ?? FONT.newsreader!
  const rgb = parseHex(accent) ?? parseHex(defaults.accent)!
  const name = nameProp.trim() || defaults.name
  const heading = headingProp.trim() || defaults.heading
  const r = Math.max(0, Math.min(20, radius))
  const fillLight = fill(rgb, 'light')
  const fillDark = fill(rgb, 'dark')

  // 不假设调用方按新到旧排好：一律按期号倒序
  const sorted = [...issues].sort((a, b) => b.no - a.no)
  const latest = sorted[0]
  const oldest = sorted.at(-1)?.no ?? 1

  const [selected, setSelected] = useControllable<number | null>(selectedProp, latest?.no ?? null, onSelectedChange)
  const [query, setQuery] = useControllable(queryProp, '', onQueryChange)
  const [year, setYear] = useControllable(yearProp, 'all', onYearChange)
  const [tag, setTag] = useControllable<string | null>(tagProp, null, onTagChange)
  const [showAll, setShowAll] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'invalid' | 'done'>('idle')

  const needle = query.trim().toLowerCase()
  const years = Array.from(new Set(sorted.map((issue) => issue.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a))
  const crowded = years.length > YEAR_SEGMENTS
  const segmentYears = crowded ? years.slice(0, YEAR_SEGMENTS - 1) : years
  const olderYears = crowded ? years.slice(YEAR_SEGMENTS - 1) : []
  const yearCount = (option: string) => (option === 'all' ? sorted.length : sorted.filter((issue) => issue.date.startsWith(option)).length)

  const inYear = sorted.filter((issue) => year === 'all' || issue.date.startsWith(year))
  const filtered = inYear.filter((issue) => (!tag || issue.tags.includes(tag)) && matches(issue, needle))
  const filtering = Boolean(needle) || year !== 'all' || Boolean(tag)
  const paged = !showAll && !filtering && filtered.length > PAGE + 1
  const visible = paged ? filtered.slice(0, PAGE) : filtered
  const inline = layout === 'inline'
  // 没有预览时，行就是指向这一期的链接，没有「选中」可言
  const selectable = showPreview
  // 侧栏版式里总得有一期被预览：选中的被筛掉时退到第一条；行内展开允许全部收起
  const current = selectable ? (visible.find((issue) => issue.no === selected) ?? (inline ? undefined : visible[0])) : undefined
  // 话题按当前年份计数，点下去的结果和数字一致
  // 顺序固定（不把选中的挪到最前），点下去指针下的按钮不会跳走；选中的话题在这一年没有时补在末尾，仍可取消
  const topics = countTags(inYear)
  const topicChips: [string, number][] = tag && !topics.some(([t]) => t === tag) ? [...topics, [tag, 0]] : topics
  const suggestions = countTags(sorted)
    .map(([t]) => t)
    .filter((t) => t !== tag)
    .slice(0, 3)

  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease },
  })
  const slide = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.38, bounce: 0.12 }
  const titleStyle: CSSProperties = { fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking }

  const plural = (n: number) => (n === 0 ? 'No issues' : `${n} ${n === 1 ? 'issue' : 'issues'}`)
  const scope = [needle && `for “${query.trim()}”`, year !== 'all' && `from ${year}`].filter(Boolean).join(' ')
  const summary = tag
    ? `${plural(filtered.length)} tagged`
    : filtering
      ? `${plural(filtered.length)} ${scope}`
      : paged
        ? `Latest ${PAGE} of ${plural(filtered.length)}, newest first`
        : `${filtered.length === 1 ? 'One issue' : `All ${plural(filtered.length)}`}, newest first`

  const hrefOf = (issue: Issue) => issue.href ?? `#issue-${issue.no}`
  const firstName = author.trim().split(/\s+/)[0] ?? ''
  const byline = [author.trim() && `Written by ${author.trim()}`, since.trim() && `since ${fmtMonth(since.trim())}`].filter(Boolean).join(' ')
  const tally = latest ? `${plural(latest.no)} so far` : ''
  const tail = [byline, tally].filter(Boolean).join(', ')
  const deck = [description.trim(), tail && `${tail.charAt(0).toUpperCase()}${tail.slice(1)}.`].filter(Boolean).join(' ')
  const nextNo = (latest?.no ?? 0) + 1
  const nextDate = validDate(nextIssueDate) ? fmtDay(nextIssueDate.trim()) : ''

  const pick = (no: number) => setSelected(inline && current?.no === no ? null : no)
  const clearFilters = () => {
    setQuery('')
    setYear('all')
    setTag(null)
  }
  const chooseTag = (next: string | null) => {
    setTag(next)
    setShowAll(false)
  }

  const onListKey = (event: KeyboardEvent<HTMLElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-row]'))
    const at = rows.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : Math.max(0, Math.min(rows.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)))
    const row = rows[next]
    if (!row) return
    row.focus()
    if (selectable && !inline) setSelected(Number(row.dataset.row))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus('invalid')
      return
    }
    setStatus('done')
    onSubscribe?.(email.trim())
  }

  const previewId = `${uid}-preview`
  const inlineId = (no: number) => `${uid}-inline-${no}`
  // 行内展开：行内版式任何宽度都用；另两种版式只在 lg 以下（侧栏预览不在时）
  const inlinePreviews = selectable && (inline || wide !== true)
  const sidePreview = selectable && !inline && wide !== false
  // 高亮框只在各行高度不变时（侧栏预览）共享 layoutId 滑动；行内展开时旧行收起、新行展开，滑动的框会盖住邻行，改为各行自己淡入淡出
  const sharedHighlight = !inline && wide === true
  // 目录表每行是独立的 grid，列宽必须固定，各行才能对齐
  const ledgerCols = showTags ? 'sm:grid-cols-[3.5rem_4.5rem_minmax(0,1fr)_8.5rem_3rem]' : 'sm:grid-cols-[3.5rem_4.5rem_minmax(0,1fr)_3rem]'
  const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc-ring)]'

  const inlinePreview = (issue: Issue, open: boolean) =>
    inlinePreviews && (
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            id={inlineId(issue.no)}
            className={cn('relative z-[1] overflow-hidden', !inline && 'lg:hidden')}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.36, ease }}
          >
            <div className={cn('pb-5', layout === 'ledger' ? 'pr-4 pl-[4.5rem] sm:pl-[11rem]' : 'px-4 sm:px-5')}>
              <div className="border-t border-dashed pt-4" style={{ borderColor: 'color-mix(in oklab, var(--acc-mark) 30%, var(--border))' }}>
                <PreviewBody issue={issue} f={f} compact />
                <a href={hrefOf(issue)} className={cn('mt-4 inline-flex items-center gap-1.5 text-sm font-medium', focusRing)} style={{ color: 'var(--acc-ink)', borderRadius: 4 }}>
                  Read No. {issue.no}
                  <ArrowIcon className="size-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )

  const highlightBox = (on: boolean) => {
    if (!selectable) return null
    const ledger = layout === 'ledger'
    const box = {
      'aria-hidden': true,
      // z-0：始终画在行内容（z-[1]）下面，滑过邻行时也不会盖住它的文字
      className: cn('pointer-events-none absolute inset-0 z-0', ledger ? '' : 'border shadow-[0_10px_30px_-18px_rgb(0_0_0/0.55)]'),
      style: {
        borderRadius: ledger ? 'calc(var(--r) * 0.5)' : 'calc(var(--r) * 0.9)',
        borderColor: 'color-mix(in oklab, var(--acc-mark) 30%, var(--border))',
        background: ledger ? 'color-mix(in oklab, var(--acc-mark) 9%, transparent)' : 'color-mix(in oklab, var(--acc-mark) 6%, var(--card))',
      },
    }
    const bar = <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full" style={{ background: 'var(--acc-mark)' }} />
    if (sharedHighlight)
      return (
        on && (
          <motion.span layoutId={`${uid}-sel`} {...box} transition={slide}>
            {bar}
          </motion.span>
        )
      )
    return (
      <AnimatePresence initial={false}>
        {on && (
          <motion.span key="sel" {...box} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.26, ease }}>
            {bar}
          </motion.span>
        )}
      </AnimatePresence>
    )
  }

  /** 只引用此刻真的渲染出来的元素。 */
  const controlsOf = (issue: Issue, open: boolean) => {
    if (inline || wide === false) return open ? inlineId(issue.no) : undefined
    return wide === true ? previewId : undefined
  }

  /** 有预览时每行是选择按钮；没有预览时直接是这一期的链接。 */
  const row = (issue: Issue, open: boolean, className: string, rowRadius: string, children: ReactNode) =>
    selectable ? (
      <button
        type="button"
        data-row={issue.no}
        onClick={() => pick(issue.no)}
        aria-current={!inline && open ? 'true' : undefined}
        aria-expanded={inline ? open : undefined}
        aria-controls={controlsOf(issue, open)}
        className={className}
        style={{ borderRadius: rowRadius }}
      >
        {children}
      </button>
    ) : (
      <a href={hrefOf(issue)} data-row={issue.no} className={className} style={{ borderRadius: rowRadius }}>
        {children}
      </a>
    )

  const list =
    visible.length === 0 ? (
      <div className="mt-2 border border-dashed px-6 py-12 text-center" style={{ borderRadius: 'var(--r)' }}>
        <SearchIcon className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-[15px] font-medium text-balance">
          {needle ? (tag || year !== 'all' ? `No issues${tag ? ` tagged ${tag}` : ''}${year !== 'all' ? ` from ${year}` : ''} mention “${query.trim()}”` : `Nothing in the archive matches “${query.trim()}”`) : `No issues${tag ? ` tagged ${tag}` : ''} from ${year}`}
        </p>
        {suggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <span className="mr-1">Try a topic:</span>
            {suggestions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setQuery('')
                  setYear('all')
                  chooseTag(t)
                }}
                className={cn('h-7 border px-2.5 text-[13px] transition-[background-color,color] hover:bg-muted/50 hover:text-foreground', focusRing)}
                style={{ borderRadius: 'calc(var(--r) * 0.6)' }}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Try a shorter word, or an issue number.</p>
        )}
        <button type="button" onClick={clearFilters} className={cn('mt-5 border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted/60', focusRing)} style={{ borderRadius: 'calc(var(--r) * 0.7)' }}>
          Clear filters
        </button>
      </div>
    ) : layout === 'ledger' ? (
      <div>
        <div className={cn('hidden gap-x-4 border-b px-4 pb-2.5 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase sm:grid', ledgerCols)} style={{ fontFamily: mono }} aria-hidden>
          <span>No.</span>
          <span>Date</span>
          <span>Issue</span>
          {showTags && <span>Topics</span>}
          <span className="text-right">Read</span>
        </div>
        <ul className="isolate divide-y" onKeyDown={onListKey} aria-label={`${name} issues`}>
          {visible.map((issue, i) => {
            const on = current?.no === issue.no
            return (
              <motion.li key={issue.no} {...enter(0.12 + Math.min(i, 8) * 0.04)} className="relative">
                {highlightBox(on)}
                {row(
                  issue,
                  on,
                  cn('group relative z-[1] grid w-full grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5 text-left transition-colors sm:gap-x-4', ledgerCols, !on && 'hover:bg-muted/40', focusRing),
                  'calc(var(--r) * 0.5)',
                  <>
                    <span className={cn('text-sm tabular-nums transition-colors', !on && 'text-muted-foreground')} style={{ fontFamily: mono, color: on ? 'var(--acc-ink)' : undefined }}>
                      {String(issue.no).padStart(3, '0')}
                    </span>
                    <time dateTime={issue.date} className="hidden text-[13px] text-muted-foreground tabular-nums sm:block" style={{ fontFamily: mono }}>
                      {fmtShort(issue.date)}
                    </time>
                    <span className="min-w-0">
                      {/* 标题是这一行的主体：手机上换行，sm 起才截断；导语一直只占一行 */}
                      <span className="block text-[17px] leading-snug text-pretty sm:truncate" style={titleStyle}>
                        {highlight(issue.title, needle)}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{highlight(issue.teaser, needle)}</span>
                      <span className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground sm:hidden" style={{ fontFamily: mono }}>
                        <time dateTime={issue.date}>{fmtDate(issue.date)}</time>
                        <span aria-hidden>·</span>
                        <span>{issue.minutes} min</span>
                      </span>
                    </span>
                    {showTags && (
                      <span className={cn('hidden truncate self-center text-xs transition-colors sm:block', !on && 'text-muted-foreground')} style={{ color: on ? 'var(--acc-ink)' : undefined }}>
                        {issue.tags.join(' · ')}
                      </span>
                    )}
                    <span className="hidden text-right text-[13px] text-muted-foreground tabular-nums sm:block" style={{ fontFamily: mono }}>
                      {issue.minutes}m
                    </span>
                  </>,
                )}
                {inlinePreview(issue, on)}
              </motion.li>
            )
          })}
        </ul>
      </div>
    ) : (
      <ul className="isolate space-y-1" onKeyDown={onListKey} aria-label={`${name} issues`}>
        {visible.map((issue, i) => {
          const on = current?.no === issue.no
          return (
            <motion.li key={issue.no} {...enter(0.12 + Math.min(i, 8) * 0.045)} className="relative">
              {highlightBox(on)}
              {row(
                issue,
                on,
                cn('group relative z-[1] block w-full px-4 py-4 text-left transition-colors sm:px-5', !on && 'hover:bg-muted/40', focusRing),
                'calc(var(--r) * 0.9)',
                <>
                  <span className="flex items-center gap-2.5 text-xs text-muted-foreground tabular-nums" style={{ fontFamily: mono }}>
                    <span className="font-medium transition-colors" style={{ color: on ? 'var(--acc-ink)' : undefined }}>
                      No. {issue.no}
                    </span>
                    <span aria-hidden className="opacity-50">
                      /
                    </span>
                    <time dateTime={issue.date}>{fmtDate(issue.date)}</time>
                    <span className="ml-auto flex items-center gap-2">
                      {issue.minutes} min
                      {inline && selectable && <ChevronIcon className={cn('size-3.5 transition-transform duration-300 motion-reduce:transition-none', on && 'rotate-180')} />}
                      {!selectable && <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />}
                    </span>
                  </span>
                  <span className={cn('mt-2 block text-balance text-[1.3rem] leading-[1.2] transition-colors sm:text-[1.4rem]', !on && 'text-foreground/90 group-hover:text-foreground')} style={titleStyle}>
                    {highlight(issue.title, needle)}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{highlight(issue.teaser, needle)}</span>
                  {showTags && (
                    <span className="mt-3 block">
                      <Tags tags={issue.tags} on={on} active={tag} />
                    </span>
                  )}
                </>,
              )}
              {inlinePreview(issue, on)}
            </motion.li>
          )
        })}
      </ul>
    )

  const subscribe = (
    <div
      className="relative overflow-hidden border p-5 sm:p-6"
      style={{ borderRadius: 'var(--r)', background: 'radial-gradient(120% 90% at 100% 0%, color-mix(in oklab, var(--acc-mark) 15%, transparent), transparent 62%), var(--card)' }}
    >
      <p className="flex items-center gap-2 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase" style={{ fontFamily: mono }}>
        <span className="size-1.5 rounded-full" style={{ background: 'var(--acc-mark)' }} />
        Subscribe · free
      </p>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <motion.div key="done" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: 0.25, ease }} role="status">
            <div className="mt-4 flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ background: 'var(--acc-fill)', color: 'var(--acc-on)' }}>
                <CheckIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-medium">Check your inbox</p>
                <p className="mt-1 text-sm leading-relaxed break-words text-muted-foreground">
                  We sent a confirmation link to <span className="text-foreground">{email.trim()}</span>.{nextDate && ` No. ${nextNo} arrives ${nextDate}.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setEmail('')
              }}
              className={cn('mt-4 text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground', focusRing)}
            >
              Use a different address
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -4 }} transition={{ duration: 0.25, ease }}>
            <h3 className="mt-3.5 text-[1.4rem] leading-tight" style={titleStyle}>
              Get the next letter
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {nextDate ? `No. ${nextNo} lands ${nextDate}.` : `No. ${nextNo} is in the works.`} {cadence.trim()}
            </p>
            <form className="mt-4 flex gap-2" onSubmit={submit} noValidate>
              <label htmlFor={`${uid}-email`} className="sr-only">
                Email address
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (status === 'invalid') setStatus('idle')
                }}
                aria-invalid={status === 'invalid'}
                aria-describedby={status === 'invalid' ? `${uid}-email-error` : undefined}
                className={cn('h-10 min-w-0 flex-1 border bg-background/70 px-3 text-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/70', focusRing, status === 'invalid' && 'border-destructive')}
                style={{ borderRadius: 'calc(var(--r) * 0.7)' }}
              />
              <button
                type="submit"
                className={cn('h-10 shrink-0 px-4 text-sm font-semibold transition-[filter,transform] hover:brightness-110 active:scale-[0.98] motion-reduce:active:scale-100', focusRing, 'focus-visible:ring-offset-2 focus-visible:ring-offset-card')}
                style={{ borderRadius: 'calc(var(--r) * 0.7)', background: 'var(--acc-fill)', color: 'var(--acc-on)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)' }}
              >
                Subscribe
              </button>
            </form>
            {status === 'invalid' && (
              <p id={`${uid}-email-error`} role="alert" className="mt-2 text-xs text-destructive">
                That doesn’t look like an email address.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {(readers > 0 || rssHref) && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
          <span>{readers > 0 && `${Math.round(readers).toLocaleString('en-US')} ${readers === 1 ? 'reader' : 'readers'}`}</span>
          {rssHref && (
            <a href={rssHref} className={cn('inline-flex shrink-0 items-center gap-1 transition-colors hover:text-foreground', focusRing)} style={{ borderRadius: 4 }}>
              <RssIcon className="size-3.5" />
              RSS
            </a>
          )}
        </div>
      )}
    </div>
  )

  const preview = sidePreview && current && (
    <div id={previewId} role="region" aria-label="Issue preview" className="hidden border bg-card p-5 sm:p-6 lg:block" style={{ borderRadius: 'var(--r)' }}>
      <div className="flex items-center justify-between gap-3 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase" style={{ fontFamily: mono }}>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full" style={{ background: 'var(--acc-mark)' }} />
          Preview
        </span>
        <span>{current.minutes} min read</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.no}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6, transition: { duration: 0.14 } }}
          transition={{ duration: 0.3, ease }}
        >
          <h3 className="mt-3.5 text-balance text-[1.55rem] leading-[1.15]" style={titleStyle}>
            {current.title}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground" style={{ fontFamily: mono }}>
            No. {current.no} · {parts(current.date).weekday}, {fmtDate(current.date)}
          </p>
          <div className="mt-4">
            <PreviewBody issue={current} f={f} clamp />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <a
              href={hrefOf(current)}
              className={cn('group inline-flex h-9 shrink-0 items-center gap-1.5 border px-3.5 text-sm font-medium whitespace-nowrap transition-[background-color,border-color]', focusRing)}
              style={{ borderRadius: 'calc(var(--r) * 0.7)', color: 'var(--acc-ink)', borderColor: 'color-mix(in oklab, var(--acc-mark) 40%, var(--border))', background: 'color-mix(in oklab, var(--acc-mark) 8%, transparent)' }}
            >
              Read the letter
              <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </a>
            {firstName && <span className="truncate text-xs text-muted-foreground">or reply to {firstName}</span>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )

  const yearHighlight = (
    <motion.span
      layoutId={`${uid}-year`}
      aria-hidden
      className="absolute inset-0 border"
      style={{ borderRadius: 'calc(var(--r) * 0.45)', background: 'color-mix(in oklab, var(--acc-mark) 14%, var(--card))', borderColor: 'color-mix(in oklab, var(--acc-mark) 30%, transparent)' }}
      transition={slide}
    />
  )
  const olderOn = olderYears.includes(year)

  return (
    <section
      aria-labelledby={`${uid}-h`}
      className={cn(
        'relative w-full text-foreground',
        '[--acc-ink:var(--acc-l)] [--acc-mark:var(--acc-ml)] [--acc-fill:var(--acc-fl)] [--acc-on:var(--acc-ol)]',
        'dark:[--acc-ink:var(--acc-d)] dark:[--acc-mark:var(--acc-md)] dark:[--acc-fill:var(--acc-fd)] dark:[--acc-on:var(--acc-od)]',
        className,
      )}
      style={{
        ['--acc-d' as string]: tone(rgb, 'dark'),
        ['--acc-l' as string]: tone(rgb, 'light'),
        ['--acc-md' as string]: mark(rgb, 'dark'),
        ['--acc-ml' as string]: mark(rgb, 'light'),
        ['--acc-fd' as string]: fillDark,
        ['--acc-fl' as string]: fillLight,
        ['--acc-od' as string]: inkOn(fillDark),
        ['--acc-ol' as string]: inkOn(fillLight),
        ['--acc-ring' as string]: 'color-mix(in oklab, var(--acc-mark) 65%, transparent)',
        ['--r' as string]: `${r}px`,
        fontFamily: sans,
        ...style,
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]" style={{ background: 'radial-gradient(48rem 22rem at 12% 0%, color-mix(in oklab, var(--acc-mark) 9%, transparent), transparent 70%)' }} />
      <div className="relative mx-auto grid max-w-6xl gap-x-10 gap-y-10 px-4 py-12 sm:px-8 sm:py-16 lg:pt-12 lg:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-x-14">
        <div className="min-w-0">
          <motion.header {...enter(0)}>
            <p className="flex items-center gap-2.5 text-sm">
              <Mark className="size-6 shrink-0" />
              <span className="font-semibold">{name}</span>
              <span className="text-muted-foreground">/ Archive</span>
            </p>
            <h2 id={`${uid}-h`} className="mt-6 max-w-2xl text-balance text-[2.4rem] leading-[1.02] sm:text-5xl lg:text-[3.3rem]" style={titleStyle}>
              {heading}
            </h2>
            {deck && <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">{deck}</p>}
          </motion.header>

          <motion.div {...enter(0.06)} className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && query) {
                    event.preventDefault()
                    setQuery('')
                  }
                }}
                placeholder="Search titles, topics and contents"
                aria-label={`Search the ${name} archive`}
                className={cn('h-11 w-full border bg-card/70 pr-10 pl-10 text-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 [&::-webkit-search-cancel-button]:appearance-none', focusRing)}
                style={{ borderRadius: 'calc(var(--r) * 0.7)' }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className={cn('absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-foreground', focusRing)}
                  style={{ borderRadius: 'calc(var(--r) * 0.5)' }}
                >
                  <CloseIcon className="size-3.5" />
                </button>
              )}
            </div>
            {/* 最多「全部 + 两三个年份」，更早的收进最后一格的下拉框：几年的存档在 360px 下也放得下 */}
            <div role="group" aria-label="Filter by year" className="flex h-11 min-w-0 shrink-0 gap-1 border bg-card/70 p-1" style={{ borderRadius: 'calc(var(--r) * 0.7)' }}>
              {['all', ...segmentYears].map((option) => {
                const on = year === option
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setYear(option)
                      setShowAll(false)
                    }}
                    className={cn('relative flex flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none', on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground', focusRing)}
                    style={{ borderRadius: 'calc(var(--r) * 0.45)' }}
                  >
                    {on && yearHighlight}
                    <span className="relative">{option === 'all' ? 'All' : option}</span>
                    <span className="relative text-[11px] tabular-nums opacity-60" style={{ fontFamily: mono }}>
                      {yearCount(option)}
                    </span>
                  </button>
                )
              })}
              {olderYears.length > 0 && (
                // 不参与 flex-1 均分：宽度取「Older」和年份里最宽的那个，手机上也不会被挤成「Old…」
                <div className={cn('relative flex shrink-0 items-center', olderOn ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {olderOn && yearHighlight}
                  <select
                    value={olderOn ? year : ''}
                    onChange={(event) => {
                      if (!event.target.value) return
                      setYear(event.target.value)
                      setShowAll(false)
                    }}
                    aria-label="Earlier years"
                    className={cn('relative h-full cursor-pointer appearance-none bg-transparent pr-7 pl-3 text-sm font-medium transition-colors', focusRing)}
                    style={{ borderRadius: 'calc(var(--r) * 0.45)' }}
                  >
                    <option value="" disabled className="bg-card text-muted-foreground">
                      Older
                    </option>
                    {olderYears.map((option) => (
                      <option key={option} value={option} className="bg-card text-foreground">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronIcon className="pointer-events-none absolute right-2.5 size-3.5 opacity-70" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div {...enter(0.1)} className="mt-6 mb-3 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground" style={{ fontFamily: mono }}>
            <p aria-live="polite">
              {summary}
              {tag && <span className="sr-only"> {`${tag}${scope ? ` ${scope}` : ''}`}</span>}
            </p>
            {tag && (
              <>
                <button
                  type="button"
                  onClick={() => chooseTag(null)}
                  aria-label={`Remove topic filter ${tag}`}
                  className={cn('inline-flex h-6 items-center gap-1 border px-2 text-xs transition-[background-color,border-color]', focusRing)}
                  style={{ borderRadius: 'calc(var(--r) * 0.5)', color: 'var(--acc-ink)', borderColor: 'color-mix(in oklab, var(--acc-mark) 40%, transparent)', background: 'color-mix(in oklab, var(--acc-mark) 12%, transparent)' }}
                >
                  {tag}
                  <CloseIcon className="size-3" />
                </button>
                {scope && <span aria-hidden>{scope}</span>}
              </>
            )}
          </motion.div>

          {list}

          {paged && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={cn('mt-4 flex w-full items-center justify-center gap-2 border border-dashed py-3 text-sm font-medium text-muted-foreground transition-[color,border-color,background-color] hover:bg-muted/30 hover:text-foreground', focusRing)}
              style={{ borderRadius: 'calc(var(--r) * 0.9)' }}
            >
              Show {filtered.length - PAGE} older issues
            </button>
          )}
          {!paged && !filtering && oldest > 1 && indexHref && (
            <p className="mt-5 px-1 text-sm text-muted-foreground">
              Looking further back? Issues No. 1–{oldest - 1} are in the{' '}
              <a href={indexHref} className={cn('text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-current', focusRing)} style={{ borderRadius: 2 }}>
                full index
              </a>
              .
            </p>
          )}
        </div>

        <motion.aside {...enter(0.14)} className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          {subscribe}
          {preview}
          {showTags && (inline || !showPreview) && topicChips.length > 0 && (
            <div className="border p-5 sm:p-6" style={{ borderRadius: 'var(--r)' }}>
              <p className="flex items-center gap-2 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase" style={{ fontFamily: mono }}>
                <span className="size-1.5 rounded-full" style={{ background: 'var(--acc-mark)' }} />
                Browse by topic{year !== 'all' && ` · ${year}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter by topic">
                {topicChips.map(([t, count]) => {
                  const on = tag === t
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => chooseTag(on ? null : t)}
                      className={cn('inline-flex h-8 items-center gap-1.5 border px-2.5 text-[13px] transition-[background-color,border-color,color]', !on && 'text-muted-foreground hover:bg-muted/50 hover:text-foreground', focusRing)}
                      style={{
                        borderRadius: 'calc(var(--r) * 0.6)',
                        ...(on ? { color: 'var(--acc-ink)', borderColor: 'color-mix(in oklab, var(--acc-mark) 40%, transparent)', background: 'color-mix(in oklab, var(--acc-mark) 12%, transparent)' } : null),
                      }}
                    >
                      {t}
                      <span className="text-[11px] tabular-nums opacity-60" style={{ fontFamily: mono }}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </motion.aside>
      </div>
    </section>
  )
}
